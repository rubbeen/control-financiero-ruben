import { writeBatch, collection, getDocs, doc } from 'firebase/firestore';
import { Budget, Category, FinanceAccount, Movement } from '../types/finance';
import { db } from './firebase';
import { categoriesService } from './categories';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const backupService = {
  async exportJson() {
    const [accountsSnapshot, movementsSnapshot, budgetsSnapshot] = await Promise.all([
      getDocs(collection(db, 'accounts')),
      getDocs(collection(db, 'movements')),
      getDocs(collection(db, 'budgets'))
    ]);
    const data = {
      version: 3,
      storage: 'firebase-firestore',
      generated_at: new Date().toISOString(),
      accounts: accountsSnapshot.docs.map((item) => item.data()),
      categories: await categoriesService.list(true),
      movements: movementsSnapshot.docs.map((item) => item.data()),
      budgets: budgetsSnapshot.docs.map((item) => item.data())
    };
    downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'control-financiero-backup.json');
  },

  async exportCsv() {
    const snapshot = await getDocs(collection(db, 'movements'));
    const movements = snapshot.docs.map((item) => item.data() as Movement);
    const headers = ['id', 'account_id', 'type', 'amount', 'date', 'category_id', 'description', 'payment_method', 'is_necessary', 'is_recurring'];
    const rows = movements.map((item) => headers.map((key) => JSON.stringify((item as any)[key] ?? '')).join(','));
    downloadBlob(new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' }), 'movimientos-control-financiero.csv');
  },

  async importJson(file: File) {
    const data = JSON.parse(await file.text());
    if (!data || !Array.isArray(data.categories) || !Array.isArray(data.movements)) {
      throw new Error('El respaldo no tiene la estructura esperada.');
    }
    const existingSnapshot = await getDocs(collection(db, 'movements'));
    const existingMovements = new Set(existingSnapshot.docs.map((item) => {
      const movement = item.data() as Movement;
      return `${movement.account_id || 1}-${movement.type}-${movement.amount}-${movement.date}-${movement.category_id}-${movement.description}`;
    }));
    const batch = writeBatch(db);
    let importedAccounts = 0;
    let importedCategories = 0;
    let importedMovements = 0;
    let importedBudgets = 0;
    let skipped = 0;

    for (const account of (data.accounts || []) as FinanceAccount[]) {
      batch.set(doc(db, 'accounts', String(account.id)), account, { merge: true });
      importedAccounts += 1;
    }

    for (const category of data.categories as Category[]) {
      batch.set(doc(db, 'categories', String(category.id)), category, { merge: true });
      importedCategories += 1;
    }

    for (const movement of data.movements as Movement[]) {
      const signature = `${movement.account_id || 1}-${movement.type}-${movement.amount}-${movement.date}-${movement.category_id}-${movement.description}`;
      if (existingMovements.has(signature)) {
        skipped += 1;
        continue;
      }
      batch.set(doc(db, 'movements', String(movement.id)), movement, { merge: true });
      importedMovements += 1;
    }

    for (const budget of (data.budgets || []) as Budget[]) {
      batch.set(doc(db, 'budgets', String(budget.id)), budget, { merge: true });
      importedBudgets += 1;
    }

    await batch.commit();
    return { imported_accounts: importedAccounts, imported_categories: importedCategories, imported_movements: importedMovements, imported_budgets: importedBudgets, skipped_duplicates: skipped };
  }
};
