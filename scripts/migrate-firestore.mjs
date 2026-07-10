#!/usr/bin/env node
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const require = createRequire(new URL('../frontend/package.json', import.meta.url));
const { applicationDefault, initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const args = new Set(process.argv.slice(2));
const valueOf = (name) => {
  const prefix = `${name}=`;
  return process.argv.slice(2).find((item) => item.startsWith(prefix))?.slice(prefix.length);
};

const uid = valueOf('--uid');
const execute = args.has('--execute');
const allowProduction = args.has('--allow-production');
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
const projectId = valueOf('--project') || process.env.GCLOUD_PROJECT || 'demo-control-financiero-ruben';
const reportDir = path.resolve('HARDENING_REPORT', 'migration');
const checkpointPath = path.join(reportDir, `checkpoint-${uid || 'missing'}.json`);

if (!uid || !/^[A-Za-z0-9_-]{6,128}$/.test(uid)) {
  throw new Error('Uso: node scripts/migrate-firestore.mjs --uid=UID [--execute].');
}

if (!emulatorHost && !allowProduction) {
  throw new Error('Proteccion activa: usa FIRESTORE_EMULATOR_HOST o agrega --allow-production de forma manual.');
}

if (!emulatorHost && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error('Produccion requiere credenciales externas en GOOGLE_APPLICATION_CREDENTIALS; nunca se guardan en el repositorio.');
}

initializeApp({
  projectId,
  credential: applicationDefault()
});

const db = getFirestore();
const collections = ['accounts', 'categories', 'movements', 'budgets'];

function movementDelta(movement) {
  const amount = Number(movement.amount || 0);
  if (movement.type === 'income') return amount;
  if (movement.type === 'expense' || movement.type === 'purchase') return -amount;
  if (movement.type === 'adjustment') {
    if (movement.adjustment_direction === 'in') return amount;
    if (movement.adjustment_direction === 'out') return -amount;
    return 0;
  }
  if (movement.type === 'transfer') {
    if (movement.transfer_direction === 'in') return amount;
    if (movement.transfer_direction === 'out') return -amount;
  }
  return 0;
}

function normalize(name, row) {
  const data = { ...row };
  if (name === 'accounts') data.current_balance = 0;
  if (name === 'movements') {
    data.account_id = Number(data.account_id || 1);
    data.amount = Math.round(Number(data.amount));
    if (data.type === 'adjustment' && !['in', 'out'].includes(data.adjustment_direction)) data.needs_review = true;
    if (data.type === 'transfer' && (!data.source_account_id || !data.destination_account_id || !data.transfer_group_id || !data.transfer_direction)) data.needs_review = true;
  }
  return data;
}

async function loadCheckpoint() {
  try {
    return JSON.parse(await readFile(checkpointPath, 'utf8'));
  } catch {
    return { completed: [] };
  }
}

async function commitRows(name, rows) {
  for (let offset = 0; offset < rows.length; offset += 400) {
    const batch = db.batch();
    rows.slice(offset, offset + 400).forEach(({ id, data }) => {
      batch.set(db.doc(`users/${uid}/${name}/${id}`), data, { merge: false });
    });
    await batch.commit();
  }
}

await mkdir(reportDir, { recursive: true });
const checkpoint = await loadCheckpoint();
const snapshots = {};
for (const name of collections) snapshots[name] = await db.collection(name).get();

const balances = new Map();
for (const doc of snapshots.movements.docs) {
  const movement = normalize('movements', doc.data());
  balances.set(movement.account_id, (balances.get(movement.account_id) || 0) + movementDelta(movement));
}

const report = {
  generatedAt: new Date().toISOString(),
  mode: execute ? 'copy' : 'dry-run',
  target: emulatorHost ? `emulator:${emulatorHost}` : `production:${projectId}`,
  uid,
  rootsDeleted: false,
  collections: {},
  warnings: []
};

for (const name of collections) {
  const rows = snapshots[name].docs.map((item) => {
    const data = normalize(name, item.data());
    if (name === 'accounts') data.current_balance = Math.round(balances.get(Number(data.id)) || 0);
    const targetId = name === 'budgets' ? `${data.account_id || 1}-${data.year}-${data.month}` : item.id;
    return { id: targetId, data };
  });
  const reviewCount = name === 'movements' ? rows.filter((item) => item.data.needs_review).length : 0;
  report.collections[name] = { source: rows.length, copied: execute ? rows.length : 0, needsReview: reviewCount };
  if (reviewCount) report.warnings.push(`${reviewCount} movimientos heredados requieren revision manual.`);

  if (execute && !checkpoint.completed.includes(name)) {
    await commitRows(name, rows);
    checkpoint.completed.push(name);
    await writeFile(checkpointPath, JSON.stringify(checkpoint, null, 2));
  }
}

if (execute) {
  const counterValues = {};
  for (const [name, field] of [['accounts', 'accountId'], ['categories', 'categoryId'], ['movements', 'movementId'], ['budgets', 'budgetId']]) {
    counterValues[field] = Math.max(0, ...snapshots[name].docs.map((item) => Number(item.data().id || 0)));
  }
  await db.doc(`users/${uid}/meta/counters`).set(counterValues, { merge: true });
  await db.doc(`users/${uid}/meta/initialization`).set({ categoriesSeedVersion: 1, defaultAccountCreated: snapshots.accounts.size > 0, initializedAt: new Date().toISOString() }, { merge: true });

  for (const name of collections) {
    const target = await db.collection(`users/${uid}/${name}`).get();
    report.collections[name].target = target.size;
    if (target.size !== snapshots[name].size) throw new Error(`Conteo inconsistente en ${name}: ${snapshots[name].size} origen, ${target.size} destino.`);
  }
}

const reportPath = path.join(reportDir, `migration-${Date.now()}.json`);
await writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ok: true, reportPath, mode: report.mode, collections: report.collections }, null, 2));
