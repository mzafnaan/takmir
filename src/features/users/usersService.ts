import { db } from "@/services/firebase/config";
import type { User } from "@/types";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

const COLLECTION = "users";

export async function getUsers(): Promise<User[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as User);
  } catch {
    console.log("Firebase not configured - returning demo data");
    return [];
  }
}

export async function addUser(data: Omit<User, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), data);
  return docRef.id;
}

export async function updateUser(
  id: string,
  data: Partial<User>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteUser(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
