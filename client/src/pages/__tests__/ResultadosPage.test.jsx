import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultadosPage from '../ResultadosPage.jsx';
import { renderConAuth } from '../../test/renderConAuth.jsx';
import { mockApi } from '../../test/mockApi.js';
import { socketFalso } from '../../test/socketFalso.js';

jest.mock('socket.io-client', () => require('../../test/socketFalso.js').moduloSocketIo);

const fila = (inscripcionId, atleta, categoriaId, categoria, posicion, tiempoMs, estado = 'FINALIZADO') => ({
  inscripcionId,
  dorsal: 300 + inscripcionId,
  atletaId: inscripcionId,
  atleta,
  club: 'Tritón Club',
  categoriaId,
  categoria,
  estado,
  tiempoMs,
  posicion,
});

const camila = fila(1, 'Camila Torres', 7, 'Adulto Femenino', 1, 3761500);
const diego = fila(2, 'Diego Ramírez', 8, 'Adulto Masculino', 1, 3700000);

const resultados = (general, porCategoria) => ({
  prueba: {
    id: 5,
    nombre: 'Triatlón sprint',
    distanciaM: 25750,
    fechaHora: '2026-11-26 07:00:00',
    estado: 'EN_CURSO',
    deporte: 'Triatlón',
    torneo: { id: 2, nombre: 'Circuito Costa 2026', estado: 'EN_CURSO' },
  },
  categorias: [
    { id: 7, nombre: 'Adulto Femenino', sexo: 'F', clasificacion: porCategoria[7] ?? [] },
    { id: 8, nombre: 'Adulto Masculino', sexo: 'M', clasificacion: porCategoria[8] ?? [] },
  ],
  general,
  actualizadoEn: '2026-11-26T12:00:00.000Z',
});

beforeEach(() => {
  mockApi({
    'GET /api/pruebas/5/resultados': resultados([{ ...diego, posicion: 1 }, { ...camila, posicion: 2 }], { 7: [camila], 8: [diego] }),
  });
});
afterEach(() => {
  delete global.fetch;
});

const renderPagina = () => renderConAuth(<ResultadosPage />, { ruta: '/resultados/5', path: '/resultados/:pruebaId' });

describe('ResultadosPage', () => {
  it('abre en la pestaña General con el podio y la tabla de todas las categorías', async () => {
    renderPagina();

    expect(await screen.findByRole('heading', { name: 'Triatlón sprint', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true');
    const tabla = screen.getByRole('table', { name: 'Clasificación general' });
    expect(within(tabla).getAllByRole('row')).toHaveLength(3);
    expect(within(tabla).getByText('1:02:41.50')).toBeInTheDocument();
    expect(screen.getByText('En vivo')).toBeInTheDocument();
  });

  it('al elegir una categoría muestra solo su clasificación', async () => {
    const user = userEvent.setup();
    renderPagina();
    await screen.findByRole('heading', { name: 'Triatlón sprint', level: 1 });

    await user.click(screen.getByRole('tab', { name: 'Adulto Femenino' }));

    const tabla = screen.getByRole('table', { name: 'Clasificación Adulto Femenino' });
    expect(within(tabla).getByText('Camila Torres')).toBeInTheDocument();
    expect(within(tabla).queryByText('Diego Ramírez')).not.toBeInTheDocument();
  });

  it('se actualiza con Socket.IO sin volver a pedir los datos', async () => {
    renderPagina();
    await screen.findByRole('heading', { name: 'Triatlón sprint', level: 1 });
    const pedidos = global.fetch.mock.calls.length;

    const nuevo = fila(3, 'Joaquín Silva', 8, 'Adulto Masculino', 1, 3600000);
    act(() =>
      socketFalso.disparar(
        'resultados:actualizados',
        resultados([nuevo, { ...diego, posicion: 2 }, { ...camila, posicion: 3 }], { 7: [camila], 8: [nuevo, { ...diego, posicion: 2 }] }),
      ),
    );

    const tabla = screen.getByRole('table', { name: 'Clasificación general' });
    expect(within(tabla).getByText('Joaquín Silva')).toBeInTheDocument();
    expect(within(tabla).getByText('Joaquín Silva').closest('tr')).toHaveClass('cambio');
    expect(global.fetch.mock.calls.length).toBe(pedidos);
  });

  it('muestra los no finalizados al final sin posición', async () => {
    mockApi({
      'GET /api/pruebas/5/resultados': resultados([camila, fila(9, 'Andrés Navarro', 8, 'Adulto Masculino', null, null, 'DNF')], {}),
    });
    renderPagina();

    const tabla = await screen.findByRole('table', { name: 'Clasificación general' });
    const ultima = within(tabla).getAllByRole('row').at(-1);
    expect(ultima).toHaveTextContent('Andrés Navarro');
    expect(ultima).toHaveTextContent('DNF');
  });

  it('avisa si la prueba no existe', async () => {
    mockApi({ 'GET /api/pruebas/5/resultados': [404, { error: { code: 'NOT_FOUND', message: 'La prueba no existe' } }] });
    renderPagina();
    expect(await screen.findByText('La prueba no existe')).toBeInTheDocument();
  });
});
