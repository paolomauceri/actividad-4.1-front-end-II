import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, ExternalLink, MapPin, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { cambiarEstadoTorneo, eliminarTorneo, listarDeportes, obtenerTorneo } from '../../api/torneos.js';
import { useApi } from '../../hooks/useApi.js';
import { PageHeader } from '../../components/panel/PageHeader.jsx';
import { CategoriasTab } from '../../components/admin/CategoriasTab.jsx';
import { InscritosTab } from '../../components/admin/InscritosTab.jsx';
import { PruebasTab } from '../../components/admin/PruebasTab.jsx';
import { TorneoFormDialog } from '../../components/admin/TorneoFormDialog.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { ESTADO_TORNEO, PASOS_TORNEO } from '../../utils/estados.js';
import { formatRangoFechas } from '../../utils/format.js';
import styles from './AdminPages.module.css';

/** Detalle de un torneo en el panel de administración (/admin/torneos/:id). */
export default function TorneoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pestaña, setPestaña] = useState('datos');
  const [editando, setEditando] = useState(false);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tono, texto }
  const [ocupado, setOcupado] = useState(false);

  const { datos, cargando, error, recargar, setDatos } = useApi((signal) => obtenerTorneo(id, signal), [id]);
  const { datos: deportes } = useApi((signal) => listarDeportes(signal), []);
  const torneo = datos?.torneo;

  const mostrarError = (texto) => setMensaje({ tono: 'error', texto });

  const moverEstado = async (estado) => {
    setOcupado(true);
    setMensaje(null);
    try {
      const { torneo: actualizado } = await cambiarEstadoTorneo(torneo.id, estado);
      setDatos({ torneo: { ...torneo, ...actualizado } });
      setMensaje({ tono: 'success', texto: `El torneo ahora está ${ESTADO_TORNEO[estado].texto.toLowerCase()}.` });
    } catch (err) {
      mostrarError(err.message);
    } finally {
      setOcupado(false);
    }
  };

  const borrar = async () => {
    setConfirmarBorrado(false);
    setMensaje(null);
    try {
      await eliminarTorneo(torneo.id);
      navigate('/admin/torneos', { replace: true });
    } catch (err) {
      mostrarError(err.message);
    }
  };

  if (cargando) return <Spinner label="Cargando torneo…" />;
  if (error) {
    return (
      <div className={styles.page}>
        <Link to="/admin/torneos" className={styles.volver}>
          <ArrowLeft aria-hidden="true" /> Torneos
        </Link>
        <Alert
          tone="error"
          title="No se pudo cargar el torneo"
          action={<Button variant="secondary" icon={RefreshCw} onClick={recargar}>Reintentar</Button>}
        >
          {error.message}
        </Alert>
      </div>
    );
  }

  const pasos = PASOS_TORNEO[torneo.estado] ?? {};
  const pestañas = [
    { id: 'datos', label: 'Datos' },
    { id: 'pruebas', label: `Pruebas (${torneo.pruebas.length})` },
    { id: 'categorias', label: `Categorías (${torneo.categorias.length})` },
    { id: 'inscritos', label: `Inscritos (${torneo.totalInscritos})` },
  ];

  return (
    <div className={styles.page}>
      <Link to="/admin/torneos" className={styles.volver}>
        <ArrowLeft aria-hidden="true" /> Torneos
      </Link>

      <PageHeader
        antetitulo="Torneo"
        titulo={torneo.nombre}
        acciones={
          <>
            {pasos.anterior && (
              <Button variant="ghost" disabled={ocupado} onClick={() => moverEstado(pasos.anterior.estado)}>
                {pasos.anterior.texto}
              </Button>
            )}
            {pasos.siguiente && (
              <Button loading={ocupado} onClick={() => moverEstado(pasos.siguiente.estado)}>
                {pasos.siguiente.texto}
              </Button>
            )}
          </>
        }
      >
        <p className={styles.meta}>
          <Badge tone={ESTADO_TORNEO[torneo.estado]?.tono}>{ESTADO_TORNEO[torneo.estado]?.texto}</Badge>
          <span>
            <CalendarDays aria-hidden="true" /> {formatRangoFechas(torneo.fechaInicio, torneo.fechaFin)}
          </span>
          <span>
            <MapPin aria-hidden="true" /> {torneo.sede}
          </span>
        </p>
      </PageHeader>

      {mensaje && (
        <Alert
          tone={mensaje.tono}
          title={mensaje.texto}
          action={<Button variant="ghost" onClick={() => setMensaje(null)}>Cerrar</Button>}
        />
      )}

      <Tabs pestañas={pestañas} activa={pestaña} onCambiar={setPestaña} etiqueta="Secciones del torneo">
        {pestaña === 'datos' && (
          <>
            <dl className={styles.datos}>
              <div>
                <dt>Descripción</dt>
                <dd>{torneo.descripcion || 'Sin descripción'}</dd>
              </div>
              <div>
                <dt>Deportes</dt>
                <dd>{torneo.deportes.length ? torneo.deportes.join(', ') : 'Aún no hay pruebas'}</dd>
              </div>
              <div>
                <dt>Pruebas</dt>
                <dd>{torneo.totalPruebas}</dd>
              </div>
              <div>
                <dt>Atletas inscritos</dt>
                <dd>{torneo.totalInscritos}</dd>
              </div>
            </dl>
            <div className={styles.barra} style={{ marginTop: 'var(--space-5)' }}>
              {torneo.estado !== 'BORRADOR' ? (
                <Button variant="ghost" icon={ExternalLink} to={`/torneos/${torneo.id}`}>
                  Ver página pública
                </Button>
              ) : (
                <p>El público verá este torneo cuando abras las inscripciones.</p>
              )}
              <span className={styles.acciones}>
                <Button variant="secondary" icon={Pencil} onClick={() => setEditando(true)}>
                  Editar datos
                </Button>
                <Button variant="ghost" icon={Trash2} onClick={() => setConfirmarBorrado(true)}>
                  Eliminar torneo
                </Button>
              </span>
            </div>
          </>
        )}
        {pestaña === 'pruebas' && (
          <PruebasTab torneo={torneo} deportes={deportes ?? []} onCambio={recargar} onError={mostrarError} />
        )}
        {pestaña === 'categorias' && <CategoriasTab torneo={torneo} onCambio={recargar} onError={mostrarError} />}
        {pestaña === 'inscritos' && <InscritosTab torneo={torneo} onCambio={recargar} />}
      </Tabs>

      {editando && (
        <TorneoFormDialog
          torneo={torneo}
          onClose={() => setEditando(false)}
          onGuardado={() => {
            setEditando(false);
            setMensaje({ tono: 'success', texto: 'Datos del torneo actualizados.' });
            recargar();
          }}
        />
      )}
      {confirmarBorrado && (
        <ConfirmDialog
          titulo="Eliminar torneo"
          mensaje={`¿Eliminar «${torneo.nombre}» con sus pruebas y categorías? Solo se puede si nadie se inscribió.`}
          confirmar="Eliminar"
          peligro
          onCancelar={() => setConfirmarBorrado(false)}
          onConfirmar={borrar}
        />
      )}
    </div>
  );
}
