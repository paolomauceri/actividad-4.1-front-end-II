// Los datos de demostración deben servir el día en que se revise la app,
// así que el seed usa fechas relativas a la fecha actual.
import { describe, it, expect, afterAll } from 'vitest';
import { closePool, query } from '../src/db/pool.js';

const contar = async (sql) => Number((await query(sql))[0].n);

afterAll(async () => {
  await closePool();
});

describe('datos de demostración (seed)', () => {
  it('dejan un torneo EN_CURSO que incluye el día de hoy', async () => {
    expect(
      await contar(
        "SELECT COUNT(*) AS n FROM torneos WHERE estado = 'EN_CURSO' AND CURDATE() BETWEEN fecha_inicio AND fecha_fin",
      ),
    ).toBe(1);
  });

  it('dejan una prueba EN_CURSO hoy para que el juez registre tiempos', async () => {
    expect(
      await contar("SELECT COUNT(*) AS n FROM pruebas WHERE estado = 'EN_CURSO' AND DATE(fecha_hora) = CURDATE()"),
    ).toBe(1);
  });

  it('mantienen el torneo ABIERTO en el futuro y el FINALIZADO en el pasado', async () => {
    expect(
      await contar("SELECT COUNT(*) AS n FROM torneos WHERE estado = 'ABIERTO' AND fecha_inicio > CURDATE()"),
    ).toBe(1);
    expect(
      await contar("SELECT COUNT(*) AS n FROM torneos WHERE estado = 'FINALIZADO' AND fecha_fin < CURDATE()"),
    ).toBe(1);
  });

  it('no dejan inscripciones PENDIENTE (las inscripciones nacen CONFIRMADA)', async () => {
    expect(await contar("SELECT COUNT(*) AS n FROM inscripciones WHERE estado = 'PENDIENTE'")).toBe(0);
  });

  it('las pruebas quedan dentro de las fechas de su torneo', async () => {
    expect(
      await contar(`SELECT COUNT(*) AS n FROM pruebas p JOIN torneos t ON t.id = p.torneo_id
                    WHERE DATE(p.fecha_hora) NOT BETWEEN t.fecha_inicio AND t.fecha_fin`),
    ).toBe(0);
  });
});

describe('vistas de clasificación', () => {
  it('vw_clasificacion no incluye inscripciones ANULADA', async () => {
    // Se registra un resultado sobre la inscripción 36 (ANULADA en el seed)
    await query(
      "INSERT INTO resultados (inscripcion_id, tiempo_ms, estado, registrado_por) VALUES (36, 3000000, 'FINALIZADO', 2)",
    );
    try {
      expect(await contar('SELECT COUNT(*) AS n FROM vw_clasificacion WHERE dorsal = 405 AND prueba_id = 6')).toBe(0);
    } finally {
      await query('DELETE FROM resultados WHERE inscripcion_id = 36');
    }
  });

  it('vw_clasificacion_general ordena toda la prueba sin separar categorías', async () => {
    // 100 m libre (prueba 8): el más rápido de todas las categorías es 57.940 (inscripción 12)
    const filas = await query(
      'SELECT dorsal, posicion_general FROM vw_clasificacion_general WHERE prueba_id = 8 ORDER BY posicion_general LIMIT 2',
    );
    expect(filas).toEqual([
      { dorsal: 104, posicion_general: 1 },
      { dorsal: 107, posicion_general: 2 },
    ]);
  });
});
