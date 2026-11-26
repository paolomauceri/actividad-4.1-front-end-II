import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Flag, RefreshCw, Ruler } from 'lucide-react';
import { useResultadosEnVivo } from '../hooks/useResultadosEnVivo.js';
import { Podio } from '../components/resultados/Podio.jsx';
import { TablaClasificacion } from '../components/resultados/TablaClasificacion.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { LiveBadge } from '../components/ui/LiveBadge.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { Tabs } from '../components/ui/Tabs.jsx';
import { formatFechaHora } from '../utils/format.js';
import styles from './PublicPages.module.css';

const GENERAL = 'general';

const formatDistancia = (m) => (m >= 1000 ? `${(m / 1000).toLocaleString('es')} km` : `${m} m`);
const horaActualizacion = (iso) =>
  new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(iso));

/**
 * Resultados públicos de una prueba (/resultados/:pruebaId): podio y clasificación
 * general o por categoría. Se actualiza en vivo mientras el torneo está en curso.
 */
export default function ResultadosPage() {
  const pruebaId = Number(useParams().pruebaId);
  const { datos, cargando, error, enVivo, recargar } = useResultadosEnVivo(pruebaId);
  const [pestaña, setPestaña] = useState(GENERAL);

  if (cargando) {
    return (
      <div className={`container ${styles.page}`}>
        <Spinner label="Cargando resultados…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`container ${styles.page}`}>
        <Link to="/torneos" className={styles.volver}>
          <ArrowLeft aria-hidden="true" /> Torneos
        </Link>
        <Alert
          tone="error"
          title={error.status === 404 ? 'La prueba no existe' : 'No se pudieron cargar los resultados'}
          action={error.status !== 404 && <Button variant="secondary" icon={RefreshCw} onClick={recargar}>Reintentar</Button>}
        >
          {error.status === 404 ? 'Revisa el enlace o elige la prueba desde la página del torneo.' : error.message}
        </Alert>
      </div>
    );
  }

  const { prueba, categorias, general } = datos;
  const categoria = categorias.find((c) => String(c.id) === pestaña);
  const filas = categoria ? categoria.clasificacion : general;
  const pestañas = [{ id: GENERAL, label: 'General' }, ...categorias.map((c) => ({ id: String(c.id), label: c.nombre }))];
  const enCurso = prueba.torneo.estado === 'EN_CURSO';

  return (
    <div className={`container ${styles.page}`}>
      <Link to={`/torneos/${prueba.torneo.id}`} className={styles.volver}>
        <ArrowLeft aria-hidden="true" /> {prueba.torneo.nombre}
      </Link>

      <header className={styles.cabecera}>
        <div>
          <p className={styles.eyebrow}>Resultados</p>
          <h1 className={styles.titulo}>{prueba.nombre}</h1>
          <ul className={styles.meta}>
            <li>
              <Flag aria-hidden="true" /> {prueba.deporte}
            </li>
            <li>
              <Ruler aria-hidden="true" /> {formatDistancia(prueba.distanciaM)}
            </li>
            <li>
              <CalendarDays aria-hidden="true" /> {formatFechaHora(prueba.fechaHora)}
            </li>
          </ul>
        </div>
        <div className={styles.acciones}>
          {enCurso ? <LiveBadge enVivo={enVivo} /> : <Badge tone="info">Resultados finales</Badge>}
        </div>
      </header>

      <Tabs pestañas={pestañas} activa={pestaña} onCambiar={setPestaña} etiqueta="Clasificación">
        <div className={styles.panel}>
          <Podio filas={filas} />
          <TablaClasificacion
            key={pestaña}
            titulo={categoria ? `Clasificación ${categoria.nombre}` : 'Clasificación general'}
            filas={filas}
            conCategoria={!categoria}
          />
          <p className={styles.actualizado}>Actualizado a las {horaActualizacion(datos.actualizadoEn)}</p>
        </div>
      </Tabs>
    </div>
  );
}
