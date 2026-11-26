import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { eliminarCategoria } from '../../api/torneos.js';
import { Button } from '../ui/Button.jsx';
import { ConfirmDialog } from '../ui/ConfirmDialog.jsx';
import { DataTable } from '../ui/DataTable.jsx';
import { SEXO_CATEGORIA } from '../../utils/estados.js';
import { CategoriaFormDialog } from './CategoriaFormDialog.jsx';
import styles from '../../pages/admin/AdminPages.module.css';

/**
 * Pestaña "Categorías" del detalle de torneo.
 * @param {{ torneo: object, onCambio: () => void, onError: (mensaje: string) => void }} props
 */
export function CategoriasTab({ torneo, onCambio, onError }) {
  const [editando, setEditando] = useState(null); // null | 'nueva' | categoría
  const [borrando, setBorrando] = useState(null);

  const columnas = [
    { clave: 'nombre', titulo: 'Categoría', render: (c) => <span className={styles.nombre}>{c.nombre}</span> },
    { clave: 'sexo', titulo: 'Sexo', render: (c) => SEXO_CATEGORIA[c.sexo] ?? c.sexo },
    { clave: 'edades', titulo: 'Edades', render: (c) => `${c.edadMin} a ${c.edadMax} años` },
    { clave: 'inscritos', titulo: 'Inscritos' },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      render: (c) => (
        <span className={styles.acciones}>
          <Button variant="ghost" icon={Pencil} onClick={() => setEditando(c)} aria-label={`Editar ${c.nombre}`}>
            Editar
          </Button>
          <Button variant="ghost" icon={Trash2} onClick={() => setBorrando(c)} aria-label={`Eliminar ${c.nombre}`}>
            Eliminar
          </Button>
        </span>
      ),
    },
  ];

  return (
    <>
      <div className={styles.barra}>
        <p>La categoría de cada atleta se asigna sola según su edad al inicio del torneo y su sexo.</p>
        <Button icon={Plus} onClick={() => setEditando('nueva')}>
          Nueva categoría
        </Button>
      </div>
      <DataTable
        titulo="Categorías"
        columnas={columnas}
        filas={torneo.categorias}
        vacio="Este torneo todavía no tiene categorías. Sin categorías nadie puede inscribirse."
      />

      {editando && (
        <CategoriaFormDialog
          torneo={torneo}
          categoria={editando === 'nueva' ? undefined : editando}
          onClose={() => setEditando(null)}
          onGuardado={() => {
            setEditando(null);
            onCambio();
          }}
        />
      )}
      {borrando && (
        <ConfirmDialog
          titulo="Eliminar categoría"
          mensaje={`¿Eliminar «${borrando.nombre}»? Solo se puede si no tiene inscritos.`}
          confirmar="Eliminar"
          peligro
          onCancelar={() => setBorrando(null)}
          onConfirmar={async () => {
            const categoria = borrando;
            setBorrando(null);
            try {
              await eliminarCategoria(categoria.id);
              onCambio();
            } catch (err) {
              onError(err.message);
            }
          }}
        />
      )}
    </>
  );
}
