import { useQuery } from '@tanstack/react-query';
import { useAccount } from '../context/AccountContext';
import { analyticsService } from '../services/analytics';
import { currentUser } from '../services/auth';
import { categoriesService } from '../services/categories';
import { budgetsService } from '../services/budgets';
import { queryClient, queryKeys } from '../services/queryClient';
import { currentYearMonth } from '../utils/dates';

export function useUid() {
  const uid = currentUser()?.uid;
  if (!uid) throw new Error('Sesion no disponible.');
  return uid;
}

export function useCategories(includeInactive = true) {
  const uid = useUid();
  return useQuery({
    queryKey: queryKeys.categories(uid),
    queryFn: () => categoriesService.list(true, uid),
    staleTime: 24 * 60 * 60 * 1000,
    select: (categories) => includeInactive ? categories : categories.filter((item) => item.active)
  });
}

export function useFinancialAnalysis(year: number, month: number, trendMonths = 6) {
  const uid = useUid();
  const { activeAccountId, activeAccount } = useAccount();
  const current = currentYearMonth();
  const historical = year !== current.year || month !== current.month;
  const period = `${year}-${String(month).padStart(2, '0')}`;
  return useQuery({
    queryKey: queryKeys.financialAnalysis(uid, activeAccountId, period, trendMonths),
    queryFn: async () => {
      const [categories, budget] = await Promise.all([
        queryClient.ensureQueryData({ queryKey: queryKeys.categories(uid), queryFn: () => categoriesService.list(true, uid), staleTime: 24 * 60 * 60 * 1000 }),
        queryClient.ensureQueryData({ queryKey: queryKeys.budget(uid, activeAccountId, year, month), queryFn: () => budgetsService.get(activeAccountId, year, month, uid), staleTime: historical ? 5 * 60 * 1000 : 30_000 })
      ]);
      return analyticsService.load(uid, activeAccountId, year, month, trendMonths, categories, budget, activeAccount?.current_balance || 0);
    },
    staleTime: historical ? 5 * 60 * 1000 : 30 * 1000,
    placeholderData: (previous) => previous,
    enabled: activeAccount !== null,
    select: (analysis) => ({ ...analysis, currentBalance: activeAccount?.current_balance ?? analysis.currentBalance })
  });
}
