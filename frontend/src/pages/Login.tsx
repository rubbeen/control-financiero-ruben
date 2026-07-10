import { FormEvent, useState } from 'react';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import AppLogo from '../components/AppLogo';
import { authErrorMessage, consumeAuthNotice, loginWithEmail, resetPassword } from '../services/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(() => consumeAuthNotice());

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await loginWithEmail(email, password);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function recoverPassword() {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await resetPassword(email);
      setMessage('Si la cuenta est\u00e1 registrada y autorizada, recibir\u00e1s las instrucciones correspondientes.');
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-app px-5 py-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <div className="mb-6 flex min-w-0 items-center gap-3">
          <AppLogo />
          <div className="min-w-0">
            <p className="break-words text-xl font-extrabold text-cocoa">Control Financiero Ruben</p>
            <p className="text-sm font-medium text-muted">Acceso protegido con Firebase</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3 text-sm text-income">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-none" />
            <p>{'Tu informaci\u00f3n financiera est\u00e1 protegida mediante autenticaci\u00f3n y reglas de acceso.'}</p>
          </div>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-expense">{error}</p>}
          {message && <p className="rounded-lg bg-blue-50 p-3 text-sm font-medium text-primary">{message}</p>}

          <label className="block text-sm font-semibold text-text">
            Correo
            <span className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-cream px-3 py-2">
              <Mail className="h-4 w-4 text-muted" />
              <input className="min-w-0 flex-1 bg-transparent outline-none" value={email} onChange={(event) => setEmail(event.target.value)} inputMode="email" autoComplete="email" />
            </span>
          </label>

          <label className="block text-sm font-semibold text-text">
            Contrasena
            <span className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-cream px-3 py-2">
              <Lock className="h-4 w-4 text-muted" />
              <input className="min-w-0 flex-1 bg-transparent outline-none" value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" />
            </span>
          </label>

          <button disabled={loading || !password} className="w-full rounded-lg bg-primary px-4 py-3 font-bold text-white shadow-sm disabled:opacity-60">
            {loading ? 'Verificando...' : 'Entrar seguro'}
          </button>

          <button type="button" onClick={recoverPassword} disabled={loading || !email.trim()} className="w-full rounded-lg border border-border px-4 py-3 text-sm font-semibold text-cocoa disabled:opacity-60">
            Recuperar contrasena
          </button>
        </form>
      </section>
    </main>
  );
}
