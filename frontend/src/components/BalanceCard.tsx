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
    <section className="rounded-lg bg-gradient-to-br from-cocoa via-copper to-purchase p-5 text-white shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-amber-100">Saldo actual</p>
          <h2 className="mt-1 text-3xl font-bold">{formatCurrency(currentBalance)}</h2>
        </div>
        <div className="rounded-full bg-white/10 p-3">
          <Wallet className="h-7 w-7 text-amber-100" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-amber-100">Balance mes</p>
          <p className={positive ? 'font-semibold text-emerald-200' : 'font-semibold text-red-200'}>{formatCurrency(monthlyBalance)}</p>
        </div>
        <div>
          <p className="text-amber-100">Ingresos</p>
          <p className="font-semibold text-emerald-200">{formatCurrency(income)}</p>
        </div>
        <div>
          <p className="text-amber-100">Gastos</p>
          <p className="font-semibold text-red-200">{formatCurrency(expense)}</p>
        </div>
      </div>
    </section>
  );
}
