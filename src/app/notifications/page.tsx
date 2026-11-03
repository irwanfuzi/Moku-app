
"use client";

import { useEffect, useRef, useState } from "react";
import type { TouchEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCircle,
  Monitor,
  Trash,
  User,
  Users,
  Wrench,
  X,
} from "@phosphor-icons/react";

import {
  demoNotifications,
  loadNotifications,
  saveNotifications,
  subscribeNotifications,
  deleteNotifications,
  undoDeleteNotifications,
  markNotificationAsRead,
  type NotificationItem,
  type DeletedNotification,
} from "@/lib/notification-store";

/* =========================================================
   NOTIFICATION CONFIGURATION
========================================================= */

const iconMap = {
  visit: Wrench,
  equipment: Monitor,
  customer: Users,
  user: User,
  monitoring: CheckCircle,
  general: Bell,
} satisfies Record<NotificationItem["type"], typeof Bell>;

const iconColorMap = {
  visit: "bg-primary/10 text-primary",
  equipment: "bg-orange-50 text-orange-600",
  customer: "bg-sky-50 text-sky-600",
  user: "bg-violet-50 text-violet-600",
  monitoring: "bg-amber-50 text-amber-700",
  general: "bg-[#F1F2F5] text-gray-600",
} satisfies Record<NotificationItem["type"], string>;

const typeLabels: Record<NotificationItem["type"], string> = {
  visit: "Kunjungan",
  equipment: "Equipment",
  customer: "Customer",
  user: "Akun",
  monitoring: "Monitoring",
  general: "Umum",
};

type FilterType =
  | "all"
  | "unread"
  | "visit"
  | "equipment"
  | "customer"
  | "monitoring"
  | "user"
  | "general";

const filters: { id: FilterType; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "unread", label: "Belum Dibaca" },
  { id: "visit", label: "Kunjungan" },
  { id: "equipment", label: "Equipment" },
  { id: "customer", label: "Customer" },
  { id: "monitoring", label: "Monitoring" },
  { id: "user", label: "Akun" },
  { id: "general", label: "Umum" },
];

/* =========================================================
   EMPTY STATE ILLUSTRATION
   Only displayed when the notification database is empty.
========================================================= */

function EmptyNotificationIllustration() {
  return (
    <svg
      viewBox="0 0 320 220"
      role="img"
      aria-label="Ilustrasi belum ada notifikasi"
      className="h-auto w-[210px] sm:w-[250px] md:w-[280px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Decorative shapes */}
      <path
        d="M42 145C28 116 49 77 82 69C111 62 132 79 149 65C170 47 203 45 228 66C258 91 276 124 258 155C242 183 199 187 161 179C120 171 62 181 42 145Z"
        fill="#F8F0F1"
      />

      <circle cx="66" cy="70" r="5" fill="#F28C0F" />
      <circle cx="258" cy="83" r="4" fill="#BF0B2C" />
      <circle cx="244" cy="151" r="3" fill="#F28C0F" />
      <path
        d="M82 43L86 53L96 57L86 61L82 71L78 61L68 57L78 53L82 43Z"
        fill="#F28C0F"
      />
      <path
        d="M235 43L238 50L245 53L238 56L235 63L232 56L225 53L232 50L235 43Z"
        fill="#BF0B2C"
      />

      {/* Floating notification card */}
      <g transform="rotate(-8 103 112)">
        <rect
          x="57"
          y="91"
          width="88"
          height="67"
          rx="13"
          fill="white"
          stroke="#E8D9DC"
          strokeWidth="2"
        />
        <rect x="70" y="105" width="30" height="6" rx="3" fill="#E9DADD" />
        <rect x="70" y="117" width="56" height="5" rx="2.5" fill="#F0E8E9" />
        <rect x="70" y="128" width="43" height="5" rx="2.5" fill="#F0E8E9" />
        <circle cx="127" cy="105" r="5" fill="#F28C0F" />
      </g>

      {/* Main bell body */}
      <path
        d="M160 53C135 53 117 73 117 99V121C117 132 110 141 101 149C97 153 100 160 106 160H214C220 160 223 153 219 149C210 141 203 132 203 121V99C203 73 185 53 160 53Z"
        fill="#730217"
      />

      {/* Bell highlight */}
      <path
        d="M135 75C142 66 151 62 161 62"
        stroke="#BF5267"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Bell base */}
      <path
        d="M145 164C147 174 153 180 160 180C167 180 173 174 175 164H145Z"
        fill="#F28C0F"
      />

      {/* Bell clapper */}
      <circle cx="160" cy="151" r="5" fill="#F28C0F" />

      {/* Small notification badge */}
      <circle cx="202" cy="66" r="17" fill="#F28C0F" />
      <path
        d="M196 66L200 70L208 61"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bottom soft shadow */}
      <ellipse cx="160" cy="192" rx="76" ry="8" fill="#EADDE0" />
    </svg>
  );
}

