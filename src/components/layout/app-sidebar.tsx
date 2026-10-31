"use client";

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
} from "@phosphor-icons/react";

interface AppSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navigationGroups = [
  {
    title: "OVERVIEW",
    items: [
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
    ],
  },
  {
    title: "OPERASIONAL",
    items: [
      {
        label: "Kunjungan",
        href: "/visits",
        icon: ClipboardText,
      },
      {
        label: "Data Mesin",
        href: "/equipment",
        icon: Desktop,
      },
      {
        label: "Pelanggan",
        href: "/customers",
        icon: Buildings,
      },
      {
        label: "Riwayat Kunjungan",
        href: "/visit-history",
        icon: ClockCounterClockwise,
      },
    ],
  },
  {
    title: "ANALISIS",
    items: [
      {
        label: "Laporan",
        href: "/reports",
        icon: ChartBar,
      },
    ],
  },
  {
    title: "PREFERENSI",
    items: [
      {
        label: "Pengguna",
        href: "/users",
        icon: Users,
      },
      {
        label: "Notifikasi",
        href: "/notifications",
        icon: Bell,
      },
      {
        label: "Pengaturan",
        href: "/settings",
        icon: Gear,
      },
    ],
  },
];

export default function AppSidebar({
  collapsed = false,
  onToggleCollapse,
}: AppSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className={`
        sticky top-0 z-30 hidden h-screen shrink-0
        flex-col overflow-hidden
        border-r border-white/10
        bg-[#6F010E]
        transition-[width] duration-300 ease-in-out
        motion-reduce:transition-none
        lg:flex
        ${collapsed ? "w-[76px]" : "w-[260px]"}
      `}
      aria-label="Navigasi utama"
    >
      {/* BRAND */}
      <div
        className={`
          flex h-[76px] shrink-0 items-center
          border-b border-white/15
          ${collapsed ? "justify-center px-2" : "px-5"}
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
              width={42}
              height={42}
              priority
              className="
                h-[42px] w-[42px] object-contain
                transition-transform duration-200
                hover:scale-105
              "
            />
          ) : (
            <Image
              src="/images/moku/brand/logo-dark.png"
              alt="MOKU"
              width={170}
              height={48}
              priority
              className="
                h-auto max-h-10 w-auto
                max-w-[170px] object-contain object-left
              "
            />
          )}
        </Link>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5">
        <div className="space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p
                  className="
                    mb-2 px-3
                    text-[10px] font-bold
                    tracking-[0.12em]
                    text-white/55
                  "
                >
                  {group.title}
                </p>
              )}

              <div className="space-y-1">
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
                        transition-all duration-200 ease-out
                        motion-reduce:transition-none
                        ${
                          active
                            ? "bg-[#B10618] text-[#FDFDFD]"
                            : "text-white/80 hover:bg-[#520107] hover:text-white"
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

                      {/* ICON TRANSITION */}
                      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                        <Icon
                          size={20}
                          weight="regular"
                          className={`
                            absolute transition-all duration-200
                            ${
                              active
                                ? "scale-75 opacity-0"
                                : "scale-100 opacity-100"
                            }
                          `}
                        />

                        <Icon
                          size={20}
                          weight="fill"
                          className={`
                            absolute transition-all duration-200
                            ${
                              active
                                ? "scale-100 opacity-100"
                                : "scale-125 opacity-0"
                            }
                          `}
                        />
                      </span>

                      {!collapsed && (
                        <span
                          className={`
                            truncate text-[13px]
                            transition-all duration-200
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
      <div className="shrink-0 border-t border-white/15 p-3">
        {!collapsed && (
          <div
            className="
              mb-3 rounded-xl
              border border-white/15
              bg-white/10 p-3
            "
          >
            <p className="text-[11px] font-semibold text-white">
              MOKU Workspace
            </p>

            <p className="mt-1 text-[10px] leading-relaxed text-white/65">
              Monitoring operasional kunjungan unit mesin.
            </p>
          </div>
        )}

        {/* PROFILE */}
        <Link
          href="/profile"
          title={collapsed ? "Profil Saya" : undefined}
          className={`
            flex h-11 items-center gap-3
            rounded-xl px-3
            text-white/80
            transition-colors duration-200
            hover:bg-[#520107] hover:text-white
            ${collapsed ? "justify-center px-0" : ""}
          `}
        >
          <UserCircle
            size={21}
            weight="regular"
            className="shrink-0"
          />

          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold text-white">
                Akun Pengguna
              </span>

              <span className="block text-[10px] text-white/60">
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
              rounded-lg text-white/65
              transition-all duration-200
              hover:bg-[#520107] hover:text-white
              active:scale-95
              motion-reduce:transition-none
            "
            aria-label={
              collapsed ? "Perluas sidebar" : "Perkecil sidebar"
            }
            title={collapsed ? "Perluas sidebar" : "Perkecil sidebar"}
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
  );
}
