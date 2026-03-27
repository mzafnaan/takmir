import type { User } from "@/types";

type Role = User["role"];

/**
 * Mapping: page path prefix → roles yang boleh edit (CRUD) di halaman tersebut.
 * Jika halaman tidak terdaftar, hanya ketua yang bisa edit.
 */
const EDIT_PERMISSIONS: Record<string, readonly Role[]> = {
  "/keuangan": ["ketua", "bendahara"],
  "/pengumuman": ["ketua", "sekretaris"],
  "/agenda": ["ketua", "sekretaris"],
  "/inventaris": ["ketua", "pengurus"],
  "/pengurus": ["ketua"],
  "/dashboard": [], // dashboard = read-only untuk semua
};

/**
 * Cek apakah role tertentu boleh melakukan CRUD di halaman yang diberikan.
 */
export function canEditPage(role: Role | undefined, path: string): boolean {
  if (!role) return false;
  if (role === "ketua") return true; // ketua bisa edit di mana saja

  const entry = Object.entries(EDIT_PERMISSIONS).find(([prefix]) =>
    path.startsWith(prefix),
  );

  if (!entry) return false;
  return (entry[1] as readonly string[]).includes(role);
}
