
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  Bell,
  CaretDown,
  Check,
  ClipboardText,
  Gear,
  MagnifyingGlass,
  Monitor,
  User,
  Wrench,
  X,
  Users,
  MapPin,
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

interface SearchSuggestion {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  href: string;
  icon: typeof Monitor;
}

const searchSuggestions: SearchSuggestion[] = [
  {
    id: "eq-001",
    title: "MOKU-001",
    subtitle: "Canon imageRUNNER ADVANCE · PT Maju Jaya",
    category: "Equipment",
    href: "/equipment",
    icon: Monitor,
  },
  {
    id: "eq-002",
    title: "MOKU-002",
    subtitle: "Ricoh IM 3500 · PT Sinar Abadi",
    category: "Equipment",
    href: "/equipment",
    icon: Monitor,
  },
  {
    id: "customer-001",
    title: "PT Maju Jaya",
    subtitle: "Jakarta Selatan",
    category: "Customer",
    href: "/customers",
    icon: Users,
  },
  {
    id: "customer-002",
    title: "PT Sinar Abadi",
    subtitle: "Jakarta Barat",
    category: "Customer",
    href: "/customers",
    icon: Users,
  },
  {
    id: "visit-001",
    title: "Preventive Maintenance",
    subtitle: "MOKU-001 · 2 November 2026",
    category: "Kunjungan",
    href: "/visits",
    icon: Wrench,
  },
  {
    id: "visit-002",
    title: "Unscheduled Maintenance",
    subtitle: "MOKU-002 · 1 November 2026",
    category: "Kunjungan",
    href: "/visits",
    icon: ClipboardText,
  },
  {
    id: "user-001",
    title: "Andi Pratama",
    subtitle: "Teknisi",
    category: "Teknisi",
    href: "/users",
    icon: User,
  },
  {
    id: "user-002",
    title: "Budi Santoso",
    subtitle: "Teknisi",
    category: "Teknisi",
    href: "/users",
    icon: User,
  },
  {
    id: "monitor-001",
    title: "Belum Dikunjungi",
    subtitle: "Monitoring periode November 2026",
    category: "Monitoring",
    href: "/monitoring",
    icon: MapPin,
  },
  {
    id: "monitor-002",
    title: "Sudah Dikunjungi",
    subtitle: "Monitoring periode November 2026",
    category: "Monitoring",
    href: "/monitoring",
    icon: Check,
  },
];

const notificationIcons = {
  visit: Wrench,
  equipment: Monitor,
  user: User,
  general: ClipboardText,
};

const notificationStyles = {
  visit: "bg-primary-light text-primary",
  equipment: "bg-orange-50 text-orange-600",
  user: "bg-surface-secondary text-muted",
  general: "bg-surface-secondary text-muted",
};

const dropdownBase = `
  absolute right-0 top-full z-50 mt-2
  origin-top-right overflow-hidden rounded-xl
  border border-border bg-surface
  shadow-[0_5px_18px_rgba(0,0,0,0.055)]
  transform-gpu transition-[opacity,transform]
  ease-out motion-reduce:transition-none
`;

const dropdownOpen = `
  pointer-events-auto translate-y-0 scale-100
  opacity-100 duration-200
`;

const dropdownClosed = `
  pointer-events-none -translate-y-1 scale-[0.98]
  opacity-0 duration-150
`;

