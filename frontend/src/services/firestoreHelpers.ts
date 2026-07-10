import { collection, doc, getDocs, runTransaction, Transaction, writeBatch } from 'firebase/firestore';
import { Category, FinanceAccount, Movement } from '../types/finance';
import { movementSignedAmount } from '../utils/calculations';
import { auth, db, nowISO } from './firebase';
import { initialCategories } from './seedData';

export type UserCollectionName = 'accounts' | 'categories' | 'movements' | 'budgets';
export type CounterField = 'accountId' | 'categoryId' | 'movementId' | 'budgetId';
const initialized = new Set<string>();
const LEGACY_COLLECTIONS: UserCollectionName[] = ['accounts', 'categories', 'movements', 'budgets'];

export function requireAuthenticatedUser() {
  const user = auth.currentUser;
  if (!user) throw new Error('Tu sesion termino. Inicia sesion nuevamente.');
  if (!user.emailVerified) throw new Error('Verifica tu correo antes de consultar informacion financiera.');
  return user;
}

export function getAuthenticatedUid(): string {
  return requireAuthenticatedUser().uid;
}

export function userCollection(name: UserCollectionName, uid = getAuthenticatedUid()) {
  return collection(db, 'users', uid, name);
}

export function userDocument(name: UserCollectionName, id: string | number, uid = getAuthenticatedUid()) {
  return doc(db, 'users', uid, name, String(id));
}

export async function nextTransactionalId(transaction: Transaction, uid: string, field: CounterField): Promise<number> {
  return (await nextTransactionalIds(transaction, uid, field, 1))[0];
}

export async function nextTransactionalIds(transaction: Transaction, uid: string, field: CounterField, count: number): Promise<number[]> {
  const counterRef = doc(db, 'users', uid, 'meta', 'counters');
  const snapshot = await transaction.get(counterRef);
  const current = Number(snapshot.data()?.[field] || 0);
  const ids = Array.from({ length: count }, (_, index) => current + index + 1);
  transaction.set(counterRef, { [field]: current + count }, { merge: true });
  return ids;
}

export async function ensureUserInitialized(uid = getAuthenticatedUid()) {
  if (initialized.has(uid)) return;
  await migrateLegacyData(uid);
  const initializationRef = doc(db, 'users', uid, 'meta', 'initialization');
  await runTransaction(db, async (transaction) => {
    const initialization = await transaction.get(initializationRef);
    if (Number(initialization.data()?.categoriesSeedVersion || 0) >= 1 && initialization.data()?.defaultAccountCreated) return;

    const now = nowISO();
    const defaultAccount = {
      id: 1,
      name: 'General',
      description: 'Cuenta principal',
      color: '#D97706',
      icon: 'Wallet',
      active: true,
      current_balance: 0,
      created_at: now,
      updated_at: now
    };
    transaction.set(userDocument('accounts', 1, uid), defaultAccount, { merge: false });
    initialCategories.forEach((category: Category) => {
      transaction.set(userDocument('categories', category.id, uid), { ...category, created_at: now, updated_at: now }, { merge: false });
    });
    transaction.set(doc(db, 'users', uid, 'meta', 'counters'), { accountId: 1, categoryId: initialCategories.length, movementId: 0, budgetId: 0 }, { merge: true });
    transaction.set(initializationRef, { categoriesSeedVersion: 1, defaultAccountCreated: true, initializedAt: now });
  });
  initialized.add(uid);
}

function isPermissionDenied(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error
    && String((error as { code?: string }).code).includes('permission-denied');
}

function normalizeLegacyMovement(data: Record<string, unknown>, documentId: string): Movement {
  const now = nowISO();
  const type = ['income', 'expense', 'purchase', 'transfer', 'adjustment'].includes(String(data.type))
    ? String(data.type) as Movement['type']
    : 'expense';
  return {
    id: Number(data.id || documentId),
    account_id: Number(data.account_id || 1),
    type,
    amount: Math.max(1, Math.round(Number(data.amount || 0))),
    date: String(data.date || now.slice(0, 10)),
    category_id: Number(data.category_id || 1),
    description: String(data.description || 'Movimiento migrado').slice(0, 200),
    payment_method: String(data.payment_method || '').slice(0, 80),
    notes: String(data.notes || '').slice(0, 1000),
    tag: String(data.tag || '').slice(0, 80),
    place: String(data.place || '').slice(0, 200),
    is_necessary: Boolean(data.is_necessary),
    is_recurring: Boolean(data.is_recurring),
    created_at: String(data.created_at || now),
    updated_at: String(data.updated_at || now)
  };
}

