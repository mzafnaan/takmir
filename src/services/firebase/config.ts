import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Prevent multiple Firebase instances
function getFirebaseApp(): FirebaseApp {
  return !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

// Lazy-loaded Auth instance (firebase/auth is ~100KB)
let _auth: import("firebase/auth").Auth | null = null;
export async function getFirebaseAuth() {
  if (!_auth) {
    const { getAuth } = await import("firebase/auth");
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

// Lazy-loaded Firestore instance (firebase/firestore is ~250KB)
let _db: import("firebase/firestore").Firestore | null = null;
export async function getFirebaseDb() {
  if (!_db) {
    const { getFirestore } = await import("firebase/firestore");
    _db = getFirestore(getFirebaseApp());
  }
  return _db;
}

// Synchronous getters for cases where init is already done (e.g. auth listener)
export function getAuthSync() {
  if (!_auth) throw new Error("Auth not initialized. Call getFirebaseAuth() first.");
  return _auth;
}
export function getDbSync() {
  if (!_db) throw new Error("Firestore not initialized. Call getFirebaseDb() first.");
  return _db;
}
