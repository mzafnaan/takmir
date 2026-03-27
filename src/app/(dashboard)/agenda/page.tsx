"use client";

import PageHeader from "@/components/layout/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { JENIS_KEGIATAN } from "@/constants";
import type { Agenda } from "@/types";
import React, { useMemo, useState } from "react";
import { usePermission } from "@/hooks/usePermission";
import {
  HiOutlineCalendar,
  HiOutlinePencil,
  HiOutlineTrash,
  HiPlus,
} from "react-icons/hi";

const BULAN_PENDEK = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const HARI = [
  "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu",
];

function parseDateParts(dateStr: string) {
  const d = new Date(dateStr);
  return {
    hari: HARI[d.getDay()],
    tanggal: d.getDate(),
    bulan: BULAN_PENDEK[d.getMonth()],
    tahun: d.getFullYear(),
  };
}

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
  const { canEdit } = usePermission();
  const [agendas, setAgendas] = useState<Agenda[]>(demoAgendas);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null);
  const [formData, setFormData] = useState(emptyAgenda);
  const [filterJenis, setFilterJenis] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const filteredAgendas = useMemo(() => {
    return agendas.filter((a) => {
      if (filterJenis && a.jenisKegiatan !== filterJenis) return false;
      if (filterDate && a.tanggal !== filterDate) return false;
      return true;
    });
  }, [agendas, filterJenis, filterDate]);

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

  const hasActiveFilters = filterJenis || filterDate;

  return (
    <>
      <PageHeader
        title="Agenda Kegiatan"
        subtitle="Kelola jadwal kegiatan masjid"
        action={
          canEdit ? (
            <Button onClick={openAddModal}>
              <HiPlus className="w-5 h-5" /> Tambah Agenda
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-[180px] max-w-[260px]">
          <Select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            options={JENIS_KEGIATAN.map((j) => ({ value: j, label: j }))}
            placeholder="Semua jenis"
          />
        </div>

        {/* Calendar toggle button */}
        <div className="relative">
          <Button
            variant={showDatePicker || filterDate ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <HiOutlineCalendar className="w-5 h-5" />
            {filterDate ? (
              <span className="text-sm">
                {parseDateParts(filterDate).tanggal} {parseDateParts(filterDate).bulan}
              </span>
            ) : (
              <span className="text-sm">Pilih Tanggal</span>
            )}
          </Button>

          {/* Date picker popover */}
          {showDatePicker && (
            <div className="absolute z-40 top-full mt-2 left-0 bg-white rounded-xl shadow-lg border border-border p-3 animate-dropdownOpen">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setShowDatePicker(false);
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              {filterDate && (
                <button
                  onClick={() => {
                    setFilterDate("");
                    setShowDatePicker(false);
                  }}
                  className="w-full mt-2 text-xs text-danger hover:underline cursor-pointer text-center"
                >
                  Hapus filter tanggal
                </button>
              )}
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterJenis("");
              setFilterDate("");
              setShowDatePicker(false);
            }}
          >
            Reset
          </Button>
        )}
      </div>

      {/* Agenda List */}
      {filteredAgendas.length === 0 ? (
        <EmptyState
          icon={<HiOutlineCalendar className="w-8 h-8" />}
          title="Belum ada agenda"
          description="Tambah agenda kegiatan masjid pertama Anda"
          action={
            canEdit ? (
              <Button onClick={openAddModal}>
                <HiPlus className="w-5 h-5" /> Tambah Agenda
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAgendas.map((agenda) => {
            const dp = parseDateParts(agenda.tanggal);
            return (
              <div
                key={agenda.id}
                className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex">
                  {/* Mini calendar date block */}
                  <div className="w-20 sm:w-24 shrink-0 bg-primary/5 flex flex-col items-center justify-center py-5 border-r border-border">
                    <span className="text-xs font-medium text-primary/70 uppercase tracking-wider">
                      {dp.hari}
                    </span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-primary leading-none mt-1">
                      {dp.tanggal}
                    </span>
                    <span className="text-xs font-semibold text-primary/70 mt-1">
                      {dp.bulan} {dp.tahun}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 sm:p-5 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-text-primary truncate">
                          {agenda.judul}
                        </h3>
                        <Badge variant="info">{agenda.jenisKegiatan}</Badge>
                      </div>
                      {canEdit && (
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => openEditModal(agenda)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-primary transition-colors cursor-pointer"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(agenda.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-danger transition-colors cursor-pointer"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-text-secondary">
                      <p>🕐 {agenda.waktuMulai} - {agenda.waktuSelesai}</p>
                      <p>📍 {agenda.lokasi}</p>
                      {agenda.pemateri && agenda.pemateri !== "-" && (
                        <p>🎤 {agenda.pemateri}</p>
                      )}
                      {agenda.deskripsi && (
                        <p className="text-text-secondary/80 mt-1 line-clamp-2">
                          {agenda.deskripsi}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAgenda ? "Edit Agenda" : "Tambah Agenda"}
        subtitle={
          editingAgenda
            ? "Perbarui informasi agenda"
            : "Isi data untuk menambahkan agenda baru"
        }
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Judul Kegiatan"
            placeholder="Masukkan judul kegiatan"
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
            placeholder="Masukkan lokasi kegiatan"
            value={formData.lokasi}
            onChange={(e) => updateForm("lokasi", e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              Deskripsi
            </label>
            <textarea
              className="w-full px-4 py-3 text-base rounded-xl border border-border bg-white text-text-primary placeholder-text-secondary/70 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:shadow-sm transition-all duration-200 min-h-[100px] resize-y"
              value={formData.deskripsi}
              onChange={(e) => updateForm("deskripsi", e.target.value)}
              placeholder="Deskripsi kegiatan (opsional)"
            />
          </div>
          <div className="flex gap-3 pt-3">
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
    </>
  );
}
