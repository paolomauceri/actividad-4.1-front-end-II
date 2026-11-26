import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { listarTorneos } from '../../api/torneos.js';
import { useApi } from '../../hooks/useApi.js';
import { PageHeader } from '../../components/panel/PageHeader.jsx';
import { TorneoFormDialog } from '../../components/admin/TorneoFormDialog.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ESTADO_TORNEO } from '../../utils/estados.js';
import { formatRangoFechas } from '../../utils/format.js';
import styles from './AdminPages.module.css';

const COLUMNAS = [
  {
    clave: 'nombre',
    titulo: 'Torneo',
    render: (t) => (
      <>
        <Link to={`/admin/torneos/${t.id}`} className={styles.nombre}>
          {t.nombre}
        </Link>
        <span className={styles.sub}>{t.sede}</span>
      </>
    ),
  },
  { clave: 'fechas', titulo: 'Fechas', render: (t) => formatRangoFechas(t.fechaInicio, t.fechaFin) },
  {
    clave: 'estado',
    titulo: 'Estado',
    render: (t) => <Badge tone={ESTADO_TORNEO[t.estado]?.tono}>{ESTADO_TORNEO[t.estado]?.texto ?? t.estado}</Badge>,
  },
  { clave: 'totalPruebas', titulo: 'Pruebas' },
  { clave: 'totalInscritos', titulo: 'Inscritos' },
];

/** Lista de torneos del panel de administración (/admin/torneos). */
export default function TorneosPage() {
  const [estado, setEstado] = useState('');
  const [creando, setCreando] = useState(false);
  const [aviso, setAviso] = useState('');
  const { datos, cargando, error, recargar } = useApi(
    (signal) => listarTorneos({ estado, limit: 100 }, signal),
    [estado],
  );

  const alCrear = (torneo) => {
    setCreando(false);
    setAviso(`Se creó «${torneo.nombre}» como borrador. Agrega sus pruebas y categorías y luego abre las inscripciones.`);
    recargar();
  };

  return (
    <div className={styles.page}>
      <PageHeader
        antetitulo="Panel de administración"
        titulo="Torneos"
        descripcion="Crea torneos, agrega pruebas y categorías y controla en qué etapa está cada uno."
        acciones={
          <Button icon={Plus} onClick={() => setCreando(true)}>
            Nuevo torneo
          </Button>
        }
      />

      {aviso && (
        <Alert tone="success" title={aviso} action={<Button variant="ghost" onClick={() => setAviso('')}>Cerrar</Button>} />
      )}

      <div className={styles.filtros}>
        <Input as="select" label="Mostrar" value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADO_TORNEO).map(([valor, { texto }]) => (
            <option key={valor} value={valor}>
              {texto}
            </option>
          ))}
        </Input>
      </div>

      {cargando && <Spinner label="Cargando torneos…" />}
      {error && (
        <Alert
          tone="error"
          title="No se pudieron cargar los torneos"
          action={<Button variant="secondary" icon={RefreshCw} onClick={recargar}>Reintentar</Button>}
        >
          {error.message}
        </Alert>
      )}
      {datos && (
        <DataTable
          titulo="Torneos"
          columnas={COLUMNAS}
          filas={datos.datos}
          vacio={estado ? 'No hay torneos en ese estado.' : 'Todavía no hay torneos. Crea el primero con «Nuevo torneo».'}
        />
      )}

      {creando && <TorneoFormDialog onClose={() => setCreando(false)} onGuardado={alCrear} />}
    </div>
  );
}
