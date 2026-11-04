"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  House,
  Monitor,
  ClipboardText,
  Desktop,
  Buildings,
  ClockCounterClockwise,
  Users,
  ChartBar,
  Bell,
  Gear,
  UserCircle,
  CaretLeft,
  CaretRight,
  DownloadSimple,
} from "@phosphor-icons/react";

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

const INSTALL_STORAGE_KEY = "moku-pwa-installed";

const navigationGroups = [
  {
    title: "Ringkasan",
    items: [
      { label: "Dashboard", href: "/", icon: House },
      { label: "Monitoring", href: "/monitoring", icon: Monitor },
    ],
  },
  {
    title: "Operasional",
    items: [
      { label: "Kunjungan", href: "/visits", icon: ClipboardText },
      { label: "Data Mesin", href: "/equipment", icon: Desktop },
      { label: "Pelanggan", href: "/customers", icon: Buildings },
      {
        label: "Riwayat Kunjungan",
        href: "/visit-history",
        icon: ClockCounterClockwise,
      },
    ],
  },
  {
    title: "Analisis",
    items: [
      { label: "Laporan", href: "/reports", icon: ChartBar },
    ],
  },
  {
    title: "Preferensi",
    items: [
      { label: "Pengguna", href: "/users", icon: Users },
      { label: "Notifikasi", href: "/notifications", icon: Bell },
      { label: "Pengaturan", href: "/settings", icon: Gear },
    ],
  },
];

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

  const checkStandalone = useCallback(() => {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean })
        .standalone === true
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
     PWA INSTALL DETECTION
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

      window.removeEventListener(
        "appinstalled",
        handleInstalled
      );

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

  return (
    <>
      <aside
        className={`
          moku-sidebar
          fixed inset-y-0 left-0 z-40
          hidden h-dvh shrink-0
          flex-col overflow-hidden
          border-r border-white/10
          bg-[#6F010E]
          transition-[width] duration-300 ease-in-out
          motion-reduce:transition-none
          lg:flex
          ${collapsed ? "w-[72px]" : "w-[240px]"}
        `}
        aria-label="Navigasi utama"
        data-collapsed={collapsed}
      >
        {/* BRAND */}

        <div
          className={`
            moku-sidebar-brand
            flex h-[76px] shrink-0 items-center
            border-b border-white/10
            ${collapsed ? "justify-center px-2" : "px-4"}
          `}
        >
          <Link
            href="/"
            className="flex min-w-0 items-center justify-center"
            aria-label="MOKU Dashboard"
          >
            {collapsed ? (
              <Image
                src="/images/moku/brand/app-icon.png"
                alt="MOKU"
                width={43}
                height={43}
                priority
                className="h-[43px] w-[43px] object-contain transition-transform duration-200 hover:scale-105"
              />
            ) : (
              <Image
                src="/images/moku/brand/logo-dark.png"
                alt="MOKU"
                width={180}
                height={56}
                priority
                className="h-auto max-h-12 w-auto max-w-[180px] object-contain object-left transition-transform duration-200 hover:scale-[1.02]"
              />
            )}
          </Link>
        </div>

        {/* NAVIGATION */}

        <nav className="moku-sidebar-scroll min-h-0 flex-1 px-3 py-5">
          <div className="moku-sidebar-groups space-y-6">
            {navigationGroups.map((group) => (
              <div key={group.title}>
                {!collapsed && (
                  <p className="moku-sidebar-group-title mb-2 px-3 text-[11px] font-semibold tracking-[0.06em] text-[#FDFDFD]/70">
                    {group.title}
                  </p>
                )}

                <div className="moku-sidebar-items space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        aria-current={active ? "page" : undefined}
                        className={`
                          group relative flex h-11 items-center gap-3
                          rounded-xl px-3
                          !text-[#FDFDFD]
                          transition-all duration-200 ease-out
                          motion-reduce:transition-none
                          ${
                            active
                              ? "mr-[-12px] rounded-r-none bg-[#B10618] pr-6"
                              : "bg-transparent hover:bg-[#520107]"
                          }
                          ${collapsed ? "justify-center px-0" : ""}
                        `}
                      >
                        {/* ACTIVE INDICATOR */}

                        <span
                          className={`
                            absolute bottom-2 left-0 top-2
                            w-[3px] rounded-r-full
                            bg-[#FEAF27]
                            transition-all duration-200
                            ${
                              active
                                ? "translate-x-0 opacity-100"
                                : "-translate-x-1 opacity-0"
                            }
                          `}
                        />

                        {/* ICON */}

                        <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                          <Icon
                            size={20}
                            weight={active ? "fill" : "regular"}
                            className={`
                              absolute !text-[#FDFDFD]
                              transition-all duration-200
                              ${
                                active
                                  ? "scale-100 opacity-100"
                                  : "scale-100 opacity-90 group-hover:opacity-100"
                              }
                            `}
                          />
                        </span>

                        {/* LABEL */}

                        {!collapsed && (
                          <span
                            className={`
                              truncate text-[13px]
                              !text-[#FDFDFD]
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
            ))}
          </div>
        </nav>

        {/* FOOTER */}

        <div className="moku-sidebar-footer shrink-0 space-y-2 border-t border-white/10 p-3">
          {/* PWA INSTALL PANEL */}

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
                group relative flex min-h-[66px] w-full
                items-center gap-3
                rounded-2xl border border-[#B10618]/70
                bg-[#520107] px-3 py-3
                text-left !text-[#FDFDFD]
                transition-all duration-200
                ${
                  installPrompt
                    ? "cursor-pointer hover:border-[#FEAF27]/50 hover:bg-[#3E0204] active:scale-[0.98]"
                    : "cursor-default opacity-90"
                }
                motion-reduce:transition-none
                ${collapsed ? "min-h-[54px] justify-center px-0 py-2" : ""}
              `}
            >
              {collapsed ? (
                <DownloadSimple
                  size={23}
                  weight="bold"
                  className="!text-[#FEAF27]"
                />
              ) : (
                <>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                    <Image
                      src="/images/moku/brand/app-icon.png"
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 object-contain"
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold leading-5 !text-[#FDFDFD]">
                      Install MOKU
                    </span>

                    <span className="block text-[11px] leading-4 !text-[#FDFDFD]/65">
                      Aplikasi Web / Desktop
                    </span>
                  </span>

                  <DownloadSimple
                    size={21}
                    weight="bold"
                    className={`
                      shrink-0 !text-[#FEAF27]
                      transition-transform duration-200
                      ${installPrompt ? "group-hover:translate-y-0.5" : ""}
                    `}
                  />
                </>
              )}
            </button>
          )}

          {/* PROFILE */}

          <Link
            href="/profile"
            title={collapsed ? "Profil Saya" : undefined}
            className={`
              flex h-11 items-center gap-3
              rounded-xl px-3
              !text-[#FDFDFD]
              transition-colors duration-200
              hover:bg-[#520107]
              ${collapsed ? "justify-center px-0" : ""}
            `}
          >
            <UserCircle
              size={21}
              weight="regular"
              className="shrink-0 !text-[#FDFDFD]"
            />

            {!collapsed && (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-semibold !text-[#FDFDFD]">
                  Akun Pengguna
                </span>

                <span className="block text-[10px] !text-[#FDFDFD]/70">
                  Profil Saya
                </span>
              </span>
            )}
          </Link>

          {/* COLLAPSE BUTTON */}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="
                mt-2 flex h-9 w-full items-center justify-center
                rounded-lg !text-[#FDFDFD]/75
                transition-all duration-200
                hover:bg-[#520107] hover:!text-[#FDFDFD]
                active:scale-95
                motion-reduce:transition-none
              "
              aria-label={
                collapsed ? "Perluas sidebar" : "Perkecil sidebar"
              }
              title={
                collapsed ? "Perluas sidebar" : "Perkecil sidebar"
              }
            >
              {collapsed ? (
                <CaretRight size={19} weight="bold" />
              ) : (
                <CaretLeft size={19} weight="bold" />
              )}
            </button>
          )}
        </div>
      </aside>

      {/* SIDEBAR SCROLL & COMPACT LANDSCAPE */}

      <style jsx global>{`
        .moku-sidebar-scroll {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
        }

        .moku-sidebar-scroll::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        /*
          MOBILE LANDSCAPE / DESKTOP SITE
          Compact layout for short touch screens.
        */

        @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
          .moku-sidebar {
            width: 190px !important;
          }

          .moku-sidebar[data-collapsed="true"] {
            width: 64px !important;
          }

          .moku-sidebar-brand {
            height: 54px !important;
            padding-left: 12px;
            padding-right: 12px;
          }

          .moku-sidebar-brand img {
            max-height: 36px !important;
            max-width: 145px !important;
          }

          .moku-sidebar-scroll {
            padding-top: 10px !important;
            padding-bottom: 10px !important;
          }

          .moku-sidebar-groups {
            gap: 12px !important;
          }

          .moku-sidebar-group-title {
            margin-bottom: 4px !important;
            font-size: 9px !important;
          }

          .moku-sidebar-items {
            gap: 2px !important;
          }

          .moku-sidebar-items a {
            height: 34px !important;
            border-radius: 8px;
          }

          .moku-sidebar-items a span:last-child {
            font-size: 11px !important;
          }

          .moku-sidebar-footer {
            padding: 8px !important;
            gap: 5px !important;
          }

          .moku-sidebar-footer > button:first-child {
            min-height: 42px !important;
            padding-top: 6px !important;
            padding-bottom: 6px !important;
            border-radius: 10px !important;
          }

          .moku-sidebar-footer > a {
            height: 36px !important;
          }

          .moku-sidebar-footer > button:last-child {
            height: 28px !important;
            margin-top: 2px !important;
          }
        }
      `}</style>
    </>
  );
}
