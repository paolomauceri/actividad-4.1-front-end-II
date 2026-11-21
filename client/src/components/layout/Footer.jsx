import { Logo } from './Logo.jsx';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Logo inverted />
          <p className={styles.tagline}>
            Inscripciones, tiempos y resultados de natación, aguas abiertas, acuatlón, triatlón y atletismo.
          </p>
        </div>
        <p className={styles.meta}>
          Proyecto académico · Taller Front End 2 · Brayan Teran y Paolo Mauceri · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
