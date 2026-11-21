import { ListOrdered, Timer, UserPlus } from 'lucide-react';
import styles from './HowItWorks.module.css';

const PASOS = [
  {
    icono: UserPlus,
    titulo: 'Inscríbete',
    texto: 'Crea tu cuenta de atleta, elige la prueba y recibe tu número de dorsal.',
  },
  {
    icono: Timer,
    titulo: 'Compite',
    texto: 'Al cruzar la meta, el juez registra tu tiempo oficial desde su celular.',
  },
  {
    icono: ListOrdered,
    titulo: 'Revisa tu posición',
    texto: 'La clasificación por categoría se actualiza en cuanto se registra cada tiempo.',
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className={styles.section} aria-labelledby="como-titulo">
      <div className="container">
        <h2 id="como-titulo">Cómo funciona</h2>
        <ol className={styles.steps}>
          {PASOS.map(({ icono: Icono, titulo, texto }, i) => (
            <li key={titulo} className={styles.step}>
              <span className={`${styles.number} num`} aria-hidden="true">
                {i + 1}
              </span>
              <Icono className={styles.icon} aria-hidden="true" />
              <h3 className={styles.title}>{titulo}</h3>
              <p className={styles.text}>{texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
