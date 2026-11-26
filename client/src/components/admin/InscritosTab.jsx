import { useState } from 'react';
import { Hash, Plus } from 'lucide-react';
import { actualizarInscripcion, listarInscripciones } from '../../api/inscripciones.js';
import { useApi } from '../../hooks/useApi.js';
import { Alert } from '../ui/Alert.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Button } from '../ui/Button.jsx';
import { DataTable } from '../ui/DataTable.jsx';
import { Input } from '../ui/Input.jsx';
import { Modal } from '../ui/Modal.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { ESTADO_INSCRIPCION } from '../../utils/estados.js';
import { InscribirAtletaDialog } from './InscribirAtletaDialog.jsx';
import form from './Formulario.module.css';
import styles from '../../pages/admin/AdminPages.module.css';

/** Diálogo pequeño para corregir el dorsal de una inscripción. */
function DorsalDialog({ inscripcion, onClose, onGuardado }) {
  const [dorsal, setDorsal] = useState(String(inscripcion.dorsal));
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    if (!/^\d{1,5}$/.test(dorsal) || Number(dorsal) < 1) return setError('Escribe un número de dorsal mayor que 0');
    setEnviando(true);
    try {
      await actualizarInscripcion(inscripcion.id, { dorsal: Number(dorsal) });
      onGuardado();
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <Modal titulo={`Dorsal de ${inscripcion.atleta}`} onClose={onClose}>
      <form onSubmit={enviar} noValidate className={form.form}>
        <Input
          label="Dorsal"
          type="number"
          inputMode="numeric"
          min={1}
          value={dorsal}
          onChange={(e) => setDorsal(e.target.value)}
          error={error}
        />
        <div className={form.acciones}>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={enviando}>
            Guardar dorsal
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** Pestaña "Inscritos" del detalle de torneo: inscribir, anular, reactivar y cambiar dorsal. */
export function InscritosTab({ torneo, onCambio }) {
  const [pruebaId, setPruebaId] = useState('');
  const [inscribiendo, setInscribiendo] = useState(false);
  const [dorsalDe, setDorsalDe] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const { datos, cargando, error, recargar } = useApi(
    (signal) => listarInscripciones({ torneoId: torneo.id, pruebaId, incluirAnuladas: 1 }, signal),
    [torneo.id, pruebaId],
  );
  const admiteInscripciones = ['ABIERTO', 'EN_CURSO'].includes(torneo.estado);

  const refrescar = () => {
    recargar();
    onCambio?.();
  };

  const cambiarEstado = async (i, estado) => {
    setMensaje(null);
    try {
      await actualizarInscripcion(i.id, { estado });
      refrescar();
    } catch (err) {
      setMensaje({ tono: 'error', texto: err.message });
    }
  };

  const columnas = [
    { clave: 'dorsal', titulo: 'Dorsal', render: (i) => <strong>{i.dorsal}</strong> },
    {
      clave: 'atleta',
      titulo: 'Atleta',
      render: (i) => (
        <>
          <span className={styles.nombre}>{i.atleta}</span>
          <span className={styles.sub}>{i.club ?? 'Sin club'}</span>
        </>
      ),
    },
    { clave: 'prueba', titulo: 'Prueba' },
    { clave: 'categoria', titulo: 'Categoría' },
    {
      clave: 'estado',
      titulo: 'Estado',
      render: (i) => <Badge tone={ESTADO_INSCRIPCION[i.estado]?.tono}>{ESTADO_INSCRIPCION[i.estado]?.texto}</Badge>,
    },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      render: (i) => (
        <span className={styles.acciones}>
          <Button variant="ghost" icon={Hash} onClick={() => setDorsalDe(i)} aria-label={`Cambiar dorsal de ${i.atleta}`}>
            Dorsal
          </Button>
          {i.estado === 'ANULADA' ? (
            <Button variant="ghost" onClick={() => cambiarEstado(i, 'CONFIRMADA')} aria-label={`Reactivar a ${i.atleta}`}>
              Reactivar
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => cambiarEstado(i, 'ANULADA')} aria-label={`Anular a ${i.atleta}`}>
              Anular
            </Button>
          )}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className={styles.barra}>
        <div className={styles.filtros}>
          <Input as="select" label="Prueba" value={pruebaId} onChange={(e) => setPruebaId(e.target.value)}>
            <option value="">Todas las pruebas</option>
            {torneo.pruebas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </Input>
        </div>
        <Button
          icon={Plus}
          onClick={() => setInscribiendo(true)}
          disabled={!admiteInscripciones || !torneo.pruebas.length}
          title={admiteInscripciones ? undefined : 'Abre las inscripciones del torneo para inscribir atletas'}
        >
          Inscribir atleta
        </Button>
      </div>

      {!admiteInscripciones && (
        <Alert tone="info">Para inscribir atletas el torneo debe estar abierto o en curso.</Alert>
      )}
      {mensaje && <Alert tone={mensaje.tono}>{mensaje.texto}</Alert>}
      {cargando && <Spinner label="Cargando inscritos…" />}
      {error && (
        <Alert tone="error" title="No se pudieron cargar los inscritos">
          {error.message}
        </Alert>
      )}
      {datos && (
        <DataTable titulo="Inscritos" columnas={columnas} filas={datos} vacio="Todavía no hay inscritos en este torneo." />
      )}

      {inscribiendo && (
        <InscribirAtletaDialog
          torneo={torneo}
          pruebaInicial={pruebaId}
          onClose={() => setInscribiendo(false)}
          onInscrito={(i) => {
            setInscribiendo(false);
            setMensaje({ tono: 'success', texto: `${i.atleta} quedó inscrito en ${i.prueba} con el dorsal ${i.dorsal} (${i.categoria}).` });
            refrescar();
          }}
        />
      )}
      {dorsalDe && (
        <DorsalDialog
          inscripcion={dorsalDe}
          onClose={() => setDorsalDe(null)}
          onGuardado={() => {
            setDorsalDe(null);
            refrescar();
          }}
        />
      )}
    </>
  );
}
