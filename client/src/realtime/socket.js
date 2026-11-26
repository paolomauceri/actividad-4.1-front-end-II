// Conexión única de Socket.IO con el mismo servidor que sirve la app.
import { io } from 'socket.io-client';

let socket = null;

/** Devuelve el socket compartido (lo crea la primera vez). Se reconecta solo si se corta. */
export function getSocket() {
  if (!socket) socket = io({ transports: ['websocket', 'polling'] });
  return socket;
}
