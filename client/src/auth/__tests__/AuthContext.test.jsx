import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext.jsx';
import { TOKEN_KEY, setToken } from '../../api/token.js';

function EstadoSesion() {
  const { usuario, cargando } = useAuth();
  if (cargando) return <p>cargando</p>;
  return <p>{usuario ? `sesión de ${usuario.nombre}` : 'sin sesión'}</p>;
}

const json = (status, body) =>
  Promise.resolve(new Response(body === undefined ? '' : JSON.stringify(body), { status }));

beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
afterEach(() => vi.unstubAllGlobals());

describe('AuthProvider al abrir la app con un token guardado', () => {
  it('recupera el usuario con /api/auth/me', async () => {
    setToken('token-valido');
    fetch.mockReturnValue(json(200, { usuario: { id: 1, nombre: 'Laura', rol: 'ADMIN' } }));

    render(<AuthProvider><EstadoSesion /></AuthProvider>);

    expect(await screen.findByText('sesión de Laura')).toBeInTheDocument();
  });

  it.each([
    ['la API está caída detrás del proxy (502 sin cuerpo)', () => json(502)],
    ['la base de datos no responde (503 DB_UNAVAILABLE)', () => json(503, { error: { code: 'DB_UNAVAILABLE', message: 'Sin base de datos' } })],
    ['no hay red', () => Promise.reject(new TypeError('Failed to fetch'))],
  ])('conserva el token si %s', async (_caso, respuesta) => {
    setToken('token-valido');
    fetch.mockImplementation(respuesta);

    render(<AuthProvider><EstadoSesion /></AuthProvider>);

    await waitFor(() => expect(screen.queryByText('cargando')).not.toBeInTheDocument());
    expect(localStorage.getItem(TOKEN_KEY)).toBe('token-valido');
  });

  it('borra el token si el servidor responde 401 (sesión vencida)', async () => {
    setToken('token-vencido');
    fetch.mockReturnValue(json(401, { error: { code: 'UNAUTHORIZED', message: 'Sesión expirada' } }));

    render(<AuthProvider><EstadoSesion /></AuthProvider>);

    expect(await screen.findByText('sin sesión')).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