/* =========================================================
   NOTIFICATIONS PAGE
========================================================= */

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    message: string;
    deleted: DeletedNotification[];
  } | null>(null);

  const [swipeOffsets, setSwipeOffsets] = useState<Record<string, number>>({});
  const [exitingIds, setExitingIds] = useState<string[]>([]);

  const touchStartRef = useRef<{
    id: string;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressClickRef = useRef(false);

  /* =======================================================
     SYNC NOTIFICATIONS
  ======================================================= */

  useEffect(() => {
    const syncNotifications = () => {
      const latest = loadNotifications();

      setNotifications(latest);

      setSelectedIds((current) =>
        current.filter((id) => latest.some((item) => item.id === id))
      );
    };

    syncNotifications();

    return subscribeNotifications(syncNotifications);
  }, []);

  /* =======================================================
     SNACKBAR AUTO DISMISS
  ======================================================= */

  useEffect(() => {
    if (!snackbar) return;

    const timeout = window.setTimeout(() => {
      setSnackbar(null);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [snackbar]);

  /* =======================================================
     FILTER & COUNTS
  ======================================================= */

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !item.isRead;

    return item.type === activeFilter;
  });

  const selectedCount = selectedIds.length;

  const allFilteredSelected =
    filteredNotifications.length > 0 &&
    filteredNotifications.every((item) => selectedIds.includes(item.id));

  /* =======================================================
     SELECTION
  ======================================================= */

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    );
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      const visibleIds = new Set(
        filteredNotifications.map((item) => item.id)
      );

      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.has(id))
      );

      return;
    }

    setSelectedIds((current) =>
      Array.from(
        new Set([
          ...current,
          ...filteredNotifications.map((item) => item.id),
        ])
      )
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  const enterSelectionMode = (id?: string) => {
    setIsSelectionMode(true);

    if (id) {
      setSelectedIds((current) =>
        current.includes(id) ? current : [...current, id]
      );
    }
  };

  /* =======================================================
     READ ACTION
  ======================================================= */

  const handleMarkSelectedAsRead = () => {
    selectedIds.forEach((id) => {
      markNotificationAsRead(id);
    });

    clearSelection();
  };

  /* =======================================================
     DELETE & UNDO
  ======================================================= */

  const finishDeletion = (ids: string[], message: string) => {
    const deleted = deleteNotifications(ids);

    if (deleted.length === 0) return;

    setSelectedIds((current) =>
      current.filter((id) => !ids.includes(id))
    );

    setIsSelectionMode(false);
    setSwipeOffsets({});
    setExitingIds([]);

    setSnackbar({ message, deleted });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;

    const count = selectedIds.length;

    finishDeletion(selectedIds, `${count} notifikasi dihapus`);
  };

  const handleUndo = () => {
    if (!snackbar) return;

    undoDeleteNotifications(snackbar.deleted);
    setSnackbar(null);
  };

  /* =======================================================
     DEMO DATA
  ======================================================= */

  const handleResetDemo = () => {
    saveNotifications(demoNotifications);

    setSelectedIds([]);
    setIsSelectionMode(false);
    setActiveFilter("all");
    setSnackbar(null);
  };

  /* =======================================================
     MOBILE TOUCH INTERACTION
  ======================================================= */

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchStart = (
    event: TouchEvent<HTMLDivElement>,
    id: string
  ) => {
    if (isSelectionMode) return;

    const touch = event.touches[0];

    touchStartRef.current = {
      id,
      x: touch.clientX,
      y: touch.clientY,
      moved: false,
    };

    suppressClickRef.current = false;

    clearLongPressTimer();

    longPressTimerRef.current = setTimeout(() => {
      enterSelectionMode(id);
      suppressClickRef.current = true;
      touchStartRef.current = null;
    }, 550);
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>, id: string) => {
    if (isSelectionMode || !touchStartRef.current) return;
    if (touchStartRef.current.id !== id) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      clearLongPressTimer();
      touchStartRef.current.moved = true;
    }

    // Only handle horizontal left swipe.
    if (deltaX < 0 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      setSwipeOffsets((current) => ({
        ...current,
        [id]: Math.max(deltaX, -130),
      }));
    }
  };

  const handleTouchEnd = (id: string) => {
    clearLongPressTimer();

    if (isSelectionMode || !touchStartRef.current) {
      touchStartRef.current = null;
      return;
    }

    const offset = swipeOffsets[id] ?? 0;

    touchStartRef.current = null;

    if (offset < -85) {
      suppressClickRef.current = true;

      setExitingIds((current) =>
        current.includes(id) ? current : [...current, id]
      );

      setSwipeOffsets((current) => ({
        ...current,
        [id]: -320,
      }));

      window.setTimeout(() => {
        finishDeletion([id], "Notifikasi dihapus");
        suppressClickRef.current = false;
      }, 220);

      return;
    }

    setSwipeOffsets((current) => ({
      ...current,
      [id]: 0,
    }));
  };

  const handleDetailClick = (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      suppressClickRef.current = false;
    }
  };

  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, []);

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  const isCompletelyEmpty = notifications.length === 0;
  const isFilterEmpty =
    notifications.length > 0 && filteredNotifications.length === 0;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-white">
      <div className="page-enter mx-auto w-full max-w-5xl px-4 pb-36 pt-3 sm:px-6 sm:pt-5 md:pb-8 lg:px-8">

        {/* MOBILE HEADER */}
        <div className="mb-5 flex items-center justify-between md:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              aria-label="Kembali"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-[#F1F2F5]"
            >
              <ArrowLeft size={21} />
            </Link>

            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-foreground">
                Notifikasi
              </h1>
              <p className="text-xs text-muted-foreground">
                Informasi dan aktivitas terbaru
              </p>
            </div>
          </div>

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (isSelectionMode) {
                  clearSelection();
                } else {
                  enterSelectionMode();
                }
              }}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                isSelectionMode
                  ? "bg-[#F1F2F5] text-foreground"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {isSelectionMode ? "Batal" : "Pilih"}
            </button>
          )}
        </div>

        {/* DESKTOP PAGE TITLE */}
        <div className="mb-6 hidden md:block">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Notifikasi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Informasi dan aktivitas terbaru dari MOKU.
          </p>
        </div>

        {/* FILTER */}
        {!isCompletelyEmpty && (
          <section className="mb-4">
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:px-0">
              {filters.map((filter) => {
                const isActive = activeFilter === filter.id;

                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => {
                      setActiveFilter(filter.id);
                      setSelectedIds([]);
                      setIsSelectionMode(false);
                    }}
                    aria-pressed={isActive}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors sm:text-sm ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-[#F1F2F5] text-muted-foreground hover:bg-[#E9EAED] hover:text-foreground"
                    }`}
                  >
                    {filter.label}

                    {filter.id === "unread" && unreadCount > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* SELECTION TOOLBAR */}
        {filteredNotifications.length > 0 && (
          <>
            {/* DESKTOP TOOLBAR */}
            <section className="mb-3 hidden min-h-11 items-center justify-between rounded-lg border border-border bg-white px-3 md:flex">
              {selectedCount > 0 ? (
                <>
                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 cursor-pointer accent-primary"
                      />
                      {allFilteredSelected
                        ? "Batalkan pilih semua"
                        : "Pilih semua"}
                    </label>

                    <span className="text-xs text-muted-foreground">
                      {selectedCount} dipilih
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleMarkSelectedAsRead}
                      title="Tandai sudah dibaca"
                      aria-label="Tandai sudah dibaca"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[#F1F2F5] hover:text-primary"
                    >
                      <Check size={19} />
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteSelected}
                      title="Hapus notifikasi"
                      aria-label="Hapus notifikasi"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash size={19} />
                    </button>

                    <button
                      type="button"
                      onClick={clearSelection}
                      title="Batalkan pilihan"
                      aria-label="Batalkan pilihan"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[#F1F2F5] hover:text-foreground"
                    >
                      <X size={19} />
                    </button>
                  </div>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {filteredNotifications.length} notifikasi
                </span>
              )}
            </section>

            {/* MOBILE SELECTION INFO */}
            {isSelectionMode && (
              <section className="mb-3 flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2.5 md:hidden">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 accent-primary"
                  />
                  {allFilteredSelected
                    ? "Batalkan pilih semua"
                    : "Pilih semua"}
                </label>

                <span className="text-xs text-muted-foreground">
                  {selectedCount} dipilih
                </span>
              </section>
            )}
          </>
        )}

        {/* NOTIFICATION LIST */}
        <section className="overflow-hidden rounded-xl border border-border bg-white">

          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredNotifications.map((item) => {
                const Icon = iconMap[item.type];
                const isSelected = selectedIds.includes(item.id);
                const isExiting = exitingIds.includes(item.id);
                const swipeOffset = swipeOffsets[item.id] ?? 0;

                return (
                  <div key={item.id} className="relative overflow-hidden">

                    {/* MOBILE SWIPE BACKGROUND */}
                    <div className="absolute inset-y-0 right-0 flex w-28 items-center justify-center bg-red-600 md:hidden">
                      <Trash size={21} className="text-white" />
                    </div>

                    {/* DESKTOP ROW */}
                    <div
                      className={`relative hidden items-center gap-4 px-5 py-4 transition-colors md:flex ${
                        isSelected
                          ? "bg-primary/[0.06]"
                          : !item.isRead
                            ? "bg-primary/[0.025]"
                            : "bg-white"
                      } ${
                        isExiting ? "notification-exit" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(item.id)}
                        aria-label={`Pilih ${item.title}`}
                        className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
                      />

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconColorMap[item.type]}`}
                      >
                        <Icon size={20} weight="duotone" />
                      </div>

                      <Link
                        href={`/notifications/${encodeURIComponent(item.id)}`}
                        className="min-w-0 flex-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {item.title}
                          </span>

                          {!item.isRead && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>

                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </Link>

                      <div className="hidden w-24 shrink-0 text-right lg:block">
                        <span className="text-xs text-muted-foreground">
                          {typeLabels[item.type]}
                        </span>
                      </div>

                      <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
                        {item.time}
                      </span>
                    </div>

                    {/* MOBILE ROW */}
                    <div
                      onTouchStart={(event) =>
                        handleTouchStart(event, item.id)
                      }
                      onTouchMove={(event) =>
                        handleTouchMove(event, item.id)
                      }
                      onTouchEnd={() => handleTouchEnd(item.id)}
                      onTouchCancel={() => {
                        clearLongPressTimer();
                        touchStartRef.current = null;
                        setSwipeOffsets((current) => ({
                          ...current,
                          [item.id]: 0,
                        }));
                      }}
                      className={`relative flex items-start gap-3 overflow-hidden p-4 transition-colors md:hidden ${
                        isSelected
                          ? "bg-primary/[0.06]"
                          : !item.isRead
                            ? "bg-primary/[0.025]"
                            : "bg-white"
                      } ${
                        isExiting ? "notification-exit" : ""
                      }`}
                      style={{
                        transform: `translateX(${swipeOffset}px)`,
                        transition:
                          touchStartRef.current?.id === item.id &&
                          touchStartRef.current.moved
                            ? "none"
                            : "transform 220ms ease",
                        touchAction: "pan-y",
                      }}
                    >
                      {isSelectionMode && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(item.id)}
                          aria-label={`Pilih ${item.title}`}
                          className="mt-3 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                        />
                      )}

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconColorMap[item.type]}`}
                      >
                        <Icon size={20} weight="duotone" />
                      </div>

                      <Link
                        href={`/notifications/${encodeURIComponent(item.id)}`}
                        onClick={handleDetailClick}
                        className="min-w-0 flex-1 outline-none"
                      >
                        <div className="flex items-center gap-2">
                          <p className="line-clamp-1 text-sm font-semibold text-foreground">
                            {item.title}
                          </p>

                          {!item.isRead && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>

                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {typeLabels[item.type]}
                          </span>

                          <span className="text-[11px] text-muted-foreground">
                            ·
                          </span>

                          <span className="text-[11px] text-muted-foreground">
                            {item.time}
                          </span>
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : isCompletelyEmpty ? (
            /* EMPTY DATABASE: ILLUSTRATION */
            <div className="flex min-h-[390px] flex-col items-center justify-center px-5 py-10 text-center sm:min-h-[440px]">
              <EmptyNotificationIllustration />

              <h2 className="mt-3 text-base font-semibold text-foreground sm:text-lg">
                Belum Ada Notifikasi
              </h2>

              <p className="mt-1 max-w-full text-xs text-muted-foreground sm:text-sm">
                Aktivitas dan informasi terbaru akan muncul di sini.
              </p>

              <button
                type="button"
                onClick={handleResetDemo}
                className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-primary/90 sm:text-sm"
              >
                Muat 15 Data Demo
              </button>
            </div>
          ) : (
            /* FILTER EMPTY: TEXT ONLY */
            <div className="flex min-h-[130px] items-center justify-center px-5 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                {activeFilter === "unread"
                  ? "Semua notifikasi sudah dibaca."
                  : `Tidak ada notifikasi kategori ${filters.find((filter) => filter.id === activeFilter)?.label ?? ""}.`}
              </p>
            </div>
          )}
        </section>

        {/* DEMO INFORMATION */}
        {notifications.length > 0 && (
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Data notifikasi saat ini merupakan data demo untuk pengujian tampilan.
          </p>
        )}
      </div>

      {/* MOBILE FLOATING ACTION BAR */}
      {isSelectionMode && selectedCount > 0 && (
        <div className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] left-4 right-4 z-40 mx-auto flex max-w-md items-center justify-between rounded-xl border border-border bg-white px-3 py-2.5 shadow-lg md:hidden">
          <span className="text-xs font-medium text-muted-foreground">
            {selectedCount} dipilih
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleMarkSelectedAsRead}
              aria-label="Tandai sudah dibaca"
              title="Tandai sudah dibaca"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[#F1F2F5] hover:text-primary"
            >
              <Check size={20} />
            </button>

            <button
              type="button"
              onClick={handleDeleteSelected}
              aria-label="Hapus notifikasi"
              title="Hapus notifikasi"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash size={20} />
            </button>

            <button
              type="button"
              onClick={clearSelection}
              aria-label="Batalkan pilihan"
              title="Batalkan pilihan"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[#F1F2F5] hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* SNACKBAR WITH UNDO */}
      {snackbar && (
        <div
          role="status"
          aria-live="polite"
          className="snackbar-enter fixed bottom-[calc(82px+env(safe-area-inset-bottom))] left-4 right-4 z-50 mx-auto flex max-w-md items-center justify-between gap-3 overflow-hidden rounded-xl bg-[#292929] px-4 py-3 text-white shadow-xl md:bottom-6"
        >
          <div className="flex min-w-0 items-center gap-2">
            <CheckCircle
              size={20}
              weight="fill"
              className="shrink-0 text-green-400"
            />

            <span className="truncate text-sm">
              {snackbar.message}
            </span>
          </div>

          <button
            type="button"
            onClick={handleUndo}
            className="shrink-0 rounded-md px-2 py-1.5 text-xs font-bold tracking-wide text-[#FDD563] transition-colors hover:bg-white/10"
          >
            URUNGKAN
          </button>

          <button
            type="button"
            onClick={() => setSnackbar(null)}
            aria-label="Tutup notifikasi"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>

          <div className="snackbar-progress absolute bottom-0 left-0 h-[3px] bg-[#F28C0F]" />
        </div>
      )}

      <style jsx>{`
        .page-enter {
          animation: notification-enter 220ms ease-out both;
        }

        .notification-exit {
          animation: notification-exit 220ms ease-in forwards;
          pointer-events: none;
        }

        .snackbar-enter {
          animation: snackbar-enter 220ms ease-out both;
        }

        .snackbar-progress {
          animation: snackbar-countdown 5s linear forwards;
        }

        @keyframes notification-enter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes notification-exit {
          from {
            opacity: 1;
            max-height: 120px;
          }

          to {
            opacity: 0;
            max-height: 0;
          }
        }

        @keyframes snackbar-enter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes snackbar-countdown {
          from {
            width: 100%;
          }

          to {
            width: 0%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .page-enter,
          .snackbar-enter,
          .notification-exit,
          .snackbar-progress {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
