import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays, CheckCircle2, MapPin, RefreshCw } from 'lucide-react';
import { listarTorneos, obtenerTorneo } from '../../api/torneos.js';
import { inscribir, misInscripciones } from '../../api/inscripciones.js';
import { useApi } from '../../hooks/useApi.js';
import { PageHeader } from '../../components/panel/PageHeader.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { formatFechaHora, formatRangoFechas } from '../../utils/format.js';
import pages from '../admin/AdminPages.module.css';
import styles from './AtletaPages.module.css';

/** Torneos abiertos con sus pruebas, y las inscripciones activas del atleta por prueba. */
async function cargar(signal) {
  const [{ datos: torneos }, mias] = await Promise.all([
    listarTorneos({ estado: 'ABIERTO', limit: 50 }, signal),
    misInscripciones(signal),
  ]);
  const detalles = await Promise.all(torneos.map((t) => obtenerTorneo(t.id, signal).then((r) => r.torneo)));
  const inscritas = Object.fromEntries(mias.filter((i) => i.estado !== 'ANULADA').map((i) => [i.pruebaId, i]));
  return { torneos: detalles, inscritas };
}

const textoInscrito = (i) => `Inscrito · Dorsal ${i.dorsal} · ${i.categoria}`;

/** El atleta elige una prueba de un torneo abierto y se inscribe (/atleta/inscribirme). */
export default function InscribirmePage() {
  const [params] = useSearchParams();
  const soloTorneo = Number(params.get('torneo')) || null;
  const { datos, cargando, error, recargar, setDatos } = useApi(cargar, []);
  const [enviando, setEnviando] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const inscribirse = async (prueba) => {
    setEnviando(prueba.id);
    setMensaje(null);
    try {
      const { inscripcion } = await inscribir({ pruebaId: prueba.id });
      setDatos({ ...datos, inscritas: { ...datos.inscritas, [prueba.id]: inscripcion } });
      setMensaje({ tono: 'success', texto: `¡Listo! Quedaste inscrito en ${prueba.nombre} con el dorsal ${inscripcion.dorsal}.` });
    } catch (err) {
      setMensaje({ tono: 'error', texto: err.message });
    } finally {
      setEnviando(null);
    }
  };

  const torneos = datos?.torneos.filter((t) => !soloTorneo || t.id === soloTorneo) ?? [];

  return (
    <div className={pages.page}>
      <PageHeader
        antetitulo="Panel del atleta"
        titulo="Inscribirme"
        descripcion="Elige una prueba de un torneo con inscripciones abiertas. Tu categoría y tu dorsal se asignan solos."
      />

      {mensaje && (
        <Alert tone={mensaje.tono} title={mensaje.texto} action={<Button variant="ghost" onClick={() => setMensaje(null)}>Cerrar</Button>} />
      )}
      {cargando && <Spinner label="Cargando torneos abiertos…" />}
      {error && (
        <Alert
          tone="error"
          title="No se pudieron cargar los torneos"
          action={<Button variant="secondary" icon={RefreshCw} onClick={recargar}>Reintentar</Button>}
        >
          {error.message}
        </Alert>
      )}
      {datos && torneos.length === 0 && (
        <Alert tone="info" title="No hay torneos con inscripciones abiertas en este momento.">
          Vuelve pronto: cuando un torneo abra sus inscripciones aparecerá aquí.
        </Alert>
      )}

      {torneos.map((t) => (
        <section key={t.id} className={styles.torneo} aria-labelledby={`torneo-${t.id}`}>
          <h2 id={`torneo-${t.id}`}>{t.nombre}</h2>
          <p className={pages.meta}>
            <span>
              <CalendarDays aria-hidden="true" /> {formatRangoFechas(t.fechaInicio, t.fechaFin)}
            </span>
            <span>
              <MapPin aria-hidden="true" /> {t.sede}
            </span>
          </p>
          <ul className={styles.pruebas}>
            {t.pruebas.map((p) => {
              const inscrita = datos.inscritas[p.id];
              const lleno = p.cupo != null && p.inscritos >= p.cupo;
              const cerrada = p.estado === 'CANCELADA' || p.estado === 'FINALIZADA';
              return (
                <li key={p.id} className={styles.prueba}>
                  <div>
                    <strong>{p.nombre}</strong>
                    <span className={styles.detalle}>
                      {p.deporte} · {formatFechaHora(p.fechaHora)}
                      {p.cupo != null && ` · ${Math.max(p.cupo - p.inscritos, 0)} cupos libres`}
                    </span>
                  </div>
                  {inscrita ? (
                    <span className={styles.inscrito}>
                      <CheckCircle2 aria-hidden="true" />
                      {textoInscrito(inscrita)}
                    </span>
                  ) : cerrada ? (
                    <span className={styles.noDisponible}>{p.estado === 'CANCELADA' ? 'Cancelada' : 'Finalizada'}</span>
                  ) : lleno ? (
                    <span className={styles.noDisponible}>Cupo completo</span>
                  ) : (
                    <Button
                      loading={enviando === p.id}
                      disabled={enviando !== null}
                      onClick={() => inscribirse(p)}
                      aria-label={`Inscribirme en ${p.nombre}`}
                    >
                      Inscribirme
                    </Button>
                  )}
                </li>
              );
            })}
            {t.pruebas.length === 0 && <li className={styles.prueba}>Este torneo todavía no publicó sus pruebas.</li>}
          </ul>
        </section>
      ))}
    </div>
  );
}
