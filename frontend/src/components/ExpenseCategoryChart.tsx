import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../utils/currency';

interface Props {
  data: { category: string; amount: number; color?: string }[];
  layoutEpoch?: number;
}

export default function ExpenseCategoryChart({ data, layoutEpoch = 0 }: Props) {
  if (!data.length) return <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">No hay gastos por categoria.</div>;
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const visibleItems = data.slice(0, 8);

  return (
    <div data-testid="expense-category-chart" className="w-full max-w-full min-w-0 rounded-lg border border-border bg-white p-3">
      <div className="h-56 w-full max-w-full min-w-0 overflow-hidden">
        <ResponsiveContainer key={layoutEpoch} width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart>
            <Pie data={data} dataKey="amount" nameKey="category" innerRadius={55} outerRadius={88} paddingAngle={3} isAnimationActive={false}>
              {data.map((item) => (
                <Cell key={item.category} fill={item.color || '#2563EB'} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 space-y-2">
        {visibleItems.map((item) => {
          const percent = total ? (item.amount / total) * 100 : 0;
          return (
            <div key={item.category} className="grid min-w-0 gap-1 rounded-lg bg-slate-50 px-3 py-2 min-[380px]:grid-cols-[minmax(0,1fr)_max-content] min-[380px]:gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-3 w-3 flex-none rounded-full" style={{ backgroundColor: item.color || '#2563EB' }} />
                <span className="min-w-0 break-words text-sm font-semibold text-text">{item.category}</span>
              </div>
              <div className="min-w-0 text-right">
                <p className="break-words text-sm font-bold text-text">{formatCurrency(item.amount)}</p>
                <p className="text-xs text-muted">{percent.toFixed(1)}%</p>
              </div>
            </div>
          );
        })}
        {data.length > visibleItems.length && (
          <p className="px-1 text-xs text-muted">Hay {data.length - visibleItems.length} categorias adicionales. Revisa el detalle en el historial.</p>
        )}
      </div>
    </div>
  );
}