async function migrateLegacyData(uid: string) {
  let legacySnapshots;
  try {
    legacySnapshots = await Promise.all(LEGACY_COLLECTIONS.map((name) => getDocs(collection(db, name))));
  } catch (error) {
    if (isPermissionDenied(error)) return;
    throw error;
  }

  const [legacyAccounts, legacyCategories, legacyMovements, legacyBudgets] = legacySnapshots;
  if (legacySnapshots.every((snapshot) => snapshot.empty)) return;
  const currentMovements = await getDocs(userCollection('movements', uid));
  if (!currentMovements.empty) return;

  const now = nowISO();
  const movements = legacyMovements.docs.map((item) => normalizeLegacyMovement(item.data(), item.id));
  const balances = new Map<number, number>();
  movements.forEach((movement) => {
    const accountId = Number(movement.account_id || 1);
    balances.set(accountId, (balances.get(accountId) || 0) + movementSignedAmount(movement));
  });

  const writes: Array<{ path: string[]; data: Record<string, unknown> }> = [];
  legacyAccounts.docs.forEach((item) => {
    const data = item.data();
    const id = Number(data.id || item.id);
    const account: FinanceAccount = {
      id,
      name: String(data.name || `Cuenta ${id}`).slice(0, 80),
      description: String(data.description || '').slice(0, 300),
      color: String(data.color || '#D97706').slice(0, 20),
      icon: String(data.icon || 'Wallet').slice(0, 50),
      active: data.active !== false,
      current_balance: Math.round(balances.get(id) || 0),
      created_at: String(data.created_at || now),
      updated_at: now
    };
    writes.push({ path: ['users', uid, 'accounts', String(id)], data: account as unknown as Record<string, unknown> });
  });
  legacyCategories.docs.forEach((item) => {
    const data = item.data();
    const id = Number(data.id || item.id);
    writes.push({ path: ['users', uid, 'categories', String(id)], data: {
      id,
      name: String(data.name || `Categoria ${id}`).slice(0, 80),
      type: ['income', 'expense', 'both'].includes(String(data.type)) ? data.type : 'expense',
      color: String(data.color || '#6B7280').slice(0, 20),
      icon: String(data.icon || 'Circle').slice(0, 50),
      active: data.active !== false,
      created_at: String(data.created_at || now),
      updated_at: now
    } });
  });
  movements.forEach((movement) => writes.push({ path: ['users', uid, 'movements', String(movement.id)], data: movement as unknown as Record<string, unknown> }));
  legacyBudgets.docs.forEach((item) => {
    const data = item.data();
    const accountId = Number(data.account_id || 1);
    const year = Number(data.year || now.slice(0, 4));
    const month = Number(data.month || now.slice(5, 7));
    const id = Number(data.id || 1);
    writes.push({ path: ['users', uid, 'budgets', `${accountId}-${year}-${month}`], data: {
      id, account_id: accountId, year, month,
      total_budget: Math.max(0, Math.round(Number(data.total_budget || 0))),
      saving_goal: Math.max(0, Math.round(Number(data.saving_goal || 0))),
      unnecessary_expense_limit: Math.max(0, Math.round(Number(data.unnecessary_expense_limit || 0))),
      category_budgets: Array.isArray(data.category_budgets) ? data.category_budgets.slice(0, 10) : [],
      created_at: String(data.created_at || now), updated_at: now
    } });
  });

  for (let offset = 0; offset < writes.length; offset += 400) {
    const batch = writeBatch(db);
    writes.slice(offset, offset + 400).forEach((item) => batch.set(doc(db, item.path.join('/')), item.data));
    await batch.commit();
  }
  const counters = writeBatch(db);
  counters.set(doc(db, 'users', uid, 'meta', 'counters'), {
    accountId: Math.max(1, ...legacyAccounts.docs.map((item) => Number(item.data().id || item.id))),
    categoryId: Math.max(0, ...legacyCategories.docs.map((item) => Number(item.data().id || item.id))),
    movementId: Math.max(0, ...movements.map((item) => item.id)),
    budgetId: Math.max(0, ...legacyBudgets.docs.map((item) => Number(item.data().id || 0)))
  }, { merge: true });
  counters.set(doc(db, 'users', uid, 'meta', 'initialization'), {
    categoriesSeedVersion: 1,
    defaultAccountCreated: legacyAccounts.size > 0,
    initializedAt: now
  });
  await counters.commit();
}

export function clearInitializationState() {
  initialized.clear();
}
