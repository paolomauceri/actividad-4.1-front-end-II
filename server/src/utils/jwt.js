import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from './http-error.js';

/** Firma un token con { sub: id, rol } que expira según JWT_EXPIRES_IN. */
export function signToken({ id, rol }) {
  return jwt.sign({ rol }, env.JWT_SECRET, {
    subject: String(id),
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/** Verifica el token. Devuelve { sub, rol } o lanza 401 UNAUTHORIZED. */
export function verifyToken(token) {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
    return { sub: Number(payload.sub), rol: payload.rol };
  } catch {
    throw new HttpError(401, 'UNAUTHORIZED', 'Tu sesión no es válida o expiró. Inicia sesión nuevamente.');
  }
}
