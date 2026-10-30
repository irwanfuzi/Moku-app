"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Monitor,
  ClipboardText,
  ChartBar,
  UserCircle,
} from "@phosphor-icons/react";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/",
    Icon: House,
  },
  {
    label: "Monitoring",
    href: "/monitoring",
    Icon: Monitor,
  },
  {
    label: "Kunjungan",
    href: "/visits",
    Icon: ClipboardText,
  },
  {
    label: "Laporan",
    href: "/reports",
    Icon: ChartBar,
  },
  {
    label: "Profil",
    href: "/profile",
    Icon: UserCircle,
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
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#EEE7EB] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto grid h-[68px] max-w-screen-sm grid-cols-5">
        {navigationItems.map(({ label, href, Icon }) => {
          const active = isActive(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="group relative flex flex-col items-center justify-center gap-1 transition-transform duration-200 active:scale-95 motion-reduce:transition-none"
            >
              {/* Active indicator */}
              <span
                className={`absolute top-0 h-[3px] w-8 rounded-b-full bg-[#7C0041] transition-all duration-300 ease-out motion-reduce:transition-none ${
                  active
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-1 opacity-0"
                }`}
              />

              {/* Animated icon */}
              <span className="relative flex h-7 w-7 items-center justify-center">
                <Icon
                  size={24}
                  weight="regular"
                  className={`absolute transition-all duration-300 ease-out motion-reduce:transition-none ${
                    active
                      ? "scale-75 rotate-[-8deg] opacity-0"
                      : "scale-100 rotate-0 opacity-100"
                  }`}
                />

                <Icon
                  size={24}
                  weight="fill"
                  className={`absolute text-[#7C0041] transition-all duration-300 ease-out motion-reduce:transition-none ${
                    active
                      ? "scale-100 rotate-0 opacity-100"
                      : "scale-125 rotate-[8deg] opacity-0"
                  }`}
                />
              </span>

              {/* Navigation label */}
              <span
                className={`text-[10px] transition-all duration-200 motion-reduce:transition-none ${
                  active
                    ? "font-semibold text-[#7C0041]"
                    : "font-medium text-[#817780]"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
