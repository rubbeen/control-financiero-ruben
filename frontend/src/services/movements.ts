import {
  QueryConstraint,
  Transaction,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  startAfter,
  where
} from 'firebase/firestore';
import { Category, Movement, MovementFilters, MovementInput } from '../types/finance';
import { movementSignedAmount } from '../utils/calculations';
import { db, nowISO } from './firebase';
import { ensureUserInitialized, getAuthenticatedUid, nextTransactionalId, nextTransactionalIds, userCollection, userDocument } from './firestoreHelpers';

export interface MovementPage {
  items: Movement[];
  cursor: MovementCursor | null;
  hasMore: boolean;
}

export interface MovementCursor { date: string; id: number }

function integerAmount(value: number) {
  const amount = Math.round(Number(value));
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 1_000_000_000_000) throw new Error('Ingresa un valor COP valido mayor que cero.');
  return amount;
}

function cleanInput(data: Partial<MovementInput>): Partial<MovementInput> {
  return Object.fromEntries(Object.entries({
    account_id: data.account_id,
    type: data.type,
    amount: data.amount === undefined ? undefined : integerAmount(data.amount),
    date: data.date,
    category_id: data.category_id === undefined ? undefined : Number(data.category_id),
    description: data.description?.trim(),
    payment_method: data.payment_method ?? '',
    notes: data.notes ?? '',
    tag: data.tag ?? '',
    place: data.place ?? '',
    is_necessary: data.is_necessary,
    is_recurring: data.is_recurring,
    adjustment_direction: data.adjustment_direction,
    source_account_id: data.source_account_id,
    destination_account_id: data.destination_account_id
  }).filter(([, value]) => value !== undefined)) as Partial<MovementInput>;
}

function missingIndex(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error
    && String((error as { code?: string }).code).includes('failed-precondition');
}

function byNewest(a: Movement, b: Movement) {
  return b.date.localeCompare(a.date) || b.id - a.id;
}

async function compatibleAccountMovements(uid: string, accountId: number, maximum = 5000) {
  const snapshot = await getDocs(query(userCollection('movements', uid), where('account_id', '==', accountId), limit(maximum)));
  return snapshot.docs.map((item) => item.data() as Movement).sort(byNewest);
}

async function updateBalances(transaction: Transaction, uid: string, deltas: Map<number, number>) {
  const refs = [...deltas.keys()].map((id) => userDocument('accounts', id, uid));
  const snapshots = [];
  for (const ref of refs) snapshots.push(await transaction.get(ref));
  snapshots.forEach((snapshot, index) => {
    if (!snapshot.exists()) throw new Error('Una cuenta de la operacion ya no existe.');
    const delta = deltas.get(Number(snapshot.data().id)) || 0;
    transaction.update(refs[index], { current_balance: Math.round(Number(snapshot.data().current_balance || 0) + delta), updated_at: nowISO() });
  });
}

export function decorateMovements(rows: Movement[], categories: Category[]): Movement[] {
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  return rows.map((movement) => ({
    ...movement,
    category_name: categoryMap.get(movement.category_id)?.name,
    category_color: categoryMap.get(movement.category_id)?.color
  }));
}

