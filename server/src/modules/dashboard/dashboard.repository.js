// Consultas del resumen del dashboard administrativo.
import { query } from '../../db/pool.js';
import { listUsuarios } from '../usuarios/usuarios.repository.js';

async function contadores() {
  const [fila] = await query(`
    SELECT
      (SELECT COUNT(*) FROM torneos WHERE estado IN ('ABIERTO', 'EN_CURSO'))            AS torneosActivos,
      (SELECT COUNT(*) FROM atletas)                                                    AS atletas,
      (SELECT COUNT(*) FROM inscripciones WHERE estado <> 'ANULADA')                    AS inscripciones,
      (SELECT COUNT(*) FROM pruebas WHERE fecha_hora >= NOW() AND estado <> 'CANCELADA') AS pruebasProximas`);
  return {
    torneosActivos: Number(fila.torneosActivos),
    atletas: Number(fila.atletas),
    inscripciones: Number(fila.inscripciones),
    pruebasProximas: Number(fila.pruebasProximas),
  };
}

async function proximasPruebas() {
  const filas = await query(`
    SELECT p.id, p.nombre, t.nombre AS torneo, d.nombre AS deporte, p.fecha_hora, p.cupo,
           COUNT(i.id) AS inscritos
    FROM pruebas p
    JOIN torneos t  ON t.id = p.torneo_id
    JOIN deportes d ON d.id = p.deporte_id
    LEFT JOIN inscripciones i ON i.prueba_id = p.id AND i.estado <> 'ANULADA'
    WHERE p.fecha_hora >= NOW() AND p.estado <> 'CANCELADA'
    GROUP BY p.id, p.nombre, t.nombre, d.nombre, p.fecha_hora, p.cupo
    ORDER BY p.fecha_hora
    LIMIT 5`);
  return filas.map((f) => ({
    id: f.id,
    nombre: f.nombre,
    torneo: f.torneo,
    deporte: f.deporte,
    fechaHora: f.fecha_hora,
    cupo: f.cupo,
    inscritos: Number(f.inscritos),
  }));
}

async function inscripcionesPorDeporte() {
  const filas = await query(`
    SELECT d.nombre AS deporte, COUNT(i.id) AS total
    FROM deportes d
    LEFT JOIN pruebas p       ON p.deporte_id = d.id
    LEFT JOIN inscripciones i ON i.prueba_id = p.id AND i.estado <> 'ANULADA'
    GROUP BY d.id, d.nombre
    ORDER BY total DESC, d.nombre`);
  return filas.map((f) => ({ deporte: f.deporte, total: Number(f.total) }));
}

export async function getResumen() {
  const [conteos, pruebas, porDeporte, recientes] = await Promise.all([
    contadores(),
    proximasPruebas(),
    inscripcionesPorDeporte(),
    listUsuarios({ page: 1, limit: 5 }),
  ]);
  return {
    ...conteos,
    proximasPruebas: pruebas,
    inscripcionesPorDeporte: porDeporte,
    usuariosRecientes: recientes.data,
  };
}
