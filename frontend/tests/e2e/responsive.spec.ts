import { expect, Page, test } from '@playwright/test';

const viewports = [{ width: 360, height: 800 }, { width: 390, height: 844 }, { width: 412, height: 915 }, { width: 768, height: 1024 }, { width: 1366, height: 768 }];
const routes = [
  ['dashboard', '/'], ['agregar', '/#/add'], ['historial', '/#/history'], ['detalle', '/#/movements/1'], ['analisis', '/#/analysis'],
  ['presupuesto', '/#/budget'], ['reportes', '/#/reports'], ['ajustes', '/#/settings'], ['respaldo', '/#/settings/backup'], ['actualizaciones', '/#/settings/updates'], ['cuentas', '/#/settings/accounts']
] as const;

async function login(page: Page) {
  await page.goto('/');
  await page.getByLabel('Correo').fill('ribenp7@gmail.com');
  await page.getByLabel('Contrasena').fill('Prueba-segura-123');
  await page.getByRole('button', { name: 'Entrar seguro' }).click();
  await expect(page.getByText('Hola, Ruben')).toBeVisible({ timeout: 30_000 });
}

for (const viewport of viewports) {
  test(`flujo responsive ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `../HARDENING_REPORT/screenshots/login-${viewport.width}.png`, fullPage: true });
    await login(page);
    for (const [name, route] of routes) {
      await page.goto(route);
      await expect(page.locator('main')).toBeVisible();
      await page.waitForTimeout(250);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), { message: `${name} tiene overflow` }).toBe(true);
      await page.screenshot({ path: `../HARDENING_REPORT/screenshots/${name}-${viewport.width}.png`, fullPage: true });
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
