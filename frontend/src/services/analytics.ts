import { Budget, Category, MonthlyData, MonthlySummary, Movement, Recommendation } from '../types/finance';
import { perfMeasureAsync } from '../utils/performance';
import { decorateMovements, movementsService } from './movements';

export interface FinancialDataset {
  movements: Movement[];
  latestMovements: Movement[];
  categories: Category[];
  budget: Budget | null;
  currentBalance: number;
}

export interface FinancialAnalysis extends MonthlyData {
  currentBalance: number;
  trends: { year: number; month: number; label: string; income: number; expense: number; saving: number; balance: number }[];
  latestMovements: Movement[];
  documentsReadMaximum: number;
}

const money = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const periodKey = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}`;
const monthStart = (year: number, month: number) => `${periodKey(year, month)}-01`;
const monthEnd = (year: number, month: number) => `${periodKey(year, month)}-31`;

function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

function monthlyBalanceDelta(item: Movement) {
  if (item.type === 'income') return item.amount;
  if (item.type === 'expense' || item.type === 'purchase') return -item.amount;
  if (item.type === 'adjustment' && item.adjustment_direction === 'in') return item.amount;
  if (item.type === 'adjustment' && item.adjustment_direction === 'out') return -item.amount;
  return 0;
}

function summarize(rows: Movement[], categories: Category[], year: number, month: number, budget: Budget | null): MonthlySummary {
  const categoryMap = new Map(categories.map((item) => [item.id, item]));
  const categoryTotals = new Map<number, number>();
  const dayTotals = new Map<string, number>();
  const expenses: Movement[] = [];
  let totalIncome = 0;
  let totalExpense = 0;
  let balance = 0;
  let necessary = 0;
  let unnecessary = 0;

  rows.forEach((item) => {
    balance += monthlyBalanceDelta(item);
    if (item.type === 'income') totalIncome += item.amount;
    if (item.type !== 'expense' && item.type !== 'purchase') return;
    expenses.push(item);
    totalExpense += item.amount;
    categoryTotals.set(item.category_id, (categoryTotals.get(item.category_id) || 0) + item.amount);
    dayTotals.set(item.date, (dayTotals.get(item.date) || 0) + item.amount);
    if (item.is_necessary) necessary += item.amount;
    else unnecessary += item.amount;
  });

  const categoryExpenses = [...categoryTotals.entries()].map(([categoryId, amount]) => ({
    category_id: categoryId,
    category: categoryMap.get(categoryId)?.name || 'Sin categoria',
    color: categoryMap.get(categoryId)?.color || '#6B7280',
    amount
  })).sort((a, b) => b.amount - a.amount);
  const highestDay = [...dayTotals.entries()].map(([date, amount]) => ({ date, amount })).sort((a, b) => b.amount - a.amount)[0];
  const messages: string[] = [];
  if (!rows.length) messages.push('No existen movimientos registrados en este periodo.');
  if (!budget) messages.push('No se ha definido presupuesto ni meta de ahorro para este mes.');

  return {
    year,
    month,
    total_income: totalIncome,
    total_expense: totalExpense,
    balance,
    saving_amount: balance,
    saving_rate: totalIncome ? (balance / totalIncome) * 100 : null,
    expense_rate: totalIncome ? (totalExpense / totalIncome) * 100 : null,
    average_daily_expense: dayTotals.size ? totalExpense / dayTotals.size : 0,
    highest_expense_day: highestDay,
    top_expense_category: categoryExpenses[0],
    necessary_expenses: necessary,
    unnecessary_expenses: unnecessary,
    category_expenses: categoryExpenses,
    top_expenses: expenses.sort((a, b) => b.amount - a.amount).slice(0, 10).map((item) => ({ id: item.id, date: item.date, description: item.description, amount: item.amount, category_id: item.category_id })),
    budget,
    messages
  };
}

function variation(current: number, previous: number) {
  return { absolute: current - previous, percent: previous ? ((current - previous) / previous) * 100 : null };
}

function compare(current: MonthlySummary, previous: MonthlySummary) {
  if (!previous.total_income && !previous.total_expense) return { current, previous, message: 'No existe mes anterior para comparar.', expense_variation: null, income_variation: null, balance_variation: null, largest_category_increase: null };
  const previousCategories = new Map(previous.category_expenses.map((item) => [item.category_id, item.amount]));
  const largest = current.category_expenses
    .map((item) => ({ ...item, increase: item.amount - (previousCategories.get(item.category_id) || 0) }))
    .filter((item) => item.increase > 0)
    .sort((a, b) => b.increase - a.increase)[0] || null;
  return {
    current,
    previous,
    message: null,
    expense_variation: variation(current.total_expense, previous.total_expense),
    income_variation: variation(current.total_income, previous.total_income),
    balance_variation: variation(current.balance, previous.balance),
    largest_category_increase: largest
  };
}

function recommendations(summary: MonthlySummary, comparison: ReturnType<typeof compare>): Recommendation[] {
  const result: Recommendation[] = [];
  const top = summary.top_expense_category;
  if (summary.total_expense > summary.total_income && top) result.push({ title: 'Gastos por encima de ingresos', explanation: `Este mes los gastos superaron los ingresos por ${money(summary.total_expense - summary.total_income)}.`, affected_value: summary.total_expense - summary.total_income, suggested_action: `Revisa primero la categoria ${top.category}.`, level: 'critico' });
  if (top && summary.total_expense && top.amount / summary.total_expense > 0.3) result.push({ title: 'Gasto concentrado', explanation: `${top.category} representa ${((top.amount / summary.total_expense) * 100).toFixed(1)}% del gasto mensual.`, affected_value: top.amount, suggested_action: 'Define un limite semanal para esta categoria.', level: 'advertencia' });
  if (comparison.expense_variation?.percent != null && comparison.expense_variation.absolute > 0) result.push({ title: 'Aumento frente al mes anterior', explanation: `Los gastos aumentaron ${comparison.expense_variation.percent.toFixed(1)}%.`, affected_value: comparison.expense_variation.absolute, suggested_action: 'Compara los movimientos que explican el aumento.', level: 'advertencia' });
  if (summary.budget?.saving_goal) {
    const difference = summary.saving_amount - summary.budget.saving_goal;
    result.push({ title: difference >= 0 ? 'Meta de ahorro cumplida' : 'Meta de ahorro pendiente', explanation: difference >= 0 ? `Superaste la meta por ${money(difference)}.` : `Faltan ${money(Math.abs(difference))}.`, affected_value: Math.abs(difference), suggested_action: difference >= 0 ? 'Conserva el excedente.' : 'Separa el ahorro antes de gastar.', level: difference >= 0 ? 'positivo' : 'advertencia' });
  }
  if (!result.length && summary.total_income) result.push({ title: 'Mes bajo control', explanation: `El balance mensual es ${money(summary.balance)}.`, affected_value: summary.balance, suggested_action: 'Continua registrando cada movimiento.', level: 'positivo' });
  return result;
}

export async function loadFinancialDataset({ uid, accountId, year, month, trendMonths, categories, budget, currentBalance }: { uid: string; accountId: number; year: number; month: number; trendMonths: number; categories: Category[]; budget: Budget | null; currentBalance: number }): Promise<FinancialDataset> {
  const trendStart = shiftMonth(year, month, -(Math.max(trendMonths, 2) - 1));
  const previous = shiftMonth(year, month, -1);
  const start = trendStart.year < previous.year || (trendStart.year === previous.year && trendStart.month < previous.month) ? trendStart : previous;
  return perfMeasureAsync('firestore-financial-dataset', async () => {
    const [movements, latestMovements] = await Promise.all([
      movementsService.getAllByRange({ uid, accountId, startDate: monthStart(start.year, start.month), endDate: monthEnd(year, month) }),
      movementsService.getLatestMovements({ uid, accountId, count: 5 })
    ]);
    return { movements, latestMovements, categories, budget, currentBalance };
  });
}

export function calculateFinancialAnalysis({ dataset, year, month, trendMonths }: { dataset: FinancialDataset; year: number; month: number; trendMonths: number }): FinancialAnalysis {
  performance.mark('financial-analysis:start');
  const groups = new Map<string, Movement[]>();
  dataset.movements.forEach((item) => {
    const key = item.date.slice(0, 7);
    const group = groups.get(key) || [];
    group.push(item);
    groups.set(key, group);
  });
  const previousPeriod = shiftMonth(year, month, -1);
  const current = summarize(groups.get(periodKey(year, month)) || [], dataset.categories, year, month, dataset.budget);
  const previous = summarize(groups.get(periodKey(previousPeriod.year, previousPeriod.month)) || [], dataset.categories, previousPeriod.year, previousPeriod.month, null);
  const comparison = compare(current, previous);
  const trends = Array.from({ length: trendMonths }, (_, index) => shiftMonth(year, month, index - trendMonths + 1)).map((period) => {
    const summary = summarize(groups.get(periodKey(period.year, period.month)) || [], dataset.categories, period.year, period.month, period.year === year && period.month === month ? dataset.budget : null);
    return { year: period.year, month: period.month, label: periodKey(period.year, period.month), income: summary.total_income, expense: summary.total_expense, saving: summary.saving_amount, balance: summary.balance };
  });
  performance.mark('financial-analysis:end');
  performance.measure('financial-analysis', 'financial-analysis:start', 'financial-analysis:end');
  return {
    summary: current,
    comparison,
    recommendations: recommendations(current, comparison),
    currentBalance: dataset.currentBalance,
    trends,
    latestMovements: decorateMovements(dataset.latestMovements, dataset.categories),
    documentsReadMaximum: 2000 + 20 + dataset.categories.length + 2
  };
}

export const analyticsService = {
  async load(uid: string, accountId: number, year: number, month: number, trendMonths: number, categories: Category[], budget: Budget | null, currentBalance: number) {
    const dataset = await loadFinancialDataset({ uid, accountId, year, month, trendMonths, categories, budget, currentBalance });
    return perfMeasureAsync('financial-analysis-calculation', async () => calculateFinancialAnalysis({ dataset, year, month, trendMonths }));
  }
};
