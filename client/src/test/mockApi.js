// Simula la API en las pruebas: cada ruta "MÉTODO /ruta" responde lo indicado.
//   mockApi({
//     'GET /api/torneos': { datos: [] },                  // 200 con ese JSON
//     'POST /api/torneos': [201, { torneo }],             // [status, body]
//     'DELETE /api/torneos/9': () => [409, { error }],    // función (recibe el body enviado)
//   });
// Las rutas con query se buscan primero completas y después sin la query.
// Una ruta no declarada responde 404 para que la prueba falle de forma visible.

const responder = (status, body) =>
  Promise.resolve(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

export function mockApi(rutas) {
  global.fetch = jest.fn((path, opciones = {}) => {
    const metodo = opciones.method ?? 'GET';
    const sinQuery = path.split('?')[0];
    const definida = rutas[`${metodo} ${path}`] ?? rutas[`${metodo} ${sinQuery}`];
    if (definida === undefined) {
      return responder(404, { error: { code: 'NOT_FOUND', message: `Sin simular: ${metodo} ${path}` } });
    }
    const enviado = opciones.body ? JSON.parse(opciones.body) : undefined;
    const valor = typeof definida === 'function' ? definida(enviado, path) : definida;
    const [status, body] = Array.isArray(valor) && typeof valor[0] === 'number' ? valor : [200, valor];
    return responder(status, body);
  });
  return global.fetch;
}

/** Llamadas hechas a "MÉTODO /ruta" (con o sin query), con el body ya parseado. */
export function llamadas(metodo, ruta) {
  return global.fetch.mock.calls
    .filter(([path, op = {}]) => (op.method ?? 'GET') === metodo && (path === ruta || path.split('?')[0] === ruta))
    .map(([path, op = {}]) => ({ path, body: op.body ? JSON.parse(op.body) : undefined }));
}
