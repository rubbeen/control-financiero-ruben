import { Bot, Calendar, RefreshCcw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { AdvisorReport, generateAdvisorReport } from '../services/aiAdvisor';
import { currentYearMonth } from '../utils/dates';
import { formatCurrency } from '../utils/currency';
import AccountSelector from '../components/AccountSelector';

const levelClasses = {
  positivo: 'border-green-200 bg-green-50 text-income',
  advertencia: 'border-orange-200 bg-orange-50 text-purchase',
  critico: 'border-red-200 bg-red-50 text-expense'
};

export default function Advisor() {
  const current = currentYearMonth();
  const [period, setPeriod] = useState(`${current.year}-${String(current.month).padStart(2, '0')}`);
  const [report, setReport] = useState<AdvisorReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    const [year, month] = period.split('-').map(Number);
    setLoading(true);
    setError('');
    try {
      setReport(await generateAdvisorReport(year, month));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pude generar el analisis.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-gradient-to-br from-cocoa via-copper to-purchase p-5 text-white shadow-soft">
        <div className="flex items-start gap-3">
          <span className="rounded-2xl bg-white/15 p-3">
            <Bot className="h-7 w-7 text-amber-100" />
          </span>
          <div>
            <p className="text-sm font-semibold text-amber-100">IA financiera local</p>
            <h1 className="mt-1 text-2xl font-extrabold">Analisis inteligente de consumos</h1>
            <p className="mt-2 text-sm text-amber-50">Genera recomendaciones cuando lo pidas usando tus consumos diarios y mensuales en pesos colombianos.</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <div className="mb-4">
          <AccountSelector />
        </div>
        <label className="block text-sm font-semibold text-text">Mes a analizar</label>
        <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input type="month" className="rounded-lg border border-border px-3 py-3" value={period} onChange={(event) => setPeriod(event.target.value)} />
          <button onClick={generate} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-white disabled:opacity-60">
            {loading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? 'Analizando...' : 'Generar analisis'}
          </button>
        </div>
      </section>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-expense">{error}</p>}

      {!report && !loading && (
        <section className="rounded-lg border border-dashed border-border bg-white p-6 text-center">
          <Calendar className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-3 text-lg font-bold text-text">Listo para revisar tu dinero</h2>
          <p className="mt-1 text-sm text-muted">Toca generar analisis y la app revisara tus patrones de gasto con datos reales.</p>
        </section>
      )}

      {report && (
        <section className="space-y-3">
          <article className="rounded-lg border border-border bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Resultado</p>
            <h2 className="mt-1 text-xl font-bold text-text">{report.headline}</h2>
            <p className="mt-2 text-sm text-muted">{report.summary}</p>
          </article>

          {report.insights.map((item) => (
            <article key={item.title} className={`rounded-lg border p-4 ${levelClasses[item.level]}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-1 text-sm text-text">{item.detail}</p>
                  <p className="mt-2 text-sm font-semibold text-cocoa">Accion: {item.action}</p>
                </div>
                {item.amount !== undefined && <span className="flex-none rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-cocoa">{formatCurrency(item.amount)}</span>}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
