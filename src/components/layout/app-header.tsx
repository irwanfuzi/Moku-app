
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
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

import {
  loadNotifications,
  saveNotifications,
  subscribeNotifications,
  type NotificationItem,
} from "@/lib/notification-store";

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

const searchSuggestions = [
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
    id: "monitor-001",
    title: "Belum Dikunjungi",
    subtitle: "Monitoring periode November 2026",
    category: "Monitoring",
    href: "/monitoring",
    icon: MapPin,
  },
];

const notificationIcons = {
  visit: Wrench,
  equipment: Monitor,
  user: User,
  monitoring: ClipboardText,
  general: Bell,
};

const notificationStyles = {
  visit: "bg-primary-light text-primary",
  equipment: "bg-orange-50 text-orange-600",
  user: "bg-surface-secondary text-muted",
  monitoring: "bg-amber-50 text-amber-700",
  general: "bg-surface-secondary text-muted",
};

function SearchSuggestionList({
  query,
  onClose,
}: {
  query: string;
  onClose: () => void;
}) {
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (normalized.length < 2) return [];

    return searchSuggestions
      .filter((item) =>
        `${item.title} ${item.subtitle} ${item.category}`
          .toLowerCase()
          .includes(normalized)
      )
      .slice(0, 8);
  }, [query]);

  if (query.trim().length < 2) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-[100] mt-2 overflow-hidden rounded-xl border border-border bg-white shadow-[0_5px_18px_rgba(0,0,0,0.055)]">
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
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[#F1F2F5]"
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
            className="mx-auto text-[#A0A0A0]"
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
  notifications: _initialNotifications,
  onMarkAllNotificationsRead,
  userName = "Pengguna",
  userEmail = "Akun MOKU",
}: AppHeaderProps) {
  const pathname = usePathname();
  const isNotificationsPage = pathname === "/notifications";

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsReady, setNotificationsReady] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncNotifications = () => {
      setNotifications(loadNotifications());
      setNotificationsReady(true);
    };

    syncNotifications();
    return subscribeNotifications(syncNotifications);
  }, []);

  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  const displayedNotificationCount = notificationsReady
    ? unreadCount
    : notificationCount;

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

  const markAllAsRead = () => {
    const updated = notifications.map((item) => ({
      ...item,
      isRead: true,
    }));

    saveNotifications(updated);
    onMarkAllNotificationsRead?.();
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

      if (
        !desktopSearchRef.current?.contains(target) &&
        !mobileSearchRef.current?.contains(target)
      ) {
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

  useEffect(() => {
    if (isNotificationsPage) {
      setMobileSearchOpen(false);
      setSearchOpen(false);
      setNotificationMenuOpen(false);
      setProfileMenuOpen(false);
    }
  }, [isNotificationsPage]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/95 shadow-[0_1px_2px_rgba(0,0,0,0.025)] backdrop-blur-md transition-colors duration-200">
      <div className="flex min-h-[68px] items-center justify-between gap-3 px-4 py-3 sm:min-h-[76px] sm:px-6 lg:px-8">
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

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          {!isNotificationsPage && (
            <div
              ref={desktopSearchRef}
              className="relative hidden w-48 lg:block lg:w-64"
            >
              <MagnifyingGlass
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]"
              />
              <input
                type="search"
                value={searchValue}
                onChange={handleSearch}
                onFocus={() => setSearchOpen(true)}
                placeholder="Cari equipment, customer..."
                aria-label="Pencarian"
                className="h-10 w-full rounded-control border border-transparent bg-[#F1F2F5] pl-10 pr-3 text-xs text-foreground outline-none transition-all duration-200 placeholder:text-[#777777] focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
              />

              {searchOpen && (
                <SearchSuggestionList
                  query={searchValue}
                  onClose={closeSearch}
                />
              )}
            </div>
          )}

          {!isNotificationsPage && (
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen((previous) => !previous);
                setSearchOpen(false);
              }}
              aria-label="Buka pencarian"
              aria-expanded={mobileSearchOpen}
              className="flex h-10 w-10 items-center justify-center rounded-control text-muted transition-all hover:bg-primary-light hover:text-primary active:scale-95 lg:hidden"
            >
              {mobileSearchOpen ? (
                <X size={21} />
              ) : (
                <MagnifyingGlass size={21} />
              )}
            </button>
          )}

          {!isNotificationsPage && (
            <Link
              href="/notifications"
              aria-label={`${displayedNotificationCount} notifikasi belum dibaca`}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-muted transition-all hover:bg-primary-light hover:text-primary active:scale-95 lg:hidden"
            >
              <Bell size={21} />
              {displayedNotificationCount > 0 && (
                <span className="absolute right-1 top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-white bg-danger px-1 text-[9px] font-bold text-white">
                  {displayedNotificationCount > 99
                    ? "99+"
                    : displayedNotificationCount}
                </span>
              )}
            </Link>
          )}

          {!isNotificationsPage && (
            <div
              ref={notificationMenuRef}
              className="relative hidden lg:block"
            >
              <button
                type="button"
                onClick={toggleNotificationMenu}
                aria-label="Notifikasi"
                aria-expanded={notificationMenuOpen}
                className="relative flex h-10 w-10 items-center justify-center rounded-control text-muted transition-all hover:bg-primary-light hover:text-primary"
              >
                <Bell
                  size={21}
                  weight={notificationMenuOpen ? "fill" : "regular"}
                />
                {displayedNotificationCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-white bg-danger px-1 text-[9px] font-bold text-white">
                    {displayedNotificationCount > 99
                      ? "99+"
                      : displayedNotificationCount}
                  </span>
                )}
              </button>

              <div
                aria-hidden={!notificationMenuOpen}
                className={`absolute right-0 top-full z-50 mt-2 w-[360px] origin-top-right overflow-hidden rounded-xl border border-border bg-white shadow-[0_5px_18px_rgba(0,0,0,0.055)] transition-all duration-200 ${
                  notificationMenuOpen
                    ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0"
                }`}
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">
                      Notifikasi
                    </h2>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {unreadCount} belum dibaca
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium text-primary hover:bg-primary-light"
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
                        const Icon = notificationIcons[item.type];

                        return (
                          <Link
                            key={item.id}
                            href={item.href || "/notifications"}
                            onClick={() =>
                              setNotificationMenuOpen(false)
                            }
                            className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-[#F1F2F5]"
                          >
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${notificationStyles[item.type]}`}
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
                    <div className="px-5 py-8 text-center">
                      <Bell
                        size={28}
                        className="mx-auto text-muted"
                      />
                      <p className="mt-3 text-sm font-semibold text-foreground">
                        Belum ada notifikasi
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Aktivitas terbaru MOKU akan muncul di sini.
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-border p-2">
                  <Link
                    href="/notifications"
                    onClick={() => setNotificationMenuOpen(false)}
                    className="flex items-center justify-center rounded-lg px-3 py-2.5 text-xs font-semibold text-primary hover:bg-primary-light"
                  >
                    Lihat Semua Notifikasi →
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="hidden h-9 w-px bg-border/70 lg:block" />

          <div
            ref={profileMenuRef}
            className="relative hidden lg:block"
          >
            <button
              type="button"
              onClick={toggleProfileMenu}
              aria-label="Menu akun pengguna"
              aria-expanded={profileMenuOpen}
              className="flex items-center gap-2 rounded-control p-1.5 transition-colors hover:bg-primary-light sm:gap-3 sm:px-2"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/10 bg-primary/5">
                <User
                  size={21}
                  weight="duotone"
                  className="text-primary"
                />
              </span>

              <div className="min-w-0 text-left">
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
                className={`text-muted transition-transform ${
                  profileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              aria-hidden={!profileMenuOpen}
              className={`absolute right-0 top-full z-50 mt-2 w-[220px] overflow-hidden rounded-xl border border-border bg-white shadow-[0_5px_18px_rgba(0,0,0,0.055)] transition-all ${
                profileMenuOpen
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-1 opacity-0"
              }`}
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
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-primary-light hover:text-primary"
                >
                  <User size={19} />
                  Profil Saya
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-primary-light hover:text-primary"
                >
                  <Gear size={19} />
                  Pengaturan Akun
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isNotificationsPage && (
        <div
          ref={mobileSearchRef}
          aria-hidden={!mobileSearchOpen}
          className={`relative z-[60] grid transition-all duration-200 ease-out lg:hidden ${
            mobileSearchOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-visible">
            <div className="px-4 pb-4 pt-3">
              <div className="relative">
                <MagnifyingGlass
                  size={19}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]"
                />
                <input
                  type="search"
                  value={searchValue}
                  onChange={handleSearch}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Cari equipment, customer..."
                  aria-label="Pencarian mobile"
                  tabIndex={mobileSearchOpen ? 0 : -1}
                  className="h-11 w-full rounded-control border border-transparent bg-[#F1F2F5] pl-10 pr-3 text-sm text-foreground outline-none transition-all placeholder:text-[#777777] focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
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
      )}
    </header>
  );
}
