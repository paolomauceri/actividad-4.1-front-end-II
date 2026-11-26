import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TiempoForm } from '../TiempoForm.jsx';

describe('TiempoForm', () => {
  it('con un tiempo mal escrito muestra cómo escribirlo y no guarda', async () => {
    const user = userEvent.setup();
    const onGuardar = jest.fn();
    render(<TiempoForm onGuardar={onGuardar} />);

    await user.type(screen.getByLabelText(/tiempo/i), '12:75');
    await user.click(screen.getByRole('button', { name: /guardar tiempo/i }));

    expect(screen.getByText('Escribe el tiempo como mm:ss.cc (ej. 12:34.56)')).toBeInTheDocument();
    expect(screen.getByLabelText(/tiempo/i)).toHaveAttribute('aria-invalid', 'true');
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it('guarda un tiempo válido en milisegundos', async () => {
    const user = userEvent.setup();
    const onGuardar = jest.fn();
    render(<TiempoForm onGuardar={onGuardar} />);

    await user.type(screen.getByLabelText(/tiempo/i), '12:34.56');
    await user.click(screen.getByRole('button', { name: /guardar tiempo/i }));

    expect(onGuardar).toHaveBeenCalledWith({ estado: 'FINALIZADO', tiempoMs: 754560 });
  });

  it('DNF guarda sin tiempo', async () => {
    const user = userEvent.setup();
    const onGuardar = jest.fn();
    render(<TiempoForm onGuardar={onGuardar} />);

    await user.click(screen.getByRole('button', { name: /no terminó/i }));

    expect(onGuardar).toHaveBeenCalledWith({ estado: 'DNF' });
  });

  it('envía las observaciones escritas', async () => {
    const user = userEvent.setup();
    const onGuardar = jest.fn();
    render(<TiempoForm onGuardar={onGuardar} />);

    await user.type(screen.getByLabelText(/observaciones/i), 'Salida en falso');
    await user.click(screen.getByRole('button', { name: /descalificado/i }));

    expect(onGuardar).toHaveBeenCalledWith({ estado: 'DSQ', observaciones: 'Salida en falso' });
  });

  it('parte del resultado actual al corregir', () => {
    render(<TiempoForm onGuardar={jest.fn()} inicial={{ estado: 'FINALIZADO', tiempoMs: 63870, observaciones: 'Revisado' }} />);
    expect(screen.getByLabelText(/tiempo/i)).toHaveValue('1:03.87');
    expect(screen.getByLabelText(/observaciones/i)).toHaveValue('Revisado');
  });
});
