
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCircle,
  DotsThree,
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
  markAllNotificationsAsRead,
  type NotificationItem,
  type DeletedNotification,
} from "@/lib/notification-store";

/* =========================================================
   NOTIFICATION ICONS
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
  general: "bg-muted text-muted-foreground",
} satisfies Record<NotificationItem["type"], string>;

const typeLabels: Record<NotificationItem["type"], string> = {
  visit: "Kunjungan",
  equipment: "Equipment",
  customer: "Customer",
  user: "Akun",
  monitoring: "Monitoring",
  general: "Umum",
};

/* =========================================================
   NOTIFICATIONS PAGE
========================================================= */

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);

  const [activeFilter, setActiveFilter] = useState<
    "all" | "unread"
  >("all");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(
    null
  );

  const [snackbar, setSnackbar] = useState<{
    message: string;
    deleted: DeletedNotification[];
  } | null>(null);

  const [exitingIds, setExitingIds] = useState<string[]>([]);

  const touchStartRef = useRef<{
    x: number;
    y: number;
  } | null>(null);

  const suppressSwipeClickRef = useRef(false);

  /* =======================================================
     SYNC NOTIFICATIONS
  ======================================================= */

  useEffect(() => {
    const syncNotifications = () => {
      const latest = loadNotifications();

      setNotifications(latest);

      setSelectedIds((current) =>
        current.filter((id) =>
          latest.some((item) => item.id === id)
        )
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

  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  const filteredNotifications = notifications.filter((item) =>
    activeFilter === "unread" ? !item.isRead : true
  );

  const selectedCount = selectedIds.length;

  const allFilteredSelected =
    filteredNotifications.length > 0 &&
    filteredNotifications.every((item) =>
      selectedIds.includes(item.id)
    );

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
  };

  /* =======================================================
     READ ACTIONS
  ======================================================= */

  const handleMarkOneAsRead = (id: string) => {
    markNotificationAsRead(id);
    setActiveMenuId(null);
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
    setSelectedIds([]);
  };

  /* =======================================================
     DELETE & UNDO
  ======================================================= */

  const finishDeletion = (
    ids: string[],
    message: string
  ) => {
    const deleted = deleteNotifications(ids);

    if (deleted.length === 0) return;

    setSelectedIds((current) =>
      current.filter((id) => !ids.includes(id))
    );

    setActiveMenuId(null);
    setExitingIds([]);
    setSnackbar({ message, deleted });
  };

  const handleDeleteOne = (id: string) => {
    finishDeletion([id], "Notifikasi dihapus");
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;

    const count = selectedIds.length;

    finishDeletion(
      selectedIds,
      `${count} notifikasi dihapus`
    );
  };

  const handleUndo = () => {
    if (!snackbar) return;

    undoDeleteNotifications(snackbar.deleted);
    setSnackbar(null);
  };

  /* =======================================================
     DEMO DATA RESET
  ======================================================= */

  const handleResetDemo = () => {
    saveNotifications(demoNotifications);
    setSelectedIds([]);
    setActiveFilter("all");
    setActiveMenuId(null);
    setSnackbar(null);
  };

  /* =======================================================
     MOBILE SWIPE TO DELETE
  ======================================================= */

  const handleTouchStart = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    const touch = event.touches[0];

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };

    suppressSwipeClickRef.current = false;
  };

  const handleTouchEnd = (
    event: React.TouchEvent<HTMLDivElement>,
    id: string
  ) => {
    if (!touchStartRef.current) return;

    const touch = event.changedTouches[0];

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    touchStartRef.current = null;

    if (deltaX < -85 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      suppressSwipeClickRef.current = true;

      setExitingIds((current) =>
        current.includes(id) ? current : [...current, id]
      );

      window.setTimeout(() => {
        handleDeleteOne(id);
        suppressSwipeClickRef.current = false;
      }, 220);
    }
  };

  const handleDetailClick = (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    if (suppressSwipeClickRef.current) {
      event.preventDefault();
      suppressSwipeClickRef.current = false;
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-white">
      <div className="page-enter mx-auto w-full max-w-5xl px-4 py-4 pb-28 sm:px-6 sm:py-5 lg:px-8 lg:pb-8">

        {/* SUMMARY */}
        <section className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-border bg-white p-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bell size={21} weight="duotone" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Belum dibaca
              </p>

              <p className="text-xl font-semibold tabular-nums text-foreground">
                {unreadCount}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-[#F1F2F5] disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
          >
            <Check size={16} />
            <span className="hidden sm:inline">
              Tandai semua dibaca
            </span>
            <span className="sm:hidden">
              Tandai dibaca
            </span>
          </button>
        </section>

        {/* FILTER */}
        <section className="mb-4 flex items-center justify-between gap-3">
          <div className="inline-flex rounded-lg bg-[#F1F2F5] p-1">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              aria-pressed={activeFilter === "all"}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === "all"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("unread")}
              aria-pressed={activeFilter === "unread"}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === "unread"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Belum dibaca

              {unreadCount > 0 && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <span className="text-xs tabular-nums text-muted-foreground">
            {filteredNotifications.length} notifikasi
          </span>
        </section>

        {/* SELECTION TOOLBAR */}
        {filteredNotifications.length > 0 && (
          <section className="mb-3 flex min-h-9 flex-wrap items-center justify-between gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4 cursor-pointer rounded border-border accent-primary"
              />

              {allFilteredSelected
                ? "Batalkan pilih semua"
                : "Pilih semua"}
            </label>

            {selectedCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {selectedCount} dipilih
                </span>

                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded-lg px-2 py-2 text-xs font-medium text-muted-foreground hover:bg-[#F1F2F5]"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                >
                  <Trash size={15} />
                  Hapus ({selectedCount})
                </button>
              </div>
            )}
          </section>
        )}

        {/* NOTIFICATION LIST */}
        <section className="overflow-visible rounded-xl border border-border bg-white">

          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-border">

              {filteredNotifications.map((item) => {
                const Icon = iconMap[item.type];
                const isSelected = selectedIds.includes(item.id);
                const isExiting = exitingIds.includes(item.id);

                return (
                  <div key={item.id}>

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
                        className="h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary"
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

                      {/* DESKTOP ACTION MENU */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId((current) =>
                              current === item.id ? null : item.id
                            )
                          }
                          aria-label="Menu notifikasi"
                          aria-expanded={activeMenuId === item.id}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[#F1F2F5] hover:text-foreground"
                        >
                          <DotsThree size={22} weight="bold" />
                        </button>

                        {activeMenuId === item.id && (
                          <>
                            <button
                              type="button"
                              aria-label="Tutup menu"
                              className="fixed inset-0 z-20 cursor-default"
                              onClick={() => setActiveMenuId(null)}
                            />

                            <div className="absolute right-0 top-10 z-30 w-48 rounded-xl border border-border bg-white p-1.5 shadow-lg">
                              {!item.isRead && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleMarkOneAsRead(item.id)
                                  }
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-foreground hover:bg-[#F1F2F5]"
                                >
                                  <Check size={17} />
                                  Tandai sudah dibaca
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteOne(item.id)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash size={17} />
                                Hapus notifikasi
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* MOBILE CARD */}
                    <div
                      onTouchStart={handleTouchStart}
                      onTouchEnd={(event) =>
                        handleTouchEnd(event, item.id)
                      }
                      className={`relative flex items-start gap-3 overflow-hidden p-4 transition-all duration-200 md:hidden ${
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
                        className="mt-3 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary"
                      />

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
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F2F5] text-muted-foreground">
                {activeFilter === "unread" ? (
                  <CheckCircle size={28} weight="duotone" />
                ) : (
                  <Bell size={28} weight="duotone" />
                )}
              </div>

              <h3 className="text-base font-semibold text-foreground">
                {activeFilter === "unread"
                  ? "Semua sudah dibaca"
                  : "Belum ada notifikasi"}
              </h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {activeFilter === "unread"
                  ? "Tidak ada notifikasi yang perlu dibaca."
                  : "Aktivitas terbaru akan muncul di sini."}
              </p>

              {notifications.length === 0 && (
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  Muat 15 data demo
                </button>
              )}
            </div>
          )}
        </section>

        {/* DEMO INFORMATION */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Data notifikasi saat ini merupakan data demo untuk pengujian tampilan.
        </p>

      </div>

      {/* SNACKBAR */}
      {snackbar && (
        <div
          role="status"
          aria-live="polite"
          className="snackbar-enter fixed bottom-20 left-4 right-4 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl bg-[#292929] px-4 py-3 text-white shadow-xl md:bottom-6"
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
        </div>
      )}

      <style jsx>{`
        .page-enter {
          animation: notification-enter 220ms ease-out both;
        }

        .notification-exit {
          opacity: 0;
          transform: translateX(-100%);
          max-height: 0;
          padding-top: 0;
          padding-bottom: 0;
          overflow: hidden;
        }

        .snackbar-enter {
          animation: snackbar-enter 220ms ease-out both;
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

        @media (prefers-reduced-motion: reduce) {
          .page-enter,
          .snackbar-enter {
            animation: none;
          }

          .notification-exit {
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}
