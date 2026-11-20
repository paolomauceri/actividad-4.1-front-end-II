// Carga y valida la configuración desde server/.env (o server/.env.test en pruebas).
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const envFile = path.join(serverRoot, process.env.NODE_ENV === 'test' ? '.env.test' : '.env');

if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Revisa server/.env (ver .env.example).`);
  }
  return value;
}

export const env = Object.freeze({
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3000),
  DB_HOST: process.env.DB_HOST ?? '127.0.0.1',
  DB_PORT: Number(process.env.DB_PORT ?? 3306),
  DB_USER: required('DB_USER'),
  DB_PASSWORD: process.env.DB_PASSWORD ?? '',
  DB_NAME: required('DB_NAME'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '8h',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
});
