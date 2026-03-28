"use client";

import PageHeader from "@/components/layout/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/constants";
import { usePermission } from "@/hooks/usePermission";
import { formatDate } from "@/lib/utils";
import {
  HiOutlineMail,
  HiOutlineShieldCheck,
  HiOutlineCalendar,
  HiOutlineLogout,
} from "react-icons/hi";
import { signOut } from "@/services/firebase/auth";

export default function ProfilPage() {
  const { userData } = useAuth();
  const { canEdit } = usePermission();

  if (!userData) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  const roleBadgeColor: Record<string, string> = {
    ketua: "bg-blue-100 text-blue-700",
    sekretaris: "bg-emerald-100 text-emerald-700",
    bendahara: "bg-amber-100 text-amber-700",
    pengurus: "bg-gray-100 text-gray-600",
  };

  const roleDescription: Record<string, string> = {
    ketua: "Akses penuh ke seluruh fitur dan pengelolaan",
    sekretaris: "Mengelola pengumuman dan agenda kegiatan",
    bendahara: "Mengelola keuangan dan pencatatan kas",
    pengurus: "Mengelola inventaris dan aset masjid",
  };

  return (
    <>
      <PageHeader title="Profil Saya" />

      <div className="max-w-xl mx-auto space-y-5">
        {/* Profile Card — Avatar + Identity */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="bg-gradient-to-br from-primary via-primary to-primary-dark px-6 pt-8 pb-14 relative">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-8 w-32 h-32 rounded-full border-2 border-white/40" />
              <div className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full border-2 border-white/30" />
            </div>
          </div>

          <div className="px-6 pb-6 -mt-10 relative">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-primary">
                {userData.name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Name + Role */}
            <h2 className="text-xl font-bold text-text-primary">
              {userData.name}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${roleBadgeColor[userData.role] || "bg-gray-100 text-gray-600"}`}>
                {ROLE_LABELS[userData.role] || userData.role}
              </span>
            </div>
            <p className="text-sm text-text-secondary mt-2">
              {roleDescription[userData.role] || "Anggota pengurus masjid"}
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-5">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Informasi Akun
          </h3>

          <div className="space-y-1">
            {/* Email */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <HiOutlineMail className="w-[18px] h-[18px] text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-text-secondary">Email</p>
                <p className="text-sm font-medium text-text-primary truncate">{userData.email}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-b border-border/60 mx-3" />

            {/* Jabatan */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <HiOutlineShieldCheck className="w-[18px] h-[18px] text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-text-secondary">Jabatan</p>
                <p className="text-sm font-medium text-text-primary">
                  {ROLE_LABELS[userData.role] || userData.role}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-b border-border/60 mx-3" />

            {/* Bergabung Sejak */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <HiOutlineCalendar className="w-[18px] h-[18px] text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-text-secondary">Bergabung Sejak</p>
                <p className="text-sm font-medium text-text-primary">
                  {formatDate(userData.createdAt || new Date().toISOString())}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Access Info */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-5">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Hak Akses
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Keuangan", allowed: canEdit || userData.role === "bendahara" || userData.role === "ketua" },
              { label: "Pengumuman", allowed: userData.role === "sekretaris" || userData.role === "ketua" },
              { label: "Agenda", allowed: userData.role === "sekretaris" || userData.role === "ketua" },
              { label: "Inventaris", allowed: userData.role === "pengurus" || userData.role === "ketua" },
              { label: "Pengurus", allowed: userData.role === "ketua" },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  item.allowed
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-50 text-gray-400"
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.allowed ? "bg-emerald-500" : "bg-gray-300"}`} />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button — mobile friendly */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl
            bg-card border border-border shadow-sm text-danger font-medium
            hover:bg-red-50 hover:border-red-200 transition-all duration-200 cursor-pointer"
        >
          <HiOutlineLogout className="w-5 h-5" />
          Keluar dari Akun
        </button>
      </div>
    </>
  );
}
