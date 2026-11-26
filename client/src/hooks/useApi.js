import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Carga datos de la API al montar y cuando cambian las dependencias.
 * `cargar` recibe un AbortSignal; la petición se cancela al desmontar.
 *
 * @template T
 * @param {(signal: AbortSignal) => Promise<T>} cargar
 * @param {unknown[]} deps
 * @returns {{ datos: T | null, cargando: boolean, error: Error | null, recargar: () => Promise<void>, setDatos: (d: T) => void }}
 */
export function useApi(cargar, deps) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: null });
  const cargarRef = useRef(cargar);
  cargarRef.current = cargar;
  const controllerRef = useRef(null);

  const ejecutar = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setEstado((s) => ({ ...s, cargando: s.datos === null, error: null }));
    try {
      const datos = await cargarRef.current(controller.signal);
      if (!controller.signal.aborted) setEstado({ datos, cargando: false, error: null });
    } catch (error) {
      if (error?.name === 'AbortError' || controller.signal.aborted) return;
      setEstado((s) => ({ ...s, cargando: false, error }));
    }
  }, []);

  useEffect(() => {
    ejecutar();
    return () => controllerRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const setDatos = useCallback((datos) => setEstado((s) => ({ ...s, datos })), []);

  return { ...estado, recargar: ejecutar, setDatos };
}
