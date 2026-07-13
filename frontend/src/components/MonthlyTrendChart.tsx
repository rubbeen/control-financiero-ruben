import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCompactCopAxis, formatCopTooltip } from '../utils/currency';

export { formatCompactCopAxis, formatCopTooltip } from '../utils/currency';

interface Props {
  data: { label: string; income: number; expense: number; balance: number }[];
  layoutEpoch?: number;
}

function formatMonthAxis(value: string) {
  const [year, month] = value.split('-').map(Number);
  if (!year || !month) return value;
  return new Intl.DateTimeFormat('es-CO', { month: 'short', year: '2-digit' }).format(new Date(year, month - 1, 1)).replace('.', '');
}

export default function MonthlyTrendChart({ data, layoutEpoch = 0 }: Props) {
  if (!data.length) return <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">No hay datos suficientes para esta comparacion.</div>;
  return (
    <div data-testid="monthly-trend-chart" className="h-60 w-full max-w-full min-w-0 overflow-hidden rounded-lg border border-border bg-white p-3">
      <ResponsiveContainer key={layoutEpoch} width="100%" height="100%" minWidth={0} minHeight={0}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <XAxis dataKey="label" tickFormatter={formatMonthAxis} tickLine={false} axisLine={false} tickMargin={8} minTickGap={12} />
          <YAxis tickFormatter={formatCompactCopAxis} tickLine={false} axisLine={false} width={64} tickMargin={8} allowDecimals={false} />
          <Tooltip formatter={(value) => formatCopTooltip(Number(value))} />
          <Line type="monotone" dataKey="income" stroke="#16A34A" strokeWidth={3} dot={false} name="Ingresos" isAnimationActive={false} />
          <Line type="monotone" dataKey="expense" stroke="#DC2626" strokeWidth={3} dot={false} name="Gastos" isAnimationActive={false} />
          <Line type="monotone" dataKey="balance" stroke="#2563EB" strokeWidth={3} dot={false} name="Balance" isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
