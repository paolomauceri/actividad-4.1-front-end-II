import { Link } from 'react-router-dom';
import styles from './Button.module.css';

/**
 * Botón del sistema de diseño.
 * - variant: 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger'
 * - size: 'md' | 'lg'
 * - to: si se indica, se renderiza como enlace de React Router
 * - loading: deshabilita y muestra un indicador
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  to,
  icon: Icon,
  children,
  className = '',
  disabled,
  type = 'button',
  ...rest
}) {
  const clases = [styles.btn, styles[variant], styles[size], fullWidth ? styles.full : '', className]
    .filter(Boolean)
    .join(' ');

  const contenido = (
    <>
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        Icon && <Icon className={styles.icon} aria-hidden="true" />
      )}
      <span>{children}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={clases} {...rest}>
        {contenido}
      </Link>
    );
  }

  return (
    <button type={type} className={clases} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {contenido}
    </button>
  );
}
