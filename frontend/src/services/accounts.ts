import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { FinanceAccount } from '../types/finance';
import { db, nowISO } from './firebase';
import { nextNumericId } from './firestoreHelpers';

const COLLECTION = 'accounts';
const ACTIVE_KEY = 'control-financiero-active-account-id';
export const DEFAULT_ACCOUNT_ID = 1;

async function ensureDefaultAccount() {
  const ref = doc(db, COLLECTION, String(DEFAULT_ACCOUNT_ID));
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return;
  const now = nowISO();
  await setDoc(ref, {
    id: DEFAULT_ACCOUNT_ID,
    name: 'General',
    description: 'Cuenta principal',
    color: '#D97706',
    icon: 'Wallet',
    active: true,
    created_at: now,
    updated_at: now
  });
}

export function getActiveAccountId(): number {
  return Number(localStorage.getItem(ACTIVE_KEY) || DEFAULT_ACCOUNT_ID);
}

export function setActiveAccountId(id: number) {
  localStorage.setItem(ACTIVE_KEY, String(id));
  window.dispatchEvent(new CustomEvent('active-account-changed', { detail: id }));
}

export const accountsService = {
  async list(): Promise<FinanceAccount[]> {
    await ensureDefaultAccount();
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map((item) => item.data() as FinanceAccount).filter((item) => item.active).sort((a, b) => a.id - b.id);
  },

  async active(): Promise<FinanceAccount> {
    await ensureDefaultAccount();
    const id = getActiveAccountId();
    const snapshot = await getDoc(doc(db, COLLECTION, String(id)));
    if (snapshot.exists()) return snapshot.data() as FinanceAccount;
    setActiveAccountId(DEFAULT_ACCOUNT_ID);
    return (await getDoc(doc(db, COLLECTION, String(DEFAULT_ACCOUNT_ID)))).data() as FinanceAccount;
  },

  async create(data: Pick<FinanceAccount, 'name'> & Partial<FinanceAccount>): Promise<FinanceAccount> {
    const now = nowISO();
    const account: FinanceAccount = {
      id: await nextNumericId(COLLECTION),
      name: data.name.trim(),
      description: data.description || '',
      color: data.color || '#D97706',
      icon: data.icon || 'Wallet',
      active: true,
      created_at: now,
      updated_at: now
    };
    await setDoc(doc(db, COLLECTION, String(account.id)), account);
    setActiveAccountId(account.id);
    return account;
  },

  async update(id: number, data: Partial<FinanceAccount>) {
    await updateDoc(doc(db, COLLECTION, String(id)), { ...data, updated_at: nowISO() });
  }
};
