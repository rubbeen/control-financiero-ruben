import jsPDF from 'jspdf';
import { MonthlyData } from '../types/finance';
import { formatCurrency } from '../utils/currency';
import { analyticsService } from './analytics';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const reportsService = {
  data: (year: number, month: number) => analyticsService.monthly(year, month),

  async downloadPdf(year: number, month: number) {
    const data = await analyticsService.monthly(year, month);
    const summary = data.summary;
    const pdf = new jsPDF();
    let y = 16;
    pdf.setFontSize(18);
    pdf.text('Reporte financiero mensual', 14, y);
    y += 8;
    pdf.setFontSize(12);
    pdf.text('Control Financiero Ruben', 14, y);
    y += 8;
    pdf.text(`Mes analizado: ${year}-${String(month).padStart(2, '0')}`, 14, y);
    y += 12;

    [
      `Ingresos: ${formatCurrency(summary.total_income)}`,
      `Gastos: ${formatCurrency(summary.total_expense)}`,
      `Balance: ${formatCurrency(summary.balance)}`,
      `Ahorro real: ${formatCurrency(summary.saving_amount)}`,
      `Categoria con mayor gasto: ${summary.top_expense_category?.category || 'Sin datos'}`
    ].forEach((line) => {
      pdf.text(line, 14, y);
      y += 7;
    });

    y += 5;
    pdf.setFontSize(14);
    pdf.text('Gastos por categoria', 14, y);
    y += 8;
    pdf.setFontSize(10);
    summary.category_expenses.forEach((item) => {
      if (y > 270) {
        pdf.addPage();
        y = 16;
      }
      pdf.text(`${item.category}: ${formatCurrency(item.amount)}`, 16, y);
      y += 6;
    });

    y += 5;
    pdf.setFontSize(14);
    pdf.text('Recomendaciones', 14, y);
    y += 8;
    pdf.setFontSize(10);
    data.recommendations.forEach((item) => {
      const lines = pdf.splitTextToSize(`${item.title}: ${item.explanation}`, 180);
      lines.forEach((line: string) => {
        if (y > 270) {
          pdf.addPage();
          y = 16;
        }
        pdf.text(line, 16, y);
        y += 6;
      });
    });

    downloadBlob(pdf.output('blob'), `reporte-financiero-${year}-${String(month).padStart(2, '0')}.pdf`);
  }
};
