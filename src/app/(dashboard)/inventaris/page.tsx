"use client";

import StatCard from "@/components/cards/StatCard";
import PageHeader from "@/components/layout/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { KONDISI_INVENTARIS } from "@/constants";
import { formatDate } from "@/lib/utils";
import type { AktivitasInventaris, Inventaris } from "@/types";
import React, { useMemo, useState } from "react";
import {
  HiOutlineArchive,
  HiOutlineExclamation,
  HiOutlinePencil,
  HiOutlineSwitchHorizontal,
  HiOutlineTrash,
  HiPlus,
} from "react-icons/hi";

const demoItems: Inventaris[] = [
  {
    id: "1",
    namaBarang: "Sajadah",
    lokasi: "Gudang Utama",
    total: 50,
    tersedia: 45,
    dipinjam: 5,
    kondisi: "Baik",
    createdAt: "2026-01-01",
  },
  {
    id: "2",
    namaBarang: "Sound System",
    lokasi: "Ruang AV",
    total: 2,
    tersedia: 1,
    dipinjam: 1,
    kondisi: "Baik",
    createdAt: "2026-01-01",
  },
  {
    id: "3",
    namaBarang: "Kipas Angin",
    lokasi: "Masjid Utama",
    total: 8,
    tersedia: 6,
    dipinjam: 0,
    kondisi: "Perlu Perbaikan",
    createdAt: "2026-01-15",
  },
  {
    id: "4",
    namaBarang: "Meja Lipat",
    lokasi: "Gudang Utama",
    total: 20,
    tersedia: 15,
    dipinjam: 5,
    kondisi: "Baik",
    createdAt: "2026-02-01",
  },
  {
    id: "5",
    namaBarang: "Kursi Plastik",
    lokasi: "Gudang Samping",
    total: 100,
    tersedia: 80,
    dipinjam: 20,
    kondisi: "Baik",
    createdAt: "2026-02-01",
  },
];

const demoActivity: AktivitasInventaris[] = [
  {
    id: "1",
    inventarisId: "5",
    namaBarang: "Kursi Plastik",
    aksi: "dipinjam",
    jumlah: 20,
    catatan: "Untuk acara pengajian",
    tanggal: "2026-03-08",
    oleh: "Pak Budi",
  },
  {
    id: "2",
    inventarisId: "2",
    namaBarang: "Sound System",
    aksi: "dipinjam",
    jumlah: 1,
    catatan: "Acara ceramah",
    tanggal: "2026-03-07",
    oleh: "Pak Andi",
  },
  {
    id: "3",
    inventarisId: "1",
    namaBarang: "Sajadah",
    aksi: "ditambah",
    jumlah: 10,
    catatan: "Pembelian baru",
    tanggal: "2026-03-05",
    oleh: "Bendahara",
  },
];

const emptyForm = {
  namaBarang: "",
  lokasi: "",
  total: 0,
  tersedia: 0,
  dipinjam: 0,
  kondisi: "Baik",
  createdAt: new Date().toISOString().split("T")[0],
};

const aksiBadge = (aksi: string) => {
  const map: Record<string, "info" | "warning" | "success" | "danger"> = {
    dipinjam: "warning",
    dikembalikan: "success",
    ditambah: "info",
    rusak: "danger",
  };
  return <Badge variant={map[aksi] || "neutral"}>{aksi}</Badge>;
};

