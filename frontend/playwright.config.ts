import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  globalSetup: './tests/e2e/global-setup.ts',
  outputDir: '../LOCAL_RELEASE_REPORT/performance-traces',
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  webServer: { command: 'node scripts/start-e2e-server.mjs', url: 'http://127.0.0.1:4173', reuseExistingServer: false, timeout: 60_000 },
  reporter: [['list'], ['html', { open: 'never' }]]
});
