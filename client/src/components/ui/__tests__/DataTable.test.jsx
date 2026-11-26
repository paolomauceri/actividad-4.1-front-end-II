import { render, screen, within } from '@testing-library/react';
import { DataTable } from '../DataTable.jsx';

const columnas = [
  { clave: 'nombre', titulo: 'Nombre' },
  { clave: 'estado', titulo: 'Estado', render: (fila) => <strong>{fila.estado.toLowerCase()}</strong> },
];

describe('DataTable', () => {
  it('muestra encabezados y una fila por elemento', () => {
    render(
      <DataTable
        titulo="Torneos"
        columnas={columnas}
        filas={[
          { id: 1, nombre: 'Copa A', estado: 'ABIERTO' },
          { id: 2, nombre: 'Copa B', estado: 'BORRADOR' },
        ]}
      />,
    );

    const tabla = screen.getByRole('table', { name: 'Torneos' });
    expect(within(tabla).getAllByRole('columnheader').map((th) => th.textContent)).toEqual(['Nombre', 'Estado']);
    expect(within(tabla).getAllByRole('row')).toHaveLength(3);
    expect(within(tabla).getByText('borrador')).toBeInTheDocument();
  });

  it('cada celda lleva su etiqueta para la vista en tarjetas del móvil', () => {
    render(<DataTable titulo="Torneos" columnas={columnas} filas={[{ id: 1, nombre: 'Copa A', estado: 'ABIERTO' }]} />);

    expect(screen.getByText('Copa A').closest('td')).toHaveAttribute('data-label', 'Nombre');
  });

  it('sin filas muestra el mensaje de vacío', () => {
    render(<DataTable titulo="Torneos" columnas={columnas} filas={[]} vacio="Todavía no hay torneos" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('Todavía no hay torneos')).toBeInTheDocument();
  });
});
