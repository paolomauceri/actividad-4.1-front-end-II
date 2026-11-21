import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '../DashboardPage.jsx';
import { renderConAuth } from '../../../test/renderConAuth.jsx';

const RESUMEN = {
  torneosActivos: 2,
  atletas: 12,
  inscripciones: 45,
  pruebasProximas: 6,
  proximasPruebas: [
    {
      id: 5,
      nombre: 'Triatlón sprint (750 m + 20 km + 5 km)',
      torneo: 'Circuito Costa Triatlón y Atletismo 2026',
      deporte: 'Triatlón',
      fechaHora: '2026-11-21 07:00:00',
      cupo: 100,
      inscritos: 6,
    },
  ],
  inscripcionesPorDeporte: [
    { deporte: 'Natación', total: 20 },
    { deporte: 'Atletismo', total: 13 },
    { deporte: 'Triatlón', total: 6 },
    { deporte: 'Aguas abiertas', total: 7 },
    { deporte: 'Acuatlón', total: 3 },
  ],
  usuariosRecientes: [
    { id: 15, nombre: 'Joaquín', apellido: 'Silva', email: 'joaquin@podio.local', rol: 'ATLETA', activo: true, creadoEn: '2026-11-15 13:35:00' },
  ],
};

const json = (status, body) => Promise.resolve(new Response(JSON.stringify(body), { status }));
const llamadasA = (path) => fetch.mock.calls.filter(([url]) => url === path);

const usuarioAdmin = { id: 1, nombre: 'Laura', apellido: 'Méndez', rol: 'ADMIN' };
const renderDashboard = () => renderConAuth(<DashboardPage />, { ruta: '/admin', auth: { usuario: usuarioAdmin } });

beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
afterEach(() => vi.unstubAllGlobals());

describe('DashboardPage', () => {
  it('muestra los cuatro indicadores del resumen', async () => {
    fetch.mockReturnValue(json(200, RESUMEN));
    renderDashboard();

    const indicadores = await screen.findByRole('list', { name: /indicadores/i });
    expect(within(indicadores).getByText('Torneos activos').closest('li')).toHaveTextContent('2');
    expect(within(indicadores).getByText('Atletas').closest('li')).toHaveTextContent('12');
    expect(within(indicadores).getByText('Inscripciones').closest('li')).toHaveTextContent('45');
    expect(within(indicadores).getByText('Pruebas próximas').closest('li')).toHaveTextContent('6');
  });

  it('muestra próximas pruebas, inscripciones por deporte y usuarios recientes', async () => {
    fetch.mockReturnValue(json(200, RESUMEN));
    renderDashboard();

    expect(await screen.findByText('Triatlón sprint (750 m + 20 km + 5 km)')).toBeInTheDocument();
    expect(screen.getByText('6 / 100')).toBeInTheDocument();
    const grafico = screen.getByRole('table', { name: /inscripciones por deporte/i });
    expect(within(grafico).getByRole('rowheader', { name: 'Natación' }).closest('tr')).toHaveTextContent('20');
    expect(screen.getByText('joaquin@podio.local')).toBeInTheDocument();
  });

  it('muestra un error con botón Reintentar que vuelve a cargar', async () => {
    const user = userEvent.setup();
    fetch.mockReturnValueOnce(json(500, { error: { code: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado en el servidor' } }));
    fetch.mockReturnValue(json(200, RESUMEN));
    renderDashboard();

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo cargar el resumen/i);
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    expect(await screen.findByRole('list', { name: /indicadores/i })).toBeInTheDocument();
    expect(llamadasA('/api/dashboard/resumen')).toHaveLength(2);
  });

  it('al crear un juez con un correo existente muestra el error junto al campo', async () => {
    const user = userEvent.setup();
    fetch.mockImplementation((url, opciones) => {
      if (url === '/api/usuarios' && opciones?.method === 'POST') {
        return json(409, {
          error: {
            code: 'EMAIL_TAKEN',
            message: 'Este correo ya está registrado',
            details: [{ campo: 'email', mensaje: 'Este correo ya está registrado' }],
          },
        });
      }
      return json(200, RESUMEN);
    });
    renderDashboard();

    await user.click(await screen.findByRole('button', { name: /crear juez o administrador/i }));
    const dialogo = screen.getByRole('dialog', { name: /nuevo usuario/i });
    await user.type(within(dialogo).getByLabelText(/^nombre/i), 'Pedro');
    await user.type(within(dialogo).getByLabelText(/^apellido/i), 'Salas');
    await user.type(within(dialogo).getByLabelText(/correo/i), 'admin@podio.local');
    await user.type(within(dialogo).getByLabelText(/^contraseña/i), 'JuezNuevo1');
    await user.click(within(dialogo).getByRole('button', { name: /crear usuario/i }));

    expect(await within(dialogo).findByText('Este correo ya está registrado')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('al crear un juez correctamente cierra el diálogo, avisa y recarga el resumen', async () => {
    const user = userEvent.setup();
    fetch.mockImplementation((url, opciones) => {
      if (url === '/api/usuarios' && opciones?.method === 'POST') {
        const body = JSON.parse(opciones.body);
        return json(201, { usuario: { id: 30, ...body, activo: true, creadoEn: '2026-11-20 10:00:00' } });
      }
      return json(200, RESUMEN);
    });
    renderDashboard();

    await user.click(await screen.findByRole('button', { name: /crear juez o administrador/i }));
    const dialogo = screen.getByRole('dialog');
    await user.type(within(dialogo).getByLabelText(/^nombre/i), 'Pedro');
    await user.type(within(dialogo).getByLabelText(/^apellido/i), 'Salas');
    await user.type(within(dialogo).getByLabelText(/correo/i), 'pedro@podio.local');
    await user.type(within(dialogo).getByLabelText(/^contraseña/i), 'JuezNuevo1');
    await user.click(within(dialogo).getByRole('button', { name: /crear usuario/i }));

    expect(await screen.findByText(/pedro salas fue creado como juez/i)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const post = fetch.mock.calls.find(([url, o]) => url === '/api/usuarios' && o?.method === 'POST');
    expect(JSON.parse(post[1].body)).toEqual({
      nombre: 'Pedro',
      apellido: 'Salas',
      email: 'pedro@podio.local',
      password: 'JuezNuevo1',
      rol: 'JUEZ',
    });
    expect(llamadasA('/api/dashboard/resumen').length).toBeGreaterThanOrEqual(2);
  });

  it('cierra el diálogo con la tecla Escape', async () => {
    const user = userEvent.setup();
    fetch.mockReturnValue(json(200, RESUMEN));
    renderDashboard();

    await user.click(await screen.findByRole('button', { name: /crear juez o administrador/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
