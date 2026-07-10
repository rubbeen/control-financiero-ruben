import { describe, expect, it } from 'vitest';
import { Movement } from '../types/finance';
import { movementSignedAmount, totalMovements } from './calculations';

const movement = (type: Movement['type'], extra: Partial<Movement> = {}): Movement => ({ id: 1, account_id: 1, type, amount: 1000, date: '2026-01-01', category_id: 1, description: 'Prueba', is_necessary: true, is_recurring: false, created_at: '', updated_at: '', ...extra });

describe('calculos contables', () => {
  it('aplica signos a ingresos, gastos y compras', () => {
    expect(movementSignedAmount(movement('income'))).toBe(1000);
    expect(movementSignedAmount(movement('expense'))).toBe(-1000);
    expect(movementSignedAmount(movement('purchase'))).toBe(-1000);
  });
  it('aplica direccion a ajustes y transferencias', () => {
    expect(movementSignedAmount(movement('adjustment', { adjustment_direction: 'in' }))).toBe(1000);
    expect(movementSignedAmount(movement('adjustment', { adjustment_direction: 'out' }))).toBe(-1000);
    expect(movementSignedAmount(movement('transfer', { transfer_direction: 'in' }))).toBe(1000);
    expect(movementSignedAmount(movement('transfer', { transfer_direction: 'out' }))).toBe(-1000);
    expect(movementSignedAmount(movement('adjustment'))).toBe(0);
  });
  it('suma saldo sin contar una transferencia completa dos veces', () => {
    expect(totalMovements([movement('transfer', { transfer_direction: 'out' }), movement('transfer', { id: 2, account_id: 2, transfer_direction: 'in' })])).toBe(0);
  });
});
