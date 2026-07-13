import { useMutation } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AccountSelector from '../components/AccountSelector';
import UnsavedChangesGuard from '../components/UnsavedChangesGuard';
import { useAccount } from '../context/AccountContext';
import { useCategories, useUid } from '../hooks/useFinanceQueries';
import { movementsService } from '../services/movements';
import { queryClient } from '../services/queryClient';
import { MovementInput, MovementType } from '../types/finance';
import { todayISO } from '../utils/dates';

const makeInitial = (type: MovementType): MovementInput => ({ type, amount: 0, date: todayISO(), category_id: 0, description: '', payment_method: 'Efectivo', notes: '', tag: '', place: '', is_necessary: true, is_recurring: false, adjustment_direction: type === 'adjustment' ? 'in' : undefined });

export default function AddMovement() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialType = (['income', 'expense'].includes(params.get('tipo') || '') ? params.get('tipo') : 'expense') as MovementType;
  const [form, setForm] = useState<MovementInput>(makeInitial(initialType));
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState('');
  const uid = useUid();
  const { accounts, activeAccountId } = useAccount();
  const categories = useCategories(false);
  const available = useMemo(() => (categories.data || []).filter((category) => form.type === 'income' ? category.type !== 'expense' : form.type === 'transfer' ? true : category.type !== 'income'), [categories.data, form.type]);

  const selectedCategoryId = available.some((category) => category.id === form.category_id) ? form.category_id : (available[0]?.id || 0);

  const save = useMutation({
    mutationFn: (input: MovementInput) => movementsService.create({ ...input, account_id: activeAccountId, source_account_id: input.type === 'transfer' ? activeAccountId : undefined }, uid),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['financialAnalysis', uid, activeAccountId] }),
        queryClient.invalidateQueries({ queryKey: ['latestMovements', uid, activeAccountId] }),
        queryClient.invalidateQueries({ queryKey: ['movements', uid, activeAccountId] }),
        queryClient.invalidateQueries({ queryKey: ['accounts', uid] })
      ]);
    }
  });

  function update(change: Partial<MovementInput>) {
    setDirty(true);
    setForm((current) => ({ ...current, ...change }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    await save.mutateAsync({ ...form, amount: Math.round(Number(form.amount)), category_id: Number(selectedCategoryId) });
    setDirty(false);
    setMessage(form.type === 'transfer' ? 'Transferencia guardada en ambas cuentas.' : 'Movimiento guardado correctamente.');
    window.setTimeout(() => navigate('/'), 500);
  }

  return <div className="mx-auto max-w-2xl"><UnsavedChangesGuard dirty={dirty} /><h1 className="text-2xl font-bold">Agregar movimiento</h1><p className="mt-1 text-sm text-muted">Valores enteros en pesos colombianos (COP).</p><div className="mt-4"><AccountSelector /></div><form onSubmit={submit} className="mt-4 space-y-4 rounded-lg border bg-white p-4 shadow-sm">
    <label className="block text-sm font-semibold">Tipo<select className="mt-1 w-full rounded-lg border px-3 py-3" value={form.type} onChange={(event) => update({ type: event.target.value as MovementType, adjustment_direction: event.target.value === 'adjustment' ? 'in' : undefined })}><option value="expense">Gasto</option><option value="income">Ingreso</option><option value="purchase">Compra</option><option value="transfer">Transferencia</option><option value="adjustment">Ajuste</option></select></label>
    {form.type === 'transfer' && <label className="block text-sm font-semibold">Cuenta de destino<select required className="mt-1 w-full rounded-lg border px-3 py-3" value={form.destination_account_id || ''} onChange={(event) => update({ destination_account_id: Number(event.target.value) })}><option value="">Selecciona otra cuenta</option>{accounts.filter((account) => account.id !== activeAccountId).map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>}
    {form.type === 'adjustment' && <fieldset><legend className="text-sm font-semibold">Direccion del ajuste</legend><div className="mt-2 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2"><label className="rounded-lg border p-3"><input type="radio" checked={form.adjustment_direction === 'in'} onChange={() => update({ adjustment_direction: 'in' })} /> Aumenta saldo</label><label className="rounded-lg border p-3"><input type="radio" checked={form.adjustment_direction === 'out'} onChange={() => update({ adjustment_direction: 'out' })} /> Reduce saldo</label></div></fieldset>}
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Valor<input required min="1" max="1000000000000" step="1" type="number" className="mt-1 w-full rounded-lg border px-3 py-3" value={form.amount || ''} onChange={(event) => update({ amount: Number(event.target.value) })} /></label><label className="text-sm font-semibold">Fecha<input required type="date" className="mt-1 w-full rounded-lg border px-3 py-3" value={form.date} onChange={(event) => update({ date: event.target.value })} /></label></div>
    <label className="block text-sm font-semibold">Categoria<select required className="mt-1 w-full rounded-lg border px-3 py-3" value={selectedCategoryId} onChange={(event) => update({ category_id: Number(event.target.value) })}>{available.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
    <label className="block text-sm font-semibold">Descripcion<input required maxLength={200} className="mt-1 w-full rounded-lg border px-3 py-3" value={form.description} onChange={(event) => update({ description: event.target.value })} /></label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Metodo de pago<input maxLength={80} className="mt-1 w-full rounded-lg border px-3 py-3" value={form.payment_method} onChange={(event) => update({ payment_method: event.target.value })} /></label><label className="text-sm font-semibold">Lugar<input maxLength={200} className="mt-1 w-full rounded-lg border px-3 py-3" value={form.place} onChange={(event) => update({ place: event.target.value })} /></label></div>
    <label className="block text-sm font-semibold">Nota<textarea maxLength={1000} rows={3} className="mt-1 w-full rounded-lg border px-3 py-3" value={form.notes} onChange={(event) => update({ notes: event.target.value })} /></label>
    <div className="flex flex-wrap gap-4"><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={form.is_necessary} onChange={(event) => update({ is_necessary: event.target.checked })} /> Es necesario</label><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={form.is_recurring} onChange={(event) => update({ is_recurring: event.target.checked })} /> Es recurrente</label></div>
    {save.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-expense">{save.error instanceof Error ? save.error.message : 'No se pudo guardar.'}</p>}{message && <p className="rounded-lg bg-green-50 p-3 text-sm text-income">{message}</p>}
    <button disabled={save.isPending} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 font-semibold text-white disabled:opacity-60"><Save className="h-5 w-5" />{save.isPending ? 'Guardando...' : 'Guardar movimiento'}</button>
  </form></div>;
}
