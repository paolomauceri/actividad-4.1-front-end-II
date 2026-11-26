import { parseTiempo } from '../tiempo.js';
import { formatTiempo } from '../format.js';

describe('parseTiempo', () => {
  it.each([
    ['12:34.56', 754560],
    ['1:02:03.4', 3723400],
    ['59:59.99', 3599990],
    ['0:45', 45000],
    ['57.94', 57940],
    ['1:03,87', 63870],
    ['  2:05.123 ', 125123],
  ])('"%s" → %i ms', (texto, ms) => {
    expect(parseTiempo(texto)).toBe(ms);
  });

  it.each(['', '   ', 'abc', '60:00', '0:00.00', '12:60.00', '1:2:3:4', '-1:00', '12:34.5678', '24:00:00.01'])(
    'rechaza "%s"',
    (texto) => {
      expect(parseTiempo(texto)).toBeNull();
    },
  );

  it('lee lo que muestra formatTiempo (ida y vuelta en centésimas)', () => {
    const valores = [10, 990, 25480, 57940, 63870, 599990, 754560, 3599990, 3723400, 86399990];
    for (const ms of valores) {
      expect(parseTiempo(formatTiempo(ms))).toBe(ms);
    }
  });
});
