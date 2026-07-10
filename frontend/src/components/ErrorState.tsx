import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ message = 'No pudimos completar esta accion.', onRetry }: { message?: string; onRetry?: () => void }) {
  return <section role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-expense"><div className="flex gap-2"><AlertTriangle className="h-5 w-5 flex-none" /><p>{message}</p></div>{onRetry && <button onClick={onRetry} className="mt-3 min-h-11 rounded-lg border border-expense px-4 font-semibold">Reintentar</button>}</section>;
}
