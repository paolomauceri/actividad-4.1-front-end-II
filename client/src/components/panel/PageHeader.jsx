import styles from './PageHeader.module.css';

/** Encabezado de las páginas de los paneles: antetítulo, título, descripción y acciones. */
export function PageHeader({ antetitulo, titulo, descripcion, acciones, children }) {
  return (
    <header className={styles.head}>
      <div className={styles.textos}>
        {antetitulo && <p className={styles.eyebrow}>{antetitulo}</p>}
        <h1 className={styles.title}>{titulo}</h1>
        {descripcion && <p className={styles.sub}>{descripcion}</p>}
        {children}
      </div>
      {acciones && <div className={styles.acciones}>{acciones}</div>}
    </header>
  );
}
