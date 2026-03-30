"use client";

import PageHeader from "@/components/layout/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Select from "@/components/ui/Select";
import { KATEGORI_PENGUMUMAN, URGENSI_PENGUMUMAN } from "@/constants";
import { formatDate } from "@/lib/utils";
import type { Pengumuman } from "@/types";
import React, { useMemo, useState } from "react";
import useSWR from "swr";
import dynamic from "next/dynamic";
import { usePermission } from "@/hooks/usePermission";
import {
  getPengumuman,
  deletePengumuman,
} from "@/features/pengumuman/pengumumanService";
import {
  HiOutlinePencil,
  HiOutlineSearch,
  HiOutlineSpeakerphone,
  HiOutlineTrash,
  HiPlus,
} from "react-icons/hi";

const PengumumanModal = dynamic(
  () => import("@/components/pengumuman/PengumumanModal"),
  { ssr: false }
);

const urgensiBadgeVariant = (urgensi: string) => {
  switch (urgensi) {
    case "Mendesak":
      return "danger" as const;
    case "Penting":
      return "warning" as const;
    default:
      return "info" as const;
  }
};

export default function PengumumanPage() {
  const { canEdit } = usePermission();
  const { data: pengumuman = [], mutate, isLoading } = useSWR("pengumuman", getPengumuman);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Pengumuman | null>(null);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterUrgensi, setFilterUrgensi] = useState("");

  const filtered = useMemo(() => {
    return pengumuman.filter((p) => {
      if (
        search &&
        !p.judul.toLowerCase().includes(search.toLowerCase()) &&
        !p.deskripsi.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (filterKategori && p.kategori !== filterKategori) return false;
      if (filterUrgensi && p.urgensi !== filterUrgensi) return false;
      return true;
    });
  }, [pengumuman, search, filterKategori, filterUrgensi]);

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Pengumuman) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus pengumuman ini?")) {
      try {
        await deletePengumuman(id);
        mutate();
      } catch (error) {
        console.error("Gagal menghapus:", error);
        alert("Gagal menghapus pengumuman.");
      }
    }
  };

  return (
    <>
      <PageHeader
        title="Pengumuman"
        subtitle="Kelola pengumuman untuk pengurus masjid"
        action={
          canEdit ? (
            <Button onClick={openAddModal}>
              <HiPlus className="w-5 h-5" /> Buat Pengumuman
            </Button>
          ) : undefined
        }
      />

      {/* Search & Filters */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Cari pengumuman..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-base rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div className="w-full sm:w-[200px]">
            <Select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              options={KATEGORI_PENGUMUMAN.map((k) => ({ value: k, label: k }))}
              placeholder="Semua kategori"
            />
          </div>
          <div className="w-full sm:w-[200px]">
            <Select
              value={filterUrgensi}
              onChange={(e) => setFilterUrgensi(e.target.value)}
              options={URGENSI_PENGUMUMAN.map((u) => ({ value: u, label: u }))}
              placeholder="Semua urgensi"
            />
          </div>
        </div>
      </div>

      {/* Pengumuman Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<HiOutlineSpeakerphone className="w-8 h-8" />}
          title="Belum ada pengumuman"
          description="Buat pengumuman pertama untuk pengurus masjid"
          action={
            canEdit ? (
              <Button onClick={openAddModal}>
                <HiPlus className="w-5 h-5" /> Buat Pengumuman
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-xl shadow-sm border border-border p-5 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <Badge variant={urgensiBadgeVariant(item.urgensi)}>
                  {item.urgensi}
                </Badge>
                {canEdit && (
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-primary transition-colors cursor-pointer"
                  >
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-danger transition-colors cursor-pointer"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
                )}
              </div>
              <h3 className="text-base font-bold text-text-primary mb-2">
                {item.judul}
              </h3>
              <p className="text-sm text-text-secondary line-clamp-3 flex-1 mb-3">
                {item.deskripsi}
              </p>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                <Badge variant="neutral">{item.kategori}</Badge>
                <span className="text-xs text-text-secondary">
                  {formatDate(item.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal (Lazy Loaded) */}
      {isModalOpen && (
        <PengumumanModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingItem={editingItem}
          onSuccess={() => mutate()}
        />
      )}
    </>
  );
}
