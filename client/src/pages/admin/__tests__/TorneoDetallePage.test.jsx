import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TorneoDetallePage from '../TorneoDetallePage.jsx';
import { renderConAuth } from '../../../test/renderConAuth.jsx';
import { llamadas, mockApi } from '../../../test/mockApi.js';

const admin = { id: 1, nombre: 'Laura', apellido: 'Méndez', rol: 'ADMIN' };

const DETALLE = {
  id: 7,
  nombre: 'Copa de Verano',
  descripcion: 'Torneo de piscina',
  sede: 'Club Náutico',
  fechaInicio: '2027-01-15',
  fechaFin: '2027-01-16',
  estado: 'BORRADOR',
  totalPruebas: 1,
  totalInscritos: 0,
  deportes: ['Natación'],
  pruebas: [
    {
      id: 30,
      torneoId: 7,
      deporteId: 2,
      deporte: 'Natación',
      nombre: '100 m libre',
      distanciaM: 100,
      fechaHora: '2027-01-15 09:00:00',
      cupo: 40,
      estado: 'PROGRAMADA',
      inscritos: 0,
    },
  ],
  categorias: [{ id: 50, torneoId: 7, nombre: 'Adulto F', sexo: 'F', edadMin: 20, edadMax: 39, inscritos: 0 }],
};

let detalle;

beforeEach(() => {
  detalle = structuredClone(DETALLE);
  mockApi({
    'GET /api/torneos/7': () => ({ torneo: detalle }),
    'GET /api/deportes': [{ id: 1, nombre: 'Aguas abiertas' }, { id: 2, nombre: 'Natación' }],
    'GET /api/inscripciones': [],
    'PATCH /api/torneos/7/estado': (body) => {
      detalle.estado = body.estado;
      return { torneo: detalle };
    },
    'DELETE /api/torneos/7': [409, { error: { code: 'TIENE_INSCRIPCIONES', message: 'No se puede eliminar un torneo que tiene inscripciones.' } }],
    'POST /api/torneos/7/categorias': [
      409,
      { error: { code: 'CATEGORIA_SOLAPADA', message: 'Se cruza con la categoría «Adulto F» (20–39 años).' } },
    ],
  });
});
afterEach(() => {
  delete global.fetch;
});

const renderPagina = () =>
  renderConAuth(<TorneoDetallePage />, { ruta: '/admin/torneos/7', path: '/admin/torneos/:id', auth: { usuario: admin } });

describe('TorneoDetallePage', () => {
  it('muestra el torneo con sus pestañas', async () => {
    renderPagina();

    expect(await screen.findByRole('heading', { name: 'Copa de Verano' })).toBeInTheDocument();
    const pestañas = screen.getAllByRole('tab').map((t) => t.textContent);
    expect(pestañas).toEqual(['Datos', 'Pruebas (1)', 'Categorías (1)', 'Inscritos (0)']);
  });

  it('abre las inscripciones con un clic', async () => {
    const user = userEvent.setup();
    renderPagina();
    await screen.findByRole('heading', { name: 'Copa de Verano' });

    await user.click(screen.getByRole('button', { name: /abrir inscripciones/i }));

    expect(llamadas('PATCH', '/api/torneos/7/estado')[0].body).toEqual({ estado: 'ABIERTO' });
    expect(await screen.findByRole('button', { name: /iniciar torneo/i })).toBeInTheDocument();
  });

  it('muestra el motivo si no se puede eliminar', async () => {
    const user = userEvent.setup();
    renderPagina();
    await screen.findByRole('heading', { name: 'Copa de Verano' });

    await user.click(screen.getByRole('button', { name: /eliminar torneo/i }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /^eliminar$/i }));

    expect(await screen.findByText('No se puede eliminar un torneo que tiene inscripciones.')).toBeInTheDocument();
  });

  it('lista pruebas y categorías en sus pestañas', async () => {
    const user = userEvent.setup();
    renderPagina();
    await screen.findByRole('heading', { name: 'Copa de Verano' });

    await user.click(screen.getByRole('tab', { name: /pruebas/i }));
    expect(screen.getByRole('table', { name: 'Pruebas' })).toHaveTextContent('100 m libre');

    await user.click(screen.getByRole('tab', { name: /categorías/i }));
    expect(screen.getByRole('table', { name: 'Categorías' })).toHaveTextContent('20 a 39 años');
  });

  it('muestra el error del servidor al crear una categoría que se cruza', async () => {
    const user = userEvent.setup();
    renderPagina();
    await screen.findByRole('heading', { name: 'Copa de Verano' });

    await user.click(screen.getByRole('tab', { name: /categorías/i }));
    await user.click(screen.getByRole('button', { name: /nueva categoría/i }));
    const dialogo = screen.getByRole('dialog');
    await user.type(within(dialogo).getByLabelText(/^nombre/i), 'Open');
    await user.selectOptions(within(dialogo).getByLabelText(/^sexo/i), 'MIXTO');
    await user.type(within(dialogo).getByLabelText(/edad mínima/i), '30');
    await user.type(within(dialogo).getByLabelText(/edad máxima/i), '40');
    await user.click(within(dialogo).getByRole('button', { name: /guardar/i }));

    expect(await within(dialogo).findByText(/se cruza con la categoría/i)).toBeInTheDocument();
  });
});
