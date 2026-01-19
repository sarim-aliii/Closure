import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface UserContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  refreshProfile: () => void; // Helper to re-fetch profile manually
}

const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
     const docRef = doc(db, "users", uid);
     const snap = await getDoc(docRef);
     if (snap.exists()) setUser(snap.data() as UserProfile);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        fetchProfile(fUser.uid).finally(() => setLoading(false));
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  return (
    <UserContext.Provider value={{ user, firebaseUser, loading, refreshProfile: () => firebaseUser && fetchProfile(firebaseUser.uid) }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);