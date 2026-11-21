import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../LoginPage.jsx';
import { ApiError } from '../../api/client.js';
import { renderConAuth } from '../../test/renderConAuth.jsx';

async function completarYEnviar(user, email = 'admin@podio.local', password = 'Admin123!') {
  await user.type(screen.getByLabelText(/correo electrónico/i), email);
  await user.type(screen.getByLabelText(/^contraseña/i), password);
  await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));
}

describe('LoginPage', () => {
  it('valida los campos vacíos sin llamar a la API', async () => {
    const user = userEvent.setup();
    const login = vi.fn();
    renderConAuth(<LoginPage />, { ruta: '/login', auth: { login } });

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(login).not.toHaveBeenCalled();
    expect(screen.getByText('Ingresa tu correo electrónico')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu contraseña')).toBeInTheDocument();
  });

  it('muestra "Correo o contraseña incorrectos" ante un 401', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockRejectedValue(new ApiError(401, 'INVALID_CREDENTIALS', 'Correo o contraseña incorrectos'));
    renderConAuth(<LoginPage />, { ruta: '/login', auth: { login } });

    await completarYEnviar(user, 'admin@podio.local', 'mala1234');

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos');
  });

  it('muestra un mensaje amable cuando no hay conexión', async () => {
    const user = userEvent.setup();
    const login = vi
      .fn()
      .mockRejectedValue(new ApiError(0, 'NETWORK_ERROR', 'No se pudo conectar con el servidor. Intenta de nuevo.'));
    renderConAuth(<LoginPage />, { ruta: '/login', auth: { login } });

    await completarYEnviar(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor. Intenta de nuevo.');
  });

  it('lleva a un ADMIN al panel /admin', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue({ id: 1, nombre: 'Laura', rol: 'ADMIN' });
    renderConAuth(<LoginPage />, { ruta: '/login', auth: { login } });

    await completarYEnviar(user);

    expect(login).toHaveBeenCalledWith('admin@podio.local', 'Admin123!');
    expect(await screen.findByTestId('ruta')).toHaveTextContent('/admin');
  });

  it('lleva a un ATLETA al inicio', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue({ id: 4, nombre: 'Valentina', rol: 'ATLETA' });
    renderConAuth(<LoginPage />, { ruta: '/login', auth: { login } });

    await completarYEnviar(user, 'valentina@podio.local', 'Atleta123!');

    expect(await screen.findByTestId('ruta')).toHaveTextContent(/^\/$/);
  });

  it('vuelve a la página protegida que se quería visitar', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue({ id: 1, nombre: 'Laura', rol: 'ADMIN' });
    renderConAuth(<LoginPage />, {
      ruta: '/login',
      auth: { login },
      state: { from: { pathname: '/admin/usuarios' } },
    });

    await completarYEnviar(user);

    expect(await screen.findByTestId('ruta')).toHaveTextContent('/admin/usuarios');
  });
});
