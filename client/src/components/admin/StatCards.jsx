import { CalendarClock, ClipboardList, Trophy, Users } from 'lucide-react';
import styles from './StatCards.module.css';

const INDICADORES = [
  { clave: 'torneosActivos', etiqueta: 'Torneos activos', ayuda: 'Abiertos o en curso', icono: Trophy },
  { clave: 'atletas', etiqueta: 'Atletas', ayuda: 'Registrados en la plataforma', icono: Users },
  { clave: 'inscripciones', etiqueta: 'Inscripciones', ayuda: 'Sin contar anuladas', icono: ClipboardList },
  { clave: 'pruebasProximas', etiqueta: 'Pruebas próximas', ayuda: 'Programadas desde hoy', icono: CalendarClock },
];

const numero = new Intl.NumberFormat('es');

/** Cuatro indicadores principales del resumen. */
export function StatCards({ resumen }) {
  return (
    <ul className={styles.grid} aria-label="Indicadores">
      {INDICADORES.map(({ clave, etiqueta, ayuda, icono: Icono }) => (
        <li key={clave} className={styles.card}>
          <span className={styles.icon} aria-hidden="true">
            <Icono />
          </span>
          <span className={styles.label}>{etiqueta}</span>
          <span className={`${styles.value} num`}>{numero.format(resumen[clave])}</span>
          <span className={styles.help}>{ayuda}</span>
        </li>
      ))}
    </ul>
  );
}
