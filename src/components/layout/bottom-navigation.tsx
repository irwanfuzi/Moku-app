"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  House,
  Activity,
  ClipboardText,
  ChartBar,
  UserCircle,
} from "@phosphor-icons/react";

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
    icon: ClipboardText,
  },
  {
    label: "Laporan",
    href: "/reports",
    icon: ChartBar,
  },
  {
    label: "Profil",
    href: "/profile",
    icon: UserCircle,
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";

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
        mx-auto grid h-[66px] max-w-xl
        grid-cols-5 items-center px-2
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
                group relative flex h-full
                flex-col items-center justify-center gap-1
              "
            >
              {/* Active Indicator */}
              <span
                className={`
                  absolute top-0 h-[3px] w-7
                  rounded-b-full bg-[#7C0041]
                  transition-all duration-300
                  motion-reduce:transition-none
                  ${
                    active
                      ? "scale-x-100 opacity-100"
                      : "scale-x-0 opacity-0"
                  }
                `}
              />

              {/* Icon Container */}
              <span className="relative flex h-8 w-10 items-center justify-center">

                {/* Regular Icon */}
                <Icon
                  size={24}
                  weight="regular"
                  className={`
                    absolute transition-all duration-200
                    motion-reduce:transition-none
                    ${
                      active
                        ? "scale-75 opacity-0"
                        : "scale-100 opacity-100 text-[#817780]"
                    }
                  `}
                />

                {/* Filled Icon */}
                <Icon
                  size={24}
                  weight="fill"
                  className={`
                    absolute text-[#7C0041]
                    transition-all duration-200
                    motion-reduce:transition-none
                    ${
                      active
                        ? "scale-100 opacity-100"
                        : "scale-125 opacity-0"
                    }
                  `}
                />
              </span>

              {/* Label */}
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
