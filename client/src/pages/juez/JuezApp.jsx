import { Route, Routes } from 'react-router-dom';
import { Timer } from 'lucide-react';
import { PanelLayout } from '../../components/panel/PanelLayout.jsx';
import { NotFoundPage } from '../NotFoundPage.jsx';
import PruebasJuezPage from './PruebasJuezPage.jsx';
import RegistroTiemposPage from './RegistroTiemposPage.jsx';

export const SECCIONES_JUEZ = [{ to: '/juez', label: 'Pruebas en curso', icono: Timer, end: true }];

/** Panel del juez (/juez/*): elegir prueba y registrar tiempos. */
export default function JuezApp() {
  return (
    <Routes>
      <Route element={<PanelLayout secciones={SECCIONES_JUEZ} etiqueta="Juez" rolLegible="Juez" inicio="/juez" />}>
        <Route index element={<PruebasJuezPage />} />
        <Route path="pruebas/:pruebaId" element={<RegistroTiemposPage volver="/juez" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
