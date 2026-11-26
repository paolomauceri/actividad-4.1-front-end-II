import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { closePool } from '../src/db/pool.js';
import { loginAs, ADMIN, ATLETA, JUEZ, datosRegistro } from './helpers.js';

const app = createApp();
let adminToken;
let atletaToken;
let juezToken;

beforeAll(async () => {
  adminToken = await loginAs(app, ADMIN.email, ADMIN.password);
  atletaToken = await loginAs(app, ATLETA.email, ATLETA.password);
  juezToken = await loginAs(app, JUEZ.email, JUEZ.password);
});

afterAll(async () => {
  await closePool();
});

describe('GET /api/usuarios', () => {
  it('responde 401 sin sesión', async () => {
    const res = await request(app).get('/api/usuarios');
    expect(res.status).toBe(401);
  });

  it.each([
    ['ATLETA', () => atletaToken],
    ['JUEZ', () => juezToken],
  ])('responde 403 FORBIDDEN a un %s', async (_rol, token) => {
    const res = await request(app).get('/api/usuarios').set('Authorization', `Bearer ${token()}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('lista usuarios paginados para un ADMIN, sin password_hash', async () => {
    const res = await request(app).get('/api/usuarios?page=1&limit=5').set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(5);
    expect(res.body.total).toBeGreaterThanOrEqual(15);
    expect(res.body.data).toHaveLength(5);
    expect(JSON.stringify(res.body)).not.toContain('password');
  });

  it('filtra por rol', async () => {
    const res = await request(app).get('/api/usuarios?rol=JUEZ').set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    expect(res.body.data.every((u) => u.rol === 'JUEZ')).toBe(true);
  });

  it('limita el tamaño de página a 100 y corrige valores inválidos', async () => {
    const res = await request(app).get('/api/usuarios?page=-3&limit=5000').set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(100);
  });

  it('responde 400 si el rol del filtro no existe', async () => {
    const res = await request(app).get('/api/usuarios?rol=SUPERADMIN').set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/usuarios', () => {
  const nuevoJuez = {
    nombre: 'Pedro',
    apellido: 'Cronómetro',
    email: 'pedro.juez@podio.local',
    password: 'JuezNuevo1',
    rol: 'JUEZ',
  };

  it('permite a un ADMIN crear un JUEZ', async () => {
    const res = await request(app).post('/api/usuarios').set('Authorization', `Bearer ${adminToken}`).send(nuevoJuez);

    expect(res.status).toBe(201);
    expect(res.body.usuario).toMatchObject({ email: 'pedro.juez@podio.local', rol: 'JUEZ', activo: true });
    expect(JSON.stringify(res.body)).not.toContain('password');
  });

  it('el usuario creado puede iniciar sesión', async () => {
    const token = await loginAs(app, nuevoJuez.email, nuevoJuez.password);
    expect(typeof token).toBe('string');
  });

  it('no permite crear ATLETAS por esta vía (400)', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...nuevoJuez, email: 'otro@podio.local', rol: 'ATLETA' });

    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d) => d.campo)).toContain('rol');
  });

  it('responde 409 EMAIL_TAKEN con un email existente', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...nuevoJuez, email: 'ADMIN@podio.local' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('responde 403 a un ATLETA', async () => {
    const res = await request(app).post('/api/usuarios').set('Authorization', `Bearer ${atletaToken}`).send(nuevoJuez);
    expect(res.status).toBe(403);
  });
});

describe('Documentación OpenAPI', () => {
  it('sirve Swagger UI en /api/docs/', async () => {
    const res = await request(app).get('/api/docs/');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
  });

  it('sirve la especificación en /api/docs/openapi.json', async () => {
    const res = await request(app).get('/api/docs/openapi.json');

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(Object.keys(res.body.paths)).toEqual(
      expect.arrayContaining(['/api/auth/register', '/api/auth/login', '/api/auth/me', '/api/usuarios']),
    );
  });
});

describe('PATCH /api/usuarios/:id/activo', () => {
  const auth = (token) => ({ Authorization: `Bearer ${token}` });

  it('desactivar a un usuario corta su sesión y reactivarlo la devuelve', async () => {
    const datos = datosRegistro();
    const { body } = await request(app).post('/api/auth/register').send(datos);
    const { id } = body.usuario;

    const off = await request(app).patch(`/api/usuarios/${id}/activo`).set(auth(adminToken)).send({ activo: false });
    expect(off.status).toBe(200);
    expect(off.body.usuario).toMatchObject({ id, activo: false });
    expect((await request(app).get('/api/auth/me').set(auth(body.token))).status).toBe(401);

    const on = await request(app).patch(`/api/usuarios/${id}/activo`).set(auth(adminToken)).send({ activo: true });
    expect(on.body.usuario.activo).toBe(true);
    expect((await request(app).get('/api/auth/me').set(auth(body.token))).status).toBe(200);
  });

  it('el ADMIN no puede desactivarse a sí mismo', async () => {
    const res = await request(app).patch('/api/usuarios/1/activo').set(auth(adminToken)).send({ activo: false });
    expect(res.status).toBe(403);
  });

  it('valida el cuerpo y que el usuario exista', async () => {
    expect((await request(app).patch('/api/usuarios/2/activo').set(auth(adminToken)).send({ activo: 'si' })).status).toBe(400);
    expect((await request(app).patch('/api/usuarios/99999/activo').set(auth(adminToken)).send({ activo: false })).status).toBe(404);
  });

  it('solo el ADMIN', async () => {
    expect((await request(app).patch('/api/usuarios/2/activo').set(auth(juezToken)).send({ activo: false })).status).toBe(403);
  });
});
