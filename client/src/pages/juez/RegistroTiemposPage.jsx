import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import { listarInscripciones } from '../../api/inscripciones.js';
import { guardarResultado } from '../../api/resultados.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useResultadosEnVivo } from '../../hooks/useResultadosEnVivo.js';
import { PageHeader } from '../../components/panel/PageHeader.jsx';
import { ListaInscritos } from '../../components/juez/ListaInscritos.jsx';
import { TiempoForm } from '../../components/juez/TiempoForm.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { LiveBadge } from '../../components/ui/LiveBadge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ESTADO_RESULTADO } from '../../utils/estados.js';
import { formatFechaHora, formatTiempo } from '../../utils/format.js';
import pages from '../admin/AdminPages.module.css';
import styles from '../../components/juez/Juez.module.css';

/** ¿Puede este usuario registrar tiempos en la prueba? (mismas reglas que la API) */
function puedeRegistrar(prueba, rol) {
  if (prueba.estado === 'CANCELADA') return false;
  const torneo = prueba.torneo.estado;
  return torneo === 'EN_CURSO' || (torneo === 'FINALIZADO' && rol === 'ADMIN');
}

const textoResultado = (datos) =>
  datos.estado === 'FINALIZADO' ? formatTiempo(datos.tiempoMs) : ESTADO_RESULTADO[datos.estado].texto;

/**
 * Registro de tiempos de una prueba (/juez/pruebas/:pruebaId y /admin/resultados/:pruebaId).
 * El juez escribe el dorsal, ve al atleta y guarda su tiempo; la lista y la
 * clasificación se actualizan solas por Socket.IO.
 */
