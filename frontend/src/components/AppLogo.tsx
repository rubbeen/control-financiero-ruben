import { Landmark, Sparkles } from 'lucide-react';

export default function AppLogo() {
  return (
    <div className="relative flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-cocoa via-copper to-purchase shadow-soft">
      <div className="absolute inset-1 rounded-xl border border-white/25" />
      <Landmark className="h-6 w-6 text-amber-100" />
      <span className="absolute -bottom-1 -right-1 rounded-full bg-income p-1 text-white shadow-sm">
        <Sparkles className="h-3 w-3" />
      </span>
    </div>
  );
}
