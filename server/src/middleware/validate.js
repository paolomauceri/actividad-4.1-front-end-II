import { validationResult } from 'express-validator';
import { HttpError } from '../utils/http-error.js';

const esCompuesto = (v) => v !== null && typeof v === 'object';

/**
 * Ejecuta las reglas de express-validator y, si alguna falla,
 * responde 400 VALIDATION_ERROR con details: [{ campo, mensaje }].
 *
 * Además rechaza campos del body que llegan como arreglo u objeto: ninguna
 * ruta los usa y express-validator validaría cada elemento por separado
 * (por ejemplo `{ "estado": ["DNF"] }` pasaría un isIn y fallaría en la base).
 */
export function validate(chains) {
  return async (req, res, next) => {
    for (const chain of chains) {
      await chain.run(req);
    }

    const details = [];
    const cuerpo = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    const compuestos = new Set(Object.keys(cuerpo).filter((campo) => esCompuesto(cuerpo[campo])));
    for (const campo of compuestos) details.push({ campo, mensaje: 'Debe ser un valor simple' });

    const result = validationResult(req);
    for (const e of result.array({ onlyFirstError: true })) {
      if (!compuestos.has(e.path)) details.push({ campo: e.path, mensaje: e.msg });
    }

    if (!details.length) return next();
    next(new HttpError(400, 'VALIDATION_ERROR', 'Datos inválidos', details));
  };
}
