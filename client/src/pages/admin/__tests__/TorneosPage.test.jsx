import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TorneosPage from '../TorneosPage.jsx';
import { renderConAuth } from '../../../test/renderConAuth.jsx';
import { llamadas, mockApi } from '../../../test/mockApi.js';

const admin = { id: 1, nombre: 'Laura', apellido: 'Méndez', rol: 'ADMIN' };

const torneo = (id, nombre, estado, extra = {}) => ({
  id,
  nombre,
  descripcion: null,
  sede: 'Lago Azul',
  fechaInicio: '2026-12-12',
  fechaFin: '2026-12-13',
  estado,
  totalPruebas: 3,
  totalInscritos: 10,
  deportes: ['Aguas abiertas'],
  ...extra,
});

let lista;

beforeEach(() => {
  lista = [torneo(1, 'Copa Lago Azul', 'ABIERTO'), torneo(4, 'Media Maratón', 'BORRADOR', { totalPruebas: 1, totalInscritos: 0 })];
  mockApi({
    'GET /api/torneos': () => ({ datos: lista, total: lista.length, page: 1, limit: 100 }),
    'POST /api/torneos': (body) => {
      const nuevo = torneo(9, body.nombre, 'BORRADOR', { sede: body.sede, totalPruebas: 0, totalInscritos: 0 });
      lista = [nuevo, ...lista];
      return [201, { torneo: nuevo }];
    },
  });
});
afterEach(() => {
  delete global.fetch;
});

const renderPagina = () => renderConAuth(<TorneosPage />, { ruta: '/admin/torneos', auth: { usuario: admin } });

describe('TorneosPage', () => {
  it('lista los torneos con su estado, pruebas e inscritos', async () => {
    renderPagina();

    const tabla = await screen.findByRole('table', { name: 'Torneos' });
    const fila = within(tabla).getByText('Copa Lago Azul').closest('tr');
    expect(fila).toHaveTextContent('Abierto');
    expect(fila).toHaveTextContent('10');
    expect(within(tabla).getByText('Media Maratón').closest('tr')).toHaveTextContent('Borrador');
    expect(within(tabla).getByRole('link', { name: 'Copa Lago Azul' })).toHaveAttribute('href', '/admin/torneos/1');
  });

  it('crea un torneo desde el diálogo', async () => {
    const user = userEvent.setup();
    renderPagina();
    await screen.findByRole('table', { name: 'Torneos' });

    await user.click(screen.getByRole('button', { name: /nuevo torneo/i }));
    const dialogo = screen.getByRole('dialog', { name: /nuevo torneo/i });
    await user.type(within(dialogo).getByLabelText(/^nombre/i), 'Copa de Verano');
    await user.type(within(dialogo).getByLabelText(/^sede/i), 'Club Náutico');
    await user.type(within(dialogo).getByLabelText(/fecha de inicio/i), '2027-01-15');
    await user.type(within(dialogo).getByLabelText(/fecha de fin/i), '2027-01-16');
    await user.click(within(dialogo).getByRole('button', { name: /crear torneo/i }));

    expect(await screen.findByText('Copa de Verano')).toBeInTheDocument();
    expect(llamadas('POST', '/api/torneos')[0].body).toEqual({
      nombre: 'Copa de Verano',
      descripcion: null,
      sede: 'Club Náutico',
      fechaInicio: '2027-01-15',
      fechaFin: '2027-01-16',
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('valida en el formulario que la fecha de fin no sea anterior', async () => {
    const user = userEvent.setup();
    renderPagina();
    await screen.findByRole('table', { name: 'Torneos' });

    await user.click(screen.getByRole('button', { name: /nuevo torneo/i }));
    const dialogo = screen.getByRole('dialog');
    await user.type(within(dialogo).getByLabelText(/^nombre/i), 'Copa');
    await user.type(within(dialogo).getByLabelText(/^sede/i), 'Club');
    await user.type(within(dialogo).getByLabelText(/fecha de inicio/i), '2027-01-15');
    await user.type(within(dialogo).getByLabelText(/fecha de fin/i), '2027-01-10');
    await user.click(within(dialogo).getByRole('button', { name: /crear torneo/i }));

    expect(within(dialogo).getByText('La fecha de fin no puede ser anterior a la de inicio')).toBeInTheDocument();
    expect(llamadas('POST', '/api/torneos')).toHaveLength(0);
  });
});
