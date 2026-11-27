import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { closePool, query } from '../src/db/pool.js';
import {
  ADMIN,
  ATLETA,
  JUEZ,
  cambiarEstado,
  crearCategoria,
  crearPrueba,
  crearTorneo,
  datosRegistro,
  loginAs,
} from './helpers.js';

const app = createApp();
let adminToken;
let juezToken;
let atletaToken;
const auth = (token) => ({ Authorization: `Bearer ${token}` });

/** Registra un atleta nuevo y devuelve { id, token }. */
async function nuevoAtleta(overrides) {
  const res = await request(app).post('/api/auth/register').send(datosRegistro(overrides));
  if (res.status !== 201) throw new Error(JSON.stringify(res.body));
  return { id: res.body.usuario.id, token: res.body.token };
}

/**
 * Torneo propio EN_CURSO con 1 prueba, 2 categorías y 4 atletas inscritos
 * (ana y bea en Adulto F; carlos y diego en Adulto M).
 */
async function torneoEnCurso() {
  const torneo = await crearTorneo(app, adminToken);
  const prueba = await crearPrueba(app, adminToken, torneo.id);
  const adultoF = await crearCategoria(app, adminToken, torneo.id, { nombre: 'Adulto F', sexo: 'F', edadMin: 20, edadMax: 39 });
  const adultoM = await crearCategoria(app, adminToken, torneo.id, { nombre: 'Adulto M', sexo: 'M', edadMin: 20, edadMax: 39 });
  await cambiarEstado(app, adminToken, torneo.id, 'ABIERTO');

  const atletas = {
    ana: await nuevoAtleta({ nombre: 'Ana', sexo: 'F', fechaNacimiento: '2000-01-01' }),
    bea: await nuevoAtleta({ nombre: 'Bea', sexo: 'F', fechaNacimiento: '1995-01-01' }),
    carlos: await nuevoAtleta({ nombre: 'Carlos', sexo: 'M', fechaNacimiento: '1998-01-01' }),
    diego: await nuevoAtleta({ nombre: 'Diego', sexo: 'M', fechaNacimiento: '1990-01-01' }),
  };
  const ins = {};
  for (const [nombre, atleta] of Object.entries(atletas)) {
    const res = await request(app).post('/api/inscripciones').set(auth(atleta.token)).send({ pruebaId: prueba.id });
    if (res.status !== 201) throw new Error(JSON.stringify(res.body));
    ins[nombre] = res.body.inscripcion;
  }
  await cambiarEstado(app, adminToken, torneo.id, 'EN_CURSO');
  return { torneo, prueba, adultoF, adultoM, atletas, ins };
}

const guardar = (token, inscripcionId, body) =>
  request(app).put(`/api/inscripciones/${inscripcionId}/resultado`).set(auth(token)).send(body);

const resultados = (pruebaId) => request(app).get(`/api/pruebas/${pruebaId}/resultados`);

beforeAll(async () => {
  adminToken = await loginAs(app, ADMIN.email, ADMIN.password);
  juezToken = await loginAs(app, JUEZ.email, JUEZ.password);
  atletaToken = await loginAs(app, ATLETA.email, ATLETA.password);
});

afterAll(async () => {
  await closePool();
});

