import { Cloud, Database, ExternalLink, FolderKanban, LogOut, ShieldCheck, UploadCloud } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConnectionStatus from '../components/ConnectionStatus';
import { logout } from '../services/auth';
import { openAllowedExternalUrl, PRIVACY_POLICY_URL } from '../services/distribution';
import { screenProtection } from '../services/screenProtection';
import { getLocalPerformanceEntries } from '../utils/performance';

export default function Settings() {
  const navigate = useNavigate();
  const [screenProtected, setScreenProtected] = useState(false);
  const [privacyBusy, setPrivacyBusy] = useState(true);
  const [privacyError, setPrivacyError] = useState('');
  const diagnostics = import.meta.env.DEV ? getLocalPerformanceEntries() : [];
  useEffect(() => { void screenProtection.getState().then((state) => setScreenProtected(state.enabled)).catch(() => setPrivacyError('No se pudo leer la preferencia de privacidad.')).finally(() => setPrivacyBusy(false)); }, []);
  const updateProtection = async (enabled: boolean) => { setPrivacyBusy(true); setPrivacyError(''); try { const state = await screenProtection.setEnabled(enabled); setScreenProtected(state.enabled); } catch { setPrivacyError('No se pudo cambiar la proteccion de pantalla.'); } finally { setPrivacyBusy(false); } };
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
      <section className="space-y-3 rounded-lg border bg-white p-4">
        <div><h2 className="font-semibold">Privacidad de pantalla</h2><p className="mt-1 text-sm text-muted">Las capturas pueden contener informacion financiera personal.</p></div>
        <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4"><span className="font-medium">Bloquear capturas y grabacion de pantalla</span><input type="checkbox" className="h-6 w-6 accent-primary" checked={screenProtected} disabled={privacyBusy} onChange={(event) => void updateProtection(event.target.checked)} /></label>
        <p className="text-xs text-muted">Desactivado por defecto. Al activarlo, Android protege capturas, grabacion y vista reciente segun el soporte del dispositivo.</p>
        {privacyError && <p role="alert" className="text-sm text-expense">{privacyError}</p>}
      </section>
      <section className="space-y-3 rounded-lg border bg-white p-4"><h2 className="font-semibold">Informacion legal</h2><p className="text-sm text-muted">Esta aplicacion es una herramienta de organizacion personal. No es un banco, no ejecuta pagos y no sustituye asesoria financiera profesional.</p><button disabled={!PRIVACY_POLICY_URL} onClick={() => void openAllowedExternalUrl(PRIVACY_POLICY_URL).catch(() => setPrivacyError('No se pudo abrir la politica de privacidad.'))} className="action-secondary"><ExternalLink className="h-5 w-5" /> Politica de privacidad</button>{!PRIVACY_POLICY_URL && <p className="text-xs text-muted">Politica en borrador: falta publicar una URL oficial de soporte.</p>}</section>
      <p className="flex gap-2 rounded-lg bg-green-50 p-3 text-sm text-income"><ShieldCheck className="h-5 w-5 flex-none" /> Acceso protegido por UID, correo autorizado y correo verificado.</p>
      {import.meta.env.DEV && <details className="rounded-lg border bg-white p-4"><summary className="cursor-pointer font-semibold">Diagnostico local ({diagnostics.length})</summary><pre className="mt-3 max-h-56 overflow-auto text-xs">{JSON.stringify(diagnostics, null, 2)}</pre></details>}
      <button onClick={() => void logout()} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border bg-white font-semibold"><LogOut className="h-5 w-5" /> Cerrar sesion</button>
    </div>
  );
}
