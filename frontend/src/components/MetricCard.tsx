import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string;
  icon: LucideIcon;
  variation?: string;
  tone?: 'green' | 'red' | 'blue' | 'orange';
}

const toneClasses = {
  green: 'bg-green-50 text-income',
  red: 'bg-red-50 text-expense',
  blue: 'bg-blue-50 text-primary',
  orange: 'bg-orange-50 text-purchase'
};

export default function MetricCard({ title, value, icon: Icon, variation, tone = 'blue' }: Props) {
  return (
    <article className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{title}</p>
          <p className="mt-1 text-xl font-bold text-text">{value}</p>
          {variation && <p className="mt-1 text-xs text-muted">{variation}</p>}
        </div>
        <span className={`rounded-lg p-2 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
}
