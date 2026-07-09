import { Movement } from '../types/finance';

const expenseTypes = new Set(['expense', 'purchase', 'adjustment']);

export function movementSignedAmount(movement: Movement): number {
  if (movement.type === 'income') return movement.amount;
  if (expenseTypes.has(movement.type)) return -movement.amount;
  return 0;
}

export function totalMovements(movements: Movement[]): number {
  return movements.reduce((sum, item) => sum + movementSignedAmount(item), 0);
}
