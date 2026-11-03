"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TouchEvent, MouseEvent } from "react";
import Link from "next/link";
import {
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
   CONFIGURATION
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

/* =========================================================
   CUSTOM MOKU CHECKBOX
========================================================= */

function MokuCheckbox({
  checked,
  onChange,
  label,
  className = "",
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onChange();
      }}
      className={`group flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#730217]/30 focus-visible:ring-offset-2 ${
        checked
          ? "border-[#730217] bg-[#730217] text-white shadow-sm shadow-[#730217]/15"
          : "border-[#D5D7DC] bg-white text-transparent hover:border-[#730217] hover:bg-[#730217]/[0.04]"
      } ${className}`}
    >
      <Check
        size={13}
        weight="bold"
        className={`transition-all duration-150 ${
          checked ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      />
    </button>
  );
}

/* =========================================================
   DATE FORMATTER
========================================================= */

function formatNotificationDate(value: unknown, fallback?: string) {
  if (value === null || value === undefined || value === "") {
    return fallback ?? "";
  }

  const date =
    value instanceof Date
      ? value
      : typeof value === "number"
        ? new Date(value)
        : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return fallback ?? "";
  }

  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }

  const isSameYear = date.getFullYear() === now.getFullYear();

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    ...(isSameYear ? {} : { year: "numeric" }),
  }).format(date);
}

/* =========================================================
   MOKU EMPTY STATE WATERMARK
========================================================= */

function EmptyNotificationWatermark() {
  return (
    <svg
      viewBox="0 0 360 280"
      aria-hidden="true"
      className="h-auto w-[250px] sm:w-[290px] md:w-[330px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Soft background shape */}
      <path
        d="M45 166C29 120 67 75 112 75C143 75 157 91 183 76C220 54 269 79 298 113C330 151 304 202 266 215C218 232 164 211 121 221C83 230 54 205 45 166Z"
        fill="#F8F0F1"
      />

      {/* Decorative details */}
      <g opacity="0.55">
        <circle cx="76" cy="96" r="5" fill="#F28C0F" />
        <circle cx="288" cy="111" r="5" fill="#BF0B2C" />
        <path
          d="M102 55L106 65L116 69L106 73L102 83L98 73L88 69L98 65L102 55Z"
          fill="#F28C0F"
        />
        <path
          d="M274 64L278 73L287 77L278 81L274 90L270 81L261 77L270 73L274 64Z"
          fill="#BF0B2C"
        />
      </g>

      {/* MOKU location mark */}
      <g opacity="0.34">
        <path
          d="M180 47C145 47 118 74 118 108C118 151 180 205 180 205C180 205 242 151 242 108C242 74 215 47 180 47Z"
          fill="#730217"
        />
        <path
          d="M180 63C154 63 134 83 134 109C134 139 180 180 180 180C180 180 226 139 226 109C226 83 206 63 180 63Z"
          fill="#F8F0F1"
        />
      </g>

      {/* Simplified robot face */}
      <g opacity="0.52">
        <rect
          x="145"
          y="93"
          width="70"
          height="52"
          rx="17"
          fill="#730217"
        />

        <rect
          x="154"
          y="104"
          width="52"
          height="31"
          rx="10"
          fill="#F2F2F2"
        />

        <rect
          x="165"
          y="112"
          width="6"
          height="13"
          rx="3"
          fill="#730217"
        />

        <rect
          x="189"
          y="112"
          width="6"
          height="13"
          rx="3"
          fill="#730217"
        />

        {/* Robot cap */}
        <path
          d="M151 95C151 78 163 68 180 68C197 68 209 78 209 95H151Z"
          fill="#BF0B2C"
        />

        <path
          d="M173 79L180 74L187 79V88H173V79Z"
          fill="#FFFFFF"
        />

        <path
          d="M148 94H212C217 94 221 98 221 102V105H139V102C139 98 143 94 148 94Z"
          fill="#F28C0F"
        />

        {/* Side modules */}
        <rect
          x="132"
          y="105"
          width="13"
          height="28"
          rx="6"
          fill="#F28C0F"
        />

        <rect
          x="215"
          y="105"
          width="13"
          height="28"
          rx="6"
          fill="#F28C0F"
        />
      </g>

      {/* Floating notification symbols */}
      <g opacity="0.4">
        <rect
          x="64"
          y="158"
          width="44"
          height="34"
          rx="8"
          fill="white"
          stroke="#DCC8CC"
          strokeWidth="2"
        />

        <path
          d="M75 170H96M75 178H91"
          stroke="#BF0B2C"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <circle cx="276" cy="177" r="20" fill="#F28C0F" />

        <path
          d="M267 177L273 183L285 170"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Ground shadow */}
      <ellipse
        cx="180"
        cy="238"
        rx="94"
        ry="9"
        fill="#EADDE0"
        opacity="0.55"
      />
    </svg>
  );
}

/* =========================================================
   NOTIFICATIONS PAGE
========================================================= */

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    message: string;
    deleted: DeletedNotification[];
    readUndo?: { id: string; isRead: boolean }[];
  } | null>(null);

  const [swipeOffsets, setSwipeOffsets] = useState<Record<string, number>>(
    {}
  );

  const [exitingIds, setExitingIds] = useState<string[]>([]);

  const touchStartRef = useRef<{
    id: string;
    x: number;
    y: number;
    moved: boolean;
    horizontal: boolean;
  } | null>(null);

  const swipeOffsetRef = useRef<Record<string, number>>({});

  const longPressTimerRef = useRef<number | null>(null);
  const deleteTimerRef = useRef<number | null>(null);

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
     NOTIFICATION COUNTS
  ======================================================= */

  const totalCount = notifications.length;

  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  const selectedCount = selectedIds.length;

  const allNotificationsSelected =
    notifications.length > 0 &&
    notifications.every((item) => selectedIds.includes(item.id));

  /* =======================================================
     SELECTION
  ======================================================= */

  const toggleSelection = (id: string) => {
    setSelectedIds((current) => {
      const next = current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id];

      if (next.length === 0) {
        setIsSelectionMode(false);
      }

      return next;
    });
  };

  const enterSelectionMode = (id?: string) => {
    setIsSelectionMode(true);

    if (id) {
      setSelectedIds((current) =>
        current.includes(id) ? current : [...current, id]
      );
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  const toggleSelectAll = () => {
    if (allNotificationsSelected) {
      clearSelection();
      return;
    }

    setSelectedIds(notifications.map((item) => item.id));
    setIsSelectionMode(true);
  };

  /* =======================================================
     READ ACTION & UNDO
  ======================================================= */

  const handleMarkAsRead = (id: string) => {
    const target = notifications.find((item) => item.id === id);

    if (!target || target.isRead) return;

    markNotificationAsRead(id);

    setSnackbar({
      message: "1 ditandai sudah dibaca",
      deleted: [],
      readUndo: [{ id, isRead: false }],
    });
  };

  const handleMarkSelectedAsRead = () => {
    const targets = notifications.filter(
      (item) => selectedIds.includes(item.id) && !item.isRead
    );

    if (targets.length === 0) {
      clearSelection();
      return;
    }

    targets.forEach((item) => {
      markNotificationAsRead(item.id);
    });

    setSnackbar({
      message: `${targets.length} ditandai sudah dibaca`,
      deleted: [],
      readUndo: targets.map((item) => ({
        id: item.id,
        isRead: item.isRead,
      })),
    });

    clearSelection();
  };

  /* =======================================================
     DELETE & UNDO
  ======================================================= */

  const finishDeletion = useCallback(
    (ids: string[], message: string) => {
      const deleted = deleteNotifications(ids);

      if (deleted.length === 0) return;

      setSelectedIds((current) =>
        current.filter((id) => !ids.includes(id))
      );

      setIsSelectionMode(false);

      setSwipeOffsets({});
      swipeOffsetRef.current = {};

      setExitingIds([]);

      setSnackbar({
        message,
        deleted,
      });
    },
    []
  );

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

    if (snackbar.deleted.length > 0) {
      undoDeleteNotifications(snackbar.deleted);
    }

    if (snackbar.readUndo && snackbar.readUndo.length > 0) {
      const undoMap = new Map(
        snackbar.readUndo.map((item) => [item.id, item.isRead])
      );

      const latest = loadNotifications().map((item) => ({
        ...item,
        isRead: undoMap.has(item.id)
          ? undoMap.get(item.id)!
          : item.isRead,
      }));

      saveNotifications(latest);
    }

    setSnackbar(null);
  };

  /* =======================================================
     DEMO DATA
  ======================================================= */

  const handleResetDemo = () => {
    saveNotifications(demoNotifications);

    setSelectedIds([]);
    setIsSelectionMode(false);
    setSnackbar(null);
  };

  /* =======================================================
     MOBILE TOUCH INTERACTION
  ======================================================= */

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const updateSwipeOffset = (id: string, offset: number) => {
    const nextOffset = Math.max(-112, Math.min(0, offset));

    swipeOffsetRef.current = {
      ...swipeOffsetRef.current,
      [id]: nextOffset,
    };

    setSwipeOffsets((current) => ({
      ...current,
      [id]: nextOffset,
    }));
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
      horizontal: false,
    };

    suppressClickRef.current = false;

    clearLongPressTimer();

    longPressTimerRef.current = window.setTimeout(() => {
      enterSelectionMode(id);

      suppressClickRef.current = true;
      touchStartRef.current = null;

      updateSwipeOffset(id, 0);
    }, 550);
  };

  const handleTouchMove = (
    event: TouchEvent<HTMLDivElement>,
    id: string
  ) => {
    const start = touchStartRef.current;

    if (isSelectionMode || !start || start.id !== id) return;

    const touch = event.touches[0];

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      clearLongPressTimer();
      start.moved = true;
    }

    if (
      deltaX < 0 &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.15
    ) {
      start.horizontal = true;

      updateSwipeOffset(id, deltaX);
    }
  };

  const handleTouchEnd = (id: string) => {
    clearLongPressTimer();

    const start = touchStartRef.current;

    if (!start || start.id !== id || isSelectionMode) {
      touchStartRef.current = null;
      return;
    }

    const offset = swipeOffsetRef.current[id] ?? 0;

    touchStartRef.current = null;

    if (offset < -78) {
      suppressClickRef.current = true;

      updateSwipeOffset(id, -112);

      setExitingIds((current) =>
        current.includes(id) ? current : [...current, id]
      );

      if (deleteTimerRef.current !== null) {
        window.clearTimeout(deleteTimerRef.current);
      }

      deleteTimerRef.current = window.setTimeout(() => {
        finishDeletion([id], "1 notifikasi dihapus");

        suppressClickRef.current = false;
        deleteTimerRef.current = null;
      }, 220);

      return;
    }

    updateSwipeOffset(id, 0);
  };

  const handleTouchCancel = (id: string) => {
    clearLongPressTimer();

    touchStartRef.current = null;

    updateSwipeOffset(id, 0);
  };

  const handleDetailClick = (
    event: MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    if (isSelectionMode) {
      event.preventDefault();
      toggleSelection(id);
      return;
    }

    if (suppressClickRef.current) {
      event.preventDefault();
      suppressClickRef.current = false;
    }
  };

  useEffect(() => {
    return () => {
      clearLongPressTimer();

      if (deleteTimerRef.current !== null) {
        window.clearTimeout(deleteTimerRef.current);
      }
    };
  }, []);

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  const isCompletelyEmpty = notifications.length === 0;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-white">
      <div className="page-enter mx-auto w-full max-w-5xl px-4 pb-36 pt-3 sm:px-6 sm:pt-5 md:pb-8 lg:px-8">

        {/* NOTIFICATION SUMMARY */}

        {!isCompletelyEmpty && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#ECEDEF] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {totalCount} notifikasi
              </span>

              <span className="text-[#D5D7DC]">·</span>

              {unreadCount > 0 ? (
                <span className="flex items-center gap-1.5 text-xs font-medium text-[#730217]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#730217]" />
                  {unreadCount} belum dibaca
                </span>
              ) : (
                <span className="text-xs font-medium text-muted-foreground">
                  Semua sudah dibaca
                </span>
              )}
            </div>

            {isSelectionMode && (
              <span className="text-xs font-medium text-[#730217] md:hidden">
                {selectedCount} dipilih
              </span>
            )}
          </div>
        )}

        {/* DESKTOP SELECTION TOOLBAR */}

        {notifications.length > 0 && (
          <div
            className={`mb-2 hidden min-h-11 items-center justify-between rounded-lg border px-3 transition-colors md:flex ${
              selectedCount > 0
                ? "border-[#730217]/15 bg-[#730217]/[0.035]"
                : "border-transparent bg-transparent"
            }`}
          >
            {selectedCount > 0 ? (
              <>
                <div className="flex items-center gap-3">
                  <MokuCheckbox
                    checked={allNotificationsSelected}
                    onChange={toggleSelectAll}
                    label={
                      allNotificationsSelected
                        ? "Batalkan pilih semua"
                        : "Pilih semua"
                    }
                  />

                  <span className="text-xs font-medium text-[#730217]">
                    {selectedCount} dipilih
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleMarkSelectedAsRead}
                    title="Tandai sudah dibaca"
                    aria-label="Tandai sudah dibaca"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[#730217] transition-colors hover:bg-[#730217]/10"
                  >
                    <Check size={19} />
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    title="Hapus notifikasi"
                    aria-label="Hapus notifikasi"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[#BF0B2C] transition-colors hover:bg-[#BF0B2C]/10"
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
                Pilih ikon notifikasi untuk mengelola beberapa notifikasi.
              </span>
            )}
          </div>
        )}

        {/* MOBILE SELECTION INFO */}

        {isSelectionMode && notifications.length > 0 && (
          <div className="mb-3 flex items-center justify-between border-b border-[#ECEDEF] px-1 py-2 md:hidden">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
            >
              <MokuCheckbox
                checked={allNotificationsSelected}
                onChange={toggleSelectAll}
                label={
                  allNotificationsSelected
                    ? "Batalkan pilih semua"
                    : "Pilih semua"
                }
              />

              {allNotificationsSelected
                ? "Batalkan pilih semua"
                : "Pilih semua"}
            </button>

            <span className="text-xs text-muted-foreground">
              {selectedCount} dipilih
            </span>
          </div>
        )}

        {/* NOTIFICATION LIST */}

        <section>
          {notifications.length > 0 ? (
            <div className="divide-y divide-[#ECEDEF]">
              {notifications.map((item) => {
                const Icon = iconMap[item.type];

                const isSelected = selectedIds.includes(item.id);
                const isExiting = exitingIds.includes(item.id);

                const swipeOffset = swipeOffsets[item.id] ?? 0;

                const displayDate = formatNotificationDate(
                  item.createdAt,
                  item.time
                );

                return (
                  <div
                    key={item.id}
                    className="relative overflow-hidden"
                  >
                    {/* DESKTOP ROW */}

                    <div
                      className={`group relative hidden items-center gap-4 rounded-lg px-3 py-4 transition-all duration-150 md:flex ${
                        isSelected
                          ? "bg-[#730217]/[0.055] ring-1 ring-inset ring-[#730217]/10"
                          : !item.isRead
                            ? "bg-[#730217]/[0.018] hover:bg-[#F8F4F5]"
                            : "bg-white hover:bg-[#F7F7F8]"
                      } ${
                        isExiting ? "notification-exit" : ""
                      }`}
                    >
                      <MokuCheckbox
                        checked={isSelected}
                        onChange={() => toggleSelection(item.id)}
                        label={`Pilih ${item.title}`}
                      />

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-150 group-hover:scale-[1.03] ${iconColorMap[item.type]}`}
                      >
                        <Icon size={20} weight="duotone" />
                      </div>

                      <Link
                        href={`/notifications/${encodeURIComponent(item.id)}`}
                        className="min-w-0 flex-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#730217]/30"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {item.title}
                          </span>

                          {!item.isRead && (
                            <span
                              className="h-2 w-2 shrink-0 rounded-full bg-[#730217]"
                              aria-label="Belum dibaca"
                            />
                          )}
                        </div>

                        <p className="mt-1 line-clamp-1 text-sm font-normal text-muted-foreground">
                          {item.description}
                        </p>
                      </Link>

                      <span className="w-24 shrink-0 text-right text-xs font-medium text-muted-foreground">
                        {typeLabels[item.type]}
                      </span>

                      {/* TIME / HOVER ACTIONS */}

                      <div className="flex w-24 shrink-0 items-center justify-end">
                        <span className="text-xs text-muted-foreground transition-opacity group-hover:hidden group-focus-within:hidden">
                          {displayDate}
                        </span>

                        <div className="hidden items-center justify-end gap-1 group-hover:flex group-focus-within:flex">
                          {!item.isRead && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsRead(item.id)}
                              title="Tandai sudah dibaca"
                              aria-label={`Tandai ${item.title} sudah dibaca`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#730217] transition-colors hover:bg-[#730217]/10"
                            >
                              <Check size={17} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              finishDeletion(
                                [item.id],
                                "1 notifikasi dihapus"
                              )
                            }
                            title="Hapus notifikasi"
                            aria-label={`Hapus ${item.title}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#BF0B2C] transition-colors hover:bg-[#BF0B2C]/10"
                          >
                            <Trash size={17} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* MOBILE ROW */}

                    <div className="relative overflow-hidden md:hidden">

                      {/* DELETE BACKGROUND */}

                      <div
                        className="absolute inset-y-0 right-0 flex w-28 items-center justify-center bg-[#BF0B2C]"
                        style={{
                          opacity: Math.min(
                            Math.abs(swipeOffset) / 65,
                            1
                          ),
                        }}
                        aria-hidden="true"
                      >
                        <Trash
                          size={21}
                          weight="bold"
                          className="text-white"
                        />
                      </div>

                      {/* COMPLETE SWIPE CONTENT */}

                      <div
                        onTouchStart={(event) =>
                          handleTouchStart(event, item.id)
                        }
                        onTouchMove={(event) =>
                          handleTouchMove(event, item.id)
                        }
                        onTouchEnd={() => handleTouchEnd(item.id)}
                        onTouchCancel={() => handleTouchCancel(item.id)}
                        onContextMenu={(event) => event.preventDefault()}
                        onSelectStart={(event) => event.preventDefault()}
                        className={`mobile-swipe-foreground relative flex w-full items-start gap-3 overflow-hidden px-2 py-4 ${
                          isSelected
                            ? "bg-[#730217]/[0.06]"
                            : !item.isRead
                              ? "bg-[#730217]/[0.025]"
                              : "bg-white"
                        }`}
                        style={{
                          transform: `translate3d(${swipeOffset}px, 0, 0)`,
                          transition:
                            touchStartRef.current?.id === item.id &&
                            touchStartRef.current.moved
                              ? "none"
                              : "transform 220ms ease",
                          touchAction: "pan-y",
                          willChange:
                            swipeOffset !== 0 ? "transform" : "auto",
                        }}
                      >
                        {/* CATEGORY ICON / SELECTION CONTROL */}

                        {isSelectionMode ? (
                          <div className="mt-2 flex h-10 w-10 shrink-0 animate-selection-in items-center justify-center">
                            <MokuCheckbox
                              checked={isSelected}
                              onChange={() => toggleSelection(item.id)}
                              label={`Pilih ${item.title}`}
                              className="h-6 w-6 rounded-[7px]"
                            />
                          </div>
                        ) : (
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconColorMap[item.type]}`}
                          >
                            <Icon size={20} weight="duotone" />
                          </div>
                        )}

                        {/* NOTIFICATION CONTENT */}

                        <Link
                          href={`/notifications/${encodeURIComponent(item.id)}`}
                          onClick={(event) =>
                            handleDetailClick(event, item.id)
                          }
                          className="min-w-0 flex-1 outline-none"
                        >
                          <div className="flex items-center gap-2">
                            <p className="line-clamp-1 text-sm font-semibold text-foreground">
                              {item.title}
                            </p>

                            {!item.isRead && (
                              <span
                                className="h-2 w-2 shrink-0 rounded-full bg-[#730217]"
                                aria-label="Belum dibaca"
                              />
                            )}
                          </div>

                          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                            {item.description}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              {typeLabels[item.type]}
                            </span>

                            <span className="text-xs text-muted-foreground">
                              ·
                            </span>

                            <span className="text-xs text-muted-foreground">
                              {displayDate}
                            </span>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {isExiting && (
                      <span className="sr-only">
                        Notifikasi sedang dihapus
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* EMPTY DATABASE */

            <div className="relative flex min-h-[390px] flex-col items-center justify-center overflow-hidden px-5 py-10 text-center sm:min-h-[440px]">

              {/* MOKU WATERMARK */}

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="opacity-[0.17]">
                  <EmptyNotificationWatermark />
                </div>
              </div>

              {/* EMPTY STATE CONTENT */}

              <div className="relative z-10 mt-24 flex flex-col items-center">
                <h2 className="text-base font-semibold tracking-tight text-[#730217] sm:text-lg">
                  Belum Ada Notifikasi
                </h2>

                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  Aktivitas dan informasi terbaru akan muncul di sini.
                </p>

                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="mt-5 rounded-lg bg-[#730217] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#5D0012] sm:text-sm"
                >
                  Muat 15 Data Demo
                </button>
              </div>
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
        <div className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] left-4 right-4 z-40 mx-auto flex max-w-md animate-toolbar-in items-center justify-between rounded-xl border border-[#E8E9ED] bg-white px-3 py-2.5 shadow-lg md:hidden">
          <span className="text-xs font-medium text-[#730217]">
            {selectedCount} dipilih
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleMarkSelectedAsRead}
              aria-label="Tandai sudah dibaca"
              title="Tandai sudah dibaca"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[#730217] transition-colors hover:bg-[#730217]/10"
            >
              <Check size={20} />
            </button>

            <button
              type="button"
              onClick={handleDeleteSelected}
              aria-label="Hapus notifikasi"
              title="Hapus notifikasi"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[#BF0B2C] transition-colors hover:bg-[#BF0B2C]/10"
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

      {/* MOKU SIGNATURE SNACKBAR */}

      {snackbar && (
        <div
          role="status"
          aria-live="polite"
          className="snackbar-enter fixed bottom-[calc(82px+env(safe-area-inset-bottom))] left-4 right-4 z-50 mx-auto flex max-w-md items-center justify-between gap-3 overflow-hidden rounded-[13px] bg-[#730217] px-4 py-3 text-white shadow-xl md:bottom-6"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <CheckCircle
              size={19}
              weight="fill"
              className="shrink-0 text-white"
            />

            <span className="truncate text-sm">
              {snackbar.message}
            </span>
          </div>

          <button
            type="button"
            onClick={handleUndo}
            className="shrink-0 rounded-md px-2 py-1.5 text-xs font-bold tracking-wide text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            URUNGKAN
          </button>

          <div className="snackbar-progress absolute bottom-0 left-0 h-[3px] bg-[#F28C0F]" />
        </div>
      )}

      {/* ANIMATIONS */}

      <style jsx>{`
        .page-enter {
          animation: notification-enter 220ms ease-out both;
        }

        .snackbar-enter {
          animation: snackbar-enter 220ms ease-out both;
        }

        .snackbar-progress {
          animation: snackbar-countdown 5s linear forwards;
        }

        .animate-selection-in {
          animation: selection-in 180ms ease-out both;
        }

        .animate-toolbar-in {
          animation: toolbar-in 180ms ease-out both;
        }

        .mobile-swipe-foreground {
          box-sizing: border-box;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          backface-visibility: hidden;
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

        @keyframes snackbar-countdown {
          from {
            width: 100%;
          }

          to {
            width: 0%;
          }
        }

        @keyframes selection-in {
          from {
            opacity: 0;
            transform: scale(0.7);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes toolbar-in {
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
          .page-enter,
          .snackbar-enter,
          .animate-selection-in,
          .animate-toolbar-in,
          .snackbar-progress {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
                }
