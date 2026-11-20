// Reglas de validación compartidas (express-validator).
import { body } from 'express-validator';

const MENSAJE_PASSWORD = 'La contraseña debe tener entre 8 y 72 caracteres e incluir al menos una letra y un número';

export const reglaNombre = (campo) =>
  body(campo)
    .isString().withMessage('Campo obligatorio')
    .trim()
    .isLength({ min: 2, max: 60 }).withMessage('Debe tener entre 2 y 60 caracteres');

export const reglaEmail = () =>
  body('email')
    .isString().withMessage('Ingresa un correo electrónico')
    .customSanitizer((v) => String(v).trim().toLowerCase())
    .isEmail().withMessage('Ingresa un correo electrónico válido')
    .isLength({ max: 120 }).withMessage('Máximo 120 caracteres');

export const reglaPassword = () =>
  body('password')
    .isString().withMessage(MENSAJE_PASSWORD)
    .isLength({ min: 8, max: 72 }).withMessage(MENSAJE_PASSWORD)
    .matches(/[A-Za-z]/).withMessage(MENSAJE_PASSWORD)
    .matches(/\d/).withMessage(MENSAJE_PASSWORD);

function calcularEdad(fechaIso, hoy = new Date()) {
  const [y, m, d] = fechaIso.split('-').map(Number);
  let edad = hoy.getFullYear() - y;
  if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) edad -= 1;
  return edad;
}

export const registerRules = [
  reglaNombre('nombre'),
  reglaNombre('apellido'),
  reglaEmail(),
  reglaPassword(),
  body('documento')
    .isString().withMessage('Campo obligatorio')
    .trim()
    .isLength({ min: 5, max: 20 }).withMessage('Debe tener entre 5 y 20 caracteres')
    .matches(/^[A-Za-z0-9.-]+$/).withMessage('Solo letras, números, puntos o guiones'),
  body('fechaNacimiento')
    .isISO8601({ strict: true, strictSeparator: true }).withMessage('Usa el formato AAAA-MM-DD')
    .bail()
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Usa el formato AAAA-MM-DD')
    .bail()
    .custom((v) => {
      const edad = calcularEdad(v);
      return edad >= 5 && edad <= 100;
    }).withMessage('La edad debe estar entre 5 y 100 años'),
  body('sexo').isIn(['M', 'F']).withMessage('Selecciona M o F'),
  body('club')
    .optional({ values: 'falsy' })
    .isString().trim()
    .isLength({ max: 80 }).withMessage('Máximo 80 caracteres'),
  body('telefono')
    .optional({ values: 'falsy' })
    .isString().trim()
    .isLength({ max: 20 }).withMessage('Máximo 20 caracteres')
    .matches(/^[0-9+()\-\s]+$/).withMessage('Solo números, espacios y + ( ) -'),
];

export const loginRules = [
  body('email')
    .isString().withMessage('Ingresa tu correo')
    .customSanitizer((v) => String(v).trim().toLowerCase())
    .notEmpty().withMessage('Ingresa tu correo'),
  body('password').isString().notEmpty().withMessage('Ingresa tu contraseña'),
];
