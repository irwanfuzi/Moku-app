
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAppLayout } from "@/components/layout/app-shell";

import {
  House,
  Monitor,
  HardDrives,
  ClockCounterClockwise,
  UserCircle,
} from "@phosphor-icons/react";

/* =========================================================
   NAVIGATION ITEMS
========================================================= */

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
    label: "Data Mesin",
    href: "/equipment",
    Icon: HardDrives,
  },
  {
    label: "Riwayat",
    href: "/visit-history",
    Icon: ClockCounterClockwise,
  },
  {
    label: "Profil",
    href: "/profile",
    Icon: UserCircle,
  },
];

/* =========================================================
   BOTTOM NAVIGATION
========================================================= */

export default function BottomNavigation() {
  const pathname = usePathname();
  const { isMobile, isReady } = useAppLayout();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  if (!isReady || !isMobile) {
    return null;
  }

  return (
    <nav
      aria-label="Navigasi utama"
      className="
        fixed bottom-0 left-0 right-0 z-50
        w-full
        border-t border-[#EEEEEE]
        bg-white
        pb-[env(safe-area-inset-bottom)]
      "
    >
      <div
        className="
          mx-auto grid
          h-[68px]
          w-full
          max-w-[600px]
          grid-cols-5
          items-center
        "
      >
        {navigationItems.map(({ label, href, Icon }) => {
          const active = isActive(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="
                flex h-full min-w-0
                flex-col items-center justify-center
                gap-1
                outline-none
              "
            >
              {/* NAVIGATION ICON */}

              <Icon
                size={25}
                weight={active ? "fill" : "regular"}
                color={active ? "#BF0B2C" : "#817780"}
              />

              {/* NAVIGATION LABEL */}

              <span
                className={`
                  whitespace-nowrap
                  text-[10px]
                  leading-tight
                  ${
                    active
                      ? "font-bold text-[#BF0B2C]"
                      : "font-medium text-[#817780]"
                  }
                `}
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
