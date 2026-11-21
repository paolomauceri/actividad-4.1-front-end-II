import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Menu,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { Logo } from '../layout/Logo.jsx';
import { ThemeToggle } from '../layout/ThemeToggle.jsx';
import styles from './AdminLayout.module.css';

export const SECCIONES_ADMIN = [
  { to: '/admin', label: 'Resumen', icono: LayoutDashboard, end: true },
  { to: '/admin/torneos', label: 'Torneos', icono: Trophy, pronto: true },
  { to: '/admin/inscripciones', label: 'Inscripciones', icono: ClipboardList, pronto: true },
  { to: '/admin/resultados', label: 'Resultados', icono: ListOrdered, pronto: true },
  { to: '/admin/usuarios', label: 'Usuarios', icono: Users, pronto: true },
];

/** Estructura del panel: barra lateral de navegación + barra superior + contenido. */
export function AdminLayout() {
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

      <aside className={`${styles.sidebar} ${abierto ? styles.open : ''}`} id="menu-admin">
        <div className={styles.brand}>
          <Logo to="/admin" inverted />
          <span className={styles.tag}>Admin</span>
        </div>
        <nav aria-label="Panel de administración">
          <ul className={styles.nav}>
            {SECCIONES_ADMIN.map(({ to, label, icono: Icono, end, pronto }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
                  <Icono aria-hidden="true" />
                  <span>{label}</span>
                  {pronto && <span className={styles.soon}>Pronto</span>}
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
            aria-controls="menu-admin"
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
              <span className={styles.userRole}>Administrador</span>
            </span>
            <ThemeToggle />
            <button type="button" className={styles.logout} onClick={salir}>
              <LogOut aria-hidden="true" />
              <span>Salir</span>
            </button>
          </div>
        </header>
        <main id="panel-contenido" className={styles.content} tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
