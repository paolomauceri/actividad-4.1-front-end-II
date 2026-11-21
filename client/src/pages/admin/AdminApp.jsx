// Versión inicial: el panel de administración se construye en la Parte 7.
import { Link } from 'react-router-dom';

export default function AdminApp() {
  return (
    <main className="container" style={{ paddingBlock: 'var(--space-16)' }}>
      <h1>Panel de administración</h1>
      <Link to="/">Volver al inicio</Link>
    </main>
  );
}
