"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Bell,
  CaretDown,
  Check,
  ClipboardText,
  Gear,
  MagnifyingGlass,
  Monitor,
  UserCircle,
  Wrench,
  X,
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

const notificationIcons = {
  visit: Wrench,
  equipment: Monitor,
  user: UserCircle,
  general: ClipboardText,
};

const notificationStyles = {
  visit: "bg-primary-light text-primary",
  equipment: "bg-orange-50 text-orange-600",
  user: "bg-surface-secondary text-muted",
  general: "bg-surface-secondary text-muted",
};

function getDropdownAnimation(isOpen: boolean) {
  return `
    pointer-events-${isOpen ? "auto" : "none"}
    translate-y-${isOpen ? "0" : "-1"}
    scale-${isOpen ? "100" : "[0.98]"}
    opacity-${isOpen ? "100" : "0"}
    ${isOpen ? "duration-200" : "duration-150"}
  `;
}

function EmptyNotificationIllustration() {
  return (
    <svg
      viewBox="0 0 180 130"
      width="180"
      height="130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ilustrasi belum ada notifikasi"
    >
      <ellipse
        cx="90"
        cy="112"
        rx="62"
        ry="8"
        fill="#F2F2F2"
      />

      <circle cx="90" cy="61" r="48" fill="#F9EEEE" />
      <circle cx="90" cy="61" r="37" fill="#F3DCDD" />

      <path
        d="M90 28C78.4 28 69 37.4 69 49V61C69 68 65.5 73.5 60 78H120C114.5 73.5 111 68 111 61V49C111 37.4 101.6 28 90 28Z"
        fill="#6F010E"
      />

      <path
        d="M81 85C82.7 91 87 94 90 94C93 94 97.3 91 99 85"
        stroke="#6F010E"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <path
        d="M90 20V15"
        stroke="#B10618"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M49 43L43 39"
        stroke="#C26C5D"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M131 43L137 39"
        stroke="#C26C5D"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <circle cx="43" cy="76" r="4" fill="#FEAF27" />
      <circle cx="137" cy="76" r="4" fill="#FEAF27" />

      <path
        d="M37 22L40 16L43 22L49 25L43 28L40 34L37 28L31 25L37 22Z"
        fill="#FEAF27"
      />

      <path
        d="M139 17L141 13L143 17L147 19L143 21L141 25L139 21L135 19L139 17Z"
        fill="#C26C5D"
      />

      <path
        d="M70 103H110"
        stroke="#C26C5D"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
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

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const displayedNotificationCount =
    notifications.length > 0 ? unreadCount : notificationCount;

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen((previous) => !previous);
    setNotificationMenuOpen(false);
  };

  const toggleNotificationMenu = () => {
    setNotificationMenuOpen((previous) => !previous);
    setProfileMenuOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (!profileMenuRef.current?.contains(target)) {
        setProfileMenuOpen(false);
      }

      if (!notificationMenuRef.current?.contains(target)) {
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
    <header className="
      sticky top-0 z-20 w-full
      border-b border-border
      bg-surface/95 backdrop-blur-md
      transition-colors duration-200
    ">
      {/* HEADER MAIN */}
      <div className="
        flex min-h-[68px] items-center justify-between gap-3
        px-4 py-3 sm:min-h-[76px] sm:px-6 lg:px-8
      ">
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
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              type="search"
              value={searchValue}
              onChange={handleSearch}
              placeholder="Cari sesuatu..."
              aria-label="Pencarian"
              className="
                h-10 w-full rounded-control
                border border-border bg-background
                pl-10 pr-3 text-xs text-foreground
                outline-none transition-all duration-200
                placeholder:text-muted
                focus:border-primary focus:bg-surface
                focus:ring-2 focus:ring-primary/10
              "
            />
          </div>

          {/* MOBILE SEARCH TOGGLE */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((previous) => !previous)}
            aria-label={mobileSearchOpen ? "Tutup pencarian" : "Buka pencarian"}
            aria-expanded={mobileSearchOpen}
            className="
              flex h-10 w-10 items-center justify-center
              rounded-control text-muted
              transition-all duration-200
              hover:bg-primary-light hover:text-primary
              active:scale-95 motion-reduce:transition-none
              md:hidden
            "
          >
            {mobileSearchOpen ? <X size={21} /> : <MagnifyingGlass size={21} />}
          </button>

          {/* NOTIFICATION DROPDOWN */}
          <div className="relative" ref={notificationMenuRef}>
            <button
              type="button"
              onClick={toggleNotificationMenu}
              aria-label={
                displayedNotificationCount > 0
                  ? `${displayedNotificationCount} notifikasi belum dibaca`
                  : "Notifikasi"
              }
              aria-expanded={notificationMenuOpen}
              aria-haspopup="true"
              className="
                relative flex h-10 w-10 shrink-0
                items-center justify-center rounded-control
                text-muted transition-all duration-200
                hover:bg-primary-light hover:text-primary
                active:scale-95 motion-reduce:transition-none
              "
            >
              <Bell
                size={21}
                weight={notificationMenuOpen ? "fill" : "regular"}
              />

              {displayedNotificationCount > 0 && (
                <span className="
                  absolute right-1 top-1
                  flex h-[17px] min-w-[17px]
                  items-center justify-center rounded-full
                  border-2 border-surface bg-danger
                  px-1 text-[9px] font-bold text-white
                ">
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
                origin-top-right overflow-hidden rounded-xl
                border border-border bg-surface
                shadow-lg shadow-black/10
                transform-gpu will-change-transform
                transition-[opacity,transform]
                ease-[cubic-bezier(0.2,0.7,0.3,1)]
                motion-reduce:transition-none
                ${getDropdownAnimation(notificationMenuOpen)}
              `}
            >
              {/* NOTIFICATION HEADER */}
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
                    tabIndex={notificationMenuOpen ? 0 : -1}
                    className="
                      flex items-center gap-1.5 rounded-md
                      px-2 py-1.5 text-[11px] font-medium
                      text-primary transition-colors
                      hover:bg-primary-light
                      disabled:cursor-not-allowed disabled:opacity-50
                    "
                  >
                    <Check size={15} />
                    Tandai dibaca
                  </button>
                )}
              </div>

              {/* NOTIFICATION LIST */}
              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-border">
                    {notifications.slice(0, 5).map((item) => {
                      const Icon = notificationIcons[item.type || "general"];

                      return (
                        <Link
                          key={item.id}
                          href={item.href || "/notifications"}
                          tabIndex={notificationMenuOpen ? 0 : -1}
                          onClick={() => setNotificationMenuOpen(false)}
                          className="
                            flex items-start gap-3 px-4 py-3.5
                            transition-colors duration-150
                            hover:bg-background
                          "
                        >
                          <div className={`
                            flex h-9 w-9 shrink-0 items-center
                            justify-center rounded-lg
                            ${notificationStyles[item.type || "general"]}
                          `}>
                            <Icon size={19} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-foreground">
                                {item.title}
                              </p>

                              {!item.isRead && (
                                <span className="
                                  mt-1.5 h-2 w-2 shrink-0
                                  rounded-full bg-primary
                                " />
                              )}
                            </div>

                            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted">
                              {item.description}
                            </p>

                            <p className="mt-1.5 text-[10px] text-muted">
                              {item.time}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  /* EMPTY STATE */
                  <div className="flex flex-col items-center px-5 py-7 text-center">
                    <EmptyNotificationIllustration />

                    <p className="mt-1 text-sm font-semibold text-foreground">
                      Semua sudah terpantau!
                    </p>

                    <p className="mt-1 max-w-[230px] text-xs leading-relaxed text-muted">
                      Belum ada notifikasi baru. Informasi aktivitas MOKU akan
                      muncul di sini.
                    </p>
                  </div>
                )}
              </div>

              {/* NOTIFICATION FOOTER */}
              <div className="border-t border-border p-2">
                <Link
                  href="/notifications"
                  tabIndex={notificationMenuOpen ? 0 : -1}
                  onClick={() => setNotificationMenuOpen(false)}
                  className="
                    flex items-center justify-center gap-2
                    rounded-lg px-3 py-2.5
                    text-xs font-semibold text-primary
                    transition-colors duration-150
                    hover:bg-primary-light
                  "
                >
                  Lihat Semua Notifikasi <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="hidden h-9 w-px bg-border sm:block" />

          {/* PROFILE DROPDOWN */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={toggleProfileMenu}
              aria-label="Menu akun pengguna"
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
              className="
                flex items-center gap-2 rounded-control p-1.5
                transition-colors duration-200
                hover:bg-primary-light active:scale-[0.98]
                sm:gap-3 sm:px-2
                motion-reduce:transition-none
              "
            >
              <div className="
                flex h-9 w-9 shrink-0 items-center
                justify-center rounded-control
                bg-primary-light text-xs font-bold text-primary
              ">
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
                  hidden text-muted transition-transform duration-200
                  ease-out motion-reduce:transition-none sm:block
                  ${profileMenuOpen ? "rotate-180" : "rotate-0"}
                `}
              />
            </button>

            {/* PROFILE PANEL */}
            <div
              role="menu"
              aria-hidden={!profileMenuOpen}
              className={`
                ${dropdownTransitionClasses}
                w-[220px]
                transform-gpu will-change-transform
                ${getDropdownAnimation(profileMenuOpen)}
              `}
            >
              <div className="border-b border-border px-4 py-3">
                <p className="truncate text-sm font-semibold text-foreground">
                  {userName}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted">
                  {userEmail}
                </p>
              </div>

              <div className="p-1.5">
                <Link
                  href="/profile"
                  role="menuitem"
                  tabIndex={profileMenuOpen ? 0 : -1}
                  onClick={() => setProfileMenuOpen(false)}
                  className="
                    flex items-center gap-3 rounded-lg
                    px-3 py-2.5 text-sm text-foreground
                    transition-colors duration-150
                    hover:bg-primary-light hover:text-primary
                  "
                >
                  <UserCircle size={19} />
                  <span>Profil Saya</span>
                </Link>

                <Link
                  href="/settings"
                  role="menuitem"
                  tabIndex={profileMenuOpen ? 0 : -1}
                  onClick={() => setProfileMenuOpen(false)}
                  className="
                    flex items-center gap-3 rounded-lg
                    px-3 py-2.5 text-sm text-foreground
                    transition-colors duration-150
                    hover:bg-primary-light hover:text-primary
                  "
                >
                  <Gear size={19} />
                  <span>Pengaturan Akun</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE SEARCH PANEL */}
      <div
        aria-hidden={!mobileSearchOpen}
        className={`
          grid transition-all duration-200 ease-out
          motion-reduce:transition-none md:hidden
          ${
            mobileSearchOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }
        `}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-3">
            <div className="relative">
              <MagnifyingGlass
                size={19}
                className="
                  pointer-events-none absolute left-3
                  top-1/2 -translate-y-1/2 text-muted
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
                  border border-border bg-background
                  pl-10 pr-3 text-sm text-foreground
                  outline-none transition-all duration-200
                  placeholder:text-muted
                  focus:border-primary focus:bg-surface
                  focus:ring-2 focus:ring-primary/10
                "
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
