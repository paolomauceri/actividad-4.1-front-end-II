import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { misResultados } from '../../api/resultados.js';
import { useApi } from '../../hooks/useApi.js';
import { PageHeader } from '../../components/panel/PageHeader.jsx';
import { ResultadoActual } from '../../components/juez/ListaInscritos.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { formatFechaHora } from '../../utils/format.js';
import pages from '../admin/AdminPages.module.css';

const lugar = (n) => (n == null ? '—' : `${n}.º`);

/** Tiempos y posiciones del atleta en cada prueba (/atleta/resultados). */
export default function MisResultadosPage() {
  const { datos, cargando, error, recargar } = useApi((signal) => misResultados(signal), []);

  const columnas = [
    {
      clave: 'prueba',
      titulo: 'Prueba',
      render: (r) => (
        <>
          <Link to={`/resultados/${r.pruebaId}`} className={pages.nombre}>
            {r.prueba}
          </Link>
          <span className={pages.sub}>
            {r.torneo} · {formatFechaHora(r.pruebaFechaHora)}
          </span>
        </>
      ),
    },
    { clave: 'categoria', titulo: 'Categoría' },
    { clave: 'dorsal', titulo: 'Dorsal' },
    { clave: 'resultado', titulo: 'Resultado', render: (r) => <ResultadoActual resultado={r} /> },
    { clave: 'posicionCategoria', titulo: 'En su categoría', render: (r) => <strong>{lugar(r.posicionCategoria)}</strong> },
    { clave: 'posicionGeneral', titulo: 'General', render: (r) => lugar(r.posicionGeneral) },
  ];

  return (
    <div className={pages.page}>
      <PageHeader
        antetitulo="Panel del atleta"
        titulo="Mis resultados"
        descripcion="Tus tiempos y tu posición en cada prueba. Toca una prueba para ver la clasificación completa."
      />
      {cargando && <Spinner label="Cargando tus resultados…" />}
      {error && (
        <Alert
          tone="error"
          title="No se pudieron cargar tus resultados"
          action={<Button variant="secondary" icon={RefreshCw} onClick={recargar}>Reintentar</Button>}
        >
          {error.message}
        </Alert>
      )}
      {datos && (
        <DataTable
          titulo="Mis resultados"
          columnas={columnas}
          filas={datos}
          getId={(r) => r.inscripcionId}
          vacio="Todavía no tienes resultados. Aparecen aquí cuando el juez registra tu tiempo."
        />
      )}
    </div>
  );
}
