"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaksi, ProfilMasjid } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { getTransaksi } from "@/features/keuangan/keuanganService";
import {
  getProfilMasjid,
  saveProfilMasjid,
} from "@/features/settings/settingsService";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";
import Select from "@/components/ui/Select";
import {
  HiOutlineDocumentDownload,
  HiOutlineArrowLeft,
  HiOutlinePrinter,
  HiOutlineCog,
} from "react-icons/hi";

const BULAN_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function LaporanKasPage() {
  const router = useRouter();
  const { canEdit } = usePermission();
  const { data: allTransaksi = [], isLoading } = useSWR(
    "transaksi",
    getTransaksi
  );

  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());

  // Profil Masjid (nama & alamat)
  const [profil, setProfil] = useState<ProfilMasjid>({
    namaMasjid: "",
    alamat: "",
  });
  const [showSettings, setShowSettings] = useState(false);
  const [profilForm, setProfilForm] = useState<ProfilMasjid>({
    namaMasjid: "",
    alamat: "",
  });
  const [savingProfil, setSavingProfil] = useState(false);

  // Muat profil masjid dari Firestore
  useEffect(() => {
    getProfilMasjid().then((data) => {
      setProfil(data);
      setProfilForm(data);
    });
  }, []);

  // Filter transaksi berdasarkan bulan & tahun yang dipilih
  const filtered = useMemo(() => {
    return allTransaksi.filter((t: Transaksi) => {
      const d = new Date(t.tanggal);
      return d.getMonth() + 1 === bulan && d.getFullYear() === tahun;
    });
  }, [allTransaksi, bulan, tahun]);

  // Urutkan berdasarkan tanggal ascending
  const sorted = useMemo(() => {
    return [...filtered].sort(
      (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
    );
  }, [filtered]);

  // Hitung total
  const stats = useMemo(() => {
    let pemasukan = 0;
    let pengeluaran = 0;
    sorted.forEach((t) => {
      if (t.jenis === "pemasukan") pemasukan += t.nominal;
      else pengeluaran += t.nominal;
    });
    return { pemasukan, pengeluaran, saldo: pemasukan - pengeluaran };
  }, [sorted]);

  // Generate daftar tahun dari data yang ada
  const currentYear = now.getFullYear();
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);
    allTransaksi.forEach((t: Transaksi) => {
      years.add(new Date(t.tanggal).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [allTransaksi, currentYear]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleSaveProfil = async () => {
    setSavingProfil(true);
    try {
      await saveProfilMasjid(profilForm);
      setProfil(profilForm);
      setShowSettings(false);
    } catch {
      alert("Gagal menyimpan profil masjid");
    } finally {
      setSavingProfil(false);
    }
  };

  // Tanggal cetak
  const tanggalCetak = new Date().toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  const namaMasjid = profil.namaMasjid || "Masjid ___________";
  const alamatMasjid = profil.alamat || "Alamat belum diatur";
  const needsSetup = !profil.namaMasjid;

  return (
    <>
      {/* ===================== TOOLBAR (hidden saat print) ===================== */}
      <div className="print:hidden mb-6 space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 text-text-secondary transition-colors cursor-pointer"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-primary">
              Preview Laporan Kas
            </h1>
            <p className="text-sm text-text-secondary">
              Pilih periode, atur identitas masjid, lalu cetak sebagai PDF
            </p>
          </div>
        </div>

        {/* Banner: Belum atur profil masjid */}
        {needsSetup && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-amber-500 mt-0.5 text-lg">⚠</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                Nama & Alamat Masjid belum diatur
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Klik tombol ⚙ Pengaturan di bawah untuk mengisi identitas
                masjid agar laporan tampil resmi.
              </p>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-wrap items-end gap-3 bg-card rounded-xl p-4 border border-border shadow-sm">
          <div className="w-40 z-10">
            <Select
              label="Bulan"
              value={bulan.toString()}
              onChange={(e) => setBulan(Number(e.target.value))}
              options={BULAN_NAMES.map((name, i) => ({
                value: (i + 1).toString(),
                label: name,
              }))}
            />
          </div>
          <div className="w-32 z-10">
            <Select
              label="Tahun"
              value={tahun.toString()}
              onChange={(e) => setTahun(Number(e.target.value))}
              options={availableYears.map((y) => ({
                value: y.toString(),
                label: y.toString(),
              }))}
            />
          </div>

          <div className="ml-auto flex gap-2">
            {canEdit && (
              <button
                onClick={() => {
                  setProfilForm(profil);
                  setShowSettings(!showSettings);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <HiOutlineCog className="w-4 h-4" />
                Pengaturan
              </button>
            )}
            <button
              onClick={handlePrint}
              disabled={sorted.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <HiOutlinePrinter className="w-4 h-4" />
              Cetak / Download PDF
            </button>
          </div>
        </div>

        {/* Panel Pengaturan Profil Masjid */}
        {showSettings && (
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm space-y-4 animate-slideUp">
            <h3 className="text-sm font-bold text-text-primary">
              Identitas Masjid untuk Laporan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Nama Masjid
                </label>
                <input
                  type="text"
                  value={profilForm.namaMasjid}
                  onChange={(e) =>
                    setProfilForm({ ...profilForm, namaMasjid: e.target.value })
                  }
                  placeholder="Contoh: Masjid Al-Ikhlas"
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Alamat Masjid
                </label>
                <input
                  type="text"
                  value={profilForm.alamat}
                  onChange={(e) =>
                    setProfilForm({ ...profilForm, alamat: e.target.value })
                  }
                  placeholder="Contoh: Jl. Raya No. 10, Kota Bandung"
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm rounded-lg text-text-secondary hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveProfil}
                disabled={savingProfil}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
              >
                {savingProfil ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===================== ISI LAPORAN RESMI ===================== */}
      <div
        id="laporan-content"
        className="bg-white rounded-xl shadow-sm border border-border print:shadow-none print:border-none print:rounded-none"
        style={{ fontFamily: "'Helvetica Neue', Arial, Helvetica, sans-serif" }}
      >
        {/* ===== KOP / HEADER SURAT ===== */}
        <div className="px-8 pt-8 pb-5 text-center border-b-[3px] border-black print:px-0">
          <h1 className="text-[22px] font-bold tracking-wide text-black uppercase">
            {namaMasjid}
          </h1>
          <p className="text-[11px] text-gray-600 mt-1">{alamatMasjid}</p>
          <div className="mt-4 border-t border-gray-400" />
          <h2 className="text-[16px] font-bold text-black mt-4 tracking-wide uppercase">
            LAPORAN KAS MASJID
          </h2>
          <p className="text-[12px] text-gray-700 mt-1">
            Periode: {BULAN_NAMES[bulan - 1]} {tahun}
          </p>
        </div>

        {/* ===== KONTEN ===== */}
        {sorted.length === 0 ? (
          <div className="px-8 py-16 text-center print:py-20">
            <HiOutlineDocumentDownload className="w-12 h-12 text-gray-300 mx-auto mb-3 print:hidden" />
            <p className="text-gray-500 font-medium text-sm">
              Tidak ada transaksi pada periode {BULAN_NAMES[bulan - 1]} {tahun}
            </p>
            <p className="text-xs text-gray-400 mt-1 print:hidden">
              Pilih bulan atau tahun yang berbeda
            </p>
          </div>
        ) : (
          <div className="px-8 py-6 print:px-0 print:py-4">
            {/* ===== RINGKASAN KEUANGAN ===== */}
            <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden print:rounded-none print:mb-4">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                  Ringkasan Keuangan
                </h3>
              </div>
              <div className="grid grid-cols-3 divide-x divide-gray-300">
                <div className="px-4 py-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wide">
                    Total Pemasukan
                  </p>
                  <p className="text-[15px] font-bold text-green-700 mt-1">
                    + {formatCurrency(stats.pemasukan)}
                  </p>
                </div>
                <div className="px-4 py-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wide">
                    Total Pengeluaran
                  </p>
                  <p className="text-[15px] font-bold text-red-700 mt-1">
                    - {formatCurrency(stats.pengeluaran)}
                  </p>
                </div>
                <div className="px-4 py-3 text-center bg-gray-50">
                  <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wide">
                    Saldo Akhir
                  </p>
                  <p className="text-[15px] font-bold text-black mt-1">
                    {formatCurrency(stats.saldo)}
                  </p>
                </div>
              </div>
            </div>

            {/* ===== TABEL DATA ===== */}
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border-collapse border border-gray-400">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 px-2 py-2 text-center font-bold text-gray-800 w-10">
                      No
                    </th>
                    <th className="border border-gray-400 px-3 py-2 text-left font-bold text-gray-800 w-28">
                      Tanggal
                    </th>
                    <th className="border border-gray-400 px-3 py-2 text-left font-bold text-gray-800">
                      Keterangan
                    </th>
                    <th className="border border-gray-400 px-3 py-2 text-left font-bold text-gray-800 w-24">
                      Kategori
                    </th>
                    <th className="border border-gray-400 px-3 py-2 text-right font-bold text-gray-800 w-32">
                      Pemasukan (Rp)
                    </th>
                    <th className="border border-gray-400 px-3 py-2 text-right font-bold text-gray-800 w-32">
                      Pengeluaran (Rp)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((t, idx) => (
                    <tr
                      key={t.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="border border-gray-300 px-2 py-1.5 text-center text-gray-600">
                        {idx + 1}
                      </td>
                      <td className="border border-gray-300 px-3 py-1.5 text-gray-800">
                        {formatDate(t.tanggal)}
                      </td>
                      <td className="border border-gray-300 px-3 py-1.5 text-gray-800">
                        {t.keterangan}
                      </td>
                      <td className="border border-gray-300 px-3 py-1.5 text-gray-600">
                        {t.kategori}
                      </td>
                      <td className="border border-gray-300 px-3 py-1.5 text-right font-medium">
                        {t.jenis === "pemasukan" ? (
                          <span className="text-green-700">
                            + {formatCurrency(t.nominal)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-3 py-1.5 text-right font-medium">
                        {t.jenis === "pengeluaran" ? (
                          <span className="text-red-700">
                            - {formatCurrency(t.nominal)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* ===== TOTAL ROWS ===== */}
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td
                      colSpan={4}
                      className="border border-gray-400 px-3 py-2 text-right text-[11px] text-gray-800 uppercase tracking-wide"
                    >
                      Total Mutasi Bulan Ini
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-right text-green-700">
                      + {formatCurrency(stats.pemasukan)}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-right text-red-700">
                      - {formatCurrency(stats.pengeluaran)}
                    </td>
                  </tr>
                  <tr className="bg-gray-200 font-bold text-[12px]">
                    <td
                      colSpan={5}
                      className="border border-gray-400 px-3 py-2.5 text-right text-gray-900 uppercase tracking-wide"
                    >
                      Saldo Akhir Periode
                    </td>
                    <td className="border border-gray-400 px-3 py-2.5 text-right text-black text-[13px]">
                      {formatCurrency(stats.saldo)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* ===== FOOTER: TANDA TANGAN ===== */}
            <div className="mt-10 flex justify-between items-start px-4 print:mt-16">
              <div className="text-[11px] text-gray-500">
                <p>Dicetak pada: {tanggalCetak} WIB</p>
                <p className="mt-0.5 italic">
                  Dokumen ini dicetak otomatis oleh Sistem Takmir
                </p>
              </div>
              <div className="text-center text-[11px] text-gray-800">
                <p className="font-medium">Mengetahui,</p>
                <p className="font-semibold mt-0.5">Bendahara Masjid</p>
                <div className="mt-16 print:mt-20">
                  <div className="border-b border-gray-400 w-48 mx-auto" />
                  <p className="text-[10px] text-gray-500 mt-1">
                    (Nama & Tanda Tangan)
                  </p>
                </div>
              </div>
            </div>

            {/* ===== NOMOR HALAMAN (hanya muncul saat print) ===== */}
            <div className="hidden print:block text-center text-[9px] text-gray-400 mt-8 border-t border-gray-200 pt-3">
              Halaman 1 dari 1 — Laporan Kas {BULAN_NAMES[bulan - 1]} {tahun}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
