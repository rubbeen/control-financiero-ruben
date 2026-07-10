import { lazy, Suspense, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import { AccountProvider } from './context/AccountContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { watchAuth } from './services/auth';
import { perfMeasureAsync } from './utils/performance';

const Accounts = lazy(() => import('./pages/Accounts'));
const AddMovement = lazy(() => import('./pages/AddMovement'));
const Advisor = lazy(() => import('./pages/Advisor'));
const Backup = lazy(() => import('./pages/Backup'));
const Budget = lazy(() => import('./pages/Budget'));
const Categories = lazy(() => import('./pages/Categories'));
const Comparisons = lazy(() => import('./pages/Comparisons'));
const History = lazy(() => import('./pages/History'));
const MonthlyAnalysis = lazy(() => import('./pages/MonthlyAnalysis'));
const MovementDetail = lazy(() => import('./pages/MovementDetail'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const Updates = lazy(() => import('./pages/Updates'));

function PageFallback() {
  return <div className="space-y-3" aria-busy="true"><div className="skeleton h-8 w-48" /><div className="skeleton h-28 w-full" /><div className="skeleton h-48 w-full" /></div>;
}

const lazyPage = (Page: React.LazyExoticComponent<React.ComponentType>) => <Suspense fallback={<PageFallback />}><Page /></Suspense>;
const router = createHashRouter([{
  path: '/',
  element: <Layout />,
  children: [
    { index: true, element: <Dashboard /> },
    { path: 'login', element: <Navigate to="/" replace /> },
    { path: 'add', element: lazyPage(AddMovement) },
    { path: 'settings/accounts', element: lazyPage(Accounts) },
    { path: 'advisor', element: lazyPage(Advisor) },
    { path: 'history', element: lazyPage(History) },
    { path: 'movements/:id', element: lazyPage(MovementDetail) },
    { path: 'settings/categories', element: lazyPage(Categories) },
    { path: 'budget', element: lazyPage(Budget) },
    { path: 'analysis', element: lazyPage(MonthlyAnalysis) },
    { path: 'comparisons', element: lazyPage(Comparisons) },
    { path: 'reports', element: lazyPage(Reports) },
    { path: 'settings', element: lazyPage(Settings) },
    { path: 'settings/updates', element: lazyPage(Updates) },
    { path: 'settings/backup', element: lazyPage(Backup) },
    { path: '*', element: <Navigate to="/" replace /> }
  ]
}]);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authTimedOut, setAuthTimedOut] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setAuthTimedOut(true), 10_000);
    const unsubscribe = watchAuth((nextUser) => {
      void perfMeasureAsync('session-restore', async () => {
        setUser(nextUser?.emailVerified ? nextUser : null);
        setAuthReady(true);
        window.clearTimeout(timer);
      });
    });
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [attempt]);

  if (!authReady) return (
    <main className="flex min-h-screen items-center justify-center bg-app px-5">
      <section className="w-full max-w-md space-y-4" aria-busy="true">
        <div className="skeleton h-16 w-full" />
        <div className="skeleton h-72 w-full" />
        {authTimedOut && <button onClick={() => { setAuthTimedOut(false); setAttempt((value) => value + 1); }} className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white">Reintentar acceso</button>}
      </section>
    </main>
  );
  if (!user) return <LoginScreen />;
  return <AccountProvider uid={user.uid}><RouterProvider router={router} /></AccountProvider>;
}

function LoginScreen() {
  useEffect(() => {
    if (window.location.hash !== '#/login') window.history.replaceState(null, '', '#/login');
  }, []);
  return <Login />;
}
