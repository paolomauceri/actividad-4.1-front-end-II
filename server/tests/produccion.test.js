// Comportamiento del servidor en producción: límite de intentos en auth y
// la app React servida por Express (una sola URL en Render).
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createApp } from '../src/app.js';
import { closePool } from '../src/db/pool.js';

let distDir;

beforeAll(async () => {
  distDir = await mkdtemp(path.join(tmpdir(), 'podio-dist-'));
  await writeFile(path.join(distDir, 'index.html'), '<!doctype html><title>Podio</title><div id="root"></div>');
  await writeFile(path.join(distDir, 'manifest.webmanifest'), '{"name":"Podio"}');
});

afterAll(async () => {
  await rm(distDir, { recursive: true, force: true });
  await closePool();
});

describe('límite de intentos en /api/auth', () => {
  it('responde 429 TOO_MANY_REQUESTS al superar el máximo de logins seguidos', async () => {
    const app = createApp({ authRateLimit: 3 });
    const intento = () => request(app).post('/api/auth/login').send({ email: 'nadie@podio.local', password: 'Malo1234' });

    for (let i = 0; i < 3; i += 1) {
      expect((await intento()).status).toBe(401);
    }
    const res = await intento();
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('TOO_MANY_REQUESTS');
  });

  it('no limita otras rutas de la API', async () => {
    const app = createApp({ authRateLimit: 1 });
    for (let i = 0; i < 3; i += 1) {
      expect((await request(app).get('/api/health')).status).toBe(200);
    }
  });
});

describe('app React servida por Express', () => {
  it('devuelve index.html para las rutas del frontend', async () => {
    const app = createApp({ serveClient: true, clientDist: distDir });
    const res = await request(app).get('/torneos/5');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain('<div id="root">');
  });

  it('sirve los archivos estáticos del build', async () => {
    const app = createApp({ serveClient: true, clientDist: distDir });
    const res = await request(app).get('/manifest.webmanifest');

    expect(res.status).toBe(200);
    expect(res.text).toContain('Podio');
  });

  it('las rutas /api inexistentes siguen respondiendo 404 en JSON', async () => {
    const app = createApp({ serveClient: true, clientDist: distDir });
    const res = await request(app).get('/api/no-existe');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('sin serveClient (desarrollo) las rutas del frontend dan 404', async () => {
    const app = createApp();
    expect((await request(app).get('/torneos/5')).status).toBe(404);
  });
});
