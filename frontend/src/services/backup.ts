import { doc, getDocs, writeBatch } from 'firebase/firestore';
import { Budget, Category, FinanceAccount, Movement } from '../types/finance';
import { movementSignedAmount } from '../utils/calculations';
import { db } from './firebase';
import { getAuthenticatedUid, userCollection, userDocument } from './firestoreHelpers';
import { decryptBackup, encryptBackup, EncryptedEnvelope } from './backupCrypto';
import { movementsService } from './movements';
import type { PreparedFile } from './fileExport';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_ROWS = 5000;

export interface BackupData {
  format: 'control-financiero-ruben';
  version: 4;
  generated_at: string;
  accounts: FinanceAccount[];
  categories: Category[];
  movements: Movement[];
  budgets: Budget[];
}

function validate(data: unknown): BackupData {
  if (!data || typeof data !== 'object') throw new Error('El respaldo no contiene datos validos.');
  const value = data as BackupData;
  if (value.format !== 'control-financiero-ruben' || value.version !== 4) throw new Error('La version del respaldo no es compatible.');
  for (const key of ['accounts', 'categories', 'movements', 'budgets'] as const) if (!Array.isArray(value[key]) || value[key].length > MAX_ROWS) throw new Error(`La seccion ${key} es invalida o demasiado grande.`);
  const only = (item: object, keys: string[]) => Object.keys(item).every((key) => keys.includes(key));
  value.accounts.forEach((item) => {
    if (!only(item, ['id', 'name', 'description', 'color', 'icon', 'active', 'current_balance', 'created_at', 'updated_at']) || !Number.isInteger(item.id) || item.id <= 0 || !item.name || item.name.length > 80 || typeof item.current_balance !== 'number' || typeof item.active !== 'boolean') throw new Error('Existe una cuenta invalida.');
  });
  value.categories.forEach((item) => {
    if (!only(item, ['id', 'name', 'type', 'color', 'icon', 'active', 'created_at', 'updated_at']) || !Number.isInteger(item.id) || item.id <= 0 || !item.name || item.name.length > 80 || !['income', 'expense', 'both'].includes(item.type) || typeof item.active !== 'boolean') throw new Error('Existe una categoria invalida.');
  });
  value.movements.forEach((item) => {
    const allowed = ['id', 'account_id', 'type', 'amount', 'date', 'category_id', 'description', 'payment_method', 'notes', 'tag', 'place', 'is_necessary', 'is_recurring', 'adjustment_direction', 'source_account_id', 'destination_account_id', 'transfer_group_id', 'transfer_direction', 'needs_review', 'created_at', 'updated_at'];
    if (!only(item, allowed) || !Number.isInteger(item.id) || item.id <= 0 || !Number.isInteger(item.account_id) || item.account_id! <= 0 || !Number.isInteger(item.category_id) || !Number.isInteger(item.amount) || item.amount <= 0 || item.amount > 1_000_000_000_000 || !/^\d{4}-\d{2}-\d{2}$/.test(item.date) || !item.description || item.description.length > 200 || !['income', 'expense', 'purchase', 'transfer', 'adjustment'].includes(item.type) || typeof item.is_necessary !== 'boolean' || typeof item.is_recurring !== 'boolean') throw new Error('Existe un movimiento invalido.');
    if (item.type === 'adjustment' && !['in', 'out'].includes(item.adjustment_direction || '')) throw new Error('El respaldo contiene un ajuste sin direccion.');
    if (item.type === 'transfer' && (!item.source_account_id || !item.destination_account_id || !item.transfer_group_id || !['in', 'out'].includes(item.transfer_direction || ''))) throw new Error('El respaldo contiene una transferencia incompleta.');
  });
  value.budgets.forEach((item) => {
    if (!only(item, ['id', 'account_id', 'year', 'month', 'total_budget', 'saving_goal', 'unnecessary_expense_limit', 'category_budgets', 'created_at', 'updated_at']) || !Number.isInteger(item.id) || !Number.isInteger(item.account_id) || !Number.isInteger(item.year) || !Number.isInteger(item.month) || item.month < 1 || item.month > 12 || !Array.isArray(item.category_budgets) || item.category_budgets.length > 10 || [item.total_budget, item.saving_goal, item.unnecessary_expense_limit].some((amount) => !Number.isInteger(amount) || amount < 0)) throw new Error('Existe un presupuesto invalido.');
    item.category_budgets.forEach((row) => { if (!only(row, ['category_id', 'amount_limit']) || !Number.isInteger(row.category_id) || !Number.isInteger(row.amount_limit) || row.amount_limit < 0) throw new Error('Existe un limite por categoria invalido.'); });
  });
  return value;
}

