"use client";

import { useAuth } from "@/hooks/useAuth";
import { canEditPage } from "@/lib/permissions";
import { usePathname } from "next/navigation";

/**
 * Hook yang menyediakan informasi permission untuk halaman saat ini.
 * - `canEdit`: apakah user boleh melakukan CRUD di halaman ini
 * - `role`: role user saat ini
 */
export function usePermission() {
  const { userData } = useAuth();
  const pathname = usePathname();
  const role = userData?.role;

  return {
    canEdit: canEditPage(role, pathname),
    role,
  };
}
