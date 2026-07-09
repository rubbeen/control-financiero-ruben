import { Cloud, Database, FolderKanban, ShieldAlert, UploadCloud } from 'lucide-react';
import ConnectionStatus from '../components/ConnectionStatus';

interface Props {
  setPage: (page: string) => void;
}

export default function Settings({ setPage }: Props) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text">Configuracion</h1>
      <ConnectionStatus />

      <section className="space-y-3 rounded-lg border border-border bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-blue-50 p-2 text-primary"><Cloud className="h-5 w-5" /></span>
          <div>
            <h2 className="font-semibold text-text">Base de datos en internet</h2>
            <p className="mt-1 text-sm text-muted">La app guarda la informacion en Firebase Firestore. Puedes usarla desde el celular con internet aunque el computador este apagado.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={() => setPage('accounts')} className="flex items-center gap-3 rounded-lg bg-white p-4 text-left shadow-sm"><FolderKanban className="h-5 w-5 text-primary" /> Cuentas</button>
        <button onClick={() => setPage('categories')} className="flex items-center gap-3 rounded-lg bg-white p-4 text-left shadow-sm"><Database className="h-5 w-5 text-primary" /> Categorias</button>
        <button onClick={() => setPage('backup')} className="flex items-center gap-3 rounded-lg bg-white p-4 text-left shadow-sm"><Database className="h-5 w-5 text-primary" /> Copia de seguridad</button>
        <button onClick={() => setPage('updates')} className="flex items-center gap-3 rounded-lg bg-white p-4 text-left shadow-sm"><UploadCloud className="h-5 w-5 text-primary" /> Actualizar app</button>
      </div>

      <p className="flex gap-2 rounded-lg bg-orange-50 p-3 text-sm text-purchase">
        <ShieldAlert className="h-5 w-5 flex-none" />
        Recomendacion: cuando confirmes que la app funciona, cambia las reglas de Firestore para proteger tus datos personales.
      </p>
    </div>
  );
}
