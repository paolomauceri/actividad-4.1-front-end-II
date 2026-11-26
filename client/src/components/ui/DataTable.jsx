import styles from './DataTable.module.css';

/**
 * Tabla responsive: en pantallas anchas es una tabla; en el móvil cada fila
 * se apila como tarjeta y cada celda muestra su etiqueta (data-label).
 *
 * @param {{
 *   titulo: string,                       // nombre accesible de la tabla
 *   columnas: { clave: string, titulo: string, render?: (fila) => import('react').ReactNode, className?: string }[],
 *   filas: object[],
 *   getId?: (fila) => string | number,
 *   vacio?: import('react').ReactNode,    // contenido si no hay filas
 *   getClaseFila?: (fila) => string | undefined, // clase extra para resaltar una fila
 * }} props
 */
export function DataTable({ titulo, columnas, filas, getId = (f) => f.id, vacio = 'No hay datos para mostrar.', getClaseFila }) {
  if (!filas.length) {
    return <p className={styles.vacio}>{vacio}</p>;
  }

  return (
    <div className={styles.contenedor}>
      <table className={styles.tabla} aria-label={titulo}>
        <thead>
          <tr>
            {columnas.map((c) => (
              <th key={c.clave} scope="col" className={c.className}>
                {c.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr key={getId(fila)} className={getClaseFila?.(fila)}>
              {columnas.map((c) => (
                <td key={c.clave} data-label={c.titulo} className={c.className}>
                  <div className={styles.valor}>{c.render ? c.render(fila) : fila[c.clave]}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
