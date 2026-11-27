import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { closePool } from '../src/db/pool.js';
import {
  ADMIN,
  JUEZ,
  cambiarEstado,
  crearCategoria,
  crearPrueba,
  crearTorneo,
  datosRegistro,
  fechaEnDias,
  loginAs,
} from './helpers.js';

const app = createApp();
let adminToken;
let juezToken;
const auth = (token) => ({ Authorization: `Bearer ${token}` });

/** Registra un atleta nuevo y devuelve { id, token }. */
async function nuevoAtleta(overrides = {}) {
  const res = await request(app).post('/api/auth/register').send(datosRegistro(overrides));
  if (res.status !== 201) throw new Error(JSON.stringify(res.body));
  return { id: res.body.usuario.id, token: res.body.token };
}

/** Torneo ABIERTO con una prueba y categorías F/M adulto y F juvenil. */
async function torneoAbierto({ cupo = null } = {}) {
  const torneo = await crearTorneo(app, adminToken);
  const prueba = await crearPrueba(app, adminToken, torneo.id, { cupo });
  const adultoF = await crearCategoria(app, adminToken, torneo.id, { nombre: 'Adulto F', sexo: 'F', edadMin: 20, edadMax: 39 });
  const adultoM = await crearCategoria(app, adminToken, torneo.id, { nombre: 'Adulto M', sexo: 'M', edadMin: 20, edadMax: 39 });
  await crearCategoria(app, adminToken, torneo.id, { nombre: 'Juvenil F', sexo: 'F', edadMin: 15, edadMax: 19 });
  await cambiarEstado(app, adminToken, torneo.id, 'ABIERTO');
  return { torneo, prueba, adultoF, adultoM };
}

const inscribir = (token, body) => request(app).post('/api/inscripciones').set(auth(token)).send(body);

beforeAll(async () => {
  adminToken = await loginAs(app, ADMIN.email, ADMIN.password);
  juezToken = await loginAs(app, JUEZ.email, JUEZ.password);
});

afterAll(async () => {
  await closePool();
});

describe('POST /api/inscripciones (atleta)', () => {
  it('se inscribe con categoría y dorsal automáticos', async () => {
    const { prueba, adultoF, torneo } = await torneoAbierto();
    const ana = await nuevoAtleta({ fechaNacimiento: '2000-05-20', sexo: 'F' });

    const res = await inscribir(ana.token, { pruebaId: prueba.id });

    expect(res.status).toBe(201);
    expect(res.body.inscripcion).toMatchObject({
      id: expect.any(Number),
      pruebaId: prueba.id,
      prueba: '100 m libre',
      torneoId: torneo.id,
      torneo: torneo.nombre,
      torneoEstado: 'ABIERTO',
      atletaId: ana.id,
      categoriaId: adultoF.id,
      categoria: 'Adulto F',
      dorsal: 1,
      estado: 'CONFIRMADA',
      resultado: null,
    });
  });

  it('ignora un atletaId ajeno: siempre se inscribe a sí mismo', async () => {
    const { prueba } = await torneoAbierto();
    const ana = await nuevoAtleta();

    const res = await inscribir(ana.token, { pruebaId: prueba.id, atletaId: 4 });
    expect(res.body.inscripcion.atletaId).toBe(ana.id);
  });

  it('no puede inscribirse dos veces en la misma prueba', async () => {
    const { prueba } = await torneoAbierto();
    const ana = await nuevoAtleta();
    await inscribir(ana.token, { pruebaId: prueba.id });

    const res = await inscribir(ana.token, { pruebaId: prueba.id });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('YA_INSCRITO');
  });

  it('si anula y vuelve a inscribirse se reactiva la misma inscripción con su dorsal', async () => {
    const { prueba } = await torneoAbierto();
    const otra = await nuevoAtleta();
    const ana = await nuevoAtleta();
    await inscribir(otra.token, { pruebaId: prueba.id });
    const primera = (await inscribir(ana.token, { pruebaId: prueba.id })).body.inscripcion;

    const anular = await request(app)
      .patch(`/api/inscripciones/${primera.id}`)
      .set(auth(ana.token))
      .send({ estado: 'ANULADA' });
    expect(anular.status).toBe(200);
    expect(anular.body.inscripcion.estado).toBe('ANULADA');

    const otraVez = await inscribir(ana.token, { pruebaId: prueba.id });
    expect(otraVez.status).toBe(201);
    expect(otraVez.body.inscripcion).toMatchObject({ id: primera.id, dorsal: primera.dorsal, estado: 'CONFIRMADA' });
  });

  it('solo en torneos ABIERTOS', async () => {
    const torneo = await crearTorneo(app, adminToken); // BORRADOR
    const prueba = await crearPrueba(app, adminToken, torneo.id);
    const ana = await nuevoAtleta();

    const res = await inscribir(ana.token, { pruebaId: prueba.id });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('TORNEO_NO_ABIERTO');
  });

  it('respeta el cupo de la prueba', async () => {
    const { prueba } = await torneoAbierto({ cupo: 1 });
    const a = await nuevoAtleta();
    const b = await nuevoAtleta();

    expect((await inscribir(a.token, { pruebaId: prueba.id })).status).toBe(201);
    const res = await inscribir(b.token, { pruebaId: prueba.id });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CUPO_LLENO');
  });

  it('sin categoría para su edad responde SIN_CATEGORIA con un mensaje claro', async () => {
    const { prueba } = await torneoAbierto();
    const hoy = fechaEnDias(0);
    const nino = await nuevoAtleta({ fechaNacimiento: `${Number(hoy.slice(0, 4)) - 14}${hoy.slice(4)}`, sexo: 'M' });

    const res = await inscribir(nino.token, { pruebaId: prueba.id });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('SIN_CATEGORIA');
    expect(res.body.error.message).toContain('14 años');
  });

  it('usa una categoría MIXTO cuando no hay una de su sexo', async () => {
    const torneo = await crearTorneo(app, adminToken);
    const prueba = await crearPrueba(app, adminToken, torneo.id);
    const open = await crearCategoria(app, adminToken, torneo.id, { nombre: 'Open', sexo: 'MIXTO', edadMin: 0, edadMax: 120 });
    await cambiarEstado(app, adminToken, torneo.id, 'ABIERTO');
    const pedro = await nuevoAtleta({ sexo: 'M' });

    const res = await inscribir(pedro.token, { pruebaId: prueba.id });
    expect(res.body.inscripcion.categoriaId).toBe(open.id);
  });

  it('un JUEZ no puede inscribir', async () => {
    const { prueba } = await torneoAbierto();
    expect((await inscribir(juezToken, { pruebaId: prueba.id, atletaId: 4 })).status).toBe(403);
  });

  it('prueba inexistente → 404', async () => {
    const ana = await nuevoAtleta();
    expect((await inscribir(ana.token, { pruebaId: 999999 })).status).toBe(404);
  });
});

