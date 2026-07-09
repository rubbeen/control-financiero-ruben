import { Download, Upload } from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import { backupService } from '../services/backup';

export default function Backup() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const result = await backupService.importJson(file);
      setMessage(`Importacion lista: ${result.imported_movements} movimientos, ${result.imported_categories} categorias, ${result.skipped_duplicates} duplicados omitidos.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo importar el respaldo.');
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text">Copia de seguridad</h1>
      <section className="grid gap-3 sm:grid-cols-2">
        <button onClick={() => backupService.exportJson()} className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-4 font-semibold text-white"><Download className="h-5 w-5" /> Exportar JSON</button>
        <button onClick={() => backupService.exportCsv()} className="flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-4 font-semibold text-white"><Download className="h-5 w-5" /> Exportar CSV</button>
      </section>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white p-8 text-center">
        <Upload className="h-8 w-8 text-primary" />
        <span className="mt-2 font-semibold text-text">Importar respaldo JSON</span>
        <span className="text-sm text-muted">Se valida estructura y se omiten duplicados.</span>
        <input type="file" accept="application/json,.json" onChange={importFile} className="hidden" />
      </label>
      {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-income">{message}</p>}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-expense">{error}</p>}
    </div>
  );
}
