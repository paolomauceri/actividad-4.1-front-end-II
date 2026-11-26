import { useId, useRef } from 'react';
import styles from './Tabs.module.css';

/**
 * Pestañas accesibles (patrón ARIA tablist): flechas ← → para moverse.
 * El contenido de la pestaña activa se pasa como children.
 *
 * @param {{ pestañas: { id: string, label: string }[], activa: string, onCambiar: (id: string) => void,
 *           etiqueta: string, children: import('react').ReactNode }} props
 */
export function Tabs({ pestañas, activa, onCambiar, etiqueta, children }) {
  const base = useId();
  const refs = useRef({});

  const alTeclear = (e, indice) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const siguiente = pestañas[(indice + delta + pestañas.length) % pestañas.length];
    onCambiar(siguiente.id);
    refs.current[siguiente.id]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label={etiqueta} className={styles.lista}>
        {pestañas.map((p, i) => {
          const seleccionada = p.id === activa;
          return (
            <button
              key={p.id}
              ref={(el) => {
                refs.current[p.id] = el;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${p.id}`}
              aria-selected={seleccionada}
              aria-controls={`${base}-panel-${p.id}`}
              tabIndex={seleccionada ? 0 : -1}
              className={`${styles.tab} ${seleccionada ? styles.activa : ''}`}
              onClick={() => onCambiar(p.id)}
              onKeyDown={(e) => alTeclear(e, i)}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${base}-panel-${activa}`}
        aria-labelledby={`${base}-tab-${activa}`}
        className={styles.panel}
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}
