import { Link } from 'react-router-dom';
import styles from './Logo.module.css';

/** Marca de Podio: podio de 3 escalones sobre una ola + nombre. */
export function Logo({ to = '/', inverted = false }) {
  return (
    <Link to={to} className={`${styles.logo} ${inverted ? styles.inverted : ''}`} aria-label="Podio, ir al inicio">
      <svg viewBox="0 0 512 512" className={styles.mark} aria-hidden="true">
        <rect width="512" height="512" rx="112" fill="#0b2545" />
        <rect x="96" y="250" width="104" height="150" rx="12" fill="#22b8cf" />
        <rect x="204" y="170" width="104" height="230" rx="12" fill="#ffffff" />
        <rect x="312" y="290" width="104" height="110" rx="12" fill="#f97316" />
        <path
          d="M96 420c28 0 28-16 56-16s28 16 56 16 28-16 56-16 28 16 56 16 28-16 56-16 28 16 40 16"
          fill="none"
          stroke="#22b8cf"
          strokeWidth="18"
          strokeLinecap="round"
        />
      </svg>
      <span className={styles.word}>Podio</span>
    </Link>
  );
}