describe('PUT /api/inscripciones/:id/resultado', () => {
  it('el juez registra un tiempo FINALIZADO', async () => {
    const { ins, prueba } = await torneoEnCurso();

    const res = await guardar(juezToken, ins.ana.id, { estado: 'FINALIZADO', tiempoMs: 754000 });

    expect(res.status).toBe(200);
    expect(res.body.resultado).toMatchObject({
      inscripcionId: ins.ana.id,
      pruebaId: prueba.id,
      estado: 'FINALIZADO',
      tiempoMs: 754000,
      observaciones: null,
      registradoEn: expect.any(String),
      registradoPor: expect.any(Number),
    });
  });

  it('volver a guardar corrige el tiempo (sigue habiendo un solo resultado)', async () => {
    const { ins } = await torneoEnCurso();
    await guardar(juezToken, ins.ana.id, { estado: 'FINALIZADO', tiempoMs: 754000 });

    const res = await guardar(juezToken, ins.ana.id, { estado: 'FINALIZADO', tiempoMs: 701500, observaciones: 'Corregido' });

    expect(res.status).toBe(200);
    expect(res.body.resultado).toMatchObject({ tiempoMs: 701500, observaciones: 'Corregido' });
    const [{ n }] = await query('SELECT COUNT(*) AS n FROM resultados WHERE inscripcion_id = ?', [ins.ana.id]);
    expect(Number(n)).toBe(1);
  });

  it('guarda DNF sin tiempo', async () => {
    const { ins } = await torneoEnCurso();
    const res = await guardar(juezToken, ins.bea.id, { estado: 'DNF', tiempoMs: null });
    expect(res.status).toBe(200);
    expect(res.body.resultado).toMatchObject({ estado: 'DNF', tiempoMs: null });
  });

  it.each([
    ['FINALIZADO sin tiempo', { estado: 'FINALIZADO' }, 'tiempoMs'],
    ['DNF con tiempo', { estado: 'DNF', tiempoMs: 60000 }, 'tiempoMs'],
    ['tiempo 0', { estado: 'FINALIZADO', tiempoMs: 0 }, 'tiempoMs'],
    ['tiempo mayor a 24 h', { estado: 'FINALIZADO', tiempoMs: 86400001 }, 'tiempoMs'],
    ['tiempo con texto', { estado: 'FINALIZADO', tiempoMs: 'abc' }, 'tiempoMs'],
    ['estado desconocido', { estado: 'GANADOR', tiempoMs: 1000 }, 'estado'],
    ['observaciones largas', { estado: 'DSQ', observaciones: 'x'.repeat(256) }, 'observaciones'],
    ['estado como arreglo', { estado: ['DNF'] }, 'estado'],
    ['tiempo como arreglo', { estado: 'FINALIZADO', tiempoMs: [60000] }, 'tiempoMs'],
    ['observaciones como objeto', { estado: 'DSQ', observaciones: { a: 1 } }, 'observaciones'],
  ])('rechaza %s con 400', async (_nombre, body, campo) => {
    const { ins } = await torneoEnCurso();
    const res = await guardar(juezToken, ins.ana.id, body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.map((d) => d.campo)).toContain(campo);
  });

  it('un ATLETA no puede registrar tiempos (403) y sin sesión es 401', async () => {
    const { ins, atletas } = await torneoEnCurso();
    expect((await guardar(atletas.ana.token, ins.ana.id, { estado: 'FINALIZADO', tiempoMs: 1000 })).status).toBe(403);
    const anon = await request(app).put(`/api/inscripciones/${ins.ana.id}/resultado`).send({ estado: 'DNS' });
    expect(anon.status).toBe(401);
  });

  it('una inscripción inexistente responde 404', async () => {
    const res = await guardar(juezToken, 99999999, { estado: 'DNS' });
    expect(res.status).toBe(404);
  });

  it('rechaza con 409 si el torneo no está EN_CURSO', async () => {
    const torneo = await crearTorneo(app, adminToken);
    const prueba = await crearPrueba(app, adminToken, torneo.id);
    await crearCategoria(app, adminToken, torneo.id, { nombre: 'Adulto F', sexo: 'F', edadMin: 20, edadMax: 39 });
    await cambiarEstado(app, adminToken, torneo.id, 'ABIERTO');
    const ana = await nuevoAtleta({ sexo: 'F', fechaNacimiento: '2000-01-01' });
    const insc = await request(app).post('/api/inscripciones').set(auth(ana.token)).send({ pruebaId: prueba.id });

    const res = await guardar(juezToken, insc.body.inscripcion.id, { estado: 'FINALIZADO', tiempoMs: 1000 });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('RESULTADO_NO_PERMITIDO');
  });

  it('rechaza con 409 una inscripción ANULADA', async () => {
    const { ins } = await torneoEnCurso();
    await request(app).patch(`/api/inscripciones/${ins.ana.id}`).set(auth(adminToken)).send({ estado: 'ANULADA' });

    const res = await guardar(juezToken, ins.ana.id, { estado: 'FINALIZADO', tiempoMs: 1000 });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('RESULTADO_NO_PERMITIDO');
  });

  it('rechaza con 409 una prueba CANCELADA', async () => {
    const { ins, prueba } = await torneoEnCurso();
    await request(app).patch(`/api/pruebas/${prueba.id}/estado`).set(auth(adminToken)).send({ estado: 'CANCELADA' });

    const res = await guardar(juezToken, ins.ana.id, { estado: 'FINALIZADO', tiempoMs: 1000 });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('RESULTADO_NO_PERMITIDO');
  });

  it('con el torneo FINALIZADO solo el ADMIN puede corregir', async () => {
    const { ins, torneo } = await torneoEnCurso();
    await cambiarEstado(app, adminToken, torneo.id, 'FINALIZADO');

    const juez = await guardar(juezToken, ins.ana.id, { estado: 'FINALIZADO', tiempoMs: 1000 });
    expect(juez.status).toBe(409);
    expect(juez.body.error.code).toBe('RESULTADO_NO_PERMITIDO');

    const admin = await guardar(adminToken, ins.ana.id, { estado: 'FINALIZADO', tiempoMs: 1000 });
    expect(admin.status).toBe(200);
  });
});

