import styles from './Panel.module.css';

/** Tarjeta de sección del panel de administración con título y acciones opcionales. */
export function Panel({ titulo, subtitulo, acciones, children, className = '' }) {
  return (
    <section className={`${styles.panel} ${className}`}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>{titulo}</h2>
          {subtitulo && <p className={styles.sub}>{subtitulo}</p>}
        </div>
        {acciones}
      </header>
      {children}
    </section>
  );
}
