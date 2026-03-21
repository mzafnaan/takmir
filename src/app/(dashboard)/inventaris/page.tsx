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
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  HiOutlineArchive,
  HiOutlineExclamation,
  HiOutlinePencil,
  HiOutlineSwitchHorizontal,
  HiOutlineReply,
  HiOutlineTrash,
  HiPlus,
} from "react-icons/hi";
import {
  addAktivitasInventaris,
  addInventaris,
  deleteInventaris,
  getAktivitasInventaris,
  getInventaris,
  updateInventaris,
} from "@/features/inventaris/inventarisService";

const emptyForm = {
  namaBarang: "",
  lokasi: "",
  total: 0,
  tersedia: 0,
  dipinjam: "" as unknown as number,
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
  const { userData } = useAuth();
  const [items, setItems] = useState<Inventaris[]>([]);
  const [activities, setActivities] = useState<AktivitasInventaris[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Main Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventaris | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  // Pinjam Modal state
  const [isPinjamModalOpen, setIsPinjamModalOpen] = useState(false);
  const [pinjamItem, setPinjamItem] = useState<Inventaris | null>(null);
  const [pinjamForm, setPinjamForm] = useState({ jumlah: 1, peminjam: "", keterangan: "" });

  // Kembali Modal state
  const [isKembaliModalOpen, setIsKembaliModalOpen] = useState(false);
  const [kembaliItem, setKembaliItem] = useState<Inventaris | null>(null);
  const [kembaliForm, setKembaliForm] = useState({ jumlah: 1, keterangan: "" });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const fetchedItems = await getInventaris();
      const fetchedActivities = await getAktivitasInventaris();
      setItems(fetchedItems);
      setActivities(fetchedActivities);
    } catch (error) {
      console.error("Error fetching inventaris data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    setFormData({
      ...item,
      dipinjam: item.dipinjam === 0 ? ("" as unknown as number) : item.dipinjam,
    });
    setIsModalOpen(true);
  };

  const openPinjam = (item: Inventaris) => {
    setPinjamItem(item);
    setPinjamForm({ jumlah: 1, peminjam: "", keterangan: "" });
    setIsPinjamModalOpen(true);
  };

  const openKembali = (item: Inventaris) => {
    setKembaliItem(item);
    setKembaliForm({ jumlah: item.dipinjam > 0 ? 1 : 0, keterangan: "" });
    setIsKembaliModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const d = {
        ...formData,
        total: Number(formData.total) || 0,
        tersedia: Number(formData.tersedia) || 0,
        dipinjam: formData.dipinjam ? Number(formData.dipinjam) : 0,
      };

      if (editingItem) {
        await updateInventaris(editingItem.id, d);
      } else {
        await addInventaris(d);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      alert("Gagal menyimpan data inventaris.");
    }
  };

  const handlePinjamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinjamItem) return;

    try {
      const jumlahPinjam = Number(pinjamForm.jumlah);

      if (jumlahPinjam <= 0) {
        alert("Jumlah pinjam harus lebih besar dari 0.");
        return;
      }

      if (jumlahPinjam > pinjamItem.tersedia) {
        alert("Jumlah yang dipinjam melebihi stok yang tersedia!");
        return;
      }

      // Update the item quantity
      await updateInventaris(pinjamItem.id, {
        dipinjam: pinjamItem.dipinjam + jumlahPinjam,
        tersedia: pinjamItem.tersedia - jumlahPinjam,
      });

      // Log the activity
      await addAktivitasInventaris({
        inventarisId: pinjamItem.id,
        namaBarang: pinjamItem.namaBarang,
        aksi: "dipinjam",
        jumlah: jumlahPinjam,
        catatan: pinjamForm.keterangan || "Tidak ada keterangan",
        tanggal: new Date().toISOString(),
        oleh: pinjamForm.peminjam || userData?.name || "Pengurus",
      });

      setIsPinjamModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Gagal mencatat peminjaman:", error);
      alert("Gagal mencatat peminjaman.");
    }
  };

  const handleKembaliSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kembaliItem) return;

    try {
      const jumlahKembali = Number(kembaliForm.jumlah);

      if (jumlahKembali <= 0) {
        alert("Jumlah yang dikembalikan harus lebih besar dari 0.");
        return;
      }

      if (jumlahKembali > kembaliItem.dipinjam) {
        alert("Jumlah melebihi total barang yang sedang dipinjam!");
        return;
      }

      // Update the item quantity
      await updateInventaris(kembaliItem.id, {
        dipinjam: kembaliItem.dipinjam - jumlahKembali,
        tersedia: kembaliItem.tersedia + jumlahKembali,
      });

      // Log the activity
      await addAktivitasInventaris({
        inventarisId: kembaliItem.id,
        namaBarang: kembaliItem.namaBarang,
        aksi: "dikembalikan",
        jumlah: jumlahKembali,
        catatan: kembaliForm.keterangan || "Dikembalikan",
        tanggal: new Date().toISOString(),
        oleh: userData?.name || "Pengurus",
      });

      setIsKembaliModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Gagal mencatat pengembalian:", error);
      alert("Gagal mencatat pengembalian.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus barang ini secara permanen?")) {
      try {
        await deleteInventaris(id);
        fetchData();
      } catch (error) {
        console.error("Gagal menghapus:", error);
        alert("Gagal menghapus barang.");
      }
    }
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

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<HiOutlineArchive className="w-8 h-8" />}
          title="Belum ada inventaris"
          description="Tambah barang pertama untuk mulai mengelola inventaris"
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
                  <th className="px-4 py-3 text-right">Aksi</th>
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
                      <div className="flex justify-end gap-1">
                        {item.tersedia > 0 && (
                          <button
                            onClick={() => openPinjam(item)}
                            title="Pinjam Barang"
                            className="flex items-center justify-center p-1.5 rounded-lg hover:bg-warning/10 text-warning cursor-pointer transition-colors"
                          >
                            <HiOutlineSwitchHorizontal className="w-4 h-4" />
                          </button>
                        )}
                        {item.dipinjam > 0 && (
                          <button
                            onClick={() => openKembali(item)}
                            title="Kembalikan Barang"
                            className="flex items-center justify-center p-1.5 rounded-lg hover:bg-success/10 text-success cursor-pointer transition-colors"
                          >
                            <HiOutlineReply className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(item)}
                          title="Edit Barang"
                          className="flex items-center justify-center p-1.5 rounded-lg hover:bg-blue-50 text-primary cursor-pointer transition-colors"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Hapus Barang"
                          className="flex items-center justify-center p-1.5 rounded-lg hover:bg-red-50 text-danger cursor-pointer transition-colors"
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
      {!isLoading && activities.length > 0 && (
        <div className="bg-card rounded-xl shadow-sm border border-border p-5">
          <h2 className="text-lg font-bold text-text-primary mb-4">
            Riwayat Aktivitas
          </h2>
          <div className="space-y-3">
            {activities.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
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
      )}

      {/* Modal Utama (Tambah/Edit) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Barang" : "Tambah Barang"}
        subtitle={
          editingItem
            ? "Perbarui informasi barang"
            : "Isi data untuk menambahkan barang baru"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nama Barang"
            placeholder="Masukkan nama barang"
            value={formData.namaBarang}
            onChange={(e) => update("namaBarang", e.target.value)}
            required
          />
          <Input
            label="Lokasi"
            placeholder="Masukkan lokasi penyimpanan"
            value={formData.lokasi}
            onChange={(e) => update("lokasi", e.target.value)}
            required
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Total"
              type="number"
              value={formData.total === 0 ? "" : formData.total}
              onChange={(e) => update("total", Number(e.target.value))}
              required
              min={0}
            />
            <Input
              label="Tersedia"
              type="number"
              value={formData.tersedia === 0 ? "" : formData.tersedia}
              onChange={(e) => update("tersedia", Number(e.target.value))}
              required
              min={0}
            />
            <Input
              label="Dipinjam (Opsional)"
              type="number"
              value={formData.dipinjam}
              onChange={(e) => update("dipinjam", e.target.value)}
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
          <div className="flex gap-3 pt-3">
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

      {/* Modal Pinjam Barang */}
      <Modal
        isOpen={isPinjamModalOpen}
        onClose={() => setIsPinjamModalOpen(false)}
        title="Pinjam Barang"
        subtitle={`Catat peminjaman untuk ${pinjamItem?.namaBarang || ""}`}
      >
        <form onSubmit={handlePinjamSubmit} className="space-y-5">
          <div className="bg-gray-50 p-3 rounded-lg flex justify-between text-sm">
            <span className="text-text-secondary">Stok Tersedia:</span>
            <span className="font-bold text-success">
              {pinjamItem?.tersedia || 0}
            </span>
          </div>
          
          <Input
            label="Jumlah Pinjam"
            type="number"
            value={pinjamForm.jumlah}
            onChange={(e) =>
              setPinjamForm({ ...pinjamForm, jumlah: Number(e.target.value) })
            }
            required
            min={1}
            max={pinjamItem?.tersedia || 1}
          />
          
          <Input
            label="Nama Peminjam"
            placeholder="Contoh: Pak Budi"
            value={pinjamForm.peminjam}
            onChange={(e) =>
              setPinjamForm({ ...pinjamForm, peminjam: e.target.value })
            }
            required
          />
          
          <Input
            label="Keterangan / Keperluan"
            placeholder="Contoh: Dipinjam untuk acara kajian"
            value={pinjamForm.keterangan}
            onChange={(e) =>
              setPinjamForm({ ...pinjamForm, keterangan: e.target.value })
            }
            required
          />

          <div className="flex gap-3 pt-3">
            <Button type="submit" fullWidth>
              Konfirmasi Pinjam
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsPinjamModalOpen(false)}
            >
              Batal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Mengembalikan Barang */}
      <Modal
        isOpen={isKembaliModalOpen}
        onClose={() => setIsKembaliModalOpen(false)}
        title="Kembalikan Barang"
        subtitle={`Catat pengembalian untuk ${kembaliItem?.namaBarang || ""}`}
      >
        <form onSubmit={handleKembaliSubmit} className="space-y-5">
          <div className="bg-gray-50 p-3 rounded-lg flex justify-between text-sm">
            <span className="text-text-secondary">Sedang Dipinjam:</span>
            <span className="font-bold text-warning">
              {kembaliItem?.dipinjam || 0}
            </span>
          </div>
          
          <Input
            label="Jumlah Dikembalikan"
            type="number"
            value={kembaliForm.jumlah}
            onChange={(e) =>
              setKembaliForm({ ...kembaliForm, jumlah: Number(e.target.value) })
            }
            required
            min={1}
            max={kembaliItem?.dipinjam || 1}
          />
          
          <Input
            label="Keterangan / Kondisi (Opsional)"
            placeholder="Contoh: Dikembalikan dalam keadaan baik"
            value={kembaliForm.keterangan}
            onChange={(e) =>
              setKembaliForm({ ...kembaliForm, keterangan: e.target.value })
            }
          />

          <div className="flex gap-3 pt-3">
            <Button type="submit" fullWidth>
              Konfirmasi Kembali
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsKembaliModalOpen(false)}
            >
              Batal
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
