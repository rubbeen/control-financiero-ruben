import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export default async function globalSetup() {
  const app = initializeApp({ projectId: 'demo-control-financiero-ruben', credential: applicationDefault() }, `e2e-${Date.now()}`);
  const auth = getAuth(app);
  let user;
  try { user = await auth.getUserByEmail('ribenp7@gmail.com'); }
  catch { user = await auth.createUser({ email: 'ribenp7@gmail.com', password: 'Prueba-segura-123', emailVerified: true }); }
  if (!user.emailVerified) await auth.updateUser(user.uid, { emailVerified: true });
  const uid = user.uid;
  const db = getFirestore(app);
  const now = '2026-07-09T00:00:00.000Z';
  const batch = db.batch();
  batch.set(db.doc(`users/${uid}/accounts/1`), { id: 1, name: 'General', description: 'Cuenta de prueba', color: '#D97706', icon: 'Wallet', active: true, current_balance: 1350000, created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/accounts/2`), { id: 2, name: 'Ahorro', description: 'Cuenta secundaria', color: '#16A34A', icon: 'Wallet', active: true, current_balance: 500000, created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/categories/1`), { id: 1, name: 'Alimentacion extensa para responsive', type: 'expense', color: '#F97316', icon: 'Circle', active: true, created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/categories/2`), { id: 2, name: 'Salario', type: 'income', color: '#16A34A', icon: 'Circle', active: true, created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/movements/1`), { id: 1, account_id: 1, type: 'income', amount: 2500000, date: '2026-07-01', category_id: 2, description: 'Ingreso ficticio', payment_method: '', notes: '', tag: '', place: '', is_necessary: true, is_recurring: false, created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/movements/2`), { id: 2, account_id: 1, type: 'expense', amount: 950000, date: '2026-07-03', category_id: 1, description: 'Movimiento ficticio con descripcion muy larga para validar el ajuste responsive', payment_method: '', notes: '', tag: '', place: '', is_necessary: true, is_recurring: false, created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/movements/3`), { id: 3, account_id: 1, type: 'expense', amount: 200000, date: '2026-07-05', category_id: 1, description: 'Compra ficticia', payment_method: '', notes: '', tag: '', place: '', is_necessary: false, is_recurring: false, created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/budgets/1-2026-7`), { id: 1, account_id: 1, year: 2026, month: 7, total_budget: 1500000, saving_goal: 300000, unnecessary_expense_limit: 250000, category_budgets: [{ category_id: 1, amount_limit: 1200000 }], created_at: now, updated_at: now });
  batch.set(db.doc(`users/${uid}/meta/counters`), { accountId: 2, categoryId: 2, movementId: 3, budgetId: 1 });
  batch.set(db.doc(`users/${uid}/meta/initialization`), { categoriesSeedVersion: 1, defaultAccountCreated: true, initializedAt: now });
  await batch.commit();
}
