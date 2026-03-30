import { getFirebaseDb } from "@/services/firebase/config";
import type { Transaksi } from "@/types";

const COLLECTION = "transaksi";

export async function getTransaksi(): Promise<Transaksi[]> {
  try {
    const { collection, getDocs, orderBy, query } = await import("firebase/firestore");
    const db = await getFirebaseDb();
    const q = query(collection(db, COLLECTION), orderBy("tanggal", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Transaksi,
    );
  } catch {
    console.log("Firebase not configured - returning demo data");
    return [];
  }
}

export function calculateSaldo(transaksi: Transaksi[]): {
  saldo: number;
  totalPemasukan: number;
  totalPengeluaran: number;
} {
  let totalPemasukan = 0;
  let totalPengeluaran = 0;

  transaksi.forEach((t) => {
    if (t.jenis === "pemasukan") {
      totalPemasukan += t.nominal;
    } else {
      totalPengeluaran += t.nominal;
    }
  });

  return {
    saldo: totalPemasukan - totalPengeluaran,
    totalPemasukan,
    totalPengeluaran,
  };
}

export async function addTransaksi(
  data: Omit<Transaksi, "id">,
): Promise<string> {
  const { addDoc, collection } = await import("firebase/firestore");
  const db = await getFirebaseDb();
  const docRef = await addDoc(collection(db, COLLECTION), data);
  return docRef.id;
}

export async function updateTransaksi(
  id: string,
  data: Partial<Transaksi>,
): Promise<void> {
  const { doc, updateDoc } = await import("firebase/firestore");
  const db = await getFirebaseDb();
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteTransaksi(id: string): Promise<void> {
  const { deleteDoc, doc } = await import("firebase/firestore");
  const db = await getFirebaseDb();
  await deleteDoc(doc(db, COLLECTION, id));
}
