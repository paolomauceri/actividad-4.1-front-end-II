import { CalendarDays, MapPin, RefreshCw, Timer, Users } from 'lucide-react';
import { torneoPublico, torneosPublicos } from '../../api/torneos.js';
import { useApi } from '../../hooks/useApi.js';
import { PageHeader } from '../../components/panel/PageHeader.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ESTADO_PRUEBA, ESTADO_TORNEO } from '../../utils/estados.js';
import { formatFechaHora, formatRangoFechas } from '../../utils/format.js';
import pages from '../admin/AdminPages.module.css';
import styles from '../../components/juez/Juez.module.css';

/** Torneos en los estados pedidos, cada uno con sus pruebas (sin las canceladas). */
async function cargarTorneos(estados, signal) {
  const listas = await Promise.all(estados.map((estado) => torneosPublicos({ estado, limit: 50 }, signal)));
  const torneos = listas.flatMap((l) => l.datos);
  const detalles = await Promise.all(torneos.map((t) => torneoPublico(t.id, signal)));
  return detalles.map(({ torneo }) => ({ ...torneo, pruebas: torneo.pruebas.filter((p) => p.estado !== 'CANCELADA') }));
}

/**
 * Pruebas en las que se pueden registrar tiempos.
 * El juez ve los torneos EN_CURSO; el admin (sección Resultados) también los FINALIZADO para corregir.
 */
export default function PruebasJuezPage({
  base = '/juez/pruebas',
  estados = ['EN_CURSO'],
  antetitulo = 'Panel del juez',
  titulo = 'Pruebas en curso',
  descripcion = 'Elige una prueba para registrar los tiempos de los atletas.',
}) {
  const { datos, cargando, error, recargar } = useApi((signal) => cargarTorneos(estados, signal), [estados.join()]);

  return (
    <div className={pages.page}>
      <PageHeader antetitulo={antetitulo} titulo={titulo} descripcion={descripcion} />

      {cargando && <Spinner label="Cargando pruebas…" />}
      {error && (
        <Alert
          tone="error"
          title="No se pudieron cargar las pruebas"
          action={<Button variant="secondary" icon={RefreshCw} onClick={recargar}>Reintentar</Button>}
        >
          {error.message}
        </Alert>
      )}
      {datos?.length === 0 && (
        <Alert tone="info" title="No hay torneos en curso">
          Cuando el organizador inicie un torneo, sus pruebas aparecen aquí.
        </Alert>
      )}

      {datos && datos.length > 0 && (
        <div className={styles.torneos}>
          {datos.map((torneo) => (
            <section key={torneo.id} className={styles.tarjeta} aria-labelledby={`torneo-${torneo.id}`}>
              <div className={styles.encabezadoTorneo}>
                <h2 id={`torneo-${torneo.id}`}>{torneo.nombre}</h2>
                <Badge tone={ESTADO_TORNEO[torneo.estado]?.tono}>{ESTADO_TORNEO[torneo.estado]?.texto}</Badge>
              </div>
              <p className={pages.meta}>
                <span>
                  <MapPin aria-hidden="true" /> {torneo.sede}
                </span>
                <span>
                  <CalendarDays aria-hidden="true" /> {formatRangoFechas(torneo.fechaInicio, torneo.fechaFin)}
                </span>
              </p>
              {torneo.pruebas.length === 0 ? (
                <p className={styles.vacio}>Este torneo no tiene pruebas activas.</p>
              ) : (
                <ul className={styles.pruebas}>
                  {torneo.pruebas.map((p) => (
                    <li key={p.id} className={styles.prueba}>
                      <div>
                        <strong>{p.nombre}</strong>
                        <span className={styles.detalle}>
                          {p.deporte} · {formatFechaHora(p.fechaHora)}
                          <span>
                            · <Users aria-hidden="true" width={14} height={14} /> {p.inscritos} inscritos
                          </span>
                          <Badge tone={ESTADO_PRUEBA[p.estado]?.tono}>{ESTADO_PRUEBA[p.estado]?.texto}</Badge>
                        </span>
                      </div>
                      <Button icon={Timer} to={`${base}/${p.id}`} aria-label={`Registrar tiempos de ${p.nombre}`}>
                        Registrar tiempos
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
