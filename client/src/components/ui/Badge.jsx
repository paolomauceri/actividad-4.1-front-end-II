import styles from './Badge.module.css';

/** Etiqueta de estado. tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'primary' */
export function Badge({ tone = 'neutral', children }) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}