function EmptyNotificationIllustration() {
  return (
    <svg
      viewBox="0 0 200 140"
      width="190"
      height="132"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ilustrasi notifikasi kosong"
    >
      <ellipse cx="100" cy="122" rx="66" ry="7" fill="#F3E9E9" />

      <rect
        x="43"
        y="35"
        width="100"
        height="68"
        rx="12"
        fill="#F8EAEA"
        transform="rotate(-8 43 35)"
      />

      <rect
        x="57"
        y="29"
        width="100"
        height="68"
        rx="12"
        fill="#FDF6F5"
        stroke="#EBCFD1"
        strokeWidth="1.5"
        transform="rotate(5 57 29)"
      />

      <rect x="75" y="46" width="48" height="5" rx="2.5" fill="#E8C8CB" />
      <rect x="75" y="58" width="65" height="4" rx="2" fill="#EADBDD" />
      <rect x="75" y="68" width="52" height="4" rx="2" fill="#EADBDD" />

      <circle cx="60" cy="53" r="12" fill="#F3DCDD" />
      <path
        d="M60 46C56.7 46 54 48.7 54 52V56C54 58 53 59.5 51 61H69C67 59.5 66 58 66 56V52C66 48.7 63.3 46 60 46Z"
        fill="#6F010E"
      />
      <path
        d="M57 64C57.5 66 58.5 67 60 67C61.5 67 62.5 66 63 64"
        stroke="#6F010E"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <circle cx="151" cy="38" r="13" fill="#FEAF27" />
      <path
        d="M145 38L149 42L157 34"
        stroke="#6F010E"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="39" cy="84" r="4" fill="#C26C5D" />
      <circle cx="166" cy="83" r="3" fill="#FEAF27" />

      <path
        d="M35 29L38 23L41 29L47 32L41 35L38 41L35 35L29 32L35 29Z"
        fill="#FEAF27"
      />
    </svg>
  );
}

