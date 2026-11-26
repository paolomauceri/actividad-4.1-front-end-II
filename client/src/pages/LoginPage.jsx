import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';
import { AuthShell } from '../components/auth/AuthShell.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { PasswordInput } from '../components/ui/PasswordInput.jsx';
import styles from './AuthPages.module.css';
import { destinoPorRol } from '../auth/destinos.js';

function mensajeDeError(err) {
  if (err?.code === 'INVALID_CREDENTIALS') return 'Correo o contraseña incorrectos';
  return err?.message ?? 'No se pudo iniciar sesión. Intenta de nuevo.';
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);

  const [datos, setDatos] = useState({ email: '', password: '' });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [intento, setIntento] = useState(0);

  // Lleva el foco al primer campo con error tras cada intento
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
    const nuevos = {};
    if (!datos.email.trim()) nuevos.email = 'Ingresa tu correo electrónico';
    if (!datos.password) nuevos.password = 'Ingresa tu contraseña';
    setErrores(nuevos);
    setIntento((n) => n + 1);
    if (Object.keys(nuevos).length) return;

    setEnviando(true);
    try {
      const usuario = await login(datos.email.trim(), datos.password);
      const desde = location.state?.from?.pathname;
      const destino = desde && desde !== '/login' ? desde : destinoPorRol(usuario.rol);
      navigate(destino, { replace: true });
    } catch (err) {
      setErrorGeneral(mensajeDeError(err));
      setEnviando(false);
    }
  };

  return (
    <AuthShell
      titulo="Iniciar sesión"
      subtitulo="Accede para inscribirte, registrar tiempos o administrar torneos."
      pie={
        <>
          ¿Aún no tienes cuenta? <Link to="/registro">Inscríbete como atleta</Link>
        </>
      }
    >
      <form ref={formRef} onSubmit={enviar} noValidate className={styles.form}>
        {errorGeneral && <Alert tone="error">{errorGeneral}</Alert>}

        <Input
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={datos.email}
          onChange={cambiar}
          error={errores.email}
          required
        />
        <PasswordInput
          label="Contraseña"
          name="password"
          autoComplete="current-password"
          value={datos.password}
          onChange={cambiar}
          error={errores.password}
          required
        />

        <Button type="submit" size="lg" fullWidth loading={enviando} icon={LogIn}>
          Iniciar sesión
        </Button>

        {/* App de demostración: las cuentas de prueba se muestran siempre */}
        <div className={styles.demo}>
          <p className={styles.demoTitulo}>Cuentas de prueba</p>
          <p>
            Administrador: <code>admin@podio.local</code> / <code>Admin123!</code>
          </p>
          <p>
            Juez: <code>juez@podio.local</code> / <code>Juez123!</code>
          </p>
          <p>
            Atleta: <code>valentina@podio.local</code> / <code>Atleta123!</code>
          </p>
        </div>
      </form>
    </AuthShell>
  );
}
