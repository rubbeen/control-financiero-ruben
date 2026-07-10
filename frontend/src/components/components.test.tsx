import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import BalanceCard from './BalanceCard';
import BottomNavigation from './BottomNavigation';
import ConfirmDialog from './ConfirmDialog';
import MovementItem from './MovementItem';
import RecommendationCard from './RecommendationCard';
import type { Movement, Recommendation } from '../types/finance';

const longMovement: Movement = {
  id: 3,
  account_id: 1,
  type: 'expense',
  amount: 120000000,
  date: '2026-07-09',
  category_id: 3,
  category_name: 'Otros gastos',
  description: 'Pago de la salud y pensi\u00f3n para cobrar el mes anterior',
  is_necessary: true,
  is_recurring: false,
  created_at: '2026-07-09T00:00:00.000Z',
  updated_at: '2026-07-09T00:00:00.000Z'
};

const recommendation: Recommendation = {
  title: 'Gasto concentrado',
  explanation: 'Educaci\u00f3n representa 38.6% del gasto mensual registrado durante este per\u00edodo.',
  affected_value: 867273,
  suggested_action: 'Define un l\u00edmite semanal para esta categor\u00eda y revisa los pagos programados antes de realizar nuevos gastos.',
  level: 'advertencia'
};

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
  it('muestra completos el concepto, metadatos y monto de un movimiento amplio', () => {
    render(<MovementItem movement={longMovement} />);
    expect(screen.getByTestId('movement-description')).toHaveTextContent(longMovement.description);
    expect(screen.getByTestId('movement-metadata')).toHaveTextContent('Otros gastos');
    expect(screen.getByTestId('movement-amount')).toHaveTextContent('120.000.000');
  });
  it('muestra completa una recomendacion financiera', () => {
    render(<RecommendationCard recommendation={recommendation} />);
    expect(screen.getByTestId('recommendation-title')).toHaveTextContent(recommendation.title);
    expect(screen.getByTestId('recommendation-explanation')).toHaveTextContent(recommendation.explanation);
    expect(screen.getByTestId('recommendation-amount')).toHaveTextContent('867.273');
    expect(screen.getByTestId('recommendation-action')).toHaveTextContent(recommendation.suggested_action);
  });
});
