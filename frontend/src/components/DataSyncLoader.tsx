import { RefreshCcw } from 'lucide-react';

export default function DataSyncLoader({ message = 'Sincronizando movimientos...' }: { message?: string }) {
  return (
    <section className="space-y-4" aria-live="polite" aria-busy="true" role="status">
      <div className="flex min-h-14 items-center gap-3 rounded-lg border border-orange-100 bg-white px-4 py-3 shadow-sm">
        <RefreshCcw className="h-5 w-5 flex-none animate-spin text-primary motion-reduce:animate-none" aria-hidden="true" />
        <p className="font-semibold text-text">{message}</p>
      </div>
      <div className="skeleton h-28 w-full" aria-hidden="true" />
      <div className="grid grid-cols-1 gap-3 min-[340px]:grid-cols-2" aria-hidden="true">
        <div className="skeleton h-24" />
        <div className="skeleton h-24" />
      </div>
      <div className="skeleton h-64 w-full" aria-hidden="true" />
    </section>
  );
}
