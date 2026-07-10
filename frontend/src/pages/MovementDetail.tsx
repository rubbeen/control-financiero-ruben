import { useMutation, useQuery } from '@tanstack/react-query';
import { Save, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import UnsavedChangesGuard from '../components/UnsavedChangesGuard';
import { useCategories, useUid } from '../hooks/useFinanceQueries';
import { movementsService } from '../services/movements';
import { queryClient, queryKeys } from '../services/queryClient';
import { Movement } from '../types/finance';

export default function MovementDetail() {
  const navigate = useNavigate();
  const uid = useUid();
  const id = Number(useParams().id);
  const categories = useCategories(true);
  const movementQuery = useQuery({ queryKey: queryKeys.movement(uid, id), queryFn: () => movementsService.get(id, uid), staleTime: 30_000, enabled: Number.isInteger(id) && id > 0 });
  const [movement, setMovement] = useState<Movement | null>(null);
  const [dirty, setDirty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => { if (movementQuery.data && !dirty) setMovement(movementQuery.data); }, [movementQuery.data, dirty]);

  const invalidate = async (accountId: number) => Promise.all([
    queryClient.invalidateQueries({ queryKey: ['financialAnalysis', uid, accountId] }),
    queryClient.invalidateQueries({ queryKey: ['movements', uid, accountId] }),
    queryClient.invalidateQueries({ queryKey: ['accounts', uid] }),
    queryClient.invalidateQueries({ queryKey: queryKeys.movement(uid, id) })
  ]);
  const save = useMutation({ mutationFn: () => movementsService.update(id, movement!, uid), onSuccess: async (saved) => { setMovement(saved); setDirty(false); setMessage('Movimiento actualizado.'); await invalidate(saved.account_id!); } });
  const remove = useMutation({ mutationFn: () => movementsService.remove(id, uid), onSuccess: async () => { setDirty(false); await invalidate(movement!.account_id!); navigate('/history', { replace: true }); } });
  const update = (change: Partial<Movement>) => { setMovement((current) => current ? { ...current, ...change } : current); setDirty(true); setMessage(''); };
  const submit = (event: FormEvent) => { event.preventDefault(); void save.mutateAsync(); };

  if (movementQuery.isLoading || !movement) return <div className="space-y-3"><div className="skeleton h-12" /><div className="skeleton h-80" /></div>;
  if (movement.needs_review) return <section className="rounded-lg border border-orange-300 bg-orange-50 p-4"><h1 className="font-bold text-purchase">Movimiento heredado por revisar</h1><p className="mt-2 text-sm">No se permite editarlo hasta completar manualmente la direccion del ajuste o las cuentas de la transferencia.</p></section>;
  return <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 rounded-lg border bg-white p-4 shadow-sm"><UnsavedChangesGuard dirty={dirty} /><ConfirmDialog open={confirmDelete} title="Eliminar movimiento" message={movement.type === 'transfer' ? 'Se eliminaran atómicamente ambas partes de la transferencia.' : 'Esta accion ajustara el saldo de la cuenta y no se puede deshacer.'} confirmLabel="Eliminar" danger onCancel={() => setConfirmDelete(false)} onConfirm={() => { setConfirmDelete(false); void remove.mutateAsync(); }} /><h1 className="text-2xl font-bold">Editar movimiento</h1><p className="rounded-lg bg-cream p-3 text-sm font-semibold">Tipo: {movement.type}</p><input required type="number" min="1" step="1" className="w-full rounded-lg border px-3 py-3" value={movement.amount} onChange={(event) => update({ amount: Number(event.target.value) })} /><input required type="date" className="w-full rounded-lg border px-3 py-3" value={movement.date} onChange={(event) => update({ date: event.target.value })} /><select className="w-full rounded-lg border px-3 py-3" value={movement.category_id} onChange={(event) => update({ category_id: Number(event.target.value) })}>{(categories.data || []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><input required maxLength={200} className="w-full rounded-lg border px-3 py-3" value={movement.description} onChange={(event) => update({ description: event.target.value })} /><textarea maxLength={1000} className="w-full rounded-lg border px-3 py-3" value={movement.notes || ''} onChange={(event) => update({ notes: event.target.value })} />{movement.type === 'adjustment' && <select className="w-full rounded-lg border px-3 py-3" value={movement.adjustment_direction} onChange={(event) => update({ adjustment_direction: event.target.value as 'in' | 'out' })}><option value="in">Aumenta saldo</option><option value="out">Reduce saldo</option></select>}<div className="flex flex-wrap gap-4"><label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={movement.is_necessary} onChange={(event) => update({ is_necessary: event.target.checked })} /> Es necesario</label><label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={movement.is_recurring} onChange={(event) => update({ is_recurring: event.target.checked })} /> Es recurrente</label></div>{save.error && <p className="rounded-lg bg-red-50 p-3 text-expense">{save.error.message}</p>}{message && <p className="rounded-lg bg-green-50 p-3 text-income">{message}</p>}<div className="grid grid-cols-2 gap-3"><button disabled={!dirty || save.isPending} className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" /> Guardar</button><button type="button" onClick={() => setConfirmDelete(true)} className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-red-600 font-semibold text-white"><Trash2 className="h-4 w-4" /> Eliminar</button></div></form>;
}
