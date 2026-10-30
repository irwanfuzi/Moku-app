"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  ChevronDown,
  Search,
  UserCircle,
} from "lucide-react";

interface AppHeaderProps {
  title: string;
  description?: string;
  onSearch?: (value: string) => void;
  notificationCount?: number;
  userName?: string;
  userEmail?: string;
}

export default function AppHeader({
  title,
  description,
  onSearch,
  notificationCount = 0,
  userName = "Pengguna",
  userEmail = "Akun MOKU",
}: AppHeaderProps) {
  const [searchValue, setSearchValue] = useState("");

  const initials = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  const handleSearch = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <header
      className="
        sticky top-0 z-20
        flex min-h-[68px] w-full
        items-center justify-between gap-3
        border-b border-[#EEE7EB]
        bg-white/95
        px-4 py-3
        backdrop-blur-md
        sm:min-h-[76px] sm:px-6
        lg:px-8
      "
    >
      {/* Page Information */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold tracking-tight text-[#29232A] sm:text-xl">
          {title}
        </h1>

        {description && (
          <p className="mt-0.5 hidden truncate text-xs text-[#817780] sm:block">
            {description}
          </p>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">

        {/* Desktop Search */}
        <div className="relative hidden w-48 md:block lg:w-64">
          <Search
            size={17}
            strokeWidth={1.9}
            className="
              pointer-events-none absolute
              left-3 top-1/2
              -translate-y-1/2
              text-[#A49AA1]
            "
          />

          <input
            type="search"
            value={searchValue}
            onChange={handleSearch}
            placeholder="Cari sesuatu..."
            aria-label="Pencarian"
            className="
              h-10 w-full rounded-xl
              border border-[#EEE7EB]
              bg-[#FBF9FA]
              pl-10 pr-3
              text-xs text-[#29232A]
              outline-none
              transition
              placeholder:text-[#A49AA1]
              focus:border-[#7C0041]
              focus:bg-white
              focus:ring-2
              focus:ring-[#7C0041]/10
            "
          />
        </div>

        {/* Mobile Search */}
        <button
          type="button"
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-xl
            text-[#817780]
            transition
            hover:bg-[#F8E7EE]
            hover:text-[#7C0041]
            md:hidden
          "
          aria-label="Pencarian"
          title="Pencarian"
        >
          <Search size={20} strokeWidth={1.9} />
        </button>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="
            relative flex h-10 w-10
            shrink-0 items-center justify-center
            rounded-xl
            text-[#817780]
            transition
            hover:bg-[#F8E7EE]
            hover:text-[#7C0041]
          "
          aria-label={
            notificationCount > 0
              ? `${notificationCount} notifikasi`
              : "Notifikasi"
          }
        >
          <Bell
            size={20}
            strokeWidth={1.9}
          />

          {notificationCount > 0 && (
            <span
              className="
                absolute right-1.5 top-1.5
                flex h-[17px] min-w-[17px]
                items-center justify-center
                rounded-full
                border-2 border-white
                bg-[#DC4C55]
                px-1
                text-[9px] font-bold text-white
              "
            >
              {notificationCount > 99
                ? "99+"
                : notificationCount}
            </span>
          )}
        </Link>

        {/* Divider */}
        <div className="hidden h-9 w-px bg-[#EEE7EB] sm:block" />

        {/* User Profile */}
        <Link
          href="/profile"
          className="
            flex items-center gap-2
            rounded-xl p-1.5
            transition
            hover:bg-[#FBF6F8]
            sm:gap-3 sm:px-2
          "
          aria-label="Buka profil pengguna"
        >
          <div
            className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-xl
              bg-[#F8E7EE]
              text-xs font-bold
              text-[#7C0041]
            "
          >
            {initials || (
              <UserCircle size={20} />
            )}
          </div>

          <div className="hidden min-w-0 text-left sm:block">
            <p className="max-w-[120px] truncate text-xs font-semibold text-[#29232A]">
              {userName}
            </p>

            <p className="max-w-[120px] truncate text-[10px] text-[#817780]">
              {userEmail}
            </p>
          </div>

          <ChevronDown
            size={15}
            className="hidden text-[#A49AA1] sm:block"
          />
        </Link>
      </div>
    </header>
  );
}
 
