"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AppSidebar from "@/components/layout/app-sidebar";
import AppHeader from "@/components/layout/app-header";

interface AppShellProps {
  children: React.ReactNode;
}

interface PageInformation {
  title: string;
  description: string;
}

const pageInformation: Record<string, PageInformation> = {
  "/": {
    title: "Dashboard",
    description: "Ringkasan aktivitas dan monitoring kunjungan mesin.",
  },
  "/monitoring": {
    title: "Monitoring",
    description: "Pantau status kunjungan seluruh unit mesin.",
  },
  "/visits": {
    title: "Kunjungan",
    description: "Catat dan kelola aktivitas kunjungan mesin.",
  },
  "/equipment": {
    title: "Data Mesin",
    description: "Kelola informasi dan data unit mesin.",
  },
  "/customers": {
    title: "Pelanggan",
    description: "Kelola data pelanggan dan informasi terkait.",
  },
  "/visit-history": {
    title: "Riwayat Kunjungan",
    description: "Lihat catatan dan histori kunjungan mesin.",
  },
  "/reports": {
    title: "Laporan",
    description: "Analisis dan laporan aktivitas kunjungan.",
  },
  "/users": {
    title: "Pengguna",
    description: "Informasi pengguna aplikasi MOKU.",
  },
  "/notifications": {
    title: "Notifikasi",
    description: "Informasi dan pemberitahuan aktivitas aplikasi.",
  },
  "/settings": {
    title: "Pengaturan",
    description: "Atur preferensi penggunaan aplikasi.",
  },
  "/profile": {
    title: "Profil Saya",
    description: "Kelola informasi akun pengguna.",
  },
};

export default function AppShell({
  children,
}: Readonly<AppShellProps>) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const currentPage =
    pageInformation[pathname] ?? {
      title: "MOKU",
      description: "Monitoring Operasional Kunjungan Unit.",
    };

  const handleCloseMobileSidebar = () => {
    setMobileOpen(false);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed((previous) => !previous);
  };

  return (
    <div className="flex min-h-screen w-full bg-[#FBF9FA] text-[#29232A]">
      {/* Application Sidebar */}
      <AppSidebar
        mobileOpen={mobileOpen}
        onClose={handleCloseMobileSidebar}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Application Area */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Application Header */}
        <AppHeader
          title={currentPage.title}
          description={currentPage.description}
          onMenuClick={() => setMobileOpen(true)}
        />

        {/* Main Content */}
        <main
          id="main-content"
          className="min-h-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7"
        >
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#EEE7EB] bg-white px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
            <p className="text-[11px] text-[#817780]">
              © {new Date().getFullYear()} MOKU. All rights reserved.
            </p>

            <p className="text-[11px] text-[#A49AA1]">
              Track Precisely, Deliver Quality.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
