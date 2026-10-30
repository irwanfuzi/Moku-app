"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  ClipboardList,
  Monitor,
  Building2,
  History,
  Users,
  BarChart3,
  Bell,
  Settings,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
        icon: LayoutDashboard,
      },
      {
        label: "Monitoring",
        href: "/monitoring",
        icon: Activity,
      },
    ],
  },
  {
    title: "OPERASIONAL",
    items: [
      {
        label: "Kunjungan",
        href: "/visits",
        icon: ClipboardList,
      },
      {
        label: "Data Mesin",
        href: "/equipment",
        icon: Monitor,
      },
      {
        label: "Pelanggan",
        href: "/customers",
        icon: Building2,
      },
      {
        label: "Riwayat Kunjungan",
        href: "/visit-history",
        icon: History,
      },
    ],
  },
  {
    title: "ANALISIS",
    items: [
      {
        label: "Laporan",
        href: "/reports",
        icon: BarChart3,
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
        icon: Settings,
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
        hidden lg:flex
        sticky top-0 z-30
        h-screen shrink-0
        flex-col
        border-r border-[#EEE7EB]
        bg-white
        transition-[width] duration-300
        ${collapsed ? "w-[76px]" : "w-[260px]"}
      `}
      aria-label="Navigasi utama"
    >
      {/* Brand */}
      <div className="flex h-[76px] shrink-0 items-center border-b border-[#F1EBEF] px-5">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          aria-label="MOKU Dashboard"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7C0041] text-white">
            <Monitor size={21} strokeWidth={2.2} />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-[19px] font-extrabold tracking-tight text-[#29232A]">
                MOKU
              </h1>

              <p className="whitespace-nowrap text-[9px] font-semibold tracking-[0.08em] text-[#817780]">
                MACHINE VISIT MONITORING
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.12em] text-[#A49AA1]">
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
                        text-[13px] font-medium
                        transition-all duration-200
                        ${
                          active
                            ? "bg-[#F8E7EE] text-[#7C0041]"
                            : "text-[#817780] hover:bg-[#FBF6F8] hover:text-[#7C0041]"
                        }
                        ${collapsed ? "justify-center px-0" : ""}
                      `}
                    >
                      {active && (
                        <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#7C0041]" />
                      )}

                      <Icon
                        size={19}
                        strokeWidth={active ? 2.3 : 1.8}
                        fill={active ? "currentColor" : "none"}
                        className="shrink-0"
                      />

                      {!collapsed && (
                        <span className="truncate">
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

      {/* Footer */}
      <div className="shrink-0 border-t border-[#F1EBEF] p-3">
        {!collapsed && (
          <div className="mb-3 rounded-xl bg-[#FFF8F5] p-3">
            <p className="text-[11px] font-semibold text-[#7C0041]">
              MOKU Workspace
            </p>

            <p className="mt-1 text-[10px] leading-relaxed text-[#817780]">
              Monitoring operasional kunjungan unit mesin.
            </p>
          </div>
        )}

        <Link
          href="/profile"
          className={`
            flex h-11 items-center gap-3 rounded-xl px-3
            transition hover:bg-[#FBF6F8]
            ${collapsed ? "justify-center px-0" : ""}
          `}
          title={collapsed ? "Profil Saya" : undefined}
        >
          <UserCircle
            size={20}
            className="shrink-0 text-[#817780]"
          />

          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold text-[#29232A]">
                Akun Pengguna
              </span>

              <span className="block text-[10px] text-[#817780]">
                Profil Saya
              </span>
            </span>
          )}
        </Link>

        {/* Collapse Button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="mt-2 flex h-9 w-full items-center justify-center rounded-lg text-[#817780] transition hover:bg-[#F8E7EE] hover:text-[#7C0041]"
            aria-label={
              collapsed
                ? "Perluas sidebar"
                : "Perkecil sidebar"
            }
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        )}
      </div>
    </aside>
  );
            }
 
