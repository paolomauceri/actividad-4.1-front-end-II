import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Shield } from 'lucide-react';
import { obtenerAtleta } from '../../api/atletas.js';
import { useApi } from '../../hooks/useApi.js';
import { PageHeader } from '../../components/panel/PageHeader.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ESTADO_INSCRIPCION, ESTADO_RESULTADO } from '../../utils/estados.js';
import { formatFechaHora, formatTiempo } from '../../utils/format.js';
import { edadEn } from '../../utils/validacion.js';
import styles from './AdminPages.module.css';

const COLUMNAS = [
  {
    clave: 'prueba',
    titulo: 'Prueba',
    render: (i) => (
      <>
        <span className={styles.nombre}>{i.prueba}</span>
        <span className={styles.sub}>
          {i.torneo} · {formatFechaHora(i.pruebaFechaHora)}
        </span>
      </>
    ),
  },
  { clave: 'categoria', titulo: 'Categoría' },
  { clave: 'dorsal', titulo: 'Dorsal' },
  {
    clave: 'estado',
    titulo: 'Inscripción',
    render: (i) => <Badge tone={ESTADO_INSCRIPCION[i.estado]?.tono}>{ESTADO_INSCRIPCION[i.estado]?.texto}</Badge>,
  },
  {
    clave: 'resultado',
    titulo: 'Resultado',
    render: (i) =>
      !i.resultado
        ? 'Sin resultado'
        : i.resultado.estado === 'FINALIZADO'
          ? formatTiempo(i.resultado.tiempoMs)
          : ESTADO_RESULTADO[i.resultado.estado]?.texto,
  },
];

/** Ficha de un atleta con sus inscripciones y resultados (/admin/atletas/:id). */
export default function AtletaDetallePage() {
  const { id } = useParams();
  const { datos, cargando, error } = useApi((signal) => obtenerAtleta(id, signal), [id]);

  const volver = (
    <Link to="/admin/atletas" className={styles.volver}>
      <ArrowLeft aria-hidden="true" /> Atletas
    </Link>
  );

  if (cargando) return <Spinner label="Cargando atleta…" />;
  if (error) {
    return (
      <div className={styles.page}>
        {volver}
        <Alert tone="error" title="No se pudo cargar el atleta">
          {error.message}
        </Alert>
      </div>
    );
  }

  const { atleta, inscripciones } = datos;
  return (
    <div className={styles.page}>
      {volver}
      <PageHeader antetitulo="Atleta" titulo={`${atleta.nombre} ${atleta.apellido}`}>
        <p className={styles.meta}>
          <Badge tone={atleta.activo ? 'success' : 'neutral'}>{atleta.activo ? 'Cuenta activa' : 'Cuenta inactiva'}</Badge>
          <span>
            {edadEn(atleta.fechaNacimiento)} años · {atleta.sexo === 'F' ? 'Femenino' : 'Masculino'}
          </span>
          <span>
            <Shield aria-hidden="true" /> {atleta.club ?? 'Sin club'}
          </span>
          <span>
            <Mail aria-hidden="true" /> {atleta.email}
          </span>
          {atleta.telefono && (
            <span>
              <Phone aria-hidden="true" /> {atleta.telefono}
            </span>
          )}
        </p>
      </PageHeader>

      <DataTable
        titulo="Inscripciones del atleta"
        columnas={COLUMNAS}
        filas={inscripciones}
        vacio="Este atleta todavía no se inscribió en ninguna prueba."
      />
    </div>
  );
}
