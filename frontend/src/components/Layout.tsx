import { App as CapacitorApp } from '@capacitor/app';
import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AppLogo from './AppLogo';
import BottomNavigation from './BottomNavigation';

const mainRoutes = new Set(['/', '/add', '/history', '/analysis', '/settings']);
const fallbackRoutes: Record<string, string> = {
  '/settings/accounts': '/settings', '/settings/categories': '/settings', '/settings/backup': '/settings', '/settings/updates': '/settings',
  '/budget': '/', '/reports': '/', '/comparisons': '/analysis', '/advisor': '/'
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [exitHint, setExitHint] = useState(false);
  const lastBack = useRef(0);
  const showBack = !mainRoutes.has(location.pathname);

  const goBack = useCallback(() => {
    if (location.key !== 'default') navigate(-1);
    else navigate(location.pathname.startsWith('/movements/') ? '/history' : (fallbackRoutes[location.pathname] || '/'), { replace: true });
  }, [location.key, location.pathname, navigate]);

  useEffect(() => {
    let remove: (() => Promise<void>) | undefined;
    void CapacitorApp.addListener('backButton', () => {
      if (document.body.dataset.dialogOpen === 'true') {
        window.dispatchEvent(new Event('app-dialog-back'));
        return;
      }
      if (location.pathname !== '/') {
        goBack();
        return;
      }
      const now = Date.now();
      if (now - lastBack.current < 2000) void CapacitorApp.exitApp();
      else {
        lastBack.current = now;
        setExitHint(true);
        window.setTimeout(() => setExitHint(false), 2000);
      }
    }).then((handle) => { remove = () => handle.remove(); });
    return () => { void remove?.(); };
  }, [location.pathname, goBack]);

  return (
    <div className="app-viewport bg-app">
      <header className="safe-header sticky top-0 z-30 border-b border-orange-100 bg-cream/95 pb-3 shadow-sm backdrop-blur">
        <div className="safe-inline mx-auto flex max-w-6xl min-w-0 items-center gap-2">
          {showBack && <button type="button" onClick={goBack} aria-label="Volver" className="touch-target flex-none rounded-lg text-cocoa"><ArrowLeft className="h-5 w-5" /></button>}
          <AppLogo />
          <div className="min-w-0 flex-1">
            <p className="break-words text-[15px] font-extrabold leading-tight text-cocoa">Control Financiero Ruben</p>
            <p className="mt-1 break-words text-xs font-medium text-muted">Datos protegidos - COP</p>
          </div>
        </div>
      </header>
      <main className="safe-bottom safe-inline mx-auto w-full max-w-6xl min-w-0 py-4"><Outlet /></main>
      {exitHint && <p role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-cocoa px-4 py-3 text-sm font-semibold text-white shadow-lg">Presiona de nuevo para salir</p>}
      <BottomNavigation />
    </div>
  );
}
