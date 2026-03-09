import { db } from "@/services/firebase/config";
import type { Pengumuman } from "@/types";
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

const COLLECTION = "pengumuman";

export async function getPengumuman(): Promise<Pengumuman[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Pengumuman,
    );
  } catch {
    console.log("Firebase not configured - returning demo data");
    return [];
  }
}

export async function getLatestPengumuman(
  limit: number = 5,
): Promise<Pengumuman[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .slice(0, limit)
      .map((doc) => ({ id: doc.id, ...doc.data() }) as Pengumuman);
  } catch {
    return [];
  }
}

export async function addPengumuman(
  data: Omit<Pengumuman, "id">,
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), data);
  return docRef.id;
}

export async function updatePengumuman(
  id: string,
  data: Partial<Pengumuman>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deletePengumuman(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
