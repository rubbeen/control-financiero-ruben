import { FirebaseError } from 'firebase/app';
import { onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { auth } from './firebase';
import { clearInitializationState } from './firestoreHelpers';
import { queryClient } from './queryClient';

let pendingAuthNotice = '';

const friendlyErrors: Record<string, string> = {
  'auth/invalid-credential': 'El correo o la contrasena no coinciden.',
  'auth/too-many-requests': 'Hubo demasiados intentos. Espera unos minutos.',
  'auth/network-request-failed': 'No pudimos comunicarnos con el servicio. Revisa tu internet.',
  'auth/user-disabled': 'Esta cuenta fue deshabilitada.'
};

export function authErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) return friendlyErrors[error.code] || 'No fue posible completar el acceso seguro.';
  return error instanceof Error ? error.message : 'No fue posible completar el acceso seguro.';
}

export function watchAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function currentUser() {
  return auth.currentUser;
}

export async function loginWithEmail(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  try {
    const credential = await signInWithEmailAndPassword(auth, normalized, password);
    if (!credential.user.emailVerified) {
      await sendEmailVerification(credential.user);
      await signOut(auth);
      throw new Error('Debes verificar tu correo. Enviamos un enlace nuevo.');
    }
  } catch (error) {
    throw Object.assign(new Error(authErrorMessage(error)), { cause: error });
  }
}

export async function resetPassword(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) throw new Error('Ingresa el correo de la cuenta.');
  try {
    await sendPasswordResetEmail(auth, normalized);
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'auth/network-request-failed') {
      throw Object.assign(new Error(authErrorMessage(error)), { cause: error });
    }
  }
}

export function consumeAuthNotice() {
  const notice = pendingAuthNotice;
  pendingAuthNotice = '';
  return notice;
}

export async function handleFirestoreAccessError(error: unknown) {
  if (!(error instanceof FirebaseError) || error.code !== 'permission-denied') return false;
  pendingAuthNotice = 'No fue posible acceder a la informacion con esta cuenta.';
  await logout();
  return true;
}

export async function logout() {
  const uid = auth.currentUser?.uid;
  await queryClient.cancelQueries();
  queryClient.clear();
  clearInitializationState();
  if (uid) localStorage.removeItem(`control-financiero-active-account:${uid}`);
  await signOut(auth);
}
