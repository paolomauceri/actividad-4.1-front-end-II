import { useState } from 'react';
import { RefreshCw, UserPlus } from 'lucide-react';
import { actualizarInscripcion, misInscripciones } from '../../api/inscripciones.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useApi } from '../../hooks/useApi.js';
import { PageHeader } from '../../components/panel/PageHeader.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ESTADO_INSCRIPCION } from '../../utils/estados.js';
import { formatFechaHora } from '../../utils/format.js';
import pages from '../admin/AdminPages.module.css';

/** Inscripciones del atleta y opción de anularlas mientras el torneo está abierto (/atleta). */
export default function MisInscripcionesPage() {
  const { usuario } = useAuth();
  const { datos, cargando, error, recargar } = useApi((signal) => misInscripciones(signal), []);
  const [anulando, setAnulando] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const anular = async () => {
    const inscripcion = anulando;
    setAnulando(null);
    try {
      await actualizarInscripcion(inscripcion.id, { estado: 'ANULADA' });
      setMensaje({ tono: 'success', texto: `Anulaste tu inscripción en ${inscripcion.prueba}. Puedes volver a inscribirte mientras el torneo siga abierto.` });
      recargar();
    } catch (err) {
      setMensaje({ tono: 'error', texto: err.message });
    }
  };

  const columnas = [
    {
      clave: 'prueba',
      titulo: 'Prueba',
      render: (i) => (
        <>
          <span className={pages.nombre}>{i.prueba}</span>
          <span className={pages.sub}>
            {i.torneo} · {formatFechaHora(i.pruebaFechaHora)}
          </span>
        </>
      ),
    },
    { clave: 'categoria', titulo: 'Categoría' },
    { clave: 'dorsal', titulo: 'Dorsal', render: (i) => <strong>{i.dorsal}</strong> },
    {
      clave: 'estado',
      titulo: 'Estado',
      render: (i) => <Badge tone={ESTADO_INSCRIPCION[i.estado]?.tono}>{ESTADO_INSCRIPCION[i.estado]?.texto}</Badge>,
    },
    {
      clave: 'accion',
      titulo: 'Acción',
      render: (i) =>
        i.estado !== 'ANULADA' && i.torneoEstado === 'ABIERTO' ? (
          <Button variant="ghost" onClick={() => setAnulando(i)} aria-label={`Anular inscripción en ${i.prueba}`}>
            Anular
          </Button>
        ) : (
          <span className={pages.sub}>—</span>
        ),
    },
  ];

  return (
    <div className={pages.page}>
      <PageHeader
        antetitulo="Panel del atleta"
        titulo={`Hola, ${usuario?.nombre ?? 'atleta'}`}
        descripcion="Estas son tus inscripciones. Lleva tu dorsal el día de la prueba."
        acciones={
          <Button icon={UserPlus} to="/atleta/inscribirme">
            Inscribirme en una prueba
          </Button>
        }
      />

      {mensaje && (
        <Alert tone={mensaje.tono} title={mensaje.texto} action={<Button variant="ghost" onClick={() => setMensaje(null)}>Cerrar</Button>} />
      )}
      {cargando && <Spinner label="Cargando tus inscripciones…" />}
      {error && (
        <Alert
          tone="error"
          title="No se pudieron cargar tus inscripciones"
          action={<Button variant="secondary" icon={RefreshCw} onClick={recargar}>Reintentar</Button>}
        >
          {error.message}
        </Alert>
      )}
      {datos && (
        <DataTable
          titulo="Mis inscripciones"
          columnas={columnas}
          filas={datos}
          vacio="Todavía no te inscribiste en ninguna prueba. Usa «Inscribirme en una prueba» para empezar."
        />
      )}

      {anulando && (
        <ConfirmDialog
          titulo="Anular inscripción"
          mensaje={`¿Anular tu inscripción en ${anulando.prueba}? Liberas tu lugar; si te arrepientes, puedes volver a inscribirte mientras el torneo siga abierto.`}
          confirmar="Anular inscripción"
          peligro
          onCancelar={() => setAnulando(null)}
          onConfirmar={anular}
        />
      )}
    </div>
  );
}
