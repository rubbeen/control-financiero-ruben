import { expect, Page, test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { testCredentials } from './auth-fixture';

const reportDir = resolve('..', 'LOCAL_RELEASE_REPORT', 'orientation-regression');
mkdirSync(reportDir, { recursive: true });

type Viewport = { width: number; height: number };

const sequences = [
  { name: '360x800', portrait: { width: 360, height: 800 }, landscape: { width: 800, height: 360 } },
  { name: '412x915', portrait: { width: 412, height: 915 }, landscape: { width: 915, height: 412 } },
  { name: '393x873', portrait: { width: 393, height: 873 }, landscape: { width: 873, height: 393 } }
] as const;

async function login(page: Page) {
  await page.goto('/');
  await page.evaluate(async () => {
    await Promise.all([
      import('/src/components/IncomeExpenseChart.tsx'),
      import('/src/components/ExpenseCategoryChart.tsx'),
      import('/src/components/MonthlyTrendChart.tsx')
    ]);
  });
  const credentials = testCredentials();
  await page.getByLabel('Correo').fill(credentials.email);
  await page.getByLabel('Contrasena').fill(credentials.password);
  await page.getByRole('button', { name: 'Entrar seguro' }).click();
  await expect(page.getByRole('heading', { name: 'Hola' })).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.recharts-responsive-container')).toHaveCount(3, { timeout: 30_000 });
}

async function emulateAndroidWebViewResizeObserverGap(page: Page) {
  await page.addInitScript(() => {
    const NativeResizeObserver = window.ResizeObserver;
    const state = window as Window & { __CFR_E2E_DROP_RESIZE_OBSERVER__?: boolean };
    class AndroidWebViewResizeObserver implements ResizeObserver {
      private readonly observer: ResizeObserver;

      constructor(callback: ResizeObserverCallback) {
        this.observer = new NativeResizeObserver((entries, observer) => {
          if (!state.__CFR_E2E_DROP_RESIZE_OBSERVER__) callback(entries, observer);
        });
      }

      observe(target: Element, options?: ResizeObserverOptions) { this.observer.observe(target, options); }
      unobserve(target: Element) { this.observer.unobserve(target); }
      disconnect() { this.observer.disconnect(); }
    }
    window.ResizeObserver = AndroidWebViewResizeObserver;
  });
}

async function dropNextResizeObserverDelivery(page: Page, drop: boolean) {
  await page.evaluate((value) => {
    (window as Window & { __CFR_E2E_DROP_RESIZE_OBSERVER__?: boolean }).__CFR_E2E_DROP_RESIZE_OBSERVER__ = value;
  }, drop);
}

async function waitForStableGeometry(page: Page) {
  await page.evaluate(async () => {
    const frame = () => new Promise<void>((resolveFrame) => requestAnimationFrame(() => resolveFrame()));
    let previous = '';
    let stableFrames = 0;
    for (let index = 0; index < 12 && stableFrames < 2; index += 1) {
      await frame();
      const viewport = window.visualViewport;
      const current = [
        window.innerWidth,
        window.innerHeight,
        document.documentElement.clientWidth,
        document.documentElement.clientHeight,
        viewport?.width ?? 0,
        viewport?.height ?? 0,
        document.querySelector('main')?.getBoundingClientRect().width ?? 0
      ].join(':');
      stableFrames = current === previous ? stableFrames + 1 : 0;
      previous = current;
    }
  });
}

async function setViewportAndSettle(page: Page, viewport: Viewport) {
  await page.setViewportSize(viewport);
  await waitForStableGeometry(page);
}

async function measure(page: Page, label: string) {
  const metrics = await page.evaluate((step) => {
    const rect = (element: Element | null) => {
      if (!element) return null;
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
    };
    const visible = (element: Element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0;
    };
    const dashboard = document.querySelector('main')?.firstElementChild ?? null;
    const chartWrappers = [...document.querySelectorAll('.recharts-responsive-container')];
    const chartSvgs = [...document.querySelectorAll('.recharts-responsive-container > .recharts-wrapper > svg')];
    const tooltips = [...document.querySelectorAll('.recharts-tooltip-wrapper')].filter(visible);
    const dashboardSections = dashboard ? [...dashboard.querySelectorAll(':scope > section')] : [];
    return {
      step,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      clientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      visualViewport: window.visualViewport ? {
        width: window.visualViewport.width,
        height: window.visualViewport.height,
        scale: window.visualViewport.scale
      } : null,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      main: rect(document.querySelector('main')),
      dashboard: rect(dashboard),
      bottomNavigation: rect(document.querySelector('nav[aria-label="Navegacion principal"]')),
      dashboardSections: dashboardSections.map((element, index) => ({
        index,
        rect: rect(element),
        columns: getComputedStyle(element).gridTemplateColumns
      })),
      chartWrappers: chartWrappers.map((element, index) => ({ index, rect: rect(element) })),
      chartSvgs: chartSvgs.map((element, index) => ({
        index,
        rect: rect(element),
        width: element.getAttribute('width'),
        height: element.getAttribute('height'),
        viewBox: element.getAttribute('viewBox')
      })),
      tooltips: tooltips.map((element, index) => ({
        index,
        rect: rect(element),
        transform: getComputedStyle(element).transform
      })),
      chartData: chartSvgs.map((element) => element.textContent),
      chartShapeCounts: chartSvgs.map((element) => element.querySelectorAll('.recharts-bar-rectangle, .recharts-pie-sector, .recharts-line-curve').length),
      critical: [
        document.querySelector('main'),
        dashboard,
        ...dashboardSections,
        ...chartWrappers,
        ...chartSvgs,
        document.querySelector('[data-testid="recommendation-card"]'),
        document.querySelector('nav[aria-label="Navegacion principal"]')
      ].filter((element): element is Element => Boolean(element)).map((element) => rect(element))
    };
  }, label);
  await test.info().attach(`${label}-metrics`, { body: JSON.stringify(metrics, null, 2), contentType: 'application/json' });
  writeFileSync(resolve(reportDir, `${label}-metrics.json`), JSON.stringify(metrics, null, 2));
  return metrics;
}

function expectInsideViewport(metrics: Awaited<ReturnType<typeof measure>>) {
  expect(metrics.documentScrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
  expect(Math.abs(metrics.scrollX)).toBeLessThanOrEqual(1);
  for (const box of metrics.critical) {
    expect(box).not.toBeNull();
    expect(Number.isFinite(box!.left) && Number.isFinite(box!.right) && Number.isFinite(box!.width)).toBe(true);
    expect(box!.left).toBeGreaterThanOrEqual(-1);
    expect(box!.right).toBeLessThanOrEqual(metrics.clientWidth + 1);
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.width).toBeLessThanOrEqual(metrics.clientWidth + 1);
  }
  for (const tooltip of metrics.tooltips) {
    expect(tooltip.rect!.left).toBeGreaterThanOrEqual(-1);
    expect(tooltip.rect!.right).toBeLessThanOrEqual(metrics.clientWidth + 1);
  }
  expect(metrics.chartWrappers).toHaveLength(3);
  expect(metrics.chartSvgs).toHaveLength(3);
  metrics.chartSvgs.forEach((svg, index) => {
    const hostWidth = metrics.chartWrappers[index].rect!.width;
    expect(Number(svg.width)).toBeCloseTo(hostWidth, 0);
  });
}

for (const sequence of sequences) {
  test(`recupera el Dashboard tras rotar ${sequence.name}`, async ({ page }) => {
    const firebaseRequests: string[] = [];
    await emulateAndroidWebViewResizeObserverGap(page);
    await setViewportAndSettle(page, sequence.portrait);
    await login(page);
    await page.getByRole('heading', { name: 'Ingresos vs gastos' }).scrollIntoViewIfNeeded();
    await waitForStableGeometry(page);
    page.on('request', (request) => {
      if (/firestore|google\.firestore|\/Listen\/channel/i.test(request.url())) firebaseRequests.push(request.url());
    });

    const initial = await measure(page, `${sequence.name}-portrait-before`);
    await page.screenshot({ path: resolve(reportDir, `${sequence.name}-portrait-before.png`), fullPage: true });
    expectInsideViewport(initial);

    await setViewportAndSettle(page, sequence.landscape);
    await page.mouse.wheel(0, 240);
    const landscape = await measure(page, `${sequence.name}-landscape`);
    await page.screenshot({ path: resolve(reportDir, `${sequence.name}-landscape.png`), fullPage: true });
    expectInsideViewport(landscape);

    await dropNextResizeObserverDelivery(page, true);
    await setViewportAndSettle(page, sequence.portrait);
    const restored = await measure(page, `${sequence.name}-portrait-after`);
    await page.screenshot({ path: resolve(reportDir, `${sequence.name}-portrait-after.png`), fullPage: true });
    expectInsideViewport(restored);
    expect(restored.dashboard!.width).toBeCloseTo(initial.dashboard!.width, 0);
    expect(restored.chartData).toEqual(initial.chartData);
    expect(restored.chartShapeCounts).toEqual(initial.chartShapeCounts);
    expect(restored.chartShapeCounts.every((count) => count > 0)).toBe(true);
    expect(restored.tooltips).toHaveLength(0);
    await expect(page.locator('nav[aria-label="Navegacion principal"] a')).toHaveCount(5);
    for (const target of await page.locator('button, nav[aria-label="Navegacion principal"] a').all()) {
      const box = await target.boundingBox();
      if (box) expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
    }
    expect(firebaseRequests).toHaveLength(0);
  });
}

test('mantiene el ancho tras cinco ciclos de orientacion', async ({ page }) => {
  const portrait = { width: 360, height: 800 };
  const landscape = { width: 800, height: 360 };
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !/favicon/i.test(message.text())) consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  await emulateAndroidWebViewResizeObserverGap(page);
  await setViewportAndSettle(page, portrait);
  await login(page);
  await page.getByRole('heading', { name: 'Ingresos vs gastos' }).scrollIntoViewIfNeeded();
  const initial = await measure(page, 'five-cycles-portrait-before');

  for (let cycle = 0; cycle < 5; cycle += 1) {
    await setViewportAndSettle(page, landscape);
    await page.mouse.wheel(0, 120);
    expectInsideViewport(await measure(page, `five-cycles-${cycle + 1}-landscape`));
    await dropNextResizeObserverDelivery(page, true);
    await setViewportAndSettle(page, portrait);
    expectInsideViewport(await measure(page, `five-cycles-${cycle + 1}-portrait`));
    await dropNextResizeObserverDelivery(page, false);
  }

  const restored = await measure(page, 'portrait-after-five-cycles');
  await page.screenshot({ path: resolve(reportDir, 'portrait-after-five-cycles.png'), fullPage: true });
  expect(restored.dashboard!.width).toBeCloseTo(initial.dashboard!.width, 0);
  expect(consoleErrors.filter((message) => /ResizeObserver loop|uncaught|error/i.test(message))).toEqual([]);
});
