import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { clear } from 'idb-keyval';
import { encolar } from '../../../offline/colaResultados.js';
import RegistroTiemposPage from '../RegistroTiemposPage.jsx';
import { renderConAuth } from '../../../test/renderConAuth.jsx';
import { llamadas, mockApi } from '../../../test/mockApi.js';
import { socketFalso } from '../../../test/socketFalso.js';

jest.mock('socket.io-client', () => require('../../../test/socketFalso.js').moduloSocketIo);

const juez = { id: 2, nombre: 'Marco', apellido: 'Ruiz', rol: 'JUEZ' };

const PRUEBA = {
  id: 5,
  nombre: 'Triatlón sprint',
  distanciaM: 25750,
  fechaHora: '2026-11-26 07:00:00',
  estado: 'EN_CURSO',
  deporte: 'Triatlón',
  torneo: { id: 2, nombre: 'Circuito Costa 2026', estado: 'EN_CURSO' },
};

const fila = (over) => ({
  inscripcionId: 26,
  dorsal: 301,
  atletaId: 9,
  atleta: 'Camila Torres',
  club: 'Tritón Club',
  categoriaId: 7,
  categoria: 'Juvenil Femenino',
  estado: 'FINALIZADO',
  tiempoMs: 754560,
  posicion: 1,
  ...over,
});

const resultados = (general = []) => ({
  prueba: PRUEBA,
  categorias: [{ id: 7, nombre: 'Juvenil Femenino', sexo: 'F', clasificacion: general }],
  general,
  actualizadoEn: '2026-11-26T12:00:00.000Z',
});

const INSCRITOS = [
  { id: 26, pruebaId: 5, dorsal: 301, atleta: 'Camila Torres', categoria: 'Juvenil Femenino', estado: 'CONFIRMADA', resultado: null },
  { id: 27, pruebaId: 5, dorsal: 302, atleta: 'Diego Paredes', categoria: 'Adulto Masculino', estado: 'CONFIRMADA', resultado: null },
];

beforeEach(async () => {
  await clear();
  socketFalso.emit.mockClear();
  mockApi({
    'GET /api/pruebas/5/resultados': resultados(),
    'GET /api/inscripciones': INSCRITOS,
    'PUT /api/inscripciones/26/resultado': (body) => ({ resultado: { inscripcionId: 26, pruebaId: 5, ...body } }),
  });
});
afterEach(() => {
  delete global.fetch;
});

const renderPagina = () =>
  renderConAuth(<RegistroTiemposPage />, { ruta: '/juez/pruebas/5', path: '/juez/pruebas/:pruebaId', auth: { usuario: juez } });

