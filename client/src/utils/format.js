// Formatos de fecha y tiempo en español.

/** Convierte 'YYYY-MM-DD' en Date local (sin desfase de zona horaria). */
export function parseFecha(iso) {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

const fmtDiaMes = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' });
const fmtCompleta = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtMesCorto = new Intl.DateTimeFormat('es', { month: 'short' });

/** '2026-12-12', '2026-12-13' → '12 – 13 de diciembre de 2026' */
export function formatRangoFechas(inicio, fin) {
  const a = parseFecha(inicio);
  const b = parseFecha(fin);
  if (a.getTime() === b.getTime()) return fmtCompleta.format(a);
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()} – ${fmtCompleta.format(b)}`;
  }
  return `${fmtDiaMes.format(a)} – ${fmtCompleta.format(b)}`;
}

/** Día y mes abreviado para el bloque de calendario: { dia: '12', mes: 'dic' } */
export function partesFecha(iso) {
  const f = parseFecha(iso);
  return { dia: String(f.getDate()), mes: fmtMesCorto.format(f).replace('.', '') };
}

/** '2026-11-21 07:00:00' → 'sáb 21 nov · 07:00' */
export function formatFechaHora(valor) {
  const [fecha, hora = '00:00'] = String(valor).split(' ');
  const f = parseFecha(fecha);
  const dia = new Intl.DateTimeFormat('es', { weekday: 'short', day: 'numeric', month: 'short' })
    .format(f)
    .replace(/\./g, '');
  return `${dia} · ${hora.slice(0, 5)}`;
}

/** Milisegundos → '57.94', '1:03.87' o '1:02:41.00' */
export function formatTiempo(ms) {
  if (ms == null) return '—';
  const totalCent = Math.round(ms / 10);
  const cent = String(totalCent % 100).padStart(2, '0');
  const totalSeg = Math.floor(totalCent / 100);
  const seg = totalSeg % 60;
  const min = Math.floor(totalSeg / 60) % 60;
  const horas = Math.floor(totalSeg / 3600);
  if (horas > 0) return `${horas}:${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}.${cent}`;
  if (min > 0) return `${min}:${String(seg).padStart(2, '0')}.${cent}`;
  return `${seg}.${cent}`;
}
