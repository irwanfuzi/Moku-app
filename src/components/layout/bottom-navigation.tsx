"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Activity,
  ClipboardList,
  BarChart3,
  UserRound,
} from "lucide-react";

const navigationItems = [
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
  {
    label: "Profil",
    href: "/profile",
    icon: UserRound,
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      aria-label="Navigasi utama"
      className="
        fixed bottom-0 left-0 right-0 z-30
        border-t border-[#EEE7EB]
        bg-white
        pb-[env(safe-area-inset-bottom)]
        lg:hidden
      "
    >
      <div className="
        mx-auto grid h-[64px] max-w-xl
        grid-cols-5 items-center
        px-2
      ">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="
                relative flex h-full
                flex-col items-center justify-center
                gap-1
                transition-colors duration-150
              "
            >
              <span
                className={`
                  flex h-8 w-10
                  items-center justify-center
                  rounded-xl
                  transition-colors duration-150
                  ${
                    active
                      ? "bg-[#F8E7EE] text-[#7C0041]"
                      : "text-[#817780]"
                  }
                `}
              >
                <Icon
                  size={21}
                  strokeWidth={active ? 2.3 : 1.8}
                  fill="none"
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
                <span
                  className="
                    absolute bottom-[3px]
                    h-[3px] w-4
                    rounded-full
                    bg-[#7C0041]
                  "
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
