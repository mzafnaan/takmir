"use client";

import { auth, db } from "@/services/firebase/config";

import type { User } from "@/types";
import { User as FirebaseUser, onAuthStateChanged, signOut } from "firebase/auth";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const q = query(
            collection(db, "users"),
            where("email", "==", firebaseUser.email)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            setUserData({ id: userDoc.id, ...userDoc.data() } as User);
            setUser(firebaseUser);
          } else {
            // Cek apakah database benar-benar kosong (kasus recovery / semua dihapus)
            const allUsersSnap = await getDocs(collection(db, "users"));
            if (allUsersSnap.empty) {
              console.log("Database kosong, melakukan otomatis registrasi akun pertama.");
              const newUser = {
                email: firebaseUser.email || "",
                name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Admin",
                role: "ketua",
                createdAt: new Date().toISOString(),
              };
              const docRef = await addDoc(collection(db, "users"), newUser);
              setUserData({ id: docRef.id, ...newUser } as User);
              setUser(firebaseUser);
            } else {
              console.warn("User log in but not found in Firestore (deleted). Signing out.");
              await signOut(auth);
              setUser(null);
              setUserData(null);
            }
          }
        } catch (err) {
          console.error("Error verifying user in Firestore:", err);
          // Network failure or offline fallback
          setUserData({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "Pengurus",
            email: firebaseUser.email || "",
            role: "pengurus",
            createdAt: new Date().toISOString(),
          });
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
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
