"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import AppSidebar from "@/components/layout/app-sidebar";
import AppHeader from "@/components/layout/app-header";
import BottomNavigation from "@/components/layout/bottom-navigation";

/* =========================================================
   TYPES
========================================================= */

interface AppShellProps {
  children: React.ReactNode;
}

interface PageInformation {
  title: string;
  description: string;
}

export type AppLayoutMode = "mobile" | "desktop";

interface AppLayoutContextValue {
  mode: AppLayoutMode;
  isMobile: boolean;
  isDesktop: boolean;
  isPWA: boolean;
  isReady: boolean;
}

/* =========================================================
   APP LAYOUT CONTEXT
========================================================= */

const AppLayoutContext = createContext<AppLayoutContextValue>({
  mode: "mobile",
  isMobile: true,
  isDesktop: false,
  isPWA: false,
  isReady: false,
});

export function useAppLayout() {
  return useContext(AppLayoutContext);
}

/* =========================================================
   PAGE INFORMATION
========================================================= */

const pageInformation: Record<string, PageInformation> = {
  "/": {
    title: "Dashboard",
    description: "Ringkasan aktivitas dan monitoring kunjungan mesin.",
  },
  "/dashboard": {
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

/* =========================================================
   DEVICE DETECTION
========================================================= */

function detectPWA(): boolean {
  const standalone = window.matchMedia(
    "(display-mode: standalone)"
  ).matches;

  const iosStandalone = (
    window.navigator as Navigator & {
      standalone?: boolean;
    }
  ).standalone === true;

  return standalone || iosStandalone;
}

function detectMobileUserAgent(): boolean {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(
    navigator.userAgent
  );
}

function detectHandheldDevice(): boolean {
  const shortestScreenSide = Math.min(
    window.screen.width,
    window.screen.height
  );

  return (
    detectMobileUserAgent() &&
    shortestScreenSide <= 600
  );
}

function detectLayoutMode(): {
  mode: AppLayoutMode;
  isPWA: boolean;
} {
  const isPWA = detectPWA();
  const isHandheld = detectHandheldDevice();

  if (isHandheld) {
    return {
      mode: "mobile",
      isPWA,
    };
  }

  return {
    mode: "desktop",
    isPWA,
  };
}

/* =========================================================
   APP SHELL
========================================================= */

export default function AppShell({
  children,
}: Readonly<AppShellProps>) {
  const pathname = usePathname();

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [layoutState, setLayoutState] =
    useState<AppLayoutContextValue>({
      mode: "mobile",
      isMobile: true,
      isDesktop: false,
      isPWA: false,
      isReady: false,
    });

  const currentPage = getPageInformation(pathname);

  /* =======================================================
     SIDEBAR
  ======================================================= */

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed((previous) => !previous);
  }, []);

  /* =======================================================
     LAYOUT DETECTION
  ======================================================= */

  const updateLayout = useCallback(() => {
    const detected = detectLayoutMode();

    setLayoutState((previous) => {
      if (
        previous.mode === detected.mode &&
        previous.isPWA === detected.isPWA &&
        previous.isReady
      ) {
        return previous;
      }

      return {
        mode: detected.mode,
        isMobile: detected.mode === "mobile",
        isDesktop: detected.mode === "desktop",
        isPWA: detected.isPWA,
        isReady: true,
      };
    });
  }, []);

  useEffect(() => {
    updateLayout();

    const handleViewportChange = () => {
      updateLayout();
    };

    window.addEventListener(
      "resize",
      handleViewportChange
    );

    window.addEventListener(
      "orientationchange",
      handleViewportChange
    );

    window.visualViewport?.addEventListener(
      "resize",
      handleViewportChange
    );

    const displayMode = window.matchMedia(
      "(display-mode: standalone)"
    );

    displayMode.addEventListener(
      "change",
      handleViewportChange
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleViewportChange
      );

      window.removeEventListener(
        "orientationchange",
        handleViewportChange
      );

      window.visualViewport?.removeEventListener(
        "resize",
        handleViewportChange
      );

      displayMode.removeEventListener(
        "change",
        handleViewportChange
      );
    };
  }, [updateLayout]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <AppLayoutContext.Provider value={layoutState}>
      <div
        data-layout-mode={layoutState.mode}
        data-layout-ready={layoutState.isReady}
        data-pwa={layoutState.isPWA}
        data-sidebar-collapsed={sidebarCollapsed}
        className="moku-app-shell min-h-dvh w-full overflow-x-clip bg-background text-foreground"
      >
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        <div className="moku-main-layout flex min-h-dvh min-w-0 flex-col">

          {/* DESKTOP HEADER */}

          {layoutState.isReady && layoutState.isDesktop && (
            <AppHeader
              title={currentPage.title}
              description={currentPage.description}
            />
          )}

          {/* PAGE CONTENT */}

          <main
            id="main-content"
            className={`
              relative min-h-0 w-full min-w-0 flex-1
              overflow-x-clip bg-background
              ${
                layoutState.mode === "desktop"
                  ? "px-4 py-5 pb-24 sm:px-6 sm:py-6 sm:pb-24 lg:px-8 lg:py-7 lg:pb-7"
                  : "p-0"
              }
            `}
          >
            <div
              key={pathname}
              className="moku-page-transition min-h-full w-full min-w-0"
            >
              {children}
            </div>
          </main>

          {/* DESKTOP FOOTER */}

          <footer className="moku-desktop-footer hidden shrink-0 border-t border-border bg-surface px-6 py-4">
            <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3">
              <p className="text-[11px] text-muted">
                © {new Date().getFullYear()} MOKU. All rights reserved.
              </p>

              <p className="text-[11px] text-muted">
                Track Precisely, Deliver Quality.
              </p>
            </div>
          </footer>
        </div>

        {/* MOBILE NAVIGATION */}

        <div className="moku-mobile-navigation">
          <BottomNavigation />
        </div>
      </div>

      {/* ===================================================
          RESPONSIVE MASTER LAYOUT
      =================================================== */}

      <style jsx global>{`
        /* PAGE TRANSITION */

        @keyframes moku-page-enter {
          from {
            opacity: 0.72;
            transform: translateY(4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .moku-page-transition {
          animation: moku-page-enter 200ms
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .moku-page-transition {
            animation: none !important;
          }
        }

        /* BASE LAYOUT */

        .moku-app-shell {
          position: relative;
          min-height: 100dvh;
          width: 100%;
        }

        .moku-main-layout {
          position: relative;
          min-width: 0;
          width: 100%;
          margin-left: 0;
          min-height: 100dvh;
          box-sizing: border-box;
        }

        /* DESKTOP */

        .moku-app-shell[data-layout-mode="desktop"] {
          min-height: 100dvh;
        }

        .moku-app-shell[data-layout-mode="desktop"] .moku-sidebar {
          display: flex !important;
          position: fixed !important;
          top: 0 !important;
          bottom: 0 !important;
          left: 0 !important;
          width: 240px !important;
          height: 100vh !important;
          height: 100dvh !important;
          max-height: none !important;
          overflow: hidden;
          z-index: 50;
        }

        .moku-app-shell[data-layout-mode="desktop"] .moku-main-layout {
          width: calc(100% - 240px);
          margin-left: 240px;
          flex: 0 0 calc(100% - 240px);
          min-height: 100dvh;
        }

        .moku-app-shell[data-layout-mode="desktop"][data-sidebar-collapsed="true"]
          .moku-sidebar {
          width: 72px !important;
        }

        .moku-app-shell[data-layout-mode="desktop"][data-sidebar-collapsed="true"]
          .moku-main-layout {
          width: calc(100% - 72px);
          margin-left: 72px;
          flex-basis: calc(100% - 72px);
        }

        .moku-app-shell[data-layout-mode="desktop"] .moku-desktop-footer {
          display: block !important;
        }

        .moku-app-shell[data-layout-mode="desktop"]
          .moku-mobile-navigation {
          display: none !important;
        }

        .moku-app-shell[data-layout-mode="desktop"] #main-content {
          padding: 28px 24px 28px !important;
        }

        @media (min-width: 1440px) {
          .moku-app-shell[data-layout-mode="desktop"] #main-content {
            padding: 32px !important;
          }
        }

        /* MOBILE */

        .moku-app-shell[data-layout-mode="mobile"] {
          width: 100%;
          min-height: 100dvh;
          overflow-x: clip;
        }

        .moku-app-shell[data-layout-mode="mobile"] .moku-sidebar {
          display: none !important;
        }

        .moku-app-shell[data-layout-mode="mobile"] .moku-main-layout {
          width: 100% !important;
          margin-left: 0 !important;
          flex-basis: 100% !important;
          min-height: 100dvh;
        }

        .moku-app-shell[data-layout-mode="mobile"] .moku-desktop-footer {
          display: none !important;
        }

        .moku-app-shell[data-layout-mode="mobile"]
          .moku-mobile-navigation {
          display: block;
        }

        .moku-app-shell[data-layout-mode="mobile"] #main-content {
          width: 100%;
          min-width: 0;
          padding: 0 !important;
          overflow-x: clip;
        }

        /* MOBILE LANDSCAPE */

        @media (orientation: landscape) {
          .moku-app-shell[data-layout-mode="mobile"] {
            width: 100%;
            min-width: 0;
          }

          .moku-app-shell[data-layout-mode="mobile"] .moku-main-layout {
            width: 100% !important;
            margin-left: 0 !important;
            flex-basis: 100% !important;
          }

          .moku-app-shell[data-layout-mode="mobile"] #main-content {
            width: 100%;
            min-width: 0;
            padding: 0 !important;
          }
        }
      `}</style>
    </AppLayoutContext.Provider>
  );
}
