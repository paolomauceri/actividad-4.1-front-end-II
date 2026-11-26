// Acceso a datos de torneos.
import { query } from '../../db/pool.js';

/** Próximos torneos para la página de inicio: no terminados y publicados (no BORRADOR). Máximo 6. */
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

// Columnas de TorneoResumen. Los conteos usan subconsultas para no multiplicar filas.
const SELECT_RESUMEN = `
  SELECT t.id, t.nombre, t.descripcion, t.sede, t.fecha_inicio, t.fecha_fin, t.estado,
         (SELECT COUNT(*) FROM pruebas p WHERE p.torneo_id = t.id) AS total_pruebas,
         (SELECT COUNT(*) FROM inscripciones i JOIN pruebas p ON p.id = i.prueba_id
           WHERE p.torneo_id = t.id AND i.estado <> 'ANULADA') AS total_inscritos,
         (SELECT GROUP_CONCAT(DISTINCT d.nombre ORDER BY d.nombre SEPARATOR '|')
            FROM pruebas p JOIN deportes d ON d.id = p.deporte_id
           WHERE p.torneo_id = t.id) AS deportes
  FROM torneos t`;

function toTorneoResumen(f) {
  return {
    id: f.id,
    nombre: f.nombre,
    descripcion: f.descripcion,
    sede: f.sede,
    fechaInicio: f.fecha_inicio,
    fechaFin: f.fecha_fin,
    estado: f.estado,
    totalPruebas: Number(f.total_pruebas),
    totalInscritos: Number(f.total_inscritos),
    deportes: f.deportes ? f.deportes.split('|') : [],
  };
}

/**
 * Lista paginada de torneos, del más reciente al más antiguo.
 * @param {{ page: number, limit: number, estado?: string, incluirBorradores: boolean }} opciones
 */
export async function listTorneos({ page, limit, estado, incluirBorradores }) {
  const condiciones = [];
  const params = [];
  if (!incluirBorradores) condiciones.push("t.estado <> 'BORRADOR'");
  if (estado) {
    condiciones.push('t.estado = ?');
    params.push(estado);
  }
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  // page y limit ya vienen acotados a enteros: es seguro interpolarlos
  const filas = await query(
    `${SELECT_RESUMEN} ${where} ORDER BY t.fecha_inicio DESC, t.id DESC LIMIT ${limit} OFFSET ${offset}`,
    params,
  );
  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM torneos t ${where}`, params);

  return { datos: filas.map(toTorneoResumen), total: Number(total), page, limit };
}

/** TorneoResumen por id, o null. */
export async function findTorneo(id) {
  const [fila] = await query(`${SELECT_RESUMEN} WHERE t.id = ?`, [id]);
  return fila ? toTorneoResumen(fila) : null;
}

/** Crea un torneo en BORRADOR y devuelve su id. */
export async function insertTorneo({ nombre, descripcion, sede, fechaInicio, fechaFin }, creadoPor) {
  const res = await query(
    `INSERT INTO torneos (nombre, descripcion, sede, fecha_inicio, fecha_fin, estado, creado_por)
     VALUES (?, ?, ?, ?, ?, 'BORRADOR', ?)`,
    [nombre, descripcion ?? null, sede, fechaInicio, fechaFin, creadoPor],
  );
  return res.insertId;
}

export async function updateTorneo(id, { nombre, descripcion, sede, fechaInicio, fechaFin }) {
  await query(
    'UPDATE torneos SET nombre = ?, descripcion = ?, sede = ?, fecha_inicio = ?, fecha_fin = ? WHERE id = ?',
    [nombre, descripcion ?? null, sede, fechaInicio, fechaFin, id],
  );
}

export async function updateEstadoTorneo(id, estado) {
  await query('UPDATE torneos SET estado = ? WHERE id = ?', [estado, id]);
}

export async function deleteTorneo(id) {
  await query('DELETE FROM torneos WHERE id = ?', [id]);
}

/** Inscripciones del torneo; con `soloActivas` excluye las ANULADA. */
export async function countInscripciones(torneoId, { soloActivas = false } = {}) {
  const [{ n }] = await query(
    `SELECT COUNT(*) AS n FROM inscripciones i JOIN pruebas p ON p.id = i.prueba_id
     WHERE p.torneo_id = ? ${soloActivas ? "AND i.estado <> 'ANULADA'" : ''}`,
    [torneoId],
  );
  return Number(n);
}
