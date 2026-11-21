import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogIn, LogOut, Menu, UserPlus, X } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { Button } from '../ui/Button.jsx';
import { Logo } from './Logo.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';
import styles from './Navbar.module.css';

const ROL_LEGIBLE = { ADMIN: 'Administrador', JUEZ: 'Juez', ATLETA: 'Atleta' };

const ENLACES = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/#torneos', label: 'Torneos' },
  { to: '/#como-funciona', label: 'Cómo funciona' },
];

export function Navbar() {
  const { usuario, logout } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Cierra el menú móvil al cambiar de página
  useEffect(() => setAbierto(false), [location.pathname, location.hash]);

  const salir = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Logo />

        <nav aria-label="Principal" className={`${styles.nav} ${abierto ? styles.open : ''}`} id="menu-principal">
          <ul className={styles.links}>
            {ENLACES.map((e) => (
              <li key={e.label}>
                <NavLink
                  to={e.to}
                  end={e.end}
                  className={({ isActive }) =>
                    `${styles.link} ${isActive && !location.hash && e.end ? styles.active : ''}`
                  }
                >
                  {e.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            {usuario ? (
              <>
                <span className={styles.user}>
                  <span className={styles.userName}>{usuario.nombre}</span>
                  <span className={styles.role}>{ROL_LEGIBLE[usuario.rol]}</span>
                </span>
                {usuario.rol === 'ADMIN' && (
                  <Button to="/admin" variant="secondary" icon={LayoutDashboard}>
                    Panel
                  </Button>
                )}
                <Button variant="ghost" icon={LogOut} onClick={salir}>
                  Salir
                </Button>
              </>
            ) : (
              <>
                <Button to="/login" variant="ghost" icon={LogIn}>
                  Iniciar sesión
                </Button>
                <Button to="/registro" variant="accent" icon={UserPlus}>
                  Inscríbete
                </Button>
              </>
            )}
          </div>
        </nav>

        <div className={styles.tools}>
          <ThemeToggle />
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={abierto}
            aria-controls="menu-principal"
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setAbierto((v) => !v)}
          >
            {abierto ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
