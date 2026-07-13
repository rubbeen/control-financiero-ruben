import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCompactCopAxis, formatCurrency } from '../utils/currency';

interface Props {
  income: number;
  expense: number;
  layoutEpoch?: number;
}

export default function IncomeExpenseChart({ income, expense, layoutEpoch = 0 }: Props) {
  const data = [
    { name: 'Ingresos', value: income, fill: '#16A34A' },
    { name: 'Gastos', value: expense, fill: '#DC2626' }
  ];
  return (
    <div data-testid="income-expense-chart" className="h-56 w-full max-w-full min-w-0 overflow-hidden rounded-lg border border-border bg-white p-3">
      <ResponsiveContainer key={layoutEpoch} width="100%" height="100%" minWidth={0} minHeight={0}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => formatCompactCopAxis(Number(value))} tickLine={false} axisLine={false} width={68} tickMargin={6} allowDecimals={false} />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