async function readData(uid: string): Promise<BackupData> {
  const snapshots = await Promise.all(['accounts', 'categories', 'movements', 'budgets'].map((name) => getDocs(userCollection(name as 'accounts', uid))));
  return { format: 'control-financiero-ruben', version: 4, generated_at: new Date().toISOString(), accounts: snapshots[0].docs.map((item) => item.data() as FinanceAccount), categories: snapshots[1].docs.map((item) => item.data() as Category), movements: snapshots[2].docs.map((item) => item.data() as Movement), budgets: snapshots[3].docs.map((item) => item.data() as Budget) };
}

export function csvCell(value: unknown) {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export const backupService = {
  async generateEncryptedBackup(password: string, filenamePrefix = 'control-financiero'): Promise<PreparedFile & { metadata: { formatVersion: number; generatedAt: string } }> {
    const uid = getAuthenticatedUid();
    const envelope = await encryptBackup(await readData(uid), password);
    const date = new Date().toISOString().slice(0, 10);
    const generatedAt = new Date().toISOString();
    return { bytes: new TextEncoder().encode(JSON.stringify(envelope)), filename: `${filenamePrefix}-${date}.cfrbackup`, mimeType: 'application/octet-stream', metadata: { formatVersion: 4, generatedAt } };
  },

  async preview(file: File, password: string) {
    if (file.size > MAX_FILE_SIZE) throw new Error('El archivo supera el limite de 10 MB.');
    const envelope = JSON.parse(await file.text()) as EncryptedEnvelope;
    const data = validate(await decryptBackup(envelope, password));
    const uid = getAuthenticatedUid();
    const existing = await readData(uid);
    const ids = {
      accounts: new Set(existing.accounts.map((item) => item.id)),
      categories: new Set(existing.categories.map((item) => item.id)),
      movements: new Set(existing.movements.map((item) => item.id)),
      budgets: new Set(existing.budgets.map((item) => `${item.account_id}-${item.year}-${item.month}`))
    };
    return { data, counts: { accounts: data.accounts.length, categories: data.categories.length, movements: data.movements.length, budgets: data.budgets.length }, conflicts: data.accounts.filter((item) => ids.accounts.has(item.id)).length + data.categories.filter((item) => ids.categories.has(item.id)).length + data.movements.filter((item) => ids.movements.has(item.id)).length + data.budgets.filter((item) => ids.budgets.has(`${item.account_id}-${item.year}-${item.month}`)).length };
  },

  async importEncrypted(file: File, password: string, onProgress: (value: number) => void, signal?: AbortSignal) {
    const preview = await this.preview(file, password);
    const uid = getAuthenticatedUid();
    const existing = await readData(uid);
    const accountIds = new Set(existing.accounts.map((item) => item.id));
    const newAccounts = preview.data.accounts.filter((item) => !accountIds.has(item.id));
    const allowedAccountIds = new Set([...accountIds, ...newAccounts.map((item) => item.id)]);
    const categoryIds = new Set(existing.categories.map((item) => item.id));
    const movementIds = new Set(existing.movements.map((item) => item.id));
    const budgetKeys = new Set(existing.budgets.map((item) => `${item.account_id}-${item.year}-${item.month}`));
    const writes: { collection: 'accounts' | 'categories' | 'movements' | 'budgets'; id: string; data: object }[] = [];
    newAccounts.forEach((item) => writes.push({ collection: 'accounts', id: String(item.id), data: { ...item, current_balance: 0 } }));
    preview.data.categories.filter((item) => !categoryIds.has(item.id)).forEach((item) => writes.push({ collection: 'categories', id: String(item.id), data: item }));
    preview.data.movements.filter((item) => !movementIds.has(item.id) && allowedAccountIds.has(item.account_id!)).forEach((item) => writes.push({ collection: 'movements', id: String(item.id), data: item }));
    preview.data.budgets.filter((item) => !budgetKeys.has(`${item.account_id}-${item.year}-${item.month}`)).forEach((item) => writes.push({ collection: 'budgets', id: `${item.account_id}-${item.year}-${item.month}`, data: item }));
    for (let offset = 0; offset < writes.length; offset += 350) {
      if (signal?.aborted) throw new DOMException('Importacion cancelada.', 'AbortError');
      const batch = writeBatch(db);
      writes.slice(offset, offset + 350).forEach((item) => batch.set(userDocument(item.collection, item.id, uid), item.data));
      await batch.commit();
      onProgress(Math.round(Math.min(90, ((offset + 350) / Math.max(writes.length, 1)) * 90)));
    }
    const finalMovements = [...existing.movements, ...preview.data.movements.filter((item) => !movementIds.has(item.id) && allowedAccountIds.has(item.account_id!))];
    const balances = new Map<number, number>();
    finalMovements.forEach((item) => balances.set(item.account_id!, (balances.get(item.account_id!) || 0) + movementSignedAmount(item)));
    const balanceBatch = writeBatch(db);
    if (signal?.aborted) throw new DOMException('Importacion cancelada.', 'AbortError');
    [...existing.accounts, ...newAccounts].forEach((account) => balanceBatch.update(userDocument('accounts', account.id, uid), { current_balance: Math.round(balances.get(account.id) || 0), updated_at: new Date().toISOString() }));
    balanceBatch.set(doc(db, 'users', uid, 'meta', 'counters'), {
      accountId: Math.max(1, ...existing.accounts.map((item) => item.id), ...preview.data.accounts.map((item) => item.id)),
      categoryId: Math.max(1, ...existing.categories.map((item) => item.id), ...preview.data.categories.map((item) => item.id)),
      movementId: Math.max(0, ...existing.movements.map((item) => item.id), ...preview.data.movements.map((item) => item.id)),
      budgetId: Math.max(0, ...existing.budgets.map((item) => item.id), ...preview.data.budgets.map((item) => item.id))
    }, { merge: true });
    await balanceBatch.commit();
    onProgress(100);
    return { imported: writes.length, skipped: preview.conflicts };
  },

  async generateAccountCsv(accountId: number): Promise<PreparedFile & { rowCount: number }> {
    const uid = getAuthenticatedUid();
    const [movements, categories] = await Promise.all([
      movementsService.getAllByRange({ uid, accountId, startDate: '0001-01-01', endDate: '9999-12-31' }),
      getDocs(userCollection('categories', uid))
    ]);
    const categoryMap = new Map(categories.docs.map((item) => [Number(item.data().id), String(item.data().name)]));
    const headers = ['id', 'tipo', 'valor_cop', 'fecha', 'categoria', 'descripcion', 'metodo_pago', 'necesario'];
    const rows = movements.map((item) => [item.id, item.type, item.amount, item.date, categoryMap.get(item.category_id) || '', item.description, item.payment_method || '', item.is_necessary ? 'si' : 'no'].map(csvCell).join(','));
    return { bytes: new TextEncoder().encode(`\ufeff${headers.join(',')}\r\n${rows.join('\r\n')}`), filename: `movimientos-cuenta-${accountId}.csv`, mimeType: 'text/csv', rowCount: rows.length };
  }
};
