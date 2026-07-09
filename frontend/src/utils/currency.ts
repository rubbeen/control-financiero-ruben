export function formatCurrency(value: number | null | undefined): string {
  const safe = Number(value || 0);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(safe);
}
