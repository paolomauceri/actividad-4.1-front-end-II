// Acceso a datos de atletas (usuarios con perfil deportivo).
import { query } from '../../db/pool.js';

const SELECT_ATLETA = `
  SELECT u.id, u.nombre, u.apellido, u.email, u.activo,
         a.documento, a.fecha_nacimiento, a.sexo, a.club, a.telefono
  FROM atletas a
  JOIN usuarios u ON u.id = a.usuario_id`;

function toAtleta(f) {
  return {
    id: f.id,
    nombre: f.nombre,
    apellido: f.apellido,
    email: f.email,
    documento: f.documento,
    fechaNacimiento: f.fecha_nacimiento,
    sexo: f.sexo,
    club: f.club,
    telefono: f.telefono,
    activo: Boolean(f.activo),
  };
}

/** Escapa % y _ para que el texto del usuario se busque literal dentro de LIKE. */
const literalLike = (texto) => texto.replace(/[\\%_]/g, (c) => `\\${c}`);

/**
 * Búsqueda paginada por nombre, apellido, documento o club (sin distinguir mayúsculas ni tildes).
 * @param {{ q?: string, page: number, limit: number }} opciones
 */
export async function searchAtletas({ q, page, limit }) {
  let where = '';
  const params = [];
  if (q) {
    const patron = `%${literalLike(q)}%`;
    where = `WHERE u.nombre LIKE ? OR u.apellido LIKE ? OR CONCAT(u.nombre, ' ', u.apellido) LIKE ?
                OR a.documento LIKE ? OR a.club LIKE ?`;
    params.push(patron, patron, patron, patron, patron);
  }
  const offset = (page - 1) * limit;

  const filas = await query(
    `${SELECT_ATLETA} ${where} ORDER BY u.apellido, u.nombre, u.id LIMIT ${limit} OFFSET ${offset}`,
    params,
  );
  const [{ total }] = await query(
    `SELECT COUNT(*) AS total FROM atletas a JOIN usuarios u ON u.id = a.usuario_id ${where}`,
    params,
  );
  return { datos: filas.map(toAtleta), total: Number(total), page, limit };
}

/** Atleta por id de usuario (null si no existe o no es atleta). */
export async function findAtleta(id) {
  const [fila] = await query(`${SELECT_ATLETA} WHERE u.id = ?`, [id]);
  return fila ? toAtleta(fila) : null;
}

/** Datos que el propio atleta puede cambiar. */
export async function updatePerfil(id, { nombre, apellido, club, telefono }) {
  await query('UPDATE usuarios SET nombre = ?, apellido = ? WHERE id = ?', [nombre, apellido, id]);
  await query('UPDATE atletas SET club = ?, telefono = ? WHERE usuario_id = ?', [club ?? null, telefono ?? null, id]);
}
