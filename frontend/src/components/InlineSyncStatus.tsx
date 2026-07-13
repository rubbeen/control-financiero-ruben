import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function InlineSyncStatus({ isFetching, hasRefreshError, onRetry }: { isFetching: boolean; hasRefreshError: boolean; onRetry: () => void }) {
  if (isFetching) {
    return <p role="status" aria-live="polite" className="flex min-h-11 items-center gap-2 rounded-lg bg-blue-50 px-3 text-sm font-medium text-primary"><RefreshCcw className="h-4 w-4 animate-spin motion-reduce:animate-none" /> Actualizando...</p>;
  }
  if (hasRefreshError) {
    return <div role="status" className="flex flex-wrap items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm text-purchase"><AlertTriangle className="h-4 w-4 flex-none" /><span className="flex-1">Mostrando la ultima informacion disponible.</span><button type="button" onClick={onRetry} className="min-h-11 rounded-lg px-3 font-semibold underline">Reintentar</button></div>;
  }
  return null;
}
