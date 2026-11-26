import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AtletasPage from '../AtletasPage.jsx';
import { renderConAuth } from '../../../test/renderConAuth.jsx';
import { llamadas, mockApi } from '../../../test/mockApi.js';

const admin = { id: 1, nombre: 'Laura', apellido: 'Méndez', rol: 'ADMIN' };
const atleta = (id, nombre, apellido, club) => ({
  id,
  nombre,
  apellido,
  email: `${nombre.toLowerCase()}@podio.local`,
  documento: `DOC${id}`,
  fechaNacimiento: '2000-01-01',
  sexo: 'F',
  club,
  telefono: null,
  activo: true,
});

beforeEach(() => {
  mockApi({
    'GET /api/atletas': (_, path) => {
      const q = new URL(path, 'http://x').searchParams.get('q') ?? '';
      const todos = [atleta(4, 'Valentina', 'Rojas', 'Club Delfines'), atleta(6, 'Camila', 'Torres', 'Tritón Club')];
      const datos = todos.filter((a) => `${a.nombre} ${a.apellido} ${a.club}`.toLowerCase().includes(q.toLowerCase()));
      return { datos, total: datos.length, page: 1, limit: 20 };
    },
  });
});
afterEach(() => {
  delete global.fetch;
});

describe('AtletasPage', () => {
  it('lista los atletas con enlace a su ficha', async () => {
    renderConAuth(<AtletasPage />, { ruta: '/admin/atletas', auth: { usuario: admin } });

    const tabla = await screen.findByRole('table', { name: 'Atletas' });
    expect(within(tabla).getByRole('link', { name: 'Valentina Rojas' })).toHaveAttribute('href', '/admin/atletas/4');
    expect(within(tabla).getByText('Tritón Club')).toBeInTheDocument();
  });

  it('busca mientras se escribe', async () => {
    const user = userEvent.setup();
    renderConAuth(<AtletasPage />, { ruta: '/admin/atletas', auth: { usuario: admin } });
    await screen.findByRole('table', { name: 'Atletas' });

    await user.type(screen.getByRole('searchbox', { name: /buscar/i }), 'Delfines');

    await screen.findByText('1 atleta encontrado');
    expect(screen.queryByText('Camila Torres')).not.toBeInTheDocument();
    expect(llamadas('GET', '/api/atletas').at(-1).path).toBe('/api/atletas?q=Delfines&limit=50');
  });
});
