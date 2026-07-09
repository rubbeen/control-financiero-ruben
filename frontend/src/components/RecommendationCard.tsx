import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Recommendation } from '../types/finance';
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
    <article className={`rounded-lg border p-4 ${meta.className}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5" />
        <div>
          <h3 className="font-semibold">{recommendation.title}</h3>
          <p className="mt-1 text-sm text-text">{recommendation.explanation}</p>
          <p className="mt-2 text-sm font-semibold">{formatCurrency(recommendation.affected_value)}</p>
          <p className="mt-1 text-xs text-muted">{recommendation.suggested_action}</p>
        </div>
      </div>
    </article>
  );
}
