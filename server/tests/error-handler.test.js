import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { errorHandler } from '../src/middleware/error-handler.js';
import { HttpError } from '../src/utils/http-error.js';

function appThatThrows(error) {
  const app = express();
  app.get('/boom', () => {
    throw error;
  });
  app.use(errorHandler);
  return app;
}

describe('errorHandler', () => {
  it('convierte un HttpError en su status y formato { error: { code, message, details } }', async () => {
    const err = new HttpError(409, 'EMAIL_TAKEN', 'Este correo ya está registrado', [{ campo: 'email' }]);

    const res = await request(appThatThrows(err)).get('/boom');

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      error: { code: 'EMAIL_TAKEN', message: 'Este correo ya está registrado', details: [{ campo: 'email' }] },
    });
  });

  it('responde 500 INTERNAL_ERROR sin filtrar el mensaje ni el stack de un error inesperado', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(appThatThrows(new Error('boom secreto'))).get('/boom');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(res.body)).not.toContain('boom secreto');
    expect(JSON.stringify(res.body)).not.toContain('stack');
    spy.mockRestore();
  });

  it('responde 503 DB_UNAVAILABLE cuando MySQL rechaza la conexión', async () => {
    const err = Object.assign(new Error('Access denied'), { code: 'ER_ACCESS_DENIED_ERROR' });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(appThatThrows(err)).get('/boom');

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('DB_UNAVAILABLE');
    spy.mockRestore();
  });

  it('responde 400 VALIDATION_ERROR cuando el body no es JSON válido', async () => {
    const app = express();
    app.use(express.json());
    app.post('/eco', (req, res) => res.json(req.body));
    app.use(errorHandler);

    const res = await request(app).post('/eco').set('Content-Type', 'application/json').send('{"mal json');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
