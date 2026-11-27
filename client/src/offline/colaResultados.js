// Cola de resultados guardados sin conexión (IndexedDB). Nada se borra sin
// confirmación del servidor o sin que el juez lo descarte a mano.
import { get, update } from 'idb-keyval';

export const CLAVE_COLA = 'podio.cola-resultados';

// Estos rechazos no se arreglan reintentando: el juez debe corregir o descartar
const RECHAZOS_DEFINITIVOS = new Set([400, 403, 404, 409]);

/**
 * @typedef {{ inscripcionId: number, pruebaId: number, dorsal: number, atleta: string,
 *   estado: 'FINALIZADO'|'DNF'|'DNS'|'DSQ', tiempoMs?: number, observaciones?: string,
 *   encoladoEn: string, estadoCola: 'PENDIENTE'|'RECHAZADO', motivo?: string }} ItemCola
 */

/** Ítems en el orden en que se guardaron. @returns {Promise<ItemCola[]>} */
export async function listarCola() {
  return (await get(CLAVE_COLA)) ?? [];
}

/** Agrega un resultado pendiente; si ya había uno de esa inscripción, gana el último. */
export async function encolar(item) {
  const nuevo = { ...item, encoladoEn: new Date().toISOString(), estadoCola: 'PENDIENTE' };
  delete nuevo.motivo;
  await update(CLAVE_COLA, (lista = []) => [...lista.filter((i) => i.inscripcionId !== item.inscripcionId), nuevo]);
}

/** Quita de la cola el resultado de esa inscripción. */
export async function descartar(inscripcionId) {
  await update(CLAVE_COLA, (lista = []) => lista.filter((i) => i.inscripcionId !== inscripcionId));
}

async function marcarRechazado(inscripcionId, motivo) {
  await update(CLAVE_COLA, (lista = []) =>
    lista.map((i) => (i.inscripcionId === inscripcionId ? { ...i, estadoCola: 'RECHAZADO', motivo } : i)),
  );
}

/** Quita el ítem solo si no fue reemplazado mientras se enviaba. */
async function quitarEnviado(item) {
  await update(CLAVE_COLA, (lista = []) =>
    lista.filter((i) => !(i.inscripcionId === item.inscripcionId && i.encoladoEn === item.encoladoEn)),
  );
}

async function resumen(enviados, requiereLogin) {
  const lista = await listarCola();
  return {
    enviados,
    rechazados: lista.filter((i) => i.estadoCola === 'RECHAZADO').length,
    pendientes: lista.filter((i) => i.estadoCola === 'PENDIENTE').length,
    requiereLogin,
  };
}

async function ejecutar(enviar) {
  let enviados = 0;
  for (const copia of await listarCola()) {
    // Se vuelve a leer antes de cada envío: mientras se enviaba otro, el juez pudo
    // reemplazar o guardar directo este tiempo, y la copia vieja no debe pisarlo.
    const item = (await listarCola()).find(
      (i) => i.inscripcionId === copia.inscripcionId && i.encoladoEn === copia.encoladoEn,
    );
    if (!item || item.estadoCola !== 'PENDIENTE') continue;
    try {
      await enviar(item);
      await quitarEnviado(item);
      enviados += 1;
    } catch (err) {
      // Sesión vencida: se conserva todo y se pide iniciar sesión
      if (err?.status === 401) return resumen(enviados, true);
      if (RECHAZOS_DEFINITIVOS.has(err?.status)) {
        await marcarRechazado(item.inscripcionId, err.message);
        continue;
      }
      // Sin red o servidor caído: se reintenta más tarde
      return resumen(enviados, false);
    }
  }
  return resumen(enviados, false);
}

let enCurso = null;

/**
 * Envía los pendientes en orden con `enviar(item)`.
 * - éxito → se quita · 401 → queda y `requiereLogin` · 400/403/404/409 → RECHAZADO con motivo
 * - sin red u otro error → queda PENDIENTE y se detiene.
 * Si ya hay una sincronización en curso, devuelve esa misma (no envía dos veces).
 * @returns {Promise<{ enviados: number, rechazados: number, pendientes: number, requiereLogin: boolean }>}
 */
export function sincronizar(enviar) {
  if (!enCurso) {
    enCurso = ejecutar(enviar).finally(() => {
      enCurso = null;
    });
  }
  return enCurso;
}

/** Espera a que termine la sincronización en curso (si hay una). Nunca falla. */
export function esperarSincronizacion() {
  return enCurso ? enCurso.then(
    () => undefined,
    () => undefined,
  ) : Promise.resolve();
}
