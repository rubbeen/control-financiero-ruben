import { PlusCircle, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { categoriesService } from '../services/categories';

export default function Categories() {
  const categories = useAsync(() => categoriesService.list(true), []);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    await categoriesService.create({ name, type: type as any, color: type === 'income' ? '#16A34A' : '#DC2626', icon: 'Circle', active: true });
    setName('');
    setMessage('Categoria creada correctamente.');
    categories.reload();
  }

  async function remove(id: number) {
    if (!confirm('Deseas eliminar o desactivar esta categoria?')) return;
    const result = await categoriesService.remove(id);
    setMessage(result.message);
    categories.reload();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text">Categorias</h1>
      <form onSubmit={submit} className="grid gap-3 rounded-lg border border-border bg-white p-4 sm:grid-cols-[1fr_180px_auto]">
        <input required className="rounded-lg border border-border px-3 py-3" placeholder="Nombre de categoria" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="rounded-lg border border-border px-3 py-3" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
          <option value="both">Mixta</option>
        </select>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-white"><PlusCircle className="h-4 w-4" /> Crear</button>
      </form>
      {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-income">{message}</p>}
      <div className="grid gap-2 md:grid-cols-2">
        {(categories.data || []).map((cat) => (
          <article key={cat.id} className="flex items-center justify-between rounded-lg border border-border bg-white p-3">
            <div>
              <p className="font-semibold text-text">{cat.name}</p>
              <p className="text-xs text-muted">{cat.type} · {cat.active ? 'Activa' : 'Inactiva'}</p>
            </div>
            <button onClick={() => remove(cat.id)} className="rounded-lg bg-red-50 p-2 text-expense"><Trash2 className="h-4 w-4" /></button>
          </article>
        ))}
      </div>
    </div>
  );
}
