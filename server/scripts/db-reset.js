// Recrea una base de datos desde database/schema.sql + database/seed.sql.
//   npm run db:reset              -> recrea la base de .env (torneos_db)
//   resetDatabase('torneos_test') -> la usan las pruebas automáticas
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import mysql from 'mysql2/promise';
import { env, opcionesSsl } from '../src/config/env.js';

const databaseDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'database');

export async function resetDatabase(dbName = env.DB_NAME) {
  if (!/^[a-z0-9_]+$/i.test(dbName)) {
    throw new Error(`Nombre de base de datos inválido: ${dbName}`);
  }

  const [schema, seed] = await Promise.all([
    readFile(path.join(databaseDir, 'schema.sql'), 'utf8'),
    readFile(path.join(databaseDir, 'seed.sql'), 'utf8'),
  ]);
  const rename = (sql) => sql.replaceAll('torneos_db', dbName);

  const conn = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    charset: 'utf8mb4',
    multipleStatements: true,
    ssl: opcionesSsl(),
  });
  try {
    await conn.query(rename(schema));
    await conn.query(rename(seed));
  } finally {
    await conn.end();
  }
}

// Ejecución directa desde la terminal
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  resetDatabase()
    .then(() => console.log(`Base de datos "${env.DB_NAME}" recreada con datos de prueba.`))
    .catch((err) => {
      console.error('No se pudo recrear la base de datos:', err.message);
      process.exit(1);
    });
}
