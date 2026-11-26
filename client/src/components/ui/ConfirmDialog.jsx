import { Button } from './Button.jsx';
import { Modal } from './Modal.jsx';
import styles from './ConfirmDialog.module.css';

/**
 * Pide confirmación antes de una acción que no se puede deshacer.
 * @param {{ titulo: string, mensaje: import('react').ReactNode, confirmar?: string,
 *           peligro?: boolean, ocupado?: boolean, onConfirmar: () => void, onCancelar: () => void }} props
 */
export function ConfirmDialog({ titulo, mensaje, confirmar = 'Confirmar', peligro = false, ocupado = false, onConfirmar, onCancelar }) {
  return (
    <Modal titulo={titulo} onClose={onCancelar}>
      <p className={styles.mensaje}>{mensaje}</p>
      <div className={styles.acciones}>
        <Button variant="ghost" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button variant={peligro ? 'danger' : 'primary'} loading={ocupado} onClick={onConfirmar}>
          {confirmar}
        </Button>
      </div>
    </Modal>
  );
}
