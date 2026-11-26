// Acceso a datos de resultados (tiempo final de cada inscripción) y clasificaciones.
import { query } from '../../db/pool.js';
import { listCategoriasDeTorneo } from '../categorias/categorias.repository.js';

// Orden de la clasificación: los que terminaron por tiempo, luego DNF, DNS y DSQ.
const ORDEN_ESTADO = "FIELD(r.estado, 'FINALIZADO', 'DNF', 'DNS', 'DSQ')";

/** Datos de la inscripción necesarios para decidir si se puede registrar su resultado. */
export async function findContextoInscripcion(inscripcionId) {
  const [fila] = await query(
    `SELECT i.id, i.estado, i.prueba_id, p.estado AS prueba_estado, t.estado AS torneo_estado,
            r.id AS resultado_id
     FROM inscripciones i
     JOIN pruebas p ON p.id = i.prueba_id
     JOIN torneos t ON t.id = p.torneo_id
     LEFT JOIN resultados r ON r.inscripcion_id = i.id
     WHERE i.id = ?`,
    [inscripcionId],
  );
  if (!fila) return null;
  return {
    id: fila.id,
    estado: fila.estado,
    pruebaId: fila.prueba_id,
    pruebaEstado: fila.prueba_estado,
    torneoEstado: fila.torneo_estado,
    tieneResultado: fila.resultado_id != null,
  };
}

/** Crea o reemplaza el resultado de una inscripción (hay uno solo por inscripción). */
export async function upsertResultado(inscripcionId, { estado, tiempoMs, observaciones }, registradoPor) {
  await query(
    `INSERT INTO resultados (inscripcion_id, tiempo_ms, estado, registrado_por, observaciones)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       tiempo_ms = VALUES(tiempo_ms),
       estado = VALUES(estado),
       registrado_por = VALUES(registrado_por),
       observaciones = VALUES(observaciones),
       registrado_en = CURRENT_TIMESTAMP`,
    [inscripcionId, tiempoMs ?? null, estado, registradoPor, observaciones ?? null],
  );
}

export async function deleteResultado(inscripcionId) {
  await query('DELETE FROM resultados WHERE inscripcion_id = ?', [inscripcionId]);
}

/** Resultado guardado de una inscripción (o null). */
export async function findResultado(inscripcionId) {
  const [fila] = await query(
    `SELECT r.inscripcion_id, i.prueba_id, r.estado, r.tiempo_ms, r.observaciones, r.registrado_en, r.registrado_por
     FROM resultados r JOIN inscripciones i ON i.id = r.inscripcion_id
     WHERE r.inscripcion_id = ?`,
    [inscripcionId],
  );
  if (!fila) return null;
  return {
    inscripcionId: fila.inscripcion_id,
    pruebaId: fila.prueba_id,
    estado: fila.estado,
    tiempoMs: fila.tiempo_ms ?? null,
    observaciones: fila.observaciones ?? null,
    registradoEn: fila.registrado_en,
    registradoPor: fila.registrado_por,
  };
}

const posicionONull = (valor) => (valor == null ? null : Number(valor));

function toFila(f, posicion) {
  return {
    inscripcionId: f.inscripcion_id,
    dorsal: f.dorsal,
    atletaId: f.atleta_id,
    atleta: f.atleta,
    club: f.club ?? null,
    categoriaId: f.categoria_id,
    categoria: f.categoria,
    estado: f.estado,
    tiempoMs: f.tiempo_ms ?? null,
    posicion: posicionONull(posicion),
  };
}

/**
 * Clasificación completa de una prueba: por categoría y general.
 * Devuelve null si la prueba no existe. Las posiciones usan RANK (empates comparten
 * posición y la siguiente salta); solo los FINALIZADO reciben posición.
 */
