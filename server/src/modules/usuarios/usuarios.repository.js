// Acceso a datos de usuarios y atletas. Nunca devuelve password_hash hacia afuera
// salvo en findCredencialesByEmail, que solo usa el login.
import { query } from '../../db/pool.js';
import { HttpError } from '../../utils/http-error.js';

const SELECT_PUBLICO = `
  SELECT u.id, u.nombre, u.apellido, u.email, u.rol, u.activo, u.creado_en,
         a.documento, a.fecha_nacimiento, a.sexo, a.club, a.telefono
  FROM usuarios u
  LEFT JOIN atletas a ON a.usuario_id = u.id`;

/** Convierte una fila SQL en el objeto UsuarioPublico de la API. */
export function toUsuarioPublico(row) {
  const usuario = {
    id: row.id,
    nombre: row.nombre,
    apellido: row.apellido,
    email: row.email,
    rol: row.rol,
    activo: Boolean(row.activo),
    creadoEn: row.creado_en,
  };
  if (row.documento) {
    usuario.atleta = {
      documento: row.documento,
      fechaNacimiento: row.fecha_nacimiento,
      sexo: row.sexo,
      club: row.club,
      telefono: row.telefono,
    };
  }
  return usuario;
}

/** Traduce un ER_DUP_ENTRY de MySQL/MariaDB a un 409 legible. */
export function mapDuplicateError(err) {
  if (err?.code !== 'ER_DUP_ENTRY') return err;
  if (err.message.includes('uq_usuarios_email')) {
    return new HttpError(409, 'EMAIL_TAKEN', 'Este correo ya está registrado', [
      { campo: 'email', mensaje: 'Este correo ya está registrado' },
    ]);
  }
  if (err.message.includes('uq_atletas_documento')) {
    return new HttpError(409, 'DOCUMENTO_TAKEN', 'Este documento ya está registrado', [
      { campo: 'documento', mensaje: 'Este documento ya está registrado' },
    ]);
  }
  return err;
}

export async function findCredencialesByEmail(email) {
  const rows = await query(
    'SELECT id, rol, activo, password_hash FROM usuarios WHERE email = ? LIMIT 1',
    [email],
  );
  return rows[0] ?? null;
}

export async function findEstadoById(id) {
  const rows = await query('SELECT id, rol, activo FROM usuarios WHERE id = ? LIMIT 1', [id]);
  return rows[0] ?? null;
}

export async function findPublicoById(id) {
  const rows = await query(`${SELECT_PUBLICO} WHERE u.id = ? LIMIT 1`, [id]);
  return rows[0] ? toUsuarioPublico(rows[0]) : null;
}

/** Inserta en usuarios usando la conexión dada (para transacciones). Devuelve el id. */
export async function insertUsuario(conn, { nombre, apellido, email, passwordHash, rol }) {
  const [result] = await conn.execute(
    'INSERT INTO usuarios (nombre, apellido, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
    [nombre, apellido, email, passwordHash, rol],
  );
  return result.insertId;
}

export async function insertAtleta(conn, usuarioId, { documento, fechaNacimiento, sexo, club, telefono }) {
  await conn.execute(
    'INSERT INTO atletas (usuario_id, documento, fecha_nacimiento, sexo, club, telefono) VALUES (?, ?, ?, ?, ?, ?)',
    [usuarioId, documento, fechaNacimiento, sexo, club ?? null, telefono ?? null],
  );
}

/** Lista paginada. `page` y `limit` llegan ya validados como enteros. */
export async function listUsuarios({ page, limit, rol }) {
  const where = rol ? 'WHERE u.rol = ?' : '';
  const params = rol ? [rol] : [];
  const offset = (page - 1) * limit;

  const [data, totalRows] = await Promise.all([
    query(`${SELECT_PUBLICO} ${where} ORDER BY u.creado_en DESC, u.id DESC LIMIT ${limit} OFFSET ${offset}`, params),
    query(`SELECT COUNT(*) AS total FROM usuarios u ${where}`, params),
  ]);

  return {
    data: data.map(toUsuarioPublico),
    page,
    limit,
    total: Number(totalRows[0].total),
  };
}
