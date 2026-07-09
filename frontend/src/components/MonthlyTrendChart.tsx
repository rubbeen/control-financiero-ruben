import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '../utils/currency';

interface Props {
  data: { label: string; income: number; expense: number; balance: number }[];
}

export default function MonthlyTrendChart({ data }: Props) {
  if (!data.length) return <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">No hay datos suficientes para esta comparacion.</div>;
  return (
    <div className="h-60 rounded-lg border border-border bg-white p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => `${Number(value) / 1000}k`} tickLine={false} axisLine={false} width={48} />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Line type="monotone" dataKey="income" stroke="#16A34A" strokeWidth={3} dot={false} name="Ingresos" />
          <Line type="monotone" dataKey="expense" stroke="#DC2626" strokeWidth={3} dot={false} name="Gastos" />
          <Line type="monotone" dataKey="balance" stroke="#2563EB" strokeWidth={3} dot={false} name="Balance" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
