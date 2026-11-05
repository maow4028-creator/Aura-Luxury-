import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth & Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ==========================================
// FIRESTORE STORAGE HELPERS
// ==========================================

export interface FirestoreUserProfile {
  uid: string;
  email: string;
  full_name: string;
  phone?: string;
  fitness_goals?: string;
  role: 'member' | 'admin';
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Saves or updates user profile in Firestore 'users' collection
 */
export async function saveUserToFirestore(uid: string, data: Partial<FirestoreUserProfile>) {
  try {
    const userRef = doc(db, 'users', uid);
    const existing = await getDoc(userRef);

    if (!existing.exists()) {
      await setDoc(userRef, {
        uid,
        email: data.email || '',
        full_name: data.full_name || '',
        phone: data.phone || '',
        fitness_goals: data.fitness_goals || 'General Fitness',
        role: data.role || (data.email === 'admin@auragym.com' ? 'admin' : 'member'),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(
        userRef,
        {
          ...data,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('Firestore user save warning (will fallback to local session if permissions error):', err);
  }
}

/**
 * Fetches user profile from Firestore 'users' collection
 */
export async function getUserFromFirestore(uid: string): Promise<FirestoreUserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as FirestoreUserProfile;
    }
  } catch (err) {
    console.warn('Firestore user fetch warning:', err);
  }
  return null;
}

/**
 * Saves a new booking into Firestore 'bookings' collection
 */
export async function saveBookingToFirestore(bookingData: {
  booking_code: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  planId: number;
  planName: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  bookingStatus: string;
  notes?: string;
}) {
  try {
    const bookingsCol = collection(db, 'bookings');
    const docRef = await addDoc(bookingsCol, {
      ...bookingData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.warn('Firestore booking save warning:', err);
    return null;
  }
}

/**
 * Fetches all bookings for a user from Firestore
 */
export async function getUserBookingsFromFirestore(userId: string) {
  try {
    const bookingsCol = collection(db, 'bookings');
    const q = query(bookingsCol, where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Firestore get bookings warning:', err);
    return [];
  }
}

/**
 * Saves or updates membership record into Firestore 'memberships' collection
 */
export async function saveMembershipToFirestore(membershipData: {
  membership_code: string;
  userId: string;
  userName: string;
  userEmail: string;
  planId: number;
  planName: string;
  price: number;
  startDate: string;
  expiryDate: string;
  status: string;
  receiptNumber?: string;
}) {
  try {
    const memRef = doc(db, 'memberships', membershipData.membership_code);
    await setDoc(memRef, {
      ...membershipData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore membership save warning:', err);
  }
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
};
export type { FirebaseUser };
