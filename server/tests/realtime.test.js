import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import request from 'supertest';
import { io as conectar } from 'socket.io-client';
import { createApp } from '../src/app.js';
import { closePool } from '../src/db/pool.js';
import { cerrarRealtime, iniciarRealtime } from '../src/realtime.js';
import {
  ADMIN,
  JUEZ,
  cambiarEstado,
  crearCategoria,
  crearPrueba,
  crearTorneo,
  datosRegistro,
  loginAs,
} from './helpers.js';

const app = createApp();
const server = http.createServer(app);
let url;
let adminToken;
let juezToken;
const clientes = [];
const auth = (token) => ({ Authorization: `Bearer ${token}` });

/** Prueba de un torneo EN_CURSO con una atleta inscrita; devuelve { pruebaId, inscripcionId }. */
async function pruebaEnCurso() {
  const torneo = await crearTorneo(app, adminToken);
  const prueba = await crearPrueba(app, adminToken, torneo.id);
  await crearCategoria(app, adminToken, torneo.id, { nombre: 'Adulto F', sexo: 'F', edadMin: 20, edadMax: 39 });
  await cambiarEstado(app, adminToken, torneo.id, 'ABIERTO');
  const reg = await request(app).post('/api/auth/register').send(datosRegistro({ sexo: 'F', fechaNacimiento: '2000-01-01' }));
  const ins = await request(app).post('/api/inscripciones').set(auth(reg.body.token)).send({ pruebaId: prueba.id });
  await cambiarEstado(app, adminToken, torneo.id, 'EN_CURSO');
  return { pruebaId: prueba.id, inscripcionId: ins.body.inscripcion.id };
}

/** Conecta un cliente Socket.IO y espera a que siga la prueba indicada. */
async function seguir(pruebaId) {
  const socket = conectar(url, { transports: ['websocket'], forceNew: true });
  clientes.push(socket);
  const respuesta = await socket.timeout(5000).emitWithAck('prueba:seguir', pruebaId);
  return { socket, respuesta };
}

/** Promesa del próximo `resultados:actualizados` (o null si no llega en `ms`). */
function proximoEvento(socket, ms) {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), ms);
    socket.once('resultados:actualizados', (datos) => {
      clearTimeout(t);
      resolve(datos);
    });
  });
}

beforeAll(async () => {
  iniciarRealtime(server);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  url = `http://127.0.0.1:${server.address().port}`;
  adminToken = await loginAs(app, ADMIN.email, ADMIN.password);
  juezToken = await loginAs(app, JUEZ.email, JUEZ.password);
});

afterAll(async () => {
  for (const c of clientes) c.disconnect();
  await cerrarRealtime();
  await closePool();
});

describe('Socket.IO: resultados en vivo', () => {
  it('quien sigue la prueba recibe la clasificación al guardar un tiempo; quien sigue otra, no', async () => {
    const { pruebaId, inscripcionId } = await pruebaEnCurso();
    const otra = await pruebaEnCurso();
    const { socket: espectador, respuesta } = await seguir(pruebaId);
    const { socket: ajeno } = await seguir(otra.pruebaId);
    expect(respuesta).toEqual({ ok: true });

    const llega = proximoEvento(espectador, 5000);
    const noLlega = proximoEvento(ajeno, 800);
    const res = await request(server)
      .put(`/api/inscripciones/${inscripcionId}/resultado`)
      .set(auth(juezToken))
      .send({ estado: 'FINALIZADO', tiempoMs: 61230 });
    expect(res.status).toBe(200);

    const datos = await llega;
    expect(datos.prueba.id).toBe(pruebaId);
    expect(datos.general[0]).toMatchObject({ inscripcionId, tiempoMs: 61230, posicion: 1 });
    expect(await noLlega).toBeNull();
  });

  it('después de prueba:dejar ya no recibe eventos', async () => {
    const { pruebaId, inscripcionId } = await pruebaEnCurso();
    const { socket } = await seguir(pruebaId);
    await socket.timeout(5000).emitWithAck('prueba:dejar', pruebaId);

    const noLlega = proximoEvento(socket, 800);
    await request(server).put(`/api/inscripciones/${inscripcionId}/resultado`).set(auth(juezToken)).send({ estado: 'DNS' });

    expect(await noLlega).toBeNull();
  });

  it('rechaza ids que no son enteros positivos', async () => {
    const { respuesta } = await seguir('1; DROP TABLE');
    expect(respuesta).toEqual({ ok: false });
  });
});
