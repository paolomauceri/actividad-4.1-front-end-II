import { act, renderHook, waitFor } from '@testing-library/react';
import { useResultadosEnVivo } from '../useResultadosEnVivo.js';
import { mockApi } from '../../test/mockApi.js';
import { socketFalso } from '../../test/socketFalso.js';

jest.mock('socket.io-client', () => require('../../test/socketFalso.js').moduloSocketIo);

const datos = (id, general = []) => ({ prueba: { id }, categorias: [], general, actualizadoEn: 'x' });
const fijarConectado = (descriptor) => Object.defineProperty(socketFalso, 'connected', { configurable: true, ...descriptor });

beforeEach(() => {
  socketFalso.emit.mockClear();
  mockApi({ 'GET /api/pruebas/5/resultados': datos(5) });
});
afterEach(() => {
  fijarConectado({ value: true, writable: true });
  delete global.fetch;
});

describe('useResultadosEnVivo', () => {
  it('marca "en vivo" aunque el socket se conecte justo antes de escuchar el evento', async () => {
    // En local la conexión es casi instantánea: el evento 'connect' ya pasó cuando el
    // componente se suscribe, así que nunca llega. Se simula: desconectado al renderizar,
    // conectado en cuanto alguien escucha 'connect', y el evento no se dispara.
    fijarConectado({ get: () => socketFalso.oyentes('connect') > 0 });

    const { result } = renderHook(() => useResultadosEnVivo(5));

    await waitFor(() => expect(result.current.enVivo).toBe(true));
    expect(socketFalso.emit).toHaveBeenCalledWith('prueba:seguir', 5);
  });

  it('pasa a "sin conexión" al desconectarse', async () => {
    const { result } = renderHook(() => useResultadosEnVivo(5));
    await waitFor(() => expect(result.current.datos).not.toBeNull());
    expect(result.current.enVivo).toBe(true);

    socketFalso.connected = false;
    act(() => socketFalso.disparar('disconnect'));

    expect(result.current.enVivo).toBe(false);
  });

  it('ignora resultados de otra prueba y deja de seguir al desmontar', async () => {
    const { result, unmount } = renderHook(() => useResultadosEnVivo(5));
    await waitFor(() => expect(result.current.datos).not.toBeNull());
    expect(socketFalso.emit).toHaveBeenCalledWith('prueba:seguir', 5);

    act(() => socketFalso.disparar('resultados:actualizados', datos(9, [{ inscripcionId: 1 }])));
    expect(result.current.datos.prueba.id).toBe(5);

    act(() => socketFalso.disparar('resultados:actualizados', datos(5, [{ inscripcionId: 2 }])));
    expect(result.current.datos.general).toEqual([{ inscripcionId: 2 }]);

    unmount();
    expect(socketFalso.emit).toHaveBeenLastCalledWith('prueba:dejar', 5);
    expect(socketFalso.oyentes('resultados:actualizados')).toBe(0);
  });
});