describe('RegistroTiemposPage', () => {
  it('muestra la prueba y sigue sus resultados en vivo', async () => {
    renderPagina();

    expect(await screen.findByRole('heading', { name: 'Triatlón sprint' })).toBeInTheDocument();
    expect(screen.getByText('En vivo')).toBeInTheDocument();
    expect(socketFalso.emit).toHaveBeenCalledWith('prueba:seguir', 5);
    expect(llamadas('GET', '/api/inscripciones')[0].path).toBe('/api/inscripciones?pruebaId=5');
  });

  it('al escribir el dorsal muestra el atleta y guarda su tiempo', async () => {
    const user = userEvent.setup();
    renderPagina();
    await screen.findByRole('heading', { name: 'Triatlón sprint' });

    await user.type(screen.getByLabelText(/dorsal/i), '301');
    const ficha = screen.getByRole('region', { name: /atleta seleccionado/i });
    expect(within(ficha).getByText('Camila Torres')).toBeInTheDocument();
    expect(within(ficha).getByText(/juvenil femenino/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^tiempo/i), '12:34.56');
    await user.click(screen.getByRole('button', { name: /guardar tiempo/i }));

    expect(llamadas('PUT', '/api/inscripciones/26/resultado')[0].body).toEqual({ estado: 'FINALIZADO', tiempoMs: 754560 });
    expect(await screen.findByText(/guardado: camila torres · 12:34\.56/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dorsal/i)).toHaveValue('');
  });

  it('avisa si ningún inscrito tiene ese dorsal', async () => {
    const user = userEvent.setup();
    renderPagina();
    await screen.findByRole('heading', { name: 'Triatlón sprint' });

    await user.type(screen.getByLabelText(/dorsal/i), '999');

    expect(screen.getByText('Ningún inscrito tiene el dorsal 999.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /guardar tiempo/i })).not.toBeInTheDocument();
  });

  it('actualiza la lista cuando llega un resultado por Socket.IO', async () => {
    renderPagina();
    await screen.findByRole('heading', { name: 'Triatlón sprint' });
    const lista = await screen.findByRole('table', { name: 'Inscritos' });
    expect(within(lista).getAllByText('Sin resultado')).toHaveLength(2);

    act(() => socketFalso.disparar('resultados:actualizados', resultados([fila()])));

    expect(within(lista).getByText('12:34.56')).toBeInTheDocument();
    expect(within(lista).getAllByText('Sin resultado')).toHaveLength(1);
  });

  it('"Registrar" y "Corregir" cargan el dorsal en el formulario', async () => {
    mockApi({
      'GET /api/pruebas/5/resultados': resultados([fila()]),
      'GET /api/inscripciones': INSCRITOS,
    });
    const user = userEvent.setup();
    renderPagina();
    await screen.findByRole('heading', { name: 'Triatlón sprint' });

    await user.click(await screen.findByRole('button', { name: 'Corregir resultado de Camila Torres' }));
    expect(screen.getByLabelText(/dorsal/i)).toHaveValue('301');
    expect(screen.getByLabelText(/^tiempo/i)).toHaveValue('12:34.56');

    await user.click(screen.getByRole('button', { name: 'Registrar resultado de Diego Paredes' }));

    expect(screen.getByLabelText(/dorsal/i)).toHaveValue('302');
    expect(within(screen.getByRole('region', { name: /atleta seleccionado/i })).getByText('Diego Paredes')).toBeInTheDocument();
  });

  it('sin red guarda el tiempo en la cola y lo envía al volver la conexión', async () => {
    let redCaida = true;
    const api = global.fetch;
    global.fetch = jest.fn((path, op = {}) =>
      redCaida && op.method === 'PUT' ? Promise.reject(new TypeError('Failed to fetch')) : api(path, op),
    );
    const user = userEvent.setup();
    renderPagina();
    await screen.findByRole('heading', { name: 'Triatlón sprint' });

    await user.type(screen.getByLabelText(/dorsal/i), '301');
    await user.type(screen.getByLabelText(/^tiempo/i), '12:34.56');
    await user.click(screen.getByRole('button', { name: /guardar tiempo/i }));

    expect(await screen.findByText('1 pendiente de envío')).toBeInTheDocument();
    expect(screen.getByText(/guardado sin conexión: se enviará automáticamente/i)).toBeInTheDocument();

    redCaida = false;
    act(() => window.dispatchEvent(new Event('online')));

    await waitFor(() => expect(screen.queryByText('1 pendiente de envío')).not.toBeInTheDocument());
    const envios = llamadas('PUT', '/api/inscripciones/26/resultado');
    expect(envios).toHaveLength(2);
    expect(envios[1].body).toEqual({ estado: 'FINALIZADO', tiempoMs: 754560 });
  });

  it('muestra un tiempo de la cola que el servidor rechazó y permite descartarlo', async () => {
    await encolar({ inscripcionId: 26, pruebaId: 5, dorsal: 301, atleta: 'Camila Torres', estado: 'DNS' });
    mockApi({
      'GET /api/pruebas/5/resultados': resultados(),
      'GET /api/inscripciones': INSCRITOS,
      'PUT /api/inscripciones/26/resultado': [409, { error: { code: 'RESULTADO_NO_PERMITIDO', message: 'La inscripción está anulada.' } }],
    });
    const user = userEvent.setup();
    renderPagina();

    expect(await screen.findByText('La inscripción está anulada.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Descartar el resultado de Camila Torres' }));

    await waitFor(() => expect(screen.queryByText('La inscripción está anulada.')).not.toBeInTheDocument());
  });

  it('con la sesión vencida (401) el tiempo queda guardado en el dispositivo', async () => {
    mockApi({
      'GET /api/pruebas/5/resultados': resultados(),
      'GET /api/inscripciones': INSCRITOS,
      'PUT /api/inscripciones/26/resultado': [401, { error: { code: 'UNAUTHORIZED', message: 'Tu sesión no es válida o expiró.' } }],
    });
    const user = userEvent.setup();
    renderPagina();
    await screen.findByRole('heading', { name: 'Triatlón sprint' });

    await user.type(screen.getByLabelText(/dorsal/i), '301');
    await user.click(screen.getByRole('button', { name: /no largó/i }));

    expect(await screen.findByText(/se enviará cuando vuelvas a iniciar sesión/i)).toBeInTheDocument();
    expect(await screen.findByText('1 pendiente de envío')).toBeInTheDocument();
  });

  it('sin red usa la última lista de inscritos guardada en el dispositivo', async () => {
    const primera = renderPagina();
    await screen.findByRole('table', { name: 'Inscritos' });
    primera.unmount();

    const api = global.fetch;
    global.fetch = jest.fn((path, op = {}) =>
      path.startsWith('/api/inscripciones') ? Promise.reject(new TypeError('Failed to fetch')) : api(path, op),
    );
    const user = userEvent.setup();
    renderPagina();
    await screen.findByRole('table', { name: 'Inscritos' });

    await user.type(screen.getByLabelText(/dorsal/i), '301');
    expect(within(screen.getByRole('region', { name: /atleta seleccionado/i })).getByText('Camila Torres')).toBeInTheDocument();
  });

  it('muestra el error del servidor', async () => {
    mockApi({
      'GET /api/pruebas/5/resultados': resultados(),
      'GET /api/inscripciones': INSCRITOS,
      'PUT /api/inscripciones/26/resultado': [
        409,
        { error: { code: 'RESULTADO_NO_PERMITIDO', message: 'Los tiempos se registran solo cuando el torneo está en curso.' } },
      ],
    });
    const user = userEvent.setup();
    renderPagina();
    await screen.findByRole('heading', { name: 'Triatlón sprint' });

    await user.type(screen.getByLabelText(/dorsal/i), '301');
    await user.click(screen.getByRole('button', { name: /no largó/i }));

    expect(await screen.findByText('Los tiempos se registran solo cuando el torneo está en curso.')).toBeInTheDocument();
  });
});
