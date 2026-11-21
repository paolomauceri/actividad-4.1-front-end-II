import { formatFechaHora } from '../../utils/format.js';
import { Panel } from './Panel.jsx';
import styles from './UpcomingEventsTable.module.css';

/** Próximas pruebas con barra de ocupación del cupo. */
export function UpcomingEventsTable({ pruebas }) {
  return (
    <Panel titulo="Próximas pruebas" subtitulo="Las 5 siguientes según fecha y hora">
      {pruebas.length === 0 ? (
        <p className={styles.empty}>No hay pruebas programadas desde hoy.</p>
      ) : (
        <div className={styles.scroll}>
          <table className={styles.table}>
            <caption className="sr-only">Próximas pruebas con inscritos y cupo</caption>
            <thead>
              <tr>
                <th scope="col">Prueba</th>
                <th scope="col">Fecha</th>
                <th scope="col">Inscritos</th>
              </tr>
            </thead>
            <tbody>
              {pruebas.map((p) => {
                const porcentaje = p.cupo ? Math.min(100, Math.round((p.inscritos / p.cupo) * 100)) : null;
                return (
                  <tr key={p.id}>
                    <td>
                      <span className={styles.name}>{p.nombre}</span>
                      <span className={styles.sub}>
                        {p.deporte} · {p.torneo}
                      </span>
                    </td>
                    <td className={`${styles.date} num`}>{formatFechaHora(p.fechaHora)}</td>
                    <td>
                      <span className={`${styles.count} num`}>{p.cupo ? `${p.inscritos} / ${p.cupo}` : p.inscritos}</span>
                      {porcentaje !== null && (
                        <span className={styles.track} aria-hidden="true">
                          <span className={styles.fill} style={{ width: `${Math.max(porcentaje, 2)}%` }} />
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
