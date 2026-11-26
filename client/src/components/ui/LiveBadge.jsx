import styles from './LiveBadge.module.css';

/** Indicador de conexión en tiempo real con el servidor. */
export function LiveBadge({ enVivo }) {
  return (
    <span className={`${styles.badge} ${enVivo ? styles.vivo : styles.sinConexion}`} role="status">
      <span className={styles.punto} aria-hidden="true" />
      {enVivo ? 'En vivo' : 'Sin conexión en vivo'}
    </span>
  );
}
