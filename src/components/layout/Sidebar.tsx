"use client";

import { MENU_ITEMS } from "@/constants";
import { signOut } from "@/services/firebase/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineLogout } from "react-icons/hi";

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-border h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">🕌</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">
              Takmir Manage
            </h1>
            <p className="text-xs text-text-secondary">Manajemen Masjid</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium
                transition-all duration-200
                ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary hover:bg-gray-100 hover:text-text-primary"
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium
            text-text-secondary hover:bg-red-50 hover:text-danger transition-all duration-200 w-full cursor-pointer"
        >
          <HiOutlineLogout className="w-5 h-5" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
