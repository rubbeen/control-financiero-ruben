import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db, nowISO } from './firebase';

export async function nextNumericId(collectionName: string): Promise<number> {
  const snapshot = await getDocs(collection(db, collectionName));
  const max = snapshot.docs.reduce((current, item) => Math.max(current, Number(item.data().id || 0)), 0);
  return max + 1;
}

export async function seedCollection<T extends { id: number; created_at: string; updated_at: string }>(collectionName: string, rows: T[]) {
  const snapshot = await getDocs(collection(db, collectionName));
  if (!snapshot.empty) return;
  const batch = writeBatch(db);
  const now = nowISO();
  rows.forEach((row) => {
    batch.set(doc(db, collectionName, String(row.id)), { ...row, created_at: now, updated_at: now });
  });
  await batch.commit();
}
