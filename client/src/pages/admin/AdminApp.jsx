import { Route, Routes } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout.jsx';
import DashboardPage from './DashboardPage.jsx';
import ComingSoonPage from './ComingSoonPage.jsx';
import { NotFoundPage } from '../NotFoundPage.jsx';

const PROXIMAMENTE = [
  { path: 'torneos', titulo: 'Gestión de torneos', descripcion: 'Crear torneos, pruebas y categorías, y abrir o cerrar inscripciones.' },
  { path: 'inscripciones', titulo: 'Inscripciones', descripcion: 'Confirmar o anular inscripciones y asignar dorsales.' },
  { path: 'resultados', titulo: 'Resultados', descripcion: 'Registro de tiempos por el juez y clasificación en vivo por categoría.' },
  { path: 'usuarios', titulo: 'Usuarios', descripcion: 'Listado completo, activación y desactivación de cuentas.' },
];

/** Rutas del panel de administración (/admin/*). */
export default function AdminApp() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        {PROXIMAMENTE.map((s) => (
          <Route key={s.path} path={s.path} element={<ComingSoonPage titulo={s.titulo} descripcion={s.descripcion} />} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
