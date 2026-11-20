import { HttpError } from '../utils/http-error.js';

export function notFound(req, res, next) {
  next(new HttpError(404, 'NOT_FOUND', `No existe la ruta ${req.method} ${req.originalUrl}`));
}
