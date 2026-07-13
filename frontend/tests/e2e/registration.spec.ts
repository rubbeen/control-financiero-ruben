import { expect, test } from '@playwright/test';
import { applicationDefault, deleteApp, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const screenshotsDir = resolve('..', 'LOCAL_RELEASE_REPORT', 'registration-responsive');

test('crea una cuenta aislada, exige verificar el correo y permite ingresar', async ({ page }) => {
  const email = `nuevo-${Date.now()}@example.test`;
  const password = 'Registro-1234';
  const adminApp = initializeApp(
    { projectId: 'demo-control-financiero-ruben', credential: applicationDefault() },
    `registration-${Date.now()}`
  );
  const adminAuth = getAuth(adminApp);

  try {
    mkdirSync(screenshotsDir, { recursive: true });
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
    await expect(page.getByLabel('Confirmar contrasena')).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: resolve(screenshotsDir, 'registro-320x568.png'), fullPage: true });

    await page.getByLabel('Correo').fill(email);
    await page.getByLabel('Contrasena', { exact: true }).fill(password);
    await page.getByLabel('Confirmar contrasena').fill('Registro-5678');
    await page.getByRole('button', { name: 'Crear mi cuenta' }).click();
    await expect(page.getByRole('alert')).toContainText('no coinciden');

    await page.getByLabel('Confirmar contrasena').fill(password);
    await page.setViewportSize({ width: 740, height: 360 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: resolve(screenshotsDir, 'registro-740x360.png'), fullPage: true });
    await page.getByRole('button', { name: 'Crear mi cuenta' }).click();
    await expect(page.getByRole('status')).toContainText('Cuenta creada');

    const created = await adminAuth.getUserByEmail(email);
    expect(created.emailVerified).toBe(false);

    await page.getByLabel('Contrasena').fill(password);
    await page.getByRole('button', { name: 'Entrar seguro' }).click();
    await expect(page.getByRole('alert')).toContainText('Debes verificar tu correo');

    await adminAuth.updateUser(created.uid, { emailVerified: true });
    await page.getByRole('button', { name: 'Entrar seguro' }).click();
    await expect(page.getByRole('heading', { name: 'Hola' })).toBeVisible({ timeout: 30_000 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  } finally {
    await deleteApp(adminApp);
  }
});
