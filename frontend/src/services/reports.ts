import { formatCurrency } from '../utils/currency';
import { perfMeasureAsync } from '../utils/performance';
import { FinancialAnalysis } from './analytics';
import type { PreparedFile } from './fileExport';

export interface GeneratedPdf extends PreparedFile { pageCount: number }

export const reportsService = {
  async generateMonthlyReportPdf({ analysis, accountName, year, month, onProgress }: { analysis: FinancialAnalysis; accountName: string; year: number; month: number; onProgress: (value: number) => void }): Promise<GeneratedPdf> {
    return perfMeasureAsync('pdf-generation', async () => {
      onProgress(10);
      const [{ default: jsPDF }, autoTableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
      const autoTable = autoTableModule.default;
      onProgress(30);
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const summary = analysis.summary;
      const period = `${year}-${String(month).padStart(2, '0')}`;
      pdf.setFillColor(92, 54, 30);
      pdf.rect(0, 0, 210, 34, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(19);
      pdf.text('Control Financiero Ruben', 14, 14);
      pdf.setFontSize(11);
      pdf.text(`Reporte mensual - ${accountName} - ${period}`, 14, 23);
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(9);
      pdf.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 14, 31);
      const cards = [
        ['Saldo acumulado', analysis.currentBalance], ['Ingresos', summary.total_income], ['Gastos', summary.total_expense],
        ['Balance mensual', summary.balance], ['Ahorro', summary.saving_amount], ['Presupuesto', summary.budget?.total_budget || 0]
      ] as const;
      cards.forEach(([label, value], index) => {
        const x = 14 + (index % 3) * 61;
        const y = 43 + Math.floor(index / 3) * 24;
        pdf.setFillColor(255, 247, 237);
        pdf.roundedRect(x, y, 56, 19, 2, 2, 'F');
        pdf.setFontSize(8); pdf.setTextColor(107, 114, 128); pdf.text(label, x + 3, y + 6);
        pdf.setFontSize(11); pdf.setTextColor(31, 41, 55); pdf.text(formatCurrency(value), x + 3, y + 14);
      });
      let y = 96;
      pdf.setFontSize(13); pdf.text('Gastos por categoria', 14, y); y += 7;
      const max = summary.category_expenses[0]?.amount || 1;
      summary.category_expenses.slice(0, 8).forEach((item) => {
        pdf.setFontSize(8); pdf.text(item.category.slice(0, 25), 14, y);
        pdf.setFillColor(226, 232, 240); pdf.rect(62, y - 3, 80, 3, 'F');
        pdf.setFillColor(217, 119, 6); pdf.rect(62, y - 3, 80 * item.amount / max, 3, 'F');
        pdf.text(formatCurrency(item.amount), 146, y); y += 7;
      });
      onProgress(50);
      autoTable(pdf, {
        startY: y + 3,
        head: [['Fecha', 'Descripcion', 'Categoria', 'Valor COP']],
        body: summary.top_expenses.map((item) => [item.date, item.description, summary.category_expenses.find((category) => category.category_id === item.category_id)?.category || 'Sin categoria', formatCurrency(item.amount)]),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [92, 54, 30] },
        columnStyles: { 1: { cellWidth: 75 } },
        margin: { left: 14, right: 14 }
      });
      const afterTable = (pdf as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y;
      if (afterTable > 220) pdf.addPage();
      const recommendationY = afterTable > 220 ? 20 : afterTable + 12;
      pdf.setFontSize(13); pdf.text('Comparacion y recomendaciones', 14, recommendationY);
      pdf.setFontSize(9);
      const variation = analysis.comparison.expense_variation?.percent;
      let nextY = recommendationY + 7;
      pdf.text(variation == null ? 'Sin mes anterior comparable.' : `Variacion de gastos: ${variation.toFixed(1)}%.`, 14, nextY);
      nextY += 6;
      analysis.recommendations.forEach((item) => {
        const lines = pdf.splitTextToSize(`${item.title}: ${item.explanation} Accion: ${item.suggested_action}`, 178);
        if (nextY + lines.length * 5 > 280) { pdf.addPage(); nextY = 20; }
        pdf.text(lines, 14, nextY); nextY += lines.length * 5 + 3;
      });
      onProgress(75);
      const pageCount = pdf.getNumberOfPages();
      for (let page = 1; page <= pageCount; page += 1) {
        pdf.setPage(page);
        pdf.setFontSize(8); pdf.setTextColor(107, 114, 128);
        pdf.text('CONFIDENCIAL - Informacion financiera personal', 14, 290);
        pdf.text(`Pagina ${page} de ${pageCount}`, 180, 290, { align: 'right' });
      }
      const bytes = new Uint8Array(pdf.output('arraybuffer'));
      onProgress(90);
      return { bytes, filename: `reporte-${accountName}-${period}.pdf`, mimeType: 'application/pdf', pageCount };
    });
  }
};
