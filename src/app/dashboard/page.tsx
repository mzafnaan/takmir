"use client";

import StatCard from "@/components/cards/StatCard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Agenda, Pengumuman } from "@/types";
import { useState } from "react";
import {
  HiOutlineArchive,
  HiOutlineCalendar,
  HiOutlineCash,
  HiOutlineSpeakerphone,
} from "react-icons/hi";

// Demo data for development
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
    deskripsi: "Kajian kitab fiqih",
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
    deskripsi: "Evaluasi kegiatan bulan lalu",
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
    deskripsi: "Bersih-bersih masjid",
    createdBy: "admin",
  },
];

const demoPengumuman: Pengumuman[] = [
  {
    id: "1",
    judul: "Jadwal Imam Sholat Jumat Bulan Maret",
    deskripsi: "Berikut jadwal imam sholat jumat untuk bulan Maret 2026.",
    kategori: "Informasi Umum",
    urgensi: "Informasi",
    createdBy: "admin",
    createdAt: "2026-03-01",
  },
  {
    id: "2",
    judul: "Pembayaran Listrik & Air Bulan Ini",
    deskripsi: "Mohon segera membayar tagihan listrik dan air masjid.",
    kategori: "Keuangan",
    urgensi: "Penting",
    createdBy: "admin",
    createdAt: "2026-03-05",
  },
  {
    id: "3",
    judul: "Pendaftaran Panitia Ramadhan",
    deskripsi: "Dibuka pendaftaran panitia kegiatan Ramadhan 2026.",
    kategori: "Kegiatan",
    urgensi: "Mendesak",
    createdBy: "admin",
    createdAt: "2026-03-08",
  },
];

const urgensiBadge = (urgensi: string) => {
  switch (urgensi) {
    case "Mendesak":
      return <Badge variant="danger">{urgensi}</Badge>;
    case "Penting":
      return <Badge variant="warning">{urgensi}</Badge>;
    default:
      return <Badge variant="info">{urgensi}</Badge>;
  }
};

export default function DashboardPage() {
  const [agendas] = useState<Agenda[]>(demoAgendas);
  const [pengumuman] = useState<Pengumuman[]>(demoPengumuman);
  const saldo = 15750000;
  const totalInventaris = 48;

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard"
        subtitle="Selamat datang di panel pengurus masjid"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Saldo Kas Masjid"
          value={formatCurrency(saldo)}
          icon={<HiOutlineCash className="w-6 h-6" />}
          color="text-success"
        />
        <StatCard
          title="Agenda Bulan Ini"
          value={agendas.length}
          icon={<HiOutlineCalendar className="w-6 h-6" />}
          color="text-primary"
        />
        <StatCard
          title="Pengumuman Aktif"
          value={pengumuman.length}
          icon={<HiOutlineSpeakerphone className="w-6 h-6" />}
          color="text-warning"
        />
        <StatCard
          title="Total Inventaris"
          value={totalInventaris}
          icon={<HiOutlineArchive className="w-6 h-6" />}
          color="text-secondary"
        />
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agenda Terdekat */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-5">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <HiOutlineCalendar className="w-5 h-5 text-primary" />
            Agenda Terdekat
          </h2>
          <div className="space-y-3">
            {agendas.map((agenda) => (
              <div
                key={agenda.id}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {new Date(agenda.tanggal).getDate()}
                  </span>
                  <span className="text-xs text-primary">
                    {new Date(agenda.tanggal).toLocaleDateString("id-ID", {
                      month: "short",
                    })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-text-primary truncate">
                    {agenda.judul}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {agenda.waktuMulai} - {agenda.waktuSelesai} •{" "}
                    {agenda.lokasi}
                  </p>
                </div>
                <Badge variant="info">{agenda.jenisKegiatan}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Pengumuman Terbaru */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-5">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <HiOutlineSpeakerphone className="w-5 h-5 text-warning" />
            Pengumuman Terbaru
          </h2>
          <div className="space-y-3">
            {pengumuman.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h3 className="text-base font-semibold text-text-primary">
                    {item.judul}
                  </h3>
                  {urgensiBadge(item.urgensi)}
                </div>
                <p className="text-sm text-text-secondary line-clamp-2">
                  {item.deskripsi}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="neutral">{item.kategori}</Badge>
                  <span className="text-xs text-text-secondary">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
