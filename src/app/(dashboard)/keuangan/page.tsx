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
import {
  HiOutlineCash,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineTrendingDown,
  HiOutlineTrendingUp,
  HiPlus,
} from "react-icons/hi";

const demoTransaksi: Transaksi[] = [
  {
    id: "1",
    tanggal: "2026-03-01",
    keterangan: "Infak Jumat Minggu 1",
    jenis: "pemasukan",
    kategori: "Infak",
    nominal: 2500000,
    createdBy: "admin",
  },
  {
    id: "2",
    tanggal: "2026-03-03",
    keterangan: "Bayar Listrik Masjid",
    jenis: "pengeluaran",
    kategori: "Listrik",
    nominal: 850000,
    createdBy: "admin",
  },
  {
    id: "3",
    tanggal: "2026-03-05",
    keterangan: "Donasi Hamba Allah",
    jenis: "pemasukan",
    kategori: "Donasi",
    nominal: 5000000,
    createdBy: "admin",
  },
  {
    id: "4",
    tanggal: "2026-03-06",
    keterangan: "Bayar Air PDAM",
    jenis: "pengeluaran",
    kategori: "Air",
    nominal: 350000,
    createdBy: "admin",
  },
  {
    id: "5",
    tanggal: "2026-03-08",
    keterangan: "Infak Jumat Minggu 2",
    jenis: "pemasukan",
    kategori: "Infak",
    nominal: 2750000,
    createdBy: "admin",
  },
  {
    id: "6",
    tanggal: "2026-03-08",
    keterangan: "Perbaikan Kipas Angin",
    jenis: "pengeluaran",
    kategori: "Perawatan",
    nominal: 450000,
    createdBy: "admin",
  },
];

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
  const [transaksi, setTransaksi] = useState<Transaksi[]>(demoTransaksi);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Transaksi | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const stats = useMemo(() => {
    let pemasukan = 0,
      pengeluaran = 0;
    transaksi.forEach((t) => {
      t.jenis === "pemasukan"
        ? (pemasukan += t.nominal)
        : (pengeluaran += t.nominal);
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
    const { id: _id, ...rest } = t;
    setFormData(rest);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = { ...formData, nominal: Number(formData.nominal) };
    if (editingItem)
      setTransaksi(
        transaksi.map((t) =>
          t.id === editingItem.id
            ? ({ ...d, id: editingItem.id } as Transaksi)
            : t,
        ),
      );
    else
      setTransaksi([
        { ...d, id: Date.now().toString() } as Transaksi,
        ...transaksi,
      ]);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus transaksi?"))
      setTransaksi(transaksi.filter((t) => t.id !== id));
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
          <Button onClick={openAdd}>
            <HiPlus className="w-5 h-5" /> Catat Transaksi
          </Button>
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
                <th className="px-4 py-3 text-sm font-semibold text-text-secondary"></th>
              </tr>
            </thead>
            <tbody>
              {transaksi.map((t) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Transaksi" : "Catat Transaksi"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tanggal"
            type="date"
            value={formData.tanggal}
            onChange={(e) => update("tanggal", e.target.value)}
            required
          />
          <Input
            label="Keterangan"
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
          <div className="flex gap-3 pt-2">
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
