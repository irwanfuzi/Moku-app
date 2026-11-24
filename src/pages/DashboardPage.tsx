import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  Bell,
  CalendarBlank,
  CaretDown,
  CaretRight,
  ChartBar,
  Check,
  Clock,
  DotsThreeVertical,
  DownloadSimple,
  Funnel,
  Hourglass,
  MagnifyingGlass,
  Plus,
  Printer,
  Target,
  TrendUp,
  Users,
  Warning,
  X,
} from "@phosphor-icons/react";
import { useAppLayout } from "@/components/layout/app-shell";
import {
  loadNotifications,
  subscribeNotifications,
} from "@/lib/notification-store";

/* =========================================================
   DESIGN SYSTEM & CONSTANTS
========================================================= */
const MONTHS = [
  "Agustus 2026",
  "September 2026",
  "Oktober 2026",
  "November 2026",
  "Desember 2026",
];

const Y_AXIS_TICKS = [20, 16, 12, 8, 4, 0];

const PULL_TRIGGER = 76;
const MAX_PULL = 136;
const REFRESH_HOLD = 68;
const REFRESH_DURATION_MS = 1800;

const ICON_SCROLL_START = 16;
const ICON_SCROLL_RANGE = 56;
const MAROON_HEX = "#83051C";

const SHEET_TRANSITION_MS = 420;
const SHEET_UNMOUNT_MS = 460;

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function blockContextMenu(event: MouseEvent<HTMLElement>) {
  event.preventDefault();
}

function triggerHaptic(duration = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(duration);
  }
}

/* =========================================================
   DASHBOARD DATA
========================================================= */
const monitoringData = [
  {
    label: "Sudah Dikunjungi",
    value: 32,
    percentage: 66,
    color: "#8E001C",
    desktopColor: "#8E001C",
    badge: "bg-[#FCECEF] text-[#B81432]",
  },
  {
    label: "Belum Dikunjungi",
    value: 12,
    percentage: 25,
    color: "#E2E2E5",
    desktopColor: "#B8B8C0",
    badge: "bg-[#F2F2F4] text-[#66636A]",
  },
  {
    label: "Perlu Perhatian",
    value: 4,
    percentage: 9,
    color: "#F28C0F",
    desktopColor: "#DCDCE0",
    badge: "bg-[#FFF1E6] text-[#E06D10]",
  },
];

const recentActivities = [
  {
    title: "Kunjungan selesai",
    machine: "MK-004",
    customer: "PT. Citra Jaya",
    time: "Hari ini",
    status: "success",
  },
  {
    title: "Kunjungan selesai",
    machine: "MK-001",
    customer: "PT. Sinar Mandiri",
    time: "Kemarin",
    status: "success",
  },
  {
    title: "Kunjungan dijadwalkan",
    machine: "MK-003",
    customer: "PT. Prima Solusi",
    time: "14 Okt",
    status: "pending",
  },
];

const desktopMachineRows = [
  {
    no: 1,
    code: "MK-001",
    model: "Photocopy A3",
    customer: "PT. Sinar Mandiri",
    status: "Sudah Dikunjungi",
    lastVisit: "12 Okt 2026",
  },
  {
    no: 2,
    code: "MK-002",
    model: "Printer Laser",
    customer: "CV. Multi Jaya",
    status: "Belum Dikunjungi",
    lastVisit: "-",
  },
  {
    no: 3,
    code: "MK-003",
    model: "Photocopy A4",
    customer: "PT. Prima Solusi",
    status: "Perlu Perhatian",
    lastVisit: "5 Okt 2026",
  },
  {
    no: 4,
    code: "MK-004",
    model: "Scanner",
    customer: "PT. Citra Jaya",
    status: "Sudah Dikunjungi",
    lastVisit: "10 Okt 2026",
  },
];

const desktopVisitChart = [
  { day: "Sen", visits: 12, target: 10 },
  { day: "Sel", visits: 14, target: 12 },
  { day: "Rab", visits: 12, target: 10 },
  { day: "Kam", visits: 17, target: 15 },
  { day: "Jum", visits: 10, target: 8 },
  { day: "Sab", visits: 13, target: 10 },
  { day: "Min", visits: 17, target: 16 },
];

/* =========================================================
   HELPERS & SHARED COMPONENTS
========================================================= */
function useUnreadNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const syncUnread = () => {
      const items = loadNotifications();
      setUnreadCount(items.filter((item) => !item.isRead).length);
    };

    syncUnread();
    return subscribeNotifications(syncUnread);
  }, []);

  return unreadCount;
}

function detectStandalonePwa() {
  if (typeof window === "undefined") return false;
  const isStandaloneDisplay =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches;
  const isIosStandalone = Boolean(
    (window.navigator as Navigator & { standalone?: boolean }).standalone
  );

  return isStandaloneDisplay || isIosStandalone;
}

function formatGreetingName(fullName: string) {
  const words = fullName.trim().split(/\s+/);
  return words.slice(0, 2).join(" ");
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="min-w-0 whitespace-nowrap font-display text-[calc(15.5*var(--u))] font-bold leading-[1.2] tracking-[-0.025em] text-[#171717]">
      {children}
    </h2>
  );
}

function MobileCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-[calc(19*var(--u))] border border-[#EEEEEE] bg-white shadow-[0_1px_4px_rgba(41,35,42,0.025)] ${className}`}
    >
      {children}
    </section>
  );
}

function ShimmerOverlay({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div
      aria-hidden="true"
      className="moku-skeleton pointer-events-none absolute inset-0 z-10 opacity-40 transition-opacity duration-200"
    />
  );
}

function QuickAction({
  href,
  label,
  children,
  separated = false,
}: {
  href: string;
  label: ReactNode;
  children: ReactNode;
  separated?: boolean;
}) {
  return (
    <Link
      to={href}
      onContextMenu={blockContextMenu}
      draggable={false}
      className={`group flex min-w-0 select-none flex-col items-center justify-start gap-[calc(5*var(--u))] px-[calc(4*var(--u))] text-center [-webkit-touch-callout:none] [-webkit-user-select:none] transition-transform duration-150 active:scale-95 ${
        separated ? "border-l border-[#EAEAEF]" : ""
      }`}
    >
      <span className="flex h-[calc(44*var(--u))] w-[calc(44*var(--u))] shrink-0 items-center justify-center rounded-[calc(12*var(--u))] bg-[#8E001C] text-white shadow-none transition-colors duration-150 group-active:bg-[#730217]">
        {children}
      </span>
      <span className="text-[calc(11.5*var(--u))] font-medium leading-[1.2] tracking-[-0.02em] text-[#1F1B20]">
        {label}
      </span>
    </Link>
  );
}

