import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyACwxXIEhQKc38szsO2oPN00ndVAnTmf9E',
  authDomain: 'control-financiero-ruben.firebaseapp.com',
  projectId: 'control-financiero-ruben',
  storageBucket: 'control-financiero-ruben.firebasestorage.app',
  messagingSenderId: '459907047052',
  appId: '1:459907047052:web:2ff9cc80ea035ab9f965a9'
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);

export function nowISO(): string {
  return new Date().toISOString();
}
