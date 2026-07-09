import { collection, deleteDoc, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { Category } from '../types/finance';
import { db, nowISO } from './firebase';
import { nextNumericId, seedCollection } from './firestoreHelpers';
import { initialCategories } from './seedData';

const COLLECTION = 'categories';

async function ensureSeeded() {
  await seedCollection(COLLECTION, initialCategories);
}

export const categoriesService = {
  async list(includeInactive = false): Promise<Category[]> {
    await ensureSeeded();
    const snapshot = await getDocs(collection(db, COLLECTION));
    const rows = snapshot.docs.map((item) => item.data() as Category).sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
    return includeInactive ? rows : rows.filter((item) => item.active);
  },

  async create(data: Partial<Category>): Promise<Category> {
    const now = nowISO();
    const category: Category = {
      id: await nextNumericId(COLLECTION),
      name: String(data.name || '').trim(),
      type: data.type || 'expense',
      color: data.color || '#6B7280',
      icon: data.icon || 'Circle',
      active: data.active ?? true,
      created_at: now,
      updated_at: now
    };
    await setDoc(doc(db, COLLECTION, String(category.id)), category);
    return category;
  },

  async update(id: number, data: Partial<Category>): Promise<Category> {
    const updated = { ...data, updated_at: nowISO() };
    await updateDoc(doc(db, COLLECTION, String(id)), updated);
    return { ...(updated as Category), id } as Category;
  },

  async remove(id: number): Promise<{ message: string }> {
    const movements = await getDocs(query(collection(db, 'movements'), where('category_id', '==', id)));
    if (!movements.empty) {
      await updateDoc(doc(db, COLLECTION, String(id)), { active: false, updated_at: nowISO() });
      return { message: 'La categoria tiene movimientos y fue desactivada para conservar el historial.' };
    }
    await deleteDoc(doc(db, COLLECTION, String(id)));
    return { message: 'Categoria eliminada correctamente.' };
  }
};
