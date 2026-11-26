import { Save, Trophy } from 'lucide-react';
import { actualizarTorneo, crearTorneo } from '../../api/torneos.js';
import { useFormulario } from '../../hooks/useFormulario.js';
import { Alert } from '../ui/Alert.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Modal } from '../ui/Modal.jsx';
import styles from './Formulario.module.css';

function validar(d) {
  const e = {};
  if (d.nombre.trim().length < 3) e.nombre = 'Escribe un nombre de al menos 3 caracteres';
  if (d.sede.trim().length < 3) e.sede = 'Indica la sede (al menos 3 caracteres)';
  if (!d.fechaInicio) e.fechaInicio = 'Indica la fecha de inicio';
  if (!d.fechaFin) e.fechaFin = 'Indica la fecha de fin';
  else if (d.fechaInicio && d.fechaFin < d.fechaInicio) e.fechaFin = 'La fecha de fin no puede ser anterior a la de inicio';
  return e;
}

/**
 * Crear o editar un torneo. Con `torneo` edita; sin él crea uno nuevo (en BORRADOR).
 * @param {{ torneo?: object, onClose: () => void, onGuardado: (torneo) => void }} props
 */
export function TorneoFormDialog({ torneo, onClose, onGuardado }) {
  const editando = Boolean(torneo);
  const { errorGeneral, enviando, campo, onSubmit } = useFormulario({
    inicial: {
      nombre: torneo?.nombre ?? '',
      descripcion: torneo?.descripcion ?? '',
      sede: torneo?.sede ?? '',
      fechaInicio: torneo?.fechaInicio ?? '',
      fechaFin: torneo?.fechaFin ?? '',
    },
    validar,
    enviar: async (d) => {
      const datos = {
        nombre: d.nombre.trim(),
        descripcion: d.descripcion.trim() || null,
        sede: d.sede.trim(),
        fechaInicio: d.fechaInicio,
        fechaFin: d.fechaFin,
      };
      const { torneo: guardado } = editando ? await actualizarTorneo(torneo.id, datos) : await crearTorneo(datos);
      onGuardado(guardado);
    },
  });

  return (
    <Modal
      titulo={editando ? 'Editar torneo' : 'Nuevo torneo'}
      descripcion={editando ? undefined : 'El torneo se crea como borrador: el público lo verá cuando abras las inscripciones.'}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} noValidate className={styles.form}>
        {errorGeneral && <Alert tone="error">{errorGeneral}</Alert>}
        <Input label="Nombre" required maxLength={120} {...campo('nombre')} />
        <Input label="Sede" required maxLength={120} hint="Lugar donde se corre: piscina, lago, circuito…" {...campo('sede')} />
        <div className={styles.fila}>
          <Input label="Fecha de inicio" type="date" required {...campo('fechaInicio')} />
          <Input label="Fecha de fin" type="date" required {...campo('fechaFin')} />
        </div>
        <Input label="Descripción" as="textarea" rows={3} maxLength={2000} {...campo('descripcion')} />
        <div className={styles.acciones}>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={enviando} icon={editando ? Save : Trophy}>
            {editando ? 'Guardar cambios' : 'Crear torneo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
