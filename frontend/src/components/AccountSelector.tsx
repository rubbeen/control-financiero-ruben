import { FolderKanban, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../context/AccountContext';

export default function AccountSelector() {
  const navigate = useNavigate();
  const { accounts, activeAccountId, isLoading, isFetching, setActiveAccountId } = useAccount();
  return (
    <section className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-white p-3 shadow-sm">
      <span className="flex-none rounded-lg bg-orange-50 p-2 text-primary"><FolderKanban className="h-5 w-5" /></span>
      <label className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase text-muted">Cuenta activa {isFetching && !isLoading ? '· actualizando' : ''}</span>
        <select aria-label="Cuenta activa" disabled={isLoading} className="mt-0.5 w-full min-w-0 bg-transparent font-bold text-text outline-none" value={activeAccountId} onChange={(event) => void setActiveAccountId(Number(event.target.value))}>
          {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
        </select>
      </label>
      <button type="button" onClick={() => navigate('/settings/accounts')} aria-label="Administrar cuentas" className="touch-target flex-none rounded-lg text-muted"><Settings2 className="h-5 w-5" /></button>
    </section>
  );
}
