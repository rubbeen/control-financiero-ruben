import { PlusCircle } from 'lucide-react';

interface Props {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ title = 'Sin datos', message = 'No hay movimientos registrados. Agrega tu primer movimiento.', actionLabel, onAction }: Props) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-white p-6 text-center">
      <PlusCircle className="mx-auto h-10 w-10 text-primary" />
      <h3 className="mt-3 text-lg font-semibold text-text">{title}</h3>
      <p className="mt-1 text-sm text-muted">{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="mt-4 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
