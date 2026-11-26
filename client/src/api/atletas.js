// Llamadas a la API de atletas y usuarios.
import { apiFetch } from './client.js';
import { query } from './torneos.js';

export const buscarAtletas = ({ q, limit = 50 } = {}, signal) => apiFetch(`/api/atletas${query({ q, limit })}`, { signal });
export const obtenerAtleta = (id, signal) => apiFetch(`/api/atletas/${id}`, { signal });
export const crearAtleta = (datos) => apiFetch('/api/atletas', { method: 'POST', body: datos });
export const miPerfil = (signal) => apiFetch('/api/atletas/me', { signal });
export const actualizarMiPerfil = (datos) => apiFetch('/api/atletas/me', { method: 'PUT', body: datos });

export const listarUsuarios = ({ rol, limit = 100 } = {}, signal) => apiFetch(`/api/usuarios${query({ rol, limit })}`, { signal });
export const cambiarActivo = (usuarioId, activo) =>
  apiFetch(`/api/usuarios/${usuarioId}/activo`, { method: 'PATCH', body: { activo } });
