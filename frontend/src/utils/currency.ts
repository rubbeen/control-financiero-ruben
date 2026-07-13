export function formatCurrency(value: number | null | undefined): string {
  const safe = Number(value || 0);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(safe);
}

export function formatCompactCopAxis(value: number): string {
  const amount = Number(value);
  const sign = amount < 0 ? '-' : '';
  const absolute = Math.abs(amount);
  if (absolute < 1000) return `${sign}$${Math.round(absolute)}`;
  if (absolute < 1_000_000) return `${sign}$${Math.round(absolute / 1000)} mil`;
  const millions = absolute / 1_000_000;
  const compact = Number.isInteger(millions) ? String(millions) : millions.toFixed(1).replace('.', ',');
  return `${sign}$${compact} M`;
}

export function formatCopTooltip(value: number): string {
  return formatCurrency(value);
}
