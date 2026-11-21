import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Flag, MapPin, RefreshCw, UserPlus } from 'lucide-react';
import { apiFetch } from '../../api/client.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { Alert } from '../ui/Alert.jsx';
import { Button } from '../ui/Button.jsx';
import { formatRangoFechas, partesFecha } from '../../utils/format.js';
import styles from './UpcomingTournaments.module.css';

const ESTADOS = {
  ABIERTO: { texto: 'Inscripciones abiertas', clase: 'abierto' },
  EN_CURSO: { texto: 'En curso', clase: 'curso' },
  FINALIZADO: { texto: 'Finalizado', clase: 'fin' },
};

function TarjetaTorneo({ torneo, conSesion }) {
  const { dia, mes } = partesFecha(torneo.fechaInicio);
  const estado = ESTADOS[torneo.estado] ?? ESTADOS.ABIERTO;

  return (
    <article className={styles.card}>
      <div className={styles.date} aria-hidden="true">
        <span className={`${styles.day} num`}>{dia}</span>
        <span className={styles.month}>{mes}</span>
      </div>
      <div className={styles.body}>
        <span className={`${styles.badge} ${styles[estado.clase]}`}>{estado.texto}</span>
        <h3 className={styles.name}>{torneo.nombre}</h3>
        <ul className={styles.meta}>
          <li>
            <MapPin aria-hidden="true" />
            <span>{torneo.sede}</span>
          </li>
          <li>
            <CalendarDays aria-hidden="true" />
            <span>{formatRangoFechas(torneo.fechaInicio, torneo.fechaFin)}</span>
          </li>
          <li>
            <Flag aria-hidden="true" />
            <span>
              {torneo.pruebas} {torneo.pruebas === 1 ? 'prueba' : 'pruebas'}
            </span>
          </li>
        </ul>
        <ul className={styles.chips} aria-label="Deportes">
          {torneo.deportes.map((d) => (
            <li key={d} className={styles.chip}>
              {d}
            </li>
          ))}
        </ul>
        {torneo.estado === 'ABIERTO' && !conSesion && (
          <Button to="/registro" variant="secondary" icon={UserPlus} className={styles.cta}>
            Crear cuenta para inscribirme
          </Button>
        )}
      </div>
    </article>
  );
}

export function UpcomingTournaments() {
  const { usuario } = useAuth();
  const [estado, setEstado] = useState({ cargando: true, error: null, torneos: [] });

  const cargar = useCallback((signal) => {
    setEstado((s) => ({ ...s, cargando: true, error: null }));
    apiFetch('/api/torneos/proximos', { auth: false, signal })
      .then((torneos) => setEstado({ cargando: false, error: null, torneos }))
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setEstado({ cargando: false, error: err, torneos: [] });
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    cargar(controller.signal);
    return () => controller.abort();
  }, [cargar]);

  return (
    <section id="torneos" className={`container ${styles.section}`} aria-labelledby="torneos-titulo">
      <div className={styles.head}>
        <h2 id="torneos-titulo">Próximos torneos</h2>
        <p className={styles.sub}>Torneos publicados con inscripciones abiertas o en desarrollo.</p>
      </div>

      {estado.cargando && (
        <div className={styles.grid} role="status" aria-label="Cargando torneos">
          {[0, 1].map((i) => (
            <div key={i} className={`${styles.card} ${styles.skeleton}`} aria-hidden="true" />
          ))}
        </div>
      )}

      {!estado.cargando && estado.error && (
        <Alert
          tone="error"
          title="No pudimos cargar los torneos"
          action={
            <Button variant="secondary" icon={RefreshCw} onClick={() => cargar()}>
              Reintentar
            </Button>
          }
        >
          {estado.error.message}
        </Alert>
      )}

      {!estado.cargando && !estado.error && estado.torneos.length === 0 && (
        <p className={styles.empty}>Por ahora no hay torneos programados. ¡Vuelve pronto!</p>
      )}

      {!estado.cargando && !estado.error && estado.torneos.length > 0 && (
        <div className={styles.grid}>
          {estado.torneos.map((t) => (
            <TarjetaTorneo key={t.id} torneo={t} conSesion={Boolean(usuario)} />
          ))}
        </div>
      )}
    </section>
  );
}
