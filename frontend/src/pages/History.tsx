import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import MovementItem from '../components/MovementItem';
import { useAsync } from '../hooks/useAsync';
import { categoriesService } from '../services/categories';
import { movementsService } from '../services/movements';
import { formatCurrency } from '../utils/currency';
import { currentYearMonth } from '../utils/dates';
import { movementSignedAmount } from '../utils/calculations';
import AccountSelector from '../components/AccountSelector';

interface Props {
  setPage: (page: string) => void;
  openMovement: (id: number) => void;
}

export default function History({ setPage, openMovement }: Props) {
  const { year, month } = currentYearMonth();
  const [query, setQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(`${year}-${String(month).padStart(2, '0')}`);
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const movements = useAsync(() => movementsService.list(), []);
  const categories = useAsync(() => categoriesService.list(true), []);

  const filtered = useMemo(() => {
    return (movements.data || []).filter((item) => {
      const matchQuery = item.description.toLowerCase().includes(query.toLowerCase()) || (item.category_name || '').toLowerCase().includes(query.toLowerCase());
      const matchMonth = selectedMonth ? item.date.startsWith(selectedMonth) : true;
      const matchType = type ? item.type === type : true;
      const matchCategory = category ? item.category_id === Number(category) : true;
      return matchQuery && matchMonth && matchType && matchCategory;
    });
  }, [movements.data, query, selectedMonth, type, category]);

  const total = filtered.reduce((sum, item) => sum + movementSignedAmount(item), 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text">Historial</h1>
      <AccountSelector setPage={setPage} />
      <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted" />
          <input className="w-full rounded-lg border border-border py-3 pl-9 pr-3" placeholder="Buscar movimiento" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input type="month" className="rounded-lg border border-border px-3 py-3" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
          <select className="rounded-lg border border-border px-3 py-3" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Todos los tipos</option>
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
            <option value="purchase">Compras</option>
            <option value="transfer">Transferencias</option>
          </select>
          <select className="rounded-lg border border-border px-3 py-3" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Todas las categorias</option>
            {(categories.data || []).map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <p className="mt-3 text-sm font-semibold text-text">Total filtrado: {formatCurrency(total)}</p>
      </section>
      <div className="space-y-2">
        {movements.loading ? <p className="text-muted">Cargando informacion financiera...</p> : filtered.length ? filtered.map((item) => <MovementItem key={item.id} movement={item} onClick={() => openMovement(item.id)} />) : <EmptyState actionLabel="Agregar movimiento" onAction={() => setPage('add')} />}
      </div>
    </div>
  );
}
