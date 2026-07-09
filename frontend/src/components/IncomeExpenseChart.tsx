import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '../utils/currency';

interface Props {
  income: number;
  expense: number;
}

export default function IncomeExpenseChart({ income, expense }: Props) {
  const data = [
    { name: 'Ingresos', value: income, fill: '#16A34A' },
    { name: 'Gastos', value: expense, fill: '#DC2626' }
  ];
  return (
    <div className="h-56 rounded-lg border border-border bg-white p-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => `${Number(value) / 1000}k`} tickLine={false} axisLine={false} width={48} />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
