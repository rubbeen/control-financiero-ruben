import { expect, Page, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { testCredentials } from './auth-fixture';

const screenshotsDir = resolve('..', 'LOCAL_RELEASE_REPORT', 'legacy-responsive');
mkdirSync(screenshotsDir, { recursive: true });

const viewports = [
  { width: 320, height: 568 },
  { width: 360, height: 640 },
  { width: 360, height: 800 },
  { width: 384, height: 854 },
  { width: 393, height: 873 },
  { width: 412, height: 915 },
  { width: 480, height: 960 },
  { width: 600, height: 960 },
  { width: 768, height: 1024 },
  { width: 740, height: 360 },
  { width: 915, height: 412 },
  { width: 1366, height: 768 }
];
const routes = [
  ['dashboard', '/'], ['agregar', '/#/add'], ['historial', '/#/history'], ['detalle', '/#/movements/1'], ['analisis', '/#/analysis'],
  ['presupuesto', '/#/budget'], ['reportes', '/#/reports'], ['ajustes', '/#/settings'], ['respaldo', '/#/settings/backup'], ['actualizaciones', '/#/settings/updates'], ['cuentas', '/#/settings/accounts']
] as const;

async function login(page: Page) {
  await page.goto('/');
  const credentials = testCredentials();
  await page.getByLabel('Correo').fill(credentials.email);
  await page.getByLabel('Contrasena').fill(credentials.password);
  await page.getByRole('button', { name: 'Entrar seguro' }).click();
  await expect(page.getByRole('heading', { name: 'Hola' })).toBeVisible({ timeout: 30_000 });
}

for (const viewport of viewports) {
  test(`flujo responsive ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: resolve(screenshotsDir, `login-${viewport.width}x${viewport.height}.png`), fullPage: true });
    await login(page);
    for (const [name, route] of routes) {
      await page.goto(route);
      await expect(page.locator('main')).toBeVisible();
      await page.waitForTimeout(250);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), { message: `${name} tiene overflow` }).toBe(true);
      await page.screenshot({ path: resolve(screenshotsDir, `${name}-${viewport.width}x${viewport.height}.png`), fullPage: true });
    }
    const nav = page.locator('nav[aria-label="Navegacion principal"] a');
    await expect(nav).toHaveCount(5);
    for (const target of await nav.all()) expect(await target.evaluate((element) => Math.min(element.getBoundingClientRect().width, element.getBoundingClientRect().height))).toBeGreaterThanOrEqual(44);
  });
}

test('protege cambios y ofrece Atrás', async ({ page }) => {
  await login(page);
  await page.goto('/#/add');
  await page.getByLabel('Descripcion').fill('Cambio sin guardar');
  await page.getByRole('link', { name: 'Ajustes' }).click();
  await expect(page.getByRole('alertdialog')).toContainText('Cambios sin guardar');
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await page.goto('/#/settings/accounts');
  await expect(page.getByRole('button', { name: 'Volver' })).toBeVisible();
});
