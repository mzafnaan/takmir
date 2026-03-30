import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { KATEGORI_PENGUMUMAN, URGENSI_PENGUMUMAN } from "@/constants";
import { addPengumuman, updatePengumuman } from "@/features/pengumuman/pengumumanService";
import { useAuth } from "@/hooks/useAuth";
import type { Pengumuman } from "@/types";
import React, { useEffect, useState } from "react";

const emptyPengumuman: Omit<Pengumuman, "id"> = {
  judul: "",
  deskripsi: "",
  kategori: "Informasi Umum",
  urgensi: "Informasi",
  createdBy: "admin",
  createdAt: new Date().toISOString().split("T")[0],
};

interface PengumumanModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: Pengumuman | null;
  onSuccess: () => void;
}

export default function PengumumanModal({
  isOpen,
  onClose,
  editingItem,
  onSuccess,
}: PengumumanModalProps) {
  const { userData } = useAuth();
  const [formData, setFormData] = useState<Omit<Pengumuman, "id"> | Pengumuman>(emptyPengumuman);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(editingItem ? { ...editingItem } : { ...emptyPengumuman });
    }
  }, [isOpen, editingItem]);

  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updatePengumuman(editingItem.id, formData);
      } else {
        await addPengumuman({
          ...formData,
          createdAt: new Date().toISOString().split("T")[0],
          createdBy: userData?.name || "Admin",
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Gagal menyimpan pengumuman:", error);
      alert("Gagal menyimpan pengumuman.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? "Edit Pengumuman" : "Buat Pengumuman"}
      subtitle={
        editingItem
          ? "Perbarui informasi pengumuman"
          : "Isi data untuk membuat pengumuman baru"
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Judul"
          placeholder="Masukkan judul pengumuman"
          value={formData.judul}
          onChange={(e) => updateForm("judul", e.target.value)}
          required
        />
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            Deskripsi
          </label>
          <textarea
            className="w-full px-4 py-3 text-base rounded-xl border border-border bg-white text-text-primary placeholder-text-secondary/70 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:shadow-sm transition-all duration-200 min-h-[120px] resize-y"
            placeholder="Tulis deskripsi pengumuman..."
            value={formData.deskripsi}
            onChange={(e) => updateForm("deskripsi", e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Kategori"
            value={formData.kategori}
            onChange={(e) => updateForm("kategori", e.target.value)}
            options={KATEGORI_PENGUMUMAN.map((k) => ({ value: k, label: k }))}
            required
          />
          <Select
            label="Urgensi"
            value={formData.urgensi}
            onChange={(e) => updateForm("urgensi", e.target.value)}
            options={URGENSI_PENGUMUMAN.map((u) => ({ value: u, label: u }))}
            required
          />
        </div>
        <div className="flex gap-3 pt-3">
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting
              ? "Menyimpan..."
              : editingItem
                ? "Simpan Perubahan"
                : "Buat Pengumuman"}
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