describe('DELETE /api/inscripciones/:id/resultado', () => {
  it('el ADMIN borra un resultado (204) y el juez no puede (403)', async () => {
    const { ins } = await torneoEnCurso();
    await guardar(juezToken, ins.ana.id, { estado: 'FINALIZADO', tiempoMs: 1000 });

    const juez = await request(app).delete(`/api/inscripciones/${ins.ana.id}/resultado`).set(auth(juezToken));
    expect(juez.status).toBe(403);

    const res = await request(app).delete(`/api/inscripciones/${ins.ana.id}/resultado`).set(auth(adminToken));
    expect(res.status).toBe(204);
    const [{ n }] = await query('SELECT COUNT(*) AS n FROM resultados WHERE inscripcion_id = ?', [ins.ana.id]);
    expect(Number(n)).toBe(0);
  });

  it('borrar un resultado que no existe responde 404', async () => {
    const { ins } = await torneoEnCurso();
    const res = await request(app).delete(`/api/inscripciones/${ins.ana.id}/resultado`).set(auth(adminToken));
    expect(res.status).toBe(404);
  });
});

describe('GET /api/pruebas/:id/resultados', () => {
  it('devuelve la prueba, las categorías (aunque estén vacías) y la general', async () => {
    const { prueba, torneo, adultoF, adultoM, ins } = await torneoEnCurso();
    await guardar(juezToken, ins.ana.id, { estado: 'FINALIZADO', tiempoMs: 65000 });

    const res = await resultados(prueba.id);

    expect(res.status).toBe(200);
    expect(res.body.prueba).toMatchObject({
      id: prueba.id,
      nombre: '100 m libre',
      distanciaM: 100,
      estado: 'PROGRAMADA',
      deporte: expect.any(String),
      torneo: { id: torneo.id, nombre: torneo.nombre, estado: 'EN_CURSO' },
    });
    expect(res.body.categorias).toEqual([
      expect.objectContaining({ id: adultoF.id, nombre: 'Adulto F', sexo: 'F', clasificacion: [expect.objectContaining({ inscripcionId: ins.ana.id })] }),
      expect.objectContaining({ id: adultoM.id, nombre: 'Adulto M', sexo: 'M', clasificacion: [] }),
    ]);
    expect(res.body.general).toHaveLength(1);
    expect(res.body.general[0]).toEqual({
      inscripcionId: ins.ana.id,
      dorsal: ins.ana.dorsal,
      atletaId: ins.ana.atletaId,
      atleta: expect.stringContaining('Ana'),
      club: 'Club Test',
      categoriaId: adultoF.id,
      categoria: 'Adulto F',
      estado: 'FINALIZADO',
      tiempoMs: 65000,
      posicion: 1,
    });
    expect(Date.parse(res.body.actualizadoEn)).not.toBeNaN();
  });

  it('empates comparten posición, el siguiente salta y los DNF van al final sin posición', async () => {
    const { prueba, ins, adultoF } = await torneoEnCurso();
    await guardar(juezToken, ins.ana.id, { estado: 'DNF' });
    await guardar(juezToken, ins.bea.id, { estado: 'FINALIZADO', tiempoMs: 600000 });
    await guardar(juezToken, ins.carlos.id, { estado: 'FINALIZADO', tiempoMs: 600000 });
    await guardar(juezToken, ins.diego.id, { estado: 'FINALIZADO', tiempoMs: 610000 });

    const { body } = await resultados(prueba.id);

    expect(body.general.map((f) => [f.inscripcionId, f.posicion])).toEqual([
      [expect.any(Number), 1],
      [expect.any(Number), 1],
      [ins.diego.id, 3],
      [ins.ana.id, null],
    ]);
    const femenino = body.categorias.find((c) => c.id === adultoF.id).clasificacion;
    expect(femenino.map((f) => [f.inscripcionId, f.estado, f.posicion])).toEqual([
      [ins.bea.id, 'FINALIZADO', 1],
      [ins.ana.id, 'DNF', null],
    ]);
  });

  it('la general mezcla las categorías ordenadas por tiempo', async () => {
    const { prueba, ins } = await torneoEnCurso();
    await guardar(juezToken, ins.ana.id, { estado: 'FINALIZADO', tiempoMs: 70000 });
    await guardar(juezToken, ins.carlos.id, { estado: 'FINALIZADO', tiempoMs: 60000 });
    await guardar(juezToken, ins.bea.id, { estado: 'FINALIZADO', tiempoMs: 65000 });

    const { body } = await resultados(prueba.id);

    expect(body.general.map((f) => f.inscripcionId)).toEqual([ins.carlos.id, ins.bea.id, ins.ana.id]);
    expect(body.general.map((f) => f.posicion)).toEqual([1, 2, 3]);
  });

  it('las inscripciones ANULADA no aparecen', async () => {
    const { prueba, ins } = await torneoEnCurso();
    await guardar(juezToken, ins.ana.id, { estado: 'FINALIZADO', tiempoMs: 70000 });
    await request(app).patch(`/api/inscripciones/${ins.ana.id}`).set(auth(adminToken)).send({ estado: 'ANULADA' });

    const { body } = await resultados(prueba.id);
    expect(body.general).toEqual([]);
  });

  it('en la prueba 7 del seed (50 m libre) el DSQ va al final', async () => {
    const { body, status } = await resultados(7);
    expect(status).toBe(200);
    expect(body.prueba.nombre).toBe('50 m libre');
    const ultima = body.general.at(-1);
    expect(ultima).toMatchObject({ estado: 'DSQ', tiempoMs: null, posicion: null });
    expect(body.general[0].posicion).toBe(1);
  });

  it('404 si la prueba no existe o su torneo está en BORRADOR', async () => {
    expect((await resultados(99999999)).status).toBe(404);
    expect((await resultados('abc')).status).toBe(404);

    const torneo = await crearTorneo(app, adminToken);
    const prueba = await crearPrueba(app, adminToken, torneo.id);
    expect((await resultados(prueba.id)).status).toBe(404);
  });
});

