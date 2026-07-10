import { useInfiniteQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountSelector from '../components/AccountSelector';
import EmptyState from '../components/EmptyState';
import MovementItem from '../components/MovementItem';
import { useAccount } from '../context/AccountContext';
import { useCategories, useUid } from '../hooks/useFinanceQueries';
import { decorateMovements, MovementCursor, movementsService } from '../services/movements';
import { queryKeys } from '../services/queryClient';
import { MovementType } from '../types/finance';
import { movementSignedAmount } from '../utils/calculations';
import { formatCurrency } from '../utils/currency';
import { currentYearMonth } from '../utils/dates';

export default function History() {
  const navigate = useNavigate();
  const uid = useUid();
  const { activeAccountId } = useAccount();
  const current = currentYearMonth();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(`${current.year}-${String(current.month).padStart(2, '0')}`);
  const [type, setType] = useState<MovementType | ''>('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const categories = useCategories(true);
  const filters = useMemo(() => ({ startDate: `${selectedMonth}-01`, endDate: `${selectedMonth}-31`, type: type || undefined, categoryId, pageSize: 50 }), [selectedMonth, type, categoryId]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const movements = useInfiniteQuery({
    queryKey: queryKeys.movements(uid, activeAccountId, filters),
    initialPageParam: null as MovementCursor | null,
    queryFn: ({ pageParam }) => movementsService.getMovementsByRange({ uid, accountId: activeAccountId, filters, cursor: pageParam as MovementCursor | null }),
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.cursor : undefined,
    staleTime: 30_000
  });

  const loaded = useMemo(() => movements.data?.pages.flatMap((page) => page.items) || [], [movements.data]);
  const decorated = useMemo(() => decorateMovements(loaded, categories.data || []), [loaded, categories.data]);
  const filtered = debouncedSearch ? decorated.filter((item) => item.description.toLowerCase().includes(debouncedSearch) || item.category_name?.toLowerCase().includes(debouncedSearch)) : decorated;
  const total = filtered.reduce((sum, item) => sum + movementSignedAmount(item), 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text">Historial</h1>
      <AccountSelector />
      <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted" /><input className="w-full rounded-lg border border-border py-3 pl-9 pr-3" placeholder="Buscar en los movimientos cargados" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input type="month" className="min-w-0 rounded-lg border border-border px-3 py-3" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} />
          <select className="min-w-0 rounded-lg border border-border px-3 py-3" value={type} onChange={(event) => setType(event.target.value as MovementType | '')}><option value="">Todos los tipos</option><option value="income">Ingresos</option><option value="expense">Gastos</option><option value="purchase">Compras</option><option value="transfer">Transferencias</option><option value="adjustment">Ajustes</option></select>
          <select className="min-w-0 rounded-lg border border-border px-3 py-3" value={categoryId || ''} onChange={(event) => setCategoryId(event.target.value ? Number(event.target.value) : undefined)}><option value="">Todas las categorias</option>{(categories.data || []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        </div>
        <p className="mt-3 text-sm font-semibold">Total visible: {formatCurrency(total)} · {loaded.length} cargados</p>
      </section>
      {movements.isLoading ? <div className="space-y-2"><div className="skeleton h-20" /><div className="skeleton h-20" /><div className="skeleton h-20" /></div> : filtered.length ? <div className="space-y-2">{filtered.map((item) => <MovementItem key={item.id} movement={item} onClick={() => navigate(`/movements/${item.id}`)} />)}</div> : <EmptyState actionLabel="Agregar movimiento" onAction={() => navigate('/add')} />}
      {movements.hasNextPage && <button disabled={movements.isFetchingNextPage} onClick={() => void movements.fetchNextPage()} className="w-full rounded-lg border border-primary bg-white px-4 py-3 font-semibold text-primary disabled:opacity-60">{movements.isFetchingNextPage ? 'Cargando...' : 'Cargar mas'}</button>}
      {movements.isError && <button onClick={() => void movements.refetch()} className="w-full rounded-lg bg-red-50 p-3 text-expense">No se pudo cargar. Toca para reintentar.</button>}
    </div>
  );
}
