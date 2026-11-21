import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './Input.jsx';
import styles from './PasswordInput.module.css';

/** Campo de contraseña con botón para mostrar u ocultar el texto. */
export function PasswordInput(props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={styles.wrap}>
      <Input type={visible ? 'text' : 'password'} {...props} />
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
      >
        {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </button>
    </div>
  );
}
