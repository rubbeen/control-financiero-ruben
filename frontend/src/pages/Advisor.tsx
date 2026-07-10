import { Bot, Calendar, RefreshCcw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import AccountSelector from '../components/AccountSelector';
import { useFinancialAnalysis } from '../hooks/useFinanceQueries';
import { AdvisorReport, buildAdvisorReport } from '../services/aiAdvisor';
import { formatCurrency } from '../utils/currency';
import { currentYearMonth } from '../utils/dates';

const levelClasses = { positivo: 'border-green-200 bg-green-50 text-income', advertencia: 'border-orange-200 bg-orange-50 text-purchase', critico: 'border-red-200 bg-red-50 text-expense' };

export default function Advisor() {
  const current = currentYearMonth();
  const [period, setPeriod] = useState(`${current.year}-${String(current.month).padStart(2, '0')}`);
  const [year, month] = period.split('-').map(Number);
  const analysis = useFinancialAnalysis(year, month, 2);
  const [report, setReport] = useState<AdvisorReport | null>(null);
  return <div className="space-y-4"><section className="rounded-lg bg-cocoa p-5 text-white"><div className="flex items-start gap-3"><span className="rounded-lg bg-white/15 p-3"><Bot className="h-7 w-7" /></span><div><p className="text-sm font-semibold text-amber-100">Asesor financiero</p><h1 className="mt-1 text-2xl font-extrabold">Analisis de consumos</h1><p className="mt-2 text-sm text-amber-50">Recomendaciones locales basadas en tus cifras diarias y mensuales en COP.</p></div></div></section><section className="rounded-lg border bg-white p-4"><AccountSelector /><label className="mt-4 block text-sm font-semibold">Mes a analizar</label><div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto]"><input type="month" className="min-w-0 rounded-lg border px-3 py-3" value={period} onChange={(event) => { setPeriod(event.target.value); setReport(null); }} /><button disabled={!analysis.data || analysis.isFetching} onClick={() => analysis.data && setReport(buildAdvisorReport(analysis.data))} className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-semibold text-white disabled:opacity-60">{analysis.isFetching ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generar analisis</button></div></section>{!report && <section className="rounded-lg border border-dashed bg-white p-6 text-center"><Calendar className="mx-auto h-10 w-10 text-primary" /><h2 className="mt-3 text-lg font-bold">Listo para revisar tu dinero</h2><p className="mt-1 text-sm text-muted">El analisis solo aparece cuando lo solicitas.</p></section>}{report && <section className="space-y-3"><article className="rounded-lg border bg-white p-4"><p className="text-xs font-semibold uppercase text-primary">Resultado</p><h2 className="mt-1 text-xl font-bold">{report.headline}</h2><p className="mt-2 text-sm text-muted">{report.summary}</p></article>{report.insights.map((item) => <article key={item.title} className={`rounded-lg border p-4 ${levelClasses[item.level]}`}><div className="flex min-w-0 items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-bold">{item.title}</h3><p className="mt-1 break-words text-sm text-text">{item.detail}</p><p className="mt-2 text-sm font-semibold">Accion: {item.action}</p></div>{item.amount !== undefined && <span className="flex-none rounded-full bg-white/80 px-3 py-1 text-xs font-bold">{formatCurrency(item.amount)}</span>}</div></article>)}</section>}</div>;
}
