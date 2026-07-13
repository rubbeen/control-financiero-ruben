import { describe, expect, it } from 'vitest';
import { firebaseRetryDelay, isFirebaseAccessError, shouldRetryFirebaseQuery } from './firebaseErrorPolicy';

describe('politica de errores Firebase', () => {
  it('reintenta solo errores transitorios hasta tres veces', () => {
    expect(shouldRetryFirebaseQuery(0, { code: 'firestore/unavailable' })).toBe(true);
    expect(shouldRetryFirebaseQuery(2, { code: 'deadline-exceeded' })).toBe(true);
    expect(shouldRetryFirebaseQuery(3, { code: 'aborted' })).toBe(false);
  });
  it('no reintenta errores de acceso o validacion', () => {
    expect(shouldRetryFirebaseQuery(0, { code: 'permission-denied' })).toBe(false);
    expect(shouldRetryFirebaseQuery(0, { code: 'invalid-argument' })).toBe(false);
    expect(isFirebaseAccessError({ code: 'auth/unauthenticated' })).toBe(true);
  });
  it('aplica backoff limitado', () => {
    expect([0, 1, 2, 5].map(firebaseRetryDelay)).toEqual([500, 1000, 2000, 4000]);
  });
});
