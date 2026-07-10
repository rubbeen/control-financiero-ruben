import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      gcTime: 15 * 60 * 1000
    },
    mutations: { retry: 0 }
  }
});

export const queryKeys = {
  accounts: (uid: string) => ['accounts', uid] as const,
  categories: (uid: string) => ['categories', uid] as const,
  movement: (uid: string, movementId: number) => ['movement', uid, movementId] as const,
  movements: (uid: string, accountId: number, filters: object) => ['movements', uid, accountId, filters] as const,
  latestMovements: (uid: string, accountId: number) => ['latestMovements', uid, accountId] as const,
  financialAnalysis: (uid: string, accountId: number, period: string, trendMonths: number) => ['financialAnalysis', uid, accountId, period, trendMonths] as const,
  budget: (uid: string, accountId: number, year: number, month: number) => ['budget', uid, accountId, year, month] as const
};
