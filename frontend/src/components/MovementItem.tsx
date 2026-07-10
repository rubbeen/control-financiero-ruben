import { ArrowDownCircle, ArrowRightLeft, ArrowUpCircle, ShoppingBag } from 'lucide-react';
import type { Movement } from '../types/finance';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/dates';

interface Props {
  movement: Movement;
  onClick?: () => void;
}

export default function MovementItem({ movement, onClick }: Props) {
  const isIncome = movement.type === 'income';
  const Icon = isIncome ? ArrowUpCircle : movement.type === 'purchase' ? ShoppingBag : movement.type === 'transfer' ? ArrowRightLeft : ArrowDownCircle;
  const color = isIncome ? 'text-income bg-green-50' : movement.type === 'purchase' ? 'text-purchase bg-orange-50' : 'text-expense bg-red-50';
  return (
    <button data-testid="movement-item" onClick={onClick} className="grid w-full max-w-full min-w-0 grid-cols-[44px_minmax(0,1fr)] gap-x-3 gap-y-2 rounded-lg border border-border bg-white p-3 text-left shadow-sm sm:grid-cols-[44px_minmax(0,1fr)_max-content]">
      <span className={`row-span-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 max-w-full">
        <span data-testid="movement-description" className="block max-w-full whitespace-normal break-words text-sm font-semibold leading-5 text-text [overflow-wrap:anywhere]">{movement.description}</span>
        <span data-testid="movement-metadata" className="mt-1 block max-w-full whitespace-normal break-words text-xs leading-4 text-muted [overflow-wrap:anywhere]">{movement.category_name || 'Sin categoria'} / {formatDate(movement.date)}</span>
      </span>
      <span data-testid="movement-amount" className={`col-start-2 justify-self-end whitespace-nowrap text-sm font-bold tabular-nums sm:col-start-3 sm:row-start-1 sm:self-center ${isIncome ? 'text-income' : 'text-expense'}`}>
        {isIncome ? '+' : '-'}{formatCurrency(movement.amount)}
      </span>
    </button>
  );
}
