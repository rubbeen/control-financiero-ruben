import { CheckCircle, FolderPlus, Wallet } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { accountsService, getActiveAccountId, setActiveAccountId } from '../services/accounts';
import { FinanceAccount } from '../types/finance';

export default function Accounts() {
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [activeId, setActiveId] = useState(getActiveAccountId());
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setAccounts(await accountsService.list());
    setActiveId(getActiveAccountId());
  }

  useEffect(() => {
    load();
  }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    const account = await accountsService.create({ name, description });
    setName('');
    setDescription('');
    setMessage(`Cuenta "${account.name}" creada y activada.`);
    await load();
  }

  function activate(id: number) {
    setActiveAccountId(id);
    setActiveId(id);
    setMessage('Cuenta activa actualizada.');
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-gradient-to-br from-cocoa via-copper to-purchase p-5 text-white shadow-soft">
        <div className="flex items-start gap-3">
          <span className="rounded-2xl bg-white/15 p-3">
            <Wallet className="h-7 w-7 text-amber-100" />
          </span>
          <div>
            <p className="text-sm font-semibold text-amber-100">Carpetas financieras</p>
            <h1 className="mt-1 text-2xl font-extrabold">Cuentas separadas</h1>
            <p className="mt-2 text-sm text-amber-50">Crea una cuenta para ahorro, efectivo, deudas, negocio o cualquier bolsillo que quieras controlar por separado.</p>
          </div>
        </div>
      </section>

      <form onSubmit={create} className="space-y-3 rounded-lg border border-border bg-white p-4 shadow-sm">
        <label className="block text-sm font-semibold text-text">Nombre de la cuenta
          <input className="mt-1 w-full rounded-lg border border-border px-3 py-3" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej: Cuenta de ahorro, Efectivo, Nequi" />
        </label>
        <label className="block text-sm font-semibold text-text">Descripcion
          <input className="mt-1 w-full rounded-lg border border-border px-3 py-3" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Uso de esta cuenta" />
        </label>
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-white">
          <FolderPlus className="h-5 w-5" /> Crear cuenta
        </button>
      </form>

      {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-income">{message}</p>}

      <section className="space-y-2">
        {accounts.map((account) => {
          const active = account.id === activeId;
          return (
            <button key={account.id} onClick={() => activate(account.id)} className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left shadow-sm ${active ? 'border-primary bg-orange-50' : 'border-border bg-white'}`}>
              <span className="rounded-lg bg-white p-2 text-primary shadow-sm">
                <Wallet className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-text">{account.name}</span>
                <span className="block truncate text-sm text-muted">{account.description || 'Sin descripcion'}</span>
              </span>
              {active && <CheckCircle className="h-5 w-5 flex-none text-income" />}
            </button>
          );
        })}
      </section>
    </div>
  );
}
