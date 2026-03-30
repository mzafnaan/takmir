"use client";

import PageHeader from "@/components/layout/PageHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Select from "@/components/ui/Select";
import { JENIS_KEGIATAN } from "@/constants";
import type { Agenda } from "@/types";
import React, { useMemo, useState } from "react";
import useSWR from "swr";
import dynamic from "next/dynamic";
import {
  getAgendas,
  deleteAgenda,
} from "@/features/agenda/agendaService";
import { usePermission } from "@/hooks/usePermission";
import {
  HiOutlineCalendar,
  HiOutlinePencil,
  HiOutlineTrash,
  HiPlus,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";

const AgendaModal = dynamic(() => import("@/components/agenda/AgendaModal"), {
  ssr: false,
});

const BULAN_PENDEK = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const BULAN_PANJANG = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const HARI = [
  "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu",
];

const HARI_SINGKAT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function parseDateParts(dateStr: string) {
  const d = new Date(dateStr);
  return {
    hari: HARI[d.getDay()],
    tanggal: d.getDate(),
    bulan: BULAN_PENDEK[d.getMonth()],
    tahun: d.getFullYear(),
  };
}

export default function AgendaPage() {
  const { canEdit } = usePermission();
  const { data: agendas = [], mutate, isLoading } = useSWR("agendas", getAgendas);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null);
  const [filterJenis, setFilterJenis] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const filteredAgendas = useMemo(() => {
    return agendas.filter((a) => {
      if (filterJenis && a.jenisKegiatan !== filterJenis) return false;
      if (filterDate && a.tanggal !== filterDate) return false;
      return true;
    });
  }, [agendas, filterJenis, filterDate]);

  const openAddModal = () => {
    setEditingAgenda(null);
    setIsModalOpen(true);
  };

  const openEditModal = (agenda: Agenda) => {
    setEditingAgenda(agenda);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus agenda ini?")) {
      try {
        await deleteAgenda(id);
        mutate();
      } catch (error) {
        console.error("Gagal menghapus:", error);
        alert("Gagal menghapus agenda.");
      }
    }
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

          {/* Mini calendar popover */}
          {showDatePicker && (() => {
            const firstDay = new Date(calYear, calMonth, 1).getDay();
            const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

            const prevMonth = () => {
              if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
              else setCalMonth(calMonth - 1);
            };
            const nextMonth = () => {
              if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
              else setCalMonth(calMonth + 1);
            };

            return (
              <div className="absolute z-40 top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-border p-3 animate-dropdownOpen w-[256px]">
                {/* Month/Year navigation */}
                <div className="flex items-center justify-between mb-3">
                  <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-gray-100 text-text-secondary transition-colors cursor-pointer">
                    <HiChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-semibold text-text-primary">
                    {BULAN_PANJANG[calMonth]} {calYear}
                  </span>
                  <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-gray-100 text-text-secondary transition-colors cursor-pointer">
                    <HiChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-0 mb-1">
                  {HARI_SINGKAT.map((h) => (
                    <div key={h} className="text-center text-[10px] font-semibold text-text-secondary/60 uppercase py-1">
                      {h}
                    </div>
                  ))}
                </div>

                {/* Date cells */}
                <div className="grid grid-cols-7 gap-0">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === filterDate;

                    return (
                      <button
                        key={day}
                        onClick={() => {
                          setFilterDate(dateStr);
                          setShowDatePicker(false);
                        }}
                        className={`w-8 h-8 mx-auto flex items-center justify-center rounded-lg text-xs font-medium transition-all cursor-pointer
                          ${isSelected
                            ? "bg-primary text-white font-bold shadow-sm"
                            : isToday
                              ? "bg-primary/10 text-primary font-bold ring-1 ring-primary/30"
                              : "text-text-primary hover:bg-gray-100"
                          }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Clear filter */}
                {filterDate && (
                  <button
                    onClick={() => {
                      setFilterDate("");
                      setShowDatePicker(false);
                    }}
                    className="w-full mt-3 pt-2 border-t border-border text-xs text-danger hover:text-danger/80 cursor-pointer text-center transition-colors"
                  >
                    Hapus filter tanggal
                  </button>
                )}
              </div>
            );
          })()}
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
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : filteredAgendas.length === 0 ? (
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
                className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex">
                  {/* Mini calendar date block */}
                  <div className="w-[72px] sm:w-[84px] shrink-0 flex flex-col items-center justify-center py-4 relative overflow-hidden bg-gradient-to-b from-primary/10 to-primary/5">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                    <span className="text-[10px] font-semibold text-primary/60 uppercase tracking-widest">
                      {dp.hari}
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-primary leading-none mt-0.5">
                      {dp.tanggal}
                    </span>
                    <span className="text-[11px] font-medium text-primary/60 mt-0.5">
                      {dp.bulan}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 sm:p-5 min-w-0 border-l border-border">
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
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer"
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

      {/* Add/Edit Modal (Lazy Loaded) */}
      {isModalOpen && (
        <AgendaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingAgenda={editingAgenda}
          onSuccess={() => mutate()}
        />
      )}
    </>
  );
}
