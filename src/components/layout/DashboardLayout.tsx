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
        <div className="min-h-screen bg-background print:bg-white">
          <div className="print:hidden">
            <Sidebar />
          </div>
          <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0 print:ml-0 print:pb-0">
            <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto print:px-0 print:py-0 print:max-w-full">
              {children}
            </div>
          </main>
          <div className="print:hidden">
            <BottomNav />
          </div>
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
