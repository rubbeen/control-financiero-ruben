import { deleteDoc, getDocs, limit, query, runTransaction, updateDoc, where } from 'firebase/firestore';
import { Category } from '../types/finance';
import { db, nowISO } from './firebase';
import { ensureUserInitialized, getAuthenticatedUid, nextTransactionalId, userCollection, userDocument } from './firestoreHelpers';

export const categoriesService = {
  async list(includeInactive = false, uid = getAuthenticatedUid()): Promise<Category[]> {
    await ensureUserInitialized(uid);
    const snapshot = await getDocs(userCollection('categories', uid));
    const rows = snapshot.docs.map((item) => item.data() as Category).sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
    return includeInactive ? rows : rows.filter((item) => item.active);
  },

  async create(data: Partial<Category>, uid = getAuthenticatedUid()): Promise<Category> {
    const now = nowISO();
    return runTransaction(db, async (transaction) => {
      const id = await nextTransactionalId(transaction, uid, 'categoryId');
      const category: Category = {
        id,
        name: String(data.name || '').trim(),
        type: data.type || 'expense',
        color: data.color || '#6B7280',
        icon: data.icon || 'Circle',
        active: data.active ?? true,
        created_at: now,
        updated_at: now
      };
      transaction.set(userDocument('categories', id, uid), category);
      return category;
    });
  },

  async update(id: number, data: Partial<Category>, uid = getAuthenticatedUid()): Promise<void> {
    const { id: _id, created_at: _created, ...allowed } = data;
    void _id;
    void _created;
    await updateDoc(userDocument('categories', id, uid), { ...allowed, updated_at: nowISO() });
  },

  async remove(id: number, uid = getAuthenticatedUid()): Promise<{ message: string }> {
    const used = await getDocs(query(userCollection('movements', uid), where('category_id', '==', id), limit(1)));
    if (!used.empty) {
      await updateDoc(userDocument('categories', id, uid), { active: false, updated_at: nowISO() });
      return { message: 'La categoria tiene movimientos y fue desactivada para conservar el historial.' };
    }
    await deleteDoc(userDocument('categories', id, uid));
    return { message: 'Categoria eliminada correctamente.' };
  }
};
