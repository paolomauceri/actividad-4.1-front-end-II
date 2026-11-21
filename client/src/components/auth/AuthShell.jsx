import { Medal, Timer, Trophy } from 'lucide-react';
import styles from './AuthShell.module.css';

const BENEFICIOS = [
  { icono: Trophy, texto: 'Inscríbete en torneos de agua y pista en minutos' },
  { icono: Timer, texto: 'Tu tiempo oficial, registrado por el juez en la meta' },
  { icono: Medal, texto: 'Resultados por categoría, actualizados al instante' },
];

/** Marco común de las páginas de inicio de sesión y registro. */
export function AuthShell({ titulo, subtitulo, children, pie }) {
  return (
    <div className={`container ${styles.shell}`}>
      <aside className={styles.panel} aria-hidden="true">
        <p className={styles.eyebrow}>Podio</p>
        <p className={styles.claim}>Del registro al podio, en un solo lugar.</p>
        <ul className={styles.beneficios}>
          {BENEFICIOS.map(({ icono: Icono, texto }) => (
            <li key={texto}>
              <Icono className={styles.icono} />
              <span>{texto}</span>
            </li>
          ))}
        </ul>
      </aside>

      <section className={styles.card}>
        <h1 className={styles.titulo}>{titulo}</h1>
        {subtitulo && <p className={styles.subtitulo}>{subtitulo}</p>}
        {children}
        {pie && <div className={styles.pie}>{pie}</div>}
      </section>
    </div>
  );
}
