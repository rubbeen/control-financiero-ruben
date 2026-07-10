import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { Recommendation } from '../types/finance';
import { formatCurrency } from '../utils/currency';

interface Props {
  recommendation: Recommendation;
}

const levels = {
  positivo: { icon: CheckCircle, className: 'border-green-200 bg-green-50 text-income' },
  advertencia: { icon: AlertTriangle, className: 'border-orange-200 bg-orange-50 text-purchase' },
  critico: { icon: Info, className: 'border-red-200 bg-red-50 text-expense' }
};

export default function RecommendationCard({ recommendation }: Props) {
  const meta = levels[recommendation.level];
  const Icon = meta.icon;
  return (
    <article data-testid="recommendation-card" className={`h-auto w-full max-w-full min-w-0 rounded-lg border p-4 ${meta.className}`}>
      <div className="grid min-w-0 grid-cols-[24px_minmax(0,1fr)] items-start gap-2">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <h3 data-testid="recommendation-title" className="min-w-0 max-w-full whitespace-normal break-words font-semibold leading-5 [overflow-wrap:anywhere]">{recommendation.title}</h3>
      </div>
      <div className="mt-2 w-full max-w-full min-w-0">
        <p data-testid="recommendation-explanation" className="max-w-full whitespace-normal break-words text-sm leading-5 text-text [overflow-wrap:anywhere]">{recommendation.explanation}</p>
        <p data-testid="recommendation-amount" className="mt-2 max-w-full whitespace-nowrap text-sm font-semibold tabular-nums">{formatCurrency(recommendation.affected_value)}</p>
        <p data-testid="recommendation-action" className="mt-2 max-w-full whitespace-normal break-words text-xs leading-5 text-muted [overflow-wrap:anywhere]">{recommendation.suggested_action}</p>
      </div>
    </article>
  );
}