export const movementsService = {
  async getMovementsByRange({ uid = getAuthenticatedUid(), accountId, filters, cursor = null }: {
    uid?: string;
    accountId: number;
    filters: MovementFilters;
    cursor?: MovementCursor | null;
  }): Promise<MovementPage> {
    await ensureUserInitialized(uid);
    const pageSize = Math.min(Math.max(filters.pageSize || 50, 1), 100);
    const constraints: QueryConstraint[] = [
      where('account_id', '==', accountId),
      where('date', '>=', filters.startDate),
      where('date', '<=', filters.endDate)
    ];
    if (filters.categoryId) constraints.push(where('category_id', '==', filters.categoryId));
    if (filters.type) constraints.push(where('type', '==', filters.type));
    constraints.push(orderBy('date', 'desc'), orderBy('id', 'desc'));
    if (cursor) constraints.push(startAfter(cursor.date, cursor.id));
    constraints.push(limit(pageSize));
    let rows: Movement[];
    try {
      const snapshot = await getDocs(query(userCollection('movements', uid), ...constraints));
      rows = snapshot.docs.map((item) => item.data() as Movement);
    } catch (error) {
      if (!missingIndex(error)) throw error;
      rows = (await compatibleAccountMovements(uid, accountId))
        .filter((item) => item.date >= filters.startDate && item.date <= filters.endDate)
        .filter((item) => !filters.categoryId || item.category_id === filters.categoryId)
        .filter((item) => !filters.type || item.type === filters.type)
        .filter((item) => !cursor || item.date < cursor.date || (item.date === cursor.date && item.id < cursor.id))
        .slice(0, pageSize);
    }
    return {
      items: rows,
      cursor: rows.length === 0 ? null : { date: rows[rows.length - 1].date, id: rows[rows.length - 1].id },
      hasMore: rows.length === pageSize
    };
  },

  async getLatestMovements({ uid = getAuthenticatedUid(), accountId, count = 5 }: { uid?: string; accountId: number; count?: number }): Promise<Movement[]> {
    await ensureUserInitialized(uid);
    try {
      const snapshot = await getDocs(query(userCollection('movements', uid), where('account_id', '==', accountId), orderBy('date', 'desc'), orderBy('id', 'desc'), limit(Math.min(count, 20))));
      return snapshot.docs.map((item) => item.data() as Movement);
    } catch (error) {
      if (!missingIndex(error)) throw error;
      return (await compatibleAccountMovements(uid, accountId)).slice(0, Math.min(count, 20));
    }
  },

  async getAllByRange({ uid = getAuthenticatedUid(), accountId, startDate, endDate, maxDocuments = 50_000 }: { uid?: string; accountId: number; startDate: string; endDate: string; maxDocuments?: number }): Promise<Movement[]> {
    await ensureUserInitialized(uid);
    try {
      const rows: Movement[] = [];
      let cursor: MovementCursor | null = null;
      while (rows.length < maxDocuments) {
        const constraints: QueryConstraint[] = [
          where('account_id', '==', accountId), where('date', '>=', startDate), where('date', '<=', endDate),
          orderBy('date', 'desc'), orderBy('id', 'desc')
        ];
        if (cursor) constraints.push(startAfter(cursor.date, cursor.id));
        const pageSize = Math.min(500, maxDocuments - rows.length);
        constraints.push(limit(pageSize));
        const snapshot = await getDocs(query(userCollection('movements', uid), ...constraints));
        const page = snapshot.docs.map((item) => item.data() as Movement);
        rows.push(...page);
        if (page.length < pageSize) return rows;
        cursor = { date: page[page.length - 1].date, id: page[page.length - 1].id };
      }
      throw new Error('El periodo supera el limite seguro de analisis. Reduce el rango.');
    } catch (error) {
      if (!missingIndex(error)) throw error;
      const compatible = await compatibleAccountMovements(uid, accountId, Math.min(maxDocuments, 5000));
      if (compatible.length >= Math.min(maxDocuments, 5000)) throw Object.assign(new Error('Falta un indice de Firestore para analizar el periodo completo.'), { cause: error });
      return compatible
        .filter((item) => item.date >= startDate && item.date <= endDate)
        .slice(0, maxDocuments);
    }
  },

  async get(id: number, uid = getAuthenticatedUid()): Promise<Movement> {
    const snapshot = await getDoc(userDocument('movements', id, uid));
    if (!snapshot.exists()) throw new Error('Movimiento no encontrado.');
    return snapshot.data() as Movement;
  },

  async create(data: MovementInput, uid = getAuthenticatedUid()): Promise<Movement> {
    await ensureUserInitialized(uid);
    const accountId = Number(data.account_id);
    if (!accountId) throw new Error('Selecciona una cuenta valida.');
    if (data.type === 'transfer') return this.createTransfer(data, uid);
    if (data.type === 'adjustment' && !data.adjustment_direction) throw new Error('Indica si el ajuste aumenta o reduce el saldo.');

    const now = nowISO();
    return runTransaction(db, async (transaction) => {
      const accountRef = userDocument('accounts', accountId, uid);
      const account = await transaction.get(accountRef);
      if (!account.exists()) throw new Error('La cuenta seleccionada ya no existe.');
      const id = await nextTransactionalId(transaction, uid, 'movementId');
      const movement = { ...cleanInput(data), id, account_id: accountId, created_at: now, updated_at: now } as Movement;
      transaction.set(userDocument('movements', id, uid), movement);
      transaction.update(accountRef, { current_balance: Math.round(Number(account.data().current_balance || 0) + movementSignedAmount(movement)), updated_at: now });
      return movement;
    });
  },

  async createTransfer(data: MovementInput, uid = getAuthenticatedUid()): Promise<Movement> {
    const sourceId = Number(data.source_account_id || data.account_id);
    const destinationId = Number(data.destination_account_id);
    if (!sourceId || !destinationId || sourceId === destinationId) throw new Error('Selecciona una cuenta de destino diferente.');
    const amount = integerAmount(data.amount);
    const now = nowISO();
    const groupId = crypto.randomUUID();

    return runTransaction(db, async (transaction) => {
      const sourceRef = userDocument('accounts', sourceId, uid);
      const destinationRef = userDocument('accounts', destinationId, uid);
      const source = await transaction.get(sourceRef);
      const destination = await transaction.get(destinationRef);
      if (!source.exists() || !destination.exists()) throw new Error('Una cuenta de la transferencia ya no existe.');
      const [outId, inId] = await nextTransactionalIds(transaction, uid, 'movementId', 2);
      const base = { ...cleanInput(data), amount, source_account_id: sourceId, destination_account_id: destinationId, transfer_group_id: groupId, created_at: now, updated_at: now };
      const outgoing = { ...base, id: outId, account_id: sourceId, transfer_direction: 'out' } as Movement;
      const incoming = { ...base, id: inId, account_id: destinationId, transfer_direction: 'in' } as Movement;
      transaction.set(userDocument('movements', outId, uid), outgoing);
      transaction.set(userDocument('movements', inId, uid), incoming);
      transaction.update(sourceRef, { current_balance: Math.round(Number(source.data().current_balance || 0) - amount), updated_at: now });
      transaction.update(destinationRef, { current_balance: Math.round(Number(destination.data().current_balance || 0) + amount), updated_at: now });
      return outgoing;
    });
  },

  async update(id: number, data: Partial<MovementInput>, uid = getAuthenticatedUid()): Promise<Movement> {
    const original = await this.get(id, uid);
    const pair = original.type === 'transfer' && original.transfer_group_id
      ? (await getDocs(query(userCollection('movements', uid), where('transfer_group_id', '==', original.transfer_group_id)))).docs.map((item) => item.data() as Movement)
      : [original];
    const now = nowISO();

    await runTransaction(db, async (transaction) => {
      const movementRefs = pair.map((item) => userDocument('movements', item.id, uid));
      const snapshots = [];
      for (const ref of movementRefs) snapshots.push(await transaction.get(ref));
      const deltas = new Map<number, number>();
      const updates = snapshots.map((snapshot) => {
        if (!snapshot.exists()) throw new Error('El movimiento cambio mientras lo editabas.');
        const oldMovement = snapshot.data() as Movement;
        const clean = cleanInput(data);
        const next = (oldMovement.type === 'transfer'
          ? { ...oldMovement, amount: clean.amount ?? oldMovement.amount, date: clean.date ?? oldMovement.date, description: clean.description ?? oldMovement.description, notes: clean.notes ?? oldMovement.notes, category_id: clean.category_id ?? oldMovement.category_id, updated_at: now }
          : { ...oldMovement, ...clean, updated_at: now }) as Movement;
        if (next.account_id !== oldMovement.account_id || next.type !== oldMovement.type) throw new Error('Para cambiar tipo o cuenta, elimina el movimiento y crea uno nuevo.');
        if (next.type === 'adjustment' && !next.adjustment_direction) throw new Error('Indica la direccion del ajuste.');
        deltas.set(oldMovement.account_id!, (deltas.get(oldMovement.account_id!) || 0) - movementSignedAmount(oldMovement) + movementSignedAmount(next));
        return next;
      });
      await updateBalances(transaction, uid, deltas);
      updates.forEach((movement, index) => transaction.set(movementRefs[index], movement));
    });
    return this.get(id, uid);
  },

  async remove(id: number, uid = getAuthenticatedUid()): Promise<{ message: string }> {
    const original = await this.get(id, uid);
    const pair = original.type === 'transfer' && original.transfer_group_id
      ? (await getDocs(query(userCollection('movements', uid), where('transfer_group_id', '==', original.transfer_group_id)))).docs.map((item) => item.data() as Movement)
      : [original];
    await runTransaction(db, async (transaction) => {
      const refs = pair.map((item) => userDocument('movements', item.id, uid));
      const snapshots = [];
      for (const ref of refs) snapshots.push(await transaction.get(ref));
      const deltas = new Map<number, number>();
      snapshots.forEach((snapshot) => {
        if (!snapshot.exists()) throw new Error('El movimiento ya no existe.');
        const movement = snapshot.data() as Movement;
        deltas.set(movement.account_id!, (deltas.get(movement.account_id!) || 0) - movementSignedAmount(movement));
      });
      await updateBalances(transaction, uid, deltas);
      refs.forEach((ref) => transaction.delete(ref));
    });
    return { message: 'Movimiento eliminado correctamente.' };
  }
};
