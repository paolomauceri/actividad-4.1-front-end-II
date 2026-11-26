import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { closePool } from '../src/db/pool.js';
import { ADMIN, ATLETA, crearCategoria, crearTorneo, loginAs } from './helpers.js';

const app = createApp();
let adminToken;
let atletaToken;
const auth = (token) => ({ Authorization: `Bearer ${token}` });

beforeAll(async () => {
  adminToken = await loginAs(app, ADMIN.email, ADMIN.password);
  atletaToken = await loginAs(app, ATLETA.email, ATLETA.password);
});

afterAll(async () => {
  await closePool();
});

const crear = (torneoId, datos, token = adminToken) =>
  request(app).post(`/api/torneos/${torneoId}/categorias`).set(auth(token)).send(datos);

describe('POST /api/torneos/:id/categorias', () => {
  it('el ADMIN crea una categoría', async () => {
    const torneo = await crearTorneo(app, adminToken);
    const res = await crear(torneo.id, { nombre: 'Juvenil Femenino', sexo: 'F', edadMin: 15, edadMax: 19 });

    expect(res.status).toBe(201);
    expect(res.body.categoria).toEqual({
      id: expect.any(Number),
      torneoId: torneo.id,
      nombre: 'Juvenil Femenino',
      sexo: 'F',
      edadMin: 15,
      edadMax: 19,
      inscritos: 0,
    });
  });

  it('no permite rangos de edad que se crucen en el mismo sexo', async () => {
    const torneo = await crearTorneo(app, adminToken);
    await crearCategoria(app, adminToken, torneo.id, { nombre: 'Juvenil F', sexo: 'F', edadMin: 15, edadMax: 19 });

    const res = await crear(torneo.id, { nombre: 'Sub 25 F', sexo: 'F', edadMin: 18, edadMax: 25 });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CATEGORIA_SOLAPADA');
    expect(res.body.error.message).toContain('Juvenil F');
  });

  it('permite el mismo rango para el otro sexo', async () => {
    const torneo = await crearTorneo(app, adminToken);
    await crearCategoria(app, adminToken, torneo.id, { nombre: 'Juvenil F', sexo: 'F', edadMin: 15, edadMax: 19 });

    expect((await crear(torneo.id, { nombre: 'Juvenil M', sexo: 'M', edadMin: 15, edadMax: 19 })).status).toBe(201);
  });

  it('una categoría MIXTO se cruza con cualquier sexo', async () => {
    const torneo = await crearTorneo(app, adminToken);
    await crearCategoria(app, adminToken, torneo.id, { nombre: 'Adulto F', sexo: 'F', edadMin: 20, edadMax: 39 });

    const res = await crear(torneo.id, { nombre: 'Open', sexo: 'MIXTO', edadMin: 30, edadMax: 40 });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CATEGORIA_SOLAPADA');
  });

  it('rangos contiguos no se cruzan (19 y 20)', async () => {
    const torneo = await crearTorneo(app, adminToken);
    await crearCategoria(app, adminToken, torneo.id, { nombre: 'Juvenil F', sexo: 'F', edadMin: 15, edadMax: 19 });

    expect((await crear(torneo.id, { nombre: 'Adulto F', sexo: 'F', edadMin: 20, edadMax: 39 })).status).toBe(201);
  });

  it('no permite dos categorías con el mismo nombre en el torneo', async () => {
    const torneo = await crearTorneo(app, adminToken);
    await crearCategoria(app, adminToken, torneo.id, { nombre: 'Élite', sexo: 'F', edadMin: 20, edadMax: 29 });

    const res = await crear(torneo.id, { nombre: 'Élite', sexo: 'M', edadMin: 20, edadMax: 29 });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CATEGORIA_DUPLICADA');
  });

  it('valida sexo y que la edad máxima no sea menor que la mínima', async () => {
    const torneo = await crearTorneo(app, adminToken);
    const res = await crear(torneo.id, { nombre: 'Rara', sexo: 'X', edadMin: 30, edadMax: 20 });

    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d) => d.campo)).toEqual(expect.arrayContaining(['sexo', 'edadMax']));
  });

  it('un ATLETA no puede crear categorías', async () => {
    const torneo = await crearTorneo(app, adminToken);
    const res = await crear(torneo.id, { nombre: 'Juvenil F', sexo: 'F', edadMin: 15, edadMax: 19 }, atletaToken);
    expect(res.status).toBe(403);
  });
});

describe('GET /api/torneos/:id/categorias', () => {
  it('es público para torneos publicados', async () => {
    const res = await request(app).get('/api/torneos/1/categorias');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(6);
    expect(res.body[0]).toMatchObject({ nombre: 'Juvenil Femenino', edadMin: 15, edadMax: 19 });
  });
});

describe('PUT /api/categorias/:id', () => {
  it('con inscritos no se pueden cambiar edades ni sexo', async () => {
    // Categoría 1 del seed (Juvenil Femenino, torneo 1) tiene inscritas
    const res = await request(app)
      .put('/api/categorias/1')
      .set(auth(adminToken))
      .send({ nombre: 'Juvenil Femenino', sexo: 'F', edadMin: 15, edadMax: 18 });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('TIENE_INSCRIPCIONES');
  });

  it('con inscritos sí se puede cambiar el nombre', async () => {
    const res = await request(app)
      .put('/api/categorias/1')
      .set(auth(adminToken))
      .send({ nombre: 'Juvenil Damas', sexo: 'F', edadMin: 15, edadMax: 19 });

    expect(res.status).toBe(200);
    expect(res.body.categoria.nombre).toBe('Juvenil Damas');

    await request(app)
      .put('/api/categorias/1')
      .set(auth(adminToken))
      .send({ nombre: 'Juvenil Femenino', sexo: 'F', edadMin: 15, edadMax: 19 });
  });

  it('al editar no se compara consigo misma para el solapamiento', async () => {
    const torneo = await crearTorneo(app, adminToken);
    const cat = await crearCategoria(app, adminToken, torneo.id, { nombre: 'Adulto F', sexo: 'F', edadMin: 20, edadMax: 39 });

    const res = await request(app)
      .put(`/api/categorias/${cat.id}`)
      .set(auth(adminToken))
      .send({ nombre: 'Adulto F', sexo: 'F', edadMin: 20, edadMax: 44 });

    expect(res.status).toBe(200);
    expect(res.body.categoria.edadMax).toBe(44);
  });
});

describe('DELETE /api/categorias/:id', () => {
  it('elimina una categoría sin inscritos y no una con inscritos', async () => {
    const torneo = await crearTorneo(app, adminToken);
    const cat = await crearCategoria(app, adminToken, torneo.id);

    expect((await request(app).delete(`/api/categorias/${cat.id}`).set(auth(adminToken))).status).toBe(204);

    const conInscritos = await request(app).delete('/api/categorias/1').set(auth(adminToken));
    expect(conInscritos.status).toBe(409);
    expect(conInscritos.body.error.code).toBe('TIENE_INSCRIPCIONES');
  });
});

describe('documentación OpenAPI', () => {
  it('incluye los endpoints de pruebas y categorías', async () => {
    const res = await request(app).get('/api/docs/openapi.json');

    expect(Object.keys(res.body.paths)).toEqual(
      expect.arrayContaining([
        '/api/torneos/{torneoId}/pruebas',
        '/api/pruebas/{id}',
        '/api/pruebas/{id}/estado',
        '/api/torneos/{torneoId}/categorias',
        '/api/categorias/{id}',
      ]),
    );
  });
});
