import { deleteDoc, getDoc, getDocs, limit, query, runTransaction, where } from 'firebase/firestore';
import { Budget } from '../types/finance';
import { db, nowISO } from './firebase';
import { getAuthenticatedUid, nextTransactionalId, userCollection, userDocument } from './firestoreHelpers';

const budgetDocumentId = (accountId: number, year: number, month: number) => `${accountId}-${year}-${month}`;

function normalize(data: Partial<Budget>, accountId: number): Omit<Budget, 'id' | 'created_at' | 'updated_at'> {
  return {
    account_id: accountId,
    year: Number(data.year),
    month: Number(data.month),
    total_budget: Math.max(0, Math.round(Number(data.total_budget || 0))),
    saving_goal: Math.max(0, Math.round(Number(data.saving_goal || 0))),
    unnecessary_expense_limit: Math.max(0, Math.round(Number(data.unnecessary_expense_limit || 0))),
    category_budgets: (data.category_budgets || []).slice(0, 10).map((item) => ({ category_id: Number(item.category_id), amount_limit: Math.max(0, Math.round(Number(item.amount_limit || 0))) }))
  };
}

export const budgetsService = {
  async list(accountId: number, uid = getAuthenticatedUid()): Promise<Budget[]> {
    const snapshot = await getDocs(query(userCollection('budgets', uid), where('account_id', '==', accountId), limit(120)));
    return snapshot.docs.map((item) => item.data() as Budget).sort((a, b) => b.year - a.year || b.month - a.month);
  },

  async get(accountId: number, year: number, month: number, uid = getAuthenticatedUid()): Promise<Budget | null> {
    const direct = await getDoc(userDocument('budgets', budgetDocumentId(accountId, year, month), uid));
    return direct.exists() ? direct.data() as Budget : null;
  },

  async save(accountId: number, data: Partial<Budget>, uid = getAuthenticatedUid()): Promise<Budget> {
    const normalized = normalize(data, accountId);
    const ref = userDocument('budgets', budgetDocumentId(accountId, normalized.year, normalized.month), uid);
    const now = nowISO();
    return runTransaction(db, async (transaction) => {
      const existing = await transaction.get(ref);
      const id = existing.exists() ? Number(existing.data().id) : await nextTransactionalId(transaction, uid, 'budgetId');
      const budget: Budget = {
        ...normalized,
        id,
        created_at: existing.exists() ? String(existing.data().created_at) : now,
        updated_at: now
      };
      transaction.set(ref, budget);
      return budget;
    });
  },

  async remove(accountId: number, year: number, month: number, uid = getAuthenticatedUid()) {
    await deleteDoc(userDocument('budgets', budgetDocumentId(accountId, year, month), uid));
  }
};
