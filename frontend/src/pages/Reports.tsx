import { useState } from 'react';
import ReportPreviewCard from '../components/ReportPreviewCard';
import { useAsync } from '../hooks/useAsync';
import { reportsService } from '../services/reports';
import { currentYearMonth, monthName } from '../utils/dates';

export default function Reports() {
  const current = currentYearMonth();
  const [period, setPeriod] = useState(`${current.year}-${String(current.month).padStart(2, '0')}`);
  const [year, month] = period.split('-').map(Number);
  const report = useAsync(() => reportsService.data(year, month), [year, month]);

  async function download() {
    await reportsService.downloadPdf(year, month);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text">Reportes</h1>
      <input type="month" className="rounded-lg border border-border px-3 py-3" value={period} onChange={(e) => setPeriod(e.target.value)} />
      {report.loading && <p className="text-muted">Cargando informacion financiera...</p>}
      {report.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-expense">{report.error}</p>}
      {report.data && (
        <ReportPreviewCard
          title={`Reporte financiero mensual · ${monthName(year, month)}`}
          income={report.data.summary.total_income}
          expense={report.data.summary.total_expense}
          balance={report.data.summary.balance}
          onDownload={download}
        />
      )}
    </div>
  );
}
