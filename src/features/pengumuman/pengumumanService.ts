import { getFirebaseDb } from "@/services/firebase/config";
import type { Pengumuman } from "@/types";

const COLLECTION = "pengumuman";

export async function getPengumuman(): Promise<Pengumuman[]> {
  try {
    const { collection, getDocs, orderBy, query } = await import("firebase/firestore");
    const db = await getFirebaseDb();
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
    const { collection, getDocs, orderBy, query } = await import("firebase/firestore");
    const db = await getFirebaseDb();
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
  const { addDoc, collection } = await import("firebase/firestore");
  const db = await getFirebaseDb();
  const docRef = await addDoc(collection(db, COLLECTION), data);
  return docRef.id;
}

export async function updatePengumuman(
  id: string,
  data: Partial<Pengumuman>,
): Promise<void> {
  const { doc, updateDoc } = await import("firebase/firestore");
  const db = await getFirebaseDb();
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deletePengumuman(id: string): Promise<void> {
  const { deleteDoc, doc } = await import("firebase/firestore");
  const db = await getFirebaseDb();
  await deleteDoc(doc(db, COLLECTION, id));
}
