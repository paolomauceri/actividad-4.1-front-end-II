import { Badge } from '../ui/Badge.jsx';
import { Button } from '../ui/Button.jsx';
import { DataTable } from '../ui/DataTable.jsx';
import { ESTADO_RESULTADO } from '../../utils/estados.js';
import { formatTiempo } from '../../utils/format.js';
import pages from '../../pages/admin/AdminPages.module.css';
import styles from './Juez.module.css';

/** Resultado actual de una inscripción, como texto o etiqueta. */
export function ResultadoActual({ resultado }) {
  if (!resultado) return <span className={styles.sinResultado}>Sin resultado</span>;
  if (resultado.estado === 'FINALIZADO') return <span className={styles.tiempo}>{formatTiempo(resultado.tiempoMs)}</span>;
  return <Badge tone={ESTADO_RESULTADO[resultado.estado]?.tono}>{resultado.estado}</Badge>;
}

/**
 * Inscritos de la prueba con su resultado actual y un botón para registrarlo o corregirlo.
 * @param {{ inscritos: object[], resultadoDe: (inscripcion: object) => object|null,
 *           onElegir: (inscripcion: object) => void, puedeEditar: boolean }} props
 */
export function ListaInscritos({ inscritos, resultadoDe, onElegir, puedeEditar }) {
  const columnas = [
    { clave: 'dorsal', titulo: 'Dorsal', render: (i) => <strong className={styles.tiempo}>{i.dorsal}</strong> },
    {
      clave: 'atleta',
      titulo: 'Atleta',
      render: (i) => (
        <>
          <span className={pages.nombre}>{i.atleta}</span>
          <span className={pages.sub}>{i.categoria}</span>
        </>
      ),
    },
    { clave: 'resultado', titulo: 'Resultado', render: (i) => <ResultadoActual resultado={resultadoDe(i)} /> },
  ];
  if (puedeEditar) {
    columnas.push({
      clave: 'accion',
      titulo: 'Acción',
      render: (i) => {
        const verbo = resultadoDe(i) ? 'Corregir' : 'Registrar';
        return (
          <Button variant="ghost" onClick={() => onElegir(i)} aria-label={`${verbo} resultado de ${i.atleta}`}>
            {verbo}
          </Button>
        );
      },
    });
  }

  return (
    <DataTable
      titulo="Inscritos"
      columnas={columnas}
      filas={inscritos}
      vacio="Esta prueba no tiene inscritos."
    />
  );
}
