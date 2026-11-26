import { useEffect, useRef, useSyncExternalStore } from 'react';
import { resultadosDePrueba } from '../api/resultados.js';
import { getSocket } from '../realtime/socket.js';
import { useApi } from './useApi.js';

// Estado de la conexión como "store" externo: React vuelve a leerlo después de
// suscribirse, así no se pierde una conexión que ocurrió antes de escuchar 'connect'.
function suscribirConexion(avisar) {
  const socket = getSocket();
  socket.on('connect', avisar);
  socket.on('disconnect', avisar);
  return () => {
    socket.off('connect', avisar);
    socket.off('disconnect', avisar);
  };
}
const estaConectado = () => getSocket().connected;

/**
 * Clasificación de una prueba que se actualiza sola por Socket.IO.
 * Carga por REST, sigue la sala de la prueba y reemplaza los datos con cada
 * `resultados:actualizados`. Al reconectar vuelve a cargar por si se perdió algo.
 *
 * @param {number} pruebaId
 * @returns {{ datos: object | null, cargando: boolean, error: Error | null, enVivo: boolean, recargar: () => Promise<void> }}
 */
export function useResultadosEnVivo(pruebaId) {
  const { datos, cargando, error, recargar, setDatos } = useApi(
    (signal) => resultadosDePrueba(pruebaId, signal),
    [pruebaId],
  );
  const enVivo = useSyncExternalStore(suscribirConexion, estaConectado);
  const recargarRef = useRef(recargar);
  recargarRef.current = recargar;

  useEffect(() => {
    const socket = getSocket();
    let seCorto = false;

    // Al (re)conectar el servidor olvida las salas: hay que volver a seguir la prueba
    const alConectar = () => {
      socket.emit('prueba:seguir', pruebaId);
      if (seCorto) recargarRef.current();
    };
    const alDesconectar = () => {
      seCorto = true;
    };
    const alActualizar = (nuevos) => {
      if (nuevos?.prueba?.id === pruebaId) setDatos(nuevos);
    };

    socket.on('connect', alConectar);
    socket.on('disconnect', alDesconectar);
    socket.on('resultados:actualizados', alActualizar);
    if (socket.connected) socket.emit('prueba:seguir', pruebaId);

    return () => {
      socket.emit('prueba:dejar', pruebaId);
      socket.off('connect', alConectar);
      socket.off('disconnect', alDesconectar);
      socket.off('resultados:actualizados', alActualizar);
    };
  }, [pruebaId, setDatos]);

  return { datos, cargando, error, enVivo, recargar };
}
