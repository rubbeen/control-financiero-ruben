import { useQuery } from '@tanstack/react-query';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { accountsService, DEFAULT_ACCOUNT_ID } from '../services/accounts';
import { queryClient, queryKeys } from '../services/queryClient';
import { FinanceAccount } from '../types/finance';
import { perfMeasureAsync } from '../utils/performance';

interface AccountContextValue {
  accounts: FinanceAccount[];
  activeAccount: FinanceAccount | null;
  activeAccountId: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  setActiveAccountId: (id: number) => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ uid, children }: { uid: string; children: ReactNode }) {
  const storageKey = `control-financiero-active-account:${uid}`;
  const [requestedId, setRequestedId] = useState(() => Number(localStorage.getItem(storageKey) || DEFAULT_ACCOUNT_ID));
  const accountsQuery = useQuery({
    queryKey: queryKeys.accounts(uid),
    queryFn: () => accountsService.list(uid),
    staleTime: 10 * 60 * 1000
  });
  const accounts = accountsQuery.data || [];
  const activeAccount = accounts.find((account) => account.id === requestedId) || accounts[0] || null;

  useEffect(() => {
    if (activeAccount && activeAccount.id !== requestedId) {
      localStorage.setItem(storageKey, String(activeAccount.id));
    }
  }, [activeAccount, requestedId, storageKey]);

  async function changeAccount(id: number) {
    if (!accounts.some((account) => account.id === id) || id === activeAccount?.id) return;
    await perfMeasureAsync('account-switch', async () => {
      await queryClient.cancelQueries({ predicate: (query) => query.queryKey.includes(activeAccount?.id) });
      setRequestedId(id);
      localStorage.setItem(storageKey, String(id));
    });
  }

  const value = {
    accounts,
    activeAccount,
    activeAccountId: activeAccount?.id || requestedId,
    isLoading: accountsQuery.isLoading,
    isFetching: accountsQuery.isFetching,
    isError: accountsQuery.isError,
    error: accountsQuery.error,
    setActiveAccountId: changeAccount
  };

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const value = useContext(AccountContext);
  if (!value) throw new Error('AccountProvider no esta disponible.');
  return value;
}

export function clearActiveAccount(uid: string) {
  localStorage.removeItem(`control-financiero-active-account:${uid}`);
}