export async function findResultadosPrueba(pruebaId) {
  const [p] = await query(
    `SELECT p.id, p.nombre, p.distancia_m, p.fecha_hora, p.estado, d.nombre AS deporte,
            t.id AS torneo_id, t.nombre AS torneo, t.estado AS torneo_estado
     FROM pruebas p
     JOIN deportes d ON d.id = p.deporte_id
     JOIN torneos t  ON t.id = p.torneo_id
     WHERE p.id = ?`,
    [pruebaId],
  );
  if (!p) return null;

  const filas = await query(
    `SELECT i.id AS inscripcion_id, i.dorsal, i.atleta_id, CONCAT(u.nombre, ' ', u.apellido) AS atleta, a.club,
            i.categoria_id, c.nombre AS categoria, r.estado, r.tiempo_ms,
            CASE WHEN r.estado = 'FINALIZADO'
                 THEN RANK() OVER (PARTITION BY i.categoria_id, r.estado ORDER BY r.tiempo_ms) END AS posicion,
            CASE WHEN r.estado = 'FINALIZADO'
                 THEN RANK() OVER (PARTITION BY r.estado ORDER BY r.tiempo_ms) END AS posicion_general
     FROM resultados r
     JOIN inscripciones i ON i.id = r.inscripcion_id
     JOIN categorias c    ON c.id = i.categoria_id
     JOIN atletas a       ON a.usuario_id = i.atleta_id
     JOIN usuarios u      ON u.id = i.atleta_id
     WHERE i.prueba_id = ? AND i.estado <> 'ANULADA'
     ORDER BY ${ORDEN_ESTADO}, r.tiempo_ms, i.dorsal`,
    [pruebaId],
  );

  const categorias = (await listCategoriasDeTorneo(p.torneo_id)).map((c) => ({
    id: c.id,
    nombre: c.nombre,
    sexo: c.sexo,
    clasificacion: filas.filter((f) => f.categoria_id === c.id).map((f) => toFila(f, f.posicion)),
  }));

  return {
    prueba: {
      id: p.id,
      nombre: p.nombre,
      distanciaM: p.distancia_m,
      fechaHora: p.fecha_hora,
      estado: p.estado,
      deporte: p.deporte,
      torneo: { id: p.torneo_id, nombre: p.torneo, estado: p.torneo_estado },
    },
    categorias,
    general: filas.map((f) => toFila(f, f.posicion_general)),
    actualizadoEn: new Date().toISOString(),
  };
}

/** Resultados de un atleta con su posición en la categoría y en la general de cada prueba. */
export async function listResultadosDeAtleta(atletaId) {
  const filas = await query(
    `SELECT x.* FROM (
       SELECT i.id AS inscripcion_id, i.atleta_id, i.prueba_id, p.nombre AS prueba, p.fecha_hora,
              t.id AS torneo_id, t.nombre AS torneo, c.nombre AS categoria, i.dorsal, r.estado, r.tiempo_ms,
              CASE WHEN r.estado = 'FINALIZADO'
                   THEN RANK() OVER (PARTITION BY i.prueba_id, i.categoria_id, r.estado ORDER BY r.tiempo_ms) END AS posicion_categoria,
              CASE WHEN r.estado = 'FINALIZADO'
                   THEN RANK() OVER (PARTITION BY i.prueba_id, r.estado ORDER BY r.tiempo_ms) END AS posicion_general
       FROM resultados r
       JOIN inscripciones i ON i.id = r.inscripcion_id
       JOIN pruebas p       ON p.id = i.prueba_id
       JOIN torneos t       ON t.id = p.torneo_id
       JOIN categorias c    ON c.id = i.categoria_id
       WHERE i.estado <> 'ANULADA'
         AND i.prueba_id IN (SELECT prueba_id FROM inscripciones WHERE atleta_id = ?)
     ) x
     WHERE x.atleta_id = ?
     ORDER BY x.fecha_hora DESC, x.inscripcion_id`,
    [atletaId, atletaId],
  );
  return filas.map((f) => ({
    inscripcionId: f.inscripcion_id,
    pruebaId: f.prueba_id,
    prueba: f.prueba,
    pruebaFechaHora: f.fecha_hora,
    torneoId: f.torneo_id,
    torneo: f.torneo,
    categoria: f.categoria,
    dorsal: f.dorsal,
    estado: f.estado,
    tiempoMs: f.tiempo_ms ?? null,
    posicionCategoria: posicionONull(f.posicion_categoria),
    posicionGeneral: posicionONull(f.posicion_general),
  }));
}
