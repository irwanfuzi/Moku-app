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
              className="relative flex flex-col items-center justify-center gap-1 transition-colors duration-200"
            >
              <span
                className={`absolute top-0 h-[3px] w-8 rounded-b-full transition-all duration-200 ${
                  active ? "bg-[#7C0041] opacity-100" : "opacity-0"
                }`}
              />

              <span className="relative flex h-6 w-6 items-center justify-center">
                <Icon
                  size={24}
                  weight="regular"
                  className={`absolute transition-all duration-200 motion-reduce:transition-none ${
                    active
                      ? "scale-75 opacity-0"
                      : "scale-100 opacity-100"
                  }`}
                />

                <Icon
                  size={24}
                  weight="fill"
                  className={`absolute transition-all duration-200 motion-reduce:transition-none ${
                    active
                      ? "scale-100 opacity-100"
                      : "scale-125 opacity-0"
                  }`}
                />
              </span>

              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  active ? "text-[#7C0041]" : "text-[#817780]"
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
