import { ExternalLink, Save, Share2 } from 'lucide-react';
import { useState } from 'react';
import DataSyncLoader from '../components/DataSyncLoader';
import ReportPreviewCard from '../components/ReportPreviewCard';
import { useAccount } from '../context/AccountContext';
import { useFinancialAnalysis } from '../hooks/useFinanceQueries';
import { fileExport } from '../services/fileExport';
import { GeneratedPdf, reportsService } from '../services/reports';
import { currentYearMonth, monthName } from '../utils/dates';

type Action = 'save' | 'share' | 'open';

export default function Reports() {
  const current = currentYearMonth();
  const { activeAccount } = useAccount();
  const [period, setPeriod] = useState(`${current.year}-${String(current.month).padStart(2, '0')}`);
  const [year, month] = period.split('-').map(Number);
  const report = useFinancialAnalysis(year, month, 2);
  const [prepared, setPrepared] = useState<GeneratedPdf | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function prepare() {
    if (!report.data || !activeAccount) throw new Error('Espera a que termine de cargar el reporte.');
    setStage('Disenando reporte...');
    const file = await reportsService.generateMonthlyReportPdf({ analysis: report.data, accountName: activeAccount.name, year, month, onProgress: setProgress });
    setPrepared(file);
    setStage('Reporte preparado correctamente.');
    return file;
  }

  async function run(action: Action) {
    if (busy) return;
    setBusy(true); setMessage(''); setError(''); setProgress(0);
    try {
      const file = prepared || await prepare();
      setStage(action === 'save' ? 'Guardando archivo...' : action === 'share' ? 'Preparando para compartir...' : 'Abriendo archivo...');
      const result = await fileExport[action](file);
      if (result.status === 'cancelled') {
        setMessage('No se guardo el reporte.');
        return;
      }
      setProgress(100);
      setMessage(action === 'save' ? 'El PDF se guardo en la ubicacion seleccionada.' : action === 'share' ? 'El PDF se envio al selector para compartir.' : 'El PDF se abrio correctamente.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos completar la accion. Intenta nuevamente.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reportes</h1>
      <label className="block text-sm font-semibold">Periodo del reporte<input type="month" className="mt-1 min-h-12 w-full min-w-0 rounded-lg border px-3" value={period} onChange={(event) => { setPeriod(event.target.value); setPrepared(null); }} /></label>
      {report.isPending && <DataSyncLoader message="Preparando los datos del reporte..." />}
      {report.data && <ReportPreviewCard title={`Reporte mensual - ${monthName(year, month)} - ${activeAccount?.name}`} income={report.data.summary.total_income} expense={report.data.summary.total_expense} balance={report.data.summary.balance} onDownload={() => void run('save')} />}
      {busy && <section aria-live="polite" aria-busy="true" className="rounded-lg bg-blue-50 p-3 text-primary"><p>{stage}</p><progress className="mt-2 w-full" value={progress} max="100" /></section>}
      <div className="grid gap-3 sm:grid-cols-3">
        <button disabled={!report.data || busy} onClick={() => void run('save')} className="action-primary"><Save className="h-5 w-5" /> Generar y guardar PDF</button>
        <button disabled={!report.data || busy} onClick={() => void run('share')} className="action-secondary"><Share2 className="h-5 w-5" /> Compartir PDF</button>
        <button disabled={!report.data || busy} onClick={() => void run('open')} className="action-secondary"><ExternalLink className="h-5 w-5" /> Abrir PDF</button>
      </div>
      {message && <p role="status" className="rounded-lg bg-green-50 p-3 text-income">{message}</p>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-expense">{error}</p>}
    </div>
  );
}
