import { Cloud, Database, FolderKanban, LogOut, ShieldCheck, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConnectionStatus from '../components/ConnectionStatus';
import { logout } from '../services/auth';
import { getLocalPerformanceEntries } from '../utils/performance';

export default function Settings() {
  const navigate = useNavigate();
  const diagnostics = import.meta.env.DEV ? getLocalPerformanceEntries() : [];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Configuracion</h1>
      <ConnectionStatus />
      <section className="rounded-lg border bg-white p-4">
        <div className="flex items-start gap-3"><span className="rounded-lg bg-blue-50 p-2 text-primary"><Cloud className="h-5 w-5" /></span><div><h2 className="font-semibold">Datos privados en internet</h2><p className="mt-1 text-sm text-muted">Firestore exige sesion verificada y separa toda la informacion por UID.</p></div></div>
      </section>
      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={() => navigate('/settings/accounts')} className="settings-button"><FolderKanban className="h-5 w-5 text-primary" /> Cuentas</button>
        <button onClick={() => navigate('/settings/categories')} className="settings-button"><Database className="h-5 w-5 text-primary" /> Categorias</button>
        <button onClick={() => navigate('/settings/backup')} className="settings-button"><ShieldCheck className="h-5 w-5 text-primary" /> Copia cifrada</button>
        <button onClick={() => navigate('/settings/updates')} className="settings-button"><UploadCloud className="h-5 w-5 text-primary" /> Actualizar app</button>
      </div>
      <p className="flex gap-2 rounded-lg bg-green-50 p-3 text-sm text-income"><ShieldCheck className="h-5 w-5 flex-none" /> Acceso protegido por UID, correo autorizado y correo verificado.</p>
      {import.meta.env.DEV && <details className="rounded-lg border bg-white p-4"><summary className="cursor-pointer font-semibold">Diagnostico local ({diagnostics.length})</summary><pre className="mt-3 max-h-56 overflow-auto text-xs">{JSON.stringify(diagnostics, null, 2)}</pre></details>}
      <button onClick={() => void logout()} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border bg-white font-semibold"><LogOut className="h-5 w-5" /> Cerrar sesion</button>
    </div>
  );
}
