// Consultas públicas de torneos.
import { query } from '../../db/pool.js';

/** Torneos que no han terminado y ya fueron publicados (no BORRADOR). Máximo 6. */
export async function listProximos() {
  const filas = await query(`
    SELECT t.id, t.nombre, t.descripcion, t.sede, t.fecha_inicio, t.fecha_fin, t.estado,
           COUNT(DISTINCT p.id) AS pruebas,
           GROUP_CONCAT(DISTINCT d.nombre ORDER BY d.nombre SEPARATOR '|') AS deportes
    FROM torneos t
    LEFT JOIN pruebas p  ON p.torneo_id = t.id
    LEFT JOIN deportes d ON d.id = p.deporte_id
    WHERE t.fecha_fin >= CURDATE() AND t.estado <> 'BORRADOR'
    GROUP BY t.id, t.nombre, t.descripcion, t.sede, t.fecha_inicio, t.fecha_fin, t.estado
    ORDER BY t.fecha_inicio, t.id
    LIMIT 6`);

  return filas.map((f) => ({
    id: f.id,
    nombre: f.nombre,
    descripcion: f.descripcion,
    sede: f.sede,
    fechaInicio: f.fecha_inicio,
    fechaFin: f.fecha_fin,
    estado: f.estado,
    pruebas: Number(f.pruebas),
    deportes: f.deportes ? f.deportes.split('|') : [],
  }));
}
