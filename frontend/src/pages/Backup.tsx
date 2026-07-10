import { Download, LockKeyhole, Upload } from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAccount } from '../context/AccountContext';
import { useUid } from '../hooks/useFinanceQueries';
import { backupService } from '../services/backup';
import { queryClient } from '../services/queryClient';

export default function Backup() {
  const { activeAccountId } = useAccount();
  const uid = useUid();
  const [password, setPassword] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof backupService.preview>> | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const importController = useRef<AbortController | null>(null);

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(null);
  };

  const inspect = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try { setPreview(await backupService.preview(file, password)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo leer.'); }
    finally { setBusy(false); }
  };

  const importFile = async () => {
    if (!file) return;
    setBusy(true);
    setImporting(true);
    setPreview(null);
    importController.current = new AbortController();
    try {
      const result = await backupService.importEncrypted(file, password, setProgress, importController.current.signal);
      await Promise.all(['accounts', 'categories', 'movements', 'financialAnalysis', 'budget'].map((key) => queryClient.invalidateQueries({ queryKey: [key, uid] })));
      setMessage(`Importacion terminada: ${result.imported} registros; ${result.skipped} conflictos omitidos.`);
    } catch (cause) {
      setError((cause as Error).name === 'AbortError' ? 'Importacion cancelada.' : cause instanceof Error ? cause.message : 'No se pudo importar.');
    } finally {
      setBusy(false);
      setImporting(false);
      importController.current = null;
    }
  };

  return (
    <div className="space-y-4">
      <ConfirmDialog open={preview !== null} title="Confirmar importacion" message={<span>Se importaran hasta {preview?.counts.movements} movimientos. Se omitiran {preview?.conflicts} conflictos y primero se descargara un respaldo cifrado del estado actual.</span>} confirmLabel="Importar" onCancel={() => setPreview(null)} onConfirm={() => void importFile()} />
      <h1 className="text-2xl font-bold">Copia de seguridad cifrada</h1>
      <p className="rounded-lg bg-blue-50 p-3 text-sm text-primary">La contrasena no se guarda. Sin ella no es posible recuperar el archivo.</p>
      <label className="block text-sm font-semibold">Contrasena del respaldo<input type="password" minLength={10} className="mt-1 w-full rounded-lg border px-3 py-3" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <button disabled={busy || password.length < 10} onClick={() => void backupService.exportEncrypted(password)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary font-semibold text-white disabled:opacity-50"><LockKeyhole className="h-5 w-5" /> Exportar .cfrbackup</button>
      <button onClick={() => void backupService.exportCsv(activeAccountId)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-navy font-semibold text-white"><Download className="h-5 w-5" /> Exportar CSV de esta cuenta</button>
      <p className="text-xs text-muted">El CSV incluye BOM UTF-8 y neutraliza formulas, pero no esta cifrado. Eliminalo cuando ya no lo necesites.</p>
      <label className="flex cursor-pointer flex-col items-center rounded-lg border border-dashed bg-white p-8 text-center"><Upload className="h-8 w-8 text-primary" /><span className="mt-2 font-semibold">Seleccionar .cfrbackup</span><input type="file" accept=".cfrbackup,application/octet-stream" onChange={chooseFile} className="hidden" /></label>
      {file && <button disabled={busy || password.length < 10} onClick={() => void inspect()} className="w-full rounded-lg border border-primary px-4 py-3 font-semibold text-primary">Validar y ver resumen</button>}
      {busy && <div><p className="text-sm">Procesando... {progress ? `${progress}%` : ''}</p><progress className="w-full" value={progress} max="100" />{importing && <button type="button" onClick={() => importController.current?.abort()} className="mt-2 min-h-11 text-expense">Cancelar importacion</button>}</div>}
      {message && <p className="rounded-lg bg-green-50 p-3 text-income">{message}</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-expense">{error}</p>}
    </div>
  );
}
