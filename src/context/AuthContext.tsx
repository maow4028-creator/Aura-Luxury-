import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  saveUserToFirestore,
  getUserFromFirestore,
  FirebaseUser,
} from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  signUpWithFirebase: (email: string, password: string, fullName: string, phone?: string, fitnessGoals?: string) => Promise<User>;
  signInWithFirebase: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  resetPasswordWithFirebase: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('aura_auth_token'));
  const [loading, setLoading] = useState(true);

  // Sync with backend API to obtain a JWT token for backend routes
  const syncWithBackend = async (email: string, fullName: string, phone?: string): Promise<{ token: string; user: User }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'FirebaseAuthenticatedUser2026!' }),
      });

      if (res.ok) {
        const data = await res.json();
        return { token: data.token, user: data.user };
      }

      // If user doesn't exist in backend SQLite, auto-register them
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'FirebaseAuthenticatedUser2026!',
          full_name: fullName || email.split('@')[0],
          phone: phone || '',
        }),
      });

      if (regRes.ok) {
        const data = await regRes.json();
        return { token: data.token, user: data.user };
      }
    } catch (e) {
      console.warn('Backend sync warning:', e);
    }

    // Fallback user object
    const role: 'admin' | 'member' = email === 'admin@auragym.com' ? 'admin' : 'member';
    const fallbackUser: User = {
      id: Math.floor(Math.random() * 100000),
      email,
      full_name: fullName || email.split('@')[0],
      phone: phone || '',
      role,
    };
    return { token: 'firebase_session_token_' + Date.now(), user: fallbackUser };
  };

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('aura_auth_token');
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('aura_auth_token');
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error('Failed to authenticate token:', err);
    } finally {
      setLoading(false);
    }
  };

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Fetch or create profile in Firestore
        const firestoreData = await getUserFromFirestore(fbUser.uid);
        const fullName = fbUser.displayName || firestoreData?.full_name || fbUser.email?.split('@')[0] || 'Aura Member';
        const phone = fbUser.phoneNumber || firestoreData?.phone || '';

        // Save to Firestore if not already saved
        await saveUserToFirestore(fbUser.uid, {
          uid: fbUser.uid,
          email: fbUser.email || '',
          full_name: fullName,
          phone,
        });

        // Sync with backend API
        const { token: jwtToken, user: backendUser } = await syncWithBackend(fbUser.email || '', fullName, phone);
        localStorage.setItem('aura_auth_token', jwtToken);
        setToken(jwtToken);
        setUser({
          ...backendUser,
          full_name: fullName,
          email: fbUser.email || backendUser.email,
        });
        setLoading(false);
      } else {
        // Check if there is a manual demo token in localStorage
        const localToken = localStorage.getItem('aura_auth_token');
        if (localToken && !localToken.startsWith('firebase_')) {
          await refreshUser();
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('aura_auth_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Firebase signOut error:', e);
    }
    localStorage.removeItem('aura_auth_token');
    setToken(null);
    setUser(null);
    setFirebaseUser(null);
  };

  // Firebase Sign Up
  const signUpWithFirebase = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    fitnessGoals?: string
  ): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const fbUser = userCredential.user;

    // Update Firebase display name
    await updateProfile(fbUser, { displayName: fullName });

    // Save user profile to Firestore
    await saveUserToFirestore(fbUser.uid, {
      uid: fbUser.uid,
      email: email.trim(),
      full_name: fullName,
      phone: phone || '',
      fitness_goals: fitnessGoals || 'General Fitness',
      role: email.trim().toLowerCase() === 'admin@auragym.com' ? 'admin' : 'member',
    });

    // Sync with backend SQLite
    const { token: jwtToken, user: backendUser } = await syncWithBackend(email, fullName, phone);
    login(jwtToken, backendUser);
    return backendUser;
  };

  // Firebase Sign In
  const signInWithFirebase = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const fbUser = userCredential.user;

    const firestoreData = await getUserFromFirestore(fbUser.uid);
    const fullName = fbUser.displayName || firestoreData?.full_name || email.split('@')[0];
    const phone = fbUser.phoneNumber || firestoreData?.phone || '';

    const { token: jwtToken, user: backendUser } = await syncWithBackend(email, fullName, phone);
    login(jwtToken, backendUser);
    return backendUser;
  };

  // Firebase Google Sign In
  const signInWithGoogle = async (): Promise<User> => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const fbUser = userCredential.user;

    const fullName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Aura Member';
    const email = fbUser.email || '';
    const phone = fbUser.phoneNumber || '';

    await saveUserToFirestore(fbUser.uid, {
      uid: fbUser.uid,
      email,
      full_name: fullName,
      phone,
    });

    const { token: jwtToken, user: backendUser } = await syncWithBackend(email, fullName, phone);
    login(jwtToken, backendUser);
    return backendUser;
  };

  // Firebase Password Reset
  const resetPasswordWithFirebase = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        token,
        loading,
        login,
        logout,
        refreshUser,
        signUpWithFirebase,
        signInWithFirebase,
        signInWithGoogle,
        resetPasswordWithFirebase,
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
