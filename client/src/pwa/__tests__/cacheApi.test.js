import { esApiPublicaCacheable } from '../cacheApi.js';

const pedido = (ruta, { metodo = 'GET', token = false } = {}) => ({
  url: new URL(`https://podio.test${ruta}`),
  request: new Request(`https://podio.test${ruta}`, {
    method: metodo,
    headers: token ? { Authorization: 'Bearer x' } : {},
  }),
});

describe('esApiPublicaCacheable', () => {
  it.each(['/api/torneos', '/api/torneos?estado=ABIERTO', '/api/torneos/3', '/api/pruebas/7/resultados', '/api/deportes'])(
    'guarda %s sin token',
    (ruta) => {
      expect(esApiPublicaCacheable(pedido(ruta))).toBe(true);
    },
  );

  it('no guarda respuestas pedidas con token (un admin ve torneos en borrador)', () => {
    expect(esApiPublicaCacheable(pedido('/api/torneos', { token: true }))).toBe(false);
  });

  it.each(['/api/inscripciones', '/api/torneos/3/pruebas', '/api/auth/me', '/api/resultados/mios'])('no guarda %s', (ruta) => {
    expect(esApiPublicaCacheable(pedido(ruta))).toBe(false);
  });

  it('no guarda lo que no es GET', () => {
    expect(esApiPublicaCacheable(pedido('/api/torneos', { metodo: 'POST' }))).toBe(false);
  });
});
