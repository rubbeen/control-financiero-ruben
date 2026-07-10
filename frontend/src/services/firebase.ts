import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';

const firebaseConfig = {
  apiKey: 'AIzaSyACwxXIEhQKc38szsO2oPN00ndVAnTmf9E',
  authDomain: 'control-financiero-ruben.firebaseapp.com',
  projectId: useEmulator ? 'demo-control-financiero-ruben' : 'control-financiero-ruben',
  storageBucket: 'control-financiero-ruben.firebasestorage.app',
  messagingSenderId: '459907047052',
  appId: '1:459907047052:web:2ff9cc80ea035ab9f965a9'
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
