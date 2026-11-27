import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';
import { ScrollToHash } from './ScrollToHash.jsx';
import { OfflineBanner } from './OfflineBanner.jsx';

/** Estructura de las páginas públicas: barra superior, contenido y pie. */
export function PublicLayout() {
  return (
    <>
      <ScrollToHash />
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <OfflineBanner />
      <Navbar />
      <main id="contenido" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
