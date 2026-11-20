// Punto de entrada: levanta la API en el puerto configurado.
import { createApp } from './app.js';
import { env } from './config/env.js';
import { closePool } from './db/pool.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  const base = `http://localhost:${env.PORT}/api`;
  console.log(`API de Podio lista:
  - Índice:        ${base}
  - Health check:  ${base}/health
  - Documentación: ${base}/docs`);
});

async function shutdown() {
  server.close();
  await closePool();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
