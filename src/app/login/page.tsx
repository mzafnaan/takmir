"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { signIn } from "@/services/firebase/auth";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      console.error("Login error:", firebaseError.code, firebaseError.message);

      switch (firebaseError.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setError("Email atau password salah. Silakan coba lagi.");
          break;
        case "auth/invalid-email":
          setError("Format email tidak valid.");
          break;
        case "auth/too-many-requests":
          setError("Terlalu banyak percobaan login. Coba lagi nanti.");
          break;
        case "auth/invalid-api-key":
          setError(
            "Konfigurasi Firebase belum benar. Periksa API Key di .env.local",
          );
          break;
        case "auth/network-request-failed":
          setError(
            "Tidak dapat terhubung ke server. Periksa koneksi internet.",
          );
          break;
        default:
          setError(
            `Gagal login: ${firebaseError.code || firebaseError.message || "Terjadi kesalahan"}`,
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🕌</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary">
            Takmir Manage
          </h1>
          <p className="text-text-secondary mt-2 text-lg">
            Masuk ke panel pengurus masjid
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="contoh@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-danger text-sm">
                {error}
              </div>
            )}
            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </div>

        <p className="text-center text-text-secondary text-sm mt-6">
          © 2026 Takmir Manage. Untuk pengurus masjid.
        </p>
      </div>
    </div>
  );
}