describe('GET /api/resultados/mios', () => {
  it('devuelve los resultados del atleta con su posición en la categoría y en la general', async () => {
    const { prueba, torneo, ins, atletas } = await torneoEnCurso();
    await guardar(juezToken, ins.carlos.id, { estado: 'FINALIZADO', tiempoMs: 60000 });
    await guardar(juezToken, ins.ana.id, { estado: 'FINALIZADO', tiempoMs: 70000 });
    await guardar(juezToken, ins.bea.id, { estado: 'FINALIZADO', tiempoMs: 65000 });

    const res = await request(app).get('/api/resultados/mios').set(auth(atletas.ana.token));

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        inscripcionId: ins.ana.id,
        pruebaId: prueba.id,
        prueba: '100 m libre',
        pruebaFechaHora: expect.any(String),
        torneoId: torneo.id,
        torneo: torneo.nombre,
        categoria: 'Adulto F',
        dorsal: ins.ana.dorsal,
        estado: 'FINALIZADO',
        tiempoMs: 70000,
        posicionCategoria: 2,
        posicionGeneral: 3,
      },
    ]);
  });

  it('solo para atletas', async () => {
    expect((await request(app).get('/api/resultados/mios').set(auth(juezToken))).status).toBe(403);
    expect((await request(app).get('/api/resultados/mios').set(auth(atletaToken))).status).toBe(200);
  });
});
