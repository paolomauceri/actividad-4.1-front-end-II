import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { cambiarEstadoPrueba, eliminarPrueba } from '../../api/torneos.js';
import { Button } from '../ui/Button.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { DataTable } from '../ui/DataTable.jsx';
import { ESTADO_PRUEBA } from '../../utils/estados.js';
import { formatFechaHora } from '../../utils/format.js';
import { PruebaFormDialog } from './PruebaFormDialog.jsx';
import styles from '../../pages/admin/AdminPages.module.css';

const formatDistancia = (m) => (m >= 1000 ? `${(m / 1000).toLocaleString('es')} km` : `${m} m`);

/**
 * Pestaña "Pruebas" del detalle de torneo.
 * @param {{ torneo: object, deportes: object[], onCambio: () => void, onError: (mensaje: string) => void }} props
 */
export function PruebasTab({ torneo, deportes, onCambio, onError }) {
  const [editando, setEditando] = useState(null); // null | 'nueva' | prueba
  const [borrando, setBorrando] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  const accion = async (fn) => {
    setOcupado(true);
    try {
      await fn();
      onCambio();
    } catch (err) {
      onError(err.message);
    } finally {
      setOcupado(false);
    }
  };

  const columnas = [
    {
      clave: 'nombre',
      titulo: 'Prueba',
      render: (p) => (
        <>
          <span className={styles.nombre}>{p.nombre}</span>
          <span className={styles.sub}>
            {p.deporte} · {formatDistancia(p.distanciaM)}
          </span>
        </>
      ),
    },
    { clave: 'fecha', titulo: 'Fecha y hora', render: (p) => formatFechaHora(p.fechaHora) },
    { clave: 'cupo', titulo: 'Inscritos', render: (p) => (p.cupo ? `${p.inscritos} / ${p.cupo}` : `${p.inscritos} (sin límite)`) },
    {
      clave: 'estado',
      titulo: 'Estado',
      render: (p) => (
        <select
          className={styles.selectEstado}
          aria-label={`Estado de ${p.nombre}`}
          value={p.estado}
          disabled={ocupado}
          onChange={(e) => accion(() => cambiarEstadoPrueba(p.id, e.target.value))}
        >
          {Object.entries(ESTADO_PRUEBA).map(([valor, { texto }]) => (
            <option key={valor} value={valor}>
              {texto}
            </option>
          ))}
        </select>
      ),
    },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      render: (p) => (
        <span className={styles.acciones}>
          <Button variant="ghost" icon={Pencil} onClick={() => setEditando(p)} aria-label={`Editar ${p.nombre}`}>
            Editar
          </Button>
          <Button variant="ghost" icon={Trash2} onClick={() => setBorrando(p)} aria-label={`Eliminar ${p.nombre}`}>
            Eliminar
          </Button>
        </span>
      ),
    },
  ];

  return (
    <>
      <div className={styles.barra}>
        <p>Cada prueba es una competencia del torneo (por ejemplo, 1.500 m aguas abiertas).</p>
        <Button icon={Plus} onClick={() => setEditando('nueva')}>
          Nueva prueba
        </Button>
      </div>
      <DataTable titulo="Pruebas" columnas={columnas} filas={torneo.pruebas} vacio="Este torneo todavía no tiene pruebas." />

      {editando && (
        <PruebaFormDialog
          torneo={torneo}
          prueba={editando === 'nueva' ? undefined : editando}
          deportes={deportes}
          onClose={() => setEditando(null)}
          onGuardado={() => {
            setEditando(null);
            onCambio();
          }}
        />
      )}
      {borrando && (
        <ConfirmDialog
          titulo="Eliminar prueba"
          mensaje={`¿Eliminar «${borrando.nombre}»? Solo se puede si no tiene inscritos.`}
          confirmar="Eliminar"
          peligro
          ocupado={ocupado}
          onCancelar={() => setBorrando(null)}
          onConfirmar={() => {
            const prueba = borrando;
            setBorrando(null);
            accion(() => eliminarPrueba(prueba.id));
          }}
        />
      )}
    </>
  );
}
