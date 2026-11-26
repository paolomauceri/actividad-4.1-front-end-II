import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';
import { ProtectedRoute } from '../ProtectedRoute.jsx';

function renderEn(ruta, valorAuth) {
  return render(
    <AuthContext.Provider value={valorAuth}>
      <MemoryRouter initialEntries={[ruta]}>
        <Routes>
          <Route path="/" element={<p>Página de inicio</p>} />
          <Route path="/login" element={<p>Página de login</p>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <p>Panel de administración</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

const base = { login: async () => {}, register: async () => {}, logout: () => {} };

describe('ProtectedRoute', () => {
  it('muestra un indicador de carga mientras se verifica la sesión', () => {
    renderEn('/admin', { ...base, usuario: null, cargando: true });

    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i);
    expect(screen.queryByText('Panel de administración')).not.toBeInTheDocument();
  });

  it('redirige a /login cuando no hay sesión', () => {
    renderEn('/admin', { ...base, usuario: null, cargando: false });

    expect(screen.getByText('Página de login')).toBeInTheDocument();
  });

  it('redirige al inicio cuando el rol no tiene permiso', () => {
    renderEn('/admin', { ...base, usuario: { id: 4, rol: 'ATLETA' }, cargando: false });

    expect(screen.getByText('Página de inicio')).toBeInTheDocument();
  });

  it('muestra el contenido cuando el rol tiene permiso', () => {
    renderEn('/admin', { ...base, usuario: { id: 1, rol: 'ADMIN' }, cargando: false });

    expect(screen.getByText('Panel de administración')).toBeInTheDocument();
  });
});