describe('POST /api/inscripciones (admin)', () => {
  it('exige atletaId', async () => {
    const { prueba } = await torneoAbierto();
    const res = await inscribir(adminToken, { pruebaId: prueba.id });
    expect(res.status).toBe(400);
    expect(res.body.error.details[0].campo).toBe('atletaId');
  });

  it('inscripciones simultáneas reciben dorsales distintos y ninguna falla', async () => {
    const { prueba } = await torneoAbierto();
    const atletas = await Promise.all([1, 2, 3, 4, 5].map(() => nuevoAtleta()));

    const respuestas = await Promise.all(atletas.map((a) => inscribir(adminToken, { pruebaId: prueba.id, atletaId: a.id })));

    expect(respuestas.map((r) => r.status)).toEqual([201, 201, 201, 201, 201]);
    const dorsales = respuestas.map((r) => r.body.inscripcion.dorsal);
    expect(new Set(dorsales).size).toBe(5);
  });

  it('puede inscribir en un torneo EN_CURSO (inscripción tardía)', async () => {
    const { torneo, prueba } = await torneoAbierto();
    await cambiarEstado(app, adminToken, torneo.id, 'EN_CURSO');
    const ana = await nuevoAtleta();

    expect((await inscribir(adminToken, { pruebaId: prueba.id, atletaId: ana.id })).status).toBe(201);
  });
});

describe('PATCH /api/inscripciones/:id', () => {
  it('el ADMIN cambia el dorsal, pero no a uno ya usado', async () => {
    const { prueba } = await torneoAbierto();
    const a = await nuevoAtleta();
    const b = await nuevoAtleta();
    const ia = (await inscribir(a.token, { pruebaId: prueba.id })).body.inscripcion;
    const ib = (await inscribir(b.token, { pruebaId: prueba.id })).body.inscripcion;

    const ok = await request(app).patch(`/api/inscripciones/${ia.id}`).set(auth(adminToken)).send({ dorsal: 77 });
    expect(ok.status).toBe(200);
    expect(ok.body.inscripcion.dorsal).toBe(77);

    const repetido = await request(app).patch(`/api/inscripciones/${ib.id}`).set(auth(adminToken)).send({ dorsal: 77 });
    expect(repetido.status).toBe(409);
    expect(repetido.body.error.code).toBe('DORSAL_TAKEN');
  });

  it('un atleta no puede anular la inscripción de otro', async () => {
    const { prueba } = await torneoAbierto();
    const a = await nuevoAtleta();
    const b = await nuevoAtleta();
    const ia = (await inscribir(a.token, { pruebaId: prueba.id })).body.inscripcion;

    const res = await request(app).patch(`/api/inscripciones/${ia.id}`).set(auth(b.token)).send({ estado: 'ANULADA' });
    expect(res.status).toBe(403);
  });

  it('un atleta no puede cambiar su dorsal', async () => {
    const { prueba } = await torneoAbierto();
    const a = await nuevoAtleta();
    const ia = (await inscribir(a.token, { pruebaId: prueba.id })).body.inscripcion;

    const res = await request(app).patch(`/api/inscripciones/${ia.id}`).set(auth(a.token)).send({ dorsal: 5 });
    expect(res.status).toBe(403);
  });
});

