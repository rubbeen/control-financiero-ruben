import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { Budget } from '../types/finance';
import { db, nowISO } from './firebase';
import { nextNumericId } from './firestoreHelpers';
import { DEFAULT_ACCOUNT_ID, getActiveAccountId } from './accounts';

const COLLECTION = 'budgets';

export const budgetsService = {
  async list(): Promise<Budget[]> {
    const snapshot = await getDocs(collection(db, COLLECTION));
    const activeAccountId = getActiveAccountId();
    return snapshot.docs
      .map((item) => item.data() as Budget)
      .filter((item) => (item.account_id || DEFAULT_ACCOUNT_ID) === activeAccountId)
      .sort((a, b) => b.year - a.year || b.month - a.month);
  },

  async get(year: number, month: number): Promise<Budget> {
    const activeAccountId = getActiveAccountId();
    const snapshot = await getDocs(query(collection(db, COLLECTION), where('year', '==', year), where('month', '==', month)));
    const budget = snapshot.docs
      .map((item) => item.data() as Budget)
      .find((item) => (item.account_id || DEFAULT_ACCOUNT_ID) === activeAccountId);
    if (!budget) throw new Error('No se ha definido presupuesto para este mes.');
    return budget;
  },

  async create(data: Partial<Budget>): Promise<Budget> {
    const activeAccountId = getActiveAccountId();
    const existing = await getDocs(query(collection(db, COLLECTION), where('year', '==', Number(data.year)), where('month', '==', Number(data.month))));
    const duplicate = existing.docs.map((item) => item.data() as Budget).some((item) => (item.account_id || DEFAULT_ACCOUNT_ID) === activeAccountId);
    if (duplicate) throw new Error('Ya existe presupuesto para este mes en esta cuenta.');
    const now = nowISO();
    const budget: Budget = {
      id: await nextNumericId(COLLECTION),
      account_id: activeAccountId,
      year: Number(data.year),
      month: Number(data.month),
      total_budget: Number(data.total_budget || 0),
      saving_goal: Number(data.saving_goal || 0),
      unnecessary_expense_limit: Number(data.unnecessary_expense_limit || 0),
      category_budgets: data.category_budgets || [],
      created_at: now,
      updated_at: now
    };
    await setDoc(doc(db, COLLECTION, String(budget.id)), budget);
    return budget;
  },

  async update(id: number, data: Partial<Budget>): Promise<Budget> {
    await updateDoc(doc(db, COLLECTION, String(id)), { ...data, updated_at: nowISO() });
    const snapshot = await getDoc(doc(db, COLLECTION, String(id)));
    return snapshot.data() as Budget;
  },

  async remove(id: number): Promise<{ message: string }> {
    await deleteDoc(doc(db, COLLECTION, String(id)));
    return { message: 'Presupuesto eliminado correctamente.' };
  }
};
