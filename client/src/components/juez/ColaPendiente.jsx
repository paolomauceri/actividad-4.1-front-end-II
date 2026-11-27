import { useLocation } from 'react-router-dom';
import { CloudUpload, LogIn } from 'lucide-react';
import { Alert } from '../ui/Alert.jsx';
import { Button } from '../ui/Button.jsx';
import { ESTADO_RESULTADO } from '../../utils/estados.js';
import { formatTiempo } from '../../utils/format.js';
import styles from './Juez.module.css';

const texto = (i) => (i.estado === 'FINALIZADO' ? formatTiempo(i.tiempoMs) : ESTADO_RESULTADO[i.estado]?.texto);

/**
 * Tiempos guardados sin conexión: los pendientes de envío y los que el servidor rechazó.
 * @param {{ pendientes: object[], rechazados: object[], requiereLogin: boolean, sincronizando: boolean,
 *           onEnviar: () => void, onCorregir: (item: object) => void, onDescartar: (inscripcionId: number) => void }} props
 */
export function ColaPendiente({ pendientes, rechazados, requiereLogin, sincronizando, onEnviar, onCorregir, onDescartar }) {
  const location = useLocation();
  if (!pendientes.length && !rechazados.length) return null;

  return (
    <section className={`${styles.tarjeta} ${styles.cola}`} aria-labelledby="cola-titulo">
      {pendientes.length > 0 && (
        <>
          <div className={styles.encabezadoTorneo}>
            <h2 id="cola-titulo">
              {pendientes.length} {pendientes.length === 1 ? 'pendiente' : 'pendientes'} de envío
            </h2>
            <Button variant="secondary" icon={CloudUpload} onClick={onEnviar} loading={sincronizando}>
              Enviar ahora
            </Button>
          </div>
          <p className={styles.vacio}>
            Están guardados en este dispositivo y se envían solos cuando vuelve la conexión. No cierres sesión.
          </p>
          {requiereLogin && (
            <Alert
              tone="warning"
              title="Tu sesión venció"
              action={
                <Button to="/login" state={{ from: location }} icon={LogIn}>
                  Iniciar sesión
                </Button>
              }
            >
              Inicia sesión para enviar los tiempos guardados. No se perdieron.
            </Alert>
          )}
          <ul className={styles.top}>
            {pendientes.map((i) => (
              <li key={i.inscripcionId}>
                <span className={styles.posicion}>{i.dorsal}</span>
                <span className={styles.nombre}>{i.atleta}</span>
                <span className={styles.tiempo}>{texto(i)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {rechazados.length > 0 && (
        <>
          <h2 id={pendientes.length ? undefined : 'cola-titulo'}>No se pudieron guardar</h2>
          <ul className={styles.rechazados}>
            {rechazados.map((i) => (
              <li key={i.inscripcionId}>
                <div>
                  <strong>
                    {i.dorsal} · {i.atleta} · {texto(i)}
                  </strong>
                  <span className={styles.motivo}>{i.motivo}</span>
                </div>
                <div className={styles.botonesRechazo}>
                  <Button variant="secondary" onClick={() => onCorregir(i)} aria-label={`Corregir el resultado de ${i.atleta}`}>
                    Corregir
                  </Button>
                  <Button variant="ghost" onClick={() => onDescartar(i.inscripcionId)} aria-label={`Descartar el resultado de ${i.atleta}`}>
                    Descartar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
