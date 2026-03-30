"use client";

import StatCard from "@/components/cards/StatCard";
import PageHeader from "@/components/layout/PageHeader";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import React, { useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import { getAgendas } from "@/features/agenda/agendaService";
import { getLatestPengumuman } from "@/features/pengumuman/pengumumanService";
import { getTransaksi } from "@/features/keuangan/keuanganService";
import { getInventaris } from "@/features/inventaris/inventarisService";
import {
  HiOutlineArchive,
  HiOutlineCalendar,
  HiOutlineCash,
  HiOutlineSpeakerphone,
} from "react-icons/hi";

// dummy data removed

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
  const { data: agendas = [], isLoading: loadingAgendas } = useSWR("agendas", getAgendas);
  const { data: pengumuman = [], isLoading: loadingPengumuman } = useSWR("pengumuman_latest", () => getLatestPengumuman(3));
  const { data: transaksi = [], isLoading: loadingTransaksi } = useSWR("transaksi", getTransaksi);
  const { data: inventaris = [], isLoading: loadingInventaris } = useSWR("inventaris", getInventaris);

  const saldo = useMemo(() => Array.isArray(transaksi) ? transaksi.reduce((acc, t) => acc + (t.jenis === "pemasukan" ? t.nominal : -t.nominal), 0) : 0, [transaksi]);
  const totalInventaris = useMemo(() => Array.isArray(inventaris) ? inventaris.reduce((acc, i) => acc + i.total, 0) : 0, [inventaris]);
  const isLoading = loadingAgendas || loadingPengumuman || loadingTransaksi || loadingInventaris;

  return (
    <>
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
          href="/keuangan"
        />
        <StatCard
          title="Agenda Bulan Ini"
          value={agendas.length}
          icon={<HiOutlineCalendar className="w-6 h-6" />}
          color="text-primary"
          href="/agenda"
        />
        <StatCard
          title="Pengumuman Aktif"
          value={pengumuman.length}
          icon={<HiOutlineSpeakerphone className="w-6 h-6" />}
          color="text-warning"
          href="/pengumuman"
        />
        <StatCard
          title="Total Inventaris"
          value={totalInventaris}
          icon={<HiOutlineArchive className="w-6 h-6" />}
          color="text-secondary"
          href="/inventaris"
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
            {isLoading && agendas.length === 0 ? (
              <div className="text-center py-4 text-text-secondary w-full">Memuat agenda...</div>
            ) : agendas.length === 0 ? (
              <div className="text-center py-4 text-text-secondary w-full">Belum ada agenda terdekat</div>
            ) : (
              agendas.slice(0, 3).map((agenda) => (
                <Link
                  href="/agenda"
                  key={agenda.id}
                  className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden relative bg-gradient-to-b from-primary/15 to-primary/5 flex flex-col items-center justify-center">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary rounded-t-xl" />
                    <span className="text-base font-extrabold text-primary leading-none mt-0.5">
                      {new Date(agenda.tanggal).getDate()}
                    </span>
                    <span className="text-[10px] font-medium text-primary/60">
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
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Pengumuman Terbaru */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-5">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <HiOutlineSpeakerphone className="w-5 h-5 text-warning" />
            Pengumuman Terbaru
          </h2>
          <div className="space-y-3">
            {isLoading && pengumuman.length === 0 ? (
              <div className="text-center py-4 text-text-secondary w-full">Memuat pengumuman...</div>
            ) : pengumuman.length === 0 ? (
              <div className="text-center py-4 text-text-secondary w-full">Belum ada pengumuman terbaru</div>
            ) : (
              pengumuman.map((item) => (
                <Link
                  href="/pengumuman"
                  key={item.id}
                  className="block p-4 rounded-xl border border-gray-100 bg-white hover:border-primary/30 hover:shadow-sm transition-all"
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
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
