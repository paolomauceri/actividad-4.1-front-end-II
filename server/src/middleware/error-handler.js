import { HttpError } from '../utils/http-error.js';

const DB_UNAVAILABLE_CODES = new Set([
  'ECONNREFUSED',
  'ETIMEDOUT',
  'PROTOCOL_CONNECTION_LOST',
  'ER_ACCESS_DENIED_ERROR',
  'ER_BAD_DB_ERROR',
]);

// Express reconoce un middleware de errores por sus 4 parámetros.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    const body = { code: err.code, message: err.message };
    if (err.details) body.details = err.details;
    return res.status(err.status).json({ error: body });
  }

  // JSON mal formado en el body (lanzado por express.json)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'El cuerpo de la petición no es un JSON válido' },
    });
  }

  if (DB_UNAVAILABLE_CODES.has(err.code)) {
    console.error('[db]', err.code, err.message);
    return res.status(503).json({
      error: { code: 'DB_UNAVAILABLE', message: 'La base de datos no está disponible. Intenta más tarde.' },
    });
  }

  console.error('[error]', err);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado en el servidor' },
  });
}
