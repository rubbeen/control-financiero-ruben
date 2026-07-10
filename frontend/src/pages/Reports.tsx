import { useState } from 'react';
import ReportPreviewCard from '../components/ReportPreviewCard';
import { useAccount } from '../context/AccountContext';
import { useFinancialAnalysis } from '../hooks/useFinanceQueries';
import { reportsService } from '../services/reports';
import { currentYearMonth, monthName } from '../utils/dates';

export default function Reports() {
  const current = currentYearMonth();
  const { activeAccount } = useAccount();
  const [period, setPeriod] = useState(`${current.year}-${String(current.month).padStart(2, '0')}`);
  const [year, month] = period.split('-').map(Number);
  const report = useFinancialAnalysis(year, month, 2);
  const [progress, setProgress] = useState(0);
  const [generating, setGenerating] = useState(false);
  const download = async () => { if (!report.data || !activeAccount) return; setGenerating(true); setProgress(0); try { await reportsService.downloadPdf({ analysis: report.data, accountName: activeAccount.name, year, month, onProgress: setProgress }); } finally { setGenerating(false); } };
  return <div className="space-y-4"><h1 className="text-2xl font-bold">Reportes</h1><input type="month" className="min-w-0 rounded-lg border px-3 py-3" value={period} onChange={(event) => setPeriod(event.target.value)} />{report.isLoading && <div className="skeleton h-56" />}{report.data && <ReportPreviewCard title={`Reporte mensual · ${monthName(year, month)} · ${activeAccount?.name}`} income={report.data.summary.total_income} expense={report.data.summary.total_expense} balance={report.data.summary.balance} onDownload={() => void download()} />}{generating && <div className="rounded-lg bg-blue-50 p-3 text-primary"><p>Generando PDF... {progress}%</p><progress className="mt-2 w-full" value={progress} max="100" /></div>}<button disabled={!report.data || generating} onClick={() => void download()} className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white disabled:opacity-50">{generating ? 'Generando...' : 'Descargar PDF profesional'}</button></div>;
}
