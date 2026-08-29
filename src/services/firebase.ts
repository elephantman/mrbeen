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

// Environment variables configuration with fallback to stored local config
export const firebaseConfig: FirebaseConfigKeys = {
  apiKey: customConfig?.apiKey || env.VITE_FIREBASE_API_KEY || '',
  authDomain: customConfig?.authDomain || env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: customConfig?.projectId || env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: customConfig?.storageBucket || env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: customConfig?.messagingSenderId || env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: customConfig?.appId || env.VITE_FIREBASE_APP_ID || '',
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
