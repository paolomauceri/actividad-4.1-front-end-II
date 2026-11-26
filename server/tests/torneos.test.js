import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { closePool } from '../src/db/pool.js';
import { ADMIN, ATLETA, cambiarEstado, crearTorneo, fechaEnDias, loginAs } from './helpers.js';

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

const datosTorneo = (overrides = {}) => ({
  nombre: 'Copa de Verano',
  descripcion: 'Torneo de prueba',
  sede: 'Club Náutico',
  fechaInicio: fechaEnDias(40),
  fechaFin: fechaEnDias(41),
  ...overrides,
});

describe('POST /api/torneos', () => {
  it('el ADMIN crea un torneo en BORRADOR', async () => {
    const res = await request(app).post('/api/torneos').set(auth(adminToken)).send(datosTorneo());

    expect(res.status).toBe(201);
    expect(res.body.torneo).toMatchObject({
      id: expect.any(Number),
      nombre: 'Copa de Verano',
      sede: 'Club Náutico',
      fechaInicio: fechaEnDias(40),
      fechaFin: fechaEnDias(41),
      estado: 'BORRADOR',
      totalPruebas: 0,
      totalInscritos: 0,
      deportes: [],
    });
  });

  it('sin token responde 401', async () => {
    expect((await request(app).post('/api/torneos').send(datosTorneo())).status).toBe(401);
  });

  it('un ATLETA no puede crear torneos (403)', async () => {
    const res = await request(app).post('/api/torneos').set(auth(atletaToken)).send(datosTorneo());
    expect(res.status).toBe(403);
  });

  it('rechaza una fecha de fin anterior a la de inicio', async () => {
    const res = await request(app)
      .post('/api/torneos')
      .set(auth(adminToken))
      .send(datosTorneo({ fechaInicio: fechaEnDias(10), fechaFin: fechaEnDias(9) }));

    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual(expect.arrayContaining([expect.objectContaining({ campo: 'fechaFin' })]));
  });

  it('exige nombre y sede', async () => {
    const res = await request(app).post('/api/torneos').set(auth(adminToken)).send({ fechaInicio: fechaEnDias(1) });

    expect(res.status).toBe(400);
    const campos = res.body.error.details.map((d) => d.campo);
    expect(campos).toEqual(expect.arrayContaining(['nombre', 'sede', 'fechaFin']));
  });

  it('guarda texto con comillas tal cual (consultas parametrizadas)', async () => {
    const nombre = "Copa ' OR 1=1 --";
    const res = await request(app).post('/api/torneos').set(auth(adminToken)).send(datosTorneo({ nombre }));

    expect(res.status).toBe(201);
    const detalle = await request(app).get(`/api/torneos/${res.body.torneo.id}`).set(auth(adminToken));
    expect(detalle.body.torneo.nombre).toBe(nombre);
  });
});

