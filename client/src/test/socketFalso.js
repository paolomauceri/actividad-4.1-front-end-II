// Socket.IO falso para las pruebas. Uso en un archivo de test:
//   jest.mock('socket.io-client', () => require('<ruta>/test/socketFalso.js').moduloSocketIo);
//   import { socketFalso } from '<ruta>/test/socketFalso.js';
//   socketFalso.disparar('resultados:actualizados', datos);

const manejadores = new Map();

export const socketFalso = {
  connected: true,
  emit: jest.fn(),
  on: jest.fn((evento, fn) => {
    if (!manejadores.has(evento)) manejadores.set(evento, new Set());
    manejadores.get(evento).add(fn);
  }),
  off: jest.fn((evento, fn) => {
    manejadores.get(evento)?.delete(fn);
  }),
  /** Simula un evento que llega del servidor. */
  disparar(evento, ...args) {
    for (const fn of [...(manejadores.get(evento) ?? [])]) fn(...args);
  },
  /** Cantidad de oyentes de un evento (para verificar que se limpian). */
  oyentes(evento) {
    return manejadores.get(evento)?.size ?? 0;
  },
};

export const moduloSocketIo = { io: () => socketFalso };
