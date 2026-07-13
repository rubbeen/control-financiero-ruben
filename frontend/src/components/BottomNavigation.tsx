import { BarChart3, Clock, Home, PlusCircle, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/add', label: 'Agregar', icon: PlusCircle },
  { to: '/history', label: 'Historial', icon: Clock },
  { to: '/analysis', label: 'Analisis', icon: BarChart3 },
  { to: '/settings', label: 'Ajustes', icon: Settings }
];

export default function BottomNavigation() {
  return (
    <nav aria-label="Navegacion principal" className="fixed inset-x-0 bottom-0 z-40 border-t border-orange-100 bg-white/95 pb-[env(safe-area-inset-bottom)] pl-[max(0.25rem,env(safe-area-inset-left))] pr-[max(0.25rem,env(safe-area-inset-right))] shadow-soft backdrop-blur">
      <div className="mx-auto grid max-w-xl grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          return <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `bottom-nav-link flex min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-1 text-[11px] min-[380px]:px-1 min-[380px]:text-xs ${isActive ? 'font-semibold text-primary' : 'text-muted'}`}><Icon className="h-5 w-5" /><span className="max-w-full break-words text-center leading-tight">{item.label}</span></NavLink>;
        })}
      </div>
    </nav>
  );
}
