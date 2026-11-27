import { useSyncExternalStore } from 'react';

function suscribir(avisar) {
  window.addEventListener('online', avisar);
  window.addEventListener('offline', avisar);
  return () => {
    window.removeEventListener('online', avisar);
    window.removeEventListener('offline', avisar);
  };
}

const enLinea = () => navigator.onLine;

/** true si el navegador tiene conexión; se actualiza con los eventos online/offline. */
export function useEnLinea() {
  return useSyncExternalStore(suscribir, enLinea, () => true);
}
