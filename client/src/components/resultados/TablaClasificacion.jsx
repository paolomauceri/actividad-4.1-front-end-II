import { useEffect, useRef, useState } from 'react';
import { Badge } from '../ui/Badge.jsx';
import { DataTable } from '../ui/DataTable.jsx';
import { ESTADO_RESULTADO } from '../../utils/estados.js';
import { formatTiempo } from '../../utils/format.js';
import styles from './Resultados.module.css';

const DURACION_RESALTADO_MS = 2000;

/** Ids de las filas nuevas o cuyo resultado cambió desde el render anterior (durante 2 s). */
function useFilasCambiadas(filas) {
  const previas = useRef(null);
  const [cambiadas, setCambiadas] = useState(() => new Set());

  useEffect(() => {
    const actuales = new Map(filas.map((f) => [f.inscripcionId, `${f.estado}|${f.tiempoMs}`]));
    const antes = previas.current;
    previas.current = actuales;
    if (!antes) return undefined;

    const nuevas = new Set([...actuales].filter(([id, valor]) => antes.get(id) !== valor).map(([id]) => id));
    if (!nuevas.size) return undefined;
    setCambiadas(nuevas);
    const t = setTimeout(() => setCambiadas(new Set()), DURACION_RESALTADO_MS);
    return () => clearTimeout(t);
  }, [filas]);

  return cambiadas;
}

/**
 * Tabla de clasificación (general o de una categoría).
 * Los que no terminaron van al final, sin posición. Resalta las filas que cambian en vivo.
 * @param {{ titulo: string, filas: object[], conCategoria?: boolean }} props
 */
export function TablaClasificacion({ titulo, filas, conCategoria = false }) {
  const cambiadas = useFilasCambiadas(filas);

  const columnas = [
    {
      clave: 'posicion',
      titulo: 'Pos.',
      render: (f) => <span className={styles.posicionTabla}>{f.posicion ?? '—'}</span>,
    },
    { clave: 'dorsal', titulo: 'Dorsal', render: (f) => <span className={styles.numero}>{f.dorsal}</span> },
    {
      clave: 'atleta',
      titulo: 'Atleta',
      render: (f) => (
        <>
          <span className={styles.atletaTabla}>{f.atleta}</span>
          {f.club && <span className={styles.club}>{f.club}</span>}
        </>
      ),
    },
    ...(conCategoria ? [{ clave: 'categoria', titulo: 'Categoría' }] : []),
    {
      clave: 'tiempo',
      titulo: 'Tiempo',
      render: (f) =>
        f.estado === 'FINALIZADO' ? (
          <span className={styles.numero}>{formatTiempo(f.tiempoMs)}</span>
        ) : (
          <Badge tone={ESTADO_RESULTADO[f.estado]?.tono}>
            <abbr className={styles.sigla} title={ESTADO_RESULTADO[f.estado]?.texto}>{f.estado}</abbr>
          </Badge>
        ),
    },
  ];

  return (
    <DataTable
      titulo={titulo}
      columnas={columnas}
      filas={filas}
      getId={(f) => f.inscripcionId}
      getClaseFila={(f) => (cambiadas.has(f.inscripcionId) ? styles.cambio : undefined)}
      vacio="Todavía no hay resultados registrados."
    />
  );
}
