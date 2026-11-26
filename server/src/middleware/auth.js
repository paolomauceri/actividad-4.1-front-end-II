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

/**
 * Igual que requireAuth pero sin exigir sesión: si llega un token válido de un
 * usuario activo deja req.user; si no, continúa como visitante (req.user indefinido).
 * Sirve para endpoints públicos que muestran más datos a un ADMIN.
 */
export async function optionalAuth(req, res, next) {
  const [scheme, token] = (req.get('Authorization') ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) return next();
  try {
    const { sub } = verifyToken(token);
    const usuario = await findEstadoById(sub);
    if (usuario?.activo) req.user = { id: usuario.id, rol: usuario.rol };
  } catch {
    // token inválido o vencido: se atiende como visitante
  }
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
