// Reglas de validación de torneos (express-validator).
import { body } from 'express-validator';

export const ESTADOS_TORNEO = ['BORRADOR', 'ABIERTO', 'EN_CURSO', 'FINALIZADO'];

const FORMATO_FECHA = 'Usa el formato AAAA-MM-DD';

/** Fecha 'YYYY-MM-DD' válida. */
export const reglaFecha = (campo) =>
  body(campo)
    .isString().withMessage(FORMATO_FECHA)
    .bail()
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage(FORMATO_FECHA)
    .bail()
    .isISO8601({ strict: true, strictSeparator: true }).withMessage('La fecha no existe');

export const torneoRules = [
  body('nombre')
    .isString().withMessage('Campo obligatorio')
    .trim()
    .isLength({ min: 3, max: 120 }).withMessage('Debe tener entre 3 y 120 caracteres'),
  body('descripcion')
    .optional({ values: 'null' })
    .isString().withMessage('Debe ser texto')
    .trim()
    .isLength({ max: 2000 }).withMessage('Máximo 2000 caracteres'),
  body('sede')
    .isString().withMessage('Campo obligatorio')
    .trim()
    .isLength({ min: 3, max: 120 }).withMessage('Debe tener entre 3 y 120 caracteres'),
  reglaFecha('fechaInicio'),
  reglaFecha('fechaFin')
    .bail()
    .custom((fin, { req }) => typeof req.body.fechaInicio !== 'string' || fin >= req.body.fechaInicio)
    .withMessage('La fecha de fin no puede ser anterior a la de inicio'),
];

export const estadoTorneoRules = [
  body('estado').isIn(ESTADOS_TORNEO).withMessage(`Debe ser uno de: ${ESTADOS_TORNEO.join(', ')}`),
];
