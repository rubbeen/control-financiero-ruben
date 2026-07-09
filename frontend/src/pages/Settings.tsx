import { Cloud, Database, FolderKanban, LogOut, ShieldCheck, UploadCloud } from 'lucide-react';
import ConnectionStatus from '../components/ConnectionStatus';
import { logout, OWNER_EMAIL } from '../services/auth';

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
            <p className="mt-1 text-sm text-muted">La app guarda la informacion en Firebase Firestore y exige iniciar sesion para leer o escribir datos.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={() => setPage('accounts')} className="flex items-center gap-3 rounded-lg bg-white p-4 text-left shadow-sm"><FolderKanban className="h-5 w-5 text-primary" /> Cuentas</button>
        <button onClick={() => setPage('categories')} className="flex items-center gap-3 rounded-lg bg-white p-4 text-left shadow-sm"><Database className="h-5 w-5 text-primary" /> Categorias</button>
        <button onClick={() => setPage('backup')} className="flex items-center gap-3 rounded-lg bg-white p-4 text-left shadow-sm"><Database className="h-5 w-5 text-primary" /> Copia de seguridad</button>
        <button onClick={() => setPage('updates')} className="flex items-center gap-3 rounded-lg bg-white p-4 text-left shadow-sm"><UploadCloud className="h-5 w-5 text-primary" /> Actualizar app</button>
      </div>

      <p className="flex gap-2 rounded-lg bg-green-50 p-3 text-sm text-income">
        <ShieldCheck className="h-5 w-5 flex-none" />
        Acceso esperado: {OWNER_EMAIL}. Las reglas de Firestore deben permitir solo este correo.
      </p>

      <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white p-4 font-semibold text-cocoa shadow-sm">
        <LogOut className="h-5 w-5" />
        Cerrar sesion
      </button>
    </div>
  );
}
