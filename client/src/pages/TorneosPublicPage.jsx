import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Flag, MapPin, RefreshCw } from 'lucide-react';
import { listarTorneos } from '../api/torneos.js';
import { useApi } from '../hooks/useApi.js';
import { Alert } from '../components/ui/Alert.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { formatRangoFechas } from '../utils/format.js';
import styles from './PublicPages.module.css';

export const ESTADO_PUBLICO = {
  ABIERTO: { texto: 'Inscripciones abiertas', tono: 'success' },
  EN_CURSO: { texto: 'En curso', tono: 'warning' },
  FINALIZADO: { texto: 'Finalizado', tono: 'info' },
};

const FILTROS = [
  { estado: '', texto: 'Todos' },
  { estado: 'ABIERTO', texto: 'Inscripciones abiertas' },
  { estado: 'EN_CURSO', texto: 'En curso' },
  { estado: 'FINALIZADO', texto: 'Finalizados' },
];

/** Torneos publicados (/torneos), con filtro por estado. */
export default function TorneosPublicPage() {
  const [estado, setEstado] = useState('');
  const { datos, cargando, error, recargar } = useApi(
    (signal) => listarTorneos({ estado, limit: 50 }, signal),
    [estado],
  );

  return (
    <div className={`container ${styles.page}`}>
      <header>
        <p className={styles.eyebrow}>Calendario</p>
        <h1 className={styles.titulo}>Torneos</h1>
        <p className={styles.descripcion}>
          Revisa las pruebas de cada torneo, inscríbete en los que tienen inscripciones abiertas y sigue los resultados en vivo.
        </p>
      </header>

      <ul className={styles.filtros} aria-label="Filtrar por estado">
        {FILTROS.map((f) => (
          <li key={f.estado}>
            <button
              type="button"
              className={styles.filtro}
              aria-pressed={estado === f.estado}
              onClick={() => setEstado(f.estado)}
            >
              {f.texto}
            </button>
          </li>
        ))}
      </ul>

      {cargando && <Spinner label="Cargando torneos…" />}
      {error && (
        <Alert
          tone="error"
          title="No pudimos cargar los torneos"
          action={<Button variant="secondary" icon={RefreshCw} onClick={recargar}>Reintentar</Button>}
        >
          {error.message}
        </Alert>
      )}
      {datos?.datos.length === 0 && <p className={styles.vacio}>No hay torneos con ese estado.</p>}

      {datos?.datos.length > 0 && (
        <div className={styles.grid}>
          {datos.datos.map((t) => (
            <article key={t.id} className={styles.tarjeta}>
              <Badge tone={ESTADO_PUBLICO[t.estado]?.tono}>{ESTADO_PUBLICO[t.estado]?.texto}</Badge>
              <h2>
                <Link to={`/torneos/${t.id}`} className={styles.enlaceTarjeta}>
                  {t.nombre}
                </Link>
              </h2>
              <ul className={styles.meta}>
                <li>
                  <MapPin aria-hidden="true" /> {t.sede}
                </li>
                <li>
                  <CalendarDays aria-hidden="true" /> {formatRangoFechas(t.fechaInicio, t.fechaFin)}
                </li>
                <li>
                  <Flag aria-hidden="true" /> {t.totalPruebas} {t.totalPruebas === 1 ? 'prueba' : 'pruebas'}
                </li>
              </ul>
              {t.deportes.length > 0 && (
                <ul className={styles.chips} aria-label="Deportes">
                  {t.deportes.map((d) => (
                    <li key={d} className={styles.chip}>
                      {d}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
