import { describe, expect, it } from 'vitest';
import { resolveDashboardState } from './dashboardState';

const base = { accountLoading: false, accountError: false, hasActiveAccount: true, queryPending: false, queryFetching: false, queryError: false, hasData: false };

describe('estado asincrono del Dashboard', () => {
  it('no trata una query deshabilitada durante carga de cuenta como error', () => {
    expect(resolveDashboardState({ ...base, hasActiveAccount: false })).toBe('loading');
  });
  it('mantiene datos visibles durante refetch y fallo de actualizacion', () => {
    expect(resolveDashboardState({ ...base, hasData: true, queryFetching: true })).toBe('ready');
    expect(resolveDashboardState({ ...base, hasData: true, queryError: true })).toBe('ready');
  });
  it('muestra error solo al fallar sin datos', () => {
    expect(resolveDashboardState({ ...base, queryError: true })).toBe('error');
  });
});
