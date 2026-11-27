import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, ListOrdered, MapPin, RefreshCw, UserPlus } from 'lucide-react';
import { torneoPublico } from '../api/torneos.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { Alert } from '../components/ui/Alert.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { ESTADO_PRUEBA, SEXO_CATEGORIA } from '../utils/estados.js';
import { formatFechaHora, formatRangoFechas } from '../utils/format.js';
import { ESTADO_PUBLICO } from './TorneosPublicPage.jsx';
import styles from './PublicPages.module.css';

/** Detalle público de un torneo (/torneos/:id): pruebas, categorías y enlaces a resultados. */
export default function TorneoPublicPage() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const { datos, cargando, error, recargar } = useApi((signal) => torneoPublico(id, signal), [id]);

  if (cargando) {
    return (
      <div className={`container ${styles.page}`}>
        <Spinner label="Cargando torneo…" />
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
          title={error.status === 404 ? 'Este torneo no existe' : 'No pudimos cargar el torneo'}
          action={error.status !== 404 && <Button variant="secondary" icon={RefreshCw} onClick={recargar}>Reintentar</Button>}
        >
          {error.status === 404 ? 'Puede que el enlace esté mal escrito.' : error.message}
        </Alert>
      </div>
    );
  }

  const torneo = datos.torneo;
  const abierto = torneo.estado === 'ABIERTO';
  const conResultados = torneo.estado === 'EN_CURSO' || torneo.estado === 'FINALIZADO';
  const pruebas = torneo.pruebas.filter((p) => p.estado !== 'CANCELADA');

  let accion = null;
  if (abierto && !usuario) {
    accion = (
      <Button to="/registro" variant="accent" icon={UserPlus}>
        Crear cuenta para inscribirme
      </Button>
    );
  } else if (abierto && usuario?.rol === 'ATLETA') {
    accion = (
      <Button to={`/atleta/inscribirme?torneo=${torneo.id}`} icon={UserPlus}>
        Inscribirme
      </Button>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <Link to="/torneos" className={styles.volver}>
        <ArrowLeft aria-hidden="true" /> Torneos
      </Link>

      <header className={styles.cabecera}>
        <div>
          <Badge tone={ESTADO_PUBLICO[torneo.estado]?.tono}>{ESTADO_PUBLICO[torneo.estado]?.texto}</Badge>
          <h1 className={styles.titulo} style={{ marginTop: 'var(--space-3)' }}>
            {torneo.nombre}
          </h1>
          <ul className={styles.meta}>
            <li>
              <MapPin aria-hidden="true" /> {torneo.sede}
            </li>
            <li>
              <CalendarDays aria-hidden="true" /> {formatRangoFechas(torneo.fechaInicio, torneo.fechaFin)}
            </li>
          </ul>
          {torneo.descripcion && <p className={styles.descripcion}>{torneo.descripcion}</p>}
        </div>
        {accion && <div className={styles.acciones}>{accion}</div>}
      </header>

      <section className={styles.seccion} aria-labelledby="pruebas-titulo">
        <h2 id="pruebas-titulo">Pruebas</h2>
        {pruebas.length === 0 ? (
          <p className={styles.vacio}>Este torneo todavía no tiene pruebas.</p>
        ) : (
          <ul className={styles.lista}>
            {pruebas.map((p) => (
              <li key={p.id} className={styles.item}>
                <div>
                  <strong>{p.nombre}</strong>
                  <span className={styles.detalle}>
                    {p.deporte} · {formatFechaHora(p.fechaHora)} · {p.inscritos} inscritos
                    {p.cupo ? ` de ${p.cupo}` : ''}
                  </span>
                </div>
                <div className={styles.acciones}>
                  {p.estado !== 'PROGRAMADA' && (
                    <Badge tone={ESTADO_PRUEBA[p.estado]?.tono}>{ESTADO_PRUEBA[p.estado]?.texto}</Badge>
                  )}
                  {conResultados && (
                    <Button
                      variant="secondary"
                      icon={ListOrdered}
                      to={`/resultados/${p.id}`}
                      aria-label={`Ver resultados de ${p.nombre}`}
                    >
                      Ver resultados
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {torneo.categorias.length > 0 && (
        <section className={styles.seccion} aria-labelledby="categorias-titulo">
          <h2 id="categorias-titulo">Categorías</h2>
          <p className={styles.vacio}>Tu categoría se asigna sola según tu edad el día que empieza el torneo y tu sexo.</p>
          <ul className={styles.chips}>
            {torneo.categorias.map((c) => (
              <li key={c.id} className={styles.chip}>
                {c.nombre} · {SEXO_CATEGORIA[c.sexo]} · {c.edadMin} a {c.edadMax} años
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
