import { db } from "@/services/firebase/config";
import type { AktivitasInventaris, Inventaris } from "@/types";
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

const COLLECTION = "inventaris";
const ACTIVITY_COLLECTION = "aktivitas_inventaris";

export async function getInventaris(): Promise<Inventaris[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy("namaBarang", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Inventaris,
    );
  } catch {
    console.log("Firebase not configured - returning demo data");
    return [];
  }
}

export async function addInventaris(
  data: Omit<Inventaris, "id">,
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), data);
  return docRef.id;
}

export async function updateInventaris(
  id: string,
  data: Partial<Inventaris>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteInventaris(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getAktivitasInventaris(): Promise<AktivitasInventaris[]> {
  try {
    const q = query(
      collection(db, ACTIVITY_COLLECTION),
      orderBy("tanggal", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as AktivitasInventaris,
    );
  } catch {
    return [];
  }
}

export async function addAktivitasInventaris(
  data: Omit<AktivitasInventaris, "id">,
): Promise<string> {
  const docRef = await addDoc(collection(db, ACTIVITY_COLLECTION), data);
  return docRef.id;
}
