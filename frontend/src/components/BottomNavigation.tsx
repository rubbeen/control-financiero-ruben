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
    <nav aria-label="Navegacion principal" className="fixed inset-x-0 bottom-0 z-40 border-t border-orange-100 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-soft backdrop-blur">
      <div className="mx-auto grid max-w-xl grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          return <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 text-xs ${isActive ? 'font-semibold text-primary' : 'text-muted'}`}><Icon className="h-5 w-5" /><span className="truncate">{item.label}</span></NavLink>;
        })}
      </div>
    </nav>
  );
}
