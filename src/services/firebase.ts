/// <reference types="vite/client" />
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const env = (import.meta as any).env || {};

export interface FirebaseConfigKeys {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const getStoredFirebaseConfig = (): FirebaseConfigKeys | null => {
  try {
    const raw = localStorage.getItem('been_custom_firebase_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
};

export const saveCustomFirebaseConfig = (config: FirebaseConfigKeys) => {
  localStorage.setItem('been_custom_firebase_config', JSON.stringify(config));
  window.location.reload();
};

export const clearCustomFirebaseConfig = () => {
  localStorage.removeItem('been_custom_firebase_config');
  window.location.reload();
};

const customConfig = getStoredFirebaseConfig();

// Default production configuration for mrbeen project
const DEFAULT_FIREBASE_CONFIG: FirebaseConfigKeys = {
  apiKey: 'AIzaSyAkslDo8gbsPEcBmo-5PBxs0Go0SiWlbBI',
  authDomain: 'mrbeen-bc535.firebaseapp.com',
  projectId: 'mrbeen-bc535',
  storageBucket: 'mrbeen-bc535.firebasestorage.app',
  messagingSenderId: '515930564465',
  appId: '1:515930564465:web:874bc7c1163fe4f424b8d0',
};

// Environment variables configuration with fallback to default and stored local config
export const firebaseConfig: FirebaseConfigKeys = {
  apiKey: env.VITE_FIREBASE_API_KEY || customConfig?.apiKey || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || customConfig?.authDomain || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || customConfig?.projectId || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || customConfig?.storageBucket || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || customConfig?.messagingSenderId || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || customConfig?.appId || DEFAULT_FIREBASE_CONFIG.appId,
};

// Check if valid Firebase configuration is provided
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY'
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn('Firebase initialization notice:', err);
  }
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { app, auth, db };
