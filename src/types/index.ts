export interface User {
  id: string;
  name: string;
  email: string;
  role: "ketua" | "sekretaris" | "bendahara" | "pengurus";
  createdAt: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface Agenda {
  id: string;
  judul: string;
  jenisKegiatan: string;
  tanggal: string;
  waktuMulai: string;
  waktuSelesai: string;
  pemateri: string;
  lokasi: string;
  deskripsi: string;
  createdBy: string;
}

export interface Pengumuman {
  id: string;
  judul: string;
  deskripsi: string;
  kategori: "Informasi Umum" | "Kegiatan" | "Keuangan" | "Kerja Bakti";
  urgensi: "Informasi" | "Penting" | "Mendesak";
  createdBy: string;
  createdAt: string;
}

export interface Transaksi {
  id: string;
  tanggal: string;
  keterangan: string;
  jenis: "pemasukan" | "pengeluaran";
  kategori: string;
  nominal: number;
  createdBy: string;
}

export interface Inventaris {
  id: string;
  namaBarang: string;
  lokasi: string;
  total: number;
  tersedia: number;
  dipinjam: number;
  kondisi: string;
  createdAt: string;
}

export interface AktivitasInventaris {
  id: string;
  inventarisId: string;
  namaBarang: string;
  aksi: "dipinjam" | "dikembalikan" | "ditambah" | "rusak";
  jumlah: number;
  catatan: string;
  tanggal: string;
  oleh: string;
}
