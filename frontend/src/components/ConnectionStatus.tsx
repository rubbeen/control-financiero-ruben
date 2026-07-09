import { AlertTriangle, CheckCircle, Cloud } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ConnectionStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!online) {
    return <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-purchase"><AlertTriangle className="h-3 w-3" /> Sin internet</span>;
  }

  return <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-income"><Cloud className="h-3 w-3" /> Firebase <CheckCircle className="h-3 w-3" /></span>;
}
