import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MAX_INTENTOS = 30; // ~0,5 s esperando a que la sección se renderice

/**
 * React Router navega sin recargar la página, así que el navegador no hace
 * el desplazamiento automático a los enlaces con #ancla (por ejemplo "/#torneos").
 * Este componente lo hace cada vez que cambia la URL, incluso si se hace clic
 * dos veces en el mismo enlace (location.key cambia en cada navegación).
 */
export function ScrollToHash() {
  const { hash, key } = useLocation();

  useEffect(() => {
    if (!hash) return undefined;
    const id = decodeURIComponent(hash.slice(1));
    const suave = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let intentos = 0;
    let frame;

    const desplazar = () => {
      const destino = document.getElementById(id);
      if (destino) {
        destino.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'start' });
      } else if (intentos < MAX_INTENTOS) {
        intentos += 1;
        frame = requestAnimationFrame(desplazar);
      }
    };

    desplazar();
    return () => cancelAnimationFrame(frame);
  }, [hash, key]);

  return null;
}
