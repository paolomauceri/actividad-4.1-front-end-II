// Llamadas a la API de inscripciones.
import { apiFetch } from './client.js';
import { query } from './torneos.js';

/** { pruebaId } del atleta logueado, o { pruebaId, atletaId } si inscribe el ADMIN. */
export const inscribir = (datos) => apiFetch('/api/inscripciones', { method: 'POST', body: datos });
export const listarInscripciones = (params, signal) => apiFetch(`/api/inscripciones${query(params)}`, { signal });
export const misInscripciones = (signal) => apiFetch('/api/inscripciones/mias', { signal });
export const actualizarInscripcion = (id, cambios) =>
  apiFetch(`/api/inscripciones/${id}`, { method: 'PATCH', body: cambios });
