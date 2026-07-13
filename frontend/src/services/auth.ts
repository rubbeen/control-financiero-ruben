import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { auth } from './firebase';
import { clearInitializationState } from './firestoreHelpers';
import { queryClient } from './queryClient';

let pendingAuthNotice = '';

const friendlyErrors: Record<string, string> = {
  'auth/email-already-in-use': 'Ya existe una cuenta con este correo.',
  'auth/invalid-email': 'Ingresa un correo valido.',
  'auth/invalid-credential': 'El correo o la contrasena no coinciden.',
  'auth/operation-not-allowed': 'La creacion de cuentas no esta disponible temporalmente.',
  'auth/too-many-requests': 'Hubo demasiados intentos. Espera unos minutos.',
  'auth/network-request-failed': 'No pudimos comunicarnos con el servicio. Revisa tu internet.',
  'auth/user-disabled': 'Esta cuenta fue deshabilitada.',
  'auth/weak-password': 'La contrasena debe tener al menos 8 caracteres.'
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

export async function registerWithEmail(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) throw new Error('Ingresa un correo valido.');
  if (password.length < 8) throw new Error('La contrasena debe tener al menos 8 caracteres.');
  if (password.length > 128) throw new Error('La contrasena no puede superar 128 caracteres.');

  try {
    const credential = await createUserWithEmailAndPassword(auth, normalized, password);
    try {
      await sendEmailVerification(credential.user);
    } finally {
      await signOut(auth);
    }
    return normalized;
  } catch (error) {
    try {
      if (auth.currentUser && !auth.currentUser.emailVerified) await signOut(auth);
    } catch {
      // El cierre de una sesion incompleta no debe ocultar el error de registro.
    }
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
