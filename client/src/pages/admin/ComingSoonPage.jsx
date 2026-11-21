import { Construction } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import styles from './ComingSoonPage.module.css';

/** Secciones del panel que se construyen en el Sprint 2. */
export default function ComingSoonPage({ titulo, descripcion }) {
  return (
    <section className={styles.wrap}>
      <span className={styles.icon} aria-hidden="true">
        <Construction />
      </span>
      <h1 className={styles.title}>{titulo}</h1>
      <p className={styles.text}>{descripcion}</p>
      <p className={styles.badge}>Disponible en el Sprint 2</p>
      <Button to="/admin" variant="secondary">
        Volver al resumen
      </Button>
    </section>
  );
}
