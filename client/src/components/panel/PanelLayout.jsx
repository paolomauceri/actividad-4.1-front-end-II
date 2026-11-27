import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ExternalLink, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { Logo } from '../layout/Logo.jsx';
import { ThemeToggle } from '../layout/ThemeToggle.jsx';
import { OfflineBanner } from '../layout/OfflineBanner.jsx';
import styles from './PanelLayout.module.css';

/**
 * Estructura común de los paneles (admin, juez y atleta):
 * barra lateral de navegación + barra superior + contenido.
 *
 * @param {{
 *   secciones: { to: string, label: string, icono: import('react').ComponentType, end?: boolean }[],
 *   etiqueta: string,      // texto junto al logo ("Admin", "Juez", "Atleta")
 *   rolLegible: string,    // rol bajo el nombre del usuario
 *   inicio: string,        // ruta del logo
 * }} props
 */
export function PanelLayout({ secciones, etiqueta, rolLegible, inicio }) {
  const { usuario, logout } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setAbierto(false), [location.pathname]);

  const salir = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={styles.shell}>
      <a href="#panel-contenido" className="skip-link">
        Saltar al contenido
      </a>

      <aside className={`${styles.sidebar} ${abierto ? styles.open : ''}`} id="menu-panel">
        <div className={styles.brand}>
          <Logo to={inicio} inverted />
          <span className={styles.tag}>{etiqueta}</span>
        </div>
        <nav aria-label={`Panel de ${etiqueta.toLowerCase()}`}>
          <ul className={styles.nav}>
            {secciones.map(({ to, label, icono: Icono, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
                  <Icono aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <a href="/" className={styles.publico}>
          <ExternalLink aria-hidden="true" />
          Ver sitio público
        </a>
      </aside>

      {abierto && <div className={styles.overlay} onClick={() => setAbierto(false)} aria-hidden="true" />}

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={abierto}
            aria-controls="menu-panel"
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setAbierto((v) => !v)}
          >
            {abierto ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <div className={styles.tools}>
            <span className={styles.user}>
              <span className={styles.userName}>
                {usuario?.nombre} {usuario?.apellido}
              </span>
              <span className={styles.userRole}>{rolLegible}</span>
            </span>
            <ThemeToggle />
            <button type="button" className={styles.logout} onClick={salir}>
              <LogOut aria-hidden="true" />
              <span>Salir</span>
            </button>
          </div>
        </header>
        <OfflineBanner />
        <main id="panel-contenido" className={styles.content} tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
