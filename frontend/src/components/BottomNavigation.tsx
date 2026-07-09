import { BarChart3, Bot, Clock, Home, PlusCircle, Settings } from 'lucide-react';

interface Props {
  page: string;
  setPage: (page: string) => void;
}

const items = [
  { page: 'dashboard', label: 'Inicio', icon: Home },
  { page: 'add', label: 'Agregar', icon: PlusCircle },
  { page: 'history', label: 'Historial', icon: Clock },
  { page: 'advisor', label: 'IA', icon: Bot },
  { page: 'analysis', label: 'Analisis', icon: BarChart3 },
  { page: 'settings', label: 'Ajustes', icon: Settings }
];

export default function BottomNavigation({ page, setPage }: Props) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-orange-100 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-soft backdrop-blur">
      <div className="mx-auto grid max-w-xl grid-cols-6">
        {items.map((item) => {
          const Icon = item.icon;
          const active = page === item.page;
          return (
            <button key={item.page} onClick={() => setPage(item.page)} className={`flex flex-col items-center gap-1 px-1 py-3 text-[11px] ${active ? 'font-semibold text-primary' : 'text-muted'}`}>
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
