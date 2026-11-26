import { Medal } from 'lucide-react';
import { formatTiempo } from '../../utils/format.js';
import styles from './Resultados.module.css';

const LUGAR = { 1: '1.º lugar', 2: '2.º lugar', 3: '3.º lugar' };

/**
 * Podio de una clasificación: quienes tienen posición 1, 2 o 3.
 * Con empates puede haber dos oros; DNF/DNS/DSQ (sin posición) nunca aparecen.
 * @param {{ filas: { inscripcionId: number, atleta: string, categoria: string, club: string|null,
 *                    tiempoMs: number|null, posicion: number|null }[] }} props
 */
export function Podio({ filas }) {
  const podio = filas.filter((f) => f.posicion >= 1 && f.posicion <= 3);
  if (!podio.length) return null;

  return (
    <ol className={styles.podio} aria-label="Podio">
      {podio.map((f) => (
        <li key={f.inscripcionId} className={`${styles.puesto} ${styles[`lugar${f.posicion}`]}`}>
          <span className={styles.medalla}>
            <Medal aria-hidden="true" />
            {LUGAR[f.posicion]}
          </span>
          <strong className={styles.atletaPodio}>{f.atleta}</strong>
          <span className={styles.detallePodio}>
            {f.categoria}
            {f.club ? ` · ${f.club}` : ''}
          </span>
          <span className={styles.tiempoPodio}>{formatTiempo(f.tiempoMs)}</span>
          <span className={styles.escalon} aria-hidden="true">
            {f.posicion}
          </span>
        </li>
      ))}
    </ol>
  );
}
