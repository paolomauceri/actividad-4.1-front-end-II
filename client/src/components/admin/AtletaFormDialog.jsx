import { UserPlus } from 'lucide-react';
import { crearAtleta } from '../../api/atletas.js';
import { useFormulario } from '../../hooks/useFormulario.js';
import { validarRegistro } from '../../utils/validacion.js';
import { Alert } from '../ui/Alert.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Modal } from '../ui/Modal.jsx';
import { PasswordInput } from '../ui/PasswordInput.jsx';
import styles from './Formulario.module.css';

const VACIO = {
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  documento: '',
  fechaNacimiento: '',
  sexo: '',
  club: '',
  telefono: '',
};

/** El administrador registra un atleta (por ejemplo, alguien que se inscribe en la mesa del torneo). */
export function AtletaFormDialog({ onClose, onCreado }) {
  const { errorGeneral, enviando, campo, onSubmit } = useFormulario({
    inicial: VACIO,
    // Mismas reglas que el registro público; aquí no hay campo "confirmar contraseña"
    validar: (d) => validarRegistro({ ...d, confirmar: d.password }),
    enviar: async (d) => {
      const { atleta } = await crearAtleta({
        nombre: d.nombre.trim(),
        apellido: d.apellido.trim(),
        email: d.email.trim(),
        password: d.password,
        documento: d.documento.trim(),
        fechaNacimiento: d.fechaNacimiento,
        sexo: d.sexo,
        club: d.club.trim() || undefined,
        telefono: d.telefono.trim() || undefined,
      });
      onCreado(atleta);
    },
  });

  return (
    <Modal
      titulo="Registrar atleta"
      descripcion="El atleta podrá entrar con este correo y la contraseña inicial que definas."
      onClose={onClose}
    >
      <form onSubmit={onSubmit} noValidate className={styles.form}>
        {errorGeneral && <Alert tone="error">{errorGeneral}</Alert>}
        <div className={styles.fila}>
          <Input label="Nombre" required autoComplete="off" {...campo('nombre')} />
          <Input label="Apellido" required autoComplete="off" {...campo('apellido')} />
        </div>
        <div className={styles.fila}>
          <Input label="Documento" required autoComplete="off" {...campo('documento')} />
          <Input label="Fecha de nacimiento" type="date" required {...campo('fechaNacimiento')} />
        </div>
        <div className={styles.fila}>
          <Input as="select" label="Sexo" required {...campo('sexo')}>
            <option value="">Selecciona…</option>
            <option value="F">Femenino</option>
            <option value="M">Masculino</option>
          </Input>
          <Input label="Club" autoComplete="off" {...campo('club')} />
        </div>
        <div className={styles.fila}>
          <Input label="Correo electrónico" type="email" required autoComplete="off" {...campo('email')} />
          <Input label="Teléfono" type="tel" autoComplete="off" {...campo('telefono')} />
        </div>
        <PasswordInput
          label="Contraseña inicial"
          required
          autoComplete="new-password"
          hint="Mínimo 8 caracteres, con letras y números"
          {...campo('password')}
        />
        <div className={styles.acciones}>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={enviando} icon={UserPlus}>
            Registrar atleta
          </Button>
        </div>
      </form>
    </Modal>
  );
}
