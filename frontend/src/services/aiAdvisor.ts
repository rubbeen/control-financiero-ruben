import { analyticsService } from './analytics';
import { movementsService } from './movements';
import { budgetsService } from './budgets';
import { formatCurrency } from '../utils/currency';

export interface AdvisorInsight {
  title: string;
  detail: string;
  action: string;
  level: 'positivo' | 'advertencia' | 'critico';
  amount?: number;
}

export interface AdvisorReport {
  generatedAt: string;
  headline: string;
  summary: string;
  insights: AdvisorInsight[];
}

function previousMonth(year: number, month: number) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

function levelFromBalance(balance: number): AdvisorInsight['level'] {
  if (balance < 0) return 'critico';
  if (balance < 200000) return 'advertencia';
  return 'positivo';
}

export async function generateAdvisorReport(year: number, month: number): Promise<AdvisorReport> {
  const [monthly, allMovements, budgets] = await Promise.all([
    analyticsService.monthly(year, month),
    movementsService.list(year, month),
    budgetsService.list()
  ]);
  const summary = monthly.summary;
  const prev = previousMonth(year, month);
  const previous = await analyticsService.summary(prev.year, prev.month);
  const insights: AdvisorInsight[] = [];
  const expenseRows = allMovements.filter((item) => ['expense', 'purchase', 'adjustment'].includes(item.type));

  insights.push({
    title: summary.balance >= 0 ? 'Balance mensual positivo' : 'Alerta de deficit mensual',
    detail: `En este mes registraste ${formatCurrency(summary.total_income)} en ingresos y ${formatCurrency(summary.total_expense)} en gastos. Tu balance es ${formatCurrency(summary.balance)}.`,
    action: summary.balance >= 0 ? 'Mantén este margen y separa una parte fija para ahorro antes de gastar.' : 'Detén compras no necesarias y revisa la categoria con mayor gasto antes de seguir gastando.',
    level: levelFromBalance(summary.balance),
    amount: summary.balance
  });

  if (summary.top_expense_category) {
    const pct = summary.total_expense ? (summary.top_expense_category.amount / summary.total_expense) * 100 : 0;
    insights.push({
      title: `Mayor consumo: ${summary.top_expense_category.category}`,
      detail: `Esta categoria suma ${formatCurrency(summary.top_expense_category.amount)}, equivalente al ${pct.toFixed(1)}% de tus gastos del mes.`,
      action: pct > 35 ? 'Ponle un limite semanal y revisa cada movimiento de esa categoria.' : 'Sigue monitoreandola para que no concentre demasiado tu presupuesto.',
      level: pct > 35 ? 'advertencia' : 'positivo',
      amount: summary.top_expense_category.amount
    });
  }

  if (previous.total_expense > 0) {
    const diff = summary.total_expense - previous.total_expense;
    const pct = (diff / previous.total_expense) * 100;
    insights.push({
      title: diff > 0 ? 'Tus gastos subieron frente al mes anterior' : 'Tus gastos bajaron frente al mes anterior',
      detail: `${diff > 0 ? 'Aumentaron' : 'Disminuyeron'} ${Math.abs(pct).toFixed(1)}%, una diferencia de ${formatCurrency(Math.abs(diff))}.`,
      action: diff > 0 ? 'Identifica que gasto nuevo apareció este mes y decide si se repite.' : 'Repite las decisiones que ayudaron a bajar el gasto.',
      level: diff > 0 ? 'advertencia' : 'positivo',
      amount: Math.abs(diff)
    });
  }

  const dailyTotals = expenseRows.reduce<Record<string, number>>((acc, item) => {
    acc[item.date] = (acc[item.date] || 0) + item.amount;
    return acc;
  }, {});
  const highestDay = Object.entries(dailyTotals).sort((a, b) => b[1] - a[1])[0];
  if (highestDay) {
    insights.push({
      title: 'Dia de mayor gasto',
      detail: `El dia ${highestDay[0]} gastaste ${formatCurrency(highestDay[1])}. Ese dia pesa fuerte dentro del mes.`,
      action: 'Cuando tengas un dia alto, anota la razon. Si fue extraordinario, no lo repitas; si fue necesario, presupuestalo.',
      level: highestDay[1] > summary.average_daily_expense * 2 ? 'advertencia' : 'positivo',
      amount: highestDay[1]
    });
  }

  const smallExpenses = expenseRows.filter((item) => item.amount <= 30000);
  const smallTotal = smallExpenses.reduce((sum, item) => sum + item.amount, 0);
  if (smallExpenses.length >= 3) {
    insights.push({
      title: 'Gastos pequenos acumulados',
      detail: `Detecte ${smallExpenses.length} gastos de hasta ${formatCurrency(30000)} que juntos suman ${formatCurrency(smallTotal)}.`,
      action: 'Define un cupo semanal para gastos pequenos. En Colombia estos gastos diarios se vuelven fuga de dinero muy rapido.',
      level: smallTotal > 120000 ? 'advertencia' : 'positivo',
      amount: smallTotal
    });
  }

  if (summary.budget?.saving_goal) {
    const gap = summary.saving_amount - summary.budget.saving_goal;
    insights.push({
      title: gap >= 0 ? 'Meta de ahorro cumplida' : 'Meta de ahorro en riesgo',
      detail: gap >= 0 ? `Superaste tu meta por ${formatCurrency(gap)}.` : `Te faltan ${formatCurrency(Math.abs(gap))} para cumplir tu meta de ahorro.`,
      action: gap >= 0 ? 'Conserva ese excedente como fondo de emergencia.' : 'Separa el ahorro apenas recibas ingresos y reduce gastos no necesarios.',
      level: gap >= 0 ? 'positivo' : 'advertencia',
      amount: Math.abs(gap)
    });
  } else if (!budgets.length) {
    insights.push({
      title: 'Falta presupuesto mensual',
      detail: 'No tienes un presupuesto definido. Sin limite mensual, es mas dificil saber si vas bien o mal.',
      action: 'Crea un presupuesto total, una meta de ahorro y un limite de gastos no necesarios.',
      level: 'advertencia'
    });
  }

  const headline = summary.balance >= 0 ? 'Tu mes va bajo control, pero hay oportunidades de optimizar.' : 'Tu mes necesita ajuste inmediato para recuperar balance.';
  const summaryText = `Analice tus movimientos diarios y mensuales en COP. Encontré ${insights.length} puntos importantes para ayudarte a decidir mejor antes de gastar.`;

  return {
    generatedAt: new Date().toISOString(),
    headline,
    summary: summaryText,
    insights
  };
}
