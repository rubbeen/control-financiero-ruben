const RETRYABLE_CODES = new Set([
  'aborted',
  'deadline-exceeded',
  'resource-exhausted',
  'unavailable'
]);

const PERMANENT_CODES = new Set([
  'invalid-argument',
  'permission-denied',
  'unauthenticated'
]);

export function firebaseErrorCode(error: unknown): string {
  if (!error || typeof error !== 'object' || !('code' in error)) return '';
  return String((error as { code?: unknown }).code || '').replace(/^firestore\//, '').replace(/^auth\//, '');
}

export function isFirebaseAccessError(error: unknown): boolean {
  const code = firebaseErrorCode(error);
  return code === 'permission-denied' || code === 'unauthenticated';
}

export function isRetryableFirebaseError(error: unknown): boolean {
  const code = firebaseErrorCode(error);
  if (PERMANENT_CODES.has(code)) return false;
  if (RETRYABLE_CODES.has(code)) return true;
  if (error instanceof TypeError && /fetch|network|offline|connection/i.test(error.message)) return true;
  return false;
}

export function shouldRetryFirebaseQuery(failureCount: number, error: unknown): boolean {
  return failureCount < 3 && isRetryableFirebaseError(error);
}

export function firebaseRetryDelay(attemptIndex: number): number {
  return Math.min(500 * (2 ** attemptIndex), 4_000);
}
