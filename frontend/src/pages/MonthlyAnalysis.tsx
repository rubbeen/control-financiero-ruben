import { Calendar, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useState } from 'react';
import ExpenseCategoryChart from '../components/ExpenseCategoryChart';
import IncomeExpenseChart from '../components/IncomeExpenseChart';
import MetricCard from '../components/MetricCard';
import RecommendationCard from '../components/RecommendationCard';
import { useAsync } from '../hooks/useAsync';
import { analyticsService } from '../services/analytics';
import { formatCurrency } from '../utils/currency';
import { currentYearMonth } from '../utils/dates';
import AccountSelector from '../components/AccountSelector';

export default function MonthlyAnalysis() {
  const current = currentYearMonth();
  const [period, setPeriod] = useState(`${current.year}-${String(current.month).padStart(2, '0')}`);
  const [year, month] = period.split('-').map(Number);
  const monthly = useAsync(() => analyticsService.monthly(year, month), [year, month]);

  if (monthly.loading) return <p className="text-muted">Cargando informacion financiera...</p>;
  if (monthly.error) return <p className="rounded-lg bg-red-50 p-3 text-sm text-expense">{monthly.error}</p>;
  const data = monthly.data!;
  const summary = data.summary;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-text">Analisis mensual</h1>
        <input type="month" className="rounded-lg border border-border px-3 py-3" value={period} onChange={(e) => setPeriod(e.target.value)} />
      </div>
      <AccountSelector />
      {summary.messages.map((msg) => <p key={msg} className="rounded-lg bg-blue-50 p-3 text-sm text-primary">{msg}</p>)}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard title="Ingresos" value={formatCurrency(summary.total_income)} icon={TrendingUp} tone="green" />
        <MetricCard title="Gastos" value={formatCurrency(summary.total_expense)} icon={TrendingDown} tone="red" />
        <MetricCard title="Balance" value={formatCurrency(summary.balance)} icon={Wallet} tone={summary.balance >= 0 ? 'green' : 'red'} />
        <MetricCard title="Ahorro" value={summary.saving_rate !== null ? `${summary.saving_rate.toFixed(1)}%` : 'Sin ingresos'} icon={Calendar} tone="blue" />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <IncomeExpenseChart income={summary.total_income} expense={summary.total_expense} />
        <ExpenseCategoryChart data={summary.category_expenses} />
      </section>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4"><p className="text-sm text-muted">Gasto diario promedio</p><p className="font-bold">{formatCurrency(summary.average_daily_expense)}</p></div>
        <div className="rounded-lg bg-white p-4"><p className="text-sm text-muted">Mayor categoria</p><p className="font-bold">{summary.top_expense_category?.category || 'Sin datos'}</p></div>
        <div className="rounded-lg bg-white p-4"><p className="text-sm text-muted">Necesarios</p><p className="font-bold">{formatCurrency(summary.necessary_expenses)}</p></div>
        <div className="rounded-lg bg-white p-4"><p className="text-sm text-muted">No necesarios</p><p className="font-bold">{formatCurrency(summary.unnecessary_expenses)}</p></div>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-bold">Top 10 gastos mas altos</h2>
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          {summary.top_expenses.length ? summary.top_expenses.map((item) => (
            <div key={item.id} className="flex justify-between border-b border-border p-3 text-sm last:border-0"><span>{item.date} · {item.description}</span><strong>{formatCurrency(item.amount)}</strong></div>
          )) : <p className="p-4 text-sm text-muted">No existen movimientos registrados en este periodo.</p>}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-bold">Recomendaciones automaticas</h2>
        {data.recommendations.map((item) => <RecommendationCard key={item.title} recommendation={item} />)}
      </section>
    </div>
  );
}
