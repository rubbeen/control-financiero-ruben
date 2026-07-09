import { Budget, MonthlyData, MonthlySummary, Movement, Recommendation } from '../types/finance';
import { budgetsService } from './budgets';
import { categoriesService } from './categories';
import { movementsService } from './movements';

const expenseTypes = new Set(['expense', 'purchase', 'adjustment']);

function money(value: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
}

function previousMonth(year: number, month: number) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

function totals(rows: Movement[]) {
  const total_income = rows.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const total_expense = rows.filter((item) => expenseTypes.has(item.type)).reduce((sum, item) => sum + item.amount, 0);
  return { total_income, total_expense, balance: total_income - total_expense };
}

async function buildSummary(year: number, month: number): Promise<MonthlySummary> {
  const [rows, categories] = await Promise.all([movementsService.list(year, month), categoriesService.list(true)]);
  let budget: Budget | null = null;
  try {
    budget = await budgetsService.get(year, month);
  } catch {
    budget = null;
  }
  const base = totals(rows);
  const expenseRows = rows.filter((item) => expenseTypes.has(item.type));
  const expenseDays = new Set(expenseRows.map((item) => item.date));
  const byCategory = categories
    .map((category) => ({
      category_id: category.id,
      category: category.name,
      color: category.color || '#2563EB',
      amount: expenseRows.filter((item) => item.category_id === category.id).reduce((sum, item) => sum + item.amount, 0)
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const byDay = Array.from(expenseDays).map((day) => ({
    date: day,
    amount: expenseRows.filter((item) => item.date === day).reduce((sum, item) => sum + item.amount, 0)
  }));
  const highestDay = byDay.sort((a, b) => b.amount - a.amount)[0];
  const messages: string[] = [];
  if (!rows.length) messages.push('No existen movimientos registrados en este periodo.');
  if (!budget) {
    messages.push('No se ha definido presupuesto para este mes.');
    messages.push('No se ha definido meta de ahorro.');
  } else if (!budget.saving_goal) {
    messages.push('No se ha definido meta de ahorro.');
  }

  return {
    year,
    month,
    total_income: base.total_income,
    total_expense: base.total_expense,
    balance: base.balance,
    saving_amount: base.balance,
    saving_rate: base.total_income ? (base.balance / base.total_income) * 100 : null,
    expense_rate: base.total_income ? (base.total_expense / base.total_income) * 100 : null,
    average_daily_expense: expenseDays.size ? base.total_expense / expenseDays.size : 0,
    highest_expense_day: highestDay,
    top_expense_category: byCategory[0],
    necessary_expenses: expenseRows.filter((item) => item.is_necessary).reduce((sum, item) => sum + item.amount, 0),
    unnecessary_expenses: expenseRows.filter((item) => !item.is_necessary).reduce((sum, item) => sum + item.amount, 0),
    category_expenses: byCategory,
    top_expenses: expenseRows
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .map((item) => ({ id: item.id, date: item.date, description: item.description, amount: item.amount, category_id: item.category_id })),
    budget,
    messages
  };
}

function variation(current: number, previous: number) {
  return {
    absolute: current - previous,
    percent: previous ? ((current - previous) / previous) * 100 : null
  };
}

async function buildComparison(year: number, month: number) {
  const current = await buildSummary(year, month);
  const prev = previousMonth(year, month);
  const previous = await buildSummary(prev.year, prev.month);
  if (!previous.total_income && !previous.total_expense) {
    return { current, previous, message: 'No existe mes anterior para comparar.', expense_variation: null, income_variation: null, largest_category_increase: null };
  }
  const increases = current.category_expenses.map((item) => {
    const old = previous.category_expenses.find((prevItem) => prevItem.category_id === item.category_id)?.amount || 0;
    return { ...item, increase: item.amount - old };
  });
  return {
    current,
    previous,
    message: null,
    expense_variation: variation(current.total_expense, previous.total_expense),
    income_variation: variation(current.total_income, previous.total_income),
    balance_variation: variation(current.balance, previous.balance),
    largest_category_increase: increases.filter((item) => item.increase > 0).sort((a, b) => b.increase - a.increase)[0] || null
  };
}

async function buildRecommendations(year: number, month: number): Promise<Recommendation[]> {
  const summary = await buildSummary(year, month);
  const comparison = await buildComparison(year, month);
  const recs: Recommendation[] = [];
  const top = summary.top_expense_category;

  if (summary.total_expense > summary.total_income && top) {
    recs.push({
      title: 'Gastos por encima de ingresos',
      explanation: `Este mes tus gastos superaron tus ingresos por ${money(summary.total_expense - summary.total_income)}. Revisa principalmente la categoria ${top.category}.`,
      affected_value: summary.total_expense - summary.total_income,
      suggested_action: 'Reduce o aplaza gastos no necesarios antes de registrar nuevos compromisos.',
      level: 'critico'
    });
  }

  if (top && summary.total_expense) {
    const percent = (top.amount / summary.total_expense) * 100;
    if (percent > 30) {
      recs.push({
        title: 'Alta concentracion por categoria',
        explanation: `La categoria ${top.category} representa el ${percent.toFixed(1)}% de tus gastos del mes. Es tu mayor concentracion de consumo.`,
        affected_value: top.amount,
        suggested_action: 'Define un limite concreto para esta categoria y revisalo semanalmente.',
        level: 'advertencia'
      });
    }
  }

  const expenseVariation = comparison.expense_variation;
  if (expenseVariation?.percent !== null && expenseVariation?.percent !== undefined) {
    if (expenseVariation.absolute > 0) {
      recs.push({
        title: 'Aumento frente al mes anterior',
        explanation: `Tus gastos aumentaron ${expenseVariation.percent.toFixed(1)}% frente al mes anterior. La mayor variacion estuvo en la categoria ${comparison.largest_category_increase?.category || 'sin categoria identificada'}.`,
        affected_value: expenseVariation.absolute,
        suggested_action: 'Compara los movimientos de esa categoria y decide cuales no se repiten.',
        level: 'advertencia'
      });
    } else if (expenseVariation.absolute < 0) {
      recs.push({
        title: 'Reduccion de gastos',
        explanation: `Tus gastos disminuyeron ${Math.abs(expenseVariation.percent).toFixed(1)}% frente al mes anterior.`,
        affected_value: Math.abs(expenseVariation.absolute),
        suggested_action: 'Manten las decisiones que redujeron el gasto este mes.',
        level: 'positivo'
      });
    }
  }

  if (summary.budget?.saving_goal) {
    const diff = summary.saving_amount - summary.budget.saving_goal;
    recs.push({
      title: diff >= 0 ? 'Meta de ahorro cumplida' : 'Meta de ahorro pendiente',
      explanation: diff >= 0 ? `Cumpliste tu meta de ahorro. Superaste la meta por ${money(diff)}.` : `No alcanzaste tu meta de ahorro. Te faltaron ${money(Math.abs(diff))} para cumplirla.`,
      affected_value: Math.abs(diff),
      suggested_action: diff >= 0 ? 'Conserva este excedente como ahorro o fondo de emergencia.' : 'Separa primero el ahorro al recibir ingresos y ajusta gastos variables.',
      level: diff >= 0 ? 'positivo' : 'advertencia'
    });
  }

  if (summary.budget?.unnecessary_expense_limit) {
    const extra = summary.unnecessary_expenses - summary.budget.unnecessary_expense_limit;
    if (extra > 0) {
      recs.push({
        title: 'Gastos no necesarios sobre el limite',
        explanation: `Tus gastos no necesarios superaron el limite definido por ${money(extra)}.`,
        affected_value: extra,
        suggested_action: 'Congela compras no necesarias hasta volver al limite.',
        level: 'advertencia'
      });
    }
  }

  if (!recs.length && summary.total_income) {
    recs.push({
      title: 'Mes bajo control',
      explanation: `Tu balance actual es ${money(summary.balance)} con ingresos reales por ${money(summary.total_income)}.`,
      affected_value: summary.balance,
      suggested_action: 'Continua registrando movimientos para mejorar el analisis.',
      level: 'positivo'
    });
  }

  return recs;
}

export const analyticsService = {
  summary: buildSummary,
  async monthly(year: number, month: number): Promise<MonthlyData> {
    return {
      summary: await buildSummary(year, month),
      comparison: await buildComparison(year, month),
      recommendations: await buildRecommendations(year, month)
    };
  },
  comparison: buildComparison,
  async trends(months = 6) {
    const now = new Date();
    const result = [];
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    for (let index = 0; index < months; index += 1) {
      const summary = await buildSummary(year, month);
      result.push({ year, month, label: `${year}-${String(month).padStart(2, '0')}`, income: summary.total_income, expense: summary.total_expense, saving: summary.saving_amount, balance: summary.balance });
      const prev = previousMonth(year, month);
      year = prev.year;
      month = prev.month;
    }
    return result.reverse();
  },
  recommendations: buildRecommendations
};
