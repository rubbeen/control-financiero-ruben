// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

const PROJECT_ID = 'demo-control-financiero-ruben';
const OWNER_EMAIL = 'ribenp7@gmail.com';
const OWNER_UID = 'owner-test-uid';
let env: RulesTestEnvironment;

const now = '2026-01-01T00:00:00.000Z';
const validMovement = {
  id: 1,
  account_id: 1,
  type: 'income',
  amount: 100000,
  date: '2026-01-02',
  category_id: 1,
  description: 'Ingreso de prueba',
  payment_method: '',
  notes: '',
  tag: '',
  place: '',
  is_necessary: true,
  is_recurring: false,
  created_at: now,
  updated_at: now
};

function ownerDb(uid = OWNER_UID, email = OWNER_EMAIL, emailVerified = true) {
  return env.authenticatedContext(uid, { email, email_verified: emailVerified }).firestore();
}

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: readFileSync(resolve('..', 'firestore.rules'), 'utf8'), host: '127.0.0.1', port: 8080 }
  });
});

beforeEach(async () => env.clearFirestore());
afterAll(async () => env.cleanup());

describe('aislamiento por UID', () => {
  it('bloquea a un usuario no autenticado', async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, `users/${OWNER_UID}/movements/1`)));
  });

  it('bloquea otro UID', async () => {
    await assertFails(getDoc(doc(ownerDb('other-uid'), `users/${OWNER_UID}/movements/1`)));
  });

  it('bloquea otro correo', async () => {
    await assertFails(getDoc(doc(ownerDb(OWNER_UID, 'otra@example.com'), `users/${OWNER_UID}/movements/1`)));
  });

  it('bloquea correo sin verificar', async () => {
    await assertFails(getDoc(doc(ownerDb(OWNER_UID, OWNER_EMAIL, false), `users/${OWNER_UID}/movements/1`)));
  });

  it('permite al propietario ver su ruta', async () => {
    await assertSucceeds(getDoc(doc(ownerDb(), `users/${OWNER_UID}/movements/1`)));
  });

  it('bloquea colecciones raiz heredadas', async () => {
    await assertFails(getDoc(doc(ownerDb(), 'movements/1')));
  });
});

describe('validacion de documentos', () => {
  it('acepta un movimiento valido', async () => {
    await assertSucceeds(setDoc(doc(ownerDb(), `users/${OWNER_UID}/movements/1`), validMovement));
  });

  it.each([
    ['monto cero', { amount: 0 }],
    ['monto negativo', { amount: -1 }],
    ['tipo invalido', { type: 'gift' }],
    ['categoria invalida', { category_id: 0 }],
    ['campo adicional', { secret: true }]
  ])('rechaza %s', async (_name, change) => {
    await assertFails(setDoc(doc(ownerDb(), `users/${OWNER_UID}/movements/1`), { ...validMovement, ...change }));
  });

  it('impide modificar id y created_at', async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), `users/${OWNER_UID}/movements/1`), validMovement);
    });
    await assertFails(updateDoc(doc(ownerDb(), `users/${OWNER_UID}/movements/1`), { id: 2 }));
    await assertFails(updateDoc(doc(ownerDb(), `users/${OWNER_UID}/movements/1`), { created_at: '2026-02-01T00:00:00.000Z' }));
  });

  it('valida los datos de transferencia', async () => {
    const transfer = {
      ...validMovement,
      type: 'transfer',
      source_account_id: 1,
      destination_account_id: 2,
      transfer_group_id: 'transfer-test-1',
      transfer_direction: 'out'
    };
    await assertSucceeds(setDoc(doc(ownerDb(), `users/${OWNER_UID}/movements/1`), transfer));
    await assertFails(setDoc(doc(ownerDb(), `users/${OWNER_UID}/movements/2`), { ...transfer, id: 2, destination_account_id: 1 }));
  });

  it('exige direccion a los ajustes', async () => {
    await assertFails(setDoc(doc(ownerDb(), `users/${OWNER_UID}/movements/1`), { ...validMovement, type: 'adjustment' }));
    await assertSucceeds(setDoc(doc(ownerDb(), `users/${OWNER_UID}/movements/1`), { ...validMovement, type: 'adjustment', adjustment_direction: 'in' }));
  });

  it('rechaza mes 13 y acepta presupuesto valido', async () => {
    const budget = {
      id: 1,
      account_id: 1,
      year: 2026,
      month: 1,
      total_budget: 1000000,
      saving_goal: 100000,
      unnecessary_expense_limit: 50000,
      category_budgets: [{ category_id: 1, amount_limit: 200000 }],
      created_at: now,
      updated_at: now
    };
    await assertSucceeds(setDoc(doc(ownerDb(), `users/${OWNER_UID}/budgets/1`), budget));
    await assertFails(setDoc(doc(ownerDb(), `users/${OWNER_UID}/budgets/2`), { ...budget, id: 2, month: 13 }));
  });

  it('aplica validacion de cuenta y categoria', async () => {
    const account = { id: 1, name: 'General', description: '', color: '#D97706', icon: 'Wallet', active: true, current_balance: 0, created_at: now, updated_at: now };
    const category = { id: 1, name: 'Ingreso', type: 'income', color: '#16A34A', icon: 'Wallet', active: true, created_at: now, updated_at: now };
    await assertSucceeds(setDoc(doc(ownerDb(), `users/${OWNER_UID}/accounts/1`), account));
    await assertSucceeds(setDoc(doc(ownerDb(), `users/${OWNER_UID}/categories/1`), category));
    await assertFails(setDoc(doc(ownerDb(), `users/${OWNER_UID}/categories/2`), { ...category, id: 2, type: 'unknown' }));
    await assertSucceeds(deleteDoc(doc(ownerDb(), `users/${OWNER_UID}/categories/1`)));
  });
});
