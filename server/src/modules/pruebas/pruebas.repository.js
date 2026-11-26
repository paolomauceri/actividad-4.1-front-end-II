// Acceso a datos de pruebas (competencias dentro de un torneo).
import { query } from '../../db/pool.js';

const SELECT_PRUEBA = `
  SELECT p.id, p.torneo_id, p.deporte_id, d.nombre AS deporte, p.nombre, p.distancia_m,
         p.fecha_hora, p.cupo, p.estado,
         (SELECT COUNT(*) FROM inscripciones i WHERE i.prueba_id = p.id AND i.estado <> 'ANULADA') AS inscritos
  FROM pruebas p
  JOIN deportes d ON d.id = p.deporte_id`;

export function toPrueba(f) {
  return {
    id: f.id,
    torneoId: f.torneo_id,
    deporteId: f.deporte_id,
    deporte: f.deporte,
    nombre: f.nombre,
    distanciaM: f.distancia_m,
    fechaHora: f.fecha_hora,
    cupo: f.cupo ?? null,
    estado: f.estado,
    inscritos: Number(f.inscritos),
  };
}

/** Pruebas de un torneo ordenadas por fecha y hora. */
export async function listPruebasDeTorneo(torneoId) {
  const filas = await query(`${SELECT_PRUEBA} WHERE p.torneo_id = ? ORDER BY p.fecha_hora, p.id`, [torneoId]);
  return filas.map(toPrueba);
}

/** Prueba por id (o null). */
export async function findPrueba(id) {
  const [fila] = await query(`${SELECT_PRUEBA} WHERE p.id = ?`, [id]);
  return fila ? toPrueba(fila) : null;
}

export async function insertPrueba(torneoId, { deporteId, nombre, distanciaM, fechaHora, cupo }) {
  const res = await query(
    `INSERT INTO pruebas (torneo_id, deporte_id, nombre, distancia_m, fecha_hora, cupo)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [torneoId, deporteId, nombre, distanciaM, fechaHora, cupo ?? null],
  );
  return res.insertId;
}

export async function updatePrueba(id, { deporteId, nombre, distanciaM, fechaHora, cupo }) {
  await query(
    'UPDATE pruebas SET deporte_id = ?, nombre = ?, distancia_m = ?, fecha_hora = ?, cupo = ? WHERE id = ?',
    [deporteId, nombre, distanciaM, fechaHora, cupo ?? null, id],
  );
}

export async function updateEstadoPrueba(id, estado) {
  await query('UPDATE pruebas SET estado = ? WHERE id = ?', [estado, id]);
}

export async function deletePrueba(id) {
  await query('DELETE FROM pruebas WHERE id = ?', [id]);
}

/** Inscripciones de la prueba en cualquier estado (las ANULADA también bloquean el borrado). */
export async function countInscripcionesPrueba(id) {
  const [{ n }] = await query('SELECT COUNT(*) AS n FROM inscripciones WHERE prueba_id = ?', [id]);
  return Number(n);
}

export async function existeDeporte(id) {
  const filas = await query('SELECT 1 FROM deportes WHERE id = ?', [id]);
  return filas.length > 0;
}
