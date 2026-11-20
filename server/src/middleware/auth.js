import { HttpError } from '../utils/http-error.js';
import { verifyToken } from '../utils/jwt.js';
import { findEstadoById } from '../modules/usuarios/usuarios.repository.js';

/**
 * Exige un token válido en `Authorization: Bearer <token>`.
 * Además comprueba en la base que el usuario exista y siga activo,
 * así una cuenta desactivada pierde el acceso aunque su token no haya expirado.
 * Deja en req.user = { id, rol }.
 */
export async function requireAuth(req, res, next) {
  const header = req.get('Authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new HttpError(401, 'UNAUTHORIZED', 'Debes iniciar sesión para acceder a este recurso.'));
  }

  const { sub } = verifyToken(token);
  const usuario = await findEstadoById(sub);
  if (!usuario || !usuario.activo) {
    return next(new HttpError(401, 'UNAUTHORIZED', 'Tu sesión no es válida o expiró. Inicia sesión nuevamente.'));
  }

  req.user = { id: usuario.id, rol: usuario.rol };
  next();
}

/** Permite el acceso solo a los roles indicados (usar después de requireAuth). */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return next(new HttpError(403, 'FORBIDDEN', 'No tienes permisos para realizar esta acción.'));
    }
    next();
  };
}
