import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch, ApiError } from '../client.js';
import { TOKEN_KEY, getToken, setToken } from '../token.js';

function respuesta(status, body) {
  return Promise.resolve(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiFetch', () => {
  it('devuelve el JSON de una respuesta exitosa', async () => {
    fetch.mockReturnValue(respuesta(200, { status: 'ok' }));

    await expect(apiFetch('/api/health')).resolves.toEqual({ status: 'ok' });
  });

  it('envía el body como JSON y el token guardado en Authorization', async () => {
    setToken('abc123');
    fetch.mockReturnValue(respuesta(201, { ok: true }));

    await apiFetch('/api/usuarios', { method: 'POST', body: { nombre: 'Ana' } });

    const [url, opciones] = fetch.mock.calls[0];
    expect(url).toBe('/api/usuarios');
    expect(opciones.method).toBe('POST');
    expect(opciones.body).toBe(JSON.stringify({ nombre: 'Ana' }));
    expect(opciones.headers.Authorization).toBe('Bearer abc123');
    expect(opciones.headers['Content-Type']).toBe('application/json');
  });

  it('no envía Authorization cuando auth es false', async () => {
    setToken('abc123');
    fetch.mockReturnValue(respuesta(200, {}));

    await apiFetch('/api/auth/login', { method: 'POST', body: {}, auth: false });

    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it('lanza ApiError con status, code, message y details del servidor', async () => {
    fetch.mockReturnValue(
      respuesta(409, { error: { code: 'EMAIL_TAKEN', message: 'Este correo ya está registrado', details: [{ campo: 'email' }] } }),
    );

    const error = await apiFetch('/api/auth/register', { method: 'POST', body: {} }).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 409,
      code: 'EMAIL_TAKEN',
      message: 'Este correo ya está registrado',
      details: [{ campo: 'email' }],
    });
  });

  it('ante un 401 con sesión guardada borra el token y emite auth:logout', async () => {
    setToken('token-vencido');
    const escucha = vi.fn();
    window.addEventListener('auth:logout', escucha);
    fetch.mockReturnValue(respuesta(401, { error: { code: 'UNAUTHORIZED', message: 'Sesión expirada' } }));

    const error = await apiFetch('/api/auth/me').catch((e) => e);

    expect(error.code).toBe('UNAUTHORIZED');
    expect(getToken()).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(escucha).toHaveBeenCalledTimes(1);
    window.removeEventListener('auth:logout', escucha);
  });

  it('lanza NETWORK_ERROR cuando no hay conexión con el servidor', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'));

    const error = await apiFetch('/api/health').catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.message).toBe('No se pudo conectar con el servidor. Intenta de nuevo.');
  });

  it.each([502, 503, 504])('trata un %i sin cuerpo JSON (proxy sin API) como NETWORK_ERROR', async (status) => {
    fetch.mockReturnValue(Promise.resolve(new Response('', { status })));

    const error = await apiFetch('/api/health').catch((e) => e);

    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.message).toBe('No se pudo conectar con el servidor. Intenta de nuevo.');
  });

  it('respeta el código del servidor en un 503 con cuerpo JSON (DB_UNAVAILABLE)', async () => {
    fetch.mockReturnValue(respuesta(503, { error: { code: 'DB_UNAVAILABLE', message: 'La base de datos no está disponible.' } }));

    const error = await apiFetch('/api/health').catch((e) => e);

    expect(error.code).toBe('DB_UNAVAILABLE');
  });

  it('lanza un error genérico si el servidor responde algo que no es JSON', async () => {
    fetch.mockReturnValue(Promise.resolve(new Response('<html>Internal Server Error</html>', { status: 500 })));

    const error = await apiFetch('/api/health').catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(500);
    expect(error.code).toBe('HTTP_500');
  });
});
