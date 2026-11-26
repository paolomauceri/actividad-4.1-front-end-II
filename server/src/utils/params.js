// Utilidades para leer parámetros de la URL y de la query de forma segura.
import { HttpError } from './http-error.js';

/** Entero en [min, max]; si no es un número válido devuelve `porDefecto`. */
export function enteroEnRango(valor, porDefecto, min, max) {
  const n = Number.parseInt(valor, 10);
  if (Number.isNaN(n)) return porDefecto;
  return Math.min(Math.max(n, min), max);
}

/**
 * Id numérico de la URL (`/recurso/:id`). Un id que no es un entero positivo
 * no puede existir, así que responde 404 con el mensaje indicado.
 */
export function idDeRuta(valor, mensaje = 'No encontrado') {
  if (!/^\d{1,10}$/.test(String(valor)) || Number(valor) === 0) {
    throw new HttpError(404, 'NOT_FOUND', mensaje);
  }
  return Number(valor);
}

/** Error 400 VALIDATION_ERROR para un solo campo. */
export function errorDeCampo(campo, mensaje) {
  return new HttpError(400, 'VALIDATION_ERROR', 'Datos inválidos', [{ campo, mensaje }]);
}
