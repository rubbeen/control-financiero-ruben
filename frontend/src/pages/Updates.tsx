import { Download, Github, RefreshCcw, UploadCloud } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { APP_VERSION, getLatestRelease, getReleaseRepoUrl, setReleaseRepoUrl } from '../services/version';

export default function Updates() {
  const [repoUrl, setRepoUrlState] = useState(getReleaseRepoUrl());
  const [latest, setLatest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function saveRepo(event: FormEvent) {
    event.preventDefault();
    setReleaseRepoUrl(repoUrl);
    setMessage('Repositorio guardado. Ahora puedes consultar actualizaciones.');
  }

  async function check() {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const release = await getLatestRelease(repoUrl);
      setLatest(release);
      setMessage(release.version === APP_VERSION ? 'Ya tienes la version actual.' : `Hay una version disponible: ${release.version}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pude revisar actualizaciones.');
    } finally {
      setLoading(false);
    }
  }

  function download() {
    if (!latest?.apkUrl) return;
    window.open(latest.apkUrl, '_blank');
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-gradient-to-br from-cocoa via-copper to-purchase p-5 text-white shadow-soft">
        <div className="flex items-start gap-3">
          <span className="rounded-2xl bg-white/15 p-3">
            <UploadCloud className="h-7 w-7 text-amber-100" />
          </span>
          <div>
            <p className="text-sm font-semibold text-amber-100">GitHub Releases</p>
            <h1 className="mt-1 text-2xl font-extrabold">Actualizar app</h1>
            <p className="mt-2 text-sm text-amber-50">Version instalada: {APP_VERSION}. Puedes revisar si hay un APK nuevo publicado en GitHub.</p>
          </div>
        </div>
      </section>

      <form onSubmit={saveRepo} className="space-y-3 rounded-lg border border-border bg-white p-4 shadow-sm">
        <label className="block text-sm font-semibold text-text">Repositorio de GitHub
          <input className="mt-1 w-full rounded-lg border border-border px-3 py-3" value={repoUrl} onChange={(event) => setRepoUrlState(event.target.value)} placeholder="https://github.com/usuario/control-financiero-ruben" />
        </label>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-white">
          <Github className="h-4 w-4" /> Guardar repositorio
        </button>
      </form>

      <button onClick={check} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-cocoa px-4 py-4 font-semibold text-white disabled:opacity-60">
        <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} /> Revisar ultima version
      </button>

      {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-income">{message}</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-expense">{error}</p>}

      {latest && (
        <section className="space-y-3 rounded-lg border border-border bg-white p-4 shadow-sm">
          <div>
            <p className="text-sm text-muted">Ultima version</p>
            <h2 className="text-xl font-bold text-text">{latest.name || latest.version}</h2>
          </div>
          <p className="max-h-40 overflow-auto whitespace-pre-wrap text-sm text-muted">{latest.notes || 'Sin notas de version.'}</p>
          <button onClick={download} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-white">
            <Download className="h-5 w-5" /> Descargar APK
          </button>
          <p className="text-xs text-muted">Android pedira confirmar la instalacion. Por seguridad, ninguna app externa a Play Store puede reemplazarse sola sin tu permiso.</p>
        </section>
      )}
    </div>
  );
}
