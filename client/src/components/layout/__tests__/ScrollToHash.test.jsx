import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { ScrollToHash } from '../ScrollToHash.jsx';

let desplazados;

beforeEach(() => {
  desplazados = [];
  // jsdom no implementa scroll: registramos a qué elemento se pidió desplazar
  Element.prototype.scrollIntoView = jest.fn(function registrar() {
    desplazados.push(this.id);
  });
});

afterEach(() => {
  delete Element.prototype.scrollIntoView;
});

function App() {
  return (
    <>
      <ScrollToHash />
      <nav>
        <Link to="/#torneos">Torneos</Link>
        <Link to="/#como-funciona">Cómo funciona</Link>
      </nav>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <section id="torneos">Próximos torneos</section>
              <section id="como-funciona">Cómo funciona</section>
            </>
          }
        />
        <Route path="/login" element={<p>Login</p>} />
      </Routes>
    </>
  );
}

describe('ScrollToHash', () => {
  it('desplaza a la sección del #ancla al hacer clic en un enlace del menú', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);

    await user.click(screen.getByRole('link', { name: 'Torneos' }));
    expect(desplazados).toContain('torneos');

    await user.click(screen.getByRole('link', { name: 'Cómo funciona' }));
    expect(desplazados.at(-1)).toBe('como-funciona');
  });

  it('vuelve a desplazar si se hace clic dos veces en el mismo enlace', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);

    await user.click(screen.getByRole('link', { name: 'Torneos' }));
    await user.click(screen.getByRole('link', { name: 'Torneos' }));

    expect(desplazados.filter((id) => id === 'torneos')).toHaveLength(2);
  });

  it('desplaza a la sección al llegar desde otra página', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/login']}><App /></MemoryRouter>);

    await user.click(screen.getByRole('link', { name: 'Torneos' }));

    expect(desplazados).toContain('torneos');
  });

  it('no hace nada si la URL no tiene #ancla', () => {
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);

    expect(desplazados).toHaveLength(0);
  });
});
