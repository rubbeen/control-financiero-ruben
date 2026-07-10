import { useIsFetching, useIsMutating, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, RefreshCcw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ConnectionStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [hasError, setHasError] = useState(false);
  const fetching = useIsFetching();
  const mutating = useIsMutating();
  const queryClient = useQueryClient();

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    const unsubscribe = queryClient.getQueryCache().subscribe(() => setHasError(queryClient.getQueryCache().getAll().some((query) => query.state.status === 'error')));
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      unsubscribe();
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, [queryClient]);

  if (!online) return <span className="status-pill bg-orange-50 text-purchase"><AlertTriangle className="h-3 w-3" /> Sin internet</span>;
  if (hasError) return <span className="status-pill bg-red-50 text-expense"><AlertTriangle className="h-3 w-3" /> Error al sincronizar</span>;
  if (mutating) return <span className="status-pill bg-blue-50 text-primary"><Save className="h-3 w-3" /> Guardando</span>;
  if (fetching) return <span className="status-pill bg-blue-50 text-primary"><RefreshCcw className="h-3 w-3 animate-spin" /> Actualizando</span>;
  return <span className="status-pill bg-green-50 text-income"><CheckCircle className="h-3 w-3" /> Sincronizado</span>;
}