/* =========================================================
   MONTH PICKER BOTTOM SHEET (PORTAL + SMOOTH SLIDE & DRAG)
========================================================= */
function MonthPickerSheet({
  isOpen,
  selectedMonth,
  onSelect,
  onClose,
}: {
  isOpen: boolean;
  selectedMonth: string;
  onSelect: (month: string) => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const selectDelayRef = useRef<number | null>(null);
  const dragRef = useRef({
    pointerId: null as number | null,
    startY: 0,
    lastY: 0,
    lastTime: 0,
    velocity: 0,
    hasDragged: false,
  });

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setDragY(0);
      setIsDragging(false);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    } else {
      setIsDragging(false);
      setVisible(false);
      const timer = window.setTimeout(() => {
        setMounted(false);
        setDragY(0);
      }, SHEET_UNMOUNT_MS);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (selectDelayRef.current !== null) {
        window.clearTimeout(selectDelayRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!visible) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      lastY: e.clientY,
      lastTime: performance.now(),
      velocity: 0,
      hasDragged: false,
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (d.pointerId !== e.pointerId) return;

    const rawDelta = e.clientY - d.startY;
    const now = performance.now();
    const dt = Math.max(1, now - d.lastTime);
    d.velocity = (e.clientY - d.lastY) / dt;
    d.lastY = e.clientY;
    d.lastTime = now;

    if (!d.hasDragged) {
      if (Math.abs(rawDelta) < 6) return;
      d.hasDragged = true;
      setIsDragging(true);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Abaikan jika pointer capture tidak didukung
      }
    }

    if (rawDelta >= 0) {
      setDragY(rawDelta);
    } else {
      const pullUp = -rawDelta;
      setDragY(-28 * (1 - Math.exp(-pullUp / 90)));
    }
  };

  const onPointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (d.pointerId !== e.pointerId) return;

    const wasDragged = d.hasDragged;
    const velocity = d.velocity;
    const finalDelta = Math.max(0, e.clientY - d.startY);

    if (wasDragged && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    d.pointerId = null;
    d.hasDragged = false;
    if (!wasDragged) return;

    setIsDragging(false);

    if (finalDelta >= 80 || (finalDelta > 24 && velocity >= 0.5)) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  const handleOptionClick = (month: string) => {
    onSelect(month);
    if (selectDelayRef.current !== null) {
      window.clearTimeout(selectDelayRef.current);
    }
    // Jeda singkat agar perpindahan centang terlihat sebelum sheet meluncur turun
    selectDelayRef.current = window.setTimeout(() => {
      onClose();
      selectDelayRef.current = null;
    }, 140);
  };

  if (!mounted || typeof document === "undefined") return null;

  const backdropOpacity = visible
    ? Math.max(0.08, 0.45 - Math.max(0, dragY) / 480)
    : 0;

  return createPortal(
    <div
      style={MOBILE_SCALE_VARS}
      role="dialog"
      aria-modal="true"
      aria-label="Pilih Periode"
      className="fixed inset-0 z-[9999] flex items-end justify-center select-none [-webkit-touch-callout:none] [-webkit-user-select:none]"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          opacity: backdropOpacity,
          transition: isDragging
            ? "none"
            : `opacity ${SHEET_TRANSITION_MS}ms ease-out`,
        }}
        className="fixed inset-0 bg-black backdrop-blur-[1.5px]"
      />

      {/* Sheet Panel */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        style={{
          touchAction: "none",
          transform: visible
            ? `translate3d(0, ${dragY}px, 0)`
            : "translate3d(0, 105%, 0)",
          transition: isDragging
            ? "none"
            : visible
              ? `transform ${SHEET_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
              : `transform ${SHEET_TRANSITION_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
          willChange: "transform",
        }}
        className="relative z-10 w-full max-w-[600px] rounded-t-[calc(24*var(--u))] bg-white px-[calc(18*var(--u))] pb-[calc(22*var(--u)+env(safe-area-inset-bottom))] pt-[calc(10*var(--u))] shadow-[0_-8px_30px_rgba(23,23,23,0.18)] after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[120px] after:bg-white"
      >
        {/* Drag Handle */}
        <div className="mx-auto mb-[calc(12*var(--u))] h-[calc(4*var(--u))] w-[calc(40*var(--u))] cursor-grab rounded-full bg-[#DCDCE2] active:cursor-grabbing" />

        <div className="mb-[calc(10*var(--u))] flex items-center justify-between">
          <h3 className="font-display text-[calc(16*var(--u))] font-bold tracking-[-0.02em] text-[#171717]">
            Pilih Periode
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-[calc(32*var(--u))] w-[calc(32*var(--u))] items-center justify-center rounded-full text-[#5A555F] transition-colors duration-200 active:bg-[#F2F2F5]"
          >
            <X
              weight="bold"
              className="h-[calc(18*var(--u))] w-[calc(18*var(--u))]"
            />
          </button>
        </div>

        <div className="space-y-[calc(6*var(--u))]">
          {MONTHS.map((month) => {
            const isActive = selectedMonth === month;
            return (
              <button
                key={month}
                type="button"
                onClick={() => handleOptionClick(month)}
                className={`flex w-full items-center justify-between rounded-[calc(14*var(--u))] px-[calc(14*var(--u))] py-[calc(12*var(--u))] text-left transition-all duration-300 ease-out active:scale-[0.985] ${
                  isActive
                    ? "bg-[#FCECEF] font-bold text-[#8E001C]"
                    : "bg-white font-medium text-[#29232A] active:bg-[#F7F7F9]"
                }`}
              >
                <span className="flex items-center gap-[calc(10*var(--u))] text-[calc(14*var(--u))]">
                  <CalendarBlank
                    weight={isActive ? "fill" : "regular"}
                    className={`h-[calc(18*var(--u))] w-[calc(18*var(--u))] transition-colors duration-300 ${
                      isActive ? "text-[#8E001C]" : "text-[#7A7480]"
                    }`}
                  />
                  {month}
                </span>

                <span
                  className={`flex h-[calc(22*var(--u))] w-[calc(22*var(--u))] items-center justify-center rounded-full bg-[#8E001C] text-white transition-all duration-300 ease-[cubic-bezier(0.22,1.28,0.36,1)] ${
                    isActive
                      ? "scale-100 opacity-100"
                      : "pointer-events-none scale-50 opacity-0"
                  }`}
                >
                  <Check
                    weight="bold"
                    className="h-[calc(13*var(--u))] w-[calc(13*var(--u))]"
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* =========================================================
   DESKTOP DASHBOARD
========================================================= */
function DesktopDashboard() {
  const unreadCount = useUnreadNotificationCount();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [customerFilter, setCustomerFilter] = useState("Semua Pelanggan");
  const [openAction, setOpenAction] = useState<string | null>(null);
  const [desktopMonth, setDesktopMonth] = useState("Oktober 2026");

  const filteredRows = desktopMachineRows.filter((row) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [row.code, row.model, row.customer, row.status].some((value) =>
        value.toLowerCase().includes(query)
      );
    const matchesStatus =
      statusFilter === "Semua Status" || row.status === statusFilter;
    const matchesCustomer =
      customerFilter === "Semua Pelanggan" || row.customer === customerFilter;

    return matchesSearch && matchesStatus && matchesCustomer;
  });

  const kpis = [
    { label: "Total Mesin", value: "48", icon: Printer },
    { label: "Sudah Dikunjungi", value: "32", icon: Check },
    { label: "Belum Dikunjungi", value: "12", icon: Hourglass },
    { label: "Perlu Perhatian", value: "4", icon: Warning },
  ];

  const badgeText = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 text-[#171923]">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-[clamp(26px,2.8vw,34px)] font-extrabold leading-tight tracking-[-0.03em] text-[#730217]">
            Dashboard
          </h1>
          <p className="mt-0.5 text-sm text-[#5A5660] md:text-[15px]">
            Ringkasan aktivitas dan monitoring kunjungan mesin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <label className="flex h-[44px] min-w-[175px] items-center gap-2.5 rounded-xl border border-[#E4E4E8] bg-white px-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
            <CalendarBlank size={18} className="shrink-0 text-[#4F4B53]" />
            <select
              value={desktopMonth}
              onChange={(event) => setDesktopMonth(event.target.value)}
              className="w-full cursor-pointer bg-transparent text-sm font-semibold text-[#171717] outline-none"
            >
              {MONTHS.map((month) => (
                <option key={month}>{month}</option>
              ))}
            </select>
          </label>

          <Link
            to="/notifications"
            aria-label={
              unreadCount > 0
                ? `Notifikasi (${unreadCount} belum dibaca)`
                : "Notifikasi"
            }
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#29232A] transition hover:bg-[#F3ECEF]"
          >
            <Bell size={23} weight="regular" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#BF0B2C] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#FAFAFC]">
                {badgeText}
              </span>
            )}
          </Link>

          <span className="hidden h-8 w-px bg-[#E5E5E8] sm:block" />

          <Link
            to="/profile"
            className="flex items-center gap-2.5 rounded-xl py-1 pr-1 transition hover:bg-[#F3ECEF]/60"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1E9EC] font-display text-sm font-bold text-[#730217]">
              BS
            </span>
            <span className="hidden text-left sm:block">
              <strong className="block text-sm font-bold leading-tight text-[#171717]">
                Budi Santoso
              </strong>
              <small className="block text-xs text-[#77727A]">Teknisi</small>
            </span>
            <CaretDown size={15} weight="bold" className="text-[#77727A]" />
          </Link>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex min-h-[96px] items-center gap-4 rounded-[18px] border border-[#ECECEF] bg-white px-4 py-4 shadow-[0_1px_4px_rgba(41,35,42,0.025)] md:px-5"
          >
            <span className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[13px] bg-[#8E001C] text-white">
              <Icon size={25} weight="bold" />
            </span>
            <div className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-[#29232A]">
                {label}
              </span>
              <span className="mt-0.5 block font-display text-[30px] font-extrabold leading-none tracking-[-0.03em] text-[#111111]">
                {value}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Charts Row */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.28fr)]">
        {/* Status Monitoring Mesin */}
        <article className="rounded-[18px] border border-[#ECECEF] bg-white p-5 shadow-[0_1px_4px_rgba(41,35,42,0.025)]">
          <h2 className="font-display text-[17px] font-bold tracking-[-0.02em] text-[#171717]">
            Status Monitoring Mesin
          </h2>

          <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div
              className="relative h-[168px] w-[168px] shrink-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, #8E001C 0deg 240deg, #D5D5DA 240deg 330deg, #E8E8EC 330deg 360deg)",
              }}
              role="img"
              aria-label="48 Total Mesin"
            >
              <div className="absolute inset-[26px] flex flex-col items-center justify-center rounded-full bg-white">
                <strong className="font-display text-[36px] font-extrabold leading-none tracking-[-0.04em] text-[#111111]">
                  48
                </strong>
                <span className="mt-1 text-xs font-medium text-[#66616A]">
                  Total Mesin
                </span>
              </div>
            </div>

            <div className="w-full min-w-0 flex-1 space-y-4 sm:pl-2">
              {monitoringData.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-[4px]"
                      style={{ backgroundColor: item.desktopColor }}
                    />
                    <span className="truncate font-medium text-[#29232A]">
                      {item.label}
                    </span>
                  </div>
                  <strong className="shrink-0 font-bold text-[#171717]">
                    {item.value}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* Kunjungan Bulan Ini */}
        <article className="rounded-[18px] border border-[#ECECEF] bg-white p-5 shadow-[0_1px_4px_rgba(41,35,42,0.025)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-[17px] font-bold tracking-[-0.02em] text-[#171717]">
              Kunjungan Bulan Ini
            </h2>

            <div className="flex items-center gap-4 text-xs font-medium text-[#5A5660]">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] bg-[#8E001C]" />
                Kunjungan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] bg-[#D5D5DA]" />
                Target
              </span>
            </div>
          </div>

          <div className="mt-5 flex h-[176px] gap-3">
            {/* Y-Axis */}
            <div className="flex flex-col justify-between pb-6 text-right text-[11px] font-medium text-[#77727A]">
              {Y_AXIS_TICKS.map((tick) => (
                <span key={tick}>{tick}</span>
              ))}
            </div>

            {/* Bars */}
            <div className="relative flex flex-1 flex-col">
              <div className="pointer-events-none absolute inset-x-0 bottom-6 top-1 flex flex-col justify-between">
                {Y_AXIS_TICKS.map((tick) => (
                  <div
                    key={tick}
                    className="w-full border-t border-dashed border-[#EFEFF2]"
                  />
                ))}
              </div>

              <div className="relative z-10 flex flex-1 items-end justify-between gap-2 px-1 pb-6 pt-1 sm:gap-3">
                {desktopVisitChart.map((item) => (
                  <div
                    key={item.day}
                    className="flex h-full flex-1 flex-col items-center justify-end"
                  >
                    <div className="flex h-full w-full items-end justify-center gap-1">
                      <div
                        className="w-[38%] max-w-[18px] rounded-t-[4px] bg-[#8E001C] transition-all"
                        style={{ height: `${(item.visits / 20) * 100}%` }}
                        title={`Kunjungan ${item.day}: ${item.visits}`}
                      />
                      <div
                        className="w-[38%] max-w-[18px] rounded-t-[4px] bg-[#D5D5DA] transition-all"
                        style={{ height: `${(item.target / 20) * 100}%` }}
                        title={`Target ${item.day}: ${item.target}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* X-Axis */}
              <div className="flex justify-between px-1 text-center text-xs font-medium text-[#5A5660]">
                {desktopVisitChart.map((item) => (
                  <span key={item.day} className="flex-1">
                    {item.day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* Daftar Mesin */}
      <section className="rounded-[18px] border border-[#ECECEF] bg-white p-5 shadow-[0_1px_4px_rgba(41,35,42,0.025)]">
        <h2 className="font-display text-[17px] font-bold tracking-[-0.02em] text-[#171717]">
          Daftar Mesin
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <label className="flex h-10 min-w-[200px] flex-1 items-center gap-2 rounded-full border border-[#E4E4E8] bg-[#FAFAFB] px-3.5">
            <MagnifyingGlass size={16} className="shrink-0 text-[#77727A]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama mesin, pelanggan, atau lokasi..."
              className="w-full bg-transparent text-xs text-[#171717] outline-none placeholder:text-[#8E8994] sm:text-sm"
            />
          </label>

          <label className="flex h-10 min-w-[148px] items-center gap-2 rounded-full border border-[#E4E4E8] bg-white px-3.5">
            <Funnel size={15} className="shrink-0 text-[#5A5660]" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full cursor-pointer bg-transparent text-xs font-medium text-[#29232A] outline-none sm:text-sm"
            >
              <option>Semua Status</option>
              <option>Sudah Dikunjungi</option>
              <option>Belum Dikunjungi</option>
              <option>Perlu Perhatian</option>
            </select>
          </label>

          <label className="flex h-10 min-w-[162px] items-center gap-2 rounded-full border border-[#E4E4E8] bg-white px-3.5">
            <Users size={15} className="shrink-0 text-[#5A5660]" />
            <select
              value={customerFilter}
              onChange={(event) => setCustomerFilter(event.target.value)}
              className="w-full cursor-pointer bg-transparent text-xs font-medium text-[#29232A] outline-none sm:text-sm"
            >
              <option>Semua Pelanggan</option>
              <option>PT. Sinar Mandiri</option>
              <option>CV. Multi Jaya</option>
              <option>PT. Prima Solusi</option>
              <option>PT. Citra Jaya</option>
            </select>
          </label>

          <Link
            to="/equipment"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-[#8E001C] px-4 text-xs font-semibold text-white transition hover:bg-[#730217] sm:text-sm"
          >
            <Plus size={16} weight="bold" />
            Tambah
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="border-y border-[#EFEFF2] bg-[#F8F8FA] text-xs font-bold text-[#29232A]">
                <th className="px-3.5 py-3">No.</th>
                <th className="px-3.5 py-3">Kode Mesin</th>
                <th className="px-3.5 py-3">Nama Mesin</th>
                <th className="px-3.5 py-3">Pelanggan</th>
                <th className="px-3.5 py-3">Status Monitoring</th>
                <th className="px-3.5 py-3">Kunjungan Terakhir</th>
                <th className="px-3.5 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.code}
                  className="border-b border-[#EFEFF2] text-sm transition hover:bg-[#FCFAFB]"
                >
                  <td className="px-3.5 py-3.5 text-[#5A5660]">{row.no}</td>
                  <td className="px-3.5 py-3.5 font-semibold text-[#171717]">
                    {row.code}
                  </td>
                  <td className="px-3.5 py-3.5 text-[#29232A]">{row.model}</td>
                  <td className="px-3.5 py-3.5 text-[#29232A]">
                    {row.customer}
                  </td>
                  <td className="px-3.5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        row.status === "Sudah Dikunjungi"
                          ? "bg-[#FCECEF] text-[#8E001C]"
                          : row.status === "Perlu Perhatian"
                            ? "bg-[#FDECEE] text-[#B81432]"
                            : "bg-[#F1F1F4] text-[#55525A]"
                      }`}
                    >
                      {row.status === "Sudah Dikunjungi" ? (
                        <Check size={13} weight="bold" />
                      ) : row.status === "Perlu Perhatian" ? (
                        <Warning size={13} weight="bold" />
                      ) : (
                        <Hourglass size={13} weight="bold" />
                      )}
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3.5 py-3.5 text-[#29232A]">
                    {row.lastVisit}
                  </td>
                  <td className="relative px-3.5 py-3.5 text-center">
                    <button
                      type="button"
                      aria-label={`Aksi ${row.code}`}
                      onClick={() =>
                        setOpenAction(openAction === row.code ? null : row.code)
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#5A5660] hover:bg-[#F3ECEF]"
                    >
                      <DotsThreeVertical size={18} weight="bold" />
                    </button>

                    {openAction === row.code && (
                      <div className="absolute right-8 top-11 z-20 w-40 rounded-xl border border-[#E7E2E5] bg-white p-1 text-left shadow-lg">
                        <Link
                          to={`/equipment/${row.code}`}
                          className="block rounded-lg px-3 py-2 text-sm hover:bg-[#F8F2F4]"
                          onClick={() => setOpenAction(null)}
                        >
                          Lihat Detail
                        </Link>
                        <Link
                          to={`/visits/new?equipment=${row.code}`}
                          className="block rounded-lg px-3 py-2 text-sm hover:bg-[#F8F2F4]"
                          onClick={() => setOpenAction(null)}
                        >
                          Buat Kunjungan
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-[#77727A]"
                  >
                    Tidak ada data mesin yang sesuai dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   MOBILE DASHBOARD (UNIVERSAL PROPORTIONAL SCALE --u)
========================================================= */
function MobileDashboard() {
  const { isPWA, navigateWithTransition } = useAppLayout();
  const unreadCount = useUnreadNotificationCount();
  const [selectedMonth, setSelectedMonth] = useState("Oktober 2026");
  const [isMonthJustChanged, setIsMonthJustChanged] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const [iconProgress, setIconProgress] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPullDragging, setIsPullDragging] = useState(false);

  const mainRef = useRef<HTMLElement | null>(null);
  const scrollElRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const refreshTimerRef = useRef<number | null>(null);
  const monthPulseTimerRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const showMonthPickerRef = useRef(false);

  const isPwaMode = isPWA || detectStandalonePwa();

  const openMonthPicker = useCallback(() => {
    triggerHaptic(6);
    setShowMonthPicker(true);
  }, []);

  const closeMonthPicker = useCallback(() => {
    setShowMonthPicker(false);
  }, []);

  const handleSelectMonth = useCallback(
    (month: string) => {
      triggerHaptic(8);
      if (month !== selectedMonth) {
        setSelectedMonth(month);
        setIsMonthJustChanged(true);

        if (monthPulseTimerRef.current !== null) {
          window.clearTimeout(monthPulseTimerRef.current);
        }
        // Tahan warna marun lembut sampai sheet selesai turun, lalu pudar halus ke putih
        monthPulseTimerRef.current = window.setTimeout(() => {
          setIsMonthJustChanged(false);
          monthPulseTimerRef.current = null;
        }, 950);
      }
    },
    [selectedMonth]
  );

  useEffect(() => {
    showMonthPickerRef.current = showMonthPicker;
  }, [showMonthPicker]);

  useEffect(() => {
    return () => {
      if (monthPulseTimerRef.current !== null) {
        window.clearTimeout(monthPulseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    pullDistanceRef.current = pullDistance;
  }, [pullDistance]);

  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  useEffect(() => {
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((meta) => meta.setAttribute("content", MAROON_HEX));

    let mounted = true;
    let activeScrollEl: HTMLElement | null = null;

    const getScrollTop = () => {
      if (scrollElRef.current) {
        return Math.max(0, scrollElRef.current.scrollTop);
      }
      return Math.max(
        0,
        window.scrollY ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0
      );
    };

    const updateIconProgress = () => {
      rafRef.current = null;
      const busy =
        isPullingRef.current ||
        pullDistanceRef.current > 0 ||
        isRefreshingRef.current;

      if (busy) {
        setIconProgress((prev) => (prev !== 0 ? 0 : prev));
        return;
      }

      const top = getScrollTop();
      const raw = clamp01((top - ICON_SCROLL_START) / ICON_SCROLL_RANGE);
      const smooth = raw * raw * (3 - 2 * raw);

      setIconProgress((prev) =>
        Math.abs(prev - smooth) > 0.004 ? smooth : prev
      );
    };

    const onScroll = () => {
      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(updateIconProgress);
      }
    };

    const ionContent = mainRef.current?.closest("ion-content") as
      | (HTMLElement & { getScrollElement?: () => Promise<HTMLElement> })
      | null;

    if (ionContent?.getScrollElement) {
      ionContent.getScrollElement().then((el) => {
        if (!mounted || !el) return;
        scrollElRef.current = el;
        activeScrollEl = el;
        el.addEventListener("scroll", onScroll, { passive: true });
        updateIconProgress();
      });
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
      updateIconProgress();
    }

    return () => {
      mounted = false;
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
      }
      if (activeScrollEl) {
        activeScrollEl.removeEventListener("scroll", onScroll);
      }
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (isPullingRef.current || pullDistance > 0 || isRefreshing) {
      setIconProgress(0);
    }
  }, [pullDistance, isRefreshing]);

  useEffect(() => {
    const el = mainRef.current;
    if (!el || !isPwaMode) return;

    const getScrollTop = () => {
      if (scrollElRef.current) {
        return Math.max(0, scrollElRef.current.scrollTop);
      }
      return Math.max(
        0,
        window.scrollY ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0
      );
    };

    const onTouchStart = (event: globalThis.TouchEvent) => {
      if (
        showMonthPickerRef.current ||
        isRefreshingRef.current ||
        event.touches.length !== 1
      ) {
        return;
      }
      if (getScrollTop() <= 0) {
        touchStartYRef.current = event.touches[0].clientY;
        isPullingRef.current = true;
      } else {
        touchStartYRef.current = null;
        isPullingRef.current = false;
      }
    };

    const onTouchMove = (event: globalThis.TouchEvent) => {
      if (
        showMonthPickerRef.current ||
        !isPullingRef.current ||
        touchStartYRef.current === null ||
        isRefreshingRef.current
      ) {
        return;
      }

      if (getScrollTop() > 0) {
        isPullingRef.current = false;
        touchStartYRef.current = null;
        setIsPullDragging(false);
        setPullDistance(0);
        return;
      }

      const deltaY = event.touches[0].clientY - touchStartYRef.current;

      if (deltaY > 0) {
        if (event.cancelable) {
          event.preventDefault();
        }
        setIsPullDragging(true);
        const damped = MAX_PULL * (1 - Math.exp(-deltaY / 135));
        setPullDistance(damped);
      } else {
        isPullingRef.current = false;
        touchStartYRef.current = null;
        setIsPullDragging(false);
        setPullDistance(0);
      }
    };

    const onTouchEnd = () => {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;
      touchStartYRef.current = null;
      setIsPullDragging(false);

      const currentPull = pullDistanceRef.current;
      if (currentPull >= PULL_TRIGGER * 0.72) {
        setIsRefreshing(true);
        setPullDistance(REFRESH_HOLD);

        if (refreshTimerRef.current !== null) {
          window.clearTimeout(refreshTimerRef.current);
        }
        refreshTimerRef.current = window.setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, REFRESH_DURATION_MS);
      } else {
        setPullDistance(0);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [isPwaMode]);

  const pullRatio = Math.min(1, pullDistance / REFRESH_HOLD);
  const ringDeg = Math.round(pullRatio * 360);
  const emblemOpacity = isRefreshing
    ? 1
    : Math.min(1, Math.max(0, (pullDistance - 2) / 34));
  const emblemTranslateY = isRefreshing ? 4 : -10 + pullRatio * 14;
  const emblemScale = isRefreshing ? 0.96 : 0.5 + pullRatio * 0.46;
  const showPwaShimmer = isPwaMode && isRefreshing;
  const isIconSwapped = iconProgress > 0.5;
  const userName = "Budi Santoso";
  const badgeText = unreadCount > 99 ? "99+" : String(unreadCount);

  const isChipHighlighted = showMonthPicker || isMonthJustChanged;

  return (
    <main
      ref={mainRef}
      onContextMenu={blockContextMenu}
      style={{
        ...MOBILE_SCALE_VARS,
        overscrollBehaviorY: isPwaMode ? "none" : "auto",
      }}
      className="min-h-dvh w-full select-none bg-[#FAFAFC] pb-[calc(72*var(--u)+env(safe-area-inset-bottom))] [-webkit-touch-callout:none] [-webkit-user-select:none]"
    >
      {/* Sticky Compact Top Bar */}
      <div
        style={{
          backgroundColor: `rgba(131, 5, 28, ${iconProgress})`,
          boxShadow: `0 4px 14px rgba(45, 0, 10, ${iconProgress * 0.18})`,
        }}
        className="sticky top-0 z-40 w-full"
      >
        <div className="mx-auto flex w-full max-w-[600px] items-center justify-between px-[calc(18*var(--u))] pb-[calc(6*var(--u))] pt-[calc(env(safe-area-inset-top)+calc(5*var(--u)))]">
          <Link
            to="/"
            onContextMenu={blockContextMenu}
            draggable={false}
            aria-label="MOKU Dashboard"
            className="relative flex h-[calc(28*var(--u))] items-center [-webkit-touch-callout:none]"
          >
            <img
              src="/images/moku/brand/moku-logo.png"
              alt="MOKU"
              width={180}
              height={65}
              draggable={false}
              style={{
                opacity: 1 - iconProgress,
                transform: `scale(${1 - iconProgress * 0.18})`,
              }}
              className={`h-[calc(23*var(--u))] w-auto origin-left object-contain object-left will-change-[opacity,transform] ${
                isIconSwapped ? "pointer-events-none" : ""
              }`}
            />

            <span
              style={{
                opacity: iconProgress,
                transform: `scale(${0.82 + iconProgress * 0.18})`,
              }}
              className={`absolute left-0 flex h-[calc(27*var(--u))] w-[calc(27*var(--u))] items-center justify-center will-change-[opacity,transform] ${
                isIconSwapped ? "" : "pointer-events-none"
              }`}
            >
              <img
                src="/images/moku/brand/app-icon.png"
                alt="Ikon MOKU"
                width={64}
                height={64}
                draggable={false}
                className="h-full w-full object-contain"
              />
            </span>
          </Link>

          <div className="relative mr-[calc(4*var(--u))] flex h-[calc(28*var(--u))] items-center">
            <button
              type="button"
              onClick={() =>
                navigateWithTransition("/notifications", "forward")
              }
              aria-label={
                unreadCount > 0
                  ? `Notifikasi (${unreadCount} belum dibaca)`
                  : "Notifikasi"
              }
              className="relative flex h-[calc(32*var(--u))] w-[calc(32*var(--u))] items-center justify-center rounded-full transition-colors active:bg-white/15"
            >
              <Bell
                weight="regular"
                className="h-[calc(22*var(--u))] w-[calc(22*var(--u))] text-white"
              />

              {unreadCount > 0 && (
                <span className="absolute -right-[calc(1*var(--u))] top-[calc(1*var(--u))] flex h-[calc(16*var(--u))] min-w-[calc(16*var(--u))] items-center justify-center rounded-full bg-[#FF3B30] px-[calc(4*var(--u))] text-[calc(9.5*var(--u))] font-bold leading-none tabular-nums text-white ring-[1.5px] ring-[#83051C]">
                  {badgeText}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Konten ditarik ke atas menempel tepat di belakang top bar & status bar */}
      <div className="relative mx-auto -mt-[calc(39*var(--u)+env(safe-area-inset-top))] w-full max-w-[600px]">
        {/* Emblem Pull-to-Refresh MOKU */}
        {isPwaMode && (
          <div
            aria-hidden={!isRefreshing && pullDistance <= 0}
            style={{
              opacity: emblemOpacity,
              transform: `translate3d(0, ${emblemTranslateY}px, 0) scale(${emblemScale})`,
              transition: isPullDragging
                ? "none"
                : "transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease",
            }}
            className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+calc(42*var(--u)))] z-50 flex justify-center will-change-[transform,opacity]"
          >
            <div className="relative flex h-[calc(40*var(--u))] w-[calc(40*var(--u))] items-center justify-center rounded-full bg-white shadow-[0_6px_18px_rgba(45,0,10,0.28)]">
              <span
                aria-hidden="true"
                style={{
                  background: isRefreshing
                    ? "conic-gradient(from 0deg, #8E001C 0deg, #F28C0F 180deg, rgba(142,0,28,0.12) 360deg)"
                    : `conic-gradient(from -90deg, #8E001C 0deg ${ringDeg}deg, #EFEFF4 ${ringDeg}deg 360deg)`,
                }}
                className={`absolute inset-0 rounded-full p-[calc(2.5*var(--u))] ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              >
                <span className="block h-full w-full rounded-full bg-white" />
              </span>

              <div
                className={`relative z-10 flex h-[calc(24*var(--u))] w-[calc(24*var(--u))] items-center justify-center transition-transform duration-300 ${
                  isRefreshing ? "animate-pulse scale-105" : ""
                }`}
              >
                <img
                  src="/images/moku/brand/app-icon.png"
                  alt="Memuat ulang MOKU"
                  width={56}
                  height={56}
                  draggable={false}
                  style={{
                    transform: isRefreshing
                      ? undefined
                      : `rotate(${(pullRatio - 0.5) * 32}deg)`,
                  }}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* Latar belakang marun menerus ke atas */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-[180px] h-[calc(400*var(--u)+env(safe-area-inset-top))] bg-[#83051C]"
        />

        {/* Konten bergerak elastis saat ditarik, balik mulus tanpa overshoot */}
        <div
          style={{
            transform:
              isPwaMode && pullDistance > 0
                ? `translate3d(0, ${pullDistance}px, 0)`
                : undefined,
            transition: isPullDragging
              ? "none"
              : "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          className="relative"
        >
          {/* Header Banner */}
          <header className="relative isolate h-[calc(206*var(--u)+env(safe-area-inset-top))] overflow-hidden bg-[#83051C] text-white">
            {/* Gradasi dasar marun yang lebih halus tanpa banding tajam */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 -top-[180px] bottom-0"
              style={{
                background:
                  "linear-gradient(180deg, #83051C 0%, #83051C 52%, #750317 80%, #660113 100%)",
              }}
            />

            {/* Ambient radial glow lembut tepat di belakang robot */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[2]"
              style={{
                background:
                  "radial-gradient(circle at 82% 66%, rgba(255, 110, 130, 0.16) 0%, rgba(217, 22, 58, 0.10) 34%, rgba(131, 5, 28, 0) 68%)",
              }}
            />

            {/* Satu aksen lengkung sangat halus di pojok kanan atas */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-[84px] -top-[74px] z-[3] h-[290px] w-[290px] rounded-full border border-white/[0.055]"
            />

            <div className="absolute left-[calc(18*var(--u))] top-[calc(env(safe-area-inset-top)+calc(92*var(--u)))] z-20 w-[calc(100%-calc(36*var(--u)))] pr-[calc(126*var(--u))]">
              <h1 className="whitespace-nowrap font-display text-[calc(19.5*var(--u))] font-bold leading-[1.2] tracking-[-0.03em] text-white">
                Halo, {formatGreetingName(userName)}
              </h1>
              <p className="mt-[calc(5*var(--u))] whitespace-nowrap text-[calc(10.5*var(--u))] font-normal leading-[1.35] tracking-[-0.015em] text-white/85">
                Ringkasan operasional kunjungan unit.
              </p>
            </div>

            <div className="pointer-events-none absolute bottom-[calc(14*var(--u))] right-[calc(16*var(--u))] z-10 flex h-[calc(126*var(--u))] w-[calc(126*var(--u))] items-end justify-center">
              <img
                src="/images/moku/illustrations/dashboard-robot-printer.png"
                alt="Ilustrasi robot MOKU membawa printer"
                width={420}
                height={420}
                draggable={false}
                className="h-full w-full -scale-x-100 object-contain object-bottom drop-shadow-[0_8px_16px_rgba(45,0,10,0.22)]"
              />
            </div>
          </header>

          {/* Canvas Konten */}
          <div className="relative z-20 -mt-[calc(28*var(--u))] flex flex-col gap-[calc(14*var(--u))] rounded-t-[calc(24*var(--u))] bg-[#FAFAFC] px-[calc(14*var(--u))] pt-[calc(15*var(--u))]">
            {/* 1. Status Monitoring Mesin */}
            <section className="min-w-0">
              <div className="flex min-w-0 items-center justify-between gap-[calc(8*var(--u))] px-[2px]">
                <SectionTitle>Status Monitoring Mesin</SectionTitle>

                <button
                  type="button"
                  onClick={openMonthPicker}
                  aria-haspopup="dialog"
                  aria-expanded={showMonthPicker}
                  className={`group flex h-[calc(33*var(--u))] shrink-0 items-center gap-[calc(5*var(--u))] overflow-hidden rounded-full border px-[calc(11*var(--u))] ring-2 transition-[transform,background-color,border-color,box-shadow] duration-500 ease-out active:scale-[0.94] active:duration-150 ${
                    showMonthPicker
                      ? "border-[#8E001C]/35 bg-[#FDF2F4] ring-[#8E001C]/12 shadow-[0_2px_10px_rgba(142,0,28,0.09)]"
                      : isMonthJustChanged
                        ? "moku-chip-confirm border-[#8E001C]/30 bg-[#FDF2F4] ring-[#8E001C]/10 shadow-[0_2px_8px_rgba(142,0,28,0.07)]"
                        : "border-[#E6E6EA] bg-white ring-transparent shadow-[0_1px_2px_rgba(41,35,42,0.02)] active:bg-[#F7F7F9]"
                  }`}
                >
                  <CalendarBlank
                    weight={isChipHighlighted ? "fill" : "bold"}
                    className={`h-[calc(14*var(--u))] w-[calc(14*var(--u))] shrink-0 transition-[color,transform] duration-500 ease-out ${
                      isChipHighlighted
                        ? "scale-105 text-[#8E001C]"
                        : "scale-100 text-[#171717] group-active:scale-90"
                    }`}
                  />
                  <span
                    key={selectedMonth}
                    className={`moku-month-swap whitespace-nowrap text-[calc(11.5*var(--u))] font-bold transition-colors duration-500 ease-out ${
                      isChipHighlighted ? "text-[#8E001C]" : "text-[#171717]"
                    }`}
                  >
                    {selectedMonth}
                  </span>
                  <CaretDown
                    weight="bold"
                    className={`h-[calc(13*var(--u))] w-[calc(13*var(--u))] shrink-0 transition-[transform,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      showMonthPicker
                        ? "rotate-180 text-[#8E001C]"
                        : isMonthJustChanged
                          ? "rotate-0 text-[#8E001C]"
                          : "rotate-0 text-[#171717]"
                    }`}
                  />
                </button>
              </div>

              <MobileCard className="relative mt-[calc(8*var(--u))] overflow-hidden px-[calc(12*var(--u))] py-[calc(12*var(--u))]">
                <ShimmerOverlay active={showPwaShimmer} />
                <div className="grid grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] items-center gap-[calc(10*var(--u))]">
                  <div className="flex items-center justify-center border-r border-[#EAEAEF] pr-[calc(10*var(--u))]">
                    <div
                      className="relative aspect-square w-full max-w-[calc(114*var(--u))] rounded-full"
                      style={{
                        background:
                          "conic-gradient(from -32deg, #F28C0F 0deg 32deg, #8E001C 32deg 270deg, #E2E2E5 270deg 360deg)",
                      }}
                      role="img"
                      aria-label="48 mesin"
                    >
                      <div className="absolute inset-[15%] flex flex-col items-center justify-center rounded-full bg-white">
                        <span className="font-display text-[calc(30*var(--u))] font-extrabold leading-none tracking-[-0.05em] text-[#111111]">
                          48
                        </span>
                        <span className="mt-[2px] text-[calc(12*var(--u))] font-medium text-[#51474E]">
                          Mesin
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 space-y-[calc(10*var(--u))]">
                    {monitoringData.map((item) => (
                      <div
                        key={item.label}
                        className="grid min-w-0 grid-cols-[calc(11*var(--u))_minmax(0,1fr)_auto_auto] items-center gap-[calc(5*var(--u))]"
                      >
                        <span
                          className="h-[calc(11*var(--u))] w-[calc(11*var(--u))] rounded-[3px]"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="min-w-0 truncate text-[calc(12*var(--u))] font-bold tracking-[-0.02em] text-[#171717]">
                          {item.label}
                        </span>
                        <span className="whitespace-nowrap text-[calc(11.5*var(--u))] text-[#51474E]">
                          {item.value} Mesin
                        </span>
                        <span
                          className={`min-w-[calc(36*var(--u))] rounded-full px-[calc(6*var(--u))] py-[calc(2.5*var(--u))] text-center text-[calc(10.5*var(--u))] font-bold ${item.badge}`}
                        >
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </MobileCard>
            </section>

            {/* 2. Kunjungan Bulan Ini */}
            <section className="min-w-0">
              <div className="flex min-w-0 items-center justify-between gap-[calc(8*var(--u))] px-[2px]">
                <SectionTitle>Kunjungan Bulan Ini</SectionTitle>
                <div className="flex shrink-0 items-center gap-[calc(5*var(--u))]">
                  <Target
                    weight="bold"
                    className="h-[calc(15*var(--u))] w-[calc(15*var(--u))] text-[#C81032]"
                  />
                  <span className="whitespace-nowrap text-[calc(12*var(--u))] font-medium text-[#29232A]">
                    Target: 40 Kunjungan
                  </span>
                </div>
              </div>

              <MobileCard className="relative mt-[calc(8*var(--u))] overflow-hidden px-[calc(14*var(--u))] py-[calc(11*var(--u))]">
                <ShimmerOverlay active={showPwaShimmer} />
                <div className="grid grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] items-center gap-[calc(10*var(--u))]">
                  <div className="min-w-0 border-r border-[#EAEAEF] pr-[calc(9*var(--u))]">
                    <p className="font-display text-[calc(42*var(--u))] font-extrabold leading-[0.95] tracking-[-0.05em] text-[#111111]">
                      32
                    </p>
                    <p className="mt-[calc(4*var(--u))] whitespace-nowrap text-[calc(12.5*var(--u))] font-medium text-[#29232A]">
                      Total Kunjungan
                    </p>
                  </div>

                  <div className="grid min-w-0 grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] items-center gap-[4px]">
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-[4px] rounded-full bg-[#DCFCE7] px-[calc(9*var(--u))] py-[calc(3*var(--u))] text-[calc(12.5*var(--u))] font-bold text-[#15803D]">
                        <TrendUp
                          weight="bold"
                          className="h-[calc(13*var(--u))] w-[calc(13*var(--u))]"
                        />{" "}
                        +14%
                      </span>
                      <p className="mt-[calc(4*var(--u))] text-[calc(11.5*var(--u))] leading-[1.3] text-[#3F3A42]">
                        Dibanding bulan lalu
                        <br />
                        (28 kunjungan)
                      </p>
                    </div>

                    <div className="-my-[calc(12*var(--u))] flex h-[calc(94*var(--u))] w-full max-w-[calc(104*var(--u))] items-center justify-center justify-self-end">
                      <img
                        src="/images/moku/illustrations/dashboard-activity.png"
                        alt="Ilustrasi checklist kunjungan"
                        width={240}
                        height={240}
                        draggable={false}
                        className="h-full w-full scale-110 object-contain"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-[calc(5*var(--u))]">
                  <div className="mb-[calc(3*var(--u))] flex items-center justify-between">
                    <p className="text-[calc(12.5*var(--u))] font-bold text-[#171717]">
                      Pencapaian Target
                    </p>
                    <p className="font-display text-[calc(12.5*var(--u))] font-extrabold text-[#111111]">
                      80%
                    </p>
                  </div>
                  <div className="h-[calc(9*var(--u))] overflow-hidden rounded-full bg-[#EAEAEF]">
                    <div
                      className="h-full rounded-full bg-[#8E001C]"
                      style={{ width: "80%" }}
                    />
                  </div>
                </div>
              </MobileCard>
            </section>

            {/* 3. Aksi Cepat */}
            <section className="min-w-0">
              <div className="px-[2px]">
                <SectionTitle>Aksi Cepat</SectionTitle>
              </div>

              <MobileCard className="mt-[calc(8*var(--u))] px-[calc(8*var(--u))] py-[calc(12*var(--u))]">
                <div className="grid grid-cols-4">
                  <QuickAction
                    href="/visits"
                    label={
                      <>
                        Kunjungan
                        <br />
                        Baru
                      </>
                    }
                  >
                    <Plus
                      weight="bold"
                      className="h-[calc(22*var(--u))] w-[calc(22*var(--u))]"
                    />
                  </QuickAction>

                  <QuickAction
                    href="/equipment"
                    separated
                    label={
                      <>
                        Tambah
                        <br />
                        Mesin
                      </>
                    }
                  >
                    <Printer
                      weight="regular"
                      className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                    />
                  </QuickAction>

                  <QuickAction href="/reports" separated label="Laporan">
                    <ChartBar
                      weight="bold"
                      className="h-[calc(21*var(--u))] w-[calc(21*var(--u))]"
                    />
                  </QuickAction>

                  <QuickAction
                    href="/reports/export"
                    separated
                    label={
                      <>
                        Unduh
                        <br />
                        Laporan
                      </>
                    }
                  >
                    <DownloadSimple
                      weight="bold"
                      className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                    />
                  </QuickAction>
                </div>
              </MobileCard>
            </section>

            {/* 4. Mesin Perlu Perhatian */}
            <Link
              to="/monitoring"
              onContextMenu={blockContextMenu}
              draggable={false}
              className="relative flex min-h-[calc(68*var(--u))] min-w-0 select-none items-center gap-[calc(12*var(--u))] overflow-hidden rounded-[calc(17*var(--u))] border border-[#EEEEEE] bg-white px-[calc(16*var(--u))] py-[calc(10*var(--u))] shadow-[0_1px_4px_rgba(41,35,42,0.025)] [-webkit-touch-callout:none] [-webkit-user-select:none] transition-[transform,background-color] duration-150 active:scale-[0.985] active:bg-[#F7F7F9]"
            >
              <ShimmerOverlay active={showPwaShimmer} />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-[calc(5*var(--u))] bg-[#8E001C]"
              />

              <Warning
                weight="bold"
                className="h-[calc(28*var(--u))] w-[calc(28*var(--u))] shrink-0 text-[#F27B13]"
              />

              <div className="min-w-0 flex-1">
                <p className="font-display text-[calc(14*var(--u))] font-bold leading-[1.2] tracking-[-0.02em] text-[#171717]">
                  Mesin Perlu Perhatian
                </p>
                <p className="mt-[calc(3*var(--u))] text-[calc(11.5*var(--u))] leading-[1.35] text-[#5E5863]">
                  4 mesin belum dikunjungi pada {selectedMonth} dan memerlukan
                  tindak lanjut.
                </p>
              </div>

              <CaretRight
                weight="bold"
                className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0 text-[#C81032]"
              />
            </Link>

            {/* 5. Aktivitas Terbaru */}
            <section className="min-w-0">
              <div className="flex min-w-0 items-center justify-between gap-[calc(8*var(--u))] px-[2px]">
                <SectionTitle>Aktivitas Terbaru</SectionTitle>
                <Link
                  to="/visit-history"
                  onContextMenu={blockContextMenu}
                  draggable={false}
                  className="flex shrink-0 select-none items-center gap-0.5 whitespace-nowrap text-[calc(13*var(--u))] font-bold text-[#C81032] [-webkit-touch-callout:none] transition-opacity active:opacity-70"
                >
                  Lihat Semua
                  <CaretRight
                    weight="bold"
                    className="h-[calc(16*var(--u))] w-[calc(16*var(--u))]"
                  />
                </Link>
              </div>

              <MobileCard className="relative mt-[calc(8*var(--u))] divide-y divide-[#EFEFF2] overflow-hidden px-[calc(12*var(--u))]">
                <ShimmerOverlay active={showPwaShimmer} />
                {recentActivities.map((activity, index) => (
                  <div
                    key={`${activity.machine}-${index}`}
                    className="flex min-h-[calc(60*var(--u))] min-w-0 items-center gap-[calc(10*var(--u))] py-[calc(9*var(--u))]"
                  >
                    <div
                      className={`flex h-[calc(38*var(--u))] w-[calc(38*var(--u))] shrink-0 items-center justify-center rounded-full ${
                        activity.status === "success"
                          ? "bg-[#E2F7E9] text-[#1D9A4E]"
                          : "bg-[#F3F3F5] text-[#C81032]"
                      }`}
                    >
                      {activity.status === "success" ? (
                        <Check
                          weight="bold"
                          className="h-[calc(19*var(--u))] w-[calc(19*var(--u))]"
                        />
                      ) : (
                        <Clock
                          weight="bold"
                          className="h-[calc(19*var(--u))] w-[calc(19*var(--u))]"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[calc(13.5*var(--u))] font-bold leading-tight text-[#171717]">
                        {activity.title}
                      </p>
                      <p className="mt-[calc(3*var(--u))] truncate text-[calc(11.5*var(--u))] leading-tight text-[#6E6873]">
                        {activity.machine} • {activity.customer}
                      </p>
                    </div>

                    <span className="shrink-0 whitespace-nowrap text-[calc(11.5*var(--u))] font-semibold text-[#5E5863]">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </MobileCard>
            </section>

            {/* Footer */}
            <div className="pb-[calc(12*var(--u))] pt-[calc(4*var(--u))] text-center">
              <p className="text-[calc(10*var(--u))] text-[#A39AA0]">
                MOKU — Monitoring Operasional Kunjungan Unit
              </p>
              <p className="mt-[calc(4*var(--u))] text-[calc(10*var(--u))] text-[#B3ABB0]">
                Track Precisely, Deliver Quality
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sheet Pilih Periode (Portal ke document.body) */}
      <MonthPickerSheet
        isOpen={showMonthPicker}
        selectedMonth={selectedMonth}
        onSelect={handleSelectMonth}
        onClose={closeMonthPicker}
      />

      <style>{`
        .moku-chip-confirm {
          animation: moku-chip-pop 520ms cubic-bezier(0.22, 1.28, 0.36, 1) both;
        }
        .moku-month-swap {
          animation: moku-month-in 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes moku-chip-pop {
          0% { transform: scale(0.95); }
          45% { transform: scale(1.035); }
          100% { transform: scale(1); }
        }
        @keyframes moku-month-in {
          from {
            opacity: 0;
            transform: translate3d(0, 6px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .moku-chip-confirm,
          .moku-month-swap {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   DASHBOARD PAGE
========================================================= */
export default function DashboardPage() {
  const { isMobile } = useAppLayout();

  return isMobile ? <MobileDashboard /> : <DesktopDashboard />;
}
