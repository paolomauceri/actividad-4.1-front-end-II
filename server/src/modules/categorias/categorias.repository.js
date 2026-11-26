// Acceso a datos de categorías (grupos por edad y sexo de un torneo).
import { query } from '../../db/pool.js';

const SELECT_CATEGORIA = `
  SELECT c.id, c.torneo_id, c.nombre, c.sexo, c.edad_min, c.edad_max,
         (SELECT COUNT(*) FROM inscripciones i WHERE i.categoria_id = c.id AND i.estado <> 'ANULADA') AS inscritos
  FROM categorias c`;

export function toCategoria(f) {
  return {
    id: f.id,
    torneoId: f.torneo_id,
    nombre: f.nombre,
    sexo: f.sexo,
    edadMin: f.edad_min,
    edadMax: f.edad_max,
    inscritos: Number(f.inscritos),
  };
}

/** Categorías de un torneo, de menor a mayor edad. */
export async function listCategoriasDeTorneo(torneoId) {
  const filas = await query(`${SELECT_CATEGORIA} WHERE c.torneo_id = ? ORDER BY c.edad_min, c.id`, [torneoId]);
  return filas.map(toCategoria);
}

/** Categoría por id (o null). */
export async function findCategoria(id) {
  const [fila] = await query(`${SELECT_CATEGORIA} WHERE c.id = ?`, [id]);
  return fila ? toCategoria(fila) : null;
}

export async function insertCategoria(torneoId, { nombre, sexo, edadMin, edadMax }) {
  const res = await query(
    'INSERT INTO categorias (torneo_id, nombre, sexo, edad_min, edad_max) VALUES (?, ?, ?, ?, ?)',
    [torneoId, nombre, sexo, edadMin, edadMax],
  );
  return res.insertId;
}

export async function updateCategoria(id, { nombre, sexo, edadMin, edadMax }) {
  await query('UPDATE categorias SET nombre = ?, sexo = ?, edad_min = ?, edad_max = ? WHERE id = ?', [
    nombre,
    sexo,
    edadMin,
    edadMax,
    id,
  ]);
}

export async function deleteCategoria(id) {
  await query('DELETE FROM categorias WHERE id = ?', [id]);
}

/**
 * Primera categoría del torneo que se cruza con el rango y sexo dados (o null).
 * Se cruzan si comparten alguna edad y el sexo coincide o alguna de las dos es MIXTO.
 * `excluirId` evita compararse consigo misma al editar.
 */
export async function findCategoriaSolapada(torneoId, { sexo, edadMin, edadMax }, excluirId = 0) {
  const [fila] = await query(
    `SELECT nombre, edad_min, edad_max FROM categorias
     WHERE torneo_id = ? AND id <> ?
       AND edad_min <= ? AND edad_max >= ?
       AND (sexo = ? OR sexo = 'MIXTO' OR ? = 'MIXTO')
     LIMIT 1`,
    [torneoId, excluirId, edadMax, edadMin, sexo, sexo],
  );
  return fila ?? null;
}

/** Inscripciones (cualquier estado) que usan la categoría. */
export async function countInscripcionesCategoria(id, { soloActivas = false } = {}) {
  const [{ n }] = await query(
    `SELECT COUNT(*) AS n FROM inscripciones WHERE categoria_id = ? ${soloActivas ? "AND estado <> 'ANULADA'" : ''}`,
    [id],
  );
  return Number(n);
}
