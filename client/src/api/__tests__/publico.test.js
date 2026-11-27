import { setToken } from '../token.js';
import { torneoPublico, torneosPublicos } from '../torneos.js';
import { resultadosDePrueba } from '../resultados.js';

// Las lecturas públicas van sin token: así el service worker puede guardarlas
// sin mezclar lo que ve un administrador (torneos en borrador) con lo público.
const respuesta = () => Promise.resolve(new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }));

beforeEach(() => {
  global.fetch = jest.fn(respuesta);
  setToken('token-de-admin');
});
afterEach(() => {
  delete global.fetch;
});

const cabeceras = () => fetch.mock.calls.map(([, op]) => op.headers);

describe('lecturas públicas', () => {
  it.each([
    ['torneosPublicos', () => torneosPublicos({ estado: 'ABIERTO' }), '/api/torneos?estado=ABIERTO'],
    ['torneoPublico', () => torneoPublico(3), '/api/torneos/3'],
    ['resultadosDePrueba', () => resultadosDePrueba(7), '/api/pruebas/7/resultados'],
  ])('%s no envía el token aunque haya sesión', async (_nombre, llamar, ruta) => {
    await llamar();
    expect(fetch.mock.calls[0][0]).toBe(ruta);
    expect(cabeceras()[0].Authorization).toBeUndefined();
  });
});
