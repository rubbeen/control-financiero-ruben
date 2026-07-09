import { Save, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { categoriesService } from '../services/categories';
import { movementsService } from '../services/movements';
import { Category, Movement, MovementType } from '../types/finance';

interface Props {
  id: number;
  setPage: (page: string) => void;
}

export default function MovementDetail({ id, setPage }: Props) {
  const [movement, setMovement] = useState<Movement | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    movementsService.get(id).then(setMovement).catch((err) => setError(err.message));
    categoriesService.list(true).then(setCategories).catch(() => undefined);
  }, [id]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!movement) return;
    try {
      await movementsService.update(id, movement);
      setMessage('Movimiento actualizado correctamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar.');
    }
  }

  async function remove() {
    if (!confirm('Confirma que deseas eliminar este movimiento.')) return;
    await movementsService.remove(id);
    setPage('history');
  }

  if (!movement) return <p className="text-muted">Cargando informacion financiera...</p>;

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4 rounded-lg border border-border bg-white p-4 shadow-sm">
      <h1 className="text-2xl font-bold text-text">Editar movimiento</h1>
      <select className="w-full rounded-lg border border-border px-3 py-3" value={movement.type} onChange={(e) => setMovement({ ...movement, type: e.target.value as MovementType })}>
        <option value="expense">Gasto</option><option value="income">Ingreso</option><option value="purchase">Compra</option><option value="transfer">Transferencia</option><option value="adjustment">Ajuste</option>
      </select>
      <input type="number" min="1" className="w-full rounded-lg border border-border px-3 py-3" value={movement.amount} onChange={(e) => setMovement({ ...movement, amount: Number(e.target.value) })} />
      <input type="date" className="w-full rounded-lg border border-border px-3 py-3" value={movement.date} onChange={(e) => setMovement({ ...movement, date: e.target.value })} />
      <select className="w-full rounded-lg border border-border px-3 py-3" value={movement.category_id} onChange={(e) => setMovement({ ...movement, category_id: Number(e.target.value) })}>
        {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
      </select>
      <input className="w-full rounded-lg border border-border px-3 py-3" value={movement.description} onChange={(e) => setMovement({ ...movement, description: e.target.value })} />
      <textarea className="w-full rounded-lg border border-border px-3 py-3" value={movement.notes || ''} onChange={(e) => setMovement({ ...movement, notes: e.target.value })} />
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={movement.is_necessary} onChange={(e) => setMovement({ ...movement, is_necessary: e.target.checked })} /> Es necesario</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={movement.is_recurring} onChange={(e) => setMovement({ ...movement, is_recurring: e.target.checked })} /> Es recurrente</label>
      </div>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-expense">{error}</p>}
      {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-income">{message}</p>}
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-white"><Save className="h-4 w-4" /> Guardar</button>
        <button type="button" onClick={remove} className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-semibold text-white"><Trash2 className="h-4 w-4" /> Eliminar</button>
      </div>
    </form>
  );
}
