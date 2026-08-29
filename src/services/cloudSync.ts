import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { UserTravelData } from '../types/travel';

export const saveUserTravelDataToCloud = async (
  uid: string,
  travelData: UserTravelData,
  userProfile?: { displayName?: string | null; email?: string | null; photoURL?: string | null }
): Promise<boolean> => {
  if (!db || !isFirebaseConfigured()) return false;

  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(
      userDocRef,
      {
        travelData,
        profile: {
          name: userProfile?.displayName || travelData.userName || '',
          email: userProfile?.email || '',
          photoURL: userProfile?.photoURL || '',
        },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Error saving to cloud Firestore:', err);
    return false;
  }
};

export const loadUserTravelDataFromCloud = async (
  uid: string
): Promise<UserTravelData | null> => {
  if (!db || !isFirebaseConfigured()) return null;

  try {
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const cloudData = docSnap.data();
      return (cloudData.travelData as UserTravelData) || null;
    }
    return null;
  } catch (err) {
    console.error('Error loading from cloud Firestore:', err);
    return null;
  }
};

/**
 * Intelligent merger between Local data (e.g. visited while anonymous) and Cloud data.
 * Merges visited countries, cities, wishlist, custom cities seamlessly.
 */
export const mergeLocalWithCloudData = (
  local: UserTravelData,
  cloud: UserTravelData | null
): UserTravelData => {
  if (!cloud) return local;

  const mergedVisitedCountries = {
    ...cloud.visitedCountries,
    ...local.visitedCountries,
  };

  const mergedVisitedCities = {
    ...cloud.visitedCities,
    ...local.visitedCities,
  };

  const mergedWishlistCountries = {
    ...cloud.wishlistCountries,
    ...local.wishlistCountries,
  };

  const mergedWishlistCities = {
    ...cloud.wishlistCities,
    ...local.wishlistCities,
  };

  // Merge custom cities avoiding duplicate IDs
  const customCitiesMap = new Map();
  (cloud.customCities || []).forEach((c) => customCitiesMap.set(c.id, c));
  (local.customCities || []).forEach((c) => customCitiesMap.set(c.id, c));
  const mergedCustomCities = Array.from(customCitiesMap.values());

  return {
    ...cloud,
    userName: local.userName || cloud.userName,
    tagline: local.tagline || cloud.tagline,
    activeThemeId: local.activeThemeId || cloud.activeThemeId,
    language: local.language || cloud.language,
    visitedCountries: mergedVisitedCountries,
    visitedCities: mergedVisitedCities,
    wishlistCountries: mergedWishlistCountries,
    wishlistCities: mergedWishlistCities,
    customCities: mergedCustomCities,
  };
};
