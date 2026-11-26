import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, UserPlus } from 'lucide-react';
import { buscarAtletas } from '../../api/atletas.js';
import { useApi } from '../../hooks/useApi.js';
import { PageHeader } from '../../components/panel/PageHeader.jsx';
import { AtletaFormDialog } from '../../components/admin/AtletaFormDialog.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { edadEn } from '../../utils/validacion.js';
import styles from './AdminPages.module.css';

const COLUMNAS = [
  {
    clave: 'nombre',
    titulo: 'Atleta',
    render: (a) => (
      <>
        <Link to={`/admin/atletas/${a.id}`} className={styles.nombre}>
          {a.nombre} {a.apellido}
        </Link>
        <span className={styles.sub}>{a.email}</span>
      </>
    ),
  },
  { clave: 'documento', titulo: 'Documento' },
  { clave: 'club', titulo: 'Club', render: (a) => a.club ?? 'Sin club' },
  {
    clave: 'edad',
    titulo: 'Edad y sexo',
    render: (a) => `${edadEn(a.fechaNacimiento)} años · ${a.sexo === 'F' ? 'Femenino' : 'Masculino'}`,
  },
  {
    clave: 'activo',
    titulo: 'Cuenta',
    render: (a) => <Badge tone={a.activo ? 'success' : 'neutral'}>{a.activo ? 'Activa' : 'Inactiva'}</Badge>,
  },
];

/** Consulta y alta de atletas (/admin/atletas). */
export default function AtletasPage() {
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [creando, setCreando] = useState(false);
  const [aviso, setAviso] = useState('');

  // Espera a que se deje de escribir para no consultar en cada tecla
  useEffect(() => {
    const t = setTimeout(() => setBusqueda(texto.trim()), 300);
    return () => clearTimeout(t);
  }, [texto]);

  const { datos, cargando, error, recargar } = useApi((signal) => buscarAtletas({ q: busqueda }, signal), [busqueda]);

  return (
    <div className={styles.page}>
      <PageHeader
        antetitulo="Panel de administración"
        titulo="Atletas"
        descripcion="Busca atletas por nombre, documento o club y revisa sus inscripciones y resultados."
        acciones={
          <Button icon={UserPlus} onClick={() => setCreando(true)}>
            Registrar atleta
          </Button>
        }
      />

      {aviso && (
        <Alert tone="success" title={aviso} action={<Button variant="ghost" onClick={() => setAviso('')}>Cerrar</Button>} />
      )}

      <div className={styles.filtros}>
        <Input
          type="search"
          label="Buscar atleta"
          placeholder="Nombre, documento o club"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </div>

      {datos && (
        <p role="status" className={styles.sub}>
          {datos.total === 1 ? '1 atleta encontrado' : `${datos.total} atletas encontrados`}
          {datos.total > datos.datos.length && ` (se muestran ${datos.datos.length})`}
        </p>
      )}
      {cargando && <Spinner label="Buscando atletas…" />}
      {error && (
        <Alert
          tone="error"
          title="No se pudo buscar"
          action={<Button variant="secondary" icon={RefreshCw} onClick={recargar}>Reintentar</Button>}
        >
          {error.message}
        </Alert>
      )}
      {datos && (
        <DataTable
          titulo="Atletas"
          columnas={COLUMNAS}
          filas={datos.datos}
          vacio={busqueda ? `Ningún atleta coincide con «${busqueda}».` : 'Todavía no hay atletas registrados.'}
        />
      )}

      {creando && (
        <AtletaFormDialog
          onClose={() => setCreando(false)}
          onCreado={(a) => {
            setCreando(false);
            setAviso(`${a.nombre} ${a.apellido} quedó registrado. Ya puedes inscribirlo en un torneo.`);
            recargar();
          }}
        />
      )}
    </div>
  );
}
