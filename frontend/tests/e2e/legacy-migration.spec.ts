import { expect, test } from '@playwright/test';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { testCredentials } from './auth-fixture';

test.skip(process.env.MIGRATION_E2E !== 'true', 'Se ejecuta solo con firebase.transition-test.json.');

test('migra datos raiz al UID sin borrar el origen', async ({ page }) => {
  const app = initializeApp({ projectId: 'demo-control-financiero-ruben', credential: applicationDefault() }, `migration-${Date.now()}`);
  const db = getFirestore(app);
  const credentials = testCredentials();
  const user = await getAuth(app).getUserByEmail(credentials.email);
  await db.recursiveDelete(db.doc(`users/${user.uid}`));

  const now = '2026-07-10T00:00:00.000Z';
  const batch = db.batch();
  batch.set(db.doc('accounts/1'), { id: 1, name: 'General', description: 'Cuenta antigua', color: '#D97706', icon: 'Wallet', active: true, created_at: now, updated_at: now });
  batch.set(db.doc('categories/1'), { id: 1, name: 'Salario', type: 'income', color: '#16A34A', icon: 'Circle', active: true, created_at: now, updated_at: now });
  batch.set(db.doc('categories/2'), { id: 2, name: 'Comida', type: 'expense', color: '#F97316', icon: 'Circle', active: true, created_at: now, updated_at: now });
  batch.set(db.doc('movements/1'), { id: 1, type: 'income', amount: 1000, date: '2026-07-01', category_id: 1, description: 'Ingreso antiguo', is_necessary: true, is_recurring: false, created_at: now, updated_at: now });
  batch.set(db.doc('movements/2'), { id: 2, type: 'expense', amount: 250, date: '2026-07-02', category_id: 2, description: 'Gasto antiguo', is_necessary: true, is_recurring: false, created_at: now, updated_at: now });
  await batch.commit();

  await page.goto('/');
  await page.getByLabel('Correo').fill(credentials.email);
  await page.getByLabel('Contrasena').fill(credentials.password);
  await page.getByRole('button', { name: 'Entrar seguro' }).click();
  await expect(page.locator('h2[aria-label^="Saldo actual"]')).toContainText('750', { timeout: 30_000 });

  expect((await db.collection(`users/${user.uid}/movements`).get()).size).toBe(2);
  expect((await db.collection('movements').get()).size).toBe(2);
  expect((await db.doc(`users/${user.uid}/accounts/1`).get()).data()?.current_balance).toBe(750);
});
