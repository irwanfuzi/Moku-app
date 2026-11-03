
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCircle,
  ClipboardText,
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
  type NotificationItem,
} from "@/lib/notification-store";

/* =========================================================
   NOTIFICATION ICONS
========================================================= */

const iconMap = {
  visit: Wrench,
  equipment: Monitor,
  customer: Users,
  user: User,
  monitoring: ClipboardText,
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

  /* =======================================================
     SYNC NOTIFICATIONS
  ======================================================= */

  useEffect(() => {
    const syncNotifications = () => {
      const latestNotifications = loadNotifications();

      setNotifications(latestNotifications);

      setSelectedIds((current) =>
        current.filter((id) =>
          latestNotifications.some((item) => item.id === id)
        )
      );
    };

    syncNotifications();

    return subscribeNotifications(syncNotifications);
  }, []);

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
     SELECTION ACTIONS
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
      const filteredIds = filteredNotifications.map(
        (item) => item.id
      );

      setSelectedIds((current) =>
        current.filter((id) => !filteredIds.includes(id))
      );

      return;
    }

    setSelectedIds((current) => {
      const combined = new Set([
        ...current,
        ...filteredNotifications.map((item) => item.id),
      ]);

      return Array.from(combined);
    });
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  /* =======================================================
     NOTIFICATION ACTIONS
  ======================================================= */

  const markAllAsRead = () => {
    saveNotifications(
      notifications.map((item) => ({
        ...item,
        isRead: true,
      }))
    );
  };

  const deleteNotification = (id: string) => {
    const target = notifications.find((item) => item.id === id);

    if (!target) return;

    const confirmed = window.confirm(
      `Hapus notifikasi "${target.title}"?`
    );

    if (!confirmed) return;

    saveNotifications(
      notifications.filter((item) => item.id !== id)
    );

    setSelectedIds((current) =>
      current.filter((selectedId) => selectedId !== id)
    );
  };

  const deleteSelectedNotifications = () => {
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus ${selectedIds.length} notifikasi yang dipilih?`
    );

    if (!confirmed) return;

    const remainingNotifications = notifications.filter(
      (item) => !selectedIds.includes(item.id)
    );

    saveNotifications(remainingNotifications);
    setSelectedIds([]);
  };

  const restoreDemoNotifications = () => {
    saveNotifications(demoNotifications);
    setSelectedIds([]);
    setActiveFilter("all");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-white">
      <div className="page-enter mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 lg:px-8">

        {/* SUMMARY */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bell size={22} weight="duotone" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Belum dibaca
              </p>

              <p className="text-2xl font-semibold tabular-nums text-foreground">
                {unreadCount}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[#F1F2F5] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check size={17} />
            Tandai semua dibaca
          </button>
        </div>

        {/* FILTER */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-fit rounded-lg bg-[#F1F2F5] p-1">
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
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === "unread"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Belum dibaca

              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-primary px-1.5 py-0.5 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <span className="text-xs text-muted-foreground">
            {filteredNotifications.length} notifikasi
          </span>
        </div>

        {/* SELECTION TOOLBAR */}
        {filteredNotifications.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
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
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {selectedCount} dipilih
                </span>

                <button
                  type="button"
                  onClick={clearSelection}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-[#F1F2F5] hover:text-foreground"
                >
                  <X size={16} />
                  Batal
                </button>

                <button
                  type="button"
                  onClick={deleteSelectedNotifications}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  <Trash size={16} />
                  Hapus Dipilih ({selectedCount})
                </button>
              </div>
            )}
          </div>
        )}

        {/* NOTIFICATION LIST */}
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredNotifications.map((item) => {
                const Icon = iconMap[item.type];
                const isSelected = selectedIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 p-4 transition-colors sm:gap-4 sm:p-5 ${
                      isSelected
                        ? "bg-primary/[0.06]"
                        : !item.isRead
                          ? "bg-primary/[0.025]"
                          : "bg-white"
                    }`}
                  >
                    {/* CHECKBOX */}
                    <div className="flex shrink-0 items-center pt-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(item.id)}
                        aria-label={`Pilih notifikasi ${item.title}`}
                        className="h-4 w-4 cursor-pointer rounded border-border accent-primary"
                      />
                    </div>

                    {/* ICON */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconColorMap[item.type]}`}
                    >
                      <Icon size={20} weight="duotone" />
                    </div>

                    {/* CONTENT */}
                    <Link
                      href={`/notifications/${encodeURIComponent(item.id)}`}
                      className="min-w-0 flex-1 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      aria-label={`Buka detail notifikasi: ${item.title}`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {item.title}
                        </p>

                        {!item.isRead && (
                          <span
                            className="h-2 w-2 rounded-full bg-primary"
                            aria-label="Belum dibaca"
                          />
                        )}
                      </div>

                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>

                      <p className="mt-2 text-xs text-muted-foreground">
                        {item.time}
                      </p>
                    </Link>

                    {/* DELETE ACTION */}
                    <button
                      type="button"
                      onClick={() =>
                        deleteNotification(item.id)
                      }
                      aria-label={`Hapus notifikasi ${item.title}`}
                      title="Hapus notifikasi"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash size={17} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
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
                  onClick={restoreDemoNotifications}
                  className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  Muat ulang data demo
                </button>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Data notifikasi saat ini merupakan data demo untuk pengujian
          tampilan.
        </p>
      </div>

      <style jsx>{`
        .page-enter {
          animation: notification-enter 220ms ease-out both;
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

        @media (prefers-reduced-motion: reduce) {
          .page-enter {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
