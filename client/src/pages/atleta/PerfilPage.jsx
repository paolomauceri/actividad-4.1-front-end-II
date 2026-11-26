import { useState } from 'react';
import { Save } from 'lucide-react';
import { actualizarMiPerfil, miPerfil } from '../../api/atletas.js';
import { useApi } from '../../hooks/useApi.js';
import { useFormulario } from '../../hooks/useFormulario.js';
import { PageHeader } from '../../components/panel/PageHeader.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { MENSAJES } from '../../utils/validacion.js';
import { parseFecha } from '../../utils/format.js';
import pages from '../admin/AdminPages.module.css';
import styles from './AtletaPages.module.css';

function validar(d) {
  const e = {};
  for (const c of ['nombre', 'apellido']) {
    if (d[c].trim().length < 2 || d[c].trim().length > 60) e[c] = MENSAJES.nombre;
  }
  if (d.telefono && !/^[0-9+()\-\s]{1,20}$/.test(d.telefono)) e.telefono = MENSAJES.telefono;
  return e;
}

function FormularioPerfil({ atleta }) {
  const [guardado, setGuardado] = useState(false);
  const { errorGeneral, enviando, campo, onSubmit } = useFormulario({
    inicial: { nombre: atleta.nombre, apellido: atleta.apellido, club: atleta.club ?? '', telefono: atleta.telefono ?? '' },
    validar,
    enviar: async (d) => {
      setGuardado(false);
      await actualizarMiPerfil({
        nombre: d.nombre.trim(),
        apellido: d.apellido.trim(),
        club: d.club.trim() || null,
        telefono: d.telefono.trim() || null,
      });
      setGuardado(true);
    },
  });

  const nacimiento = new Intl.DateTimeFormat('es', { dateStyle: 'long' }).format(parseFecha(atleta.fechaNacimiento));

  return (
    <form onSubmit={onSubmit} noValidate className={styles.formPerfil}>
      {guardado && <Alert tone="success" title="Tus datos se guardaron." />}
      {errorGeneral && <Alert tone="error">{errorGeneral}</Alert>}
      <div className={styles.fila}>
        <Input label="Nombre" required {...campo('nombre')} />
        <Input label="Apellido" required {...campo('apellido')} />
      </div>
      <div className={styles.fila}>
        <Input label="Club" {...campo('club')} />
        <Input label="Teléfono" type="tel" {...campo('telefono')} />
      </div>
      <dl className={styles.fijos} aria-label="Datos que no se pueden cambiar">
        <div>
          <dt>Correo</dt>
          <dd>{atleta.email}</dd>
        </div>
        <div>
          <dt>Documento</dt>
          <dd>{atleta.documento}</dd>
        </div>
        <div>
          <dt>Fecha de nacimiento</dt>
          <dd>{nacimiento}</dd>
        </div>
        <div>
          <dt>Sexo</dt>
          <dd>{atleta.sexo === 'F' ? 'Femenino' : 'Masculino'}</dd>
        </div>
      </dl>
      <p className={pages.sub}>
        El documento, la fecha de nacimiento y el sexo definen tu categoría. Si hay un error, pide al organizador que lo corrija.
      </p>
      <div>
        <Button type="submit" loading={enviando} icon={Save}>
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}

/** Perfil del atleta (/atleta/perfil). */
export default function PerfilPage() {
  const { datos, cargando, error } = useApi((signal) => miPerfil(signal), []);

  return (
    <div className={pages.page}>
      <PageHeader antetitulo="Panel del atleta" titulo="Mi perfil" />
      {cargando && <Spinner label="Cargando tu perfil…" />}
      {error && <Alert tone="error" title="No se pudo cargar tu perfil">{error.message}</Alert>}
      {datos && <FormularioPerfil atleta={datos.atleta} />}
    </div>
  );
}
