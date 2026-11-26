import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UsuariosPage from '../UsuariosPage.jsx';
import { renderConAuth } from '../../../test/renderConAuth.jsx';
import { llamadas, mockApi } from '../../../test/mockApi.js';

const admin = { id: 1, nombre: 'Laura', apellido: 'Méndez', rol: 'ADMIN' };
let usuarios;

beforeEach(() => {
  usuarios = [
    { id: 1, nombre: 'Laura', apellido: 'Méndez', email: 'admin@podio.local', rol: 'ADMIN', activo: true, creadoEn: '2026-09-01 09:00:00' },
    { id: 2, nombre: 'Ricardo', apellido: 'Paredes', email: 'juez@podio.local', rol: 'JUEZ', activo: true, creadoEn: '2026-09-02 10:00:00' },
  ];
  mockApi({
    'GET /api/usuarios': () => ({ data: usuarios, total: usuarios.length, page: 1, limit: 100 }),
    'PATCH /api/usuarios/2/activo': (body) => {
      usuarios[1] = { ...usuarios[1], activo: body.activo };
      return { usuario: usuarios[1] };
    },
  });
});
afterEach(() => {
  delete global.fetch;
});

describe('UsuariosPage', () => {
  it('desactiva una cuenta y lo refleja en la tabla', async () => {
    const user = userEvent.setup();
    renderConAuth(<UsuariosPage />, { ruta: '/admin/usuarios', auth: { usuario: admin } });

    const fila = (await screen.findByText('Ricardo Paredes')).closest('tr');
    expect(fila).toHaveTextContent('Activo');
    await user.click(within(fila).getByRole('button', { name: /desactivar/i }));

    expect(llamadas('PATCH', '/api/usuarios/2/activo')[0].body).toEqual({ activo: false });
    expect(await within(fila).findByText('Inactivo')).toBeInTheDocument();
  });

  it('no ofrece desactivar la propia cuenta', async () => {
    renderConAuth(<UsuariosPage />, { ruta: '/admin/usuarios', auth: { usuario: admin } });

    const fila = (await screen.findByText('Laura Méndez')).closest('tr');
    expect(within(fila).queryByRole('button', { name: /desactivar/i })).not.toBeInTheDocument();
    expect(fila).toHaveTextContent('Tu cuenta');
  });
});
