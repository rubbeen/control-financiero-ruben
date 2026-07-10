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
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted">{title}</p>
          <p className="mt-1 break-words text-lg font-bold text-text sm:text-xl" title={value}>{value}</p>
          {variation && <p className="mt-1 text-xs text-muted">{variation}</p>}
        </div>
        <span className={`rounded-lg p-2 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
}
