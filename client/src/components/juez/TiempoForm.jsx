import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { parseTiempo } from '../../utils/tiempo.js';
import { formatTiempo } from '../../utils/format.js';
import { ESTADO_RESULTADO } from '../../utils/estados.js';
import styles from './Juez.module.css';

export const MENSAJE_TIEMPO = 'Escribe el tiempo como mm:ss.cc (ej. 12:34.56)';
const ESPECIALES = ['DNF', 'DNS', 'DSQ'];

/**
 * Formulario del juez para un atleta: tiempo final o DNF/DNS/DSQ, con observaciones.
 * @param {{ onGuardar: (datos: { estado: string, tiempoMs?: number, observaciones?: string }) => void,
 *           inicial?: { estado: string, tiempoMs: number|null, observaciones?: string|null } | null,
 *           enviando?: boolean }} props
 */
export function TiempoForm({ onGuardar, inicial = null, enviando = false }) {
  const [texto, setTexto] = useState(inicial?.estado === 'FINALIZADO' ? formatTiempo(inicial.tiempoMs) : '');
  const [observaciones, setObservaciones] = useState(inicial?.observaciones ?? '');
  const [error, setError] = useState(null);

  const conObservaciones = (datos) => {
    const obs = observaciones.trim();
    return obs ? { ...datos, observaciones: obs } : datos;
  };

  const guardarTiempo = (e) => {
    e.preventDefault();
    const tiempoMs = parseTiempo(texto);
    if (tiempoMs === null) {
      setError(MENSAJE_TIEMPO);
      return;
    }
    setError(null);
    onGuardar(conObservaciones({ estado: 'FINALIZADO', tiempoMs }));
  };

  const marcar = (estado) => {
    setError(null);
    onGuardar(conObservaciones({ estado }));
  };

  return (
    <form onSubmit={guardarTiempo} noValidate className={styles.form}>
      <div className={styles.filaTiempo}>
        <Input
          label="Tiempo"
          hint="mm:ss.cc — o h:mm:ss.cc en pruebas largas"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          error={error}
          autoComplete="off"
          spellCheck={false}
          placeholder="12:34.56"
          className={styles.campoGrande}
        />
        <Button type="submit" size="lg" icon={Save} loading={enviando}>
          Guardar tiempo
        </Button>
      </div>

      <fieldset className={styles.especiales} disabled={enviando}>
        <legend>Si no completó la prueba</legend>
        {ESPECIALES.map((estado) => (
          <Button key={estado} variant={estado === 'DSQ' ? 'danger' : 'secondary'} onClick={() => marcar(estado)}>
            {ESTADO_RESULTADO[estado].texto}
          </Button>
        ))}
      </fieldset>

      <Input
        label="Observaciones (opcional)"
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
        maxLength={255}
        placeholder="Ej.: salida en falso, corrección de cronometraje"
      />
    </form>
  );
}
