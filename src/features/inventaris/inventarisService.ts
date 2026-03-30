import { getFirebaseDb } from "@/services/firebase/config";
import type { AktivitasInventaris, Inventaris } from "@/types";

const COLLECTION = "inventaris";
const ACTIVITY_COLLECTION = "aktivitas_inventaris";

export async function getInventaris(): Promise<Inventaris[]> {
  try {
    const { collection, getDocs, orderBy, query } = await import("firebase/firestore");
    const db = await getFirebaseDb();
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
  const { addDoc, collection } = await import("firebase/firestore");
  const db = await getFirebaseDb();
  const docRef = await addDoc(collection(db, COLLECTION), data);
  return docRef.id;
}

export async function updateInventaris(
  id: string,
  data: Partial<Inventaris>,
): Promise<void> {
  const { doc, updateDoc } = await import("firebase/firestore");
  const db = await getFirebaseDb();
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteInventaris(id: string): Promise<void> {
  const { deleteDoc, doc } = await import("firebase/firestore");
  const db = await getFirebaseDb();
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getAktivitasInventaris(): Promise<AktivitasInventaris[]> {
  try {
    const { collection, getDocs, orderBy, query } = await import("firebase/firestore");
    const db = await getFirebaseDb();
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
  const { addDoc, collection } = await import("firebase/firestore");
  const db = await getFirebaseDb();
  const docRef = await addDoc(collection(db, ACTIVITY_COLLECTION), data);
  return docRef.id;
}
