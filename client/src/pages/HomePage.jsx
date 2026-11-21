import { useLocation } from 'react-router-dom';
import { Alert } from '../components/ui/Alert.jsx';
import { Hero } from '../components/home/Hero.jsx';
import { SportsGrid } from '../components/home/SportsGrid.jsx';
import { UpcomingTournaments } from '../components/home/UpcomingTournaments.jsx';
import { HowItWorks } from '../components/home/HowItWorks.jsx';

export function HomePage() {
  const location = useLocation();
  const bienvenida = location.state?.bienvenida;

  return (
    <>
      {bienvenida && (
        <div className="container" style={{ paddingTop: 'var(--space-6)' }}>
          <Alert tone="success" title={`¡Listo, ${bienvenida}! Tu cuenta de atleta fue creada.`}>
            Ya puedes revisar los próximos torneos. La inscripción a pruebas estará disponible muy pronto.
          </Alert>
        </div>
      )}
      <Hero />
      <UpcomingTournaments />
      <SportsGrid />
      <HowItWorks />
    </>
  );
}
