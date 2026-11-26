// Limita los intentos de login y registro por IP (protección contra fuerza bruta).
import { rateLimit } from 'express-rate-limit';
import { HttpError } from '../utils/http-error.js';

const QUINCE_MINUTOS = 15 * 60 * 1000;

/** Middleware que permite `max` peticiones por IP cada 15 minutos. */
export function authLimiter(max) {
  return rateLimit({
    windowMs: QUINCE_MINUTOS,
    limit: max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res, next) =>
      next(new HttpError(429, 'TOO_MANY_REQUESTS', 'Demasiados intentos. Espera unos minutos e intenta de nuevo.')),
  });
}
