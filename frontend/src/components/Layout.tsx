import AppLogo from './AppLogo';
import BottomNavigation from './BottomNavigation';

interface Props {
  page: string;
  setPage: (page: string) => void;
  children: React.ReactNode;
}

export default function Layout({ page, setPage, children }: Props) {
  return (
    <div className="min-h-screen bg-app">
      <header className="safe-header sticky top-0 z-30 border-b border-orange-100 bg-cream/95 pb-4 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5">
          <AppLogo />
          <div className="min-w-0">
            <p className="break-words text-[15px] font-extrabold leading-tight text-cocoa">Control Financiero Ruben</p>
            <p className="mt-1 text-xs font-medium text-muted">Firebase seguro · Pesos colombianos COP</p>
          </div>
        </div>
      </header>
      <main className="safe-bottom mx-auto max-w-6xl px-4 py-4">{children}</main>
      <BottomNavigation page={page} setPage={setPage} />
    </div>
  );
}
