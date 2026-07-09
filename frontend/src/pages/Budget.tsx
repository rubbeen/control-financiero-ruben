import { Save } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import BudgetProgressBar from '../components/BudgetProgressBar';
import { analyticsService } from '../services/analytics';
import { budgetsService } from '../services/budgets';
import { Budget as BudgetType, CategoryBudget, MonthlySummary } from '../types/finance';
import { formatCurrency } from '../utils/currency';
import { currentYearMonth } from '../utils/dates';
import AccountSelector from '../components/AccountSelector';

export default function Budget() {
  const { year, month } = currentYearMonth();
  const [budget, setBudget] = useState<Partial<BudgetType>>({ year, month, total_budget: 0, saving_goal: 0, unnecessary_expense_limit: 0, category_budgets: [] });
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    budgetsService.get(year, month).then(setBudget).catch(() => undefined);
    analyticsService.summary(year, month).then(setSummary).catch(() => undefined);
  }, [year, month]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      ...budget,
      year: Number(budget.year || year),
      month: Number(budget.month || month),
      total_budget: Number(budget.total_budget || 0),
      saving_goal: Number(budget.saving_goal || 0),
      unnecessary_expense_limit: Number(budget.unnecessary_expense_limit || 0),
      category_budgets: (budget.category_budgets || []).map((item: CategoryBudget) => ({ category_id: item.category_id, amount_limit: Number(item.amount_limit || 0) }))
    };
    const saved = budget.id ? await budgetsService.update(budget.id, payload as BudgetType) : await budgetsService.create(payload as BudgetType);
    setBudget(saved);
    setMessage('Presupuesto guardado correctamente.');
  }

  const spent = summary?.total_expense || 0;
  const limit = Number(budget.total_budget || 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text">Presupuesto mensual</h1>
      <AccountSelector />
      <BudgetProgressBar used={spent} limit={limit} />
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-sm"><p className="text-sm text-muted">Total gastado</p><p className="text-xl font-bold">{formatCurrency(spent)}</p></div>
        <div className="rounded-lg bg-white p-4 shadow-sm"><p className="text-sm text-muted">Disponible</p><p className="text-xl font-bold">{formatCurrency(limit - spent)}</p></div>
        <div className="rounded-lg bg-white p-4 shadow-sm"><p className="text-sm text-muted">Meta ahorro</p><p className="text-xl font-bold">{formatCurrency(Number(budget.saving_goal || 0))}</p></div>
      </section>
      <form onSubmit={submit} className="space-y-4 rounded-lg border border-border bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Ano
            <input type="number" className="mt-1 w-full rounded-lg border border-border px-3 py-3" value={budget.year || year} onChange={(e) => setBudget({ ...budget, year: Number(e.target.value) })} />
          </label>
          <label className="text-sm font-semibold">Mes
            <input type="number" min="1" max="12" className="mt-1 w-full rounded-lg border border-border px-3 py-3" value={budget.month || month} onChange={(e) => setBudget({ ...budget, month: Number(e.target.value) })} />
          </label>
        </div>
        <label className="block text-sm font-semibold">Presupuesto total
          <input type="number" min="0" className="mt-1 w-full rounded-lg border border-border px-3 py-3" value={budget.total_budget || ''} onChange={(e) => setBudget({ ...budget, total_budget: Number(e.target.value) })} />
        </label>
        <label className="block text-sm font-semibold">Meta de ahorro
          <input type="number" min="0" className="mt-1 w-full rounded-lg border border-border px-3 py-3" value={budget.saving_goal || ''} onChange={(e) => setBudget({ ...budget, saving_goal: Number(e.target.value) })} />
        </label>
        <label className="block text-sm font-semibold">Limite de gastos no necesarios
          <input type="number" min="0" className="mt-1 w-full rounded-lg border border-border px-3 py-3" value={budget.unnecessary_expense_limit || ''} onChange={(e) => setBudget({ ...budget, unnecessary_expense_limit: Number(e.target.value) })} />
        </label>
        {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-income">{message}</p>}
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-4 font-semibold text-white"><Save className="h-5 w-5" /> Guardar presupuesto</button>
      </form>
      {summary?.category_expenses?.some((item) => item.amount > limit * 0.3) && <p className="rounded-lg bg-orange-50 p-3 text-sm text-purchase">Hay categorias cerca del limite mensual. Revisa los gastos por categoria en Analisis.</p>}
    </div>
  );
}
