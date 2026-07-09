import { formatCurrency } from '../utils/currency';

interface Props {
  used: number;
  limit: number;
  label?: string;
}

export default function BudgetProgressBar({ used, limit, label = 'Presupuesto usado' }: Props) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const danger = pct >= 100;
  const warning = pct >= 80 && pct < 100;
  const color = danger ? 'bg-expense' : warning ? 'bg-purchase' : 'bg-primary';
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-text">{label}</span>
        <span className="text-muted">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted">{formatCurrency(used)} usados de {formatCurrency(limit)}</p>
    </div>
  );
}
