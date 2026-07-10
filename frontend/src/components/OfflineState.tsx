import { WifiOff } from 'lucide-react';

export default function OfflineState() {
  return <p role="status" className="flex items-center gap-2 rounded-lg bg-orange-50 p-3 text-sm text-purchase"><WifiOff className="h-5 w-5" /> Sin internet. Conservamos la pantalla actual y reintentaremos cuando vuelvas a conectarte.</p>;
}
