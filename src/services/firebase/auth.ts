import { getFirebaseAuth } from "./config";

export async function signIn(email: string, password: string) {
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  const auth = await getFirebaseAuth();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  const { signOut: firebaseSignOut } = await import("firebase/auth");
  const auth = await getFirebaseAuth();
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
  const { initializeApp, deleteApp } = await import("firebase/app");
  const { createUserWithEmailAndPassword, getAuth } = await import("firebase/auth");

  const auth = await getFirebaseAuth();
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
    await deleteApp(secondaryApp);
  }
}
