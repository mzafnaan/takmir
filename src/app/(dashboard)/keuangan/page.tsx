"use client";

import StatCard from "@/components/cards/StatCard";
import PageHeader from "@/components/layout/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { KATEGORI_PEMASUKAN, KATEGORI_PENGELUARAN } from "@/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaksi } from "@/types";
import React, { useMemo, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermission";
import {
  getTransaksi,
  addTransaksi,
  updateTransaksi,
  deleteTransaksi,
} from "@/features/keuangan/keuanganService";
import {
  HiOutlineCash,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineTrendingDown,
  HiOutlineTrendingUp,
  HiPlus,
  HiOutlineDocumentDownload,
} from "react-icons/hi";

type TransaksiForm = Omit<Transaksi, "id">;

const emptyForm: TransaksiForm = {
  tanggal: new Date().toISOString().split("T")[0],
  keterangan: "",
  jenis: "pemasukan",
  kategori: "",
  nominal: 0,
  createdBy: "admin",
};

export default function KeuanganPage() {
  const { userData } = useAuth();
  const { canEdit } = usePermission();
  const { data: transaksi = [], mutate, isLoading } = useSWR("transaksi", getTransaksi);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Transaksi | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const stats = useMemo(() => {
    let pemasukan = 0,
      pengeluaran = 0;
    transaksi.forEach((t) => {
      if (t.jenis === "pemasukan") {
        pemasukan += t.nominal;
      } else {
        pengeluaran += t.nominal;
      }
    });
    return { saldo: pemasukan - pengeluaran, pemasukan, pengeluaran };
  }, [transaksi]);

  const openAdd = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };
  const openEdit = (t: Transaksi) => {
    setEditingItem(t);
    const { id: _, ...rest } = t;
    void _;
    setFormData(rest);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const d = { ...formData, nominal: Number(formData.nominal) };
      if (editingItem) {
        await updateTransaksi(editingItem.id, d);
      } else {
        await addTransaksi({
          ...d,
          createdBy: userData?.name || "Admin",
        });
      }
      setIsModalOpen(false);
      mutate();
    } catch (error) {
      console.error("Gagal menyimpan transaksi:", error);
      alert("Gagal menyimpan transaksi.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus transaksi?")) {
      try {
        await deleteTransaksi(id);
        mutate();
      } catch (error) {
        console.error("Gagal menghapus transaksi:", error);
        alert("Gagal menghapus transaksi.");
      }
    }
  };
  const update = (f: string, v: string | number) =>
    setFormData({ ...formData, [f]: v });
  const katOpts =
    formData.jenis === "pemasukan" ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN;

  return (
    <>
      <PageHeader
        title="Keuangan"
        subtitle="Kelola kas masjid"
        action={
          <div className="flex gap-2">
            <Link href="/keuangan/laporan">
              <Button variant="secondary">
                <HiOutlineDocumentDownload className="w-5 h-5" />
                Laporan
              </Button>
            </Link>
            {canEdit && (
              <Button onClick={openAdd}>
                <HiPlus className="w-5 h-5" /> Catat Transaksi
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Saldo Kas"
          value={formatCurrency(stats.saldo)}
          icon={<HiOutlineCash className="w-6 h-6" />}
          color="text-primary"
        />
        <StatCard
          title="Total Pemasukan"
          value={formatCurrency(stats.pemasukan)}
          icon={<HiOutlineTrendingUp className="w-6 h-6" />}
          color="text-success"
        />
        <StatCard
          title="Total Pengeluaran"
          value={formatCurrency(stats.pengeluaran)}
          icon={<HiOutlineTrendingDown className="w-6 h-6" />}
          color="text-danger"
        />
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">
            Riwayat Transaksi
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-border bg-gray-50">
                <th className="px-4 py-3 text-sm font-semibold text-text-secondary">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-text-secondary">
                  Keterangan
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-text-secondary">
                  Kategori
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-text-secondary">
                  Jenis
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-text-secondary text-right">
                  Nominal
                </th>
                {canEdit && <th className="px-4 py-3 text-sm font-semibold text-text-secondary"></th>}
              </tr>
            </thead>
            <tbody>
              {isLoading && transaksi.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : Object.keys(transaksi).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                    Belum ada transaksi
                  </td>
                </tr>
              ) : (
                transaksi.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-border hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-base">
                    {formatDate(t.tanggal)}
                  </td>
                  <td className="px-4 py-3 text-base">{t.keterangan}</td>
                  <td className="px-4 py-3">
                    <Badge variant="neutral">{t.kategori}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={t.jenis === "pemasukan" ? "success" : "danger"}
                    >
                      {t.jenis === "pemasukan" ? "↑ Masuk" : "↓ Keluar"}
                    </Badge>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${t.jenis === "pemasukan" ? "text-success" : "text-danger"}`}
                  >
                    {t.jenis === "pemasukan" ? "+" : "-"}
                    {formatCurrency(t.nominal)}
                  </td>
                  {canEdit && (
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(t)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-primary cursor-pointer"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-danger cursor-pointer"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  )}
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Transaksi" : "Catat Transaksi"}
        subtitle={
          editingItem
            ? "Perbarui data transaksi"
            : "Isi data untuk mencatat transaksi baru"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Tanggal"
            type="date"
            value={formData.tanggal}
            onChange={(e) => update("tanggal", e.target.value)}
            required
          />
          <Input
            label="Keterangan"
            placeholder="Masukkan keterangan transaksi"
            value={formData.keterangan}
            onChange={(e) => update("keterangan", e.target.value)}
            required
          />
          <Select
            label="Jenis"
            value={formData.jenis}
            onChange={(e) => {
              update("jenis", e.target.value);
              update("kategori", "");
            }}
            options={[
              { value: "pemasukan", label: "↑ Pemasukan" },
              { value: "pengeluaran", label: "↓ Pengeluaran" },
            ]}
            required
          />
          <Select
            label="Kategori"
            value={formData.kategori}
            onChange={(e) => update("kategori", e.target.value)}
            options={katOpts.map((k) => ({ value: k, label: k }))}
            required
          />
          <Input
            label="Nominal (Rp)"
            type="number"
            value={formData.nominal || ""}
            onChange={(e) => update("nominal", Number(e.target.value))}
            required
            min={0}
          />
          <div className="flex gap-3 pt-3">
            <Button type="submit" fullWidth>
              {editingItem ? "Simpan" : "Catat"}
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
