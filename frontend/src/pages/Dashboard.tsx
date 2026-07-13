import { Bot, Calendar, FileText, PieChart, PlusCircle, Settings, Target, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { lazy, Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountSelector from '../components/AccountSelector';
import BalanceCard from '../components/BalanceCard';
import ConnectionStatus from '../components/ConnectionStatus';
import DataSyncLoader from '../components/DataSyncLoader';
import EmptyState from '../components/EmptyState';
import MetricCard from '../components/MetricCard';
import MovementItem from '../components/MovementItem';
import InlineSyncStatus from '../components/InlineSyncStatus';
import QuickActionButton from '../components/QuickActionButton';
import RecommendationCard from '../components/RecommendationCard';
import { useFinancialAnalysis } from '../hooks/useFinanceQueries';
import { useAccount } from '../context/AccountContext';
import { handleFirestoreAccessError } from '../services/auth';
import { isFirebaseAccessError } from '../services/firebaseErrorPolicy';
import { resolveDashboardState } from '../services/dashboardState';
import type { Recommendation } from '../types/finance';
import { formatCurrency } from '../utils/currency';
import { currentYearMonth, monthName } from '../utils/dates';

const IncomeExpenseChart = lazy(() => import('../components/IncomeExpenseChart'));
const ExpenseCategoryChart = lazy(() => import('../components/ExpenseCategoryChart'));
const MonthlyTrendChart = lazy(() => import('../components/MonthlyTrendChart'));

declare global {
  interface Window { __CFR_E2E_RECOMMENDATION__?: Recommendation }
}

function ChartFallback() {
  return <div className="skeleton h-72 w-full" aria-label="Cargando grafica" />;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { year, month } = currentYearMonth();
  const accounts = useAccount();
  const financial = useFinancialAnalysis(year, month, 6);

  useEffect(() => {
    if (financial.error && isFirebaseAccessError(financial.error)) void handleFirestoreAccessError(financial.error);
  }, [financial.error]);

  const dashboardState = resolveDashboardState({ accountLoading: accounts.isLoading, accountError: accounts.isError, hasActiveAccount: accounts.activeAccount !== null, queryPending: financial.isPending, queryFetching: financial.fetchStatus === 'fetching', queryError: financial.isError, hasData: financial.data !== undefined });
  if (dashboardState === 'loading') return <DataSyncLoader message={accounts.activeAccount ? 'Calculando tu resumen...' : 'Preparando tus cuentas...'} />;
  if (dashboardState === 'error') return <section className="space-y-3 rounded-lg bg-orange-50 p-4 text-sm text-purchase" role="alert"><p>No pudimos actualizar tus datos. Revisa tu internet e intenta de nuevo.</p><button onClick={() => void financial.refetch()} className="min-h-12 rounded-lg bg-primary px-4 py-3 font-semibold text-white">Reintentar</button></section>;
  if (!financial.data) return <DataSyncLoader message="Sincronizando movimientos..." />;

  const data = financial.data;
  const summary = data.summary;
  const budgetUsed = summary.budget?.total_budget ? Math.min(999, (summary.total_expense / summary.budget.total_budget) * 100) : 0;
  const primaryRecommendation = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'
    ? window.__CFR_E2E_RECOMMENDATION__ || data.recommendations[0]
    : data.recommendations[0];

  return (
    <div className="w-full max-w-full min-w-0 space-y-5">
      <InlineSyncStatus isFetching={financial.isFetching} hasRefreshError={financial.isError} onRetry={() => void financial.refetch()} />
      <section className="flex w-full max-w-full min-w-0 items-start justify-between gap-3">
        <div className="min-w-0"><h1 className="break-words text-2xl font-bold text-text">Hola</h1><p className="flex items-center gap-1 text-sm capitalize text-muted"><Calendar className="h-4 w-4" /> {monthName(year, month)}</p></div>
        <div className="flex flex-none flex-col items-end gap-1"><ConnectionStatus /><button className="touch-target text-muted" onClick={() => navigate('/settings')} aria-label="Configuracion"><Settings className="h-5 w-5" /></button></div>
      </section>
      <AccountSelector />
      <BalanceCard currentBalance={data.currentBalance} monthlyBalance={summary.balance} income={summary.total_income} expense={summary.total_expense} />
      <section className="grid w-full max-w-full min-w-0 grid-cols-2 gap-3 md:grid-cols-5">
        <QuickActionButton label="Agregar gasto" icon={PlusCircle} tone="orange" onClick={() => navigate('/add?tipo=expense')} />
        <QuickActionButton label="Agregar ingreso" icon={TrendingUp} tone="green" onClick={() => navigate('/add?tipo=income')} />
        <QuickActionButton label="Asesor financiero" icon={Bot} tone="dark" onClick={() => navigate('/advisor')} />
        <QuickActionButton label="Ver reporte" icon={FileText} tone="blue" onClick={() => navigate('/reports')} />
        <QuickActionButton label="Presupuesto" icon={Target} tone="dark" onClick={() => navigate('/budget')} />
      </section>
      <section className="grid w-full max-w-full min-w-0 grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard title="Ingresos del mes" value={formatCurrency(summary.total_income)} icon={TrendingUp} tone="green" />
        <MetricCard title="Gastos del mes" value={formatCurrency(summary.total_expense)} icon={TrendingDown} tone="red" />
        <MetricCard title="Balance mensual" value={formatCurrency(summary.balance)} icon={Wallet} tone={summary.balance >= 0 ? 'green' : 'red'} />
        <MetricCard title="Presupuesto usado" value={`${budgetUsed.toFixed(0)}%`} icon={PieChart} tone={budgetUsed >= 80 ? 'orange' : 'blue'} />
      </section>
      <section className="grid w-full max-w-full min-w-0 gap-4 lg:grid-cols-3">
        <div className="w-full max-w-full min-w-0"><h2 className="mb-2 text-lg font-bold">Ingresos vs gastos</h2><Suspense fallback={<ChartFallback />}><IncomeExpenseChart income={summary.total_income} expense={summary.total_expense} /></Suspense></div>
        <div className="w-full max-w-full min-w-0"><h2 className="mb-2 text-lg font-bold">Gastos por categoria</h2><Suspense fallback={<ChartFallback />}><ExpenseCategoryChart data={summary.category_expenses} /></Suspense></div>
        <div className="w-full max-w-full min-w-0"><h2 className="mb-2 text-lg font-bold">Evolucion mensual</h2><Suspense fallback={<ChartFallback />}><MonthlyTrendChart data={data.trends} /></Suspense></div>
      </section>
      <section className="grid w-full max-w-full min-w-0 gap-4 lg:grid-cols-2">
        <div className="w-full max-w-full min-w-0"><h2 className="mb-2 text-lg font-bold">Ultimos movimientos</h2><div className="w-full max-w-full min-w-0 space-y-2">{data.latestMovements.length ? data.latestMovements.map((item) => <MovementItem key={item.id} movement={item} onClick={() => navigate(`/movements/${item.id}`)} />) : <EmptyState onAction={() => navigate('/add')} actionLabel="Agregar movimiento" />}</div></div>
        <div className="w-full max-w-full min-w-0"><h2 className="mb-2 text-lg font-bold">Recomendacion principal</h2>{primaryRecommendation ? <RecommendationCard recommendation={primaryRecommendation} /> : <EmptyState title="Sin recomendacion" message="Registra movimientos para recibir recomendaciones." />}</div>
      </section>
    </div>
  );
}
