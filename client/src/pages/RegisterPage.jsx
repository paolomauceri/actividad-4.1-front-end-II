import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';
import { AuthShell } from '../components/auth/AuthShell.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { PasswordInput } from '../components/ui/PasswordInput.jsx';
import { validarRegistro } from '../utils/validacion.js';
import styles from './AuthPages.module.css';

const VACIO = {
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  confirmar: '',
  documento: '',
  fechaNacimiento: '',
  sexo: '',
  club: '',
  telefono: '',
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (intento) formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
  }, [intento]);

  const cambiar = (e) => {
    const { name, value } = e.target;
    setDatos((d) => ({ ...d, [name]: value }));
    if (errores[name]) setErrores((er) => ({ ...er, [name]: undefined }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    setErrorGeneral('');
    const nuevos = validarRegistro(datos);
    setErrores(nuevos);
    setIntento((n) => n + 1);
    if (Object.keys(nuevos).length) return;

    setEnviando(true);
    try {
      const { confirmar: _omitir, ...payload } = datos;
      const usuario = await register({
        ...payload,
        nombre: payload.nombre.trim(),
        apellido: payload.apellido.trim(),
        email: payload.email.trim(),
        documento: payload.documento.trim(),
        club: payload.club.trim(),
        telefono: payload.telefono.trim(),
      });
      navigate('/', { replace: true, state: { bienvenida: usuario.nombre } });
    } catch (err) {
      // Los errores del servidor por campo se muestran junto a cada campo
      if (err?.details?.length) {
        const porCampo = Object.fromEntries(err.details.map((d) => [d.campo, d.mensaje]));
        setErrores(porCampo);
        setIntento((n) => n + 1);
      } else {
        setErrorGeneral(err?.message ?? 'No se pudo completar el registro. Intenta de nuevo.');
      }
      setEnviando(false);
    }
  };

  const campo = (name) => ({ name, value: datos[name], onChange: cambiar, error: errores[name] });

  return (
    <AuthShell
      titulo="Inscríbete como atleta"
      subtitulo="Crea tu cuenta para inscribirte en torneos y seguir tus resultados."
      pie={
        <>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </>
      }
    >
      <form ref={formRef} onSubmit={enviar} noValidate className={styles.form}>
        {errorGeneral && <Alert tone="error">{errorGeneral}</Alert>}

        <fieldset className={styles.grupo}>
          <legend className={styles.legend}>Datos personales</legend>
          <div className={styles.fila}>
            <Input label="Nombre" autoComplete="given-name" required {...campo('nombre')} />
            <Input label="Apellido" autoComplete="family-name" required {...campo('apellido')} />
          </div>
          <div className={styles.fila}>
            <Input label="Documento de identidad" required {...campo('documento')} />
            <Input
              label="Fecha de nacimiento"
              type="date"
              autoComplete="bday"
              max={new Date().toISOString().slice(0, 10)}
              required
              {...campo('fechaNacimiento')}
            />
          </div>
          <div className={styles.fila}>
            <Input
              as="select"
              label="Sexo"
              hint="Define tu categoría de competencia"
              required
              {...campo('sexo')}
            >
              <option value="">Selecciona…</option>
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
            </Input>
            <Input label="Club" hint="Opcional" autoComplete="organization" {...campo('club')} />
          </div>
          <Input label="Teléfono" type="tel" hint="Opcional" autoComplete="tel" inputMode="tel" {...campo('telefono')} />
        </fieldset>

        <fieldset className={styles.grupo}>
          <legend className={styles.legend}>Datos de acceso</legend>
          <Input
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            {...campo('email')}
          />
          <div className={styles.fila}>
            <PasswordInput
              label="Contraseña"
              autoComplete="new-password"
              hint="Mínimo 8 caracteres, con letras y números"
              required
              {...campo('password')}
            />
            <PasswordInput label="Confirmar contraseña" autoComplete="new-password" required {...campo('confirmar')} />
          </div>
        </fieldset>

        <Button type="submit" size="lg" variant="accent" fullWidth loading={enviando} icon={UserPlus}>
          Crear mi cuenta
        </Button>
      </form>
    </AuthShell>
  );
}
