import { Bike, Droplets, Footprints, Waves } from 'lucide-react';
import styles from './SportsGrid.module.css';

// Los íconos muestran los tramos que componen cada deporte
const DEPORTES = [
  { nombre: 'Natación', tramos: [Droplets], texto: 'Pruebas en piscina por estilo y distancia, de 50 a 1.500 m.' },
  { nombre: 'Aguas abiertas', tramos: [Waves], texto: 'Travesías en lago, río o mar con salida masiva.' },
  { nombre: 'Acuatlón', tramos: [Waves, Footprints], texto: 'Natación seguida de carrera a pie, sin pausa.' },
  { nombre: 'Triatlón', tramos: [Waves, Bike, Footprints], texto: 'Nado, ciclismo y carrera en una sola prueba continua.' },
  { nombre: 'Atletismo', tramos: [Footprints], texto: 'Carreras de calle y pista: 5 km, 10 km y medio maratón.' },
];

export function SportsGrid() {
  return (
    <section className={`container ${styles.section}`} aria-labelledby="deportes-titulo">
      <div className={styles.head}>
        <h2 id="deportes-titulo">Cinco disciplinas, un mismo sistema</h2>
        <p className={styles.sub}>Cada torneo agrupa pruebas de uno o varios deportes, con categorías por edad y sexo.</p>
      </div>
      <ul className={styles.grid}>
        {DEPORTES.map(({ nombre, tramos, texto }) => (
          <li key={nombre} className={styles.card}>
            <span className={styles.icons} aria-hidden="true">
              {tramos.map((Icono, i) => (
                <Icono key={i} />
              ))}
            </span>
            <h3 className={styles.name}>{nombre}</h3>
            <p className={styles.text}>{texto}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
