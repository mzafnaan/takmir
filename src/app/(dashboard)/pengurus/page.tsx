"use client";

import PageHeader from "@/components/layout/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { ROLES, ROLE_LABELS } from "@/constants";
import { formatDate } from "@/lib/utils";
import type { User } from "@/types";
import React, { useState } from "react";
import {
  HiOutlineMail,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUserGroup,
  HiPlus,
} from "react-icons/hi";

const demoUsers: User[] = [
  {
    id: "1",
    name: "H. Ahmad Fauzi",
    email: "ahmad.fauzi@email.com",
    role: "ketua",
    createdAt: "2025-01-01",
  },
  {
    id: "2",
    name: "Budi Santoso",
    email: "budi.s@email.com",
    role: "sekretaris",
    createdAt: "2025-01-01",
  },
  {
    id: "3",
    name: "Hasan Basri",
    email: "hasan.b@email.com",
    role: "bendahara",
    createdAt: "2025-01-01",
  },
  {
    id: "4",
    name: "Umar Faruq",
    email: "umar.f@email.com",
    role: "pengurus",
    createdAt: "2025-02-15",
  },
  {
    id: "5",
    name: "Rizki Ramadhan",
    email: "rizki.r@email.com",
    role: "pengurus",
    createdAt: "2025-03-01",
  },
];

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

type UserForm = Omit<User, "id">;

const emptyForm: UserForm = {
  name: "",
  email: "",
  role: "pengurus",
  createdAt: new Date().toISOString().split("T")[0],
};

export default function PengurusPage() {
  const [users, setUsers] = useState<User[]>(demoUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const openAdd = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };
  const openEdit = (u: User) => {
    setEditingUser(u);
    const { id: _id, ...rest } = u;
    setFormData(rest);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser)
      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? ({ ...formData, id: editingUser.id } as User)
            : u,
        ),
      );
    else
      setUsers([...users, { ...formData, id: Date.now().toString() } as User]);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus pengurus ini?"))
      setUsers(users.filter((u) => u.id !== id));
  };
  const update = (f: string, v: string) => setFormData({ ...formData, [f]: v });

  return (
    <>
      <PageHeader
        title="Pengurus"
        subtitle="Kelola data pengurus masjid"
        action={
          <Button onClick={openAdd}>
            <HiPlus className="w-5 h-5" /> Tambah Pengurus
          </Button>
        }
      />

      {users.length === 0 ? (
        <EmptyState
          icon={<HiOutlineUserGroup className="w-8 h-8" />}
          title="Belum ada data pengurus"
          description="Tambah pengurus pertama"
          action={
            <Button onClick={openAdd}>
              <HiPlus className="w-5 h-5" /> Tambah
            </Button>
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
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(user)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-primary cursor-pointer"
                  >
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-danger cursor-pointer"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
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
                  Sejak {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Edit Pengurus" : "Tambah Pengurus"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap"
            value={formData.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
          <Select
            label="Jabatan"
            value={formData.role}
            onChange={(e) => update("role", e.target.value)}
            options={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
            required
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" fullWidth>
              {editingUser ? "Simpan" : "Tambah"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
