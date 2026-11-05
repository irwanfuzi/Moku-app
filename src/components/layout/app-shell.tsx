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

function detectPhysicalLandscape(): boolean {
  const orientationType = window.screen.orientation?.type;

  if (orientationType) {
    return orientationType.startsWith("landscape");
  }

  return window.innerWidth > window.innerHeight;
}

function detectHandheldDevice(): boolean {
  const shortestScreenSide = Math.min(
    window.screen.width,
    window.screen.height
  );

  const hasTouch =
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches;

  return hasTouch && shortestScreenSide <= 600;
}

function detectLayoutMode(): {
  mode: AppLayoutMode;
  isPWA: boolean;
} {
  const isPWA = detectPWA();
  const isHandheld = detectHandheldDevice();
  const isLandscape = detectPhysicalLandscape();

  /*
    DESKTOP / LAPTOP

    Menggunakan desktop layout.
  */

  if (!isHandheld) {
    return {
      mode: "desktop",
      isPWA,
    };
  }

  /*
    HP LANDSCAPE

    Semua perangkat HP dalam posisi horizontal
    menggunakan desktop layout.

    Berlaku untuk browser maupun PWA.
  */

  if (isLandscape) {
    return {
      mode: "desktop",
      isPWA,
    };
  }

  /*
    HP PORTRAIT

    Menggunakan mobile layout.
  */

  return {
    mode: "mobile",
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

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

    let resizeTimer: number | undefined;

    const handleResize = () => {
      if (resizeTimer !== undefined) {
        window.clearTimeout(resizeTimer);
      }

      resizeTimer = window.setTimeout(() => {
        updateLayout();
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    const displayMode = window.matchMedia(
      "(display-mode: standalone)"
    );

    displayMode.addEventListener("change", updateLayout);

    const screenOrientation = window.screen.orientation;

    screenOrientation?.addEventListener("change", handleResize);

    return () => {
      if (resizeTimer !== undefined) {
        window.clearTimeout(resizeTimer);
      }

      window.removeEventListener("resize", handleResize);

      window.removeEventListener(
        "orientationchange",
        handleResize
      );

      displayMode.removeEventListener("change", updateLayout);

      screenOrientation?.removeEventListener(
        "change",
        handleResize
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
        className="moku-app-shell min-h-dvh w-full overflow-x-clip bg-background text-foreground transition-colors duration-200"
      >
        {/* SIDEBAR */}

        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        {/* MAIN APPLICATION AREA */}

        <div className="moku-main-layout flex min-h-dvh min-w-0 flex-col">
          {/* HEADER */}

          <AppHeader
            title={currentPage.title}
            description={currentPage.description}
          />

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
            <div className="min-h-full w-full min-w-0">
              {children}
            </div>
          </main>

          {/* FOOTER */}

          <footer className="moku-desktop-footer hidden shrink-0 border-t border-border bg-surface px-6 py-4 transition-colors duration-200">
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
        /*
          BASE LAYOUT
        */

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

        /*
          DESKTOP + HP LANDSCAPE

          Satu standar layout desktop.
          Tidak ada ukuran compact khusus landscape.
        */

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
          transition:
            margin-left 250ms ease,
            width 250ms ease,
            flex-basis 250ms ease;
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

        /*
          DESKTOP LARGE SCREEN
        */

        @media (min-width: 1440px) {
          .moku-app-shell[data-layout-mode="desktop"] #main-content {
            padding: 32px !important;
          }
        }

        /*
          MOBILE PORTRAIT

          Mobile layout hanya aktif ketika
          perangkat handheld dalam posisi portrait.
        */

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
      `}</style>
    </AppLayoutContext.Provider>
  );
}
