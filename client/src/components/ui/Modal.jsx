import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

const ENFOCABLES = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Diálogo modal accesible: Escape y clic en el fondo lo cierran,
 * el foco queda atrapado dentro y vuelve al botón que lo abrió.
 */
export function Modal({ titulo, descripcion, onClose, children }) {
  const panelRef = useRef(null);
  const tituloId = useId();
  const descId = useId();

  useEffect(() => {
    const previo = document.activeElement;
    panelRef.current?.querySelector('input, select, textarea')?.focus();

    const alTeclear = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const nodos = [...panelRef.current.querySelectorAll(ENFOCABLES)];
      if (!nodos.length) return;
      const primero = nodos[0];
      const ultimo = nodos[nodos.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener('keydown', alTeclear);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = overflowPrevio;
      previo?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div className={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={descripcion ? descId : undefined}
      >
        <div className={styles.head}>
          <h2 id={tituloId} className={styles.title}>
            {titulo}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
            <X aria-hidden="true" />
          </button>
        </div>
        {descripcion && (
          <p id={descId} className={styles.desc}>
            {descripcion}
          </p>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
