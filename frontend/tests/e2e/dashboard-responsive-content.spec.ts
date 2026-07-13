import { expect, test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { testCredentials } from './auth-fixture';

const reportDir = resolve('..', 'LOCAL_RELEASE_REPORT');

const recommendation = {
  title: 'Gasto concentrado',
  explanation: 'Educaci\u00f3n representa 38.6% del gasto mensual registrado durante este per\u00edodo.',
  affected_value: 867273,
  suggested_action: 'Define un l\u00edmite semanal para esta categor\u00eda y revisa los pagos programados antes de realizar nuevos gastos.',
  level: 'advertencia'
} as const;

const scenarios = [
  { width: 320, height: 720, fontSize: 16 },
  { width: 360, height: 800, fontSize: 16 },
  { width: 384, height: 854, fontSize: 16 },
  { width: 390, height: 844, fontSize: 16 },
  { width: 412, height: 915, fontSize: 16 },
  { width: 768, height: 1024, fontSize: 16 },
  { width: 1366, height: 768, fontSize: 16 },
  { width: 360, height: 800, fontSize: 18 },
  { width: 360, height: 800, fontSize: 20 },
  { width: 412, height: 915, fontSize: 22 }
];

async function login(page: import('@playwright/test').Page) {
  await page.goto('/');
  const credentials = testCredentials();
  await page.getByLabel('Correo').fill(credentials.email);
  await page.getByLabel('Contrasena').fill(credentials.password);
  await page.getByRole('button', { name: 'Entrar seguro' }).click();
  await expect(page.getByRole('heading', { name: 'Hola' })).toBeVisible({ timeout: 30_000 });
}

test('captura baseline responsive antes de corregir', async ({ page }) => {
  test.skip(process.env.CAPTURE_DASHBOARD_BEFORE !== 'true');
  mkdirSync(reportDir, { recursive: true });
  await page.setViewportSize({ width: 360, height: 800 });
  await login(page);
  const movement = page.getByRole('button', { name: /Pago tarjeta NU/ });
  const recommendation = page.locator('main article');
  const metrics = await page.evaluate(() => {
    const amountText = '$\u00a0120.000.000';
    const amount = [...document.querySelectorAll('span')].find((item) => item.textContent?.includes(amountText));
    const description = [...document.querySelectorAll('span')].find((item) => item.textContent === 'Pago tarjeta NU');
    const card = description?.closest('button');
    const style = (element?: Element | null) => element ? getComputedStyle(element) : null;
    const rect = (element?: Element | null) => element ? element.getBoundingClientRect().toJSON() : null;
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      card: rect(card), amount: rect(amount), description: rect(description),
      descriptionStyle: style(description) && { whiteSpace: style(description)!.whiteSpace, overflow: style(description)!.overflow, textOverflow: style(description)!.textOverflow, minWidth: style(description)!.minWidth, flexShrink: style(description)!.flexShrink },
      amountStyle: style(amount) && { whiteSpace: style(amount)!.whiteSpace, overflow: style(amount)!.overflow, textOverflow: style(amount)!.textOverflow, minWidth: style(amount)!.minWidth, flexShrink: style(amount)!.flexShrink }
    };
  });
  expect(await movement.count()).toBe(1);
  expect(await recommendation.count()).toBeGreaterThan(0);
  writeFileSync(resolve(reportDir, 'before-dashboard-metrics.json'), JSON.stringify(metrics, null, 2));
  await page.screenshot({ path: resolve(reportDir, 'before-dashboard-360x800.png'), fullPage: true });
});

