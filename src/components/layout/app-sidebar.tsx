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
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AppSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
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
  mobileOpen,
  onClose,
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
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
          mobileOpen
            ? "visible opacity-100"
            : "invisible opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          border-r border-[#EEE7EB]
          bg-white
          transition-all duration-300
          lg:sticky lg:top-0 lg:z-30
          lg:h-screen
          ${collapsed ? "lg:w-[76px]" : "lg:w-[260px]"}
          w-[260px]
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
        aria-label="Navigasi utama"
      >
        {/* Brand */}
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#F1EBEF] px-5">
          <Link
            href="/"
            onClick={onClose}
            className="flex min-w-0 items-center gap-3"
            aria-label="MOKU Dashboard"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7C0041] text-white shadow-sm">
              <Monitor size={21} strokeWidth={2.2} />
            </div>

            <div
              className={`min-w-0 ${
                collapsed ? "lg:hidden" : ""
              }`}
            >
              <h1 className="text-[19px] font-extrabold tracking-tight text-[#29232A]">
                MOKU
              </h1>
              <p className="text-[10px] font-medium tracking-[0.08em] text-[#817780]">
                MACHINE VISIT MONITORING
              </p>
            </div>
          </Link>

          {/* Mobile close */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#817780] transition hover:bg-[#F8E7EE] hover:text-[#7C0041] lg:hidden"
            aria-label="Tutup navigasi"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-6">
            {navigationGroups.map((group) => (
              <div key={group.title}>
                <p
                  className={`mb-2 px-3 text-[10px] font-bold tracking-[0.12em] text-[#A49AA1] ${
                    collapsed ? "lg:hidden" : ""
                  }`}
                >
                  {group.title}
                </p>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        title={collapsed ? item.label : undefined}
                        aria-current={
                          active ? "page" : undefined
                        }
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
                        `}
                      >
                        {active && (
                          <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#7C0041]" />
                        )}

                        <Icon
                          size={19}
                          strokeWidth={active ? 2.3 : 1.8}
                          className="shrink-0"
                        />

                        <span
                          className={`truncate ${
                            collapsed ? "lg:hidden" : ""
                          }`}
                        >
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="shrink-0 border-t border-[#F1EBEF] p-3">
          <div
            className={`mb-3 rounded-xl bg-[#FFF8F5] p-3 ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            <p className="text-[11px] font-semibold text-[#7C0041]">
              MOKU Workspace
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-[#817780]">
              Monitoring operasional kunjungan unit mesin.
            </p>
          </div>

          <button
            type="button"
            className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left transition hover:bg-[#FBF6F8]"
          >
            <UserCircle
              size={20}
              className="shrink-0 text-[#817780]"
            />

            <span
              className={`min-w-0 flex-1 ${
                collapsed ? "lg:hidden" : ""
              }`}
            >
              <span className="block truncate text-[12px] font-semibold text-[#29232A]">
                Akun Pengguna
              </span>
              <span className="block text-[10px] text-[#817780]">
                Profil Saya
              </span>
            </span>
          </button>

          {/* Desktop collapse button */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="mt-2 hidden h-9 w-full items-center justify-center rounded-lg text-[#817780] transition hover:bg-[#F8E7EE] hover:text-[#7C0041] lg:flex"
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
    </>
  );
                                            }
