// Tiempo real con Socket.IO: cada prueba es una sala `prueba:<id>`.
// Los clientes solo escuchan; las escrituras siguen yendo por la API REST con JWT.
import { Server } from 'socket.io';
import { env } from './config/env.js';
import { findResultadosPrueba } from './modules/resultados/resultados.repository.js';

let io = null;

/** Id de prueba válido (entero positivo) o null. */
function idValido(valor) {
  const n = typeof valor === 'number' ? valor : /^\d{1,10}$/.test(String(valor)) ? Number(valor) : NaN;
  return Number.isInteger(n) && n > 0 && n <= 4294967295 ? n : null;
}

const sala = (pruebaId) => `prueba:${pruebaId}`;

/**
 * Engancha Socket.IO al servidor HTTP.
 * Eventos del cliente: `prueba:seguir` y `prueba:dejar` (pruebaId, ack?) → ack({ ok }).
 * Evento del servidor: `resultados:actualizados` con la clasificación de la prueba.
 */
export function iniciarRealtime(httpServer) {
  io = new Server(httpServer, {
    serveClient: false,
    cors: { origin: env.CORS_ORIGIN },
  });

  io.on('connection', (socket) => {
    socket.on('prueba:seguir', (pruebaId, ack) => {
      const id = idValido(pruebaId);
      if (id) socket.join(sala(id));
      if (typeof ack === 'function') ack({ ok: id !== null });
    });
    socket.on('prueba:dejar', (pruebaId, ack) => {
      const id = idValido(pruebaId);
      if (id) socket.leave(sala(id));
      if (typeof ack === 'function') ack({ ok: id !== null });
    });
  });

  return io;
}

/** Envía la clasificación recalculada a quienes siguen la prueba. Sin Socket.IO no hace nada. */
export async function emitirResultados(pruebaId) {
  if (!io) return;
  const datos = await findResultadosPrueba(pruebaId);
  if (datos) io.to(sala(pruebaId)).emit('resultados:actualizados', datos);
}

/** Cierra Socket.IO (y el servidor HTTP al que está enganchado). */
export async function cerrarRealtime() {
  if (!io) return;
  const actual = io;
  io = null;
  await actual.close();
}
