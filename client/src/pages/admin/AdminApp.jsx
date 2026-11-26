import { Route, Routes } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout.jsx';
import DashboardPage from './DashboardPage.jsx';
import TorneosPage from './TorneosPage.jsx';
import TorneoDetallePage from './TorneoDetallePage.jsx';
import AtletasPage from './AtletasPage.jsx';
import AtletaDetallePage from './AtletaDetallePage.jsx';
import UsuariosPage from './UsuariosPage.jsx';
import PruebasJuezPage from '../juez/PruebasJuezPage.jsx';
import RegistroTiemposPage from '../juez/RegistroTiemposPage.jsx';
import { NotFoundPage } from '../NotFoundPage.jsx';

// El admin registra y corrige tiempos con las mismas pantallas del juez,
// también en torneos FINALIZADO (la API solo se lo permite al ADMIN).
const ESTADOS_RESULTADOS = ['EN_CURSO', 'FINALIZADO'];

/** Rutas del panel de administración (/admin/*). */
export default function AdminApp() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="torneos" element={<TorneosPage />} />
        <Route path="torneos/:id" element={<TorneoDetallePage />} />
        <Route path="atletas" element={<AtletasPage />} />
        <Route path="atletas/:id" element={<AtletaDetallePage />} />
        <Route path="usuarios" element={<UsuariosPage />} />
        <Route
          path="resultados"
          element={
            <PruebasJuezPage
              base="/admin/resultados"
              estados={ESTADOS_RESULTADOS}
              antetitulo="Administración"
              titulo="Resultados"
              descripcion="Registra o corrige los tiempos de los torneos en curso y finalizados."
            />
          }
        />
        <Route path="resultados/:pruebaId" element={<RegistroTiemposPage volver="/admin/resultados" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
