"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

import {
  Bell,
  CaretDown,
  MagnifyingGlass,
  UserCircle,
  X,
  Gear,
  Check,
  CheckCheck,
  Wrench,
  Monitor,
  UserRound,
  ClipboardText,
} from "@phosphor-icons/react";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  href?: string;
  isRead: boolean;
  type?: "visit" | "equipment" | "user" | "general";
}

interface AppHeaderProps {
  title: string;
  description?: string;
  onSearch?: (value: string) => void;
  notificationCount?: number;
  notifications?: NotificationItem[];
  onMarkAllNotificationsRead?: () => void;
  userName?: string;
  userEmail?: string;
}

export default function AppHeader({
  title,
  description,
  onSearch,
  notificationCount = 0,
  notifications = [],
  onMarkAllNotificationsRead,
  userName = "Pengguna",
  userEmail = "Akun MOKU",
}: AppHeaderProps) {
  const [searchValue, setSearchValue] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  const initials = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const displayedNotificationCount =
    notifications.length > 0 ? unreadCount : notificationCount;

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setSearchValue(value);
    onSearch?.(value);
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen((previous) => !previous);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen((previous) => !previous);
    setNotificationMenuOpen(false);
  };

  const toggleNotificationMenu = () => {
    setNotificationMenuOpen((previous) => !previous);
    setProfileMenuOpen(false);
  };

  const getNotificationIcon = (type?: NotificationItem["type"]) => {
    switch (type) {
      case "visit":
        return <Wrench size={19} weight="regular" />;

      case "equipment":
        return <Monitor size={19} weight="regular" />;

      case "user":
        return <UserRound size={19} weight="regular" />;

      default:
        return <ClipboardText size={19} weight="regular" />;
    }
  };

  const getNotificationIconStyle = (
    type?: NotificationItem["type"]
  ) => {
    switch (type) {
      case "visit":
        return "bg-primary-light text-primary";

      case "equipment":
        return "bg-orange-50 text-orange-600";

      case "user":
        return "bg-surface-secondary text-muted";

      default:
        return "bg-surface-secondary text-muted";
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(target)
      ) {
        setProfileMenuOpen(false);
      }

      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(target)
      ) {
        setNotificationMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
        setNotificationMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

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

          {/* NOTIFICATION DROPDOWN */}
          <div className="relative" ref={notificationMenuRef}>
            <button
              type="button"
              onClick={toggleNotificationMenu}
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
                displayedNotificationCount > 0
                  ? `${displayedNotificationCount} notifikasi belum dibaca`
                  : "Notifikasi"
              }
              aria-expanded={notificationMenuOpen}
              aria-haspopup="true"
            >
              <Bell
                size={21}
                weight={notificationMenuOpen ? "fill" : "regular"}
              />

              {displayedNotificationCount > 0 && (
                <span
                  className="
                    absolute right-1 top-1
                    flex h-[17px] min-w-[17px]
                    items-center justify-center
                    rounded-full
                    border-2 border-surface
                    bg-danger
                    px-1
                    text-[9px] font-bold text-white
                  "
                >
                  {displayedNotificationCount > 99
                    ? "99+"
                    : displayedNotificationCount}
                </span>
              )}
            </button>

            {/* NOTIFICATION PANEL */}
            <div
              aria-hidden={!notificationMenuOpen}
              className={`
                absolute right-0 top-full z-50 mt-2
                w-[min(360px,calc(100vw-24px))]
                origin-top-right
                overflow-hidden rounded-xl
                border border-border
                bg-surface
                shadow-lg shadow-black/10
                transition-[opacity,transform,visibility]
                duration-200 ease-out
                motion-reduce:transition-none
                ${
                  notificationMenuOpen
                    ? "visible translate-y-0 scale-100 opacity-100"
                    : "invisible -translate-y-2 scale-[0.98] opacity-0"
                }
              `}
            >
              {/* PANEL HEADER */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Notifikasi
                  </h2>

                  <p className="mt-0.5 text-[11px] text-muted">
                    {displayedNotificationCount > 0
                      ? `${displayedNotificationCount} belum dibaca`
                      : "Informasi terbaru MOKU"}
                  </p>
                </div>

                {displayedNotificationCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllNotificationsRead}
                    disabled={!onMarkAllNotificationsRead}
                    className="
                      flex items-center gap-1.5
                      rounded-md px-2 py-1.5
                      text-[11px] font-medium text-primary
                      transition-colors
                      hover:bg-primary-light
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <CheckCheck size={15} />
                    Tandai dibaca
                  </button>
                )}
              </div>

              {/* NOTIFICATION LIST */}
              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-border">
                    {notifications.slice(0, 5).map((notification) => (
                      <Link
                        key={notification.id}
                        href={notification.href || "/notifications"}
                        onClick={() => setNotificationMenuOpen(false)}
                        className="
                          flex items-start gap-3 px-4 py-3.5
                          transition-colors duration-150
                          hover:bg-background
                        "
                      >
                        <div
                          className={`
                            flex h-9 w-9 shrink-0
                            items-center justify-center
                            rounded-lg
                            ${getNotificationIconStyle(notification.type)}
                          `}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-foreground">
                              {notification.title}
                            </p>

                            {!notification.isRead && (
                              <span
                                className="
                                  mt-1.5 h-2 w-2 shrink-0
                                  rounded-full bg-primary
                                "
                              />
                            )}
                          </div>

                          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted">
                            {notification.description}
                          </p>

                          <p className="mt-1.5 text-[10px] text-muted">
                            {notification.time}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center px-5 py-10 text-center">
                    <div className="
                      flex h-12 w-12 items-center justify-center
                      rounded-full bg-surface-secondary
                      text-muted
                    ">
                      <Bell size={23} weight="regular" />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-foreground">
                      Belum ada notifikasi
                    </p>

                    <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-muted">
                      Notifikasi aktivitas MOKU akan muncul di sini.
                    </p>
                  </div>
                )}
              </div>

              {/* PANEL FOOTER */}
              <div className="border-t border-border p-2">
                <Link
                  href="/notifications"
                  onClick={() => setNotificationMenuOpen(false)}
                  className="
                    flex items-center justify-center gap-2
                    rounded-lg px-3 py-2.5
                    text-xs font-semibold text-primary
                    transition-colors duration-150
                    hover:bg-primary-light
                  "
                >
                  Lihat Semua Notifikasi
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="hidden h-9 w-px bg-border sm:block" />

          {/* USER PROFILE DROPDOWN */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={toggleProfileMenu}
              className="
                flex items-center gap-2
                rounded-control p-1.5
                transition-colors duration-200
                hover:bg-primary-light
                active:scale-[0.98]
                sm:gap-3 sm:px-2
                motion-reduce:transition-none
              "
              aria-label="Menu akun pengguna"
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
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
                className={`
                  hidden text-muted transition-transform duration-200 ease-out
                  motion-reduce:transition-none
                  sm:block
                  ${profileMenuOpen ? "rotate-180" : "rotate-0"}
                `}
              />
            </button>

            {/* PROFILE PANEL */}
            <div
              role="menu"
              aria-hidden={!profileMenuOpen}
              className={`
                absolute right-0 top-full z-50 mt-2
                w-[220px] origin-top-right
                overflow-hidden rounded-xl
                border border-border
                bg-surface
                shadow-lg shadow-black/10
                transition-[opacity,transform,visibility]
                duration-200 ease-out
                motion-reduce:transition-none
                ${
                  profileMenuOpen
                    ? "visible translate-y-0 scale-100 opacity-100"
                    : "invisible -translate-y-2 scale-[0.98] opacity-0"
                }
              `}
            >
              {/* USER INFORMATION */}
              <div className="border-b border-border px-4 py-3">
                <p className="truncate text-sm font-semibold text-foreground">
                  {userName}
                </p>

                <p className="mt-0.5 truncate text-xs text-muted">
                  {userEmail}
                </p>
              </div>

              {/* MENU ITEMS */}
              <div className="p-1.5">
                <Link
                  href="/profile"
                  role="menuitem"
                  tabIndex={profileMenuOpen ? 0 : -1}
                  onClick={() => setProfileMenuOpen(false)}
                  className="
                    flex items-center gap-3
                    rounded-lg px-3 py-2.5
                    text-sm text-foreground
                    transition-colors duration-150
                    hover:bg-primary-light
                    hover:text-primary
                  "
                >
                  <UserCircle size={19} weight="regular" />
                  <span>Profil Saya</span>
                </Link>

                <Link
                  href="/settings"
                  role="menuitem"
                  tabIndex={profileMenuOpen ? 0 : -1}
                  onClick={() => setProfileMenuOpen(false)}
                  className="
                    flex items-center gap-3
                    rounded-lg px-3 py-2.5
                    text-sm text-foreground
                    transition-colors duration-150
                    hover:bg-primary-light
                    hover:text-primary
                  "
                >
                  <Gear size={19} weight="regular" />
                  <span>Pengaturan Akun</span>
                </Link>
              </div>
            </div>
          </div>
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
