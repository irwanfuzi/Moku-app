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

  if (
    typeof window.screen.orientation?.angle === "number"
  ) {
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

  // PWA selalu menggunakan layout mobile,
  // termasuk ketika perangkat berada dalam posisi landscape.
  if (isPWA) {
    return {
      mode: "mobile",
      isPWA: true,
    };
  }

  // Browser HP:
  // Portrait  = Mobile
  // Landscape = Desktop
  return {
    mode: isLandscape ? "desktop" : "mobile",
    isPWA: false,
  };
}

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

  const handleToggleSidebar = () => {
    setSidebarCollapsed((previous) => !previous);
  };

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

  return (
    <AppLayoutContext.Provider value={layoutState}>
      <div
        data-layout-mode={layoutState.mode}
        data-layout-ready={layoutState.isReady}
        data-pwa={layoutState.isPWA}
        className="
          flex min-h-screen w-full
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
              min-h-0
              flex-1
              bg-background
              px-4
              py-5
              pb-24
              transition-colors
              duration-200
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

          {/* DESKTOP FOOTER */}
          <footer
            className="
              hidden
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
    </AppLayoutContext.Provider>
  );
}
