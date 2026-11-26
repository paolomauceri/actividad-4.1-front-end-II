// Lectura de tiempos escritos por el juez.

const TIEMPO_MAX_MS = 86_400_000; // 24 h, el mismo límite que la API

// [[h:]mm:]ss[.d|.dd|.ddd] — acepta punto o coma decimal
const FORMATO = /^(?:(?:(\d{1,2}):)?(\d{1,2}):)?(\d{1,2})(?:[.,](\d{1,3}))?$/;

/**
 * Convierte el texto del juez en milisegundos.
 * '12:34.56' → 754560 · '1:02:03.4' → 3723400 · '57.94' → 57940 · '0:45' → 45000.
 * Minutos y segundos van de 0 a 59; el resultado debe ser mayor a 0 y menor a 24 h.
 * @param {string} texto
 * @returns {number | null} null si no es un tiempo válido
 */
export function parseTiempo(texto) {
  const m = FORMATO.exec(String(texto ?? '').trim());
  if (!m) return null;
  const [, h = '0', min = '0', seg, fraccion = ''] = m;
  const horas = Number(h);
  const minutos = Number(min);
  const segundos = Number(seg);
  if (minutos > 59 || segundos > 59) return null;

  const milesimas = Number(fraccion.padEnd(3, '0'));
  const total = ((horas * 60 + minutos) * 60 + segundos) * 1000 + milesimas;
  return total > 0 && total <= TIEMPO_MAX_MS ? total : null;
}
