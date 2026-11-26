import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { closePool } from '../src/db/pool.js';
import { ADMIN, ATLETA, crearPrueba, crearTorneo, fechaEnDias, loginAs } from './helpers.js';

const app = createApp();
let adminToken;
let atletaToken;
let torneo;
const auth = (token) => ({ Authorization: `Bearer ${token}` });

beforeAll(async () => {
  adminToken = await loginAs(app, ADMIN.email, ADMIN.password);
  atletaToken = await loginAs(app, ATLETA.email, ATLETA.password);
  torneo = await crearTorneo(app, adminToken); // del día +30 al +31
});

afterAll(async () => {
  await closePool();
});

const datosPrueba = (overrides = {}) => ({
  deporteId: 1,
  nombre: 'Aguas abiertas 3 km',
  distanciaM: 3000,
  fechaHora: `${fechaEnDias(30)}T08:30`,
  cupo: 40,
  ...overrides,
});

describe('POST /api/torneos/:id/pruebas', () => {
  it('el ADMIN agrega una prueba al torneo', async () => {
    const res = await request(app).post(`/api/torneos/${torneo.id}/pruebas`).set(auth(adminToken)).send(datosPrueba());

    expect(res.status).toBe(201);
    expect(res.body.prueba).toEqual({
      id: expect.any(Number),
      torneoId: torneo.id,
      deporteId: 1,
      deporte: 'Aguas abiertas',
      nombre: 'Aguas abiertas 3 km',
      distanciaM: 3000,
      fechaHora: `${fechaEnDias(30)} 08:30:00`,
      cupo: 40,
      estado: 'PROGRAMADA',
      inscritos: 0,
    });
  });

  it('el cupo es opcional', async () => {
    const res = await request(app)
      .post(`/api/torneos/${torneo.id}/pruebas`)
      .set(auth(adminToken))
      .send(datosPrueba({ cupo: null }));

    expect(res.status).toBe(201);
    expect(res.body.prueba.cupo).toBeNull();
  });

  it('la fecha y hora debe caer dentro de las fechas del torneo', async () => {
    const res = await request(app)
      .post(`/api/torneos/${torneo.id}/pruebas`)
      .set(auth(adminToken))
      .send(datosPrueba({ fechaHora: `${fechaEnDias(35)}T08:00` }));

    expect(res.status).toBe(400);
    expect(res.body.error.details[0].campo).toBe('fechaHora');
  });

  it('valida distancia, deporte y formato de fecha', async () => {
    const res = await request(app)
      .post(`/api/torneos/${torneo.id}/pruebas`)
      .set(auth(adminToken))
      .send(datosPrueba({ distanciaM: 0, deporteId: 999, fechaHora: 'mañana' }));

    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d) => d.campo)).toEqual(expect.arrayContaining(['distanciaM', 'fechaHora']));
  });

  it('un deporte inexistente es un error de validación', async () => {
    const res = await request(app)
      .post(`/api/torneos/${torneo.id}/pruebas`)
      .set(auth(adminToken))
      .send(datosPrueba({ deporteId: 999 }));

    expect(res.status).toBe(400);
    expect(res.body.error.details[0].campo).toBe('deporteId');
  });

  it('un ATLETA no puede crear pruebas y un torneo inexistente da 404', async () => {
    expect(
      (await request(app).post(`/api/torneos/${torneo.id}/pruebas`).set(auth(atletaToken)).send(datosPrueba())).status,
    ).toBe(403);
    expect((await request(app).post('/api/torneos/99999/pruebas').set(auth(adminToken)).send(datosPrueba())).status).toBe(
      404,
    );
  });
});

describe('GET /api/torneos/:id/pruebas', () => {
  it('es público para torneos publicados', async () => {
    const res = await request(app).get('/api/torneos/2/pruebas');

    expect(res.status).toBe(200);
    expect(res.body.map((p) => p.nombre)).toEqual([
      'Atletismo 5 km',
      'Triatlón sprint (750 m + 20 km + 5 km)',
      'Atletismo 10 km',
    ]);
  });

  it('las pruebas de un torneo en BORRADOR no son públicas', async () => {
    expect((await request(app).get('/api/torneos/4/pruebas')).status).toBe(404);
  });
});

describe('PUT /api/pruebas/:id', () => {
  it('edita la prueba', async () => {
    const prueba = await crearPrueba(app, adminToken, torneo.id);
    const res = await request(app)
      .put(`/api/pruebas/${prueba.id}`)
      .set(auth(adminToken))
      .send(datosPrueba({ nombre: '200 m libre', distanciaM: 200, deporteId: 2 }));

    expect(res.status).toBe(200);
    expect(res.body.prueba).toMatchObject({ id: prueba.id, nombre: '200 m libre', distanciaM: 200, deporte: 'Natación' });
  });

  it('no permite un cupo menor que los inscritos actuales', async () => {
    // Prueba 6 del seed (10 km) tiene 4 inscritos activos
    const res = await request(app)
      .put('/api/pruebas/6')
      .set(auth(adminToken))
      .send({ deporteId: 5, nombre: 'Atletismo 10 km', distanciaM: 10000, fechaHora: `${fechaEnDias(2)}T07:30`, cupo: 2 });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CUPO_LLENO');
  });
});

describe('PATCH /api/pruebas/:id/estado', () => {
  it('cambia el estado libremente', async () => {
    const prueba = await crearPrueba(app, adminToken, torneo.id);
    const res = await request(app).patch(`/api/pruebas/${prueba.id}/estado`).set(auth(adminToken)).send({ estado: 'CANCELADA' });

    expect(res.status).toBe(200);
    expect(res.body.prueba.estado).toBe('CANCELADA');
  });

  it('rechaza un estado desconocido', async () => {
    const prueba = await crearPrueba(app, adminToken, torneo.id);
    const res = await request(app).patch(`/api/pruebas/${prueba.id}/estado`).set(auth(adminToken)).send({ estado: 'X' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/pruebas/:id', () => {
  it('elimina una prueba sin inscripciones', async () => {
    const prueba = await crearPrueba(app, adminToken, torneo.id);

    expect((await request(app).delete(`/api/pruebas/${prueba.id}`).set(auth(adminToken))).status).toBe(204);
    expect((await request(app).delete(`/api/pruebas/${prueba.id}`).set(auth(adminToken))).status).toBe(404);
  });

  it('no elimina una prueba con inscripciones', async () => {
    const res = await request(app).delete('/api/pruebas/1').set(auth(adminToken));

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('TIENE_INSCRIPCIONES');
  });
});
