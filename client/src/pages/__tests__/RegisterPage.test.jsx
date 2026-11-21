import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '../RegisterPage.jsx';
import { ApiError } from '../../api/client.js';
import { renderConAuth } from '../../test/renderConAuth.jsx';

async function completarFormulario(user, cambios = {}) {
  const datos = {
    nombre: 'Ana',
    apellido: 'Gómez',
    email: 'ana@correo.com',
    password: 'Segura123',
    confirmar: 'Segura123',
    documento: '24567890',
    fecha: '2000-05-20',
    ...cambios,
  };
  await user.type(screen.getByLabelText(/^nombre/i), datos.nombre);
  await user.type(screen.getByLabelText(/^apellido/i), datos.apellido);
  await user.type(screen.getByLabelText(/correo electrónico/i), datos.email);
  await user.type(screen.getByLabelText(/^contraseña/i), datos.password);
  await user.type(screen.getByLabelText(/confirmar contraseña/i), datos.confirmar);
  await user.type(screen.getByLabelText(/documento/i), datos.documento);
  await user.type(screen.getByLabelText(/fecha de nacimiento/i), datos.fecha);
  await user.selectOptions(screen.getByLabelText(/^sexo/i), 'F');
}

const enviar = (user) => user.click(screen.getByRole('button', { name: /crear mi cuenta/i }));

describe('RegisterPage', () => {
  it('muestra errores por campo y no llama a la API si el formulario está vacío', async () => {
    const user = userEvent.setup();
    const register = vi.fn();
    renderConAuth(<RegisterPage />, { ruta: '/registro', auth: { register } });

    await enviar(user);

    expect(register).not.toHaveBeenCalled();
    expect(screen.getAllByText('Este campo es obligatorio').length).toBeGreaterThanOrEqual(4);
    expect(screen.getByLabelText(/^nombre/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('avisa si las contraseñas no coinciden', async () => {
    const user = userEvent.setup();
    const register = vi.fn();
    renderConAuth(<RegisterPage />, { ruta: '/registro', auth: { register } });

    await completarFormulario(user, { confirmar: 'Distinta123' });
    await enviar(user);

    expect(register).not.toHaveBeenCalled();
    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
  });

  it('exige una contraseña con letras y números', async () => {
    const user = userEvent.setup();
    const register = vi.fn();
    renderConAuth(<RegisterPage />, { ruta: '/registro', auth: { register } });

    await completarFormulario(user, { password: 'soloLetras', confirmar: 'soloLetras' });
    await enviar(user);

    expect(register).not.toHaveBeenCalled();
    expect(screen.getByText(/al menos 8 caracteres/i)).toBeInTheDocument();
  });

  it('muestra el error del servidor bajo el campo correspondiente (409 EMAIL_TAKEN)', async () => {
    const user = userEvent.setup();
    const register = vi.fn().mockRejectedValue(
      new ApiError(409, 'EMAIL_TAKEN', 'Este correo ya está registrado', [
        { campo: 'email', mensaje: 'Este correo ya está registrado' },
      ]),
    );
    renderConAuth(<RegisterPage />, { ruta: '/registro', auth: { register } });

    await completarFormulario(user);
    await enviar(user);

    expect(await screen.findByText('Este correo ya está registrado')).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('envía los datos sin la confirmación y lleva al inicio al registrarse', async () => {
    const user = userEvent.setup();
    const register = vi.fn().mockResolvedValue({ id: 20, nombre: 'Ana', rol: 'ATLETA' });
    renderConAuth(<RegisterPage />, { ruta: '/registro', auth: { register } });

    await completarFormulario(user);
    await enviar(user);

    expect(register).toHaveBeenCalledWith({
      nombre: 'Ana',
      apellido: 'Gómez',
      email: 'ana@correo.com',
      password: 'Segura123',
      documento: '24567890',
      fechaNacimiento: '2000-05-20',
      sexo: 'F',
      club: '',
      telefono: '',
    });
    expect(await screen.findByTestId('ruta')).toHaveTextContent(/^\/$/);
  });
});
