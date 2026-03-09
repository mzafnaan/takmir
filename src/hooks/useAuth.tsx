"use client";

import { auth, db } from "@/services/firebase/config";
import type { User } from "@/types";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Set loading false immediately so the page renders fast
        setLoading(false);

        // Set basic user data from Firebase Auth (instant, no Firestore needed)
        setUserData({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "Pengurus",
          email: firebaseUser.email || "",
          role: "pengurus",
          createdAt: new Date().toISOString(),
        });

        // Then try to fetch full user data from Firestore (non-blocking)
        getDoc(doc(db, "users", firebaseUser.uid))
          .then((userDoc) => {
            if (userDoc.exists()) {
              setUserData({ id: userDoc.id, ...userDoc.data() } as User);
            }
          })
          .catch(() => {
            console.log("Firestore user doc not found - using auth data");
          });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
