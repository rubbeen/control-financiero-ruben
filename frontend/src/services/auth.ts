import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { auth } from './firebase';

export const OWNER_EMAIL = 'ribenp7@gmail.com';

export function watchAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function currentUser() {
  return auth.currentUser;
}

export async function loginWithEmail(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  if (normalized !== OWNER_EMAIL) {
    throw new Error('Solo la cuenta autorizada puede usar esta app.');
  }
  await signInWithEmailAndPassword(auth, normalized, password);
}

export async function resetOwnerPassword() {
  await sendPasswordResetEmail(auth, OWNER_EMAIL);
}

export async function logout() {
  await signOut(auth);
}
