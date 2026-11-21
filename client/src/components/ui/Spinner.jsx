import styles from './Spinner.module.css';

/** Indicador de carga accesible (anuncia el texto a lectores de pantalla). */
export function Spinner({ label = 'Cargando…', fullPage = false }) {
  return (
    <div role="status" className={fullPage ? `${styles.wrap} ${styles.fullPage}` : styles.wrap}>
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
