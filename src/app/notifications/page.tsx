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
  visit: "bg-[#730217]/[0.08] text-[#730217]",
  equipment: "bg-[#F28C0F]/[0.10] text-[#C66A00]",
  customer: "bg-sky-50 text-sky-700",
  user: "bg-violet-50 text-violet-700",
  monitoring: "bg-amber-50 text-amber-700",
  general: "bg-[#F1F2F5] text-gray-600",
} satisfies Record<NotificationItem["type"], string>;

const visitTypeLabels: Record<string, string> = {
  IND: "Driver Installation",
  INS: "Installation",
  DIS: "Dismantle",
  PMC: "Preventive Maintenance",
  UMC: "Unscheduled Maintenance",
};

/* =========================================================
   MOKU CHECKBOX
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
          ? "border-[#730217] bg-[#730217] text-white"
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
   NOTIFICATION DESCRIPTION
========================================================= */

function getNotificationSubtitle(item: NotificationItem): string {
  const data = item.data;

  const equipment = data?.equipmentNumber
    ? String(data.equipmentNumber)
    : "";

  const customer = data?.customerName
    ? String(data.customerName)
    : "";

  const title = item.title?.toLowerCase() ?? "";

  const activityDescription = data?.activityDescription
    ? String(data.activityDescription).trim()
    : "";

  const changeDescription = data?.changeDescription
    ? String(data.changeDescription).trim()
    : "";

  const monitoringPeriod = data?.monitoringPeriod
    ? String(data.monitoringPeriod).trim()
    : "";

  const appendEquipment = (description: string) => {
    if (!equipment) return description;

    if (description.toLowerCase().includes(equipment.toLowerCase())) {
      return description;
    }

    return `${description} (${equipment})`;
  };

  // Deskripsi aktivitas yang memang disediakan oleh data.
  if (activityDescription) {
    return appendEquipment(activityDescription);
  }

  // Deskripsi perubahan yang memang disediakan oleh data.
  if (changeDescription) {
    return appendEquipment(changeDescription);
  }

  // Aktivitas kunjungan teknisi.
  if (item.type === "visit") {
    const visitType = data?.visitType
      ? String(data.visitType).toUpperCase()
      : "";

    const visitLabel = visitTypeLabels[visitType];

    if (visitLabel && equipment) {
      return `${visitLabel} unit ${equipment} telah dicatat.`;
    }

    if (visitLabel) {
      return `Aktivitas ${visitLabel} telah dicatat dalam sistem.`;
    }

    if (equipment) {
      return `Aktivitas kunjungan unit ${equipment} telah dicatat.`;
    }
  }

  // Aktivitas data unit.
  if (item.type === "equipment" && equipment) {
    if (
      title.includes("ditambahkan") ||
      title.includes("penambahan") ||
      title.includes("berhasil didaftarkan")
    ) {
      return `Unit ${equipment} berhasil didaftarkan ke sistem monitoring.`;
    }

    if (
      title.includes("diperbarui") ||
      title.includes("perubahan") ||
      title.includes("diubah")
    ) {
      return `Perubahan informasi unit ${equipment} berhasil disimpan.`;
    }

    if (title.includes("dinonaktifkan") || title.includes("nonaktif")) {
      return `Status unit ${equipment} telah diubah menjadi nonaktif.`;
    }

    if (title.includes("dihapus")) {
      return `Data unit ${equipment} telah dihapus dari sistem.`;
    }

    return `Informasi unit ${equipment} tersedia dalam sistem monitoring.`;
  }

  // Aktivitas data pelanggan.
  if (item.type === "customer" && customer) {
    if (
      title.includes("ditambahkan") ||
      title.includes("penambahan") ||
      title.includes("didaftarkan")
    ) {
      return `Pelanggan ${customer} berhasil didaftarkan ke sistem.`;
    }

    if (
      title.includes("diperbarui") ||
      title.includes("perubahan") ||
      title.includes("diubah")
    ) {
      return `Informasi pelanggan ${customer} berhasil diperbarui.`;
    }

    if (title.includes("dihapus")) {
      return `Data pelanggan ${customer} telah dihapus dari sistem.`;
    }

    return `Informasi pelanggan ${customer} tercatat dalam sistem.`;
  }

  // Status monitoring kunjungan.
  if (item.type === "monitoring") {
    const status = data?.status
      ? String(data.status).toLowerCase()
      : "";

    const isNotVisited =
      status.includes("not visited") ||
      status.includes("belum dikunjungi") ||
      status.includes("belum dikunjungi");

    if (isNotVisited && equipment && monitoringPeriod) {
      return `Unit ${equipment} belum memiliki kunjungan pada periode ${monitoringPeriod}.`;
    }

    if (isNotVisited && equipment) {
      return `Unit ${equipment} belum memiliki catatan kunjungan pada periode monitoring ini.`;
    }

    if (equipment && monitoringPeriod) {
      return `Status monitoring unit ${equipment} diperbarui untuk periode ${monitoringPeriod}.`;
    }

    if (equipment) {
      return `Status monitoring unit ${equipment} telah diperbarui.`;
    }
  }

  // Informasi pengguna.
  if (item.type === "user") {
    if (title.includes("ditambahkan") || title.includes("didaftarkan")) {
      return "Pengguna baru berhasil didaftarkan ke sistem MOKU.";
    }

    if (title.includes("diperbarui") || title.includes("diubah")) {
      return "Informasi akun pengguna berhasil diperbarui.";
    }
  }

  // Gunakan deskripsi asli jika masih tersedia dan tidak mengulang judul.
  const description = item.description?.trim();

  if (
    description &&
    description.toLowerCase() !== title.trim()
  ) {
    return description;
  }

  // Fallback berdasarkan data yang benar-benar tersedia.
  if (equipment && customer) {
    return `Informasi unit ${equipment} milik ${customer} tercatat dalam sistem.`;
  }

  if (equipment) {
    return `Informasi unit ${equipment} tercatat dalam sistem monitoring.`;
  }

  if (customer) {
    return `Informasi pelanggan ${customer} tercatat dalam sistem.`;
  }

  return "";
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
      <path
        d="M45 166C29 120 67 75 112 75C143 75 157 91 183 76C220 54 269 79 298 113C330 151 304 202 266 215C218 232 164 211 121 221C83 230 54 205 45 166Z"
        fill="#F8F0F1"
      />

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

      <g opacity="0.52">
        <rect x="145" y="93" width="70" height="52" rx="17" fill="#730217" />
        <rect x="154" y="104" width="52" height="31" rx="10" fill="#F2F2F2" />
        <rect x="165" y="112" width="6" height="13" rx="3" fill="#730217" />
        <rect x="189" y="112" width="6" height="13" rx="3" fill="#730217" />

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

        <rect x="132" y="105" width="13" height="28" rx="6" fill="#F28C0F" />
        <rect x="215" y="105" width="13" height="28" rx="6" fill="#F28C0F" />
      </g>

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

  const [swipeOffsets, setSwipeOffsets] = useState<Record<string, number>>({});
  const [activeSwipeId, setActiveSwipeId] = useState<string | null>(null);
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
     SELECTION
  ======================================================= */

  const selectedCount = selectedIds.length;

  const allNotificationsSelected =
    notifications.length > 0 &&
    notifications.every((item) => selectedIds.includes(item.id));

  const toggleSelection = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];

    setSelectedIds(next);
    setIsSelectionMode(next.length > 0);
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

  const handleMarkAsRead = (id: string, showSnackbar = false) => {
    const target = notifications.find((item) => item.id === id);

    if (!target || target.isRead) return;

    markNotificationAsRead(id);

    if (showSnackbar) {
      setSnackbar({
        message: "1 notifikasi ditandai sudah dibaca",
        deleted: [],
        readUndo: [{ id, isRead: false }],
      });
    }
  };

  const handleMarkSelectedAsRead = () => {
    const targets = notifications.filter(
      (item) => selectedIds.includes(item.id) && !item.isRead
    );

    if (targets.length === 0) {
      clearSelection();
      return;
    }

    targets.forEach((item) => markNotificationAsRead(item.id));

    setSnackbar({
      message: `${targets.length} notifikasi ditandai sudah dibaca`,
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
      setActiveSwipeId(null);
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

    finishDeletion(
      selectedIds,
      `${selectedIds.length} notifikasi dihapus`
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
    setSwipeOffsets({});
    swipeOffsetRef.current = {};
    setActiveSwipeId(null);
    setExitingIds([]);
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
    const nextOffset = Math.max(-88, Math.min(0, offset));

    swipeOffsetRef.current = {
      ...swipeOffsetRef.current,
      [id]: nextOffset,
    };

    setSwipeOffsets((current) => ({
      ...current,
      [id]: nextOffset,
    }));
  };

  const closeOtherSwipes = (activeId: string) => {
    const nextOffsets = { ...swipeOffsetRef.current };

    Object.keys(nextOffsets).forEach((id) => {
      if (id !== activeId) {
        nextOffsets[id] = 0;
      }
    });

    swipeOffsetRef.current = nextOffsets;
    setSwipeOffsets(nextOffsets);
  };

  const handleTouchStart = (
    event: TouchEvent<HTMLDivElement>,
    id: string
  ) => {
    if (isSelectionMode) return;

    const touch = event.touches[0];

    closeOtherSwipes(id);
    setActiveSwipeId(id);

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
      setActiveSwipeId(null);
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

    // Hanya swipe horizontal ke kiri yang digunakan untuk menghapus.
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
      setActiveSwipeId(null);
      return;
    }

    const offset = swipeOffsetRef.current[id] ?? 0;

    touchStartRef.current = null;
    setActiveSwipeId(null);

    if (start.horizontal && offset < -55) {
      suppressClickRef.current = true;

      updateSwipeOffset(id, -88);

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
    setActiveSwipeId(null);
    updateSwipeOffset(id, 0);
  };

  /* =======================================================
     DETAIL CLICK
  ======================================================= */

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
      return;
    }

    // Klik detail menandai sudah dibaca tanpa snackbar.
    handleMarkAsRead(id, false);
  };

  /* =======================================================
     CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      clearLongPressTimer();

      if (deleteTimerRef.current !== null) {
        window.clearTimeout(deleteTimerRef.current);
      }
    };
  }, []);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen w-full bg-white">
      <div className="page-enter w-full min-w-0 px-4 pb-36 pt-4 sm:px-6 sm:pt-5 md:pb-8 lg:px-8">

        {/* DESKTOP SELECTION TOOLBAR */}

        <div
          className={`overflow-hidden transition-all duration-200 ease-out ${
            isSelectionMode && notifications.length > 0
              ? "mb-3 max-h-20 translate-y-0 opacity-100"
              : "mb-0 max-h-0 -translate-y-1 opacity-0"
          }`}
        >
          <div className="hidden min-h-11 items-center justify-between rounded-lg border border-[#730217]/15 bg-[#730217]/[0.035] px-3 md:flex">
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
          </div>
        </div>

        {/* MOBILE SELECTION INFO */}

        {isSelectionMode && notifications.length > 0 && (
          <div className="mb-3 flex items-center justify-between border-b border-[#ECEDEF] px-1 py-2 md:hidden">
            <div className="flex items-center gap-2">
              <MokuCheckbox
                checked={allNotificationsSelected}
                onChange={toggleSelectAll}
                label={
                  allNotificationsSelected
                    ? "Batalkan pilih semua"
                    : "Pilih semua"
                }
              />

              <span className="text-xs font-medium text-muted-foreground">
                {allNotificationsSelected
                  ? "Batalkan pilih semua"
                  : "Pilih semua"}
              </span>
            </div>

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
                const subtitle = getNotificationSubtitle(item);

                const displayDate = formatNotificationDate(
                  item.createdAt,
                  item.time
                );

                return (
                  <div
                    key={item.id}
                    className={`notification-row relative overflow-hidden ${
                      isExiting ? "notification-exit" : ""
                    }`}
                  >
                    {/* DESKTOP ROW */}

                    <div
                      className={`group relative hidden min-h-[72px] items-center gap-3 px-2 py-3 transition-colors duration-150 md:flex ${
                        isSelected
                          ? "bg-[#730217]/[0.055]"
                          : !item.isRead
                            ? "bg-[#730217]/[0.018] hover:bg-[#F8F4F5]"
                            : "bg-white hover:bg-[#F7F7F8]"
                      }`}
                    >
                      {isSelectionMode ? (
                        <MokuCheckbox
                          checked={isSelected}
                          onChange={() => toggleSelection(item.id)}
                          label={`Pilih ${item.title}`}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => enterSelectionMode(item.id)}
                          aria-label={`Pilih ${item.title}`}
                          title="Pilih notifikasi"
                          className="group/icon relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#730217]/30"
                        >
                          <span
                            className={`absolute inset-0 flex items-center justify-center rounded-xl transition-opacity duration-150 group-hover/icon:opacity-0 ${iconColorMap[item.type]}`}
                          >
                            <Icon size={20} weight="duotone" />
                          </span>

                          <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#730217]/10 text-[#730217] opacity-0 transition-opacity duration-150 group-hover/icon:opacity-100">
                            <Check size={19} weight="bold" />
                          </span>
                        </button>
                      )}

                      {/* DESKTOP CONTENT */}

                      <Link
                        href={`/notifications/${encodeURIComponent(item.id)}`}
                        onClick={(event) =>
                          handleDetailClick(event, item.id)
                        }
                        className="flex min-w-0 flex-1 items-center justify-between gap-5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#730217]/30"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="truncate text-sm font-semibold text-foreground">
                              {item.title}
                            </span>

                            {!item.isRead && (
                              <span
                                className="h-2 w-2 shrink-0 rounded-full bg-[#730217]"
                                aria-label="Belum dibaca"
                              />
                            )}
                          </div>

                          {subtitle && (
                            <p className="mt-1 line-clamp-1 text-[13px] leading-[18px] text-muted-foreground">
                              {subtitle}
                            </p>
                          )}
                        </div>

                        <span className="w-24 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
                          {displayDate}
                        </span>
                      </Link>

                      {/* DESKTOP ACTIONS */}

                      <div className="flex w-[76px] shrink-0 items-center justify-end gap-1">
                        {!item.isRead && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(item.id, true)}
                            title="Tandai sudah dibaca"
                            aria-label={`Tandai ${item.title} sudah dibaca`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#730217] opacity-0 transition-all hover:bg-[#730217]/10 group-hover:opacity-100 group-focus-within:opacity-100"
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
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#BF0B2C] opacity-0 transition-all hover:bg-[#BF0B2C]/10 group-hover:opacity-100 group-focus-within:opacity-100"
                        >
                          <Trash size={17} />
                        </button>
                      </div>
                    </div>

                    {/* MOBILE ROW */}

                    <div className="relative overflow-hidden md:hidden">
                      {/* DELETE BACKGROUND */}

                      <div
                        className="absolute inset-y-0 right-0 z-0 flex w-[88px] items-center justify-center bg-[#BF0B2C]"
                        style={{
                          opacity: Math.min(
                            Math.abs(swipeOffset) / 55,
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

                      {/* FOREGROUND */}

                      <div
                        onTouchStart={(event) =>
                          handleTouchStart(event, item.id)
                        }
                        onTouchMove={(event) =>
                          handleTouchMove(event, item.id)
                        }
                        onTouchEnd={() => handleTouchEnd(item.id)}
                        onTouchCancel={() =>
                          handleTouchCancel(item.id)
                        }
                        onContextMenu={(event) => event.preventDefault()}
                        className={`mobile-swipe-foreground relative z-10 flex min-h-[72px] w-full items-center gap-3 overflow-hidden px-2 py-3 ${
                          isSelected
                            ? "bg-[#F8F1F2]"
                            : !item.isRead
                              ? "bg-[#FCF9FA]"
                              : "bg-white"
                        }`}
                        style={{
                          transform: `translate3d(${swipeOffset}px, 0, 0)`,
                          transition:
                            activeSwipeId === item.id
                              ? "none"
                              : "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)",
                          touchAction: "pan-y",
                          willChange:
                            swipeOffset !== 0 ? "transform" : "auto",
                        }}
                      >
                        {/* MOBILE ICON / CHECKBOX */}

                        {isSelectionMode ? (
                          <div className="flex h-10 w-10 shrink-0 animate-selection-in items-center justify-center">
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

                        {/* MOBILE CONTENT */}

                        <Link
                          href={`/notifications/${encodeURIComponent(item.id)}`}
                          onClick={(event) =>
                            handleDetailClick(event, item.id)
                          }
                          className="flex min-w-0 flex-1 items-center justify-between gap-3 outline-none"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-center gap-2">
                              <p className="truncate text-sm font-semibold leading-snug text-foreground">
                                {item.title}
                              </p>

                              {!item.isRead && (
                                <span
                                  className="h-2 w-2 shrink-0 rounded-full bg-[#730217]"
                                  aria-label="Belum dibaca"
                                />
                              )}
                            </div>

                            {subtitle && (
                              <p className="mt-1 line-clamp-1 text-[13px] leading-[18px] text-muted-foreground">
                                {subtitle}
                              </p>
                            )}
                          </div>

                          <span className="w-[54px] shrink-0 text-right text-[11px] font-medium tabular-nums text-muted-foreground">
                            {displayDate}
                          </span>
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
            /* EMPTY STATE */

            <div className="relative flex min-h-[390px] flex-col items-center justify-center overflow-hidden px-5 py-10 text-center sm:min-h-[440px]">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="opacity-[0.17]">
                  <EmptyNotificationWatermark />
                </div>
              </div>

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

      <div
        className={`fixed bottom-[calc(76px+env(safe-area-inset-bottom))] left-4 right-4 z-40 mx-auto max-w-md transition-all duration-200 ease-out md:hidden ${
          isSelectionMode && selectedCount > 0
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between rounded-xl border border-[#E8E9ED] bg-white px-3 py-2.5 shadow-lg">
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
      </div>

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
          animation: notification-enter 240ms ease-out both;
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

        .mobile-swipe-foreground {
          box-sizing: border-box;
          background-clip: padding-box;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .notification-row {
          overflow: hidden;
          transition:
            opacity 220ms ease,
            max-height 220ms ease,
            margin 220ms ease;
          max-height: 120px;
        }

        .notification-exit {
          animation: notification-exit 220ms ease-in forwards;
          pointer-events: none;
          overflow: hidden;
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

        @keyframes notification-exit {
          0% {
            opacity: 1;
            max-height: 120px;
            transform: translateX(0);
          }

          45% {
            opacity: 0.35;
            max-height: 120px;
            transform: translateX(-12px);
          }

          100% {
            opacity: 0;
            max-height: 0;
            transform: translateX(-20px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .page-enter,
          .snackbar-enter,
          .animate-selection-in,
          .snackbar-progress,
          .notification-exit {
            animation: none;
          }

          .notification-row {
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}
