import { deleteApp, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./config";

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  return firebaseSignOut(auth);
}

/**
 * Creates a new Firebase Auth user using a secondary app instance
 * so the current admin's session is not affected.
 */
export async function createAuthUser(
  email: string,
  password: string,
): Promise<string> {
  // Create a secondary Firebase app to avoid signing out the current user
  const secondaryApp = initializeApp(auth.app.options, "SecondaryApp");
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password,
    );
    return credential.user.uid;
  } finally {
    // Always clean up the secondary app
    await deleteApp(secondaryApp);
  }
}
