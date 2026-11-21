import { ArrowRight, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { formatTiempo } from '../../utils/format.js';
import styles from './Hero.module.css';

// Ejemplo ilustrativo de cómo se ve una clasificación en vivo
const EJEMPLO = [
  { pos: 1, nombre: 'Diego Ramírez', club: 'Atlético Costa', ms: 57940 },
  { pos: 2, nombre: 'Joaquín Silva', club: 'Atlético Costa', ms: 58730 },
  { pos: 3, nombre: 'Nicolás Vargas', club: 'Independiente', ms: 59210 },
  { pos: 4, nombre: 'Sebastián Morales', club: 'Tritón Club', ms: 61080 },
];

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-titulo">
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Natación · Aguas abiertas · Acuatlón · Triatlón · Atletismo</p>
          <h1 id="hero-titulo" className={styles.title}>
            Del registro al podio, en un solo lugar.
          </h1>
          <p className={styles.lead}>
            Inscríbete en torneos, recibe tu dorsal y sigue la clasificación de tu categoría mientras se registran los
            tiempos.
          </p>
          <div className={styles.ctas}>
            <Button to="/registro" variant="accent" size="lg" icon={UserPlus}>
              Inscríbete gratis
            </Button>
            <a href="#torneos" className={styles.secondary}>
              Ver próximos torneos
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>

        <figure className={styles.board} aria-label="Ejemplo de clasificación en vivo">
          <div className={styles.boardHead}>
            <div>
              <p className={styles.boardEvent}>100 m libre</p>
              <p className={styles.boardCat}>Adulto Masculino · Final</p>
            </div>
            <span className={styles.live}>
              <span className={styles.dot} aria-hidden="true" />
              En vivo
            </span>
          </div>
          <ol className={styles.rows}>
            {EJEMPLO.map((a) => (
              <li key={a.pos} className={styles.row}>
                <span className={`${styles.pos} ${styles[`pos${a.pos}`] ?? ''}`}>{a.pos}</span>
                <span className={styles.who}>
                  <span className={styles.name}>{a.nombre}</span>
                  <span className={styles.club}>{a.club}</span>
                </span>
                <span className={`${styles.time} num`}>{formatTiempo(a.ms)}</span>
              </li>
            ))}
          </ol>
          <figcaption className={styles.caption}>Datos de ejemplo</figcaption>
        </figure>
      </div>
    </section>
  );
}
