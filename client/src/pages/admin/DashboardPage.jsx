import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, UserPlus } from 'lucide-react';
import { apiFetch } from '../../api/client.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { StatCards } from '../../components/admin/StatCards.jsx';
import { UpcomingEventsTable } from '../../components/admin/UpcomingEventsTable.jsx';
import { SportsChart } from '../../components/admin/SportsChart.jsx';
import { RecentUsers } from '../../components/admin/RecentUsers.jsx';
import { CreateUserDialog } from '../../components/admin/CreateUserDialog.jsx';
import styles from './DashboardPage.module.css';

const ROL_LEGIBLE = { JUEZ: 'juez', ADMIN: 'administrador' };

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [estado, setEstado] = useState({ cargando: true, error: null, resumen: null });
  const [dialogo, setDialogo] = useState(false);
  const [aviso, setAviso] = useState('');

  const cargar = useCallback((signal) => {
    setEstado((s) => ({ ...s, cargando: !s.resumen, error: null }));
    apiFetch('/api/dashboard/resumen', { signal })
      .then((resumen) => setEstado({ cargando: false, error: null, resumen }))
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setEstado({ cargando: false, error: err, resumen: null });
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    cargar(controller.signal);
    return () => controller.abort();
  }, [cargar]);

  const cerrarDialogo = useCallback(() => setDialogo(false), []);

  const alCrear = (nuevo) => {
    setDialogo(false);
    setAviso(`${nuevo.nombre} ${nuevo.apellido} fue creado como ${ROL_LEGIBLE[nuevo.rol] ?? nuevo.rol.toLowerCase()}.`);
    cargar();
  };

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Panel de administración</p>
          <h1 className={styles.title}>Hola, {usuario?.nombre ?? 'administrador'}</h1>
          <p className={styles.sub}>Así van tus torneos hoy.</p>
        </div>
        <Button icon={UserPlus} onClick={() => setDialogo(true)}>
          Crear juez o administrador
        </Button>
      </header>

      {aviso && (
        <Alert
          tone="success"
          title={aviso}
          action={
            <Button variant="ghost" onClick={() => setAviso('')}>
              Cerrar
            </Button>
          }
        />
      )}

      {estado.cargando && <Spinner label="Cargando resumen…" />}

      {estado.error && (
        <Alert
          tone="error"
          title="No se pudo cargar el resumen"
          action={
            <Button variant="secondary" icon={RefreshCw} onClick={() => cargar()}>
              Reintentar
            </Button>
          }
        >
          {estado.error.message}
        </Alert>
      )}

      {estado.resumen && (
        <>
          <StatCards resumen={estado.resumen} />
          <div className={styles.grid}>
            <div className={styles.wide}>
              <UpcomingEventsTable pruebas={estado.resumen.proximasPruebas} />
            </div>
            <SportsChart datos={estado.resumen.inscripcionesPorDeporte} />
            <RecentUsers usuarios={estado.resumen.usuariosRecientes} />
          </div>
        </>
      )}

      {dialogo && <CreateUserDialog onClose={cerrarDialogo} onCreated={alCrear} />}
    </div>
  );
}
