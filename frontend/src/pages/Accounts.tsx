import { useMutation } from '@tanstack/react-query';
import { CheckCircle, FolderPlus, Wallet } from 'lucide-react';
import { FormEvent, useState } from 'react';
import UnsavedChangesGuard from '../components/UnsavedChangesGuard';
import { useAccount } from '../context/AccountContext';
import { useUid } from '../hooks/useFinanceQueries';
import { accountsService } from '../services/accounts';
import { queryClient, queryKeys } from '../services/queryClient';
import { formatCurrency } from '../utils/currency';

export default function Accounts() {
  const uid = useUid();
  const { accounts, activeAccountId, setActiveAccountId } = useAccount();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState('');
  const create = useMutation({ mutationFn: () => accountsService.create({ name, description }, uid), onSuccess: async (account) => { await queryClient.invalidateQueries({ queryKey: queryKeys.accounts(uid) }); await setActiveAccountId(account.id); setName(''); setDescription(''); setDirty(false); setMessage(`Cuenta "${account.name}" creada.`); } });
  const submit = (event: FormEvent) => { event.preventDefault(); void create.mutateAsync(); };
  return <div className="space-y-4"><UnsavedChangesGuard dirty={dirty} /><section className="rounded-lg bg-cocoa p-5 text-white"><p className="text-sm text-amber-100">Carpetas financieras</p><h1 className="mt-1 text-2xl font-extrabold">Cuentas separadas</h1><p className="mt-2 text-sm text-amber-50">Cada cuenta conserva su propio saldo, movimientos y presupuesto.</p></section><form onSubmit={submit} className="space-y-3 rounded-lg border bg-white p-4"><label className="block text-sm font-semibold">Nombre<input required maxLength={80} className="mt-1 w-full rounded-lg border px-3 py-3" value={name} onChange={(event) => { setName(event.target.value); setDirty(true); }} /></label><label className="block text-sm font-semibold">Descripcion<input maxLength={300} className="mt-1 w-full rounded-lg border px-3 py-3" value={description} onChange={(event) => { setDescription(event.target.value); setDirty(true); }} /></label><button disabled={create.isPending} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-white"><FolderPlus className="h-5 w-5" /> Crear cuenta</button></form>{message && <p className="rounded-lg bg-green-50 p-3 text-income">{message}</p>}<section className="space-y-2">{accounts.map((account) => <button key={account.id} onClick={() => void setActiveAccountId(account.id)} className={`flex min-h-16 w-full items-center gap-3 rounded-lg border p-4 text-left ${account.id === activeAccountId ? 'border-primary bg-orange-50' : 'bg-white'}`}><span className="rounded-lg bg-white p-2 text-primary"><Wallet className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block truncate font-bold">{account.name}</span><span className="block truncate text-sm text-muted">{account.description || 'Sin descripcion'} · {formatCurrency(account.current_balance)}</span></span>{account.id === activeAccountId && <CheckCircle className="h-5 w-5 flex-none text-income" />}</button>)}</section></div>;
}
