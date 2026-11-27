import { act, render, screen } from '@testing-library/react';
import { OfflineBanner } from '../OfflineBanner.jsx';

const MENSAJE = /sin conexión — mostrando los últimos datos guardados/i;

function fijarOnLine(valor) {
  Object.defineProperty(window.navigator, 'onLine', { configurable: true, get: () => valor });
}

afterEach(() => fijarOnLine(true));

describe('OfflineBanner', () => {
  it('no muestra nada con conexión', () => {
    fijarOnLine(true);
    render(<OfflineBanner />);
    expect(screen.queryByText(MENSAJE)).not.toBeInTheDocument();
  });

  it('aparece al perder la conexión y se oculta al recuperarla', () => {
    fijarOnLine(true);
    render(<OfflineBanner />);

    fijarOnLine(false);
    act(() => window.dispatchEvent(new Event('offline')));
    expect(screen.getByRole('status')).toHaveTextContent(MENSAJE);

    fijarOnLine(true);
    act(() => window.dispatchEvent(new Event('online')));
    expect(screen.queryByText(MENSAJE)).not.toBeInTheDocument();
  });

  it('se muestra de entrada si la app abre sin conexión', () => {
    fijarOnLine(false);
    render(<OfflineBanner />);
    expect(screen.getByText(MENSAJE)).toBeInTheDocument();
  });
});
