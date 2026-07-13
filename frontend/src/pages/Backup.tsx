import { Download, LockKeyhole, Share2, Upload } from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAccount } from '../context/AccountContext';
import { useUid } from '../hooks/useFinanceQueries';
import { backupService } from '../services/backup';
import { fileExport } from '../services/fileExport';
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
  const [stage, setStage] = useState('');
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
      setStage('Preparando respaldo preventivo...');
      const preventive = await backupService.generateEncryptedBackup(password, 'respaldo-antes-de-importar');
      const saved = await fileExport.save(preventive);
      if (saved.status !== 'saved') throw new DOMException('Debes guardar el respaldo preventivo antes de importar.', 'AbortError');
      setStage('Importando datos validados...');
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

  const exportBackup = async (share = false) => {
    if (busy) return;
    setBusy(true); setError(''); setMessage(''); setProgress(0); setStage('Cifrando respaldo...');
    try {
      const generated = await backupService.generateEncryptedBackup(password);
      setProgress(80); setStage(share ? 'Preparando para compartir...' : 'Seleccionando ubicacion...');
      const result = share ? await fileExport.share(generated) : await fileExport.save(generated);
      if (result.status === 'cancelled') setMessage('No se guardo el respaldo.');
      else { setProgress(100); setMessage(share ? 'Respaldo listo para compartir.' : 'Respaldo guardado correctamente.'); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo exportar el respaldo.'); }
    finally { setBusy(false); }
  };

  const exportCsv = async (share = false) => {
    if (busy) return;
    setBusy(true); setError(''); setMessage(''); setProgress(0); setStage('Preparando movimientos de la cuenta...');
    try {
      const generated = await backupService.generateAccountCsv(activeAccountId);
      setProgress(80); setStage(share ? 'Preparando para compartir...' : 'Seleccionando ubicacion...');
      const result = share ? await fileExport.share(generated) : await fileExport.save(generated);
      if (result.status === 'cancelled') setMessage('No se guardo el CSV.');
      else { setProgress(100); setMessage(`${generated.rowCount} movimientos exportados correctamente.`); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo exportar el CSV.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <ConfirmDialog open={preview !== null} title="Confirmar importacion" message={<span>Se importaran hasta {preview?.counts.movements} movimientos. Se omitiran {preview?.conflicts} conflictos. Antes deberas guardar un respaldo cifrado del estado actual.</span>} confirmLabel="Guardar respaldo e importar" onCancel={() => setPreview(null)} onConfirm={() => void importFile()} />
      <h1 className="text-2xl font-bold">Copia de seguridad cifrada</h1>
      <p className="rounded-lg bg-blue-50 p-3 text-sm text-primary">La contrasena no se guarda. Sin ella no es posible recuperar el archivo.</p>
      <label className="block text-sm font-semibold">Contrasena del respaldo<input type="password" minLength={10} className="mt-1 w-full rounded-lg border px-3 py-3" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <button disabled={busy || password.length < 10} onClick={() => void exportBackup()} className="action-primary"><LockKeyhole className="h-5 w-5" /> Guardar .cfrbackup</button>
        <button disabled={busy || password.length < 10} onClick={() => void exportBackup(true)} className="action-secondary"><Share2 className="h-5 w-5" /> Compartir respaldo</button>
        <button disabled={busy} onClick={() => void exportCsv()} className="action-primary"><Download className="h-5 w-5" /> Guardar CSV de esta cuenta</button>
        <button disabled={busy} onClick={() => void exportCsv(true)} className="action-secondary"><Share2 className="h-5 w-5" /> Compartir CSV</button>
      </div>
      <p className="text-xs text-muted">El CSV incluye BOM UTF-8 y neutraliza formulas, pero no esta cifrado. Eliminalo cuando ya no lo necesites.</p>
      <label className="flex cursor-pointer flex-col items-center rounded-lg border border-dashed bg-white p-8 text-center"><Upload className="h-8 w-8 text-primary" /><span className="mt-2 font-semibold">Seleccionar .cfrbackup</span><input type="file" accept=".cfrbackup,application/octet-stream" onChange={chooseFile} className="hidden" /></label>
      {file && <button disabled={busy || password.length < 10} onClick={() => void inspect()} className="w-full rounded-lg border border-primary px-4 py-3 font-semibold text-primary">Validar y ver resumen</button>}
      {busy && <div aria-live="polite" aria-busy="true"><p className="text-sm">{stage || 'Procesando...'} {progress ? `${progress}%` : ''}</p><progress className="w-full" value={progress} max="100" />{importing && <button type="button" onClick={() => importController.current?.abort()} className="mt-2 min-h-12 text-expense">Cancelar importacion</button>}</div>}
      {message && <p className="rounded-lg bg-green-50 p-3 text-income">{message}</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-expense">{error}</p>}
    </div>
  );
}
