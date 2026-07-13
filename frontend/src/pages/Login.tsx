import { FormEvent, useState } from 'react';
import { Lock, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import AppLogo from '../components/AppLogo';
import { authErrorMessage, consumeAuthNotice, loginWithEmail, registerWithEmail, resetPassword } from '../services/auth';

type AuthMode = 'login' | 'register';

export default function Login() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(() => consumeAuthNotice());

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'register') {
        if (password !== passwordConfirmation) throw new Error('Las contrasenas no coinciden.');
        await registerWithEmail(email, password);
        setMode('login');
        setPassword('');
        setPasswordConfirmation('');
        setMessage('Cuenta creada. Revisa tu correo y abre el enlace de verificacion antes de iniciar sesion.');
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setPassword('');
    setPasswordConfirmation('');
    setError('');
    setMessage('');
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
    <main className="app-viewport safe-inline bg-app px-4 py-5 sm:px-5 sm:py-8">
      <section className="auth-viewport mx-auto flex max-w-md flex-col justify-center">
        <div className="mb-5 flex min-w-0 items-center gap-3 sm:mb-6">
          <AppLogo />
          <div className="min-w-0">
            <p className="break-words text-xl font-extrabold text-cocoa">Control Financiero Ruben</p>
            <p className="break-words text-sm font-medium text-muted">Tus finanzas privadas en COP</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-lg border border-orange-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-cream p-1" aria-label="Tipo de acceso">
            <button type="button" onClick={() => changeMode('login')} aria-pressed={mode === 'login'} className={`min-h-11 rounded-lg px-2 text-sm font-semibold ${mode === 'login' ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}>Ingresar</button>
            <button type="button" onClick={() => changeMode('register')} aria-pressed={mode === 'register'} className={`min-h-11 rounded-lg px-2 text-sm font-semibold ${mode === 'register' ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}>Crear cuenta</button>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3 text-sm text-income">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-none" />
            <p>{mode === 'register' ? 'Cada cuenta mantiene sus datos separados y requiere verificar el correo.' : 'Tu informacion financiera esta protegida mediante autenticacion y reglas de acceso.'}</p>
          </div>

          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-expense">{error}</p>}
          {message && <p role="status" aria-live="polite" className="rounded-lg bg-blue-50 p-3 text-sm font-medium text-primary">{message}</p>}

          <label className="block text-sm font-semibold text-text">
            Correo
            <span className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-cream px-3 py-2">
              <Mail className="h-4 w-4 text-muted" />
              <input required type="email" className="min-h-8 min-w-0 flex-1 bg-transparent text-base outline-none" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} inputMode="email" autoCapitalize="none" autoComplete="email" />
            </span>
          </label>

          <label className="block text-sm font-semibold text-text">
            Contrasena
            <span className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-cream px-3 py-2">
              <Lock className="h-4 w-4 text-muted" />
              <input required minLength={mode === 'register' ? 8 : undefined} maxLength={128} className="min-h-8 min-w-0 flex-1 bg-transparent text-base outline-none" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
            </span>
          </label>

          {mode === 'register' && <label className="block text-sm font-semibold text-text">
            Confirmar contrasena
            <span className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-cream px-3 py-2">
              <Lock className="h-4 w-4 text-muted" />
              <input required minLength={8} maxLength={128} className="min-h-8 min-w-0 flex-1 bg-transparent text-base outline-none" value={passwordConfirmation} onChange={(event) => { setPasswordConfirmation(event.target.value); setError(''); }} type="password" autoComplete="new-password" />
            </span>
            <span className="mt-1 block text-xs font-medium text-muted">Usa al menos 8 caracteres.</span>
          </label>}

          <button disabled={loading || !email.trim() || !password || (mode === 'register' && !passwordConfirmation)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-bold text-white shadow-sm disabled:opacity-60">
            {mode === 'register' && <UserPlus className="h-5 w-5" />}
            {loading ? (mode === 'register' ? 'Creando cuenta...' : 'Verificando...') : (mode === 'register' ? 'Crear mi cuenta' : 'Entrar seguro')}
          </button>

          {mode === 'login' && <button type="button" onClick={recoverPassword} disabled={loading || !email.trim()} className="min-h-12 w-full rounded-lg border border-border px-4 py-3 text-sm font-semibold text-cocoa disabled:opacity-60">
            Recuperar contrasena
          </button>}
        </form>
      </section>
    </main>
  );
}
