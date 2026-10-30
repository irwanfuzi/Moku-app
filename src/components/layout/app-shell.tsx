"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import AppSidebar from "@/components/layout/app-sidebar";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/layout/bottom-navigation";

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

function getPageInformation(pathname: string): PageInformation {
  if (pageInformation[pathname]) {
    return pageInformation[pathname];
  }

  const matchingRoute = Object.keys(pageInformation)
    .filter((route) => route !== "/")
    .sort((a, b) => b.length - a.length)
    .find((route) => pathname.startsWith(`${route}/`));

  if (matchingRoute) {
    return pageInformation[matchingRoute];
  }

  return {
    title: "MOKU",
    description: "Monitoring Operasional Kunjungan Unit.",
  };
}

export default function AppShell({
  children,
}: Readonly<AppShellProps>) {
  const pathname = usePathname();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const currentPage = getPageInformation(pathname);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((previous) => !previous);
  };

  return (
    <div className="flex min-h-screen w-full bg-[#FBF9FA] text-[#29232A]">

      {/* Desktop Sidebar */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Application Area */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">

        {/* Responsive Header */}
        <AppHeader
          title={currentPage.title}
          description={currentPage.description}
        />

        {/* Page Content */}
        <main
          id="main-content"
          className="
            min-h-0
            flex-1
            px-4
            py-5
            pb-24
            sm:px-6
            sm:py-6
            sm:pb-24
            lg:px-8
            lg:py-7
            lg:pb-7
          "
        >
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>

        {/* Desktop Footer */}
        <footer className="hidden border-t border-[#EEE7EB] bg-white px-6 py-4 lg:block">
          <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3">

            <p className="text-[11px] text-[#817780]">
              © {new Date().getFullYear()} MOKU. All rights reserved.
            </p>

            <p className="text-[11px] text-[#A49AA1]">
              Track Precisely, Deliver Quality.
            </p>

          </div>
        </footer>

      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />

    </div>
  );
}
