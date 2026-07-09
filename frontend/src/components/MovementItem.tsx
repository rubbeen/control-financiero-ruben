import { ArrowDownCircle, ArrowRightLeft, ArrowUpCircle, ShoppingBag } from 'lucide-react';
import { Movement } from '../types/finance';
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
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-lg border border-border bg-white p-3 text-left shadow-sm">
      <span className={`rounded-lg p-2 ${color}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-text">{movement.description}</span>
        <span className="block truncate text-xs text-muted">{movement.category_name || 'Sin categoria'} · {formatDate(movement.date)}</span>
      </span>
      <span className={isIncome ? 'text-sm font-bold text-income' : 'text-sm font-bold text-expense'}>
        {isIncome ? '+' : '-'}{formatCurrency(movement.amount)}
      </span>
    </button>
  );
}
