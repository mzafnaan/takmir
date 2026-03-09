"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { JENIS_KEGIATAN } from "@/constants";
import { formatDate } from "@/lib/utils";
import type { Agenda } from "@/types";
import React, { useMemo, useState } from "react";
import {
  HiOutlineCalendar,
  HiOutlineFilter,
  HiOutlinePencil,
  HiOutlineTrash,
  HiPlus,
} from "react-icons/hi";

const demoAgendas: Agenda[] = [
  {
    id: "1",
    judul: "Kajian Rutin Ba'da Maghrib",
    jenisKegiatan: "Kajian",
    tanggal: "2026-03-12",
    waktuMulai: "18:30",
    waktuSelesai: "20:00",
    pemateri: "Ustadz Ahmad",
    lokasi: "Masjid Utama",
    deskripsi: "Kajian kitab fiqih untuk jamaah",
    createdBy: "admin",
  },
  {
    id: "2",
    judul: "Rapat Bulanan Takmir",
    jenisKegiatan: "Rapat Takmir",
    tanggal: "2026-03-15",
    waktuMulai: "19:30",
    waktuSelesai: "21:00",
    pemateri: "-",
    lokasi: "Ruang Rapat",
    deskripsi: "Evaluasi kegiatan dan rencana bulan depan",
    createdBy: "admin",
  },
  {
    id: "3",
    judul: "Kerja Bakti Masjid",
    jenisKegiatan: "Kerja Bakti",
    tanggal: "2026-03-20",
    waktuMulai: "07:00",
    waktuSelesai: "11:00",
    pemateri: "-",
    lokasi: "Area Masjid",
    deskripsi: "Bersih-bersih dan perawatan masjid",
    createdBy: "admin",
  },
  {
    id: "4",
    judul: "Santunan Anak Yatim",
    jenisKegiatan: "Santunan",
    tanggal: "2026-03-25",
    waktuMulai: "09:00",
    waktuSelesai: "12:00",
    pemateri: "-",
    lokasi: "Aula Masjid",
    deskripsi: "Pembagian santunan untuk anak yatim",
    createdBy: "admin",
  },
];

const emptyAgenda: Omit<Agenda, "id"> = {
  judul: "",
  jenisKegiatan: "",
  tanggal: "",
  waktuMulai: "",
  waktuSelesai: "",
  pemateri: "",
  lokasi: "",
  deskripsi: "",
  createdBy: "admin",
};

export default function AgendaPage() {
  const [agendas, setAgendas] = useState<Agenda[]>(demoAgendas);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null);
  const [formData, setFormData] = useState(emptyAgenda);
  const [filterDate, setFilterDate] = useState("");
  const [filterJenis, setFilterJenis] = useState("");

  const filteredAgendas = useMemo(() => {
    return agendas.filter((a) => {
      if (filterDate && a.tanggal !== filterDate) return false;
      if (filterJenis && a.jenisKegiatan !== filterJenis) return false;
      return true;
    });
  }, [agendas, filterDate, filterJenis]);

  const openAddModal = () => {
    setEditingAgenda(null);
    setFormData(emptyAgenda);
    setIsModalOpen(true);
  };

  const openEditModal = (agenda: Agenda) => {
    setEditingAgenda(agenda);
    setFormData(agenda);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAgenda) {
      setAgendas(
        agendas.map((a) =>
          a.id === editingAgenda.id
            ? ({ ...formData, id: editingAgenda.id } as Agenda)
            : a,
        ),
      );
    } else {
      setAgendas([
        ...agendas,
        { ...formData, id: Date.now().toString() } as Agenda,
      ]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus agenda ini?")) {
      setAgendas(agendas.filter((a) => a.id !== id));
    }
  };

  const updateForm = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Agenda Kegiatan"
        subtitle="Kelola jadwal kegiatan masjid"
        action={
          <Button onClick={openAddModal}>
            <HiPlus className="w-5 h-5" /> Tambah Agenda
          </Button>
        }
      />

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex items-center gap-2 text-text-secondary">
            <HiOutlineFilter className="w-5 h-5" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          <div className="flex-1">
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              placeholder="Filter tanggal"
            />
          </div>
          <div className="flex-1">
            <Select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              options={JENIS_KEGIATAN.map((j) => ({ value: j, label: j }))}
              placeholder="Semua jenis"
            />
          </div>
          {(filterDate || filterJenis) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterDate("");
                setFilterJenis("");
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Agenda List */}
      {filteredAgendas.length === 0 ? (
        <EmptyState
          icon={<HiOutlineCalendar className="w-8 h-8" />}
          title="Belum ada agenda"
          description="Tambah agenda kegiatan masjid pertama Anda"
          action={
            <Button onClick={openAddModal}>
              <HiPlus className="w-5 h-5" /> Tambah Agenda
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAgendas.map((agenda) => (
            <div
              key={agenda.id}
              className="bg-card rounded-xl shadow-sm border border-border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-text-primary">
                    {agenda.judul}
                  </h3>
                  <Badge variant="info">{agenda.jenisKegiatan}</Badge>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(agenda)}
                    className="p-2 rounded-lg hover:bg-blue-50 text-primary transition-colors cursor-pointer"
                  >
                    <HiOutlinePencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(agenda.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-danger transition-colors cursor-pointer"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-text-secondary">
                <p>📅 {formatDate(agenda.tanggal)}</p>
                <p>
                  🕐 {agenda.waktuMulai} - {agenda.waktuSelesai}
                </p>
                <p>📍 {agenda.lokasi}</p>
                {agenda.pemateri && agenda.pemateri !== "-" && (
                  <p>🎤 {agenda.pemateri}</p>
                )}
                {agenda.deskripsi && (
                  <p className="text-text-secondary mt-2">{agenda.deskripsi}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAgenda ? "Edit Agenda" : "Tambah Agenda"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Judul Kegiatan"
            value={formData.judul}
            onChange={(e) => updateForm("judul", e.target.value)}
            required
          />
          <Select
            label="Jenis Kegiatan"
            value={formData.jenisKegiatan}
            onChange={(e) => updateForm("jenisKegiatan", e.target.value)}
            options={JENIS_KEGIATAN.map((j) => ({ value: j, label: j }))}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tanggal"
              type="date"
              value={formData.tanggal}
              onChange={(e) => updateForm("tanggal", e.target.value)}
              required
            />
            <Input
              label="Waktu Mulai"
              type="time"
              value={formData.waktuMulai}
              onChange={(e) => updateForm("waktuMulai", e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Waktu Selesai"
              type="time"
              value={formData.waktuSelesai}
              onChange={(e) => updateForm("waktuSelesai", e.target.value)}
              required
            />
            <Input
              label="Pemateri"
              value={formData.pemateri}
              onChange={(e) => updateForm("pemateri", e.target.value)}
              placeholder="Nama pemateri (opsional)"
            />
          </div>
          <Input
            label="Lokasi"
            value={formData.lokasi}
            onChange={(e) => updateForm("lokasi", e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              Deskripsi
            </label>
            <textarea
              className="w-full px-4 py-3 text-base rounded-xl border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 min-h-[100px] resize-y"
              value={formData.deskripsi}
              onChange={(e) => updateForm("deskripsi", e.target.value)}
              placeholder="Deskripsi kegiatan (opsional)"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" fullWidth>
              {editingAgenda ? "Simpan Perubahan" : "Tambah Agenda"}
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
    </DashboardLayout>
  );
}