export default function RegistroTiemposPage({ volver = '/juez' }) {
  const pruebaId = Number(useParams().pruebaId);
  const { usuario } = useAuth();
  const vivo = useResultadosEnVivo(pruebaId);
  const inscritos = useApi((signal) => listarInscripciones({ pruebaId }, signal), [pruebaId]);
  const [dorsal, setDorsal] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const dorsalRef = useRef(null);
  const formRef = useRef(null);

  // Resultado actual de cada inscripción: la clasificación en vivo manda sobre la lista inicial
  const enVivoPorInscripcion = useMemo(
    () => (vivo.datos ? new Map(vivo.datos.general.map((f) => [f.inscripcionId, f])) : null),
    [vivo.datos],
  );
  const resultadoDe = (inscripcion) => {
    if (!enVivoPorInscripcion) return inscripcion.resultado;
    const fila = enVivoPorInscripcion.get(inscripcion.id);
    return fila ? { observaciones: inscripcion.resultado?.observaciones ?? null, ...fila } : null;
  };

  const lista = inscritos.datos ?? [];
  const buscado = dorsal.trim();
  const seleccionada = buscado ? lista.find((i) => String(i.dorsal) === buscado) : null;

  const elegir = (inscripcion) => {
    setMensaje(null);
    setDorsal(String(inscripcion.dorsal));
    formRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  };

  const guardar = async (datos) => {
    const inscripcion = seleccionada;
    setEnviando(true);
    setMensaje(null);
    try {
      await guardarResultado(inscripcion.id, datos);
      setMensaje({ tono: 'success', texto: `Guardado: ${inscripcion.atleta} · ${textoResultado(datos)}` });
      setDorsal('');
      dorsalRef.current?.focus();
      // Sin Socket.IO la clasificación no llega sola: se vuelve a pedir
      if (!vivo.enVivo) vivo.recargar();
    } catch (err) {
      setMensaje({ tono: 'error', texto: err.message });
    } finally {
      setEnviando(false);
    }
  };

  if (vivo.cargando) return <Spinner label="Cargando la prueba…" />;
  if (vivo.error) {
    return (
      <div className={pages.page}>
        <Link to={volver} className={pages.volver}>
          <ArrowLeft aria-hidden="true" /> Pruebas
        </Link>
        <Alert
          tone="error"
          title="No se pudo cargar la prueba"
          action={<Button variant="secondary" icon={RefreshCw} onClick={vivo.recargar}>Reintentar</Button>}
        >
          {vivo.error.message}
        </Alert>
      </div>
    );
  }

  const { prueba, general } = vivo.datos;
  const editable = puedeRegistrar(prueba, usuario?.rol);
  const podio = general.filter((f) => f.posicion != null).slice(0, 5);

  return (
    <div className={pages.page}>
      <Link to={volver} className={pages.volver}>
        <ArrowLeft aria-hidden="true" /> Pruebas
      </Link>
      <PageHeader
        antetitulo={prueba.torneo.nombre}
        titulo={prueba.nombre}
        descripcion={`${prueba.deporte} · ${formatFechaHora(prueba.fechaHora)}`}
        acciones={<LiveBadge enVivo={vivo.enVivo} />}
      />

      {!editable && (
        <Alert tone="warning" title="No se pueden registrar tiempos en esta prueba">
          {prueba.estado === 'CANCELADA'
            ? 'La prueba está cancelada.'
            : 'Los tiempos se registran mientras el torneo está en curso.'}
        </Alert>
      )}

      <div className={styles.registro}>
        <div className={styles.torneos}>
          {editable && (
            <section className={styles.tarjeta} ref={formRef} aria-labelledby="registrar-titulo">
              <h2 id="registrar-titulo">Registrar resultado</h2>
              {mensaje && <Alert tone={mensaje.tono} title={mensaje.texto} />}
              <Input
                ref={dorsalRef}
                label="Dorsal"
                value={dorsal}
                onChange={(e) => {
                  setMensaje(null);
                  setDorsal(e.target.value.replace(/\D/g, '').slice(0, 5));
                }}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                placeholder="Ej. 301"
                className={`${styles.campoGrande} ${styles.dorsal}`}
              />
              {buscado && !seleccionada && !inscritos.cargando && (
                <p className={styles.sinCoincidencia}>Ningún inscrito tiene el dorsal {buscado}.</p>
              )}
              {seleccionada && (
                <section className={styles.ficha} aria-label="Atleta seleccionado">
                  <div className={styles.atleta}>
                    <strong>{seleccionada.atleta}</strong>
                    <span>
                      {seleccionada.categoria} · Dorsal {seleccionada.dorsal}
                    </span>
                  </div>
                  {resultadoDe(seleccionada) && (
                    <p className={styles.actual}>
                      Resultado actual: <strong>{textoResultado(resultadoDe(seleccionada))}</strong>. Al guardar se reemplaza.
                    </p>
                  )}
                  <TiempoForm
                    key={seleccionada.id}
                    inicial={resultadoDe(seleccionada)}
                    onGuardar={guardar}
                    enviando={enviando}
                  />
                </section>
              )}
            </section>
          )}

          <section className={styles.tarjeta} aria-labelledby="inscritos-titulo">
            <h2 id="inscritos-titulo">Inscritos ({lista.length})</h2>
            {inscritos.cargando && <Spinner label="Cargando inscritos…" />}
            {inscritos.error && <Alert tone="error" title="No se pudieron cargar los inscritos">{inscritos.error.message}</Alert>}
            {inscritos.datos && (
              <ListaInscritos inscritos={lista} resultadoDe={resultadoDe} onElegir={elegir} puedeEditar={editable} />
            )}
          </section>
        </div>

        <section className={styles.tarjeta} aria-labelledby="clasificacion-titulo">
          <h2 id="clasificacion-titulo">Clasificación en vivo</h2>
          {podio.length === 0 ? (
            <p className={styles.vacio}>Todavía no hay tiempos registrados.</p>
          ) : (
            <ol className={styles.top}>
              {podio.map((f) => (
                <li key={f.inscripcionId}>
                  <span className={styles.posicion}>{f.posicion}</span>
                  <span>
                    <span className={styles.nombre}>{f.atleta}</span>
                    <span className={styles.sub}>
                      {f.categoria} · Dorsal {f.dorsal}
                    </span>
                  </span>
                  <span className={styles.tiempo}>{formatTiempo(f.tiempoMs)}</span>
                </li>
              ))}
            </ol>
          )}
          <Button variant="secondary" icon={ExternalLink} to={`/resultados/${prueba.id}`}>
            Ver clasificación completa
          </Button>
        </section>
      </div>
    </div>
  );
}
