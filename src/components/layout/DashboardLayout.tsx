"use client";

import { AuthProvider } from "@/hooks/useAuth";
import React from "react";
import AuthGuard from "./AuthGuard";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <Sidebar />
          <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
            <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
          <BottomNav />
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
