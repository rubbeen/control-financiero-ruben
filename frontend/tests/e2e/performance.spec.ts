import { expect, test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { testCredentials } from './auth-fixture';

test.use({ trace: 'on' });

test('mide shell y navegacion con datos ficticios', async ({ page }) => {
  const start = Date.now();
  await page.goto('/');
  const shellMs = Date.now() - start;
  const credentials = testCredentials();
  await page.getByLabel('Correo').fill(credentials.email);
  await page.getByLabel('Contrasena').fill(credentials.password);
  const loginStart = Date.now();
  await page.getByRole('button', { name: 'Entrar seguro' }).click();
  await expect(page.getByRole('heading', { name: 'Hola' })).toBeVisible();
  const dashboardMs = Date.now() - loginStart;
  const historyStart = Date.now();
  await page.getByRole('link', { name: 'Historial' }).click();
  await expect(page.getByRole('heading', { name: 'Historial' })).toBeVisible();
  const historyMs = Date.now() - historyStart;
  const report = { generatedAt: new Date().toISOString(), environment: 'local Emulator + Vite', shellMs, dashboardAfterLoginMs: dashboardMs, historyNavigationMs: historyMs, samsungGalaxyA33Physical: 'pending' };
  const reportDir = resolve('..', 'LOCAL_RELEASE_REPORT');
  mkdirSync(reportDir, { recursive: true });
  writeFileSync(resolve(reportDir, 'PERF_E2E.json'), JSON.stringify(report, null, 2));
});
