import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { randomUUID } from 'node:crypto';

export default async function globalSetup() {
  const app = initializeApp({ projectId: 'demo-control-financiero-ruben', credential: applicationDefault() }, `e2e-${Date.now()}`);
  const auth = getAuth(app);
  const email = 'owner@example.test';
  const password = `Test-${randomUUID()}`;
  process.env.E2E_TEST_EMAIL = email;
  process.env.E2E_TEST_PASSWORD = password;
  let user;
  try { user = await auth.getUserByEmail(email); user = await auth.updateUser(user.uid, { password, emailVerified: true }); }
  catch { user = await auth.createUser({ email, password, emailVerified: true }); }
  await auth.setCustomUserClaims(user.uid, { migration_owner: true });
  const uid = user.uid;
  const db = getFirestore(app);
  const now = '2026-07-09T00:00:00.000Z';
  const batch = db.batch();
  batch.set(db.doc(`users/${uid}/accounts/1`), { id: 1, name: 'General', description: 'Cuenta sintetica', color: '#D97706', icon: 'Wallet', active: true, current_balance: -120817273, created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/accounts/2`), { id: 2, name: 'Ahorro', description: 'Cuenta secundaria', color: '#16A34A', icon: 'Wallet', active: true, current_balance: 500000, created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/categories/1`), { id: 1, name: 'Ingreso extra', type: 'income', color: '#16A34A', icon: 'Circle', active: true, created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/categories/2`), { id: 2, name: 'Alimentaci\u00f3n', type: 'expense', color: '#F97316', icon: 'Circle', active: true, created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/categories/3`), { id: 3, name: 'Otros gastos', type: 'expense', color: '#DC2626', icon: 'Circle', active: true, created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/categories/4`), { id: 4, name: 'Educaci\u00f3n', type: 'expense', color: '#2563EB', icon: 'Circle', active: true, created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/categories/5`), { id: 5, name: 'Tecnolog\u00eda', type: 'expense', color: '#7C3AED', icon: 'Circle', active: true, created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/movements/1`), { id: 1, account_id: 1, type: 'income', amount: 1750000, date: '2026-07-09', category_id: 1, description: 'Saldo que me qued\u00f3 del mes anterior', payment_method: '', notes: '', tag: '', place: '', is_necessary: true, is_recurring: false, created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/movements/2`), { id: 2, account_id: 1, type: 'expense', amount: 450000, date: '2026-07-09', category_id: 2, description: 'Pago de comida del mes de junio', payment_method: '', notes: '', tag: '', place: '', is_necessary: true, is_recurring: false, created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/movements/3`), { id: 3, account_id: 1, type: 'expense', amount: 1250000, date: '2026-07-09', category_id: 3, description: 'Pago de la salud y pensi\u00f3n para cobrar el mes anterior', payment_method: '', notes: '', tag: '', place: '', is_necessary: true, is_recurring: false, created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/movements/4`), { id: 4, account_id: 1, type: 'expense', amount: 867273, date: '2026-07-09', category_id: 4, description: 'Pago de la cuota de especializaci\u00f3n', payment_method: '', notes: '', tag: '', place: '', is_necessary: true, is_recurring: false, created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/movements/5`), { id: 5, account_id: 1, type: 'expense', amount: 120000000, date: '2026-07-09', category_id: 5, description: 'Pago tarjeta NU', payment_method: '', notes: '', tag: '', place: '', is_necessary: false, is_recurring: false, created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/budgets/1-2026-7`), { id: 1, account_id: 1, year: 2026, month: 7, total_budget: 1500000, saving_goal: 300000, unnecessary_expense_limit: 250000, category_budgets: [{ category_id: 1, amount_limit: 1200000 }], created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/meta/counters`), { accountId: 2, categoryId: 5, movementId: 5, budgetId: 1 });
  batch.set(db.doc(`users/${uid}/meta/initialization`), { categoriesSeedVersion: 1, defaultAccountCreated: true, initializedAt: now });
  await batch.commit();
}