describe('consultas de inscripciones', () => {
  it('ADMIN y JUEZ listan los inscritos de una prueba ordenados por dorsal', async () => {
    const res = await request(app).get('/api/inscripciones?pruebaId=5').set(auth(juezToken));

    expect(res.status).toBe(200);
    expect(res.body.map((i) => i.dorsal)).toEqual([301, 302, 303, 304, 305, 306]);
    expect(res.body[0]).toMatchObject({ atleta: 'Camila Torres', categoria: 'Adulto Femenino', resultado: null });
  });

  it('incluye el resultado cuando existe', async () => {
    const res = await request(app).get('/api/inscripciones?pruebaId=4').set(auth(adminToken));
    const conDns = res.body.find((i) => i.dorsal === 205);

    expect(conDns.resultado).toMatchObject({ estado: 'DNS', tiempoMs: null });
  });

  it('las anuladas no aparecen salvo que se pidan', async () => {
    const sin = await request(app).get('/api/inscripciones?pruebaId=6').set(auth(adminToken));
    expect(sin.body.map((i) => i.dorsal)).not.toContain(405);

    const con = await request(app).get('/api/inscripciones?pruebaId=6&incluirAnuladas=1').set(auth(adminToken));
    expect(con.body.map((i) => i.dorsal)).toContain(405);
  });

  it('un atleta no puede listar inscritos de otros', async () => {
    const a = await nuevoAtleta();
    expect((await request(app).get('/api/inscripciones?pruebaId=5').set(auth(a.token))).status).toBe(403);
  });

  it('el atleta ve sus propias inscripciones', async () => {
    const { prueba } = await torneoAbierto();
    const a = await nuevoAtleta();
    await inscribir(a.token, { pruebaId: prueba.id });

    const res = await request(app).get('/api/inscripciones/mias').set(auth(a.token));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].pruebaId).toBe(prueba.id);
  });
});

describe('documentación OpenAPI', () => {
  it('incluye atletas, inscripciones y activación de usuarios', async () => {
    const res = await request(app).get('/api/docs/openapi.json');

    expect(Object.keys(res.body.paths)).toEqual(
      expect.arrayContaining([
        '/api/atletas',
        '/api/atletas/me',
        '/api/atletas/{id}',
        '/api/inscripciones',
        '/api/inscripciones/mias',
        '/api/inscripciones/{id}',
        '/api/usuarios/{id}/activo',
      ]),
    );
  });
});

describe('Revisión final: datos fuera de rango o con forma inválida', () => {
  it('un dorsal enviado como arreglo responde 400 (no 500)', async () => {
    const { prueba } = await torneoAbierto();
    const ana = await nuevoAtleta();
    const { body } = await inscribir(ana.token, { pruebaId: prueba.id });

    const res = await request(app)
      .patch(`/api/inscripciones/${body.inscripcion.id}`)
      .set(auth(adminToken))
      .send({ dorsal: [7] });

    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d) => d.campo)).toContain('dorsal');
  });

  it('el dorsal máximo es 9999 y la inscripción siguiente sigue funcionando', async () => {
    const { prueba } = await torneoAbierto();
    const ana = await nuevoAtleta();
    const { body } = await inscribir(ana.token, { pruebaId: prueba.id });
    const patch = (dorsal) =>
      request(app).patch(`/api/inscripciones/${body.inscripcion.id}`).set(auth(adminToken)).send({ dorsal });

    expect((await patch(65535)).status).toBe(400);
    expect((await patch(9999)).status).toBe(200);

    const bea = await nuevoAtleta();
    const res = await inscribir(bea.token, { pruebaId: prueba.id });
    expect(res.status).toBe(201);
    expect(res.body.inscripcion.dorsal).toBe(10000);
  });
});
