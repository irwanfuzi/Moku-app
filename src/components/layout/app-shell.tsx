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

  // Navigasi dari halaman detail ke halaman induk.
  if (
    previousDepth > currentDepth &&
    previousPath.startsWith(`${currentPath}/`)
  ) {
    return "backward";
  }

  // Navigasi menuju halaman detail.
  if (
    currentDepth > previousDepth &&
    currentPath.startsWith(`${previousPath}/`)
  ) {
    return "forward";
  }

  // Navigasi antarhalaman dengan kedalaman yang sama.
  return "forward";
}

/* =========================================================
   DEVICE DETECTION
========================================================= */

function detectPWA(): boolean {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches;

  const iosStandalone = (
    window.navigator as Navigator & { standalone?: boolean }
  ).standalone === true;

  return standalone || iosStandalone;
}

function detectPhysicalLandscape(): boolean {
  const orientation = window.screen.orientation;

  if (orientation?.type) {
    return orientation.type.startsWith("landscape");
  }

  if (typeof window.screen.orientation?.angle === "number") {
    return Math.abs(window.screen.orientation.angle) % 180 === 90;
  }

  return window.screen.width > window.screen.height;
}

function detectHandheldDevice(): boolean {
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;

  const shortestScreenSide = Math.min(
    screenWidth,
    screenHeight
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

  if (!isHandheld) {
    return {
      mode: "desktop",
      isPWA,
    };
  }

  if (isPWA) {
    return {
      mode: "mobile",
      isPWA: true,
    };
  }

  return {
    mode: isLandscape ? "desktop" : "mobile",
    isPWA: false,
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

  const [navigationDirection, setNavigationDirection] =
    useState<NavigationDirection>("forward");

  const previousPathRef = useRef(pathname);

  const currentPage = getPageInformation(pathname);

  /* =======================================================
     SIDEBAR
  ======================================================= */

  const handleToggleSidebar = () => {
    setSidebarCollapsed((previous) => !previous);
  };

  /* =======================================================
     LAYOUT DETECTION
  ======================================================= */

  const updateLayout = useCallback(() => {
    const detected = detectLayoutMode();

    setLayoutState({
      mode: detected.mode,
      isMobile: detected.mode === "mobile",
      isDesktop: detected.mode === "desktop",
      isPWA: detected.isPWA,
      isReady: true,
    });
  }, []);

  useEffect(() => {
    updateLayout();

    const handleResize = () => {
      updateLayout();
    };

    const handleOrientationChange = () => {
      updateLayout();
    };

    const handleDisplayModeChange = () => {
      updateLayout();
    };

    window.addEventListener("resize", handleResize);

    window.addEventListener(
      "orientationchange",
      handleOrientationChange
    );

    const displayMode = window.matchMedia(
      "(display-mode: standalone)"
    );

    displayMode.addEventListener(
      "change",
      handleDisplayModeChange
    );

    const screenOrientation = window.screen.orientation;

    screenOrientation?.addEventListener(
      "change",
      handleOrientationChange
    );

    return () => {
      window.removeEventListener("resize", handleResize);

      window.removeEventListener(
        "orientationchange",
        handleOrientationChange
      );

      displayMode.removeEventListener(
        "change",
        handleDisplayModeChange
      );

      screenOrientation?.removeEventListener(
        "change",
        handleOrientationChange
      );
    };
  }, [updateLayout]);

  /* =======================================================
     PAGE TRANSITION
  ======================================================= */

  useEffect(() => {
    if (previousPathRef.current === pathname) {
      return;
    }

    const direction = getNavigationDirection(
      previousPathRef.current,
      pathname
    );

    setNavigationDirection(direction);

    previousPathRef.current = pathname;
  }, [pathname]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <AppLayoutContext.Provider value={layoutState}>
      <div
        data-layout-mode={layoutState.mode}
        data-layout-ready={layoutState.isReady}
        data-pwa={layoutState.isPWA}
        className="
          flex min-h-screen w-full
          overflow-x-hidden
          bg-background
          text-foreground
          transition-colors duration-200
        "
      >
        {/* DESKTOP SIDEBAR */}

        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        {/* MAIN APPLICATION AREA */}

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">

          {/* RESPONSIVE HEADER */}

          <AppHeader
            title={currentPage.title}
            description={currentPage.description}
          />

          {/* PAGE CONTENT */}

          <main
            id="main-content"
            className="
              relative
              min-h-0
              w-full
              min-w-0
              flex-1
              overflow-x-hidden
              bg-background
            "
          >
            <div
              key={pathname}
              data-page-transition={navigationDirection}
              className={`
                page-transition
                page-transition-${navigationDirection}
                min-h-full
                w-full
                min-w-0
              `}
            >
              {children}
            </div>
          </main>

          {/* DESKTOP FOOTER */}

          <footer
            className="
              hidden
              shrink-0
              border-t
              border-border
              bg-surface
              px-6
              py-4
              transition-colors
              duration-200
              lg:block
            "
          >
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

        {/* MOBILE BOTTOM NAVIGATION */}

        <BottomNavigation />

      </div>

      {/* ===================================================
          GLOBAL PAGE TRANSITION
      =================================================== */}

      <style jsx global>{`
        .page-transition {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          will-change: transform, opacity;
        }

        /* FORWARD: PUSH FROM RIGHT */

        .page-transition-forward {
          animation: moku-push-forward 280ms
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* BACKWARD: PUSH FROM LEFT */

        .page-transition-backward {
          animation: moku-push-backward 280ms
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes moku-push-forward {
          0% {
            opacity: 0.82;
            transform: translate3d(38px, 0, 0);
          }

          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes moku-push-backward {
          0% {
            opacity: 0.82;
            transform: translate3d(-38px, 0, 0);
          }

          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .page-transition-forward,
          .page-transition-backward {
            animation: none !important;
          }
        }
      `}</style>
    </AppLayoutContext.Provider>
  );
}
