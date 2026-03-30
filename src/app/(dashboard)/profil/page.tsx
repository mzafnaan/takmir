"use client";

import PageHeader from "@/components/layout/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/constants";
import { usePermission } from "@/hooks/usePermission";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import {
  HiOutlineMail,
  HiOutlineShieldCheck,
  HiOutlineCalendar,
  HiOutlineLogout,
  HiOutlineKey,
  HiOutlineLockClosed,
} from "react-icons/hi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { signOut } from "@/services/firebase/auth";

export default function ProfilPage() {
  const { userData, user } = useAuth();
  const { canEdit } = usePermission();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password baru tidak cocok.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password baru minimal 6 karakter.");
      return;
    }

    if (!user || !user.email) return;

    try {
      setIsChangingPassword(true);
      const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import("firebase/auth");
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      setPasswordSuccess("Password berhasil diubah.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      console.error(error);
      const err = error as { code?: string; message?: string };
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setPasswordError("Password lama salah.");
      } else {
        setPasswordError(err.message || "Terjadi kesalahan saat mengganti password.");
      }
    } finally {
      setIsChangingPassword(false);
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

        {/* Change Password Section */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineKey className="w-5 h-5 text-text-secondary" />
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Ganti Password
            </h3>
          </div>

          {passwordSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-success text-sm font-medium animate-slideUp">
              {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-danger text-sm font-medium">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Password Lama"
              type="password"
              placeholder="Masukkan password lama"
              icon={<HiOutlineLockClosed className="w-4 h-4" />}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <Input
                label="Password Baru"
                type="password"
                placeholder="Minimal 6 karakter"
                icon={<HiOutlineLockClosed className="w-4 h-4" />}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <Input
                label="Konfirmasi Baru"
                type="password"
                placeholder="Ulangi password baru"
                icon={<HiOutlineLockClosed className="w-4 h-4" />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <div className="pt-2">
              <Button type="submit" size="sm" disabled={isChangingPassword}>
                {isChangingPassword ? "Menyimpan..." : "Simpan Password"}
              </Button>
            </div>
          </form>
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
