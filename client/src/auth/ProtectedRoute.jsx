import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';

/**
 * Protege una ruta: exige sesión y, opcionalmente, uno de los roles indicados.
 * Sin sesión → /login (recordando a dónde quería ir). Rol sin permiso → inicio.
 */
export function ProtectedRoute({ roles, children }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) return <Spinner label="Cargando sesión…" fullPage />;
  if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/" replace />;

  return children;
}
