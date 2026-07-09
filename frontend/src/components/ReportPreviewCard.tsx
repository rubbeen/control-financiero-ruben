import { Download, FileText } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface Props {
  title: string;
  income: number;
  expense: number;
  balance: number;
  onDownload: () => void;
}

export default function ReportPreviewCard({ title, income, expense, balance, onDownload }: Props) {
  return (
    <article className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="rounded-lg bg-blue-50 p-2 text-primary">
          <FileText className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <h3 className="font-semibold text-text">{title}</h3>
          <p className="mt-1 text-sm text-muted">Ingresos {formatCurrency(income)} · Gastos {formatCurrency(expense)} · Balance {formatCurrency(balance)}</p>
          <button onClick={onDownload} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">
            <Download className="h-4 w-4" /> Descargar PDF
          </button>
        </div>
      </div>
    </article>
  );
}
