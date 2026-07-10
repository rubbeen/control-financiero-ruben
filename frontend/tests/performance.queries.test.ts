// @vitest-environment node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc, where, writeBatch } from 'firebase/firestore';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const uid = 'performance-owner';
let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-control-financiero-ruben', firestore: { rules: readFileSync(resolve('..', 'firestore.rules'), 'utf8'), host: '127.0.0.1', port: 8080 } });
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    for (let account = 1; account <= 3; account += 1) await setDoc(doc(db, `users/${uid}/accounts/${account}`), { id: account, name: `Cuenta ${account}`, description: '', color: '#D97706', icon: 'Wallet', active: true, current_balance: 0, created_at: '2026-01-01', updated_at: '2026-01-01' });
    for (let category = 1; category <= 20; category += 1) await setDoc(doc(db, `users/${uid}/categories/${category}`), { id: category, name: `Categoria ${category}`, type: category <= 5 ? 'income' : 'expense', color: '#2563EB', icon: 'Circle', active: true, created_at: '2026-01-01', updated_at: '2026-01-01' });
    await setDoc(doc(db, `users/${uid}/budgets/1-2026-12`), { id: 1, account_id: 1, year: 2026, month: 12, total_budget: 2000000, saving_goal: 200000, unnecessary_expense_limit: 100000, category_budgets: [], created_at: '2026-01-01', updated_at: '2026-01-01' });
    for (let offset = 0; offset < 5000; offset += 400) {
      const batch = writeBatch(db);
      for (let index = offset; index < Math.min(5000, offset + 400); index += 1) {
        const accountId = index % 3 + 1;
        const month = index % 12 + 1;
        const day = index % 28 + 1;
        const type = index % 5 === 0 ? 'income' : 'expense';
        batch.set(doc(db, `users/${uid}/movements/${index + 1}`), { id: index + 1, account_id: accountId, type, amount: 1000 + index, date: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, category_id: type === 'income' ? 1 : index % 15 + 6, description: `Movimiento ficticio ${index + 1}`, payment_method: '', notes: '', tag: '', place: '', is_necessary: index % 2 === 0, is_recurring: false, created_at: '2026-01-01', updated_at: '2026-01-01' });
      }
      await batch.commit();
    }
  });
}, 120_000);

afterAll(async () => env.cleanup());

describe('consultas acotadas con 5.000 movimientos ficticios', () => {
  it('mide Dashboard e Historial sin lecturas completas', async () => {
    const db = env.authenticatedContext(uid, { email: 'owner@example.test', email_verified: true }).firestore();
    const memoryBefore = process.memoryUsage().heapUsed;
    const start = performance.now();
    const [account, categories, budget, range, latest] = await Promise.all([
      getDoc(doc(db, `users/${uid}/accounts/1`)),
      getDocs(collection(db, `users/${uid}/categories`)),
      getDoc(doc(db, `users/${uid}/budgets/1-2026-12`)),
      getDocs(query(collection(db, `users/${uid}/movements`), where('account_id', '==', 1), where('date', '>=', '2026-07-01'), where('date', '<=', '2026-12-31'), orderBy('date', 'desc'), orderBy('id', 'desc'), limit(2000))),
      getDocs(query(collection(db, `users/${uid}/movements`), where('account_id', '==', 1), orderBy('date', 'desc'), orderBy('id', 'desc'), limit(5)))
    ]);
    const dashboardMs = performance.now() - start;
    const historyStart = performance.now();
    const history = await getDocs(query(collection(db, `users/${uid}/movements`), where('account_id', '==', 1), where('date', '>=', '2026-10-01'), where('date', '<=', '2026-10-31'), orderBy('date', 'desc'), orderBy('id', 'desc'), limit(50)));
    const historyMs = performance.now() - historyStart;
    const documents = Number(account.exists()) + categories.size + Number(budget.exists()) + range.size + latest.size;
    const report = {
      generatedAt: new Date().toISOString(),
      fixture: { movements: 5000, categories: 20, months: 12, accounts: 3 },
      dashboardInitial: { logicalQueries: 5, documentsRead: documents, firestoreMs: Number(dashboardMs.toFixed(2)), calculationMs: 'not measured in this Firestore-only run', totalMs: Number(dashboardMs.toFixed(2)), approximateHeapDeltaBytes: process.memoryUsage().heapUsed - memoryBefore },
      dashboardFromCache: { logicalQueries: 0, documentsRead: 0, timing: 'React Query cache covered by unit/component behavior; browser timing measured in perf:e2e' },
      accountSwitch: { logicalQueries: 4, note: 'accounts and categories remain cached; budget, range, latest and account state change' },
      analysis: { logicalQueries: 0, note: 'reuses Dashboard query key when period and trendMonths are compatible' },
      comparisons: { logicalQueries: 2, note: 'one bounded range and budget; categories/account cached' },
      historyPage1: { logicalQueries: 1, documentsRead: history.size, firestoreMs: Number(historyMs.toFixed(2)) },
      historyNextPage: { logicalQueries: 1, maximumDocumentsRead: 50, cursor: 'date,id' },
      mutations: { create: 'one Firestore transaction', edit: 'one Firestore transaction', delete: 'one Firestore transaction' }
    };
    const reportDir = resolve('..', 'LOCAL_RELEASE_REPORT');
    mkdirSync(reportDir, { recursive: true });
    writeFileSync(resolve(reportDir, 'PERF_QUERIES.json'), JSON.stringify(report, null, 2));
    expect(range.size).toBeLessThan(5000);
    expect(history.size).toBeLessThanOrEqual(50);
    expect(latest.size).toBeLessThanOrEqual(5);
  }, 120_000);
});
