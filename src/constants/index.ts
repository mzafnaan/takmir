import {
  HiOutlineArchive,
  HiOutlineCalendar,
  HiOutlineCash,
  HiOutlineHome,
  HiOutlineSpeakerphone,
  HiOutlineUserGroup,
} from "react-icons/hi";

export const MENU_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: HiOutlineHome },
  { label: "Agenda", href: "/agenda", icon: HiOutlineCalendar },
  { label: "Pengumuman", href: "/pengumuman", icon: HiOutlineSpeakerphone },
  { label: "Keuangan", href: "/keuangan", icon: HiOutlineCash },
  { label: "Inventaris", href: "/inventaris", icon: HiOutlineArchive },
  { label: "Pengurus", href: "/pengurus", icon: HiOutlineUserGroup },
];

export const BOTTOM_NAV_ITEMS = MENU_ITEMS.filter(
  (item) => item.label !== "Pengurus",
);

export const KATEGORI_PENGUMUMAN = [
  "Informasi Umum",
  "Kegiatan",
  "Keuangan",
  "Kerja Bakti",
] as const;

export const URGENSI_PENGUMUMAN = ["Informasi", "Penting", "Mendesak"] as const;

export const JENIS_KEGIATAN = [
  "Kajian",
  "Rapat Takmir",
  "Kerja Bakti",
  "Santunan",
  "Kegiatan Ramadhan",
  "Lainnya",
] as const;

export const KATEGORI_PEMASUKAN = [
  "Infak",
  "Donasi",
  "Sedekah",
  "Lainnya",
] as const;

export const KATEGORI_PENGELUARAN = [
  "Listrik",
  "Air",
  "Perawatan",
  "Kegiatan",
  "Lainnya",
] as const;

export const ROLES = ["ketua", "sekretaris", "bendahara", "pengurus"] as const;

export const ROLE_LABELS: Record<string, string> = {
  ketua: "Ketua",
  sekretaris: "Sekretaris",
  bendahara: "Bendahara",
  pengurus: "Pengurus",
};

export const KONDISI_INVENTARIS = [
  "Baik",
  "Rusak Ringan",
  "Rusak Berat",
  "Perlu Perbaikan",
] as const;
