import { Save } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { categoriesService } from '../services/categories';
import { movementsService } from '../services/movements';
import { Category, MovementInput, MovementType } from '../types/finance';
import { todayISO } from '../utils/dates';
import AccountSelector from '../components/AccountSelector';

interface Props {
  setPage: (page: string) => void;
}

const initial: MovementInput = {
  type: 'expense',
  amount: 0,
  date: todayISO(),
  category_id: 0,
  description: '',
  payment_method: 'Efectivo',
  notes: '',
  tag: '',
  place: '',
  is_necessary: true,
  is_recurring: false
};

export default function AddMovement({ setPage }: Props) {
  const [form, setForm] = useState<MovementInput>(initial);
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    categoriesService.list().then(setCategories).catch((err) => setError(err.message));
  }, []);

  const available = categories.filter((cat) => {
    if (form.type === 'income') return cat.type === 'income' || cat.type === 'both';
    if (form.type === 'transfer') return true;
    return cat.type === 'expense' || cat.type === 'both';
  });

  useEffect(() => {
    if (!available.some((cat) => cat.id === form.category_id)) {
      setForm((prev) => ({ ...prev, category_id: available[0]?.id || 0 }));
    }
  }, [available.length, form.type]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await movementsService.create({ ...form, amount: Number(form.amount), category_id: Number(form.category_id) });
      setMessage('Movimiento guardado correctamente.');
      setForm({ ...initial, date: todayISO(), category_id: available[0]?.id || 0 });
      window.setTimeout(() => setPage('dashboard'), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el movimiento.');
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-text">Agregar movimiento</h1>
      <p className="mt-1 text-sm text-muted">Formulario rapido para registrar ingresos, gastos y compras.</p>
      <div className="mt-4">
        <AccountSelector setPage={setPage} />
      </div>
      <form onSubmit={submit} className="mt-4 space-y-4 rounded-lg border border-border bg-white p-4 shadow-sm">
        <label className="block text-sm font-semibold text-text">Tipo
          <select className="mt-1 w-full rounded-lg border border-border px-3 py-3" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as MovementType })}>
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
            <option value="purchase">Compra</option>
            <option value="transfer">Transferencia</option>
            <option value="adjustment">Ajuste</option>
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-text">Valor
            <input required min="1" type="number" className="mt-1 w-full rounded-lg border border-border px-3 py-3" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
          </label>
          <label className="block text-sm font-semibold text-text">Fecha
            <input required type="date" className="mt-1 w-full rounded-lg border border-border px-3 py-3" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </label>
        </div>
        <label className="block text-sm font-semibold text-text">Categoria
          <select required className="mt-1 w-full rounded-lg border border-border px-3 py-3" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}>
            {available.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold text-text">Descripcion
          <input required className="mt-1 w-full rounded-lg border border-border px-3 py-3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ej: Almuerzo, salario, mercado" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-text">Metodo de pago
            <input className="mt-1 w-full rounded-lg border border-border px-3 py-3" value={form.payment_method || ''} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} />
          </label>
          <label className="block text-sm font-semibold text-text">Lugar
            <input className="mt-1 w-full rounded-lg border border-border px-3 py-3" value={form.place || ''} onChange={(e) => setForm({ ...form, place: e.target.value })} />
          </label>
        </div>
        <label className="block text-sm font-semibold text-text">Nota
          <textarea className="mt-1 w-full rounded-lg border border-border px-3 py-3" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
        </label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-text"><input type="checkbox" checked={form.is_necessary} onChange={(e) => setForm({ ...form, is_necessary: e.target.checked })} /> Es necesario</label>
          <label className="flex items-center gap-2 text-sm text-text"><input type="checkbox" checked={form.is_recurring} onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })} /> Es recurrente</label>
        </div>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-expense">{error}</p>}
        {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-income">{message}</p>}
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-4 font-semibold text-white"><Save className="h-5 w-5" /> Guardar movimiento</button>
      </form>
    </div>
  );
}
