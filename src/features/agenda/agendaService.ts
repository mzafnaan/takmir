import { getFirebaseDb } from "@/services/firebase/config";
import type { Agenda } from "@/types";

const COLLECTION = "agenda";

export async function getAgendas(): Promise<Agenda[]> {
  try {
    const { collection, getDocs, orderBy, query } = await import("firebase/firestore");
    const db = await getFirebaseDb();
    const q = query(collection(db, COLLECTION), orderBy("tanggal", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Agenda,
    );
  } catch {
    console.log("Firebase not configured - returning demo data");
    return [];
  }
}

export async function getUpcomingAgendas(limit: number = 5): Promise<Agenda[]> {
  try {
    const { collection, getDocs, orderBy, query, where } = await import("firebase/firestore");
    const db = await getFirebaseDb();
    const today = new Date().toISOString().split("T")[0];
    const q = query(
      collection(db, COLLECTION),
      where("tanggal", ">=", today),
      orderBy("tanggal", "asc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .slice(0, limit)
      .map((doc) => ({ id: doc.id, ...doc.data() }) as Agenda);
  } catch {
    return [];
  }
}

export async function addAgenda(data: Omit<Agenda, "id">): Promise<string> {
  const { addDoc, collection } = await import("firebase/firestore");
  const db = await getFirebaseDb();
  const docRef = await addDoc(collection(db, COLLECTION), data);
  return docRef.id;
}

export async function updateAgenda(
  id: string,
  data: Partial<Agenda>,
): Promise<void> {
  const { doc, updateDoc } = await import("firebase/firestore");
  const db = await getFirebaseDb();
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteAgenda(id: string): Promise<void> {
  const { deleteDoc, doc } = await import("firebase/firestore");
  const db = await getFirebaseDb();
  await deleteDoc(doc(db, COLLECTION, id));
}
