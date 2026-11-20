import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { closePool, query } from '../src/db/pool.js';
import { loginAs, ADMIN, JUEZ } from './helpers.js';

const app = createApp();
let adminToken;
let juezToken;

const contar = async (sql) => Number((await query(sql))[0].n);

beforeAll(async () => {
  adminToken = await loginAs(app, ADMIN.email, ADMIN.password);
  juezToken = await loginAs(app, JUEZ.email, JUEZ.password);
});

afterAll(async () => {
  await closePool();
});

describe('GET /api/dashboard/resumen', () => {
  it('responde 401 sin sesión y 403 a un JUEZ', async () => {
    expect((await request(app).get('/api/dashboard/resumen')).status).toBe(401);

    const res = await request(app).get('/api/dashboard/resumen').set('Authorization', `Bearer ${juezToken}`);
    expect(res.status).toBe(403);
  });

  it('devuelve los conteos que coinciden con la base de datos', async () => {
    const res = await request(app).get('/api/dashboard/resumen').set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.torneosActivos).toBe(
      await contar("SELECT COUNT(*) AS n FROM torneos WHERE estado IN ('ABIERTO','EN_CURSO')"),
    );
    expect(res.body.atletas).toBe(await contar('SELECT COUNT(*) AS n FROM atletas'));
    expect(res.body.inscripciones).toBe(
      await contar("SELECT COUNT(*) AS n FROM inscripciones WHERE estado <> 'ANULADA'"),
    );
    expect(res.body.pruebasProximas).toBe(
      await contar("SELECT COUNT(*) AS n FROM pruebas WHERE fecha_hora >= NOW() AND estado <> 'CANCELADA'"),
    );
  });

  it('lista hasta 5 próximas pruebas ordenadas por fecha, con inscritos y cupo', async () => {
    const res = await request(app).get('/api/dashboard/resumen').set('Authorization', `Bearer ${adminToken}`);
    const { proximasPruebas } = res.body;

    expect(proximasPruebas.length).toBeGreaterThan(0);
    expect(proximasPruebas.length).toBeLessThanOrEqual(5);
    expect(proximasPruebas[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        nombre: expect.any(String),
        torneo: expect.any(String),
        deporte: expect.any(String),
        fechaHora: expect.any(String),
        inscritos: expect.any(Number),
      }),
    );
    const fechas = proximasPruebas.map((p) => p.fechaHora);
    expect([...fechas].sort()).toEqual(fechas);
  });

  it('cuenta los inscritos sin incluir inscripciones anuladas', async () => {
    const res = await request(app).get('/api/dashboard/resumen').set('Authorization', `Bearer ${adminToken}`);
    const prueba10k = res.body.proximasPruebas.find((p) => p.nombre === 'Atletismo 10 km');

    // Seed: 5 inscripciones en la prueba 6, una de ellas ANULADA
    if (prueba10k) expect(prueba10k.inscritos).toBe(4);
  });

  it('incluye los 5 deportes en inscripcionesPorDeporte, aunque tengan 0', async () => {
    const res = await request(app).get('/api/dashboard/resumen').set('Authorization', `Bearer ${adminToken}`);
    const porDeporte = res.body.inscripcionesPorDeporte;

    expect(porDeporte.map((d) => d.deporte).sort()).toEqual(
      ['Acuatlón', 'Aguas abiertas', 'Atletismo', 'Natación', 'Triatlón'].sort(),
    );
    const total = porDeporte.reduce((s, d) => s + d.total, 0);
    expect(total).toBe(res.body.inscripciones);
  });

  it('incluye hasta 5 usuarios recientes sin datos sensibles', async () => {
    const res = await request(app).get('/api/dashboard/resumen').set('Authorization', `Bearer ${adminToken}`);

    expect(res.body.usuariosRecientes.length).toBeLessThanOrEqual(5);
    expect(res.body.usuariosRecientes.length).toBeGreaterThan(0);
    expect(JSON.stringify(res.body)).not.toContain('password');
  });
});

describe('Documentación OpenAPI del dashboard y torneos', () => {
  it('incluye /api/dashboard/resumen y /api/torneos/proximos', async () => {
    const res = await request(app).get('/api/docs/openapi.json');

    expect(Object.keys(res.body.paths)).toEqual(
      expect.arrayContaining(['/api/dashboard/resumen', '/api/torneos/proximos']),
    );
  });
});

describe('GET /api/torneos/proximos', () => {
  it('es público y no incluye torneos finalizados ni en borrador', async () => {
    const res = await request(app).get('/api/torneos/proximos');

    expect(res.status).toBe(200);
    const nombres = res.body.map((t) => t.nombre);
    expect(nombres).toContain('Copa Aguas Abiertas Lago Azul 2026');
    expect(nombres).not.toContain('Interclubes de Natación Otoño 2026'); // FINALIZADO
    expect(nombres).not.toContain('Media Maratón Ciudad 2027'); // BORRADOR
  });

  it('devuelve fechas, sede, estado, cantidad de pruebas y la lista de deportes', async () => {
    const res = await request(app).get('/api/torneos/proximos');
    const lagoAzul = res.body.find((t) => t.nombre === 'Copa Aguas Abiertas Lago Azul 2026');

    expect(lagoAzul).toEqual({
      id: 1,
      nombre: 'Copa Aguas Abiertas Lago Azul 2026',
      descripcion: expect.any(String),
      sede: 'Lago Azul, Playa Norte',
      fechaInicio: '2026-12-12',
      fechaFin: '2026-12-13',
      estado: 'ABIERTO',
      pruebas: 3,
      deportes: ['Acuatlón', 'Aguas abiertas'],
    });
  });

  it('ordena por fecha de inicio y devuelve como máximo 6', async () => {
    const res = await request(app).get('/api/torneos/proximos');
    const fechas = res.body.map((t) => t.fechaInicio);

    expect(res.body.length).toBeLessThanOrEqual(6);
    expect([...fechas].sort()).toEqual(fechas);
  });
});
