"use client";

import Link from "next/link";
import { useState, type ChangeEvent } from "react";

import {
  Bell,
  CaretDown,
  MagnifyingGlass,
  UserCircle,
  X,
} from "@phosphor-icons/react";

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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const initials = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setSearchValue(value);
    onSearch?.(value);
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen((previous) => !previous);
  };

  return (
    <header
      className="
        sticky top-0 z-20 w-full
        border-b border-border
        bg-surface/95
        backdrop-blur-md
        transition-colors duration-200
      "
    >
      {/* HEADER MAIN */}
      <div
        className="
          flex min-h-[68px] items-center
          justify-between gap-3
          px-4 py-3
          sm:min-h-[76px] sm:px-6
          lg:px-8
        "
      >
        {/* PAGE INFORMATION */}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {title}
          </h1>

          {description && (
            <p className="mt-0.5 hidden truncate text-xs text-muted sm:block">
              {description}
            </p>
          )}
        </div>

        {/* HEADER ACTIONS */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">

          {/* DESKTOP SEARCH */}
          <div className="relative hidden w-48 md:block lg:w-64">
            <MagnifyingGlass
              size={18}
              weight="regular"
              className="
                pointer-events-none absolute left-3
                top-1/2 -translate-y-1/2
                text-muted
              "
            />

            <input
              type="search"
              value={searchValue}
              onChange={handleSearch}
              placeholder="Cari sesuatu..."
              aria-label="Pencarian"
              className="
                h-10 w-full rounded-control
                border border-border
                bg-background
                pl-10 pr-3
                text-xs text-foreground
                outline-none
                transition-all duration-200
                placeholder:text-muted
                focus:border-primary
                focus:bg-surface
                focus:ring-2
                focus:ring-primary/10
              "
            />
          </div>

          {/* MOBILE SEARCH TOGGLE */}
          <button
            type="button"
            onClick={toggleMobileSearch}
            className="
              flex h-10 w-10 items-center justify-center
              rounded-control
              text-muted
              transition-all duration-200
              hover:bg-primary-light
              hover:text-primary
              active:scale-95
              motion-reduce:transition-none
              md:hidden
            "
            aria-label={
              mobileSearchOpen
                ? "Tutup pencarian"
                : "Buka pencarian"
            }
            aria-expanded={mobileSearchOpen}
          >
            {mobileSearchOpen ? (
              <X size={21} weight="regular" />
            ) : (
              <MagnifyingGlass size={21} weight="regular" />
            )}
          </button>

          {/* NOTIFICATIONS */}
          <Link
            href="/notifications"
            className="
              relative flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-control
              text-muted
              transition-all duration-200
              hover:bg-primary-light
              hover:text-primary
              active:scale-95
              motion-reduce:transition-none
            "
            aria-label={
              notificationCount > 0
                ? `${notificationCount} notifikasi`
                : "Notifikasi"
            }
          >
            <Bell size={21} weight="regular" />

            {notificationCount > 0 && (
              <span
                className="
                  absolute right-1.5 top-1.5
                  flex h-[17px] min-w-[17px]
                  items-center justify-center
                  rounded-full
                  border-2 border-surface
                  bg-danger
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

          {/* DIVIDER */}
          <div className="hidden h-9 w-px bg-border sm:block" />

          {/* USER PROFILE */}
          <Link
            href="/profile"
            className="
              flex items-center gap-2
              rounded-control p-1.5
              transition-colors duration-200
              hover:bg-primary-light
              active:scale-[0.98]
              sm:gap-3 sm:px-2
              motion-reduce:transition-none
            "
            aria-label="Buka profil pengguna"
          >
            <div
              className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-control
                bg-primary-light
                text-xs font-bold text-primary
              "
            >
              {initials || <UserCircle size={20} />}
            </div>

            <div className="hidden min-w-0 text-left sm:block">
              <p className="max-w-[120px] truncate text-xs font-semibold text-foreground">
                {userName}
              </p>

              <p className="max-w-[120px] truncate text-[10px] text-muted">
                {userEmail}
              </p>
            </div>

            <CaretDown
              size={15}
              weight="bold"
              className="hidden text-muted sm:block"
            />
          </Link>
        </div>
      </div>

      {/* MOBILE SEARCH PANEL */}
      <div
        className={`
          grid transition-all duration-200 ease-out
          motion-reduce:transition-none md:hidden
          ${
            mobileSearchOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }
        `}
        aria-hidden={!mobileSearchOpen}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-3">
            <div className="relative">
              <MagnifyingGlass
                size={19}
                weight="regular"
                className="
                  pointer-events-none absolute left-3
                  top-1/2 -translate-y-1/2
                  text-muted
                "
              />

              <input
                type="search"
                value={searchValue}
                onChange={handleSearch}
                placeholder="Cari sesuatu..."
                aria-label="Pencarian mobile"
                tabIndex={mobileSearchOpen ? 0 : -1}
                className="
                  h-11 w-full rounded-control
                  border border-border
                  bg-background
                  pl-10 pr-3
                  text-sm text-foreground
                  outline-none
                  transition-all duration-200
                  placeholder:text-muted
                  focus:border-primary
                  focus:bg-surface
                  focus:ring-2
                  focus:ring-primary/10
                "
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
