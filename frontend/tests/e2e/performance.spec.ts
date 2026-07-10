import { expect, test } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

test.use({ trace: 'on' });

test('mide shell y navegacion con datos ficticios', async ({ page }) => {
  const start = Date.now();
  await page.goto('/');
  const shellMs = Date.now() - start;
  await page.getByLabel('Correo').fill('ribenp7@gmail.com');
  await page.getByLabel('Contrasena').fill('Prueba-segura-123');
  const loginStart = Date.now();
  await page.getByRole('button', { name: 'Entrar seguro' }).click();
  await expect(page.getByText('Hola, Ruben')).toBeVisible();
  const dashboardMs = Date.now() - loginStart;
  const historyStart = Date.now();
  await page.getByRole('link', { name: 'Historial' }).click();
  await expect(page.getByRole('heading', { name: 'Historial' })).toBeVisible();
  const historyMs = Date.now() - historyStart;
  const report = { generatedAt: new Date().toISOString(), environment: 'local Emulator + Vite', shellMs, dashboardAfterLoginMs: dashboardMs, historyNavigationMs: historyMs, samsungGalaxyA33Physical: 'pending' };
  writeFileSync(resolve('..', 'HARDENING_REPORT', 'PERF_E2E.json'), JSON.stringify(report, null, 2));
});
