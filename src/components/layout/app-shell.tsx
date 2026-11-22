"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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

type NavigationDirection = "forward" | "backward";

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
   NAVIGATION DIRECTION
========================================================= */

function getRouteDepth(pathname: string): number {
  return pathname.split("/").filter(Boolean).length;
}

function getNavigationDirection(
  previousPath: string,
  currentPath: string
): NavigationDirection {
  const previousDepth = getRouteDepth(previousPath);
  const currentDepth = getRouteDepth(currentPath);

  if (
    previousDepth > currentDepth &&
    previousPath.startsWith(`${currentPath}/`)
  ) {
    return "backward";
  }

  if (
    currentDepth > previousDepth &&
    currentPath.startsWith(`${previousPath}/`)
  ) {
    return "forward";
  }

  return "forward";
}

/* =========================================================
   DEVICE DETECTION
========================================================= */

function detectPWA(): boolean {
  const standalone = window.matchMedia("(display-mode: standalone)").matches;

  const iosStandalone =
    (
      window.navigator as Navigator & {
        standalone?: boolean;
      }
    ).standalone === true;

  return standalone || iosStandalone;
}

/**
 * userAgentData.mobile diprioritaskan karena browser mobile yang mengaktifkan
 * mode "Desktop site" akan melaporkan mobile = false.
 * Fallback user-agent mencakup iOS Safari dan browser lama.
 */
function detectMobileBrowserMode(): boolean {
  const userAgentData = (
    navigator as Navigator & {
      userAgentData?: { mobile?: boolean };
    }
  ).userAgentData;

  if (typeof userAgentData?.mobile === "boolean") {
    return userAgentData.mobile;
  }

  const userAgent = navigator.userAgent;

  return /iPhone|iPod|Android.*Mobile|Windows Phone|IEMobile|Opera Mini|Mobile/i.test(
    userAgent
  );
}

/**
 * Prioritas penentuan layout (berlaku untuk Web & PWA):
 * 1. URL override (?moku-layout=mobile|desktop) untuk QA.
 * 2. localStorage override (moku-layout-override) untuk testing manual.
 * 3. Mobile hanya aktif jika sisi terpendek layar <= 600px DAN bukan mode Desktop Site.
 *    - HP biasa portrait & landscape -> mobile
 *    - HP biasa + mode Desktop Site (portrait & landscape) -> desktop
 *    - HP Fold terbuka / Tablet / Laptop / PC (> 600px) -> desktop
 */
function detectLayoutMode(): {
  mode: AppLayoutMode;
  isPWA: boolean;
  source: "query-override" | "storage-override" | "device";
} {
  const isPWA = detectPWA();

  const params = new URLSearchParams(window.location.search);
  const queryOverride = params.get("moku-layout");

  if (queryOverride === "mobile" || queryOverride === "desktop") {
    return {
      mode: queryOverride,
      isPWA,
      source: "query-override",
    };
  }

  try {
    const storedOverride = window.localStorage.getItem("moku-layout-override");

    if (storedOverride === "mobile" || storedOverride === "desktop") {
      return {
        mode: storedOverride,
        isPWA,
        source: "storage-override",
      };
    }
  } catch {
    // Continue with browser & viewport detection.
  }

  const shortestSide = Math.min(window.innerWidth, window.innerHeight);
  const isPhoneSize = shortestSide <= 600;
  const isMobileBrowser = detectMobileBrowserMode();

  return {
    mode: isPhoneSize && isMobileBrowser ? "mobile" : "desktop",
    isPWA,
    source: "device",
  };
}

/**
 * QA helper:
 * window.setMokuLayoutOverride("desktop")
 * window.setMokuLayoutOverride("mobile")
 * window.setMokuLayoutOverride(null) // kembali ke deteksi otomatis
 */
declare global {
  interface Window {
    setMokuLayoutOverride?: (mode: AppLayoutMode | null) => void;
  }
}

function installLayoutOverrideHelper() {
  window.setMokuLayoutOverride = (mode) => {
    try {
      if (mode === null) {
        window.localStorage.removeItem("moku-layout-override");
      } else {
        window.localStorage.setItem("moku-layout-override", mode);
      }
    } catch {
      // Query-string override remains available if storage is restricted.
    }

    window.location.reload();
  };
}

/* =========================================================
   APP SHELL
========================================================= */

