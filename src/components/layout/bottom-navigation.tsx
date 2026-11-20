"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Monitor,
  Stack,
  CalendarDots,
  User,
} from "@phosphor-icons/react";

import { useAppLayout } from "@/components/layout/app-shell";

const navigationItems = [
  { label: "Dashboard", href: "/", icon: House },
  { label: "Monitoring", href: "/monitoring", icon: Monitor },
  { label: "Data Mesin", href: "/equipment", icon: Stack },
  { label: "Riwayat", href: "/visit-history", icon: CalendarDots },
  { label: "Profil", href: "/profile", icon: User },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const { isMobile, isReady } = useAppLayout();

  if (!isReady || !isMobile) return null;

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-50 w-full border-t border-[#EEEEEE] bg-white"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="grid h-[64px] w-full grid-cols-5">
        {navigationItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="flex h-full w-full min-w-0 flex-col items-center justify-center gap-[2px] px-0"
            >
              <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center">
                <Icon
                  size={24}
                  weight={isActive ? "fill" : "regular"}
                  color={isActive ? "#BF0B2C" : "#85858D"}
                  aria-hidden="true"
                />
              </span>

              <span
                className={`w-full truncate text-center text-[11px] leading-[14px] ${
                  isActive
                    ? "font-semibold text-[#BF0B2C]"
                    : "font-normal text-[#85858D]"
                }`}
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
