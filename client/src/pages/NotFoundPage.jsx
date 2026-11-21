import { Home } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <section className={`container ${styles.wrap}`}>
      <p className={`${styles.code} num`} aria-hidden="true">
        404
      </p>
      <h1>Esta página no existe</h1>
      <p className={styles.text}>Puede que el enlace esté mal escrito o que la página se haya movido.</p>
      <Button to="/" icon={Home}>
        Volver al inicio
      </Button>
    </section>
  );
}
