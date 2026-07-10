import { FinancialAnalysis } from './analytics';
import { formatCurrency } from '../utils/currency';

export interface AdvisorInsight { title: string; detail: string; action: string; level: 'positivo' | 'advertencia' | 'critico'; amount?: number }
export interface AdvisorReport { generatedAt: string; headline: string; summary: string; insights: AdvisorInsight[] }

export function buildAdvisorReport(analysis: FinancialAnalysis): AdvisorReport {
  const current = analysis.summary;
  const previous = analysis.comparison.previous;
  const insights: AdvisorInsight[] = [{
    title: current.balance >= 0 ? 'Balance mensual positivo' : 'Alerta de deficit mensual',
    detail: `Ingresos ${formatCurrency(current.total_income)}, gastos ${formatCurrency(current.total_expense)} y balance ${formatCurrency(current.balance)}.`,
    action: current.balance >= 0 ? 'Separa primero la meta de ahorro.' : 'Deten compras no necesarias y revisa la categoria principal.',
    level: current.balance < 0 ? 'critico' : current.balance < 200000 ? 'advertencia' : 'positivo',
    amount: current.balance
  }];
  if (current.top_expense_category) {
    const percentage = current.total_expense ? current.top_expense_category.amount / current.total_expense * 100 : 0;
    insights.push({ title: `Mayor consumo: ${current.top_expense_category.category}`, detail: `${formatCurrency(current.top_expense_category.amount)}, el ${percentage.toFixed(1)}% de los gastos.`, action: percentage >= 35 ? 'Define un limite semanal para esta categoria.' : 'Continua monitoreando su participacion.', level: percentage >= 35 ? 'advertencia' : 'positivo', amount: current.top_expense_category.amount });
  }
  if (previous?.total_expense > 0) {
    const difference = current.total_expense - previous.total_expense;
    insights.push({ title: difference > 0 ? 'Gastos en aumento' : 'Gastos en descenso', detail: `La diferencia frente al mes anterior es ${formatCurrency(Math.abs(difference))}.`, action: difference > 0 ? 'Revisa que gastos nuevos se repetiran.' : 'Mantén las decisiones que redujeron el gasto.', level: difference > 0 ? 'advertencia' : 'positivo', amount: Math.abs(difference) });
  }
  if (current.highest_expense_day) insights.push({ title: 'Dia de mayor gasto', detail: `${current.highest_expense_day.date}: ${formatCurrency(current.highest_expense_day.amount)}.`, action: 'Anota si fue excepcional o debe presupuestarse.', level: current.highest_expense_day.amount > current.average_daily_expense * 2 ? 'advertencia' : 'positivo', amount: current.highest_expense_day.amount });
  if (!current.budget) insights.push({ title: 'Falta presupuesto mensual', detail: 'No hay limites definidos para este mes.', action: 'Crea presupuesto, meta de ahorro y limites por categoria.', level: 'advertencia' });
  return { generatedAt: new Date().toISOString(), headline: current.balance >= 0 ? 'Tu mes esta bajo control, con oportunidades de mejora.' : 'Tu mes necesita ajustes para recuperar el balance.', summary: `El asesor reviso ${analysis.latestMovements.length} movimientos recientes y el rango mensual y diario disponible en COP.`, insights };
}
