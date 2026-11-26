import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { closePool } from '../src/db/pool.js';
import { ADMIN, ATLETA, JUEZ, datosRegistro, loginAs } from './helpers.js';

const app = createApp();
let adminToken;
let atletaToken;
let juezToken;
const auth = (token) => ({ Authorization: `Bearer ${token}` });

beforeAll(async () => {
  adminToken = await loginAs(app, ADMIN.email, ADMIN.password);
  atletaToken = await loginAs(app, ATLETA.email, ATLETA.password);
  juezToken = await loginAs(app, JUEZ.email, JUEZ.password);
});

afterAll(async () => {
  await closePool();
});

describe('GET /api/atletas', () => {
  it('el ADMIN busca por club', async () => {
    const res = await request(app).get('/api/atletas?q=Delfines').set(auth(adminToken));

    expect(res.status).toBe(200);
    const nombres = res.body.datos.map((a) => `${a.nombre} ${a.apellido}`);
    expect(nombres).toEqual(expect.arrayContaining(['Valentina Rojas', 'Mateo Fernández', 'Lucía Herrera']));
    expect(res.body.datos.every((a) => a.club === 'Club Delfines')).toBe(true);
    expect(res.body).toMatchObject({ page: 1, total: expect.any(Number) });
  });

  it('busca por documento y por apellido', async () => {
    const porDoc = await request(app).get('/api/atletas?q=30111222').set(auth(adminToken));
    expect(porDoc.body.datos.map((a) => a.nombre)).toEqual(['Valentina']);

    const porApellido = await request(app).get('/api/atletas?q=herrera').set(auth(adminToken));
    expect(porApellido.body.datos.map((a) => a.nombre)).toContain('Lucía');
  });

  it('devuelve la forma Atleta sin datos sensibles', async () => {
    const res = await request(app).get('/api/atletas?q=30111222').set(auth(adminToken));

    expect(res.body.datos[0]).toEqual({
      id: 4,
      nombre: 'Valentina',
      apellido: 'Rojas',
      email: 'valentina@podio.local',
      documento: '30111222',
      fechaNacimiento: '2008-03-14',
      sexo: 'F',
      club: 'Club Delfines',
      telefono: '555-0104',
      activo: true,
    });
  });

  it('un texto con comodines o comillas no rompe la búsqueda', async () => {
    const res = await request(app).get(`/api/atletas?q=${encodeURIComponent("' OR 1=1 --")}`).set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.datos).toEqual([]);
  });

  it('solo el ADMIN puede consultar atletas', async () => {
    expect((await request(app).get('/api/atletas').set(auth(atletaToken))).status).toBe(403);
    expect((await request(app).get('/api/atletas').set(auth(juezToken))).status).toBe(403);
  });
});

describe('GET /api/atletas/:id', () => {
  it('devuelve la ficha con sus inscripciones', async () => {
    const res = await request(app).get('/api/atletas/4').set(auth(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.atleta.nombre).toBe('Valentina');
    expect(res.body.inscripciones.length).toBeGreaterThanOrEqual(3);
    expect(res.body.inscripciones[0]).toMatchObject({
      atletaId: 4,
      prueba: expect.any(String),
      torneo: expect.any(String),
      categoria: expect.any(String),
      dorsal: expect.any(Number),
    });
  });

  it('404 si no es un atleta', async () => {
    expect((await request(app).get('/api/atletas/1').set(auth(adminToken))).status).toBe(404); // admin
    expect((await request(app).get('/api/atletas/99999').set(auth(adminToken))).status).toBe(404);
  });
});

describe('POST /api/atletas', () => {
  it('el ADMIN registra un atleta', async () => {
    const datos = datosRegistro({ nombre: 'Rocío' });
    const res = await request(app).post('/api/atletas').set(auth(adminToken)).send(datos);

    expect(res.status).toBe(201);
    expect(res.body.atleta).toMatchObject({ nombre: 'Rocío', email: datos.email, documento: datos.documento, activo: true });
    expect(res.body.token).toBeUndefined();
  });

  it('valida igual que el registro público', async () => {
    const res = await request(app).post('/api/atletas').set(auth(adminToken)).send(datosRegistro({ sexo: 'X' }));
    expect(res.status).toBe(400);
  });

  it('documento repetido → 409 DOCUMENTO_TAKEN', async () => {
    const res = await request(app).post('/api/atletas').set(auth(adminToken)).send(datosRegistro({ documento: '30111222' }));
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DOCUMENTO_TAKEN');
  });
});

describe('/api/atletas/me', () => {
  it('el atleta ve su perfil', async () => {
    const res = await request(app).get('/api/atletas/me').set(auth(atletaToken));

    expect(res.status).toBe(200);
    expect(res.body.atleta).toMatchObject({ id: 4, documento: '30111222' });
  });

  it('el atleta edita nombre, club y teléfono pero no su documento', async () => {
    const { body } = await request(app).post('/api/auth/register').send(datosRegistro());
    const token = body.token;

    const res = await request(app)
      .put('/api/atletas/me')
      .set(auth(token))
      .send({ nombre: 'Anita', apellido: 'Prueba', club: 'Nuevo Club', telefono: '555-1234', documento: 'HACK123' });

    expect(res.status).toBe(200);
    expect(res.body.atleta).toMatchObject({ nombre: 'Anita', club: 'Nuevo Club', telefono: '555-1234' });
    expect(res.body.atleta.documento).not.toBe('HACK123');
  });

  it('un JUEZ no tiene perfil de atleta', async () => {
    expect((await request(app).get('/api/atletas/me').set(auth(juezToken))).status).toBe(403);
  });
});
