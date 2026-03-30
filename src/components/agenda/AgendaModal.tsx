import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { JENIS_KEGIATAN } from "@/constants";
import { addAgenda, updateAgenda } from "@/features/agenda/agendaService";
import { useAuth } from "@/hooks/useAuth";
import type { Agenda } from "@/types";
import React, { useEffect, useState } from "react";

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

interface AgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAgenda: Agenda | null;
  onSuccess: () => void;
}

export default function AgendaModal({
  isOpen,
  onClose,
  editingAgenda,
  onSuccess,
}: AgendaModalProps) {
  const { userData } = useAuth();
  const [formData, setFormData] = useState<Omit<Agenda, "id"> | Agenda>(emptyAgenda);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(editingAgenda ? { ...editingAgenda } : { ...emptyAgenda });
    }
  }, [isOpen, editingAgenda]);

  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingAgenda) {
        await updateAgenda(editingAgenda.id, formData);
      } else {
        await addAgenda({
          ...formData,
          createdBy: userData?.name || "Admin",
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Gagal menyimpan agenda:", error);
      alert("Gagal menyimpan agenda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
            value={formData.pemateri || ""}
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
            value={formData.deskripsi || ""}
            onChange={(e) => updateForm("deskripsi", e.target.value)}
            placeholder="Deskripsi kegiatan (opsional)"
          />
        </div>
        <div className="flex gap-3 pt-3">
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting
              ? "Menyimpan..."
              : editingAgenda
                ? "Simpan Perubahan"
                : "Tambah Agenda"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
        </div>
      </form>
    </Modal>
  );
}
