import { useMutation, useQuery } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import AccountSelector from '../components/AccountSelector';
import BudgetProgressBar from '../components/BudgetProgressBar';
import UnsavedChangesGuard from '../components/UnsavedChangesGuard';
import { useAccount } from '../context/AccountContext';
import { useCategories, useFinancialAnalysis, useUid } from '../hooks/useFinanceQueries';
import { budgetsService } from '../services/budgets';
import { queryClient, queryKeys } from '../services/queryClient';
import { Budget as BudgetType } from '../types/finance';
import { formatCurrency } from '../utils/currency';
import { currentYearMonth } from '../utils/dates';

const blankBudget = (year: number, month: number): Partial<BudgetType> => ({ year, month, total_budget: 0, saving_goal: 0, unnecessary_expense_limit: 0, category_budgets: [] });

export default function Budget() {
  const current = currentYearMonth();
  const uid = useUid();
  const { activeAccountId } = useAccount();
  const categories = useCategories(false);
  const analysis = useFinancialAnalysis(current.year, current.month, 2);
  const budgetQuery = useQuery({ queryKey: queryKeys.budget(uid, activeAccountId, current.year, current.month), queryFn: () => budgetsService.get(activeAccountId, current.year, current.month, uid), staleTime: 30_000 });
  const [budget, setBudget] = useState<Partial<BudgetType>>(blankBudget(current.year, current.month));
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => { if (!dirty) setBudget(budgetQuery.data || blankBudget(current.year, current.month)); }, [budgetQuery.data, activeAccountId, current.year, current.month, dirty]);
  const save = useMutation({ mutationFn: () => budgetsService.save(activeAccountId, budget, uid), onSuccess: async (saved) => { setBudget(saved); setDirty(false); setMessage('Presupuesto guardado.'); await Promise.all([queryClient.invalidateQueries({ queryKey: queryKeys.budget(uid, activeAccountId, current.year, current.month) }), queryClient.invalidateQueries({ queryKey: ['financialAnalysis', uid, activeAccountId] })]); } });
  const update = (change: Partial<BudgetType>) => { setBudget((value) => ({ ...value, ...change })); setDirty(true); setMessage(''); };
  const setCategoryLimit = (categoryId: number, amount: number) => {
    const rows = [...(budget.category_budgets || [])];
    const index = rows.findIndex((item) => item.category_id === categoryId);
    if (amount > 0 && index >= 0) rows[index] = { category_id: categoryId, amount_limit: amount };
    else if (amount > 0) rows.push({ category_id: categoryId, amount_limit: amount });
    else if (index >= 0) rows.splice(index, 1);
    update({ category_budgets: rows.slice(0, 10) });
  };
  const submit = (event: FormEvent) => { event.preventDefault(); void save.mutateAsync(); };
  const summary = analysis.data?.summary;
  const spent = summary?.total_expense || 0;
  const limit = Number(budget.total_budget || 0);
  const available = Math.max(0, limit - spent);
  return <div className="space-y-4"><UnsavedChangesGuard dirty={dirty} /><h1 className="text-2xl font-bold">Presupuesto mensual</h1><AccountSelector /><BudgetProgressBar used={spent} limit={limit} /><section className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-white p-4"><p className="text-sm text-muted">Total gastado</p><p className="text-xl font-bold">{formatCurrency(spent)}</p></div><div className="rounded-lg bg-white p-4"><p className="text-sm text-muted">Disponible</p><p className="text-xl font-bold">{formatCurrency(available)}</p></div><div className="rounded-lg bg-white p-4"><p className="text-sm text-muted">Meta ahorro</p><p className="text-xl font-bold">{formatCurrency(Number(budget.saving_goal || 0))}</p></div></section>{limit > 0 && spent / limit >= 1 ? <p className="rounded-lg bg-red-50 p-3 font-semibold text-expense">Limite alcanzado: revisa los gastos antes de continuar.</p> : limit > 0 && spent / limit >= 0.8 ? <p className="rounded-lg bg-orange-50 p-3 font-semibold text-purchase">Alerta: ya usaste al menos el 80% del presupuesto.</p> : null}<form onSubmit={submit} className="space-y-4 rounded-lg border bg-white p-4"><label className="block text-sm font-semibold">Presupuesto total<input type="number" min="0" step="1" className="mt-1 w-full rounded-lg border px-3 py-3" value={budget.total_budget || ''} onChange={(event) => update({ total_budget: Number(event.target.value) })} /></label><label className="block text-sm font-semibold">Meta de ahorro<input type="number" min="0" step="1" className="mt-1 w-full rounded-lg border px-3 py-3" value={budget.saving_goal || ''} onChange={(event) => update({ saving_goal: Number(event.target.value) })} /></label><label className="block text-sm font-semibold">Limite de gastos no necesarios<input type="number" min="0" step="1" className="mt-1 w-full rounded-lg border px-3 py-3" value={budget.unnecessary_expense_limit || ''} onChange={(event) => update({ unnecessary_expense_limit: Number(event.target.value) })} /></label><fieldset className="space-y-2"><legend className="font-bold">Limites por categoria</legend>{(categories.data || []).filter((category) => category.type !== 'income').slice(0, 10).map((category) => { const categoryLimit = budget.category_budgets?.find((item) => item.category_id === category.id)?.amount_limit || 0; const categorySpent = summary?.category_expenses.find((item) => item.category_id === category.id)?.amount || 0; const percentage = categoryLimit ? Math.min(100, (categorySpent / categoryLimit) * 100) : 0; return <label key={category.id} className="block rounded-lg border p-3"><span className="flex min-w-0 justify-between gap-3 text-sm"><strong className="min-w-0 truncate">{category.name}</strong><span className="flex-none">{formatCurrency(categorySpent)} · {percentage.toFixed(0)}%</span></span><input aria-label={`Limite ${category.name}`} type="number" min="0" step="1" className="mt-2 w-full rounded-lg border px-3 py-2" value={categoryLimit || ''} placeholder="Sin limite" onChange={(event) => setCategoryLimit(category.id, Number(event.target.value))} /></label>; })}</fieldset>{message && <p className="rounded-lg bg-green-50 p-3 text-income">{message}</p>}{save.error && <p className="rounded-lg bg-red-50 p-3 text-expense">{save.error.message}</p>}<button disabled={save.isPending} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-white"><Save className="h-5 w-5" /> {save.isPending ? 'Guardando...' : 'Guardar presupuesto'}</button></form></div>;
}
