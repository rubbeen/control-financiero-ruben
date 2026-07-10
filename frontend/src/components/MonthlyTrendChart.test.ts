import { describe, expect, it } from 'vitest';
import { formatCompactCopAxis, formatCopTooltip } from './MonthlyTrendChart';

describe('formatCompactCopAxis', () => {
  it.each([
    [0, '$0'],
    [950000, '$950 mil'],
    [1900000, '$1,9 M'],
    [120000000, '$120 M'],
    [-950000, '-$950 mil'],
    [-1900000, '-$1,9 M']
  ])('formatea %s COP como %s', (value, expected) => {
    expect(formatCompactCopAxis(value as number)).toBe(expected);
  });

  it('conserva el valor COP completo en el tooltip', () => {
    expect(formatCopTooltip(120000000)).toContain('120.000.000');
  });
});
