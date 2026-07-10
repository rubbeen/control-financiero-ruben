import { Calendar, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import AccountSelector from '../components/AccountSelector';
import MetricCard from '../components/MetricCard';
import RecommendationCard from '../components/RecommendationCard';
import { useFinancialAnalysis } from '../hooks/useFinanceQueries';
import { formatCurrency } from '../utils/currency';
import { currentYearMonth } from '../utils/dates';

const ExpenseCategoryChart = lazy(() => import('../components/ExpenseCategoryChart'));
const IncomeExpenseChart = lazy(() => import('../components/IncomeExpenseChart'));

export default function MonthlyAnalysis() {
  const current = currentYearMonth();
  const [period, setPeriod] = useState(`${current.year}-${String(current.month).padStart(2, '0')}`);
  const [year, month] = period.split('-').map(Number);
  const monthly = useFinancialAnalysis(year, month, 6);
  if (monthly.isLoading) return <div className="space-y-3"><div className="skeleton h-24" /><div className="skeleton h-64" /></div>;
  if (monthly.isError || !monthly.data) return <button onClick={() => void monthly.refetch()} className="w-full rounded-lg bg-red-50 p-3 text-expense">No se pudo cargar el analisis. Toca para reintentar.</button>;
  const { summary } = monthly.data;
  return <div className="space-y-4">
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">Analisis mensual</h1><input type="month" className="min-w-0 rounded-lg border border-border px-3 py-3" value={period} onChange={(event) => setPeriod(event.target.value)} /></div>
    <AccountSelector />
    {summary.messages.map((message) => <p key={message} className="rounded-lg bg-blue-50 p-3 text-sm text-primary">{message}</p>)}
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4"><MetricCard title="Ingresos" value={formatCurrency(summary.total_income)} icon={TrendingUp} tone="green" /><MetricCard title="Gastos" value={formatCurrency(summary.total_expense)} icon={TrendingDown} tone="red" /><MetricCard title="Balance" value={formatCurrency(summary.balance)} icon={Wallet} tone={summary.balance >= 0 ? 'green' : 'red'} /><MetricCard title="Ahorro" value={summary.saving_rate !== null ? `${summary.saving_rate.toFixed(1)}%` : 'Sin ingresos'} icon={Calendar} tone="blue" /></section>
    <section className="grid gap-4 lg:grid-cols-2"><Suspense fallback={<div className="skeleton h-72" />}><IncomeExpenseChart income={summary.total_income} expense={summary.total_expense} /></Suspense><Suspense fallback={<div className="skeleton h-72" />}><ExpenseCategoryChart data={summary.category_expenses} /></Suspense></section>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-lg bg-white p-4"><p className="text-sm text-muted">Gasto diario promedio</p><p className="font-bold">{formatCurrency(summary.average_daily_expense)}</p></div><div className="rounded-lg bg-white p-4"><p className="text-sm text-muted">Mayor categoria</p><p className="break-words font-bold">{summary.top_expense_category?.category || 'Sin datos'}</p></div><div className="rounded-lg bg-white p-4"><p className="text-sm text-muted">Necesarios</p><p className="font-bold">{formatCurrency(summary.necessary_expenses)}</p></div><div className="rounded-lg bg-white p-4"><p className="text-sm text-muted">No necesarios</p><p className="font-bold">{formatCurrency(summary.unnecessary_expenses)}</p></div></section>
    <section><h2 className="mb-2 text-lg font-bold">Top 10 gastos</h2><div className="overflow-hidden rounded-lg border bg-white">{summary.top_expenses.length ? summary.top_expenses.map((item) => <div key={item.id} className="flex min-w-0 items-start justify-between gap-3 border-b p-3 text-sm last:border-0"><span className="min-w-0 flex-1 break-words">{item.date} · {item.description}</span><strong className="flex-none">{formatCurrency(item.amount)}</strong></div>) : <p className="p-4 text-sm text-muted">Sin movimientos.</p>}</div></section>
    <section className="space-y-3"><h2 className="text-lg font-bold">Recomendaciones automaticas</h2>{monthly.data.recommendations.map((item) => <RecommendationCard key={item.title} recommendation={item} />)}</section>
  </div>;
}
