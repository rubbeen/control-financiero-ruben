import { getDoc, getDocs, runTransaction, updateDoc } from 'firebase/firestore';
import { FinanceAccount } from '../types/finance';
import { db, nowISO } from './firebase';
import { ensureUserInitialized, getAuthenticatedUid, nextTransactionalId, userCollection, userDocument } from './firestoreHelpers';

export const DEFAULT_ACCOUNT_ID = 1;

export const accountsService = {
  async list(uid = getAuthenticatedUid()): Promise<FinanceAccount[]> {
    await ensureUserInitialized(uid);
    const snapshot = await getDocs(userCollection('accounts', uid));
    return snapshot.docs.map((item) => item.data() as FinanceAccount).filter((item) => item.active).sort((a, b) => a.id - b.id);
  },

  async get(id: number, uid = getAuthenticatedUid()): Promise<FinanceAccount> {
    await ensureUserInitialized(uid);
    const snapshot = await getDoc(userDocument('accounts', id, uid));
    if (!snapshot.exists()) throw new Error('La cuenta seleccionada ya no existe.');
    return snapshot.data() as FinanceAccount;
  },

  async create(data: Pick<FinanceAccount, 'name'> & Partial<FinanceAccount>, uid = getAuthenticatedUid()): Promise<FinanceAccount> {
    const now = nowISO();
    return runTransaction(db, async (transaction) => {
      const id = await nextTransactionalId(transaction, uid, 'accountId');
      const account: FinanceAccount = {
        id,
        name: data.name.trim(),
        description: data.description?.trim() || '',
        color: data.color || '#D97706',
        icon: data.icon || 'Wallet',
        active: true,
        current_balance: 0,
        created_at: now,
        updated_at: now
      };
      transaction.set(userDocument('accounts', id, uid), account);
      return account;
    });
  },

  async update(id: number, data: Partial<FinanceAccount>, uid = getAuthenticatedUid()) {
    const allowed = { name: data.name, description: data.description, color: data.color, icon: data.icon, active: data.active };
    const clean = Object.fromEntries(Object.entries(allowed).filter(([, value]) => value !== undefined));
    await updateDoc(userDocument('accounts', id, uid), { ...clean, updated_at: nowISO() });
  }
};
