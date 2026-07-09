import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import Layout from './components/Layout';
import AddMovement from './pages/AddMovement';
import Advisor from './pages/Advisor';
import Backup from './pages/Backup';
import Accounts from './pages/Accounts';
import Budget from './pages/Budget';
import Categories from './pages/Categories';
import Comparisons from './pages/Comparisons';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import MonthlyAnalysis from './pages/MonthlyAnalysis';
import MovementDetail from './pages/MovementDetail';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Updates from './pages/Updates';
import Login from './pages/Login';
import { watchAuth } from './services/auth';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [selectedMovement, setSelectedMovement] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    return watchAuth((nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
  }, []);

  if (!authReady) {
    return <main className="flex min-h-screen items-center justify-center bg-app px-6 text-center text-muted">Verificando acceso seguro...</main>;
  }

  if (!user) {
    return <Login />;
  }

  function openMovement(id: number) {
    setSelectedMovement(id);
    setPage('movement');
  }

  const content = (() => {
    if (page === 'add') return <AddMovement setPage={setPage} />;
    if (page === 'accounts') return <Accounts />;
    if (page === 'advisor') return <Advisor />;
    if (page === 'history') return <History setPage={setPage} openMovement={openMovement} />;
    if (page === 'movement' && selectedMovement) return <MovementDetail id={selectedMovement} setPage={setPage} />;
    if (page === 'categories') return <Categories />;
    if (page === 'budget') return <Budget />;
    if (page === 'analysis') return <MonthlyAnalysis />;
    if (page === 'comparisons') return <Comparisons />;
    if (page === 'reports') return <Reports />;
    if (page === 'settings') return <Settings setPage={setPage} />;
    if (page === 'updates') return <Updates />;
    if (page === 'backup') return <Backup />;
    return <Dashboard setPage={setPage} openMovement={openMovement} />;
  })();

  return <Layout page={page} setPage={setPage} user={user}>{content}</Layout>;
}
