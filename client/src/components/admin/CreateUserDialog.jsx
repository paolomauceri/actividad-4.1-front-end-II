import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { apiFetch } from '../../api/client.js';
import { Alert } from '../ui/Alert.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Modal } from '../ui/Modal.jsx';
import { PasswordInput } from '../ui/PasswordInput.jsx';
import { MENSAJES, esEmail, esPasswordValida } from '../../utils/validacion.js';
import styles from './CreateUserDialog.module.css';

const VACIO = { nombre: '', apellido: '', email: '', password: '', rol: 'JUEZ' };

function validar(d) {
  const e = {};
  for (const campo of ['nombre', 'apellido']) {
    if (!d[campo].trim()) e[campo] = MENSAJES.requerido;
    else if (d[campo].trim().length < 2 || d[campo].trim().length > 60) e[campo] = MENSAJES.nombre;
  }
  if (!d.email.trim()) e.email = MENSAJES.requerido;
  else if (!esEmail(d.email)) e.email = MENSAJES.email;
  if (!d.password) e.password = MENSAJES.requerido;
  else if (!esPasswordValida(d.password)) e.password = MENSAJES.password;
  return e;
}

/** Formulario modal para que el administrador cree jueces o administradores. */
export function CreateUserDialog({ onClose, onCreated }) {
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => {
    const { name, value } = e.target;
    setDatos((d) => ({ ...d, [name]: value }));
    if (errores[name]) setErrores((er) => ({ ...er, [name]: undefined }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    setErrorGeneral('');
    const nuevos = validar(datos);
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;

    setEnviando(true);
    try {
      const { usuario } = await apiFetch('/api/usuarios', {
        method: 'POST',
        body: {
          nombre: datos.nombre.trim(),
          apellido: datos.apellido.trim(),
          email: datos.email.trim(),
          password: datos.password,
          rol: datos.rol,
        },
      });
      onCreated(usuario);
    } catch (err) {
      if (err?.details?.length) {
        setErrores(Object.fromEntries(err.details.map((d) => [d.campo, d.mensaje])));
      } else {
        setErrorGeneral(err?.message ?? 'No se pudo crear el usuario.');
      }
      setEnviando(false);
    }
  };

  const campo = (name) => ({ name, value: datos[name], onChange: cambiar, error: errores[name] });

  return (
    <Modal
      titulo="Nuevo usuario"
      descripcion="Crea cuentas para jueces o administradores. Los atletas se registran por su cuenta."
      onClose={onClose}
    >
      <form onSubmit={enviar} noValidate className={styles.form}>
        {errorGeneral && <Alert tone="error">{errorGeneral}</Alert>}
        <div className={styles.fila}>
          <Input label="Nombre" autoComplete="off" required {...campo('nombre')} />
          <Input label="Apellido" autoComplete="off" required {...campo('apellido')} />
        </div>
        <Input label="Correo electrónico" type="email" autoComplete="off" required {...campo('email')} />
        <div className={styles.fila}>
          <PasswordInput
            label="Contraseña"
            autoComplete="new-password"
            hint="Mínimo 8 caracteres, con letras y números"
            required
            {...campo('password')}
          />
          <Input as="select" label="Rol" required {...campo('rol')}>
            <option value="JUEZ">Juez</option>
            <option value="ADMIN">Administrador</option>
          </Input>
        </div>
        <div className={styles.acciones}>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={enviando} icon={UserPlus}>
            Crear usuario
          </Button>
        </div>
      </form>
    </Modal>
  );
}
