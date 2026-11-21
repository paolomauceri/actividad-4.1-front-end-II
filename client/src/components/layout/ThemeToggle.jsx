import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import styles from './ThemeToggle.module.css';

const CLAVE = 'podio.theme';

function temaInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado === 'light' || guardado === 'dark') return guardado;
  } catch {
    /* sin almacenamiento */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Cambia entre tema claro y oscuro y recuerda la preferencia. */
export function ThemeToggle() {
  const [tema, setTema] = useState(temaInicial);

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    try {
      localStorage.setItem(CLAVE, tema);
    } catch {
      /* sin almacenamiento */
    }
  }, [tema]);

  const oscuro = tema === 'dark';
  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={() => setTema(oscuro ? 'light' : 'dark')}
      aria-label={oscuro ? 'Activar tema claro' : 'Activar tema oscuro'}
      title={oscuro ? 'Tema claro' : 'Tema oscuro'}
    >
      {oscuro ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </button>
  );
}
