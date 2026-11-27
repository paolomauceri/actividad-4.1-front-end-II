import { clear } from 'idb-keyval';
import { ApiError } from '../../api/client.js';
import { descartar, encolar, esperarSincronizacion, listarCola, sincronizar } from '../colaResultados.js';

const item = (inscripcionId, over = {}) => ({
  inscripcionId,
  pruebaId: 5,
  dorsal: 300 + inscripcionId,
  atleta: `Atleta ${inscripcionId}`,
  estado: 'FINALIZADO',
  tiempoMs: 60000 + inscripcionId,
  ...over,
});

const sinRed = () => new ApiError(0, 'NETWORK_ERROR', 'No se pudo conectar con el servidor. Intenta de nuevo.');

beforeEach(async () => {
  await clear();
});

describe('colaResultados', () => {
  it('encolar la misma inscripción dos veces deja un ítem con el último tiempo', async () => {
    await encolar(item(1, { tiempoMs: 70000 }));
    await encolar(item(1, { tiempoMs: 65000 }));

    const cola = await listarCola();
    expect(cola).toHaveLength(1);
    expect(cola[0]).toMatchObject({ inscripcionId: 1, tiempoMs: 65000, estadoCola: 'PENDIENTE', encoladoEn: expect.any(String) });
  });

  it('sin red no borra nada y deja todo pendiente', async () => {
    await encolar(item(1));
    await encolar(item(2));
    const enviar = jest.fn().mockRejectedValue(sinRed());

    const r = await sincronizar(enviar);

    expect(r).toEqual({ enviados: 0, rechazados: 0, pendientes: 2, requiereLogin: false });
    expect(enviar).toHaveBeenCalledTimes(1); // se detiene al primer fallo de red
    expect((await listarCola()).map((i) => i.estadoCola)).toEqual(['PENDIENTE', 'PENDIENTE']);
  });

  it('con la sesión vencida (401) pide iniciar sesión y no pierde nada', async () => {
    await encolar(item(1));
    await encolar(item(2));
    const enviar = jest.fn().mockRejectedValue(new ApiError(401, 'UNAUTHORIZED', 'Tu sesión no es válida o expiró.'));

    const r = await sincronizar(enviar);

    expect(r.requiereLogin).toBe(true);
    expect(r.pendientes).toBe(2);
    expect(await listarCola()).toHaveLength(2);
  });

  it('un rechazo del servidor (409) queda marcado con el motivo y sigue con los demás', async () => {
    await encolar(item(1));
    await encolar(item(2));
    const enviar = jest.fn((i) =>
      i.inscripcionId === 1
        ? Promise.reject(new ApiError(409, 'RESULTADO_NO_PERMITIDO', 'La inscripción está anulada.'))
        : Promise.resolve({ resultado: {} }),
    );

    const r = await sincronizar(enviar);

    expect(r).toEqual({ enviados: 1, rechazados: 1, pendientes: 0, requiereLogin: false });
    expect(await listarCola()).toEqual([
      expect.objectContaining({ inscripcionId: 1, estadoCola: 'RECHAZADO', motivo: 'La inscripción está anulada.' }),
    ]);
  });

  it('con éxito vacía la cola', async () => {
    await encolar(item(1));
    await encolar(item(2));
    const enviar = jest.fn().mockResolvedValue({ resultado: {} });

    const r = await sincronizar(enviar);

    expect(r).toEqual({ enviados: 2, rechazados: 0, pendientes: 0, requiereLogin: false });
    expect(enviar).toHaveBeenCalledWith(expect.objectContaining({ inscripcionId: 1, estado: 'FINALIZADO', tiempoMs: 60001 }));
    expect(await listarCola()).toEqual([]);
  });

  it('un rechazado no se reenvía solo; volver a encolarlo lo deja pendiente otra vez', async () => {
    await encolar(item(1));
    await sincronizar(() => Promise.reject(new ApiError(400, 'VALIDATION_ERROR', 'Datos inválidos')));
    const enviar = jest.fn().mockResolvedValue({});

    await sincronizar(enviar);
    expect(enviar).not.toHaveBeenCalled();

    await encolar(item(1, { tiempoMs: 61000 }));
    expect((await listarCola())[0]).toMatchObject({ estadoCola: 'PENDIENTE', tiempoMs: 61000 });
    expect((await listarCola())[0].motivo).toBeUndefined();
  });

  it('descartar quita solo ese ítem', async () => {
    await encolar(item(1));
    await encolar(item(2));
    await descartar(1);
    expect((await listarCola()).map((i) => i.inscripcionId)).toEqual([2]);
  });

  it('dos sincronizaciones a la vez no envían dos veces el mismo ítem', async () => {
    await encolar(item(1));
    const enviar = jest.fn().mockResolvedValue({});

    await Promise.all([sincronizar(enviar), sincronizar(enviar)]);

    expect(enviar).toHaveBeenCalledTimes(1);
  });
});

describe('colaResultados: carreras con un guardado directo', () => {
  it('no reenvía un ítem que se quitó de la cola mientras se enviaba otro', async () => {
    await encolar(item(3));
    await encolar(item(7));
    let soltar;
    const lento = new Promise((r) => {
      soltar = r;
    });
    const enviar = jest.fn(async (i) => {
      if (i.inscripcionId === 3) await lento;
    });

    const sync = sincronizar(enviar);
    await new Promise((r) => setTimeout(r, 20));
    await descartar(7); // el juez volvió a guardar el 7 directo y salió bien
    soltar();
    await sync;

    expect(enviar.mock.calls.map(([i]) => i.inscripcionId)).toEqual([3]);
  });

  it('esperarSincronizacion espera a la que está en curso', async () => {
    await encolar(item(1));
    let soltar;
    const enviar = jest.fn(() => new Promise((r) => { soltar = r; }));
    const sync = sincronizar(enviar);
    let termino = false;
    const espera = esperarSincronizacion().then(() => { termino = true; });

    await new Promise((r) => setTimeout(r, 20));
    expect(termino).toBe(false);
    soltar();
    await sync;
    await espera;
    expect(termino).toBe(true);
  });
});
