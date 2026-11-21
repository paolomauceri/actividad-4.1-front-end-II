import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext.jsx';

/** Muestra la ruta actual para poder comprobar redirecciones. */
function RutaActual() {
  const location = useLocation();
  return <p data-testid="ruta">{location.pathname}</p>;
}

/**
 * Renderiza `ui` en `ruta` con un AuthContext simulado.
 * Las demás rutas muestran solo su pathname (para verificar navegación).
 */
export function renderConAuth(ui, { ruta = '/', path = ruta, auth = {}, state } = {}) {
  const valor = {
    usuario: null,
    cargando: false,
    login: async () => {},
    register: async () => {},
    logout: () => {},
    ...auth,
  };
  return render(
    <AuthContext.Provider value={valor}>
      <MemoryRouter initialEntries={[{ pathname: ruta, state }]}>
        <Routes>
          <Route path={path} element={ui} />
          <Route path="*" element={<RutaActual />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}
