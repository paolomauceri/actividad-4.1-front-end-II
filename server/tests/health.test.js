import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { closePool } from '../src/db/pool.js';

const app = createApp();

afterAll(async () => {
  await closePool();
});

describe('GET /api/health', () => {
  it('responde 200 con estado del servidor y de la base de datos', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', db: 'ok' });
  });
});

describe('GET /api', () => {
  it('responde 200 con el nombre de la API y los enlaces principales', async () => {
    const res = await request(app).get('/api');

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Podio API');
    expect(res.body.enlaces).toMatchObject({ health: '/api/health', docs: '/api/docs' });
  });
});

describe('rutas inexistentes', () => {
  it('responde 404 con código NOT_FOUND', async () => {
    const res = await request(app).get('/api/no-existe');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(typeof res.body.error.message).toBe('string');
  });
});
