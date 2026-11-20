import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { closePool, query } from '../src/db/pool.js';
import { env } from '../src/config/env.js';
import { datosRegistro, loginAs, ADMIN } from './helpers.js';

const app = createApp();

afterAll(async () => {
  await closePool();
});

describe('POST /api/auth/register', () => {
  it('registra un atleta y devuelve token + usuario sin password_hash', async () => {
    const datos = datosRegistro();

    const res = await request(app).post('/api/auth/register').send(datos);

    expect(res.status).toBe(201);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.usuario).toMatchObject({
      nombre: 'Ana',
      apellido: 'Prueba',
      email: datos.email,
      rol: 'ATLETA',
      activo: true,
      atleta: { documento: datos.documento, fechaNacimiento: '2000-05-20', sexo: 'F', club: 'Club Test' },
    });
    expect(JSON.stringify(res.body)).not.toContain('password');
  });

  it('ignora un rol enviado en el body: siempre crea ATLETA', async () => {
    const res = await request(app).post('/api/auth/register').send(datosRegistro({ rol: 'ADMIN' }));

    expect(res.status).toBe(201);
    expect(res.body.usuario.rol).toBe('ATLETA');
  });

  it('rechaza un email ya registrado aunque cambien las mayúsculas (409 EMAIL_TAKEN)', async () => {
    const datos = datosRegistro({ email: 'repetido@test.local' });
    await request(app).post('/api/auth/register').send(datos).expect(201);

    const res = await request(app)
      .post('/api/auth/register')
      .send(datosRegistro({ email: 'Repetido@TEST.local' }));

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('rechaza un documento existente (409 DOCUMENTO_TAKEN) sin dejar usuario huérfano', async () => {
    const datos = datosRegistro({ documento: '30111222' }); // documento de Valentina (seed)

    const res = await request(app).post('/api/auth/register').send(datos);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DOCUMENTO_TAKEN');
    const filas = await query('SELECT COUNT(*) AS n FROM usuarios WHERE email = ?', [datos.email]);
    expect(Number(filas[0].n)).toBe(0);
  });

  it('valida la contraseña (400 VALIDATION_ERROR con detalle del campo)', async () => {
    const res = await request(app).post('/api/auth/register').send(datosRegistro({ password: 'corta' }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(expect.arrayContaining([expect.objectContaining({ campo: 'password' })]));
  });

  it('valida campos obligatorios y formatos (fecha, sexo, email)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'A', email: 'no-es-email', fechaNacimiento: '20-05-2000', sexo: 'X' });

    expect(res.status).toBe(400);
    const campos = res.body.error.details.map((d) => d.campo);
    expect(campos).toEqual(
      expect.arrayContaining(['nombre', 'apellido', 'email', 'password', 'documento', 'fechaNacimiento', 'sexo']),
    );
  });
});

describe('POST /api/auth/login', () => {
  it('inicia sesión con credenciales válidas', async () => {
    const res = await request(app).post('/api/auth/login').send(ADMIN);

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.usuario).toMatchObject({ email: 'admin@podio.local', rol: 'ADMIN' });
  });

  it('acepta el email con mayúsculas y espacios', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: '  ADMIN@podio.local ', password: 'Admin123!' });

    expect(res.status).toBe(200);
  });

  it('responde 401 INVALID_CREDENTIALS con contraseña incorrecta', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: ADMIN.email, password: 'Incorrecta1' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('responde el mismo 401 cuando el email no existe (no revela qué falló)', async () => {
    const malPass = await request(app).post('/api/auth/login').send({ email: ADMIN.email, password: 'Incorrecta1' });
    const noExiste = await request(app).post('/api/auth/login').send({ email: 'nadie@podio.local', password: 'Incorrecta1' });

    expect(noExiste.status).toBe(401);
    expect(noExiste.body).toEqual(malPass.body);
  });

  it('responde 403 USER_INACTIVE si la cuenta está desactivada', async () => {
    const datos = datosRegistro();
    await request(app).post('/api/auth/register').send(datos).expect(201);
    await query('UPDATE usuarios SET activo = 0 WHERE email = ?', [datos.email]);

    const res = await request(app).post('/api/auth/login').send({ email: datos.email, password: datos.password });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('USER_INACTIVE');
  });
});

describe('GET /api/auth/me', () => {
  it('devuelve el usuario de la sesión', async () => {
    const token = await loginAs(app, ADMIN.email, ADMIN.password);

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.usuario).toMatchObject({ email: 'admin@podio.local', rol: 'ADMIN' });
  });

  it.each([
    ['sin header Authorization', undefined],
    ['con un token basura', 'Bearer basura'],
    ['con un token firmado con otro secreto', `Bearer ${jwt.sign({ rol: 'ADMIN' }, 'otro-secreto', { subject: '1' })}`],
    ['con un token expirado', `Bearer ${jwt.sign({ rol: 'ADMIN' }, env.JWT_SECRET, { subject: '1', expiresIn: -10 })}`],
    ['sin el prefijo Bearer', jwt.sign({ rol: 'ADMIN' }, env.JWT_SECRET, { subject: '1' })],
  ])('responde 401 UNAUTHORIZED %s', async (_caso, header) => {
    const req = request(app).get('/api/auth/me');
    if (header) req.set('Authorization', header);

    const res = await req;

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('responde 401 si el usuario del token fue desactivado', async () => {
    const datos = datosRegistro();
    const reg = await request(app).post('/api/auth/register').send(datos).expect(201);
    await query('UPDATE usuarios SET activo = 0 WHERE email = ?', [datos.email]);

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${reg.body.token}`);

    expect(res.status).toBe(401);
  });
});
