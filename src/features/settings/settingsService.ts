import { getFirebaseDb } from "@/services/firebase/config";
import type { ProfilMasjid } from "@/types";

const DOC_ID = "profil";
const COLLECTION = "settings";

const DEFAULT_PROFIL: ProfilMasjid = {
  namaMasjid: "",
  alamat: "",
};

export async function getProfilMasjid(): Promise<ProfilMasjid> {
  try {
    const { doc, getDoc } = await import("firebase/firestore");
    const db = await getFirebaseDb();
    const snap = await getDoc(doc(db, COLLECTION, DOC_ID));
    if (snap.exists()) {
      return snap.data() as ProfilMasjid;
    }
    return DEFAULT_PROFIL;
  } catch {
    console.error("Failed to fetch profil masjid");
    return DEFAULT_PROFIL;
  }
}

export async function saveProfilMasjid(data: ProfilMasjid): Promise<void> {
  const { doc, setDoc } = await import("firebase/firestore");
  const db = await getFirebaseDb();
  await setDoc(doc(db, COLLECTION, DOC_ID), data, { merge: true });
}
