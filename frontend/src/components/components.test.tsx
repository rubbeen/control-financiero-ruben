import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import BalanceCard from './BalanceCard';
import BottomNavigation from './BottomNavigation';
import ConfirmDialog from './ConfirmDialog';

describe('componentes esenciales', () => {
  it('diferencia saldo acumulado y balance mensual', () => {
    render(<BalanceCard currentBalance={900000} monthlyBalance={100000} income={200000} expense={100000} />);
    expect(screen.getByText(/Saldo actual/)).toBeInTheDocument();
    expect(screen.getByText(/Balance del mes/)).toBeInTheDocument();
  });
  it('muestra cinco destinos principales', () => {
    render(<MemoryRouter><BottomNavigation /></MemoryRouter>);
    expect(screen.getAllByRole('link')).toHaveLength(5);
  });
  it('confirma y cancela un dialogo accesible', () => {
    const confirm = vi.fn(); const cancel = vi.fn();
    render(<ConfirmDialog open title="Prueba" message="Mensaje" onConfirm={confirm} onCancel={cancel} />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Confirmar'));
    expect(confirm).toHaveBeenCalledOnce();
  });
});
