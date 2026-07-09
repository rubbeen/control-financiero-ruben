import { useState } from 'react';
import MonthlyTrendChart from '../components/MonthlyTrendChart';
import { useAsync } from '../hooks/useAsync';
import { analyticsService } from '../services/analytics';
import { formatCurrency } from '../utils/currency';
import { currentYearMonth } from '../utils/dates';

export default function Comparisons() {
  const current = currentYearMonth();
  const [period, setPeriod] = useState(`${current.year}-${String(current.month).padStart(2, '0')}`);
  const [months, setMonths] = useState(6);
  const [year, month] = period.split('-').map(Number);
  const comparison = useAsync(() => analyticsService.comparison(year, month), [year, month]);
  const trends = useAsync(() => analyticsService.trends(months), [months]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text">Comparativas</h1>
      <div className="grid gap-3 rounded-lg bg-white p-4 sm:grid-cols-2">
        <input type="month" className="rounded-lg border border-border px-3 py-3" value={period} onChange={(e) => setPeriod(e.target.value)} />
        <select className="rounded-lg border border-border px-3 py-3" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
          <option value={3}>Ultimos 3 meses</option>
          <option value={6}>Ultimos 6 meses</option>
          <option value={12}>Ultimos 12 meses</option>
        </select>
      </div>
      {comparison.data?.message && <p className="rounded-lg bg-blue-50 p-3 text-sm text-primary">{comparison.data.message}</p>}
      {comparison.data && !comparison.data.message && (
        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4"><p className="text-sm text-muted">Variacion gastos</p><p className="font-bold">{comparison.data.expense_variation ? formatCurrency(comparison.data.expense_variation.absolute) : 'No calculable'}</p></div>
          <div className="rounded-lg bg-white p-4"><p className="text-sm text-muted">% gastos</p><p className="font-bold">{comparison.data.expense_variation?.percent?.toFixed(1) || 'No calculable'}{comparison.data.expense_variation?.percent ? '%' : ''}</p></div>
          <div className="rounded-lg bg-white p-4"><p className="text-sm text-muted">Categoria aumento</p><p className="font-bold">{comparison.data.largest_category_increase?.category || 'Sin datos'}</p></div>
        </section>
      )}
      <MonthlyTrendChart data={trends.data || []} />
    </div>
  );
}