export default function InventarisPage() {
  const [items, setItems] = useState<Inventaris[]>(demoItems);
  const [activities] = useState<AktivitasInventaris[]>(demoActivity);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventaris | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const stats = useMemo(
    () => ({
      total: items.reduce((s, i) => s + i.total, 0),
      dipinjam: items.reduce((s, i) => s + i.dipinjam, 0),
      perbaikan: items.filter(
        (i) => i.kondisi === "Perlu Perbaikan" || i.kondisi === "Rusak Berat",
      ).length,
    }),
    [items],
  );

  const openAdd = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };
  const openEdit = (item: Inventaris) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = {
      ...formData,
      total: Number(formData.total),
      tersedia: Number(formData.tersedia),
      dipinjam: Number(formData.dipinjam),
    };
    if (editingItem)
      setItems(
        items.map((i) =>
          i.id === editingItem.id
            ? ({ ...d, id: editingItem.id } as Inventaris)
            : i,
        ),
      );
    else
      setItems([...items, { ...d, id: Date.now().toString() } as Inventaris]);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus barang ini?"))
      setItems(items.filter((i) => i.id !== id));
  };
  const update = (f: string, v: string | number) =>
    setFormData({ ...formData, [f]: v });

  return (
    <>
      <PageHeader
        title="Inventaris"
        subtitle="Kelola aset masjid"
        action={
          <Button onClick={openAdd}>
            <HiPlus className="w-5 h-5" /> Tambah Barang
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Aset"
          value={stats.total}
          icon={<HiOutlineArchive className="w-6 h-6" />}
          color="text-primary"
        />
        <StatCard
          title="Sedang Dipinjam"
          value={stats.dipinjam}
          icon={<HiOutlineSwitchHorizontal className="w-6 h-6" />}
          color="text-warning"
        />
        <StatCard
          title="Perlu Perbaikan"
          value={stats.perbaikan}
          icon={<HiOutlineExclamation className="w-6 h-6" />}
          color="text-danger"
        />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<HiOutlineArchive className="w-8 h-8" />}
          title="Belum ada inventaris"
          description="Tambah barang pertama"
          action={
            <Button onClick={openAdd}>
              <HiPlus className="w-5 h-5" /> Tambah
            </Button>
          }
        />
      ) : (
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-lg font-bold text-text-primary">
              Daftar Barang
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-border bg-gray-50">
                  <th className="px-4 py-3 text-sm font-semibold text-text-secondary">
                    Nama Barang
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-text-secondary">
                    Lokasi
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-text-secondary text-center">
                    Tersedia
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-text-secondary text-center">
                    Dipinjam
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-text-secondary text-center">
                    Total
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-text-secondary">
                    Kondisi
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">{item.namaBarang}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {item.lokasi}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-success">
                      {item.tersedia}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-warning">
                      {item.dipinjam}
                    </td>
                    <td className="px-4 py-3 text-center font-bold">
                      {item.total}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          item.kondisi === "Baik" ? "success" : "warning"
                        }
                      >
                        {item.kondisi}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-primary cursor-pointer"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-danger cursor-pointer"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity History */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-5">
        <h2 className="text-lg font-bold text-text-primary mb-4">
          Riwayat Aktivitas
        </h2>
        <div className="space-y-3">
          {activities.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50"
            >
              <div className="mt-0.5">{aksiBadge(a.aksi)}</div>
              <div className="flex-1">
                <p className="font-medium text-text-primary">
                  {a.namaBarang}{" "}
                  <span className="text-text-secondary font-normal">
                    × {a.jumlah}
                  </span>
                </p>
                <p className="text-sm text-text-secondary">{a.catatan}</p>
                <p className="text-xs text-text-secondary mt-1">
                  {formatDate(a.tanggal)} • {a.oleh}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Barang" : "Tambah Barang"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Barang"
            value={formData.namaBarang}
            onChange={(e) => update("namaBarang", e.target.value)}
            required
          />
          <Input
            label="Lokasi"
            value={formData.lokasi}
            onChange={(e) => update("lokasi", e.target.value)}
            required
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Total"
              type="number"
              value={formData.total || ""}
              onChange={(e) => update("total", Number(e.target.value))}
              required
              min={0}
            />
            <Input
              label="Tersedia"
              type="number"
              value={formData.tersedia || ""}
              onChange={(e) => update("tersedia", Number(e.target.value))}
              required
              min={0}
            />
            <Input
              label="Dipinjam"
              type="number"
              value={formData.dipinjam || ""}
              onChange={(e) => update("dipinjam", Number(e.target.value))}
              required
              min={0}
            />
          </div>
          <Select
            label="Kondisi"
            value={formData.kondisi}
            onChange={(e) => update("kondisi", e.target.value)}
            options={KONDISI_INVENTARIS.map((k) => ({ value: k, label: k }))}
            required
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" fullWidth>
              {editingItem ? "Simpan" : "Tambah"}
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
