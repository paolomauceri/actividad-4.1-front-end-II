import { WifiOff } from 'lucide-react';
import { useEnLinea } from '../../hooks/useEnLinea.js';
import styles from './OfflineBanner.module.css';

/** Franja que avisa que no hay conexión y que se muestran los datos guardados. */
export function OfflineBanner() {
  const enLinea = useEnLinea();
  if (enLinea) return null;

  return (
    <div className={styles.banner} role="status">
      <WifiOff aria-hidden="true" />
      <span>Sin conexión — mostrando los últimos datos guardados</span>
    </div>
  );
}
