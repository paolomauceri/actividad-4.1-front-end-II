import { screen, within } from '@testing-library/react';
import AdminApp from '../AdminApp.jsx';
import { SECCIONES_ADMIN } from '../../../components/admin/AdminLayout.jsx';
import { renderConAuth } from '../../../test/renderConAuth.jsx';
import { mockApi } from '../../../test/mockApi.js';

const admin = { id: 1, nombre: 'Laura', apellido: 'Méndez', rol: 'ADMIN' };

const RESUMEN = {
  torneosActivos: 2,
  atletas: 12,
  inscripciones: 45,
  pruebasProximas: 6,
  proximasPruebas: [],
  inscripcionesPorDeporte: [],
  usuariosRecientes: [],
};

beforeEach(() => {
  mockApi({
    'GET /api/dashboard/resumen': RESUMEN,
    'GET /api/torneos': { datos: [], total: 0, page: 1, limit: 50 },
    'GET /api/atletas': { datos: [], total: 0, page: 1, limit: 50 },
    'GET /api/usuarios': { data: [], total: 0, page: 1, limit: 100 },
  });
});
afterEach(() => {
  delete global.fetch;
});

const renderEn = (ruta) => renderConAuth(<AdminApp />, { ruta, path: '/admin/*', auth: { usuario: admin } });

describe('AdminApp', () => {
  it.each(SECCIONES_ADMIN.map((s) => [s.label, s.to]))('la sección %s está construida (sin "Pronto" ni "Sprint 2")', async (_label, ruta) => {
    renderEn(ruta);

    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/pronto|sprint 2/i);
  });

  it('las tarjetas del resumen llevan a sus secciones', async () => {
    renderEn('/admin');

    const indicadores = await screen.findByRole('list', { name: 'Indicadores' });
    expect(within(indicadores).getByRole('link', { name: /torneos activos/i })).toHaveAttribute('href', '/admin/torneos');
    expect(within(indicadores).getByRole('link', { name: /atletas/i })).toHaveAttribute('href', '/admin/atletas');
    expect(within(indicadores).getByRole('link', { name: /pruebas próximas/i })).toHaveAttribute('href', '/admin/resultados');
  });
});
