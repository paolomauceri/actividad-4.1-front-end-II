// Punto de entrada: levanta la API (y Socket.IO en el mismo puerto).
import http from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { closePool } from './db/pool.js';
import { cerrarRealtime, iniciarRealtime } from './realtime.js';

const app = createApp();
const server = http.createServer(app);
iniciarRealtime(server);

server.listen(env.PORT, () => {
  const base = `http://localhost:${env.PORT}/api`;
  console.log(`API de Podio lista:
  - Índice:        ${base}
  - Health check:  ${base}/health
  - Documentación: ${base}/docs
  - Tiempo real:   ws://localhost:${env.PORT}/socket.io`);
});

async function shutdown() {
  // cerrarRealtime también cierra el servidor HTTP
  await cerrarRealtime();
  await closePool();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
