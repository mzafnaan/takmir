"use client";

import PageHeader from "@/components/layout/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { ROLES, ROLE_LABELS } from "@/constants";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "@/features/users/usersService";
import { formatDate } from "@/lib/utils";
import type { User, UserFormData } from "@/types";
import React, { useCallback, useEffect, useState } from "react";
import { usePermission } from "@/hooks/usePermission";
import {
  HiOutlineLockClosed,
  HiOutlineMail,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineUserGroup,
  HiPlus,
} from "react-icons/hi";

const roleBadge = (role: string) => {
  const map: Record<string, "info" | "success" | "warning" | "neutral"> = {
    ketua: "info",
    sekretaris: "success",
    bendahara: "warning",
    pengurus: "neutral",
  };
  return (
    <Badge variant={map[role] || "neutral"}>{ROLE_LABELS[role] || role}</Badge>
  );
};

const emptyForm: UserFormData = {
  name: "",
  email: "",
  password: "",
  role: "pengurus",
};

export default function PengurusPage() {
  const [users, setUsers] = useState<User[]>([]);
  const { canEdit } = usePermission();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load users from Firestore
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Gagal memuat data pengurus. Periksa koneksi internet.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Auto-hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const openAdd = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setError("");
    setIsModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (editingUser) {
        // Update existing user in Firestore
        await updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role as User["role"],
        });
        setSuccess("Data pengurus berhasil diperbarui!");
      } else {
        // Create new user in Firebase Auth + Firestore
        if (!formData.password || formData.password.length < 6) {
          setError("Password minimal 6 karakter.");
          setSubmitting(false);
          return;
        }
        await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
        setSuccess("Pengurus baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      await loadUsers(); // Refresh list
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      switch (firebaseErr.code) {
        case "auth/email-already-in-use":
          setError("Email sudah digunakan oleh akun lain.");
          break;
        case "auth/invalid-email":
          setError("Format email tidak valid.");
          break;
        case "auth/weak-password":
          setError("Password terlalu lemah. Gunakan minimal 6 karakter.");
          break;
        default:
          setError(
            firebaseErr.message || "Terjadi kesalahan. Silakan coba lagi.",
          );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pengurus ini? Tindakan ini tidak dapat dibatalkan."))
      return;
    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
      setSuccess("Pengurus berhasil dihapus.");
    } catch (err) {
      console.error("Failed to delete:", err);
      setError("Gagal menghapus pengurus.");
    }
  };

  const update = (f: string, v: string) => setFormData({ ...formData, [f]: v });

  return (
    <>
      <PageHeader
        title="Pengurus"
        subtitle="Kelola data pengurus masjid"
        action={
          canEdit ? (
            <Button onClick={openAdd}>
              <HiPlus className="w-5 h-5" /> Tambah Pengurus
            </Button>
          ) : undefined
        }
      />

      {/* Success Toast */}
      {success && (
        <div className="mb-4 p-3.5 rounded-xl bg-green-50 border border-green-200 text-success text-sm font-medium flex items-center gap-2 animate-slideUp">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {success}
        </div>
      )}

      {/* Error Banner */}
      {error && !isModalOpen && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-danger text-sm font-medium">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-sm">Memuat data pengurus...</p>
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={<HiOutlineUserGroup className="w-8 h-8" />}
          title="Belum ada data pengurus"
          description="Tambah pengurus pertama untuk mulai mengelola tim masjid"
          action={
          canEdit ? (
              <Button onClick={openAdd}>
                <HiPlus className="w-5 h-5" /> Tambah Pengurus
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-card rounded-xl shadow-sm border border-border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {user.name.charAt(0)}
                  </span>
                </div>
                {canEdit && (
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(user)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-primary cursor-pointer transition-colors"
                  >
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-danger cursor-pointer transition-colors"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                {user.name}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
                <HiOutlineMail className="w-4 h-4" /> {user.email}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                {roleBadge(user.role)}
                <span className="text-xs text-text-secondary">
                  Sejak {formatDate(user.createdAt || new Date().toISOString())}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Edit Pengurus" : "Tambah Pengurus Baru"}
        subtitle={
          editingUser
            ? "Perbarui informasi pengurus"
            : "Isi data untuk menambahkan pengurus baru"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            icon={<HiOutlineUser className="w-4 h-4" />}
            value={formData.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="contoh@email.com"
            icon={<HiOutlineMail className="w-4 h-4" />}
            value={formData.email}
            onChange={(e) => update("email", e.target.value)}
            required
            disabled={!!editingUser}
          />
          {!editingUser && (
            <Input
              label="Password"
              type="password"
              placeholder="Minimal 6 karakter"
              icon={<HiOutlineLockClosed className="w-4 h-4" />}
              value={formData.password}
              onChange={(e) => update("password", e.target.value)}
              required
              minLength={6}
            />
          )}
          <Select
            label="Jabatan"
            value={formData.role}
            onChange={(e) => update("role", e.target.value)}
            options={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
            required
          />

          {/* Error inside modal */}
          {error && isModalOpen && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-danger text-xs">
              {error}
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <Button type="submit" fullWidth size="sm" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : editingUser ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Pengurus"
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
