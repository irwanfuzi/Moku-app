import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { useIonRouter } from "@ionic/react";

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
  navigateWithTransition: (
    href: string,
    direction?: "forward" | "backward"
  ) => void;
  backWithTransition: (fallbackHref?: string) => void;
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
  navigateWithTransition: () => {},
  backWithTransition: () => {},
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
   SUBPAGE & DEVICE DETECTION
========================================================= */

const MOBILE_SUBPAGE_PREFIXES = ["/notifications"];

function isMobileSubpage(pathname: string): boolean {
  return MOBILE_SUBPAGE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function detectPWA(): boolean {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches;

  const iosStandalone =
    (
      window.navigator as Navigator & {
        standalone?: boolean;
      }
    ).standalone === true;

  return standalone || iosStandalone;
}

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
  const location = useLocation();
  const pathname = location.pathname;
  const ionRouter = useIonRouter();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const userToggledSidebarRef = useRef(false);

  const [layoutMeta, setLayoutMeta] = useState<{
    mode: AppLayoutMode;
    isMobile: boolean;
    isDesktop: boolean;
    isPWA: boolean;
    isReady: boolean;
  }>({
    mode: "mobile",
    isMobile: true,
    isDesktop: false,
    isPWA: false,
    isReady: false,
  });

  const currentPage = getPageInformation(pathname);

  const navigateWithTransition = useCallback(
    (href: string, direction: "forward" | "backward" = "forward") => {
      if (href === pathname) return;
      ionRouter.push(
        href,
        direction === "backward" ? "back" : "forward",
        "push"
      );
    },
    [pathname, ionRouter]
  );

  const backWithTransition = useCallback(
    (fallbackHref = "/") => {
      if (ionRouter.canGoBack()) {
        ionRouter.goBack();
      } else {
        ionRouter.push(fallbackHref, "back", "replace");
      }
    },
    [ionRouter]
  );

  const handleToggleSidebar = useCallback(() => {
    userToggledSidebarRef.current = true;
    setSidebarCollapsed((previous) => !previous);
  }, []);

  const updateLayout = useCallback(() => {
    const detected = detectLayoutMode();

    if (detected.mode === "desktop" && !userToggledSidebarRef.current) {
      setSidebarCollapsed(window.innerWidth < 1024);
    }

    setLayoutMeta((previous) => {
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

  const isMobileMode = layoutMeta.mode === "mobile";
  const hideMobileBottomNav = isMobileMode && isMobileSubpage(pathname);

  const contextValue: AppLayoutContextValue = {
    ...layoutMeta,
    navigateWithTransition,
    backWithTransition,
  };

  return (
    <AppLayoutContext.Provider value={contextValue}>
      <div
        data-layout-mode={layoutMeta.mode}
        data-dashboard={pathname === "/" || pathname === "/dashboard"}
        data-layout-ready={layoutMeta.isReady}
        data-pwa={layoutMeta.isPWA}
        data-sidebar-collapsed={sidebarCollapsed}
        className={`moku-app-shell min-h-dvh w-full overflow-x-clip text-foreground ${
          isMobileMode ? "bg-[#F8F8FA]" : "bg-background"
        }`}
      >
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        <div className="moku-main-layout flex min-h-dvh min-w-0 flex-col">
          <AppHeader
            title={currentPage.title}
            description={currentPage.description}
          />

          <main
            id="main-content"
            className={`
              relative min-h-0 w-full min-w-0 flex-1 overflow-x-clip
              ${
                layoutMeta.mode === "desktop"
                  ? "bg-background px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7"
                  : "bg-[#F8F8FA] p-0"
              }
            `}
          >
            {children}
          </main>

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

        {!hideMobileBottomNav && (
          <div className="moku-mobile-navigation">
            <BottomNavigation />
          </div>
        )}

        {/* Penutup area safe-area bawah agar warna marun manifest tidak tembus di Android edge-to-edge */}
        {isMobileMode && (
          <div
            aria-hidden="true"
            className={`pointer-events-none fixed inset-x-0 bottom-0 z-30 h-[env(safe-area-inset-bottom)] ${
              hideMobileBottomNav ? "bg-[#F8F8FA]" : "bg-white"
            }`}
          />
        )}
      </div>
    </AppLayoutContext.Provider>
  );
}
