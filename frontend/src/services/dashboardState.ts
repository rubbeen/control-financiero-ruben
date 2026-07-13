export type DashboardState = 'loading' | 'error' | 'ready';

export function resolveDashboardState(input: { accountLoading: boolean; accountError: boolean; hasActiveAccount: boolean; queryPending: boolean; queryFetching: boolean; queryError: boolean; hasData: boolean }): DashboardState {
  if (input.accountLoading || (!input.hasActiveAccount && !input.accountError)) return 'loading';
  if (!input.hasData && (input.queryPending || input.queryFetching)) return 'loading';
  if (input.accountError || (input.queryError && !input.hasData)) return 'error';
  return input.hasData ? 'ready' : 'loading';
}
