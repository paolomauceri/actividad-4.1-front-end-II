// Cliente HTTP de la API de Podio.
import { clearToken, getToken } from './token.js';

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const MENSAJE_SIN_CONEXION = 'No se pudo conectar con el servidor. Intenta de nuevo.';
const MENSAJE_GENERICO = 'Ocurrió un error inesperado. Intenta de nuevo.';

/**
 * Llama a la API y devuelve el JSON de la respuesta.
 * @param {string} path  ruta, por ejemplo '/api/auth/me'
 * @param {{ method?: string, body?: unknown, auth?: boolean, signal?: AbortSignal }} [opciones]
 * @throws {ApiError}
 */
export async function apiFetch(path, { method = 'GET', body, auth = true, signal } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new ApiError(0, 'NETWORK_ERROR', MENSAJE_SIN_CONEXION);
  }

  const texto = await res.text();
  let data = null;
  if (texto) {
    try {
      data = JSON.parse(texto);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const error = data?.error;
    // 502/503/504 sin cuerpo de la API: responde un proxy porque la API no está disponible
    if (!error && [502, 503, 504].includes(res.status)) {
      throw new ApiError(0, 'NETWORK_ERROR', MENSAJE_SIN_CONEXION);
    }
    // La sesión guardada ya no sirve: se cierra en toda la app
    if (res.status === 401 && token) {
      clearToken();
      window.dispatchEvent(new Event('auth:logout'));
    }
    throw new ApiError(res.status, error?.code ?? `HTTP_${res.status}`, error?.message ?? MENSAJE_GENERICO, error?.details);
  }

  return data;
}
