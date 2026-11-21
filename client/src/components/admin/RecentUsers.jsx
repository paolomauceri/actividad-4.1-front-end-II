import { Panel } from './Panel.jsx';
import { parseFecha } from '../../utils/format.js';
import styles from './RecentUsers.module.css';

const ROL = { ADMIN: 'Administrador', JUEZ: 'Juez', ATLETA: 'Atleta' };
const fmt = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' });

const iniciales = (u) => `${u.nombre[0] ?? ''}${u.apellido[0] ?? ''}`.toUpperCase();

/** Últimos usuarios registrados. */
export function RecentUsers({ usuarios }) {
  return (
    <Panel titulo="Usuarios recientes" subtitulo="Últimas cuentas creadas">
      {usuarios.length === 0 ? (
        <p className={styles.empty}>Aún no hay usuarios.</p>
      ) : (
        <ul className={styles.list}>
          {usuarios.map((u) => (
            <li key={u.id} className={styles.item}>
              <span className={styles.avatar} aria-hidden="true">
                {iniciales(u)}
              </span>
              <span className={styles.who}>
                <span className={styles.name}>
                  {u.nombre} {u.apellido}
                </span>
                <span className={styles.email}>{u.email}</span>
              </span>
              <span className={styles.side}>
                <span className={`${styles.rol} ${styles[u.rol.toLowerCase()]}`}>{ROL[u.rol]}</span>
                <span className={styles.date}>{fmt.format(parseFecha(u.creadoEn)).replace('.', '')}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
