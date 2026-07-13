import { Download, ExternalLink, RefreshCcw, UploadCloud, X } from 'lucide-react';
import { useRef, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import { IS_PLAY_DISTRIBUTION, openAllowedExternalUrl, PLAY_STORE_URL } from '../services/distribution';
import { APP_VERSION, APP_VERSION_CODE, downloadAndInstall, getReleaseFallback, getUpdateManifest, UpdateManifest } from '../services/version';

export default function Updates() {
  return IS_PLAY_DISTRIBUTION ? <PlayUpdates /> : <GithubUpdates />;
}

function PlayUpdates() {
  const [error, setError] = useState('');
  return <div className="space-y-4"><section className="rounded-lg bg-cocoa p-5 text-white"><UploadCloud className="h-7 w-7" /><h1 className="mt-2 text-2xl font-extrabold">Actualizar app</h1><p className="mt-2 text-sm text-amber-50">Version instalada: {APP_VERSION} ({APP_VERSION_CODE}).</p></section><p className="rounded-lg border bg-white p-4">Las actualizaciones se administran desde Google Play.</p><button disabled={!PLAY_STORE_URL} onClick={() => void openAllowedExternalUrl(PLAY_STORE_URL).catch((cause) => setError(cause instanceof Error ? cause.message : 'No se pudo abrir Google Play.'))} className="action-primary"><ExternalLink className="h-5 w-5" /> Abrir Google Play</button>{!PLAY_STORE_URL && <p className="text-sm text-muted">La ficha se habilitara cuando exista su URL oficial.</p>}{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-expense">{error}</p>}</div>;
}

function GithubUpdates() {
  const [manifest, setManifest] = useState<UpdateManifest | null>(null);
  const [fallback, setFallback] = useState<{ releasePageUrl: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  const check = async () => { setLoading(true); setError(''); setFallback(null); try { const next = await getUpdateManifest(); setManifest(next); setMessage(next.versionCode > APP_VERSION_CODE ? `Nueva version disponible: ${next.versionName}.` : 'Ya tienes la version mas reciente.'); } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo revisar.'); setFallback(await getReleaseFallback()); } finally { setLoading(false); } };
  const install = async () => { if (!manifest) return; setConfirm(false); setLoading(true); setProgress(0); setError(''); controller.current = new AbortController(); try { await downloadAndInstall(manifest, setProgress, controller.current.signal); setMessage('APK verificado. Confirma la instalacion en la pantalla de Android.'); } catch (cause) { if ((cause as Error).name !== 'AbortError') setError(cause instanceof Error ? cause.message : 'No se pudo actualizar.'); } finally { setLoading(false); controller.current = null; } };
  return <div className="space-y-4"><ConfirmDialog open={confirm} title="Descargar actualizacion" message={`Se descargara y verificara la version ${manifest?.versionName}. Android te pedira confirmar la instalacion.`} confirmLabel="Continuar" onCancel={() => setConfirm(false)} onConfirm={() => void install()} /><section className="rounded-lg bg-cocoa p-5 text-white"><UploadCloud className="h-7 w-7" /><h1 className="mt-2 text-2xl font-extrabold">Actualizar app</h1><p className="mt-2 text-sm text-amber-50">Version instalada: {APP_VERSION} ({APP_VERSION_CODE}). Fuente fija: repositorio oficial.</p></section><button onClick={() => void check()} disabled={loading} className="action-primary"><RefreshCcw className={`h-5 w-5 ${loading && !progress ? 'animate-spin motion-reduce:animate-none' : ''}`} /> Revisar actualizaciones</button>{manifest && <section className="space-y-3 rounded-lg border bg-white p-4"><h2 className="text-xl font-bold">Version {manifest.versionName}</h2><p className="text-sm text-muted">{(manifest.fileSizeBytes / 1024 / 1024).toFixed(1)} MB - {new Date(manifest.publishedAt).toLocaleDateString('es-CO')}</p><ul className="list-inside list-disc text-sm">{manifest.releaseNotes.map((note) => <li key={note}>{note}</li>)}</ul>{manifest.versionCode > APP_VERSION_CODE && <button onClick={() => setConfirm(true)} disabled={loading} className="action-primary"><Download className="h-5 w-5" /> Actualizar app</button>}</section>}{loading && progress > 0 && <section className="rounded-lg bg-blue-50 p-3"><div className="flex justify-between"><span>Descargando y verificando</span><strong>{progress}%</strong></div><progress className="mt-2 w-full" value={progress} max="100" /><button onClick={() => controller.current?.abort()} className="mt-2 flex min-h-12 items-center gap-2 text-expense"><X className="h-4 w-4" /> Cancelar</button></section>}{message && <p role="status" className="rounded-lg bg-green-50 p-3 text-income">{message}</p>}{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-expense">{error}</p>}{fallback && <button onClick={() => void openAllowedExternalUrl(fallback.releasePageUrl)} className="action-secondary"><ExternalLink className="h-4 w-4" /> {fallback.message}</button>}</div>;
}
