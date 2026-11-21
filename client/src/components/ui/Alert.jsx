import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import styles from './Alert.module.css';

const ICONOS = { error: AlertCircle, success: CheckCircle2, info: Info, warning: TriangleAlert };

/** Mensaje destacado. Los errores se anuncian de inmediato (role="alert"). */
export function Alert({ tone = 'info', title, children, action }) {
  const Icono = ICONOS[tone];
  return (
    <div className={`${styles.alert} ${styles[tone]}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icono className={styles.icon} aria-hidden="true" />
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div className={styles.text}>{children}</div>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
