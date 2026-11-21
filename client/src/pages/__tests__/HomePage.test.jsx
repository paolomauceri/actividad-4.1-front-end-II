import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomePage } from '../HomePage.jsx';
import { renderConAuth } from '../../test/renderConAuth.jsx';

const torneos = [
  {
    id: 2,
    nombre: 'Circuito Costa Triatlón y Atletismo 2026',
    descripcion: 'Semana multideporte.',
    sede: 'Malecón Costa Azul',
    fechaInicio: '2026-11-18',
    fechaFin: '2026-11-22',
    estado: 'EN_CURSO',
    pruebas: 3,
    deportes: ['Atletismo', 'Triatlón'],
  },
  {
    id: 1,
    nombre: 'Copa Aguas Abiertas Lago Azul 2026',
    descripcion: 'Travesías.',
    sede: 'Lago Azul, Playa Norte',
    fechaInicio: '2026-12-12',
    fechaFin: '2026-12-13',
    estado: 'ABIERTO',
    pruebas: 3,
    deportes: ['Acuatlón', 'Aguas abiertas'],
  },
];

const ok = (body) => Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));

beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
afterEach(() => vi.unstubAllGlobals());

describe('HomePage', () => {
  it('muestra los próximos torneos con sede, deportes y estado', async () => {
    fetch.mockReturnValue(ok(torneos));
    renderConAuth(<HomePage />);

    const tarjeta = (await screen.findByRole('heading', { name: 'Copa Aguas Abiertas Lago Azul 2026' })).closest('article');

    expect(within(tarjeta).getByText('Lago Azul, Playa Norte')).toBeInTheDocument();
    expect(within(tarjeta).getByText('Aguas abiertas')).toBeInTheDocument();
    expect(within(tarjeta).getByText('Inscripciones abiertas')).toBeInTheDocument();
    expect(fetch.mock.calls[0][0]).toBe('/api/torneos/proximos');
  });

  it('muestra un estado vacío cuando no hay torneos', async () => {
    fetch.mockReturnValue(ok([]));
    renderConAuth(<HomePage />);

    expect(await screen.findByText(/no hay torneos programados/i)).toBeInTheDocument();
  });

  it('muestra un error con botón para reintentar si la API no responde', async () => {
    const user = userEvent.setup();
    fetch.mockRejectedValueOnce(new TypeError('Failed to fetch')).mockReturnValueOnce(ok(torneos));
    renderConAuth(<HomePage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/no pudimos cargar los torneos/i);
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    expect(await screen.findByRole('heading', { name: 'Copa Aguas Abiertas Lago Azul 2026' })).toBeInTheDocument();
  });

  it('presenta los cinco deportes', () => {
    fetch.mockReturnValue(ok([]));
    renderConAuth(<HomePage />);

    for (const deporte of ['Natación', 'Aguas abiertas', 'Acuatlón', 'Triatlón', 'Atletismo']) {
      expect(screen.getByRole('heading', { name: deporte })).toBeInTheDocument();
    }
  });
});
