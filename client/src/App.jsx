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

export default function App() {
  return (
    <Suspense fallback={<Spinner fullPage />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="registro" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
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
