import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

interface UserContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  refreshProfile: () => void; 
}

const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = () => {
    console.log("Profile refresh requested (handled by real-time listener)");
  };

  useEffect(() => {
    let unsubscribeProfile = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (fUser) => {
      setFirebaseUser(fUser);
      
      if (fUser) {
        // Switching to onSnapshot prevents "offline" errors by using cache
        unsubscribeProfile = onSnapshot(
          doc(db, "users", fUser.uid), 
          (docSnap) => {
            if (docSnap.exists()) {
              setUser(docSnap.data() as UserProfile);
            } else {
              console.warn("User authenticated but profile not found in Firestore.");
              setUser(null);
            }
            setLoading(false);
          },
          (error) => {
            console.error("Firestore Listen Error:", error);
            setLoading(false);
          }
        );
      } else {
        // User logged out
        setUser(null);
        unsubscribeProfile();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, firebaseUser, loading, refreshProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);