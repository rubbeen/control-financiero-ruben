import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';

function configValue(value: string | undefined, fallback: string) {
  if (!value && !useEmulator) throw new Error('Falta configuracion publica de Firebase para compilar la aplicacion.');
  return value || fallback;
}

const firebaseConfig = {
  apiKey: configValue(import.meta.env.VITE_FIREBASE_API_KEY, 'demo-api-key'),
  authDomain: configValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, 'demo.local'),
  projectId: useEmulator ? 'demo-control-financiero-ruben' : configValue(import.meta.env.VITE_FIREBASE_PROJECT_ID, 'demo-control-financiero-ruben'),
  storageBucket: configValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, 'demo.local'),
  messagingSenderId: configValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, '000000000000'),
  appId: configValue(import.meta.env.VITE_FIREBASE_APP_ID, '1:000000000000:web:demo')
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);

if (useEmulator) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

export function nowISO(): string {
  return new Date().toISOString();
}
