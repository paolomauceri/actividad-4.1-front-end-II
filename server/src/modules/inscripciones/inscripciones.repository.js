// Acceso a datos de inscripciones (atleta inscrito en una prueba, con categoría y dorsal).
import { query } from '../../db/pool.js';

const SELECT_INSCRIPCION = `
  SELECT i.id, i.prueba_id, p.nombre AS prueba, p.fecha_hora AS prueba_fecha_hora, d.nombre AS deporte,
         p.torneo_id, t.nombre AS torneo, t.estado AS torneo_estado,
         i.atleta_id, CONCAT(u.nombre, ' ', u.apellido) AS atleta, a.documento, a.club,
         i.categoria_id, c.nombre AS categoria, i.dorsal, i.estado, i.creado_en,
         r.estado AS resultado_estado, r.tiempo_ms, r.observaciones, r.registrado_en
  FROM inscripciones i
  JOIN pruebas p     ON p.id = i.prueba_id
  JOIN torneos t     ON t.id = p.torneo_id
  JOIN deportes d    ON d.id = p.deporte_id
  JOIN atletas a     ON a.usuario_id = i.atleta_id
  JOIN usuarios u    ON u.id = i.atleta_id
  JOIN categorias c  ON c.id = i.categoria_id
  LEFT JOIN resultados r ON r.inscripcion_id = i.id`;

export function toInscripcion(f) {
  return {
    id: f.id,
    pruebaId: f.prueba_id,
    prueba: f.prueba,
    pruebaFechaHora: f.prueba_fecha_hora,
    deporte: f.deporte,
    torneoId: f.torneo_id,
    torneo: f.torneo,
    torneoEstado: f.torneo_estado,
    atletaId: f.atleta_id,
    atleta: f.atleta,
    documento: f.documento,
    club: f.club,
    categoriaId: f.categoria_id,
    categoria: f.categoria,
    dorsal: f.dorsal,
    estado: f.estado,
    creadoEn: f.creado_en,
    resultado: f.resultado_estado
      ? {
          estado: f.resultado_estado,
          tiempoMs: f.tiempo_ms ?? null,
          observaciones: f.observaciones ?? null,
          registradoEn: f.registrado_en,
        }
      : null,
  };
}

/** Inscripción por id (o null). */
export async function findInscripcion(id) {
  const [fila] = await query(`${SELECT_INSCRIPCION} WHERE i.id = ?`, [id]);
  return fila ? toInscripcion(fila) : null;
}

/**
 * Inscripciones filtradas por prueba, torneo o atleta.
 * @param {{ pruebaId?: number, torneoId?: number, atletaId?: number, incluirAnuladas?: boolean }} filtros
 */
export async function listInscripciones({ pruebaId, torneoId, atletaId, incluirAnuladas = false }) {
  const condiciones = [];
  const params = [];
  if (pruebaId) {
    condiciones.push('i.prueba_id = ?');
    params.push(pruebaId);
  }
  if (torneoId) {
    condiciones.push('p.torneo_id = ?');
    params.push(torneoId);
  }
  if (atletaId) {
    condiciones.push('i.atleta_id = ?');
    params.push(atletaId);
  }
  if (!incluirAnuladas) condiciones.push("i.estado <> 'ANULADA'");
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  const orden = atletaId ? 'p.fecha_hora DESC, i.id' : 'p.fecha_hora, i.dorsal';

  const filas = await query(`${SELECT_INSCRIPCION} ${where} ORDER BY ${orden}`, params);
  return filas.map(toInscripcion);
}

/** Cambia dorsal y/o estado. */
export async function updateInscripcion(id, { dorsal, estado }) {
  if (dorsal !== undefined) await query('UPDATE inscripciones SET dorsal = ? WHERE id = ?', [dorsal, id]);
  if (estado !== undefined) await query('UPDATE inscripciones SET estado = ? WHERE id = ?', [estado, id]);
}
