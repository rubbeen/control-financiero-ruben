import { FolderKanban } from 'lucide-react';
import { useEffect, useState } from 'react';
import { accountsService, setActiveAccountId } from '../services/accounts';
import { FinanceAccount } from '../types/finance';

interface Props {
  setPage?: (page: string) => void;
}

export default function AccountSelector({ setPage }: Props) {
  const [account, setAccount] = useState<FinanceAccount | null>(null);

  useEffect(() => {
    accountsService.active().then(setAccount).catch(() => undefined);
    const handler = () => accountsService.active().then(setAccount).catch(() => undefined);
    window.addEventListener('active-account-changed', handler);
    return () => window.removeEventListener('active-account-changed', handler);
  }, []);

  return (
    <button onClick={() => setPage?.('accounts')} className="flex w-full items-center gap-3 rounded-lg border border-border bg-white p-3 text-left shadow-sm">
      <span className="rounded-lg bg-orange-50 p-2 text-primary">
        <FolderKanban className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-wide text-muted">Cuenta activa</span>
        <span className="block truncate font-bold text-text">{account?.name || 'General'}</span>
      </span>
    </button>
  );
}
