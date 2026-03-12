import { db } from "@/services/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({ success: true, count: usersSnap.size, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, code: error.code });
  }
}
