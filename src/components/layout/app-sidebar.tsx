"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  House,
  Monitor,
  Stack,
  ClipboardText,
  ChartBar,
  Gear,
  CaretLeft,
  CaretRight,
  DownloadSimple,
} from "@phosphor-icons/react";

/* =========================================================
   TYPES
========================================================= */

interface AppSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

/* =========================================================
   CONSTANTS
========================================================= */

const INSTALL_STORAGE_KEY = "moku-pwa-installed";

/* =========================================================
   NAVIGATION
========================================================= */

const navigationItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: House,
  },
  {
    label: "Monitoring",
    href: "/monitoring",
    icon: Monitor,
  },
  {
    label: "Data Mesin",
    href: "/equipment",
    icon: Stack,
  },
  {
    label: "Riwayat Kunjungan",
    href: "/visit-history",
    icon: ClipboardText,
  },
  {
    label: "Laporan",
    href: "/reports",
    icon: ChartBar,
  },
  {
    label: "Pengaturan",
    href: "/settings",
    icon: Gear,
  },
];

/* =========================================================
   SIDEBAR COMPONENT
========================================================= */

export default function AppSidebar({
  collapsed = false,
  onToggleCollapse,
}: AppSidebarProps) {
  const pathname = usePathname();

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isInstalled, setIsInstalled] = useState(false);

  const [isInstallStateReady, setIsInstallStateReady] =
    useState(false);

  /* =======================================================
     PWA DETECTION
  ======================================================= */

  const checkStandalone = useCallback(() => {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & {
        standalone?: boolean;
      }).standalone === true
    );
  }, []);

  const markAsInstalled = useCallback(() => {
    setIsInstalled(true);
    setInstallPrompt(null);

    try {
      localStorage.setItem(INSTALL_STORAGE_KEY, "true");
    } catch {
      // Storage may be unavailable.
    }
  }, []);

  /* =======================================================
     PWA INSTALL LISTENER
  ======================================================= */

  useEffect(() => {
    const checkInstalled = () => {
      const standalone = checkStandalone();

      let previouslyInstalled = false;

      try {
        previouslyInstalled =
          localStorage.getItem(INSTALL_STORAGE_KEY) === "true";
      } catch {
        // Continue without persistent storage.
      }

      if (standalone) {
        markAsInstalled();
      } else {
        setIsInstalled(previouslyInstalled);
      }

      setIsInstallStateReady(true);
    };

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();

      if (checkStandalone()) {
        markAsInstalled();
        return;
      }

      try {
        if (localStorage.getItem(INSTALL_STORAGE_KEY) === "true") {
          setIsInstalled(true);
          return;
        }
      } catch {
        // Continue with browser install prompt.
      }

      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      markAsInstalled();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === INSTALL_STORAGE_KEY) {
        setIsInstalled(event.newValue === "true");

        if (event.newValue === "true") {
          setInstallPrompt(null);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkInstalled();
      }
    };

    checkInstalled();

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstall
    );

    window.addEventListener("appinstalled", handleInstalled);
    window.addEventListener("storage", handleStorage);

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    const displayMode = window.matchMedia(
      "(display-mode: standalone)"
    );

    displayMode.addEventListener("change", checkInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstall
      );

      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("storage", handleStorage);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      displayMode.removeEventListener("change", checkInstalled);
    };
  }, [checkStandalone, markAsInstalled]);

  /* =======================================================
     INSTALL ACTION
  ======================================================= */

  const handleInstall = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();

      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        markAsInstalled();
      }

      setInstallPrompt(null);
    } catch (error) {
      console.error("MOKU installation error:", error);
    }
  };

  /* =======================================================
     ACTIVE NAVIGATION
  ======================================================= */

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const showInstallButton =
    isInstallStateReady && !isInstalled;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <aside
        className={`
          moku-sidebar
          fixed left-0 top-0 bottom-0 z-40
          hidden h-screen h-dvh
          min-h-0 shrink-0
          flex-col overflow-hidden
          bg-[#730217]
          transition-[width] duration-300 ease-in-out
          motion-reduce:transition-none
          lg:flex
          ${collapsed ? "w-[72px]" : "w-[240px]"}
        `}
        aria-label="Navigasi utama"
        data-collapsed={collapsed}
      >
        {/* BACKGROUND DECORATION */}

        <div
          className="moku-sidebar-decoration"
          aria-hidden="true"
        >
          <div className="moku-wave moku-wave-one" />
          <div className="moku-wave moku-wave-two" />
          <div className="moku-wave moku-wave-three" />
        </div>

        {/* BRAND */}

        <div
          className={`
            moku-sidebar-brand
            relative z-10 flex h-[132px] shrink-0
            flex-col items-center justify-center
            border-b border-white/10
            ${collapsed ? "px-2" : "px-4"}
          `}
        >
          <Link
            href="/"
            className="flex flex-col items-center justify-center"
            aria-label="MOKU Dashboard"
          >
            {collapsed ? (
              <Image
                src="/images/moku/brand/app-icon.png"
                alt="MOKU"
                width={46}
                height={46}
                priority
                className="h-[46px] w-[46px] object-contain"
              />
            ) : (
              <>
                <Image
                  src="/images/moku/brand/logo-dark.png"
                  alt="MOKU"
                  width={180}
                  height={58}
                  priority
                  className="h-auto max-h-[58px] w-auto max-w-[180px] object-contain"
                />

                <span className="mt-1 text-center text-[12px] font-medium leading-[18px] !text-white">
                  Monitoring Operasional
                  <br />
                  Kunjungan Unit
                </span>
              </>
            )}
          </Link>
        </div>

        {/* NAVIGATION */}

        <nav
          className="moku-sidebar-scroll relative z-10 min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
          aria-label="Menu navigasi"
        >
          <div
            className={`
              moku-sidebar-navigation
              ${collapsed ? "px-2 py-5" : "px-[18px] py-6"}
            `}
          >
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={`
                      moku-sidebar-link
                      group relative flex h-[60px]
                      items-center justify-start gap-4
                      rounded-[14px]
                      px-4
                      !text-white
                      text-left
                      transition-all duration-200
                      motion-reduce:transition-none
                      ${
                        active
                          ? "bg-[#BF0B2C] shadow-[inset_3px_0_0_#F28C0F]"
                          : "bg-transparent hover:bg-white/10"
                      }
                      ${collapsed ? "justify-center px-0" : ""}
                    `}
                  >
                    <Icon
                      size={29}
                      weight={active ? "fill" : "regular"}
                      className="shrink-0 !text-white transition-transform duration-200"
                    />

                    {!collapsed && (
                      <span
                        className={`
                          block min-w-0 flex-1
                          truncate text-left text-[15px]
                          !text-white
                          ${
                            active
                              ? "font-semibold"
                              : "font-medium"
                          }
                        `}
                      >
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* FOOTER / INSTALL */}

        <div className="moku-sidebar-footer relative z-10 shrink-0 p-[18px]">
          {showInstallButton && (
            <button
              type="button"
              onClick={handleInstall}
              disabled={!installPrompt}
              title={
                collapsed
                  ? "Install MOKU"
                  : installPrompt
                    ? "Install MOKU"
                    : "Install MOKU belum tersedia di browser ini"
              }
              aria-label="Install MOKU"
              className={`
                group flex min-h-[76px] w-full
                items-center gap-3
                rounded-[17px]
                border-2 border-white/70
                bg-white/[0.04]
                px-3 py-3
                text-left !text-white
                transition-all duration-200
                ${
                  installPrompt
                    ? "cursor-pointer hover:border-[#F28C0F] hover:bg-white/10 active:scale-[0.98]"
                    : "cursor-default"
                }
                motion-reduce:transition-none
                ${collapsed ? "min-h-[60px] justify-center px-1" : ""}
              `}
            >
              {collapsed ? (
                <DownloadSimple
                  size={25}
                  weight="bold"
                  className="shrink-0 !text-[#F28C0F]"
                />
              ) : (
                <>
                  <Image
                    src="/images/moku/brand/app-icon.png"
                    alt="Maskot MOKU"
                    width={52}
                    height={52}
                    className="h-[52px] w-[52px] shrink-0 object-contain"
                  />

                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-left text-[15px] font-semibold leading-6 !text-white">
                      Install MOKU
                    </span>

                    <span className="block text-left text-[12px] leading-5 !text-white/85">
                      Web / Desktop
                    </span>
                  </span>

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#BF0B2C]">
                    <DownloadSimple
                      size={23}
                      weight="bold"
                      className="!text-white"
                    />
                  </span>
                </>
              )}
            </button>
          )}

          {/* COLLAPSE BUTTON */}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`
                mx-auto mt-3 flex h-8 w-8
                items-center justify-center
                rounded-full !text-white/75
                transition-colors duration-200
                hover:bg-white/10 hover:!text-white
                active:scale-95
                motion-reduce:transition-none
              `}
              aria-label={
                collapsed ? "Perluas sidebar" : "Perkecil sidebar"
              }
              title={
                collapsed ? "Perluas sidebar" : "Perkecil sidebar"
              }
            >
              {collapsed ? (
                <CaretRight size={20} weight="bold" />
              ) : (
                <CaretLeft size={20} weight="bold" />
              )}
            </button>
          )}
        </div>
      </aside>

      {/* ===================================================
          SIDEBAR STYLES
      =================================================== */}

      <style jsx global>{`
        .moku-sidebar {
          position: fixed !important;
          top: 0 !important;
          bottom: 0 !important;
          left: 0 !important;

          height: 100vh !important;
          height: 100dvh !important;

          min-height: 0 !important;
          max-height: 100vh !important;
          max-height: 100dvh !important;

          display: none;
          flex-direction: column;

          overflow: hidden !important;
          box-sizing: border-box;
          isolation: isolate;
        }

        @media (min-width: 1024px) {
          .moku-sidebar {
            display: flex;
          }
        }

        /*
          BACKGROUND WAVES
        */

        .moku-sidebar-decoration {
          position: absolute;
          inset: 0;
          z-index: -1;
          overflow: hidden;
          pointer-events: none;
        }

        .moku-wave {
          position: absolute;
          left: -25%;
          width: 150%;
          border-radius: 50%;
          transform: rotate(-8deg);
        }

        .moku-wave-one {
          bottom: -90px;
          height: 290px;
          background: rgba(191, 11, 44, 0.32);
        }

        .moku-wave-two {
          bottom: -145px;
          height: 260px;
          background: rgba(235, 85, 19, 0.13);
          transform: rotate(8deg);
        }

        .moku-wave-three {
          bottom: -195px;
          height: 270px;
          background: rgba(85, 0, 18, 0.32);
          transform: rotate(-5deg);
        }

        /*
          BRAND
        */

        .moku-sidebar-brand {
          flex: 0 0 auto !important;
        }

        /*
          NAVIGATION SCROLL
        */

        .moku-sidebar-scroll {
          min-height: 0 !important;
          flex: 1 1 auto !important;

          overflow-x: hidden !important;
          overflow-y: auto !important;

          scrollbar-width: none !important;
          -ms-overflow-style: none !important;

          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }

        .moku-sidebar-scroll::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        /*
          FORCE WHITE SIDEBAR TEXT AND ICONS
        */

        .moku-sidebar .moku-sidebar-link,
        .moku-sidebar .moku-sidebar-link span,
        .moku-sidebar .moku-sidebar-link svg,
        .moku-sidebar .moku-sidebar-brand span,
        .moku-sidebar .moku-sidebar-footer,
        .moku-sidebar .moku-sidebar-footer span,
        .moku-sidebar .moku-sidebar-footer svg {
          color: #ffffff !important;
        }

        .moku-sidebar .moku-sidebar-link {
          text-align: left !important;
          justify-content: flex-start;
        }

        .moku-sidebar .moku-sidebar-link span {
          text-align: left !important;
        }

        .moku-sidebar .moku-sidebar-link svg {
          stroke: #ffffff !important;
        }

        .moku-sidebar .moku-sidebar-footer button {
          color: #ffffff !important;
        }

        .moku-sidebar .moku-sidebar-footer button:disabled {
          color: #ffffff !important;
        }

        /*
          NAVIGATION LINKS
        */

        .moku-sidebar-link {
          text-decoration: none !important;
          outline-offset: 3px;
        }

        .moku-sidebar-link:focus-visible {
          outline: 2px solid #F28C0F;
        }

        /*
          FOOTER
        */

        .moku-sidebar-footer {
          position: relative;
          z-index: 2;
          flex: 0 0 auto !important;
          padding-bottom: max(18px, env(safe-area-inset-bottom));
        }

        /*
          COLLAPSED SIDEBAR
        */

        .moku-sidebar[data-collapsed="true"] .moku-sidebar-brand {
          height: 100px !important;
        }

        .moku-sidebar[data-collapsed="true"] .moku-sidebar-navigation {
          padding-top: 20px;
          padding-bottom: 20px;
        }

        .moku-sidebar[data-collapsed="true"] .moku-sidebar-link {
          justify-content: center !important;
        }

        /*
          MOBILE PORTRAIT
        */

        @media (orientation: portrait) {
          .moku-sidebar {
            display: none !important;
          }
        }

        /*
          REDUCED MOTION
        */

        @media (prefers-reduced-motion: reduce) {
          .moku-sidebar,
          .moku-sidebar * {
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
}
