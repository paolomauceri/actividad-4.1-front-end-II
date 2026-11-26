import { useState } from 'react';
import { RefreshCw, UserPlus } from 'lucide-react';
import { cambiarActivo, listarUsuarios } from '../../api/atletas.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useApi } from '../../hooks/useApi.js';
import { PageHeader } from '../../components/panel/PageHeader.jsx';
import { CreateUserDialog } from '../../components/admin/CreateUserDialog.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { formatFechaHora } from '../../utils/format.js';
import styles from './AdminPages.module.css';

const ROLES = { ADMIN: 'Administrador', JUEZ: 'Juez', ATLETA: 'Atleta' };

/** Cuentas del sistema: crear jueces y administradores, activar o desactivar (/admin/usuarios). */
export default function UsuariosPage() {
  const { usuario: yo } = useAuth();
  const [rol, setRol] = useState('');
  const [creando, setCreando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [ocupado, setOcupado] = useState(null);
  const { datos, cargando, error, recargar, setDatos } = useApi((signal) => listarUsuarios({ rol }, signal), [rol]);

  const alternar = async (u) => {
    setOcupado(u.id);
    setMensaje(null);
    try {
      const { usuario } = await cambiarActivo(u.id, !u.activo);
      setDatos({ ...datos, data: datos.data.map((x) => (x.id === usuario.id ? usuario : x)) });
    } catch (err) {
      setMensaje({ tono: 'error', texto: err.message });
    } finally {
      setOcupado(null);
    }
  };

  const columnas = [
    {
      clave: 'nombre',
      titulo: 'Usuario',
      render: (u) => (
        <>
          <span className={styles.nombre}>
            {u.nombre} {u.apellido}
          </span>
          <span className={styles.sub}>{u.email}</span>
        </>
      ),
    },
    { clave: 'rol', titulo: 'Rol', render: (u) => ROLES[u.rol] ?? u.rol },
    { clave: 'alta', titulo: 'Alta', render: (u) => formatFechaHora(u.creadoEn) },
    {
      clave: 'activo',
      titulo: 'Estado',
      render: (u) => <Badge tone={u.activo ? 'success' : 'neutral'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge>,
    },
    {
      clave: 'accion',
      titulo: 'Acción',
      render: (u) =>
        u.id === yo?.id ? (
          <span className={styles.sub}>Tu cuenta</span>
        ) : (
          <Button
            variant={u.activo ? 'ghost' : 'secondary'}
            loading={ocupado === u.id}
            onClick={() => alternar(u)}
            aria-label={`${u.activo ? 'Desactivar' : 'Activar'} a ${u.nombre} ${u.apellido}`}
          >
            {u.activo ? 'Desactivar' : 'Activar'}
          </Button>
        ),
    },
  ];

  return (
    <div className={styles.page}>
      <PageHeader
        antetitulo="Panel de administración"
        titulo="Usuarios"
        descripcion="Una cuenta desactivada no puede iniciar sesión hasta que la vuelvas a activar."
        acciones={
          <Button icon={UserPlus} onClick={() => setCreando(true)}>
            Crear juez o administrador
          </Button>
        }
      />

      {mensaje && (
        <Alert tone={mensaje.tono} title={mensaje.texto} action={<Button variant="ghost" onClick={() => setMensaje(null)}>Cerrar</Button>} />
      )}

      <div className={styles.filtros}>
        <Input as="select" label="Rol" value={rol} onChange={(e) => setRol(e.target.value)}>
          <option value="">Todos</option>
          {Object.entries(ROLES).map(([valor, texto]) => (
            <option key={valor} value={valor}>
              {texto}
            </option>
          ))}
        </Input>
      </div>

      {cargando && <Spinner label="Cargando usuarios…" />}
      {error && (
        <Alert
          tone="error"
          title="No se pudieron cargar los usuarios"
          action={<Button variant="secondary" icon={RefreshCw} onClick={recargar}>Reintentar</Button>}
        >
          {error.message}
        </Alert>
      )}
      {datos && <DataTable titulo="Usuarios" columnas={columnas} filas={datos.data} vacio="No hay usuarios con ese rol." />}

      {creando && (
        <CreateUserDialog
          onClose={() => setCreando(false)}
          onCreated={(u) => {
            setCreando(false);
            setMensaje({ tono: 'success', texto: `${u.nombre} ${u.apellido} fue creado como ${ROLES[u.rol].toLowerCase()}.` });
            recargar();
          }}
        />
      )}
    </div>
  );
}
