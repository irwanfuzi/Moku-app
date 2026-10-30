"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  Activity,
  BarChart3,
  Bell,
  ChevronRight,
  ClipboardList,
  Ellipsis,
  History,
  LayoutDashboard,
  Monitor,
  Settings,
  UserRound,
  Users,
  X,
} from "lucide-react";

const primaryNavigation = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Monitoring",
    href: "/monitoring",
    icon: Activity,
  },
  {
    label: "Kunjungan",
    href: "/visits",
    icon: ClipboardList,
  },
  {
    label: "Laporan",
    href: "/reports",
    icon: BarChart3,
  },
];

const secondaryNavigation = [
  {
    label: "Data Mesin",
    description: "Informasi unit mesin",
    href: "/equipment",
    icon: Monitor,
  },
  {
    label: "Pelanggan",
    description: "Data pelanggan",
    href: "/customers",
    icon: Users,
  },
  {
    label: "Riwayat Kunjungan",
    description: "Catatan kunjungan sebelumnya",
    href: "/visit-history",
    icon: History,
  },
  {
    label: "Pengguna",
    description: "Informasi pengguna aplikasi",
    href: "/users",
    icon: UserRound,
  },
  {
    label: "Notifikasi",
    description: "Pemberitahuan aktivitas",
    href: "/notifications",
    icon: Bell,
  },
  {
    label: "Pengaturan",
    description: "Preferensi aplikasi",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "Profil Saya",
    description: "Informasi akun",
    href: "/profile",
    icon: UserRound,
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isMoreActive = secondaryNavigation.some((item) =>
    isActive(item.href)
  );

  const closeMoreMenu = () => {
    setMoreOpen(false);
  };

  return (
    <>
      {/* More Menu Backdrop */}
      {moreOpen && (
        <button
          type="button"
          aria-label="Tutup menu lainnya"
          onClick={closeMoreMenu}
          className="fixed inset-0 z-40 bg-[#29232A]/20 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* More Menu Panel */}
      <div
        id="mobile-more-menu"
        className={`
          fixed bottom-[calc(76px+env(safe-area-inset-bottom))]
          left-3 right-3 z-50
          rounded-2xl border border-[#EEE7EB]
          bg-white p-4 shadow-[0_12px_40px_rgba(41,35,42,0.14)]
          transition-all duration-200
          lg:hidden
          ${
            moreOpen
              ? "visible translate-y-0 opacity-100"
              : "invisible translate-y-3 opacity-0 pointer-events-none"
          }
        `}
        aria-hidden={!moreOpen}
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#29232A]">
              Menu Lainnya
            </h2>
            <p className="mt-0.5 text-[11px] text-[#817780]">
              Fitur dan pengaturan MOKU
            </p>
          </div>

          <button
            type="button"
            onClick={closeMoreMenu}
            aria-label="Tutup menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#817780] transition hover:bg-[#F8E7EE] hover:text-[#7C0041]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMoreMenu}
                className={`
                  flex min-w-0 items-center gap-2.5
                  rounded-xl border p-3 transition
                  ${
                    active
                      ? "border-[#7C0041]/15 bg-[#F8E7EE]"
                      : "border-[#F2EDF0] bg-white hover:bg-[#FBF6F8]"
                  }
                `}
              >
                <span
                  className={`
                    flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                    ${
                      active
                        ? "bg-[#7C0041] text-white"
                        : "bg-[#F8E7EE] text-[#7C0041]"
                    }
                  `}
                >
                  <Icon size={18} strokeWidth={1.9} />
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={`
                      block truncate text-xs font-semibold
                      ${active ? "text-[#7C0041]" : "text-[#29232A]"}
                    `}
                  >
                    {item.label}
                  </span>

                  <span className="mt-0.5 block truncate text-[10px] text-[#817780]">
                    {item.description}
                  </span>
                </span>

                <ChevronRight
                  size={14}
                  className="shrink-0 text-[#A49AA1]"
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav
        aria-label="Navigasi utama"
        className="
          fixed bottom-0 left-0 right-0 z-30
          border-t border-[#EEE7EB]
          bg-white/95
          pb-[env(safe-area-inset-bottom)]
          shadow-[0_-4px_20px_rgba(41,35,42,0.04)]
          backdrop-blur-xl
          lg:hidden
        "
      >
        <div className="mx-auto grid h-[68px] max-w-xl grid-cols-5 items-center px-2">

          {primaryNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMoreMenu}
                aria-current={active ? "page" : undefined}
                className="flex h-full flex-col items-center justify-center gap-1"
              >
                <span
                  className={`
                    flex h-8 min-w-10 items-center justify-center rounded-xl
                    transition-all duration-200
                    ${
                      active
                        ? "bg-[#F8E7EE] text-[#7C0041]"
                        : "text-[#817780]"
                    }
                  `}
                >
                  <Icon
                    size={21}
                    strokeWidth={active ? 2.4 : 1.8}
                  />
                </span>

                <span
                  className={`
                    text-[10px] leading-none
                    ${
                      active
                        ? "font-bold text-[#7C0041]"
                        : "font-medium text-[#817780]"
                    }
                  `}
                >
                  {item.label}
                </span>

                {active && (
                  <span className="absolute bottom-[5px] h-1 w-1 rounded-full bg-[#7C0041]" />
                )}
              </Link>
            );
          })}

          {/* More Button */}
          <button
            type="button"
            onClick={() => setMoreOpen((previous) => !previous)}
            aria-expanded={moreOpen}
            aria-controls="mobile-more-menu"
            className="flex h-full flex-col items-center justify-center gap-1"
          >
            <span
              className={`
                flex h-8 min-w-10 items-center justify-center rounded-xl
                transition-all duration-200
                ${
                  moreOpen || isMoreActive
                    ? "bg-[#F8E7EE] text-[#7C0041]"
                    : "text-[#817780]"
                }
              `}
            >
              {moreOpen ? (
                <X size={21} strokeWidth={2.2} />
              ) : (
                <Ellipsis
                  size={22}
                  strokeWidth={moreOpen || isMoreActive ? 2.4 : 1.9}
                />
              )}
            </span>

            <span
              className={`
                text-[10px] leading-none
                ${
                  moreOpen || isMoreActive
                    ? "font-bold text-[#7C0041]"
                    : "font-medium text-[#817780]"
                }
              `}
            >
              Lainnya
            </span>

            {isMoreActive && !moreOpen && (
              <span className="absolute bottom-[5px] h-1 w-1 rounded-full bg-[#7C0041]" />
            )}
          </button>

        </div>
      </nav>
    </>
  );
}
