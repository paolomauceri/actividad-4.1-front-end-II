import { useEffect, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { buscarAtletas } from '../../api/atletas.js';
import { inscribir } from '../../api/inscripciones.js';
import { Alert } from '../ui/Alert.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Modal } from '../ui/Modal.jsx';
import styles from './Formulario.module.css';
import listas from './InscribirAtletaDialog.module.css';

/**
 * El ADMIN inscribe a un atleta en una prueba del torneo.
 * La categoría y el dorsal los asigna la API.
 */
export function InscribirAtletaDialog({ torneo, pruebaInicial, onClose, onInscrito }) {
  const [texto, setTexto] = useState('');
  const [resultados, setResultados] = useState([]);
  const [atleta, setAtleta] = useState(null);
  const [pruebaId, setPruebaId] = useState(pruebaInicial ? String(pruebaInicial) : String(torneo.pruebas[0]?.id ?? ''));
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (texto.trim().length < 2) {
      setResultados([]);
      return undefined;
    }
    const controller = new AbortController();
    const t = setTimeout(() => {
      buscarAtletas({ q: texto.trim(), limit: 8 }, controller.signal)
        .then((r) => setResultados(r.datos))
        .catch(() => {});
    }, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [texto]);

  const enviar = async (e) => {
    e.preventDefault();
    if (!atleta) return setError('Busca y selecciona un atleta.');
    setError('');
    setEnviando(true);
    try {
      const { inscripcion } = await inscribir({ pruebaId: Number(pruebaId), atletaId: atleta.id });
      onInscrito(inscripcion);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <Modal titulo="Inscribir atleta" descripcion="La categoría y el dorsal se asignan automáticamente." onClose={onClose}>
      <form onSubmit={enviar} noValidate className={styles.form}>
        {error && <Alert tone="error">{error}</Alert>}
        <Input as="select" label="Prueba" required value={pruebaId} onChange={(e) => setPruebaId(e.target.value)}>
          {torneo.pruebas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </Input>

        {atleta ? (
          <div className={listas.elegido}>
            <span>
              <strong>
                {atleta.nombre} {atleta.apellido}
              </strong>{' '}
              · {atleta.documento}
            </span>
            <Button variant="ghost" onClick={() => setAtleta(null)}>
              Cambiar
            </Button>
          </div>
        ) : (
          <>
            <Input
              type="search"
              label="Atleta"
              placeholder="Escribe nombre, documento o club"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              autoComplete="off"
            />
            {resultados.length > 0 && (
              <ul className={listas.resultados} aria-label="Atletas encontrados">
                {resultados.map((a) => (
                  <li key={a.id}>
                    <button type="button" onClick={() => setAtleta(a)}>
                      <strong>
                        {a.nombre} {a.apellido}
                      </strong>
                      <span>
                        {a.documento} · {a.club ?? 'Sin club'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <div className={styles.acciones}>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={enviando} icon={ClipboardCheck} disabled={!atleta || !pruebaId}>
            Inscribir
          </Button>
        </div>
      </form>
    </Modal>
  );
}
