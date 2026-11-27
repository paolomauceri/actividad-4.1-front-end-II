// Qué respuestas de la API guarda el service worker para mostrarlas sin conexión.
// Se usa en vite.config.js (Workbox copia el texto de la función al sw.js, por eso
// no puede usar nada de fuera de ella).

/**
 * true para los GET públicos de torneos, detalle, resultados y deportes pedidos SIN token.
 * Lo pedido con token no se guarda: un administrador ve torneos en borrador y esa
 * respuesta no debe quedar disponible para cualquiera que use el mismo dispositivo.
 * @param {{ url: URL, request: Request }} contexto
 */
export function esApiPublicaCacheable({ url, request }) {
  return (
    request.method === 'GET' &&
    !request.headers.has('Authorization') &&
    /^\/api\/(torneos(\/\d+)?|pruebas\/\d+\/resultados|deportes)$/.test(url.pathname)
  );
}
