import { Save } from 'lucide-react';
import { actualizarCategoria, crearCategoria } from '../../api/torneos.js';
import { useFormulario } from '../../hooks/useFormulario.js';
import { Alert } from '../ui/Alert.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Modal } from '../ui/Modal.jsx';
import styles from './Formulario.module.css';

const esEdad = (v) => /^\d{1,3}$/.test(String(v).trim()) && Number(v) <= 120;

function validar(d) {
  const e = {};
  if (d.nombre.trim().length < 2) e.nombre = 'Escribe un nombre de al menos 2 caracteres';
  if (!esEdad(d.edadMin)) e.edadMin = 'Edad entre 0 y 120';
  if (!esEdad(d.edadMax)) e.edadMax = 'Edad entre 0 y 120';
  else if (esEdad(d.edadMin) && Number(d.edadMax) < Number(d.edadMin)) e.edadMax = 'No puede ser menor que la edad mínima';
  return e;
}

/**
 * Crear o editar una categoría (grupo por edad y sexo) del torneo.
 * Si la categoría ya tiene inscritos, la API solo permite cambiar el nombre.
 */
export function CategoriaFormDialog({ torneo, categoria, onClose, onGuardado }) {
  const editando = Boolean(categoria);
  const conInscritos = (categoria?.inscritos ?? 0) > 0;

  const { errorGeneral, enviando, campo, onSubmit } = useFormulario({
    inicial: {
      nombre: categoria?.nombre ?? '',
      sexo: categoria?.sexo ?? 'F',
      edadMin: categoria ? String(categoria.edadMin) : '',
      edadMax: categoria ? String(categoria.edadMax) : '',
    },
    validar,
    enviar: async (d) => {
      const datos = { nombre: d.nombre.trim(), sexo: d.sexo, edadMin: Number(d.edadMin), edadMax: Number(d.edadMax) };
      if (editando) await actualizarCategoria(categoria.id, datos);
      else await crearCategoria(torneo.id, datos);
      onGuardado();
    },
  });

  return (
    <Modal
      titulo={editando ? 'Editar categoría' : 'Nueva categoría'}
      descripcion="Cada atleta queda en la categoría que corresponde a su edad al inicio del torneo y a su sexo."
      onClose={onClose}
    >
      <form onSubmit={onSubmit} noValidate className={styles.form}>
        {errorGeneral && <Alert tone="error">{errorGeneral}</Alert>}
        {conInscritos && (
          <Alert tone="info">Esta categoría ya tiene inscritos: solo puedes cambiar su nombre.</Alert>
        )}
        <div className={styles.fila}>
          <Input label="Nombre" required maxLength={60} hint="Ej.: Juvenil Femenino" {...campo('nombre')} />
          <Input as="select" label="Sexo" required disabled={conInscritos} {...campo('sexo')}>
            <option value="F">Femenino</option>
            <option value="M">Masculino</option>
            <option value="MIXTO">Mixto</option>
          </Input>
        </div>
        <div className={styles.fila}>
          <Input label="Edad mínima" type="number" inputMode="numeric" min={0} max={120} required disabled={conInscritos} {...campo('edadMin')} />
          <Input label="Edad máxima" type="number" inputMode="numeric" min={0} max={120} required disabled={conInscritos} {...campo('edadMax')} />
        </div>
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