test('mantiene completo el Dashboard en pantallas y fuentes exigentes', async ({ page }) => {
  mkdirSync(reportDir, { recursive: true });
  await page.addInitScript((fixture) => { window.__CFR_E2E_RECOMMENDATION__ = fixture; }, recommendation);
  await page.setViewportSize({ width: 360, height: 800 });
  await login(page);
  const results = [];

  for (const scenario of scenarios) {
    await page.setViewportSize({ width: scenario.width, height: scenario.height });
    await page.evaluate((fontSize) => { document.documentElement.style.fontSize = `${fontSize}px`; }, scenario.fontSize);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Hola' })).toBeVisible();
    await expect(page.getByTestId('movement-item')).toHaveCount(5);

    const metrics = await page.evaluate(() => {
      const inside = (element: Element) => {
        const box = element.getBoundingClientRect();
        return box.left >= -1 && box.right <= document.documentElement.clientWidth + 1 && box.width > 0 && box.height > 0;
      };
      const styles = [...document.querySelectorAll('[data-testid="movement-description"], [data-testid="movement-metadata"]')]
        .map((element) => {
          const style = getComputedStyle(element);
          return { inside: inside(element), whiteSpace: style.whiteSpace, overflow: style.overflow, textOverflow: style.textOverflow };
        });
      const amounts = [...document.querySelectorAll('[data-testid="movement-amount"]')]
        .map((element) => ({ inside: inside(element), text: element.textContent || '', whiteSpace: getComputedStyle(element).whiteSpace }));
      const cards = [...document.querySelectorAll('[data-testid="movement-item"]')]
        .map((element) => ({ inside: inside(element), width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height }));
      return {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        styles,
        amounts,
        cards,
        bodyScrollWidth: document.body.scrollWidth
      };
    });

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
    expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
    expect(metrics.cards.every((card) => card.inside && card.width <= metrics.clientWidth && card.height >= 44)).toBe(true);
    expect(metrics.styles.every((style) => style.inside && style.whiteSpace === 'normal' && style.overflow === 'visible' && style.textOverflow === 'clip')).toBe(true);
    expect(metrics.amounts.every((amount) => amount.inside && amount.whiteSpace === 'nowrap')).toBe(true);
    expect(metrics.amounts.some((amount) => amount.text.includes('120.000.000'))).toBe(true);
    await expect(page.getByText('Pago de la salud y pensi\u00f3n para cobrar el mes anterior', { exact: true })).toBeVisible();

    const recommendationCard = page.getByTestId('recommendation-card');
    await recommendationCard.scrollIntoViewIfNeeded();
    await expect(recommendationCard).toBeVisible();
    await expect(page.getByTestId('recommendation-title')).toHaveText(recommendation.title);
    await expect(page.getByTestId('recommendation-explanation')).toHaveText(recommendation.explanation);
    await expect(page.getByTestId('recommendation-amount')).toContainText('867.273');
    await expect(page.getByTestId('recommendation-action')).toHaveText(recommendation.suggested_action);
    const recommendationMetrics = await page.evaluate(() => {
      const selectors = ['recommendation-card', 'recommendation-title', 'recommendation-explanation', 'recommendation-amount', 'recommendation-action'];
      const visibleInside = selectors.every((id) => {
        const element = document.querySelector(`[data-testid="${id}"]`)!;
        const box = element.getBoundingClientRect();
        return box.left >= -1 && box.right <= document.documentElement.clientWidth + 1 && box.height > 0 && getComputedStyle(element).overflow !== 'hidden';
      });
      const action = document.querySelector('[data-testid="recommendation-action"]')!.getBoundingClientRect();
      const nav = document.querySelector('nav[aria-label="Navegacion principal"]')!.getBoundingClientRect();
      return { visibleInside, actionBottom: action.bottom, navTop: nav.top };
    });
    expect(recommendationMetrics.visibleInside).toBe(true);
    expect(recommendationMetrics.actionBottom).toBeLessThanOrEqual(recommendationMetrics.navTop + 1);

    const chart = page.getByTestId('monthly-trend-chart');
    await chart.scrollIntoViewIfNeeded();
    await expect(chart).toBeVisible();
    const chartText = await chart.textContent();
    expect(chartText).not.toMatch(/\d+(?:[.,]\d+)?k\b/i);
    expect(chartText).toMatch(/\$\d+(?:,\d+)? M/);
    expect(await chart.locator('svg').evaluate((svg) => {
      const box = svg.getBoundingClientRect();
      return box.left >= -1 && box.right <= document.documentElement.clientWidth + 1 && box.width > 0 && box.height > 0;
    })).toBe(true);

    const incomeExpenseChart = page.getByTestId('income-expense-chart');
    const incomeExpenseText = await incomeExpenseChart.textContent();
    expect(incomeExpenseText).not.toMatch(/\d+(?:[.,]\d+)?k\b/i);
    expect(incomeExpenseText).toMatch(/\$\d+(?:,\d+)? M/);

    const firstMovement = page.getByTestId('movement-item').first();
    await firstMovement.focus();
    expect(await firstMovement.evaluate((element) => parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThanOrEqual(3);

    const fileName = scenario.fontSize === 16
      ? `after-dashboard-${scenario.width}x${scenario.height}.png`
      : `after-dashboard-font-${scenario.fontSize}px-${scenario.width}x${scenario.height}.png`;
    await page.screenshot({ path: resolve(reportDir, fileName), fullPage: true });
    results.push({ scenario, ...metrics, recommendation: recommendationMetrics, chartText });
  }

  await page.setViewportSize({ width: 360, height: 800 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '16px'; });
  await page.goto('/');
  await page.getByTestId('movement-item').first().click();
  await expect(page.getByRole('heading', { name: 'Editar movimiento' })).toBeVisible();
  writeFileSync(resolve(reportDir, 'after-dashboard-metrics.json'), JSON.stringify(results, null, 2));
});
