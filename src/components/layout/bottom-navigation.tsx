"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  House,
  Activity,
  ClipboardCheck,
  ChartColumn,
  CircleUserRound,
} from "lucide-react";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: House,
  },
  {
    label: "Monitoring",
    href: "/monitoring",
    icon: Activity,
  },
  {
    label: "Kunjungan",
    href: "/visits",
    icon: ClipboardCheck,
  },
  {
    label: "Laporan",
    href: "/reports",
    icon: ChartColumn,
  },
  {
    label: "Profil",
    href: "/profile",
    icon: CircleUserRound,
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
        bg-white/95
        pb-[env(safe-area-inset-bottom)]
        backdrop-blur-md
        lg:hidden
      "
    >
      <div
        className="
          mx-auto grid h-[66px] max-w-xl
          grid-cols-5 items-center
          px-2
        "
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="
                group relative flex h-full
                flex-col items-center justify-center
                gap-1
              "
            >
              {/* Active Indicator */}
              <span
                className={`
                  absolute top-0 h-[3px] w-7
                  rounded-b-full bg-[#7C0041]
                  transition-all duration-300
                  ${
                    active
                      ? "scale-x-100 opacity-100"
                      : "scale-x-0 opacity-0"
                  }
                `}
              />

              {/* Navigation Icon */}
              <span
                className={`
                  flex h-8 w-10
                  items-center justify-center
                  rounded-xl
                  transition-all duration-200
                  ${
                    active
                      ? "scale-105 bg-[#F8E7EE] text-[#7C0041]"
                      : "scale-100 text-[#817780] group-hover:bg-[#FBF6F8]"
                  }
                `}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.2 : 1.8}
                  fill={active ? "currentColor" : "none"}
                  className="
                    transition-all duration-200
                    motion-reduce:transition-none
                  "
                />
              </span>

              {/* Navigation Label */}
              <span
                className={`
                  text-[10px] leading-none
                  transition-colors duration-200
                  ${
                    active
                      ? "font-bold text-[#7C0041]"
                      : "font-medium text-[#817780]"
                  }
                `}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
