import { Save } from 'lucide-react';
import { actualizarPrueba, crearPrueba } from '../../api/torneos.js';
import { useFormulario } from '../../hooks/useFormulario.js';
import { Alert } from '../ui/Alert.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Modal } from '../ui/Modal.jsx';
import styles from './Formulario.module.css';

const esEnteroPositivo = (v) => /^\d+$/.test(String(v).trim()) && Number(v) > 0;

/**
 * Crear o editar una prueba del torneo.
 * @param {{ torneo: object, prueba?: object, deportes: {id:number,nombre:string}[], onClose: () => void, onGuardado: () => void }} props
 */
export function PruebaFormDialog({ torneo, prueba, deportes, onClose, onGuardado }) {
  const editando = Boolean(prueba);

  const validar = (d) => {
    const e = {};
    if (!d.deporteId) e.deporteId = 'Selecciona un deporte';
    if (d.nombre.trim().length < 3) e.nombre = 'Escribe un nombre de al menos 3 caracteres';
    if (!esEnteroPositivo(d.distanciaM)) e.distanciaM = 'Indica la distancia en metros (número entero)';
    if (!d.fechaHora) e.fechaHora = 'Indica fecha y hora';
    else {
      const dia = d.fechaHora.slice(0, 10);
      if (dia < torneo.fechaInicio || dia > torneo.fechaFin) e.fechaHora = 'Debe estar dentro de las fechas del torneo';
    }
    if (String(d.cupo).trim() && !esEnteroPositivo(d.cupo)) e.cupo = 'El cupo debe ser un número mayor que 0';
    return e;
  };

  const { errorGeneral, enviando, campo, onSubmit } = useFormulario({
    inicial: {
      deporteId: prueba?.deporteId ? String(prueba.deporteId) : '',
      nombre: prueba?.nombre ?? '',
      distanciaM: prueba?.distanciaM ? String(prueba.distanciaM) : '',
      // La API entrega 'YYYY-MM-DD HH:mm:ss'; el input datetime-local usa 'YYYY-MM-DDTHH:mm'
      fechaHora: prueba?.fechaHora ? prueba.fechaHora.slice(0, 16).replace(' ', 'T') : `${torneo.fechaInicio}T08:00`,
      cupo: prueba?.cupo ? String(prueba.cupo) : '',
    },
    validar,
    enviar: async (d) => {
      const datos = {
        deporteId: Number(d.deporteId),
        nombre: d.nombre.trim(),
        distanciaM: Number(d.distanciaM),
        fechaHora: d.fechaHora,
        cupo: String(d.cupo).trim() ? Number(d.cupo) : null,
      };
      if (editando) await actualizarPrueba(prueba.id, datos);
      else await crearPrueba(torneo.id, datos);
      onGuardado();
    },
  });

  return (
    <Modal titulo={editando ? 'Editar prueba' : 'Nueva prueba'} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate className={styles.form}>
        {errorGeneral && <Alert tone="error">{errorGeneral}</Alert>}
        <div className={styles.fila}>
          <Input as="select" label="Deporte" required {...campo('deporteId')}>
            <option value="">Selecciona…</option>
            {deportes.map((dep) => (
              <option key={dep.id} value={dep.id}>
                {dep.nombre}
              </option>
            ))}
          </Input>
          <Input label="Nombre" required maxLength={120} hint="Ej.: 1.500 m aguas abiertas" {...campo('nombre')} />
        </div>
        <div className={styles.fila}>
          <Input label="Distancia (m)" type="number" inputMode="numeric" min={1} required {...campo('distanciaM')} />
          <Input
            label="Fecha y hora"
            type="datetime-local"
            min={`${torneo.fechaInicio}T00:00`}
            max={`${torneo.fechaFin}T23:59`}
            required
            {...campo('fechaHora')}
          />
        </div>
        <Input label="Cupo" type="number" inputMode="numeric" min={1} hint="Déjalo vacío si no hay límite" {...campo('cupo')} />
        <div className={styles.acciones}>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={enviando} icon={Save}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
