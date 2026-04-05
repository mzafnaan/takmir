import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { getFirebaseDb } = await import("@/services/firebase/config");
    const { collection, getDocs } = await import("firebase/firestore");
    const db = await getFirebaseDb();
    
    const usersSnap = await getDocs(collection(db, "users"));
    const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({ success: true, count: usersSnap.size, users });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message });
  }
}
