import { Route, Routes } from 'react-router-dom';
import { ClipboardList, Medal, UserRound, UserPlus } from 'lucide-react';
import { PanelLayout } from '../../components/panel/PanelLayout.jsx';
import { NotFoundPage } from '../NotFoundPage.jsx';
import MisInscripcionesPage from './MisInscripcionesPage.jsx';
import InscribirmePage from './InscribirmePage.jsx';
import PerfilPage from './PerfilPage.jsx';
import MisResultadosPage from './MisResultadosPage.jsx';

export const SECCIONES_ATLETA = [
  { to: '/atleta', label: 'Mis inscripciones', icono: ClipboardList, end: true },
  { to: '/atleta/inscribirme', label: 'Inscribirme', icono: UserPlus },
  { to: '/atleta/resultados', label: 'Mis resultados', icono: Medal },
  { to: '/atleta/perfil', label: 'Mi perfil', icono: UserRound },
];

/** Panel del atleta (/atleta/*). */
export default function AtletaApp() {
  return (
    <Routes>
      <Route element={<PanelLayout secciones={SECCIONES_ATLETA} etiqueta="Atleta" rolLegible="Atleta" inicio="/atleta" />}>
        <Route index element={<MisInscripcionesPage />} />
        <Route path="inscribirme" element={<InscribirmePage />} />
        <Route path="resultados" element={<MisResultadosPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
