"use client";

import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/constants";
import { signOut } from "@/services/firebase/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { HiOutlineLogout, HiOutlineUser } from "react-icons/hi";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  const { userData } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initial = userData?.name?.charAt(0)?.toUpperCase() || "?";
  const isProfilePage = pathname === "/profil";

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <div className="mb-6 space-y-3">
      {/* Top row: always horizontal — title left, avatar right */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
          {subtitle && (
            <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Action button (hidden on mobile, shown below) */}
          <div className="hidden sm:block">{action}</div>

          {/* Profile Avatar */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-base font-bold
                transition-all duration-200 cursor-pointer select-none
                ${isProfilePage
                  ? "bg-primary text-white ring-2 ring-primary/30"
                  : "bg-primary/10 text-primary hover:bg-primary/20 hover:ring-2 hover:ring-primary/20"
                }
              `}
              title={userData?.name || "Profil"}
            >
              {initial}
            </button>

            {/* Dropdown */}
            {isOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-border z-50 animate-dropdownOpen overflow-hidden">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-bold text-text-primary truncate">
                    {userData?.name || "Pengguna"}
                  </p>
                  <p className="text-xs text-text-secondary truncate">
                    {userData?.email}
                  </p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                    {ROLE_LABELS[userData?.role || ""] || userData?.role}
                  </span>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    href="/profil"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-gray-50 transition-colors"
                  >
                    <HiOutlineUser className="w-4 h-4 text-text-secondary" />
                    Lihat Profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors w-full cursor-pointer"
                  >
                    <HiOutlineLogout className="w-4 h-4" />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: action button below title */}
      {action && <div className="sm:hidden">{action}</div>}
    </div>
  );
}
