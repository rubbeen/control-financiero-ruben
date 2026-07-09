import { Bot, Calendar, FileText, PieChart, PlusCircle, Settings, Target, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import BalanceCard from '../components/BalanceCard';
import ConnectionStatus from '../components/ConnectionStatus';
import EmptyState from '../components/EmptyState';
import ExpenseCategoryChart from '../components/ExpenseCategoryChart';
import IncomeExpenseChart from '../components/IncomeExpenseChart';
import MetricCard from '../components/MetricCard';
import MonthlyTrendChart from '../components/MonthlyTrendChart';
import MovementItem from '../components/MovementItem';
import QuickActionButton from '../components/QuickActionButton';
import RecommendationCard from '../components/RecommendationCard';
import AccountSelector from '../components/AccountSelector';
import { analyticsService } from '../services/analytics';
import { movementsService } from '../services/movements';
import { useAsync } from '../hooks/useAsync';
import { formatCurrency } from '../utils/currency';
import { currentYearMonth, monthName } from '../utils/dates';

interface Props {
  setPage: (page: string) => void;
  openMovement: (id: number) => void;
}

export default function Dashboard({ setPage, openMovement }: Props) {
  const { year, month } = currentYearMonth();
  const monthly = useAsync(() => analyticsService.monthly(year, month), [year, month]);
  const trends = useAsync(() => analyticsService.trends(6), []);
  const movements = useAsync(() => movementsService.list(), []);

  if (monthly.loading) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-muted">Cargando informacion financiera...</p>
        <button onClick={() => setPage('settings')} className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">
          Ver configuracion
        </button>
      </div>
    );
  }

  if (monthly.error) {
    return (
      <div className="space-y-3 rounded-lg bg-orange-50 p-4 text-sm text-purchase">
        <p>No se pudo conectar con Firebase. Verifica que el celular tenga internet y que Firestore este activo.</p>
        <p className="text-xs text-muted">{monthly.error}</p>
        <button onClick={() => setPage('settings')} className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">
          Ir a Ajustes
        </button>
      </div>
    );
  }

  const data = monthly.data!;
  const summary = data.summary;
  const latest = (movements.data || []).slice(0, 5);
  const budgetUsed = summary.budget?.total_budget ? (summary.total_expense / summary.budget.total_budget) * 100 : 0;

  return (
    <div className="space-y-5">
      <section className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">Hola, Ruben</h1>
          <p className="flex items-center gap-1 text-sm capitalize text-muted"><Calendar className="h-4 w-4" /> {monthName(year, month)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ConnectionStatus />
          <button className="text-muted" onClick={() => setPage('settings')} title="Configuracion"><Settings className="h-5 w-5" /></button>
        </div>
      </section>

      <AccountSelector setPage={setPage} />

      <BalanceCard currentBalance={summary.balance} monthlyBalance={summary.balance} income={summary.total_income} expense={summary.total_expense} />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <QuickActionButton label="Agregar gasto" icon={PlusCircle} tone="orange" onClick={() => setPage('add')} />
        <QuickActionButton label="Agregar ingreso" icon={TrendingUp} tone="green" onClick={() => setPage('add')} />
        <QuickActionButton label="Analisis IA" icon={Bot} tone="dark" onClick={() => setPage('advisor')} />
        <QuickActionButton label="Ver reporte" icon={FileText} tone="blue" onClick={() => setPage('reports')} />
        <QuickActionButton label="Presupuesto" icon={Target} tone="dark" onClick={() => setPage('budget')} />
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard title="Ingresos del mes" value={formatCurrency(summary.total_income)} icon={TrendingUp} tone="green" />
        <MetricCard title="Gastos del mes" value={formatCurrency(summary.total_expense)} icon={TrendingDown} tone="red" />
        <MetricCard title="Ahorro real" value={formatCurrency(summary.saving_amount)} icon={Wallet} tone={summary.saving_amount >= 0 ? 'green' : 'red'} />
        <MetricCard title="Presupuesto usado" value={`${budgetUsed.toFixed(0)}%`} icon={PieChart} tone={budgetUsed > 90 ? 'orange' : 'blue'} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h2 className="mb-2 text-lg font-bold text-text">Ingresos vs gastos</h2>
          <IncomeExpenseChart income={summary.total_income} expense={summary.total_expense} />
        </div>
        <div className="lg:col-span-1">
          <h2 className="mb-2 text-lg font-bold text-text">Gastos por categoria</h2>
          <ExpenseCategoryChart data={summary.category_expenses} />
        </div>
        <div className="lg:col-span-1">
          <h2 className="mb-2 text-lg font-bold text-text">Evolucion mensual</h2>
          <MonthlyTrendChart data={trends.data || []} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-lg font-bold text-text">Ultimos movimientos</h2>
          <div className="space-y-2">
            {latest.length ? latest.map((item) => <MovementItem key={item.id} movement={item} onClick={() => openMovement(item.id)} />) : <EmptyState onAction={() => setPage('add')} actionLabel="Agregar movimiento" />}
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-bold text-text">Recomendacion principal</h2>
          {data.recommendations[0] ? <RecommendationCard recommendation={data.recommendations[0]} /> : <EmptyState title="Sin recomendacion" message="Registra movimientos para generar recomendaciones con numeros reales." />}
        </div>
      </section>
    </div>
  );
}
