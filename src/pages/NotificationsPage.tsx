import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type TouchEvent,
} from "react";
import { Link } from "react-router-dom";

import { useAppLayout } from "@/components/layout/app-shell";

import {
  ArrowLeft,
  Bell,
  CalendarBlank,
  ChartBar,
  Check,
  CheckCircle,
  Checks,
  Info,
  Monitor,
  Trash,
  User,
  Users,
  Warning,
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

const visitTypeLabels: Record<string, string> = {
  IND: "Driver Installation",
  INS: "Installation",
  DIS: "Dismantle",
  PMC: "Preventive Maintenance",
  UMC: "Unscheduled Maintenance",
};

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

const SWIPE_DELETE_THRESHOLD = -64;

/* =========================================================
   CUSTOM ANIMATED TRASH ICON (PHOSPHOR-STYLE, NO CIRCLE)
========================================================= */

function AnimatedTrashIcon({
  ready,
  progress,
}: {
  ready: boolean;
  progress: number;
}) {
  const scale = ready ? 1.12 : 0.78 + progress * 0.24;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`h-[calc(22*var(--u))] w-[calc(22*var(--u))] text-white ${
        ready ? "moku-trash-pop" : ""
      }`}
      style={{
        transform: ready ? undefined : `scale(${scale})`,
        transition: "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* Tutup tong sampah: terangkat naik & miring tipis saat siap hapus */}
      <g
        style={{
          transformOrigin: "12px 6px",
          transform: ready
            ? "translateY(-2.4px) rotate(-14deg)"
            : "translateY(0px) rotate(0deg)",
          transition: "transform 380ms cubic-bezier(0.22, 1.25, 0.36, 1)",
        }}
      >
        <path
          d="M4.5 6.5H19.5"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <path
          d="M9.5 6.5V4.8C9.5 4.08 10.08 3.5 10.8 3.5H13.2C13.92 3.5 14.5 4.08 14.5 4.8V6.5"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Badan tong sampah */}
      <g
        style={{
          transformOrigin: "12px 15px",
          transform: ready ? "translateY(0.8px)" : "translateY(0px)",
          transition: "transform 380ms cubic-bezier(0.22, 1.25, 0.36, 1)",
        }}
      >
        <path
          d="M6.5 6.5L7.3 18.6C7.37 19.67 8.26 20.5 9.33 20.5H14.67C15.74 20.5 16.63 19.67 16.7 18.6L17.5 6.5"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.2 10.8V16.2M13.8 10.8V16.2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/* =========================================================
   MOBILE VISUAL HELPERS
========================================================= */

function getMobileBadgeStyle(item: NotificationItem) {
  const title = item.title?.toLowerCase() ?? "";

  if (
    item.type === "monitoring" ||
    title.includes("perhatian") ||
    title.includes("peringatan") ||
    title.includes("belum dikunjungi")
  ) {
    return {
      Icon: Warning,
      circleClass: "bg-[#FCE6D8] text-[#EB6A14]",
    };
  }

  if (
    title.includes("jadwal") ||
    title.includes("dijadwalkan") ||
    title.includes("mingguan")
  ) {
    return {
      Icon: CalendarBlank,
      circleClass: "bg-[#FADCE1] text-[#DC0E2E]",
    };
  }

  if (
    title.includes("laporan") ||
    title.includes("bulanan") ||
    title.includes("rekap")
  ) {
    return {
      Icon: ChartBar,
      circleClass: "bg-[#FADCE1] text-[#DC0E2E]",
    };
  }

  if (
    item.type === "visit" ||
    title.includes("selesai") ||
    title.includes("dicatat")
  ) {
    return {
      Icon: CheckCircle,
      circleClass: "bg-[#DCF5E3] text-[#14AE47]",
    };
  }

  if (
    item.type === "equipment" ||
    item.type === "customer" ||
    title.includes("pembaruan") ||
    title.includes("diperbarui") ||
    title.includes("ditambahkan") ||
    title.includes("dinonaktifkan")
  ) {
    return {
      Icon: Info,
      circleClass: "bg-[#DCECFB] text-[#1A7BD6]",
    };
  }

  return {
    Icon: iconMap[item.type] ?? Bell,
    circleClass: "bg-[#FADCE1] text-[#8E001C]",
  };
}

function parseNotificationDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date =
    value instanceof Date
      ? value
      : typeof value === "number"
        ? new Date(value)
        : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function getMobileGroupLabel(item: NotificationItem): string {
  const date = parseNotificationDate(item.createdAt);
  if (!date) {
    const raw = (item.time ?? "").toLowerCase();
    if (raw.includes("kemarin")) return "Kemarin";
    if (raw.includes(":") || raw.includes("hari ini") || raw.includes("baru")) {
      return "Hari Ini";
    }
    return item.time || "Hari Ini";
  }

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const startOfItem = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();

  const diffDays = Math.round((startOfToday - startOfItem) / 86_400_000);

  if (diffDays === 0) return "Hari Ini";
  if (diffDays === 1) return "Kemarin";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatMobileTime(item: NotificationItem): string {
  const date = parseNotificationDate(item.createdAt);
  if (date) {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .format(date)
      .replace(".", ":");
  }
  return item.time ?? "";
}

/* =========================================================
   CHECKBOX
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
      className={`group flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#730217]/30 focus-visible:ring-offset-2 ${
        checked
          ? "border-[#730217] bg-[#730217] text-white"
          : "border-[#D5D7DC] bg-white text-transparent hover:border-[#730217] hover:bg-[#730217]/[0.04]"
      } ${className}`}
    >
      <Check
        size={13}
        weight="bold"
        className={`transition-all duration-200 ${
          checked ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      />
    </button>
  );
}

/* =========================================================
   DATE FORMATTER (DESKTOP)
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
  const title = item.title?.toLowerCase() ?? "";

  const equipment = data?.equipmentNumber ? String(data.equipmentNumber) : "";
  const customer = data?.customerName ? String(data.customerName) : "";
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

  if (activityDescription) {
    return appendEquipment(activityDescription);
  }

  if (changeDescription) {
    return appendEquipment(changeDescription);
  }

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

  if (item.type === "equipment" && equipment) {
    if (
      title.includes("ditambahkan") ||
      title.includes("penambahan") ||
      title.includes("berhasil didaftarkan")
    ) {
      return `Equipment ${equipment} berhasil ditambahkan ke sistem monitoring.`;
    }

    if (
      title.includes("diperbarui") ||
      title.includes("perubahan") ||
      title.includes("diubah")
    ) {
      return `Informasi equipment ${equipment} berhasil diperbarui.`;
    }

    if (title.includes("dinonaktifkan") || title.includes("nonaktif")) {
      return `Status equipment ${equipment} telah diubah menjadi Inactive.`;
    }

    if (title.includes("dihapus")) {
      return `Data equipment ${equipment} telah dihapus dari sistem.`;
    }

    return `Informasi equipment ${equipment} tersedia dalam sistem monitoring.`;
  }

  if (item.type === "customer" && customer) {
    if (
      title.includes("ditambahkan") ||
      title.includes("penambahan") ||
      title.includes("didaftarkan")
    ) {
      return `Pelanggan ${customer} berhasil ditambahkan ke sistem.`;
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

  if (item.type === "monitoring") {
    const status = data?.status ? String(data.status).toLowerCase() : "";

    const isNotVisited =
      status.includes("not visited") || status.includes("belum dikunjungi");

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

  if (item.type === "user") {
    if (title.includes("ditambahkan") || title.includes("didaftarkan")) {
      return "Pengguna baru berhasil didaftarkan ke sistem MOKU.";
    }

    if (title.includes("diperbarui") || title.includes("diubah")) {
      return "Informasi akun pengguna berhasil diperbarui.";
    }
  }

  const description = item.description?.trim();

  if (description && description.toLowerCase() !== title.trim()) {
    return description;
  }

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
   EMPTY STATE WATERMARK
========================================================= */

function EmptyNotificationWatermark() {
  return (
    <svg
      viewBox="0 0 360 280"
      aria-hidden="true"
      className="h-auto w-[240px] sm:w-[280px] md:w-[330px]"
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
        <path d="M173 79L180 74L187 79V88H173V79Z" fill="#FFFFFF" />
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
  const { isMobile, isReady, backWithTransition } = useAppLayout();

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    typeof window !== "undefined" ? loadNotifications() : []
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [lastSelectedCount, setLastSelectedCount] = useState(1);

  const [snackbar, setSnackbar] = useState<{
    message: string;
    deleted: DeletedNotification[];
    readUndo?: { id: string; isRead: boolean }[];
  } | null>(null);

  const [swipeOffsets, setSwipeOffsets] = useState<Record<string, number>>({});
  const [activeSwipeId, setActiveSwipeId] = useState<string | null>(null);
  const [slidingOutIds, setSlidingOutIds] = useState<string[]>([]);
  const [collapsingIds, setCollapsingIds] = useState<string[]>([]);
  const [markingReadIds, setMarkingReadIds] = useState<string[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  const touchStartRef = useRef<{
    id: string;
    x: number;
    y: number;
    horizontal: boolean;
    vibrated: boolean;
  } | null>(null);

  const swipeOffsetRef = useRef<Record<string, number>>({});
  const activeTimersRef = useRef<number[]>([]);
  const suppressClickRef = useRef(false);

  const isMobileView = !isReady || isMobile;

  const scheduleTimer = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      activeTimersRef.current = activeTimersRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    activeTimersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoadingList(false);
    }, 260);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isMobileView) return;
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((meta) => meta.setAttribute("content", "#83051C"));
  }, [isMobileView]);

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

  useEffect(() => {
    if (!snackbar) return;

    const timeout = window.setTimeout(() => {
      setSnackbar(null);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [snackbar]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const groupedNotifications = useMemo(() => {
    const groups: { label: string; items: NotificationItem[] }[] = [];
    const indexByLabel = new Map<string, number>();

    notifications.forEach((item) => {
      const label = getMobileGroupLabel(item);
      const existingIndex = indexByLabel.get(label);
      if (existingIndex === undefined) {
        indexByLabel.set(label, groups.length);
        groups.push({ label, items: [item] });
      } else {
        groups[existingIndex].items.push(item);
      }
    });

    return groups;
  }, [notifications]);

  const selectedCount = selectedIds.length;
  const isFloatingBarVisible = isSelectionMode && selectedCount > 0;

  useEffect(() => {
    if (selectedCount > 0) {
      setLastSelectedCount(selectedCount);
    }
  }, [selectedCount]);

  const allNotificationsSelected =
    notifications.length > 0 &&
    notifications.every((item) => selectedIds.includes(item.id));

  const toggleSelection = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(8);
    }

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
     MARK AS READ (SLOW & SMOOTH STAGGERED ANIMATION)
  ======================================================= */

  const handleMarkAsRead = (id: string, showSnackbar = false) => {
    const target = notifications.find((item) => item.id === id);

    if (!target || target.isRead) return;

    setMarkingReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    markNotificationAsRead(id);

    scheduleTimer(() => {
      setMarkingReadIds((prev) => prev.filter((itemId) => itemId !== id));
    }, 760);

    if (showSnackbar) {
      setSnackbar({
        message: "1 notifikasi ditandai sudah dibaca",
        deleted: [],
        readUndo: [{ id, isRead: false }],
      });
    }
  };

  const handleMarkAllAsRead = () => {
    const unreadTargets = notifications.filter((item) => !item.isRead);
    if (unreadTargets.length === 0) return;

    const targetIds = unreadTargets.map((item) => item.id);
    setMarkingReadIds(targetIds);

    unreadTargets.forEach((item, index) => {
      const delay = Math.min(index * 85, 480);
      scheduleTimer(() => {
        markNotificationAsRead(item.id);
      }, delay);
    });

    const totalWaveDuration = Math.min(unreadTargets.length * 85, 480) + 760;
    scheduleTimer(() => {
      setMarkingReadIds([]);
    }, totalWaveDuration);

    setSnackbar({
      message: `${unreadTargets.length} notifikasi ditandai sudah dibaca`,
      deleted: [],
      readUndo: unreadTargets.map((item) => ({
        id: item.id,
        isRead: item.isRead,
      })),
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

    setMarkingReadIds(targets.map((item) => item.id));

    targets.forEach((item, index) => {
      const delay = Math.min(index * 85, 420);
      scheduleTimer(() => {
        markNotificationAsRead(item.id);
      }, delay);
    });

    scheduleTimer(() => {
      setMarkingReadIds([]);
    }, 900);

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
     SLOW & SMOOTH DELETE + COLLAPSE ANIMATION
  ======================================================= */

  const finishDeletion = useCallback((ids: string[], message: string) => {
    const deleted = deleteNotifications(ids);

    if (deleted.length === 0) return;

    setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
    setIsSelectionMode(false);
    setSwipeOffsets({});
    swipeOffsetRef.current = {};
    setActiveSwipeId(null);
    setSlidingOutIds((current) => current.filter((id) => !ids.includes(id)));
    setCollapsingIds((current) => current.filter((id) => !ids.includes(id)));

    setSnackbar({
      message,
      deleted,
    });
  }, []);

  const animateAndDelete = useCallback(
    (ids: string[], message: string) => {
      if (ids.length === 0) return;

      setSlidingOutIds((current) => [...new Set([...current, ...ids])]);

      scheduleTimer(() => {
        setCollapsingIds((current) => [...new Set([...current, ...ids])]);
      }, 240);

      scheduleTimer(() => {
        finishDeletion(ids, message);
        suppressClickRef.current = false;
      }, 720);
    },
    [finishDeletion, scheduleTimer]
  );

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    const idsToDelete = [...selectedIds];
    setIsSelectionMode(false);
    animateAndDelete(idsToDelete, `${idsToDelete.length} notifikasi dihapus`);
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
        isRead: undoMap.has(item.id) ? undoMap.get(item.id)! : item.isRead,
      }));

      saveNotifications(latest);
    }

    setSnackbar(null);
  };

  const handleResetDemo = () => {
    saveNotifications(demoNotifications);
    setSelectedIds([]);
    setIsSelectionMode(false);
    setSnackbar(null);
    setSwipeOffsets({});
    swipeOffsetRef.current = {};
    setActiveSwipeId(null);
    setSlidingOutIds([]);
    setCollapsingIds([]);
  };

  const handleBack = () => {
    if (isSelectionMode) {
      clearSelection();
      return;
    }

    backWithTransition("/");
  };

  /* =======================================================
     SMOOTH SWIPE TO DELETE (MOBILE)
  ======================================================= */

  const updateSwipeOffset = (id: string, rawDeltaX: number) => {
    let nextOffset = Math.min(0, rawDeltaX);
    if (nextOffset < -88) {
      nextOffset = -88 + (nextOffset + 88) * 0.35;
    }
    nextOffset = Math.max(-150, nextOffset);

    swipeOffsetRef.current = {
      ...swipeOffsetRef.current,
      [id]: nextOffset,
    };

    setSwipeOffsets((current) => ({
      ...current,
      [id]: nextOffset,
    }));

    return nextOffset;
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
    if (isSelectionMode || slidingOutIds.includes(id)) return;

    const touch = event.touches[0];

    closeOtherSwipes(id);
    setActiveSwipeId(id);

    touchStartRef.current = {
      id,
      x: touch.clientX,
      y: touch.clientY,
      horizontal: false,
      vibrated: false,
    };

    suppressClickRef.current = false;
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>, id: string) => {
    const start = touchStartRef.current;

    if (isSelectionMode || !start || start.id !== id) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (
      start.horizontal ||
      (deltaX < -6 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1)
    ) {
      start.horizontal = true;
      const offset = updateSwipeOffset(id, deltaX);

      if (offset <= SWIPE_DELETE_THRESHOLD && !start.vibrated) {
        start.vibrated = true;
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(12);
        }
      } else if (offset > SWIPE_DELETE_THRESHOLD + 8 && start.vibrated) {
        start.vibrated = false;
      }
    }
  };

  const handleTouchEnd = (id: string) => {
    const start = touchStartRef.current;

    if (!start || start.id !== id || isSelectionMode) {
      touchStartRef.current = null;
      setActiveSwipeId(null);
      return;
    }

    const offset = swipeOffsetRef.current[id] ?? 0;

    touchStartRef.current = null;
    setActiveSwipeId(null);

    if (start.horizontal && offset <= SWIPE_DELETE_THRESHOLD) {
      suppressClickRef.current = true;
      animateAndDelete([id], "1 notifikasi dihapus");
      return;
    }

    updateSwipeOffset(id, 0);
  };

  const handleTouchCancel = (id: string) => {
    touchStartRef.current = null;
    setActiveSwipeId(null);
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
      return;
    }

    handleMarkAsRead(id, false);
  };

  useEffect(() => {
    return () => {
      activeTimersRef.current.forEach((timerId) =>
        window.clearTimeout(timerId)
      );
      activeTimersRef.current = [];
    };
  }, []);

  /* =======================================================
     MOBILE SUB-PAGE VIEW (FLAT LIST + THIN DIVIDER)
  ======================================================= */

  if (isMobileView) {
    return (
      <main
        style={MOBILE_SCALE_VARS}
        className="min-h-dvh w-full min-w-0 overflow-x-clip bg-white pb-[calc(88*var(--u)+env(safe-area-inset-bottom))]"
      >
        {/* Solid Maroon Header with Curved Sheet Overlap */}
        <header className="sticky top-0 z-40 w-full bg-[#83051C] text-white">
          <div className="mx-auto flex w-full max-w-[680px] items-center justify-between gap-[calc(10*var(--u))] px-[calc(14*var(--u))] pb-[calc(30*var(--u))] pt-[calc(env(safe-area-inset-top)+calc(11*var(--u)))]">
            <div className="flex min-w-0 items-center gap-[calc(8*var(--u))]">
              <button
                type="button"
                onClick={handleBack}
                aria-label={isSelectionMode ? "Batalkan pilihan" : "Kembali"}
                className="flex h-[calc(34*var(--u))] w-[calc(34*var(--u))] shrink-0 items-center justify-center rounded-full text-white transition-colors duration-200 active:bg-white/15"
              >
                {isSelectionMode ? (
                  <X
                    className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                    weight="bold"
                  />
                ) : (
                  <ArrowLeft
                    className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                    weight="bold"
                  />
                )}
              </button>

              <h1 className="truncate font-display text-[calc(17.5*var(--u))] font-bold leading-tight tracking-[-0.02em] text-white">
                {isSelectionMode ? `${selectedCount} Dipilih` : "Notifikasi"}
              </h1>
            </div>
          </div>
        </header>

        {/* Curved White Sheet Container */}
        <div className="relative z-40 -mt-[calc(20*var(--u))] min-h-[calc(100dvh-calc(68*var(--u)))] rounded-t-[calc(24*var(--u))] bg-white pt-[calc(16*var(--u))]">
          <div className="mx-auto w-full max-w-[680px]">
            {isLoadingList ? (
              <div className="flex min-h-[55dvh] items-center justify-center">
                <span
                  aria-label="Memuat notifikasi"
                  className="h-7 w-7 animate-spin rounded-full border-[2.5px] border-[#83051C]/20 border-t-[#83051C]"
                />
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-[calc(12*var(--u))]">
                {groupedNotifications.map((group, groupIndex) => (
                  <section key={group.label} className="min-w-0">
                    {/* Group Header */}
                    <div className="flex items-center justify-between gap-[calc(8*var(--u))] px-[calc(16*var(--u))] pb-[calc(8*var(--u))] pt-[calc(4*var(--u))]">
                      <h2 className="font-display text-[calc(13.5*var(--u))] font-bold tracking-[-0.02em] text-[#5A555F]">
                        {group.label}
                      </h2>

                      {groupIndex === 0 && !isSelectionMode && (
                        <button
                          type="button"
                          onClick={handleMarkAllAsRead}
                          disabled={unreadCount === 0}
                          className={`shrink-0 text-[calc(12.5*var(--u))] font-bold text-[#8E001C] transition-all duration-500 ease-out active:scale-95 active:opacity-70 ${
                            unreadCount > 0
                              ? "translate-y-0 opacity-100"
                              : "pointer-events-none -translate-y-1 opacity-0"
                          }`}
                        >
                          Baca Semua ({unreadCount})
                        </button>
                      )}
                    </div>

                    {/* Flat List Items separated by thin divider */}
                    <div className="border-t border-[#EFEFF2]">
                      {group.items.map((item, itemIndex) => {
                        const isSelected = selectedIds.includes(item.id);
                        const isSlidingOut = slidingOutIds.includes(item.id);
                        const isCollapsing = collapsingIds.includes(item.id);
                        const isJustMarkedRead = markingReadIds.includes(
                          item.id
                        );
                        const swipeOffset = swipeOffsets[item.id] ?? 0;
                        const isSwiping = swipeOffset < -1 || isSlidingOut;
                        const swipeProgress = Math.min(
                          1,
                          Math.abs(swipeOffset) /
                            Math.abs(SWIPE_DELETE_THRESHOLD)
                        );
                        const isReadyToDelete =
                          swipeOffset <= SWIPE_DELETE_THRESHOLD || isSlidingOut;
                        const subtitle = getNotificationSubtitle(item);
                        const displayTime = formatMobileTime(item);
                        const { Icon, circleClass } = getMobileBadgeStyle(item);

                        return (
                          <div
                            key={item.id}
                            className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                              isCollapsing
                                ? "pointer-events-none grid-rows-[0fr] opacity-0"
                                : "grid-rows-[1fr] opacity-100"
                            }`}
                          >
                            <div className="min-h-0 overflow-hidden">
                              <div
                                style={{
                                  animationDelay: `${Math.min(itemIndex * 45, 320)}ms`,
                                }}
                                className="notif-card-reveal relative overflow-hidden border-b border-[#EFEFF2]"
                              >
                                {/* Swipe Delete Background */}
                                {isSwiping && (
                                  <div
                                    className="absolute inset-0 z-0 flex items-center justify-end bg-[#BF0B2C] pr-[calc(24*var(--u))]"
                                    style={{
                                      opacity: isSlidingOut
                                        ? 0.95
                                        : Math.min(swipeProgress * 1.25, 1),
                                      transition:
                                        activeSwipeId === item.id
                                          ? "none"
                                          : "opacity 320ms ease",
                                    }}
                                    aria-hidden="true"
                                  >
                                    <AnimatedTrashIcon
                                      ready={isReadyToDelete}
                                      progress={swipeProgress}
                                    />
                                  </div>
                                )}

                                {/* Flat Row Foreground */}
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
                                  onContextMenu={(event) =>
                                    event.preventDefault()
                                  }
                                  className={`mobile-swipe-foreground relative z-10 flex w-full items-start gap-[calc(12*var(--u))] px-[calc(16*var(--u))] py-[calc(13*var(--u))] transition-colors duration-700 ease-out ${
                                    isSelected
                                      ? "bg-[#FADCE1]"
                                      : !item.isRead
                                        ? "bg-[#FDF2F4]"
                                        : "bg-white"
                                  } ${isJustMarkedRead ? "notif-read-fade" : ""}`}
                                  style={{
                                    transform: isSlidingOut
                                      ? "translate3d(-105%, 0, 0)"
                                      : `translate3d(${swipeOffset}px, 0, 0)`,
                                    opacity: isSlidingOut ? 0 : 1,
                                    transition:
                                      activeSwipeId === item.id
                                        ? "background-color 700ms ease-out"
                                        : "transform 440ms cubic-bezier(0.22, 1, 0.36, 1), opacity 360ms ease-out, background-color 700ms ease-out",
                                    touchAction: "pan-y",
                                    willChange:
                                      swipeOffset !== 0 || isSlidingOut
                                        ? "transform, opacity"
                                        : "auto",
                                  }}
                                >
                                  {/* 3D Flip Icon Button (Select & Unselect) */}
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      toggleSelection(item.id);
                                    }}
                                    aria-label={
                                      isSelected
                                        ? `Batalkan pilih ${item.title}`
                                        : `Pilih ${item.title}`
                                    }
                                    aria-pressed={isSelected}
                                    style={{ perspective: "360px" }}
                                    className="mt-[calc(1*var(--u))] h-[calc(40*var(--u))] w-[calc(40*var(--u))] shrink-0 rounded-full transition-transform duration-200 active:scale-90"
                                  >
                                    <span
                                      className={`moku-icon-flip-inner relative block h-full w-full rounded-full ${
                                        isSelected ? "is-flipped" : ""
                                      }`}
                                    >
                                      {/* Sisi Depan: Ikon Kategori */}
                                      <span
                                        className={`moku-icon-face absolute inset-0 flex items-center justify-center rounded-full ${circleClass}`}
                                      >
                                        <Icon
                                          className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                                          weight="bold"
                                        />
                                      </span>

                                      {/* Sisi Belakang: Centang Marun */}
                                      <span className="moku-icon-face moku-icon-face-back absolute inset-0 flex items-center justify-center rounded-full bg-[#8E001C] text-white shadow-sm">
                                        <Check
                                          className={`h-[calc(19*var(--u))] w-[calc(19*var(--u))] transition-transform duration-300 ease-out ${
                                            isSelected
                                              ? "scale-100 delay-150"
                                              : "scale-50"
                                          }`}
                                          weight="bold"
                                        />
                                      </span>
                                    </span>
                                  </button>

                                  <Link
                                    to={`/notifications/${encodeURIComponent(item.id)}`}
                                    onClick={(event) =>
                                      handleDetailClick(event, item.id)
                                    }
                                    className="flex min-w-0 flex-1 flex-col outline-none"
                                  >
                                    <div className="flex items-start justify-between gap-[calc(8*var(--u))]">
                                      <p className="min-w-0 flex-1 truncate font-display text-[calc(13.5*var(--u))] font-bold leading-[1.25] tracking-[-0.015em] text-[#171717]">
                                        {item.title}
                                      </p>

                                      <div className="flex shrink-0 items-center pt-[calc(1.5*var(--u))]">
                                        <span className="whitespace-nowrap text-[calc(11*var(--u))] font-medium tabular-nums text-[#5A555F]">
                                          {displayTime}
                                        </span>

                                        <span
                                          aria-hidden={item.isRead}
                                          aria-label={
                                            !item.isRead
                                              ? "Belum dibaca"
                                              : undefined
                                          }
                                          className={`shrink-0 rounded-full bg-[#FF2D20] transition-all duration-500 ease-out ${
                                            !item.isRead
                                              ? "ml-[calc(5*var(--u))] h-[calc(7.5*var(--u))] w-[calc(7.5*var(--u))] scale-100 opacity-100"
                                              : "ml-0 h-0 w-0 scale-0 opacity-0"
                                          }`}
                                        />
                                      </div>
                                    </div>

                                    {subtitle && (
                                      <p className="mt-[calc(3.5*var(--u))] line-clamp-2 pr-[calc(6*var(--u))] text-[calc(11.5*var(--u))] leading-[1.42] text-[#3F3A42]">
                                        {subtitle}
                                      </p>
                                    )}
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="relative flex min-h-[calc(68dvh)] flex-col items-center justify-center overflow-hidden px-5 py-10 text-center">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="opacity-[0.17]">
                    <EmptyNotificationWatermark />
                  </div>
                </div>

                <div className="relative z-10 mt-20 flex flex-col items-center">
                  <h2 className="font-display text-base font-bold tracking-tight text-[#730217]">
                    Belum Ada Notifikasi
                  </h2>

                  <p className="mt-2 max-w-xs text-xs leading-relaxed text-[#5E5863]">
                    Aktivitas dan informasi terbaru akan muncul di sini.
                  </p>

                  <button
                    type="button"
                    onClick={handleResetDemo}
                    className="mt-5 rounded-xl bg-[#8E001C] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#730217]"
                  >
                    Muat Data Demo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE FLOATING SELECTION BAR (Transisi masuk & keluar lebih santai) */}
        <div
          aria-hidden={!isFloatingBarVisible}
          className={`fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-4 right-4 z-50 mx-auto flex max-w-[640px] items-center justify-between gap-2 rounded-2xl border border-[#E8E9ED] bg-white px-3.5 py-2.5 shadow-xl transition-[transform,opacity] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isFloatingBarVisible
              ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-8 scale-95 opacity-0"
          }`}
        >
          <span className="truncate text-xs font-bold text-[#8E001C]">
            {selectedCount > 0 ? selectedCount : lastSelectedCount} dipilih
          </span>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              tabIndex={isFloatingBarVisible ? 0 : -1}
              onClick={toggleSelectAll}
              className={`mr-1 rounded-xl px-2.5 py-1.5 text-[11.5px] font-bold transition-colors duration-200 active:scale-95 ${
                allNotificationsSelected
                  ? "bg-[#FCECEF] text-[#8E001C]"
                  : "bg-[#F4F4F6] text-[#29232A] active:bg-[#EAEAEF]"
              }`}
            >
              {allNotificationsSelected ? "Batal Semua" : "Pilih Semua"}
            </button>

            <button
              type="button"
              tabIndex={isFloatingBarVisible ? 0 : -1}
              onClick={handleMarkSelectedAsRead}
              aria-label="Tandai sudah dibaca"
              title="Tandai sudah dibaca"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8E001C] transition-colors duration-200 active:bg-[#8E001C]/10"
            >
              <Checks size={19} weight="bold" />
            </button>

            <button
              type="button"
              tabIndex={isFloatingBarVisible ? 0 : -1}
              onClick={handleDeleteSelected}
              aria-label="Hapus notifikasi"
              title="Hapus notifikasi"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#BF0B2C] transition-colors duration-200 active:bg-[#BF0B2C]/10"
            >
              <Trash size={19} weight="bold" />
            </button>

            <button
              type="button"
              tabIndex={isFloatingBarVisible ? 0 : -1}
              onClick={clearSelection}
              aria-label="Batalkan pilihan"
              title="Batalkan pilihan"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#5E5863] transition-colors duration-200 active:bg-[#F1F2F5]"
            >
              <X size={19} weight="bold" />
            </button>
          </div>
        </div>

        {/* SNACKBAR */}
        {snackbar && (
          <div
            role="status"
            aria-live="polite"
            className="snackbar-enter fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-4 right-4 z-50 mx-auto flex max-w-[640px] items-center justify-between gap-3 overflow-hidden rounded-[13px] bg-[#730217] px-4 py-3 text-white shadow-xl"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <CheckCircle
                size={19}
                weight="fill"
                className="shrink-0 text-white"
              />

              <span className="truncate text-xs font-medium sm:text-sm">
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

        <style>{`
          .notif-card-reveal {
            animation: notif-card-in 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
          }

          .moku-trash-pop {
            animation: moku-trash-pop 520ms cubic-bezier(0.22, 1.25, 0.36, 1) both;
          }

          .moku-icon-flip-inner {
            transform-style: preserve-3d;
            -webkit-transform-style: preserve-3d;
            transition: transform 560ms cubic-bezier(0.22, 1.22, 0.36, 1);
            will-change: transform;
          }

          .moku-icon-flip-inner.is-flipped {
            transform: rotateY(180deg);
          }

          .moku-icon-face {
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }

          .moku-icon-face-back {
            transform: rotateY(180deg);
          }

          .snackbar-enter {
            animation: snackbar-enter 340ms cubic-bezier(0.22, 1, 0.36, 1) both;
          }

          .snackbar-progress {
            animation: snackbar-countdown 5s linear forwards;
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

          @keyframes notif-card-in {
            from {
              opacity: 0;
              transform: translate3d(0, 10px, 0);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }

          @keyframes moku-trash-pop {
            0% {
              transform: scale(0.92);
            }
            55% {
              transform: scale(1.22);
            }
            100% {
              transform: scale(1.12);
            }
          }

          @keyframes snackbar-enter {
            from {
              opacity: 0;
              transform: translateY(14px);
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
            .notif-card-reveal,
            .moku-trash-pop,
            .snackbar-enter,
            .snackbar-progress {
              animation: none;
            }
            .moku-icon-flip-inner {
              transition: none;
            }
          }
        `}</style>
      </main>
    );
  }

  /* =======================================================
     DESKTOP VIEW
  ======================================================= */

  return (
    <main className="min-h-screen w-full min-w-0 bg-white">
      <div className="page-enter mx-auto w-full max-w-6xl px-4 pb-8 pt-3 sm:px-6 sm:pt-5 lg:px-8">
        {isSelectionMode && notifications.length > 0 && (
          <div className="mb-3 flex min-h-11 items-center justify-between rounded-lg border border-[#730217]/15 bg-[#730217]/[0.035] px-3">
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
        )}

        <section>
          {notifications.length > 0 ? (
            <div className="divide-y divide-[#ECEDEF]">
              {notifications.map((item) => {
                const Icon = iconMap[item.type];
                const isSelected = selectedIds.includes(item.id);
                const isSlidingOut = slidingOutIds.includes(item.id);
                const isCollapsing = collapsingIds.includes(item.id);
                const subtitle = getNotificationSubtitle(item);

                const displayDate = formatNotificationDate(
                  item.createdAt,
                  item.time
                );

                return (
                  <div
                    key={item.id}
                    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isCollapsing
                        ? "pointer-events-none grid-rows-[0fr] opacity-0"
                        : "grid-rows-[1fr] opacity-100"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div
                        className={`group relative flex min-h-[76px] items-center gap-4 px-3 py-4 transition-all duration-500 ${
                          isSelected
                            ? "bg-[#730217]/[0.055]"
                            : !item.isRead
                              ? "bg-[#730217]/[0.018] hover:bg-[#F8F4F5]"
                              : "bg-white hover:bg-[#F7F7F8]"
                        }`}
                        style={{
                          transform: isSlidingOut
                            ? "translate3d(-32px, 0, 0)"
                            : "translate3d(0, 0, 0)",
                          opacity: isSlidingOut ? 0 : 1,
                        }}
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
                              className={`absolute inset-0 flex items-center justify-center rounded-xl transition-opacity duration-200 group-hover/icon:opacity-0 ${iconColorMap[item.type]}`}
                            >
                              <Icon size={20} weight="duotone" />
                            </span>

                            <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#730217]/10 text-[#730217] opacity-0 transition-opacity duration-200 group-hover/icon:opacity-100">
                              <Check size={19} weight="bold" />
                            </span>
                          </button>
                        )}

                        <Link
                          to={`/notifications/${encodeURIComponent(item.id)}`}
                          onClick={(event) => handleDetailClick(event, item.id)}
                          className="flex min-w-0 flex-1 items-center justify-between gap-5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#730217]/30"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="truncate text-sm font-semibold text-foreground">
                                {item.title}
                              </span>

                              <span
                                aria-hidden={item.isRead}
                                aria-label={
                                  !item.isRead ? "Belum dibaca" : undefined
                                }
                                className={`shrink-0 rounded-full bg-[#730217] transition-all duration-500 ${
                                  !item.isRead
                                    ? "h-2 w-2 scale-100 opacity-100"
                                    : "h-0 w-0 scale-0 opacity-0"
                                }`}
                              />
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

                        <div className="flex w-[76px] shrink-0 items-center justify-end gap-1">
                          {!item.isRead && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsRead(item.id, true)}
                              title="Tandai sudah dibaca"
                              aria-label={`Tandai ${item.title} sudah dibaca`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#730217] opacity-0 transition-all duration-200 hover:bg-[#730217]/10 group-hover:opacity-100 group-focus-within:opacity-100"
                            >
                              <Check size={17} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              animateAndDelete(
                                [item.id],
                                "1 notifikasi dihapus"
                              )
                            }
                            title="Hapus notifikasi"
                            aria-label={`Hapus ${item.title}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#BF0B2C] opacity-0 transition-all duration-200 hover:bg-[#BF0B2C]/10 group-hover:opacity-100 group-focus-within:opacity-100"
                          >
                            <Trash size={17} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="relative flex min-h-[440px] flex-col items-center justify-center overflow-hidden px-5 py-10 text-center">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="opacity-[0.17]">
                  <EmptyNotificationWatermark />
                </div>
              </div>

              <div className="relative z-10 mt-24 flex flex-col items-center">
                <h2 className="text-lg font-semibold tracking-tight text-[#730217]">
                  Belum Ada Notifikasi
                </h2>

                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  Aktivitas dan informasi terbaru akan muncul di sini.
                </p>

                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="mt-5 rounded-lg bg-[#730217] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5D0012]"
                >
                  Muat 15 Data Demo
                </button>
              </div>
            </div>
          )}
        </section>

        {notifications.length > 0 && (
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Data notifikasi saat ini merupakan data demo untuk pengujian
            tampilan.
          </p>
        )}
      </div>

      {snackbar && (
        <div
          role="status"
          aria-live="polite"
          className="snackbar-enter fixed bottom-6 left-4 right-4 z-50 mx-auto flex max-w-md items-center justify-between gap-3 overflow-hidden rounded-[13px] bg-[#730217] px-4 py-3 text-white shadow-xl"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <CheckCircle
              size={19}
              weight="fill"
              className="shrink-0 text-white"
            />

            <span className="truncate text-sm">{snackbar.message}</span>
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

      <style>{`
        .page-enter {
          animation: notification-enter 340ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .snackbar-enter {
          animation: snackbar-enter 340ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .snackbar-progress {
          animation: snackbar-countdown 5s linear forwards;
        }

        @keyframes notification-enter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes snackbar-enter {
          from {
            opacity: 0;
            transform: translateY(14px);
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
          .snackbar-progress {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
