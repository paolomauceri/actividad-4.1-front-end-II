import { validationResult } from 'express-validator';
import { HttpError } from '../utils/http-error.js';

/**
 * Ejecuta las reglas de express-validator y, si alguna falla,
 * responde 400 VALIDATION_ERROR con details: [{ campo, mensaje }].
 */
export function validate(chains) {
  return async (req, res, next) => {
    for (const chain of chains) {
      await chain.run(req);
    }
    const result = validationResult(req);
    if (result.isEmpty()) return next();

    const details = result
      .array({ onlyFirstError: true })
      .map((e) => ({ campo: e.path, mensaje: e.msg }));
    next(new HttpError(400, 'VALIDATION_ERROR', 'Datos inválidos', details));
  };
}
