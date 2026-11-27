// Llamadas a la API de torneos, pruebas, categorías y deportes.
import { apiFetch } from './client.js';

/** Arma "?a=1&b=2" omitiendo valores vacíos. */
export const query = (params) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null));
  return q.toString() ? `?${q}` : '';
};

export const listarTorneos = (params = {}, signal) => apiFetch(`/api/torneos${query(params)}`, { signal });
export const obtenerTorneo = (id, signal) => apiFetch(`/api/torneos/${id}`, { signal });

// Versiones públicas (sin token): lo que ve cualquier visitante. Se pueden guardar
// para verlas sin conexión sin mezclar los torneos en borrador que ve el admin.
export const torneosPublicos = (params = {}, signal) =>
  apiFetch(`/api/torneos${query(params)}`, { signal, auth: false });
export const torneoPublico = (id, signal) => apiFetch(`/api/torneos/${id}`, { signal, auth: false });
export const crearTorneo = (datos) => apiFetch('/api/torneos', { method: 'POST', body: datos });
export const actualizarTorneo = (id, datos) => apiFetch(`/api/torneos/${id}`, { method: 'PUT', body: datos });
export const cambiarEstadoTorneo = (id, estado) =>
  apiFetch(`/api/torneos/${id}/estado`, { method: 'PATCH', body: { estado } });
export const eliminarTorneo = (id) => apiFetch(`/api/torneos/${id}`, { method: 'DELETE' });

export const listarDeportes = (signal) => apiFetch('/api/deportes', { signal });

export const crearPrueba = (torneoId, datos) =>
  apiFetch(`/api/torneos/${torneoId}/pruebas`, { method: 'POST', body: datos });
export const actualizarPrueba = (id, datos) => apiFetch(`/api/pruebas/${id}`, { method: 'PUT', body: datos });
export const cambiarEstadoPrueba = (id, estado) =>
  apiFetch(`/api/pruebas/${id}/estado`, { method: 'PATCH', body: { estado } });
export const eliminarPrueba = (id) => apiFetch(`/api/pruebas/${id}`, { method: 'DELETE' });

export const crearCategoria = (torneoId, datos) =>
  apiFetch(`/api/torneos/${torneoId}/categorias`, { method: 'POST', body: datos });
export const actualizarCategoria = (id, datos) => apiFetch(`/api/categorias/${id}`, { method: 'PUT', body: datos });
export const eliminarCategoria = (id) => apiFetch(`/api/categorias/${id}`, { method: 'DELETE' });
