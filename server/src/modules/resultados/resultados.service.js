// Reglas para registrar, corregir y borrar resultados (y avisar en tiempo real).
import { HttpError } from '../../utils/http-error.js';
import { emitirResultados } from '../../realtime.js';
import {
  deleteResultado,
  findContextoInscripcion,
  findResultado,
  upsertResultado,
} from './resultados.repository.js';

const NO_EXISTE = 'La inscripción no existe';

/**
 * Lanza 409 RESULTADO_NO_PERMITIDO si la inscripción no admite resultados:
 * inscripción ANULADA, prueba CANCELADA o torneo que no está EN_CURSO
 * (el ADMIN también puede corregir con el torneo FINALIZADO).
 */
function comprobarPermitido(ctx, rol) {
  let motivo = null;
  if (ctx.estado === 'ANULADA') motivo = 'La inscripción está anulada.';
  else if (ctx.pruebaEstado === 'CANCELADA') motivo = 'La prueba está cancelada.';
  else if (ctx.torneoEstado === 'FINALIZADO' && rol !== 'ADMIN') {
    motivo = 'El torneo ya finalizó: solo un administrador puede corregir resultados.';
  } else if (ctx.torneoEstado !== 'EN_CURSO' && ctx.torneoEstado !== 'FINALIZADO') {
    motivo = 'Los tiempos se registran solo cuando el torneo está en curso.';
  }
  if (motivo) throw new HttpError(409, 'RESULTADO_NO_PERMITIDO', motivo);
}

async function contexto(inscripcionId) {
  const ctx = await findContextoInscripcion(inscripcionId);
  if (!ctx) throw new HttpError(404, 'NOT_FOUND', NO_EXISTE);
  return ctx;
}

/** Avisa a los espectadores sin que un fallo del aviso afecte la respuesta. */
function avisar(pruebaId) {
  emitirResultados(pruebaId).catch((err) => console.error('[realtime]', err));
}

/** Crea o corrige el resultado de una inscripción y lo devuelve. */
export async function guardarResultado({ inscripcionId, datos, usuario }) {
  const ctx = await contexto(inscripcionId);
  comprobarPermitido(ctx, usuario.rol);
  await upsertResultado(inscripcionId, datos, usuario.id);
  avisar(ctx.pruebaId);
  return findResultado(inscripcionId);
}

/** Borra el resultado de una inscripción (404 si no tenía). */
export async function borrarResultado({ inscripcionId, usuario }) {
  const ctx = await contexto(inscripcionId);
  comprobarPermitido(ctx, usuario.rol);
  if (!ctx.tieneResultado) throw new HttpError(404, 'NOT_FOUND', 'La inscripción no tiene resultado registrado');
  await deleteResultado(inscripcionId);
  avisar(ctx.pruebaId);
}
