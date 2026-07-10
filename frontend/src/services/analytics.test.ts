import { describe, expect, it } from 'vitest';
import { Budget, Category, Movement } from '../types/finance';
import { calculateFinancialAnalysis, FinancialDataset } from './analytics';

const categories: Category[] = [{ id: 1, name: 'Comida', type: 'expense', color: '#f00', icon: 'Circle', active: true, created_at: '', updated_at: '' }, { id: 2, name: 'Salario', type: 'income', color: '#0f0', icon: 'Circle', active: true, created_at: '', updated_at: '' }];
const row = (id: number, type: Movement['type'], amount: number, date: string, extra: Partial<Movement> = {}): Movement => ({ id, account_id: 1, type, amount, date, category_id: type === 'income' ? 2 : 1, description: `Movimiento ${id}`, is_necessary: id % 2 === 0, is_recurring: false, created_at: '', updated_at: '', ...extra });
const budget: Budget = { id: 1, account_id: 1, year: 2026, month: 2, total_budget: 500000, saving_goal: 100000, unnecessary_expense_limit: 50000, category_budgets: [{ category_id: 1, amount_limit: 200000 }], created_at: '', updated_at: '' };

describe('motor analitico puro', () => {
  it('calcula cada tipo, categorias, dias, meses y presupuesto', () => {
    const movements = [row(1, 'income', 500000, '2026-02-01'), row(2, 'expense', 100000, '2026-02-02'), row(3, 'purchase', 50000, '2026-02-02'), row(4, 'adjustment', 20000, '2026-02-03', { adjustment_direction: 'in' }), row(5, 'transfer', 90000, '2026-02-03', { transfer_direction: 'out' }), row(6, 'expense', 80000, '2026-01-02')];
    const dataset: FinancialDataset = { movements, latestMovements: movements.slice(0, 5), categories, budget, currentBalance: 370000 };
    const result = calculateFinancialAnalysis({ dataset, year: 2026, month: 2, trendMonths: 2 });
    expect(result.currentBalance).toBe(370000);
    expect(result.summary.total_income).toBe(500000);
    expect(result.summary.total_expense).toBe(150000);
    expect(result.summary.balance).toBe(370000);
    expect(result.summary.category_expenses[0]).toMatchObject({ category: 'Comida', amount: 150000 });
    expect(result.summary.highest_expense_day?.amount).toBe(150000);
    expect(result.trends).toHaveLength(2);
    expect(result.trends[0].expense).toBe(80000);
    expect(result.summary.budget?.category_budgets[0].amount_limit).toBe(200000);
  });
  it('evita division por cero', () => {
    const dataset: FinancialDataset = { movements: [], latestMovements: [], categories, budget: null, currentBalance: 0 };
    const result = calculateFinancialAnalysis({ dataset, year: 2026, month: 2, trendMonths: 1 });
    expect(result.summary.saving_rate).toBeNull();
    expect(result.summary.average_daily_expense).toBe(0);
  });
});
