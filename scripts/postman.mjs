// Corre la colección Postman con Newman contra una API levantada aquí mismo
// sobre la base de pruebas (torneos_test, recreada desde cero).
//   npm run test:postman
// Reportes: docs/05-pruebas/reportes/newman-reporte.html y newman-reporte.json
import http from 'node:http';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import newman from 'newman';

process.env.NODE_ENV = 'test';
process.env.NO_PROXY = 'localhost,127.0.0.1';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const carpeta = path.join(raiz, 'docs', '05-pruebas');
const reportes = path.join(carpeta, 'reportes');

// Se importan después de fijar NODE_ENV para que el servidor lea server/.env.test
const { env } = await import('../server/src/config/env.js');
const { resetDatabase } = await import('../server/scripts/db-reset.js');
const { createApp } = await import('../server/src/app.js');
const { iniciarRealtime, cerrarRealtime } = await import('../server/src/realtime.js');
const { closePool } = await import('../server/src/db/pool.js');

console.log(`Recreando la base ${env.DB_NAME}…`);
await resetDatabase(env.DB_NAME);

const server = http.createServer(createApp({ serveClient: false }));
iniciarRealtime(server);
await new Promise((resolve) => server.listen(env.PORT, '127.0.0.1', resolve));
const baseUrl = `http://localhost:${env.PORT}`;
console.log(`API de pruebas en ${baseUrl}\n`);

mkdirSync(reportes, { recursive: true });

const resumen = await new Promise((resolve, reject) => {
  newman.run(
    {
      collection: path.join(carpeta, 'postman', 'podio.postman_collection.json'),
      environment: path.join(carpeta, 'postman', 'podio-local.postman_environment.json'),
      envVar: [{ key: 'baseUrl', value: baseUrl }],
      reporters: ['cli', 'htmlextra', 'json'],
      reporter: {
        htmlextra: {
          export: path.join(reportes, 'newman-reporte.html'),
          title: 'Podio — Pruebas de la API (Postman + Newman)',
          browserTitle: 'Podio · Reporte Newman',
          showOnlyFails: false,
        },
        json: { export: path.join(reportes, 'newman-reporte.json') },
      },
    },
    (err, summary) => (err ? reject(err) : resolve(summary)),
  );
});

await cerrarRealtime();
await closePool();

const { stats, failures } = resumen.run;
console.log(
  `\nRequests: ${stats.requests.total} · Aserciones: ${stats.assertions.total} · Fallidas: ${stats.assertions.failed}`,
);
console.log(`Reporte HTML: ${path.relative(raiz, path.join(reportes, 'newman-reporte.html'))}`);
process.exit(failures.length ? 1 : 0);
