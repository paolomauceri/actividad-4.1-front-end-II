import { Panel } from './Panel.jsx';
import styles from './SportsChart.module.css';

const porcentaje = new Intl.NumberFormat('es', { style: 'percent', maximumFractionDigits: 0 });

/**
 * Gráfico de barras horizontales (una sola serie) construido como tabla:
 * así también sirve como vista tabular accesible. Cada fila muestra un
 * tooltip al pasar el mouse o al enfocarla con el teclado.
 */
export function SportsChart({ datos }) {
  const ordenados = [...datos].sort((a, b) => b.total - a.total || a.deporte.localeCompare(b.deporte));
  const maximo = Math.max(1, ...ordenados.map((d) => d.total));
  const total = ordenados.reduce((s, d) => s + d.total, 0);

  return (
    <Panel titulo="Inscripciones por deporte" subtitulo={`${total} inscripciones activas en total`}>
      <table className={styles.chart}>
        <caption className="sr-only">Inscripciones por deporte</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Deporte</th>
            <th scope="col">Barra</th>
            <th scope="col">Inscripciones</th>
          </tr>
        </thead>
        <tbody>
          {ordenados.map((d) => {
            const ancho = (d.total / maximo) * 100;
            const parte = total ? porcentaje.format(d.total / total) : '0 %';
            return (
              <tr key={d.deporte} className={styles.row} tabIndex={0}>
                <th scope="row" className={styles.label}>
                  {d.deporte}
                </th>
                <td className={styles.barCell} aria-hidden="true">
                  <span className={styles.bar} style={{ width: d.total ? `${ancho}%` : '0' }} />
                  <span className={styles.tip} role="tooltip">
                    <strong>{d.deporte}</strong>
                    <span className="num">
                      {d.total} {d.total === 1 ? 'inscripción' : 'inscripciones'} · {parte}
                    </span>
                  </span>
                </td>
                <td className={`${styles.value} num`}>{d.total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Panel>
  );
}
