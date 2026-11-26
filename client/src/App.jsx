import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout.jsx';
import { ProtectedRoute } from './auth/ProtectedRoute.jsx';
import { Spinner } from './components/ui/Spinner.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

// Páginas que no se necesitan al abrir la app: se cargan bajo demanda
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const AdminApp = lazy(() => import('./pages/admin/AdminApp.jsx'));
const AtletaApp = lazy(() => import('./pages/atleta/AtletaApp.jsx'));
const JuezApp = lazy(() => import('./pages/juez/JuezApp.jsx'));
const TorneosPublicPage = lazy(() => import('./pages/TorneosPublicPage.jsx'));
const TorneoPublicPage = lazy(() => import('./pages/TorneoPublicPage.jsx'));
const ResultadosPage = lazy(() => import('./pages/ResultadosPage.jsx'));

export default function App() {
  return (
    <Suspense fallback={<Spinner fullPage />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="registro" element={<RegisterPage />} />
          <Route path="torneos" element={<TorneosPublicPage />} />
          <Route path="torneos/:id" element={<TorneoPublicPage />} />
          <Route path="resultados/:pruebaId" element={<ResultadosPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route
          path="atleta/*"
          element={
            <ProtectedRoute roles={['ATLETA']}>
              <AtletaApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="juez/*"
          element={
            <ProtectedRoute roles={['JUEZ', 'ADMIN']}>
              <JuezApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/*"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminApp />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}