describe('GET /api/torneos', () => {
  it('es público, pagina y no muestra torneos en BORRADOR', async () => {
    const res = await request(app).get('/api/torneos');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ page: 1, limit: expect.any(Number), total: expect.any(Number) });
    expect(res.body.datos.length).toBeGreaterThan(0);
    expect(res.body.datos.every((t) => t.estado !== 'BORRADOR')).toBe(true);
  });

  it('el ADMIN ve también los BORRADOR', async () => {
    const res = await request(app).get('/api/torneos?estado=BORRADOR&limit=100').set(auth(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.datos.map((t) => t.nombre)).toContain('Media Maratón Ciudad 2027');
  });

  it('filtra por estado', async () => {
    const res = await request(app).get('/api/torneos?estado=EN_CURSO');

    expect(res.body.datos.map((t) => t.nombre)).toContain('Circuito Costa Triatlón y Atletismo 2026');
    expect(res.body.datos.every((t) => t.estado === 'EN_CURSO')).toBe(true);
  });

  it('cuenta pruebas e inscritos activos (sin anuladas)', async () => {
    const res = await request(app).get('/api/torneos?estado=EN_CURSO&limit=100');
    const circuito = res.body.datos.find((t) => t.id === 2);

    // Torneo 2 del seed: 3 pruebas y 16 inscripciones, 1 de ellas ANULADA
    expect(circuito.totalPruebas).toBe(3);
    expect(circuito.totalInscritos).toBe(15);
    expect(circuito.deportes).toEqual(['Atletismo', 'Triatlón']);
  });

  it('rechaza un estado que no existe', async () => {
    const res = await request(app).get('/api/torneos?estado=CERRADO');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/torneos/:id', () => {
  it('devuelve el torneo con sus pruebas y categorías', async () => {
    const res = await request(app).get('/api/torneos/1');

    expect(res.status).toBe(200);
    expect(res.body.torneo.nombre).toBe('Copa Aguas Abiertas Lago Azul 2026');
    expect(res.body.torneo.pruebas).toHaveLength(3);
    expect(res.body.torneo.pruebas[0]).toMatchObject({
      id: 1,
      torneoId: 1,
      deporte: 'Aguas abiertas',
      nombre: 'Aguas abiertas 1.500 m',
      distanciaM: 1500,
      cupo: 80,
      estado: 'PROGRAMADA',
      inscritos: 5,
    });
    expect(res.body.torneo.categorias).toHaveLength(6);
    expect(res.body.torneo.categorias[0]).toMatchObject({
      id: 1,
      nombre: 'Juvenil Femenino',
      sexo: 'F',
      edadMin: 15,
      edadMax: 19,
    });
  });

  it('un torneo en BORRADOR es 404 para el público y visible para el ADMIN', async () => {
    expect((await request(app).get('/api/torneos/4')).status).toBe(404);
    expect((await request(app).get('/api/torneos/4').set(auth(atletaToken))).status).toBe(404);
    expect((await request(app).get('/api/torneos/4').set(auth(adminToken))).status).toBe(200);
  });

  it('id inexistente o inválido → 404', async () => {
    expect((await request(app).get('/api/torneos/99999')).status).toBe(404);
    expect((await request(app).get('/api/torneos/abc')).status).toBe(404);
  });
});

describe('PUT /api/torneos/:id', () => {
  it('el ADMIN edita los datos del torneo', async () => {
    const torneo = await crearTorneo(app, adminToken);
    const res = await request(app)
      .put(`/api/torneos/${torneo.id}`)
      .set(auth(adminToken))
      .send(datosTorneo({ nombre: 'Nombre corregido', sede: 'Otra sede' }));

    expect(res.status).toBe(200);
    expect(res.body.torneo).toMatchObject({ id: torneo.id, nombre: 'Nombre corregido', sede: 'Otra sede' });
  });

  it('no permite cambiar la fecha de inicio si ya hay inscritos', async () => {
    // Torneo 1 del seed tiene inscripciones activas
    const res = await request(app)
      .put('/api/torneos/1')
      .set(auth(adminToken))
      .send(datosTorneo({ nombre: 'Copa Aguas Abiertas Lago Azul 2026', fechaInicio: fechaEnDias(16), fechaFin: fechaEnDias(18) }));

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('TIENE_INSCRIPCIONES');
  });

  it('404 si el torneo no existe', async () => {
    const res = await request(app).put('/api/torneos/99999').set(auth(adminToken)).send(datosTorneo());
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/torneos/:id/estado', () => {
  it('avanza y retrocede de a un paso', async () => {
    const torneo = await crearTorneo(app, adminToken);
    const url = `/api/torneos/${torneo.id}/estado`;

    const abrir = await request(app).patch(url).set(auth(adminToken)).send({ estado: 'ABIERTO' });
    expect(abrir.status).toBe(200);
    expect(abrir.body.torneo.estado).toBe('ABIERTO');

    const volver = await request(app).patch(url).set(auth(adminToken)).send({ estado: 'BORRADOR' });
    expect(volver.status).toBe(200);
    expect(volver.body.torneo.estado).toBe('BORRADOR');
  });

  it('no permite saltar estados', async () => {
    const torneo = await crearTorneo(app, adminToken);
    const res = await request(app)
      .patch(`/api/torneos/${torneo.id}/estado`)
      .set(auth(adminToken))
      .send({ estado: 'EN_CURSO' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('TRANSICION_INVALIDA');
  });

  it('rechaza un estado desconocido (400) y a quien no es ADMIN (403)', async () => {
    const torneo = await crearTorneo(app, adminToken);
    const url = `/api/torneos/${torneo.id}/estado`;
    expect((await request(app).patch(url).set(auth(adminToken)).send({ estado: 'CERRADO' })).status).toBe(400);
    expect((await request(app).patch(url).set(auth(atletaToken)).send({ estado: 'ABIERTO' })).status).toBe(403);
  });
});

describe('DELETE /api/torneos/:id', () => {
  it('elimina un torneo sin inscripciones', async () => {
    const torneo = await crearTorneo(app, adminToken);
    await cambiarEstado(app, adminToken, torneo.id, 'ABIERTO');

    expect((await request(app).delete(`/api/torneos/${torneo.id}`).set(auth(adminToken))).status).toBe(204);
    expect((await request(app).get(`/api/torneos/${torneo.id}`).set(auth(adminToken))).status).toBe(404);
  });

  it('no elimina un torneo con inscripciones', async () => {
    const res = await request(app).delete('/api/torneos/3').set(auth(adminToken));

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('TIENE_INSCRIPCIONES');
  });
});

describe('GET /api/deportes', () => {
  it('lista los 5 deportes (público)', async () => {
    const res = await request(app).get('/api/deportes');

    expect(res.status).toBe(200);
    expect(res.body.map((d) => d.nombre)).toEqual(['Acuatlón', 'Aguas abiertas', 'Atletismo', 'Natación', 'Triatlón']);
    expect(res.body[0]).toEqual({ id: expect.any(Number), nombre: 'Acuatlón', descripcion: expect.any(String) });
  });
});

describe('documentación OpenAPI', () => {
  it('incluye los endpoints de torneos y deportes', async () => {
    const res = await request(app).get('/api/docs/openapi.json');

    expect(Object.keys(res.body.paths)).toEqual(
      expect.arrayContaining(['/api/torneos', '/api/torneos/{id}', '/api/torneos/{id}/estado', '/api/deportes']),
    );
  });
});
