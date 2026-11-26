import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InscribirmePage from '../InscribirmePage.jsx';
import { renderConAuth } from '../../../test/renderConAuth.jsx';
import { llamadas, mockApi } from '../../../test/mockApi.js';

const valentina = { id: 4, nombre: 'Valentina', apellido: 'Rojas', rol: 'ATLETA' };

const TORNEO = {
  id: 1,
  nombre: 'Copa Aguas Abiertas Lago Azul 2026',
  descripcion: null,
  sede: 'Lago Azul',
  fechaInicio: '2026-12-12',
  fechaFin: '2026-12-13',
  estado: 'ABIERTO',
  totalPruebas: 2,
  totalInscritos: 6,
  deportes: ['Aguas abiertas'],
};
const prueba = (id, nombre, extra = {}) => ({
  id,
  torneoId: 1,
  deporteId: 1,
  deporte: 'Aguas abiertas',
  nombre,
  distanciaM: 1500,
  fechaHora: '2026-12-12 08:00:00',
  cupo: 80,
  estado: 'PROGRAMADA',
  inscritos: 5,
  ...extra,
});

function simular({ post }) {
  mockApi({
    'GET /api/torneos': { datos: [TORNEO], total: 1, page: 1, limit: 50 },
    'GET /api/torneos/1': { torneo: { ...TORNEO, pruebas: [prueba(1, 'Aguas abiertas 1.500 m'), prueba(2, 'Aguas abiertas 5.000 m')], categorias: [] } },
    'GET /api/inscripciones/mias': [
      { id: 37, pruebaId: 1, prueba: 'Aguas abiertas 1.500 m', torneoId: 1, dorsal: 11, categoria: 'Juvenil Femenino', estado: 'CONFIRMADA' },
    ],
    'POST /api/inscripciones': post,
  });
}

afterEach(() => {
  delete global.fetch;
});

const renderPagina = () => renderConAuth(<InscribirmePage />, { ruta: '/atleta/inscribirme', auth: { usuario: valentina } });

describe('InscribirmePage', () => {
  it('marca las pruebas en que ya está inscrito', async () => {
    simular({ post: [500, {}] });
    renderPagina();

    const ya = (await screen.findByText('Aguas abiertas 1.500 m')).closest('li');
    expect(ya).toHaveTextContent('Inscrito · Dorsal 11 · Juvenil Femenino');
    expect(within(ya).queryByRole('button', { name: /inscribirme/i })).not.toBeInTheDocument();
  });

  it('se inscribe con un clic y muestra su dorsal y categoría', async () => {
    simular({
      post: [201, { inscripcion: { id: 90, pruebaId: 2, dorsal: 12, categoria: 'Juvenil Femenino', estado: 'CONFIRMADA' } }],
    });
    const user = userEvent.setup();
    renderPagina();

    const item = (await screen.findByText('Aguas abiertas 5.000 m')).closest('li');
    await user.click(within(item).getByRole('button', { name: /inscribirme/i }));

    expect(llamadas('POST', '/api/inscripciones')[0].body).toEqual({ pruebaId: 2 });
    expect(await within(item).findByText('Inscrito · Dorsal 12 · Juvenil Femenino')).toBeInTheDocument();
  });

  it('explica por qué no se pudo inscribir (sin categoría)', async () => {
    simular({
      post: [
        409,
        { error: { code: 'SIN_CATEGORIA', message: 'No hay una categoría para tu edad (14 años) y tu sexo en este torneo.' } },
      ],
    });
    const user = userEvent.setup();
    renderPagina();

    const item = (await screen.findByText('Aguas abiertas 5.000 m')).closest('li');
    await user.click(within(item).getByRole('button', { name: /inscribirme/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No hay una categoría para tu edad (14 años)');
  });
});
