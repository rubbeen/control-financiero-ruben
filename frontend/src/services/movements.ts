import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { Movement, MovementInput } from '../types/finance';
import { db, nowISO } from './firebase';
import { nextNumericId } from './firestoreHelpers';
import { categoriesService } from './categories';
import { DEFAULT_ACCOUNT_ID, getActiveAccountId } from './accounts';

const COLLECTION = 'movements';

async function decorate(movement: Movement): Promise<Movement> {
  const categories = await categoriesService.list(true);
  const category = categories.find((item) => item.id === movement.category_id);
  return {
    ...movement,
    category_name: category?.name,
    category_color: category?.color
  };
}

export const movementsService = {
  async list(year?: number, month?: number): Promise<Movement[]> {
    const snapshot = await getDocs(collection(db, COLLECTION));
    const activeAccountId = getActiveAccountId();
    let rows = snapshot.docs.map((item) => item.data() as Movement);
    rows = rows.filter((item) => (item.account_id || DEFAULT_ACCOUNT_ID) === activeAccountId);
    if (year) rows = rows.filter((item) => item.date.startsWith(String(year)));
    if (year && month) rows = rows.filter((item) => item.date.startsWith(`${year}-${String(month).padStart(2, '0')}`));
    rows.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
    return Promise.all(rows.map(decorate));
  },

  async get(id: number): Promise<Movement> {
    const snapshot = await getDoc(doc(db, COLLECTION, String(id)));
    if (!snapshot.exists()) throw new Error('Movimiento no encontrado.');
    return decorate(snapshot.data() as Movement);
  },

  async create(data: MovementInput): Promise<Movement> {
    const now = nowISO();
    const movement: Movement = {
      ...data,
      id: await nextNumericId(COLLECTION),
      account_id: data.account_id || getActiveAccountId(),
      amount: Number(data.amount),
      category_id: Number(data.category_id),
      created_at: now,
      updated_at: now
    };
    await setDoc(doc(db, COLLECTION, String(movement.id)), movement);
    return decorate(movement);
  },

  async update(id: number, data: Partial<MovementInput>): Promise<Movement> {
    await updateDoc(doc(db, COLLECTION, String(id)), { ...data, updated_at: nowISO() });
    return this.get(id);
  },

  async remove(id: number): Promise<{ message: string }> {
    await deleteDoc(doc(db, COLLECTION, String(id)));
    return { message: 'Movimiento eliminado correctamente.' };
  }
};
