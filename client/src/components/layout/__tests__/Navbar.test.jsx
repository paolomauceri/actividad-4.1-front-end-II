import { screen, within } from '@testing-library/react';
import { Navbar } from '../Navbar.jsx';
import { renderConAuth } from '../../../test/renderConAuth.jsx';

const nav = () => within(screen.getByRole('navigation', { name: 'Principal' }));

describe('Navbar', () => {
  it('enlaza a la lista pública de torneos', () => {
    renderConAuth(<Navbar />);

    expect(nav().getByRole('link', { name: 'Torneos' })).toHaveAttribute('href', '/torneos');
  });

  it('sin sesión ofrece iniciar sesión e inscribirse', () => {
    renderConAuth(<Navbar />);

    expect(nav().getByRole('link', { name: /iniciar sesión/i })).toHaveAttribute('href', '/login');
    expect(nav().queryByRole('link', { name: /mi panel/i })).not.toBeInTheDocument();
  });

  it.each([
    ['JUEZ', '/juez'],
    ['ATLETA', '/atleta'],
    ['ADMIN', '/admin'],
  ])('con sesión de %s el botón "Mi panel" lleva a %s', (rol, destino) => {
    renderConAuth(<Navbar />, { auth: { usuario: { id: 1, nombre: 'Ana', apellido: 'Pérez', rol } } });

    expect(nav().getByRole('link', { name: /mi panel/i })).toHaveAttribute('href', destino);
  });
});
