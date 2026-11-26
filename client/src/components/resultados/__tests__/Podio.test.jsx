import { render, screen, within } from '@testing-library/react';
import { Podio } from '../Podio.jsx';

const fila = (inscripcionId, atleta, posicion, estado = 'FINALIZADO', tiempoMs = 60000) => ({
  inscripcionId,
  dorsal: 100 + inscripcionId,
  atletaId: inscripcionId,
  atleta,
  club: null,
  categoriaId: 1,
  categoria: 'Adulto Femenino',
  estado,
  tiempoMs: estado === 'FINALIZADO' ? tiempoMs : null,
  posicion,
});

describe('Podio', () => {
  it('muestra los tres primeros con su lugar y su tiempo', () => {
    render(
      <Podio
        filas={[
          fila(1, 'Ana Ríos', 1, 'FINALIZADO', 57940),
          fila(2, 'Bea Soto', 2, 'FINALIZADO', 58120),
          fila(3, 'Carla Paz', 3, 'FINALIZADO', 59000),
          fila(4, 'Dora Gil', 4, 'FINALIZADO', 61000),
        ]}
      />,
    );

    const podio = screen.getByRole('list', { name: 'Podio' });
    const puestos = within(podio).getAllByRole('listitem');
    expect(puestos).toHaveLength(3);
    expect(within(podio).getByText('Ana Ríos').closest('li')).toHaveTextContent('1.º lugar');
    expect(within(podio).getByText('Ana Ríos').closest('li')).toHaveTextContent('57.94');
    expect(screen.queryByText('Dora Gil')).not.toBeInTheDocument();
  });

  it('con empate en el 1.º muestra dos oros y nunca un DNF', () => {
    render(
      <Podio
        filas={[
          fila(1, 'Ana Ríos', 1),
          fila(2, 'Bea Soto', 1),
          fila(3, 'Carla Paz', 3),
          fila(4, 'Dora Gil', null, 'DNF'),
        ]}
      />,
    );

    expect(screen.getAllByText('1.º lugar')).toHaveLength(2);
    expect(screen.getByText('3.º lugar')).toBeInTheDocument();
    expect(screen.queryByText('2.º lugar')).not.toBeInTheDocument();
    expect(screen.queryByText('Dora Gil')).not.toBeInTheDocument();
  });

  it('sin tiempos no muestra podio', () => {
    render(<Podio filas={[fila(4, 'Dora Gil', null, 'DNS')]} />);
    expect(screen.queryByRole('list', { name: 'Podio' })).not.toBeInTheDocument();
  });
});
