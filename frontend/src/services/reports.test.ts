import { describe, expect, it } from 'vitest';
import { calculateFinancialAnalysis, FinancialDataset } from './analytics';
import { reportsService } from './reports';

describe('reporte PDF', () => {
  it('genera bytes PDF, paginas y valores COP grandes', async () => {
    const dataset: FinancialDataset = {
      movements: [{ id: 1, account_id: 1, type: 'income', amount: 120_000_000, date: '2026-07-01', category_id: 1, description: 'Ingreso de prueba', is_necessary: true, is_recurring: false, created_at: '', updated_at: '' }],
      latestMovements: [],
      categories: [{ id: 1, name: 'Ingresos especiales', type: 'income', color: '#16a34a', icon: 'Circle', active: true, created_at: '', updated_at: '' }],
      budget: null,
      currentBalance: 120_000_000
    };
    const analysis = calculateFinancialAnalysis({ dataset, year: 2026, month: 7, trendMonths: 2 });
    const file = await reportsService.generateMonthlyReportPdf({ analysis, accountName: 'Ahorros principales', year: 2026, month: 7, onProgress: () => undefined });
    expect(new TextDecoder().decode(file.bytes.slice(0, 4))).toBe('%PDF');
    expect(file.pageCount).toBeGreaterThan(0);
    expect(file.mimeType).toBe('application/pdf');
  });
});
