import { useMutation } from '@tanstack/react-query';
import { PlusCircle, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import UnsavedChangesGuard from '../components/UnsavedChangesGuard';
import { useCategories, useUid } from '../hooks/useFinanceQueries';
import { categoriesService } from '../services/categories';
import { queryClient, queryKeys } from '../services/queryClient';
import { CategoryType } from '../types/finance';

export default function Categories() {
  const uid = useUid();
  const categories = useCategories(true);
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('expense');
  const [dirty, setDirty] = useState(false);
  const [removeId, setRemoveId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.categories(uid) });
  const create = useMutation({ mutationFn: () => categoriesService.create({ name, type, color: type === 'income' ? '#16A34A' : '#DC2626', icon: 'Circle', active: true }, uid), onSuccess: async () => { setName(''); setDirty(false); setMessage('Categoria creada.'); await refresh(); } });
  const remove = useMutation({ mutationFn: (id: number) => categoriesService.remove(id, uid), onSuccess: async (result) => { setMessage(result.message); await refresh(); } });
  const submit = (event: FormEvent) => { event.preventDefault(); void create.mutateAsync(); };
  return <div className="space-y-4"><UnsavedChangesGuard dirty={dirty} /><ConfirmDialog open={removeId !== null} title="Eliminar o desactivar categoria" message="Si tiene movimientos se desactivara para conservar el historial." danger onCancel={() => setRemoveId(null)} onConfirm={() => { const id = removeId; setRemoveId(null); if (id) void remove.mutateAsync(id); }} /><h1 className="text-2xl font-bold">Categorias</h1><form onSubmit={submit} className="grid gap-3 rounded-lg border bg-white p-4 sm:grid-cols-[1fr_180px_auto]"><input required maxLength={80} className="min-w-0 rounded-lg border px-3 py-3" placeholder="Nombre" value={name} onChange={(event) => { setName(event.target.value); setDirty(true); }} /><select className="min-w-0 rounded-lg border px-3 py-3" value={type} onChange={(event) => { setType(event.target.value as CategoryType); setDirty(true); }}><option value="expense">Gasto</option><option value="income">Ingreso</option><option value="both">Mixta</option></select><button className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-semibold text-white"><PlusCircle className="h-4 w-4" /> Crear</button></form>{message && <p className="rounded-lg bg-green-50 p-3 text-income">{message}</p>}<div className="grid gap-2 md:grid-cols-2">{(categories.data || []).map((category) => <article key={category.id} className="flex min-w-0 items-center justify-between rounded-lg border bg-white p-3"><div className="min-w-0"><p className="truncate font-semibold">{category.name}</p><p className="text-xs text-muted">{category.type} · {category.active ? 'Activa' : 'Inactiva'}</p></div><button onClick={() => setRemoveId(category.id)} aria-label={`Eliminar ${category.name}`} className="touch-target flex-none rounded-lg bg-red-50 text-expense"><Trash2 className="h-4 w-4" /></button></article>)}</div></div>;
}
