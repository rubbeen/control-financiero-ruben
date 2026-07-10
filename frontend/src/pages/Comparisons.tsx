import { lazy, Suspense, useState } from 'react';
import { useFinancialAnalysis } from '../hooks/useFinanceQueries';
import { formatCurrency } from '../utils/currency';
import { currentYearMonth } from '../utils/dates';
const MonthlyTrendChart = lazy(() => import('../components/MonthlyTrendChart'));

export default function Comparisons() {
  const current = currentYearMonth();
  const [period, setPeriod] = useState(`${current.year}-${String(current.month).padStart(2, '0')}`);
  const [months, setMonths] = useState(6);
  const [year, month] = period.split('-').map(Number);
  const analysis = useFinancialAnalysis(year, month, months);
  const comparison = analysis.data?.comparison;
  return <div className="space-y-4"><h1 className="text-2xl font-bold">Comparativas</h1><div className="grid gap-3 rounded-lg bg-white p-4 sm:grid-cols-2"><input type="month" className="min-w-0 rounded-lg border px-3 py-3" value={period} onChange={(event) => setPeriod(event.target.value)} /><select className="min-w-0 rounded-lg border px-3 py-3" value={months} onChange={(event) => setMonths(Number(event.target.value))}><option value={3}>Ultimos 3 meses</option><option value={6}>Ultimos 6 meses</option><option value={12}>Ultimos 12 meses</option></select></div>{analysis.isLoading && <div className="skeleton h-72" />}{comparison?.message && <p className="rounded-lg bg-blue-50 p-3 text-primary">{comparison.message}</p>}{comparison && !comparison.message && <section className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-white p-4"><p className="text-sm text-muted">Variacion gastos</p><p className="font-bold">{formatCurrency(comparison.expense_variation?.absolute || 0)}</p></div><div className="rounded-lg bg-white p-4"><p className="text-sm text-muted">Porcentaje</p><p className="font-bold">{comparison.expense_variation?.percent?.toFixed(1) ?? 'No calculable'}%</p></div><div className="rounded-lg bg-white p-4"><p className="text-sm text-muted">Mayor aumento</p><p className="break-words font-bold">{comparison.largest_category_increase?.category || 'Sin datos'}</p></div></section>}{analysis.data && <Suspense fallback={<div className="skeleton h-72" />}><MonthlyTrendChart data={analysis.data.trends} /></Suspense>}</div>;
}
