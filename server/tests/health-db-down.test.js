import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Simula la base de datos caída: query() rechaza como lo hace mysql2.
vi.mock('../src/db/pool.js', () => ({
  query: vi.fn(async () => {
    const err = new Error('connect ECONNREFUSED 127.0.0.1:3306');
    err.code = 'ECONNREFUSED';
    throw err;
  }),
  withTransaction: vi.fn(),
  closePool: vi.fn(),
}));

const { createApp } = await import('../src/app.js');

describe('GET /api/health con la base de datos caída', () => {
  it('responde 503 con código DB_UNAVAILABLE', async () => {
    const res = await request(createApp()).get('/api/health');

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('DB_UNAVAILABLE');
  });
});
