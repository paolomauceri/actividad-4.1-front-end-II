import { useCallback, useEffect, useRef, useState } from 'react';
import { guardarResultado } from '../api/resultados.js';
import { descartar as descartarDeCola, encolar, listarCola, sincronizar as sincronizarCola } from '../offline/colaResultados.js';

/** Cuerpo del PUT a partir de un ítem (sin los datos que solo usa la cola). */
function cuerpo({ estado, tiempoMs, observaciones }) {
  const datos = { estado };
  if (estado === 'FINALIZADO') datos.tiempoMs = tiempoMs;
  if (observaciones) datos.observaciones = observaciones;
  return datos;
}

const enviar = (item) => guardarResultado(item.inscripcionId, cuerpo(item));

/**
 * Guardado de resultados del juez que sobrevive a la falta de conexión.
 * `guardar` intenta enviar; si no hay red, lo deja en la cola (IndexedDB).
 * La cola se envía sola al montar, al volver la conexión y al volver a la pestaña.
 *
 * @param {{ alEnviar?: (r: { enviados: number }) => void }} [opciones] aviso cuando se enviaron tiempos de la cola
 */
export function useColaResultados({ alEnviar } = {}) {
  const [items, setItems] = useState([]);
  const [requiereLogin, setRequiereLogin] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const alEnviarRef = useRef(alEnviar);
  alEnviarRef.current = alEnviar;
  const montado = useRef(true);

  const refrescar = useCallback(async () => {
    const lista = await listarCola();
    if (montado.current) setItems(lista);
  }, []);

  const sincronizar = useCallback(async () => {
    if (montado.current) setSincronizando(true);
    try {
      const r = await sincronizarCola(enviar);
      if (montado.current) setRequiereLogin(r.requiereLogin);
      if (r.enviados > 0) alEnviarRef.current?.(r);
      return r;
    } finally {
      await refrescar();
      if (montado.current) setSincronizando(false);
    }
  }, [refrescar]);

  useEffect(() => {
    montado.current = true;
    sincronizar();
    const alVolverLaRed = () => sincronizar();
    const alMostrarse = () => {
      if (document.visibilityState === 'visible') sincronizar();
    };
    window.addEventListener('online', alVolverLaRed);
    document.addEventListener('visibilitychange', alMostrarse);
    return () => {
      montado.current = false;
      window.removeEventListener('online', alVolverLaRed);
      document.removeEventListener('visibilitychange', alMostrarse);
    };
  }, [sincronizar]);

  /**
   * Envía el resultado; sin red lo encola. Otros errores (409, 400…) se lanzan.
   * @returns {Promise<{ enviado: boolean }>}
   */
  const guardar = useCallback(
    async (item) => {
      try {
        await enviar(item);
        // Si quedaba un tiempo viejo de esta inscripción en la cola, ya no sirve
        await descartarDeCola(item.inscripcionId);
        await refrescar();
        return { enviado: true };
      } catch (err) {
        if (err?.code !== 'NETWORK_ERROR') throw err;
        await encolar(item);
        await refrescar();
        return { enviado: false };
      }
    },
    [refrescar],
  );

  const descartar = useCallback(
    async (inscripcionId) => {
      await descartarDeCola(inscripcionId);
      await refrescar();
    },
    [refrescar],
  );

  return {
    items,
    pendientes: items.filter((i) => i.estadoCola === 'PENDIENTE'),
    rechazados: items.filter((i) => i.estadoCola === 'RECHAZADO'),
    requiereLogin,
    sincronizando,
    guardar,
    sincronizar,
    descartar,
  };
}
