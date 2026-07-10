import { Movement } from '../types/finance';

export function movementSignedAmount(movement: Movement): number {
  if (movement.type === 'income') return movement.amount;
  if (movement.type === 'expense' || movement.type === 'purchase') return -movement.amount;
  if (movement.type === 'adjustment') {
    if (movement.adjustment_direction === 'in') return movement.amount;
    if (movement.adjustment_direction === 'out') return -movement.amount;
  }
  if (movement.type === 'transfer') {
    if (movement.transfer_direction === 'in') return movement.amount;
    if (movement.transfer_direction === 'out') return -movement.amount;
  }
  return 0;
}

export function totalMovements(movements: Movement[]): number {
  return movements.reduce((sum, item) => sum + movementSignedAmount(item), 0);
}
