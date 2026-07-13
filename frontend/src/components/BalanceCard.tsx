import { Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface Props {
  currentBalance: number;
  monthlyBalance: number;
  income: number;
  expense: number;
}

export default function BalanceCard({ currentBalance, monthlyBalance, income, expense }: Props) {
  const positive = monthlyBalance >= 0;
  return (
    <section data-testid="balance-card" className="rounded-lg bg-gradient-to-br from-cocoa via-copper to-purchase p-5 text-white shadow-soft">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-amber-100">Saldo actual</p>
          <h2 className="mt-1 break-words text-2xl font-bold sm:text-3xl" aria-label={`Saldo actual ${formatCurrency(currentBalance)}`}>{formatCurrency(currentBalance)}</h2>
        </div>
        <div className="rounded-full bg-white/10 p-3">
          <Wallet className="h-7 w-7 text-amber-100" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 text-sm min-[380px]:grid-cols-3">
        <div className="min-w-0">
          <p className="text-amber-100">Balance del mes</p>
          <p className={`${positive ? 'text-emerald-200' : 'text-red-200'} break-words font-semibold`}>{formatCurrency(monthlyBalance)}</p>
        </div>
        <div className="min-w-0">
          <p className="text-amber-100">Ingresos</p>
          <p className="break-words font-semibold text-emerald-200">{formatCurrency(income)}</p>
        </div>
        <div className="min-w-0">
          <p className="text-amber-100">Gastos</p>
          <p className="break-words font-semibold text-red-200">{formatCurrency(expense)}</p>
        </div>
      </div>
    </section>
  );
}