export default function AppShell({ children }: Readonly<AppShellProps>) {
  const pathname = usePathname();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const userToggledSidebarRef = useRef(false);

  const [layoutState, setLayoutState] = useState<AppLayoutContextValue>({
    mode: "mobile",
    isMobile: true,
    isDesktop: false,
    isPWA: false,
    isReady: false,
  });

  const [navigationDirection, setNavigationDirection] =
    useState<NavigationDirection>("forward");

  const previousPathRef = useRef(pathname);

  const currentPage = getPageInformation(pathname);

  /* =======================================================
     SIDEBAR
  ======================================================= */

  const handleToggleSidebar = useCallback(() => {
    userToggledSidebarRef.current = true;
    setSidebarCollapsed((previous) => !previous);
  }, []);

  /* =======================================================
     LAYOUT DETECTION
  ======================================================= */

  const updateLayout = useCallback(() => {
    const detected = detectLayoutMode();

    // Auto-collapse sidebar di layar Fold/Tablet (601px - 1023px)
    // selama user belum klik toggle manual
    if (detected.mode === "desktop" && !userToggledSidebarRef.current) {
      setSidebarCollapsed(window.innerWidth < 1024);
    }

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
    installLayoutOverrideHelper();
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

    const displayMode = window.matchMedia("(display-mode: standalone)");
    displayMode.addEventListener("change", updateLayout);

    const screenOrientation = window.screen.orientation;
    screenOrientation?.addEventListener("change", handleResize);

    return () => {
      if (resizeTimer !== undefined) {
        window.clearTimeout(resizeTimer);
      }

      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      displayMode.removeEventListener("change", updateLayout);
      screenOrientation?.removeEventListener("change", handleResize);
    };
  }, [updateLayout]);

  /* =======================================================
     PAGE TRANSITION DIRECTION
  ======================================================= */

  useEffect(() => {
    if (previousPathRef.current === pathname) {
      return;
    }

    setNavigationDirection(
      getNavigationDirection(previousPathRef.current, pathname)
    );

    previousPathRef.current = pathname;
  }, [pathname]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <AppLayoutContext.Provider value={layoutState}>
      <div
        data-layout-mode={layoutState.mode}
        data-dashboard={pathname === "/" || pathname === "/dashboard"}
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
                  ? "px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7"
                  : "p-0"
              }
            `}
          >
            <div
              key={pathname}
              data-page-transition={navigationDirection}
              className="page-transition min-h-full w-full min-w-0"
            >
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

        /* Jangan tampilkan layout default sebelum deteksi perangkat selesai. */
        .moku-app-shell[data-layout-ready="false"] {
          visibility: hidden;
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
          DESKTOP SITE + FOLD (> 600px) + TABLET + LAPTOP + DESKTOP PC
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
          width: 280px !important;
          height: 100vh !important;
          height: 100dvh !important;
          max-height: none !important;
          overflow: hidden;
          z-index: 50;
        }

        .moku-app-shell[data-layout-mode="desktop"] .moku-main-layout {
          width: calc(100% - 280px);
          margin-left: 280px;
          flex: 0 0 calc(100% - 280px);
          min-height: 100dvh;
          transition: none !important;
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
          transition: none !important;
        }

        .moku-app-shell[data-layout-mode="desktop"] .moku-desktop-footer {
          display: block !important;
        }

        .moku-app-shell[data-layout-mode="desktop"][data-dashboard="true"]
          .moku-main-layout
          > header {
          display: none !important;
        }

        .moku-app-shell[data-layout-mode="desktop"]
          .moku-mobile-navigation {
          display: none !important;
        }

        .moku-app-shell[data-layout-mode="desktop"] #main-content {
          padding: 22px clamp(18px, 1.35vw, 21px) 24px !important;
        }

        /*
          DESKTOP LARGE SCREEN
        */

        @media (min-width: 1440px) {
          .moku-app-shell[data-layout-mode="desktop"] #main-content {
            padding: 24px !important;
          }
        }

        /*
          MOBILE WEB / PWA (SHORTEST SIDE <= 600px, PORTRAIT & LANDSCAPE)
        */

        .moku-app-shell[data-layout-mode="mobile"] .moku-sidebar {
          display: none !important;
        }

        .moku-app-shell[data-layout-mode="mobile"] .moku-main-layout > header {
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

        .moku-app-shell[data-layout-mode="mobile"] .moku-mobile-navigation {
          display: block;
        }

        /*
          PAGE TRANSITIONS
        */

        .page-transition {
          min-width: 0;
        }

        [data-layout-mode="desktop"] .page-transition {
          animation: moku-desktop-enter 260ms
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes moku-desktop-enter {
          from {
            opacity: 0;
            transform: translate3d(0, 8px, 0);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        [data-layout-mode="mobile"]
          .page-transition[data-page-transition="forward"] {
          animation: moku-push-forward 340ms
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        [data-layout-mode="mobile"]
          .page-transition[data-page-transition="backward"] {
          animation: moku-push-backward 340ms
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes moku-push-forward {
          from {
            opacity: 0.85;
            transform: translate3d(42px, 0, 0);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes moku-push-backward {
          from {
            opacity: 0.85;
            transform: translate3d(-42px, 0, 0);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        /*
          REDUCED MOTION
        */

        @media (prefers-reduced-motion: reduce) {
          .page-transition {
            animation: none !important;
          }

          .moku-main-layout {
            transition: none !important;
          }
        }
      `}</style>
    </AppLayoutContext.Provider>
  );
}
