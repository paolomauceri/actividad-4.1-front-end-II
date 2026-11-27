import { Link } from 'react-router-dom';
import { CalendarClock, ClipboardList, Trophy, Users } from 'lucide-react';
import styles from './StatCards.module.css';

// Cada tarjeta lleva a la sección donde se gestiona ese dato
const INDICADORES = [
  { clave: 'torneosActivos', etiqueta: 'Torneos activos', ayuda: 'Abiertos o en curso', icono: Trophy, to: '/admin/torneos' },
  { clave: 'atletas', etiqueta: 'Atletas', ayuda: 'Registrados en la plataforma', icono: Users, to: '/admin/atletas' },
  { clave: 'inscripciones', etiqueta: 'Inscripciones', ayuda: 'Sin contar anuladas', icono: ClipboardList, to: '/admin/torneos' },
  { clave: 'pruebasProximas', etiqueta: 'Pruebas próximas', ayuda: 'Programadas desde hoy', icono: CalendarClock, to: '/admin/resultados' },
];

const numero = new Intl.NumberFormat('es');

/** Cuatro indicadores principales del resumen; cada uno enlaza a su sección. */
export function StatCards({ resumen }) {
  return (
    <ul className={styles.grid} aria-label="Indicadores">
      {INDICADORES.map(({ clave, etiqueta, ayuda, icono: Icono, to }) => (
        <li key={clave}>
          <Link to={to} className={styles.card}>
            <span className={styles.icon} aria-hidden="true">
              <Icono />
            </span>
            <span className={styles.label}>{etiqueta}</span>
            <span className={`${styles.value} num`}>{numero.format(resumen[clave])}</span>
            <span className={styles.help}>{ayuda}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