function SearchSuggestionList({
  query,
  onClose,
}: {
  query: string;
  onClose: () => void;
}) {
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.length < 2) return [];

    return searchSuggestions
      .filter((item) =>
        `${item.title} ${item.subtitle} ${item.category}`
          .toLowerCase()
          .includes(normalizedQuery)
      )
      .slice(0, 8);
  }, [query]);

  if (query.trim().length < 2) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-surface shadow-[0_5px_18px_rgba(0,0,0,0.055)]">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-semibold text-foreground">
          Hasil pencarian
        </p>
        <p className="mt-0.5 text-[10px] text-muted">
          Contoh data sementara MOKU
        </p>
      </div>

      {results.length > 0 ? (
        <div className="max-h-[340px] overflow-y-auto p-1.5">
          {results.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-background"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <Icon size={19} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-muted">
                    {item.subtitle}
                  </p>
                </div>

                <span className="shrink-0 text-[9px] text-muted">
                  {item.category}
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-7 text-center">
          <MagnifyingGlass
            size={24}
            className="mx-auto text-muted"
            weight="light"
          />
          <p className="mt-2 text-xs font-medium text-foreground">
            Tidak ada hasil ditemukan
          </p>
          <p className="mt-1 text-[10px] text-muted">
            Coba kata kunci lainnya.
          </p>
        </div>
      )}
    </div>
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const displayedNotificationCount =
    notifications.length > 0 ? unreadCount : notificationCount;

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    setSearchOpen(true);
    onSearch?.(value);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setMobileSearchOpen(false);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen((previous) => !previous);
    setNotificationMenuOpen(false);
    setSearchOpen(false);
  };

  const toggleNotificationMenu = () => {
    setNotificationMenuOpen((previous) => !previous);
    setProfileMenuOpen(false);
    setSearchOpen(false);
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

      if (!searchRef.current?.contains(target)) {
        setSearchOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
        setNotificationMenuOpen(false);
        setSearchOpen(false);
        setMobileSearchOpen(false);
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
        border-b border-border/50
        bg-surface/95 backdrop-blur-md
        shadow-[0_1px_2px_rgba(0,0,0,0.025)]
        transition-colors duration-200
      "
    >
      {/* HEADER MAIN */}
      <div
        className="
          flex min-h-[68px] items-center justify-between gap-3
          px-4 py-3 sm:min-h-[76px] sm:px-6 lg:px-8
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
          <div className="relative hidden w-48 md:block lg:w-64" ref={searchRef}>
            <MagnifyingGlass
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              type="search"
              value={searchValue}
              onChange={handleSearch}
              onFocus={() => setSearchOpen(true)}
              placeholder="Cari equipment, customer..."
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

            {searchOpen && (
              <SearchSuggestionList
                query={searchValue}
                onClose={closeSearch}
              />
            )}
          </div>

          {/* MOBILE SEARCH BUTTON */}
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen((previous) => !previous);
              setSearchOpen(false);
            }}
            aria-label={
              mobileSearchOpen ? "Tutup pencarian" : "Buka pencarian"
            }
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
            {mobileSearchOpen ? (
              <X size={21} />
            ) : (
              <MagnifyingGlass size={21} />
            )}
          </button>

          {/* NOTIFICATION: MOBILE SUBPAGE */}
          <Link
            href="/notifications"
            aria-label={
              displayedNotificationCount > 0
                ? `${displayedNotificationCount} notifikasi belum dibaca`
                : "Notifikasi"
            }
            className="
              relative flex h-10 w-10 shrink-0
              items-center justify-center rounded-control
              text-muted transition-all duration-200
              hover:bg-primary-light hover:text-primary
              active:scale-95 motion-reduce:transition-none
              md:hidden
            "
          >
            <Bell size={21} />

            {displayedNotificationCount > 0 && (
              <span className="absolute right-1 top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-surface bg-danger px-1 text-[9px] font-bold text-white">
                {displayedNotificationCount > 99
                  ? "99+"
                  : displayedNotificationCount}
              </span>
            )}
          </Link>

          {/* NOTIFICATION DROPDOWN: DESKTOP */}
          <div className="relative hidden md:block" ref={notificationMenuRef}>
            <button
              type="button"
              onClick={toggleNotificationMenu}
              aria-label="Notifikasi"
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
                <span className="absolute right-1 top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-surface bg-danger px-1 text-[9px] font-bold text-white">
                  {displayedNotificationCount > 99
                    ? "99+"
                    : displayedNotificationCount}
                </span>
              )}
            </button>

            <div
              aria-hidden={!notificationMenuOpen}
              className={`
                ${dropdownBase}
                w-[360px]
                ${notificationMenuOpen ? dropdownOpen : dropdownClosed}
              `}
            >
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

              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-border">
                    {notifications.slice(0, 5).map((item) => {
                      const Icon =
                        notificationIcons[item.type || "general"];

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
                          <div
                            className={`
                              flex h-9 w-9 shrink-0 items-center
                              justify-center rounded-lg
                              ${notificationStyles[item.type || "general"]}
                            `}
                          >
                            <Icon size={19} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-foreground">
                                {item.title}
                              </p>

                              {!item.isRead && (
                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
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
                  <div className="flex flex-col items-center px-5 py-6 text-center">
                    <EmptyNotificationIllustration />
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      Belum ada notifikasi
                    </p>
                    <p className="mt-1 whitespace-nowrap text-[11px] text-muted">
                      Aktivitas terbaru akan muncul di sini.
                    </p>
                  </div>
                )}
              </div>

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
          <div className="hidden h-9 w-px bg-border/70 sm:block" />

          {/* PROFILE: DESKTOP ONLY */}
          <div className="relative hidden sm:block" ref={profileMenuRef}>
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
              <User
                size={23}
                weight="duotone"
                className="text-primary"
              />

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

            <div
              role="menu"
              aria-hidden={!profileMenuOpen}
              className={`
                ${dropdownBase}
                w-[220px]
                ${profileMenuOpen ? dropdownOpen : dropdownClosed}
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
                  <User size={19} />
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
        ref={searchRef}
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
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                type="search"
                value={searchValue}
                onChange={handleSearch}
                onFocus={() => setSearchOpen(true)}
                placeholder="Cari equipment, customer..."
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

              {searchOpen && mobileSearchOpen && (
                <SearchSuggestionList
                  query={searchValue}
                  onClose={closeSearch}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
