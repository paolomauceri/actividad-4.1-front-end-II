// Lógica de registro e inicio de sesión.
import bcrypt from 'bcryptjs';
import { withTransaction } from '../../db/pool.js';
import { HttpError } from '../../utils/http-error.js';
import { signToken } from '../../utils/jwt.js';
import {
  findCredencialesByEmail,
  findPublicoById,
  insertAtleta,
  insertUsuario,
  mapDuplicateError,
} from '../usuarios/usuarios.repository.js';

const BCRYPT_COST = 10;
// Hash válido usado cuando el email no existe, para que el tiempo de respuesta
// sea similar y no revele qué correos están registrados.
const HASH_FICTICIO = '$2a$10$xb7.x5hXbSjvdkVLph5e1uurRtVtgpaIUZ3t59JqOxKcG7Opz6M06';

export function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_COST);
}

/** Registro público: siempre crea un ATLETA (usuarios + atletas en una transacción). */
export async function registerAtleta(datos) {
  const passwordHash = await hashPassword(datos.password);

  let id;
  try {
    id = await withTransaction(async (conn) => {
      const usuarioId = await insertUsuario(conn, { ...datos, passwordHash, rol: 'ATLETA' });
      await insertAtleta(conn, usuarioId, datos);
      return usuarioId;
    });
  } catch (err) {
    throw mapDuplicateError(err);
  }

  const usuario = await findPublicoById(id);
  return { token: signToken(usuario), usuario };
}

export async function login(email, password) {
  const cred = await findCredencialesByEmail(email);
  const ok = await bcrypt.compare(password, cred?.password_hash ?? HASH_FICTICIO);

  if (!cred || !ok) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Correo o contraseña incorrectos');
  }
  if (!cred.activo) {
    throw new HttpError(403, 'USER_INACTIVE', 'Tu cuenta está desactivada. Contacta al administrador.');
  }

  const usuario = await findPublicoById(cred.id);
  return { token: signToken(usuario), usuario };
}
