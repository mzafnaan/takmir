import { createAuthUser } from "@/services/firebase/auth";
import { getFirebaseDb } from "@/services/firebase/config";
import type { User } from "@/types";

const COLLECTION = "users";

/**
 * Wraps a promise with a timeout to prevent infinite hangs.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), ms),
    ),
  ]);
}

export async function getUsers(): Promise<User[]> {
  try {
    const { collection, getDocs, query } = await import("firebase/firestore");
    const db = await getFirebaseDb();
    const q = query(collection(db, COLLECTION));
    const snapshot = await withTimeout(getDocs(q), 8000);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as User);
  } catch (err: unknown) {
    console.error("Failed to fetch users from Firestore. Full Error:", err);
    if (err instanceof Error) {
      console.error(err.message, err.stack);
    }
    return [];
  }
}

/**
 * Creates a user in Firebase Auth + saves profile to Firestore.
 * Returns the newly created user data.
 */
export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<User> {
  const { addDoc, collection } = await import("firebase/firestore");
  const db = await getFirebaseDb();

  // 1. Create Firebase Auth user via secondary app
  const uid = await createAuthUser(data.email, data.password);

  // 2. Store user profile in Firestore
  const userData = {
    name: data.name,
    email: data.email,
    role: data.role,
    createdAt: new Date().toISOString().split("T")[0],
  };

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...userData,
    authUid: uid,
  });

  return { id: docRef.id, ...userData } as User;
}

export async function addUser(data: Omit<User, "id">): Promise<string> {
  const { addDoc, collection } = await import("firebase/firestore");
  const db = await getFirebaseDb();
  const docRef = await addDoc(collection(db, COLLECTION), data);
  return docRef.id;
}

export async function updateUser(
  id: string,
  data: Partial<User>,
): Promise<void> {
  const { doc, updateDoc } = await import("firebase/firestore");
  const db = await getFirebaseDb();
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteUser(id: string): Promise<void> {
  const { deleteDoc, doc } = await import("firebase/firestore");
  const db = await getFirebaseDb();
  await deleteDoc(doc(db, COLLECTION, id));
}
