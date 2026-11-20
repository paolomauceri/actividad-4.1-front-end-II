// Pool de conexiones MySQL (mysql2/promise) y utilidades de consulta.
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      charset: 'utf8mb4',
      waitForConnections: true,
      connectionLimit: 10,
      dateStrings: true, // DATE/DATETIME como texto 'YYYY-MM-DD[ HH:mm:ss]', sin conversión de zona horaria
    });
  }
  return pool;
}

/** Ejecuta una consulta parametrizada y devuelve las filas. */
export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

/**
 * Ejecuta `fn(conn)` dentro de una transacción.
 * Hace COMMIT si termina bien y ROLLBACK si lanza un error.
 */
export async function withTransaction(fn) {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** Cierra el pool (al apagar el servidor o al terminar las pruebas). */
export async function closePool() {
  if (pool) {
    const current = pool;
    pool = undefined;
    await current.end();
  }
}
