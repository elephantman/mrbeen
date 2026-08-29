import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../services/firebase';
import { 
  saveUserTravelDataToCloud, 
  loadUserTravelDataFromCloud, 
  mergeLocalWithCloudData 
} from '../services/cloudSync';
import { useTravel } from './TravelContext';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error' | 'local';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  syncStatus: SyncStatus;
  isFirebaseReady: boolean;
  signInWithGoogle: () => Promise<boolean>;
  signOutUser: () => Promise<void>;
  forceCloudSave: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, loadUserData, triggerCelebration } = useTravel();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => 
    isFirebaseConfigured() ? 'local' : 'offline'
  );

  const isFirebaseReady = isFirebaseConfigured();

  // Listen to Firebase Auth State
  useEffect(() => {
    if (!auth || !isFirebaseReady) {
      setLoading(false);
      setSyncStatus('offline');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        setSyncStatus('syncing');
        try {
          // 1. Fetch existing cloud data for this user
          const cloudData = await loadUserTravelDataFromCloud(currentUser.uid);
          
          // 2. Merge local travel data with cloud data
          const mergedData = mergeLocalWithCloudData(data, cloudData);

          // 3. Update active TravelContext state
          loadUserData(mergedData);

          // 4. Save merged data back to Cloud Firestore
          await saveUserTravelDataToCloud(currentUser.uid, mergedData, {
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
          });

          setSyncStatus('synced');
        } catch (err) {
          console.error('Error syncing on login:', err);
          setSyncStatus('error');
        }
      } else {
        setSyncStatus('local');
      }
    });

    return () => unsubscribe();
  }, [isFirebaseReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-sync whenever data changes if user is logged in
  useEffect(() => {
    if (!user || !isFirebaseReady) return;

    const timeout = setTimeout(async () => {
      setSyncStatus('syncing');
      const success = await saveUserTravelDataToCloud(user.uid, data, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });
      setSyncStatus(success ? 'synced' : 'error');
    }, 1200); // debounce sync writes

    return () => clearTimeout(timeout);
  }, [data, user, isFirebaseReady]);

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    if (!auth || !isFirebaseReady) {
      alert('Firebase credentials not configured in environment yet. Please add VITE_FIREBASE_API_KEY to your .env file or Vercel settings.');
      return false;
    }

    try {
      setSyncStatus('syncing');
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        triggerCelebration();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      // If user closed the popup, don't show alert
      if (err?.code !== 'auth/popup-closed-by-user') {
        alert(`Sign in error: ${err.message || err}`);
      }
      setSyncStatus('error');
      return false;
    }
  }, [isFirebaseReady, triggerCelebration]);

  const signOutUser = useCallback(async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setUser(null);
      setSyncStatus('local');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }, []);

  const forceCloudSave = useCallback(async () => {
    if (!user || !isFirebaseReady) return;
    setSyncStatus('syncing');
    const success = await saveUserTravelDataToCloud(user.uid, data, {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    });
    setSyncStatus(success ? 'synced' : 'error');
  }, [user, data, isFirebaseReady]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        syncStatus,
        isFirebaseReady,
        signInWithGoogle,
        signOutUser,
        forceCloudSave,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
