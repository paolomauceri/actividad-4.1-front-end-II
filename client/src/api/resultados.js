// Llamadas a la API de resultados.
import { apiFetch } from './client.js';

/** { estado: 'FINALIZADO'|'DNF'|'DNS'|'DSQ', tiempoMs?, observaciones? } (JUEZ, ADMIN) */
export const guardarResultado = (inscripcionId, datos) =>
  apiFetch(`/api/inscripciones/${inscripcionId}/resultado`, { method: 'PUT', body: datos });
export const eliminarResultado = (inscripcionId) =>
  apiFetch(`/api/inscripciones/${inscripcionId}/resultado`, { method: 'DELETE' });

/** Clasificación pública de una prueba (por categoría y general). Sin token: se guarda para verla sin conexión. */
export const resultadosDePrueba = (pruebaId, signal) =>
  apiFetch(`/api/pruebas/${pruebaId}/resultados`, { signal, auth: false });

/** Resultados del atleta que inició sesión. */
export const misResultados = (signal) => apiFetch('/api/resultados/mios', { signal });
