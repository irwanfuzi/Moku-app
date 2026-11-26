import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarBlank,
  CaretDown,
  CaretLeft,
  CaretRight,
  Check,
  CheckCircle,
  FileText,
  FloppyDisk,
  GearSix,
  Laptop,
  LockSimple,
  NotePencil,
  Package,
  Printer,
  User,
  WarningCircle,
  Wrench,
  X,
} from "@phosphor-icons/react";
import { useAppLayout } from "@/components/layout/app-shell";
import MokuModalDialog from "@/components/ui/moku-modal-dialog";
import {
  getVisitByNumber,
  saveVisitRecord,
  type VisitTypeCode,
} from "@/lib/visit-store";

/* =========================================================
   DATA & CONSTANTS
========================================================= */

interface VisitTypeOption {
  code: VisitTypeCode;
  title: string;
  description: string;
  icon: "laptop" | "printer" | "package" | "wrench" | "gear";
}

interface UpdatedVisitSummary {
  visitNumber: string;
  visitDate: string;
}

const VISIT_TYPE_OPTIONS: VisitTypeOption[] = [
  {
    code: "IND",
    title: "Instalasi Driver",
    description: "Pemasangan driver mesin.",
    icon: "laptop",
  },
  {
    code: "INS",
    title: "Instalasi Mesin",
    description: "Pemasangan unit mesin baru.",
    icon: "printer",
  },
  {
    code: "DIS",
    title: "Dismantle",
    description: "Pembongkaran dan penarikan unit mesin.",
    icon: "package",
  },
  {
    code: "PMC",
    title: "Preventive Maintenance",
    description: "Perawatan rutin sesuai jadwal.",
    icon: "wrench",
  },
  {
    code: "UMC",
    title: "Unscheduled Maintenance",
    description: "Penanganan gangguan dan perbaikan tidak terjadwal.",
    icon: "gear",
  },
];

const TECHNICIAN_OPTIONS = [
  "Budi Santoso",
  "Andi Setiawan",
  "Reza Pratama",
  "Dimas Anggara",
];

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MAX_TEXT_LENGTH = 500;
const SHEET_TRANSITION_MS = 420;
const SHEET_UNMOUNT_MS = 460;
const SNACKBAR_EXIT_MS = 320;

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

const NO_OUTLINE_STYLE: CSSProperties = {
  outline: "none",
  boxShadow: "none",
};

function toIsoDate(year: number, monthIndex: number, day: number): string {
  const y = String(year);
  const m = String(monthIndex + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getTodayIsoDate(): string {
  const now = new Date();
  return toIsoDate(now.getFullYear(), now.getMonth(), now.getDate());
}

function parseIsoDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (y && m && d) return new Date(y, m - 1, d);
  return new Date();
}

function formatIndonesianDate(isoDate: string): string {
  if (!isoDate) return "";
  const date = parseIsoDate(isoDate);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatMonthYear(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex, 1));
}

function triggerHaptic(duration = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(duration);
  }
}

function VisitTypeIcon({
  kind,
  className,
}: {
  kind: VisitTypeOption["icon"];
  className: string;
}) {
  switch (kind) {
    case "laptop":
      return <Laptop className={className} weight="regular" />;
    case "printer":
      return <Printer className={className} weight="regular" />;
    case "package":
      return <Package className={className} weight="regular" />;
    case "wrench":
      return <Wrench className={className} weight="regular" />;
    case "gear":
    default:
      return <GearSix className={className} weight="regular" />;
  }
}

/* =========================================================
   EDIT SUCCESS ILLUSTRATION (CLIPBOARD + CHECK VECTOR)
========================================================= */

function EditSuccessIllustration() {
  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        viewBox="0 0 180 156"
        fill="none"
        aria-hidden="true"
        className="h-[calc(146*var(--u))] w-[calc(168*var(--u))] overflow-visible"
      >
        <path
          d="M36 92C25 65 40 34 69 27C96 20 112 40 132 56C150 70 156 102 138 122C120 142 86 140 60 128C45 121 41 106 36 92Z"
          fill="#E4F5E8"
          className="moku-edit-blob"
        />

        <g transform="rotate(-7 88 84)" className="moku-edit-board">
          <rect
            x="48"
            y="36"
            width="76"
            height="100"
            rx="14"
            fill="#C9334B"
          />
          <rect
            x="50"
            y="33"
            width="76"
            height="100"
            rx="14"
            fill="#E87C8D"
          />
          <rect
            x="56"
            y="40"
            width="64"
            height="86"
            rx="9"
            fill="#FFFFFF"
          />

          <rect
            x="72"
            y="27"
            width="32"
            height="15"
            rx="5"
            fill="#B82940"
          />
          <circle cx="88" cy="27" r="6" fill="#B82940" />
          <circle cx="88" cy="27" r="2.3" fill="#FFFFFF" />

          <circle cx="66" cy="59" r="2.8" fill="#D5D7DC" />
          <rect x="74" y="56.5" width="34" height="5" rx="2.5" fill="#D5D7DC" />

          <circle cx="66" cy="73" r="2.8" fill="#D5D7DC" />
          <rect x="74" y="70.5" width="30" height="5" rx="2.5" fill="#D5D7DC" />

          <circle cx="66" cy="87" r="2.8" fill="#D5D7DC" />
          <rect x="74" y="84.5" width="20" height="5" rx="2.5" fill="#D5D7DC" />

          <circle cx="66" cy="101" r="2.8" fill="#D5D7DC" />
          <rect x="74" y="98.5" width="14" height="5" rx="2.5" fill="#D5D7DC" />
        </g>

        <g className="moku-edit-badge">
          <circle cx="113" cy="103" r="20" fill="#2CA83A" />
          <path
            d="M104 103.5L110.2 109.5L122.5 96.5"
            stroke="#FFFFFF"
            strokeWidth="4.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="moku-edit-check"
          />
        </g>

        <g className="moku-edit-rays">
          <path
            d="M126 24L129 14"
            stroke="#2CA83A"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M137 31L146 23"
            stroke="#2CA83A"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M142 42L153 39"
            stroke="#2CA83A"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}

/* =========================================================
   BASE ELASTIC BOTTOM SHEET WRAPPER (PORTAL)
========================================================= */

function ElasticBottomSheet({
  isOpen,
  title,
  onClose,
  children,
}: {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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

    const target = e.target as HTMLElement | null;
    if (target?.closest("input, textarea, [data-no-sheet-drag='true']")) {
      return;
    }

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
        // ignore
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

  if (!mounted || typeof document === "undefined") return null;

  const backdropOpacity = visible
    ? Math.max(0.08, 0.45 - Math.max(0, dragY) / 480)
    : 0;

  return createPortal(
    <div
      style={MOBILE_SCALE_VARS}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[9999] flex items-end justify-center select-none [-webkit-touch-callout:none] [-webkit-user-select:none]"
    >
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
        className="relative z-10 -mb-[100px] w-full max-w-[600px] rounded-t-[calc(24*var(--u))] bg-white px-[calc(18*var(--u))] pb-[calc(122px+env(safe-area-inset-bottom))] pt-[calc(10*var(--u))] shadow-[0_-8px_30px_rgba(23,23,23,0.18)]"
      >
        <div className="mx-auto mb-[calc(12*var(--u))] h-[calc(4*var(--u))] w-[calc(40*var(--u))] cursor-grab rounded-full bg-[#DCDCE2] active:cursor-grabbing" />

        <div className="mb-[calc(12*var(--u))] flex items-center justify-between">
          <h3 className="font-display text-[calc(16*var(--u))] font-bold tracking-[-0.02em] text-[#171717]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-[calc(32*var(--u))] w-[calc(32*var(--u))] items-center justify-center rounded-full text-[#5A555F] transition-colors duration-[260ms] active:bg-[#F2F2F5]"
          >
            <X
              weight="bold"
              className="h-[calc(18*var(--u))] w-[calc(18*var(--u))]"
            />
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body
  );
}

/* =========================================================
   CALENDAR BOTTOM SHEET
========================================================= */

function CalendarBottomSheet({
  isOpen,
  selectedDate,
  onSelect,
  onClose,
}: {
  isOpen: boolean;
  selectedDate: string;
  onSelect: (isoDate: string) => void;
  onClose: () => void;
}) {
  const todayIso = getTodayIsoDate();
  const initialDate = parseIsoDate(selectedDate || todayIso);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const closeDelayRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const d = parseIsoDate(selectedDate || todayIso);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [isOpen, selectedDate, todayIso]);

  useEffect(() => {
    return () => {
      if (closeDelayRef.current !== null) {
        window.clearTimeout(closeDelayRef.current);
      }
    };
  }, []);

  const daysGrid = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<{ day: number | null; iso: string }> = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, iso: `empty-${i}` });
    }
    for (let day = 1; day <= totalDays; day++) {
      cells.push({ day, iso: toIsoDate(viewYear, viewMonth, day) });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handlePickDate = (iso: string) => {
    triggerHaptic(8);
    onSelect(iso);
    if (closeDelayRef.current !== null) {
      window.clearTimeout(closeDelayRef.current);
    }
    closeDelayRef.current = window.setTimeout(() => {
      onClose();
      closeDelayRef.current = null;
    }, 150);
  };

  const monthKey = `${viewYear}-${viewMonth}`;

  return (
    <ElasticBottomSheet
      isOpen={isOpen}
      title="Pilih Tanggal Kunjungan"
      onClose={onClose}
    >
      <div className="mb-[calc(12*var(--u))] flex items-center justify-between rounded-[calc(14*var(--u))] bg-[#F7F7F9] px-[calc(8*var(--u))] py-[calc(6*var(--u))]">
        <button
          type="button"
          onClick={handlePrevMonth}
          aria-label="Bulan sebelumnya"
          className="flex h-[calc(34*var(--u))] w-[calc(34*var(--u))] items-center justify-center rounded-full text-[#29232A] transition-colors duration-[260ms] active:bg-white"
        >
          <CaretLeft
            weight="bold"
            className="h-[calc(16*var(--u))] w-[calc(16*var(--u))]"
          />
        </button>

        <span
          key={`label-${monthKey}`}
          className="moku-cal-fade font-display text-[calc(14.5*var(--u))] font-bold text-[#171717]"
        >
          {formatMonthYear(viewYear, viewMonth)}
        </span>

        <button
          type="button"
          onClick={handleNextMonth}
          aria-label="Bulan berikutnya"
          className="flex h-[calc(34*var(--u))] w-[calc(34*var(--u))] items-center justify-center rounded-full text-[#29232A] transition-colors duration-[260ms] active:bg-white"
        >
          <CaretRight
            weight="bold"
            className="h-[calc(16*var(--u))] w-[calc(16*var(--u))]"
          />
        </button>
      </div>

      <div className="mb-[calc(6*var(--u))] grid grid-cols-7 text-center">
        {WEEKDAYS.map((dayName) => (
          <span
            key={dayName}
            className="py-[calc(4*var(--u))] text-[calc(11.5*var(--u))] font-bold text-[#6E6873]"
          >
            {dayName}
          </span>
        ))}
      </div>

      <div
        key={`grid-${monthKey}`}
        className="moku-cal-fade grid grid-cols-7 gap-y-[calc(4*var(--u))] text-center"
      >
        {daysGrid.map((cell) => {
          if (cell.day === null) {
            return <div key={cell.iso} className="h-[calc(38*var(--u))]" />;
          }

          const isSelected = cell.iso === selectedDate;
          const isToday = cell.iso === todayIso;

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => handlePickDate(cell.iso)}
              className={`mx-auto flex h-[calc(38*var(--u))] w-[calc(38*var(--u))] items-center justify-center rounded-full text-[calc(13.5*var(--u))] transition-all duration-[260ms] active:scale-90 ${
                isSelected
                  ? "bg-[#8E001C] font-bold text-white"
                  : isToday
                    ? "bg-[#FCECEF] font-bold text-[#8E001C]"
                    : "font-medium text-[#171717] active:bg-[#F2F2F5]"
              }`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <div className="mt-[calc(14*var(--u))] flex justify-end border-t border-[#EFEFF2] pt-[calc(10*var(--u))]">
        <button
          type="button"
          onClick={() => handlePickDate(todayIso)}
          className="rounded-full bg-[#FCECEF] px-[calc(14*var(--u))] py-[calc(7*var(--u))] text-[calc(12.5*var(--u))] font-bold text-[#8E001C] transition-transform duration-[260ms] active:scale-95"
        >
          Pilih Hari Ini
        </button>
      </div>
    </ElasticBottomSheet>
  );
}

/* =========================================================
   EDIT VISIT PAGE
========================================================= */

export default function EditVisitPage() {
  const { visitNumber } = useParams<{ visitNumber?: string }>();
  const location = useLocation();
  const { isMobile, isReady, backWithTransition, navigateWithTransition } =
    useAppLayout();

  const [existingVisit, setExistingVisit] = useState(() =>
    getVisitByNumber(visitNumber)
  );
  const [visitDate, setVisitDate] = useState(existingVisit.visitDate);
  const [visitType, setVisitType] = useState<VisitTypeCode>(
    existingVisit.visitTypeCode
  );
  const [technicianName, setTechnicianName] = useState(
    existingVisit.technicianName
  );
  const [activityDesc, setActivityDesc] = useState(
    existingVisit.activityDescription
  );
  const [technicianNotes, setTechnicianNotes] = useState(
    existingVisit.technicianNotes
  );

  const [showDateSheet, setShowDateSheet] = useState(false);
  const [showVisitTypeSheet, setShowVisitTypeSheet] = useState(false);
  const [showTechSheet, setShowTechSheet] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isFormExiting, setIsFormExiting] = useState(false);
  const [updatedVisit, setUpdatedVisit] = useState<UpdatedVisitSummary | null>(
    null
  );

  const [snackbar, setSnackbar] = useState<{
    id: number;
    type: "error" | "success";
    title: string;
    description: string;
  } | null>(null);
  const [isSnackbarClosing, setIsSnackbarClosing] = useState(false);

  const mainRef = useRef<HTMLElement | null>(null);
  const selectDelayRef = useRef<number | null>(null);
  const submitTimersRef = useRef<number[]>([]);
  const snackbarAutoRef = useRef<number | null>(null);
  const snackbarExitRef = useRef<number | null>(null);

  const isMobileView = !isReady || isMobile;

  // Reset state & muat ulang data terbaru tiap kali halaman dibuka kembali
  useEffect(() => {
    const fresh = getVisitByNumber(visitNumber);
    setExistingVisit(fresh);
    setVisitDate(fresh.visitDate);
    setVisitType(fresh.visitTypeCode);
    setTechnicianName(fresh.technicianName);
    setActivityDesc(fresh.activityDescription);
    setTechnicianNotes(fresh.technicianNotes);
    setUpdatedVisit(null);
    setShowExitModal(false);
    setIsSaving(false);
    setIsFormExiting(false);
  }, [visitNumber, location.key]);

  const hasUnsavedChanges = useMemo(() => {
    if (updatedVisit) return false;
    return (
      visitDate !== existingVisit.visitDate ||
      visitType !== existingVisit.visitTypeCode ||
      technicianName !== existingVisit.technicianName ||
      activityDesc.trim() !== existingVisit.activityDescription.trim() ||
      technicianNotes.trim() !== existingVisit.technicianNotes.trim()
    );
  }, [
    updatedVisit,
    visitDate,
    visitType,
    technicianName,
    activityDesc,
    technicianNotes,
    existingVisit,
  ]);

  const selectedVisitTypeObj = useMemo(
    () =>
      VISIT_TYPE_OPTIONS.find((item) => item.code === visitType) ??
      VISIT_TYPE_OPTIONS[3],
    [visitType]
  );

  const technicianList = useMemo(() => {
    if (TECHNICIAN_OPTIONS.includes(existingVisit.technicianName)) {
      return TECHNICIAN_OPTIONS;
    }
    return [existingVisit.technicianName, ...TECHNICIAN_OPTIONS];
  }, [existingVisit.technicianName]);

  const dismissSnackbar = useCallback(() => {
    if (snackbarAutoRef.current !== null) {
      window.clearTimeout(snackbarAutoRef.current);
      snackbarAutoRef.current = null;
    }
    setIsSnackbarClosing(true);
    if (snackbarExitRef.current !== null) {
      window.clearTimeout(snackbarExitRef.current);
    }
    snackbarExitRef.current = window.setTimeout(() => {
      setSnackbar(null);
      setIsSnackbarClosing(false);
      snackbarExitRef.current = null;
    }, SNACKBAR_EXIT_MS);
  }, []);

  const triggerSnackbar = useCallback(
    (type: "error" | "success", title: string, description: string) => {
      if (snackbarAutoRef.current !== null) {
        window.clearTimeout(snackbarAutoRef.current);
      }
      if (snackbarExitRef.current !== null) {
        window.clearTimeout(snackbarExitRef.current);
      }
      setIsSnackbarClosing(false);
      setSnackbar({ id: Date.now(), type, title, description });
      snackbarAutoRef.current = window.setTimeout(() => {
        dismissSnackbar();
      }, 3600);
    },
    [dismissSnackbar]
  );

  useEffect(() => {
    if (!isMobileView) return;
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((meta) => meta.setAttribute("content", "#83051C"));
  }, [isMobileView]);

  useEffect(() => {
    return () => {
      if (selectDelayRef.current !== null) {
        window.clearTimeout(selectDelayRef.current);
      }
      submitTimersRef.current.forEach((id) => window.clearTimeout(id));
      submitTimersRef.current = [];
      if (snackbarAutoRef.current !== null) {
        window.clearTimeout(snackbarAutoRef.current);
      }
      if (snackbarExitRef.current !== null) {
        window.clearTimeout(snackbarExitRef.current);
      }
    };
  }, []);

  const scrollToTopSmooth = useCallback(() => {
    const ionContent = mainRef.current?.closest("ion-content") as
      | (HTMLElement & { scrollToTop?: (duration?: number) => Promise<void> })
      | null;
    if (ionContent?.scrollToTop) {
      ionContent.scrollToTop(0).catch(() => {});
    } else {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, []);

  const handleBackToDetail = useCallback(() => {
    backWithTransition(
      `/visits/detail/${encodeURIComponent(existingVisit.visitNumber)}`
    );
  }, [backWithTransition, existingVisit.visitNumber]);

  const handleBackToDashboard = useCallback(() => {
    triggerHaptic(6);
    navigateWithTransition("/", "back");
  }, [navigateWithTransition]);

  const handleRequestCancel = useCallback(() => {
    if (isSaving) return;
    if (updatedVisit) {
      handleBackToDashboard();
      return;
    }
    if (hasUnsavedChanges) {
      triggerHaptic(10);
      setShowExitModal(true);
      return;
    }
    triggerHaptic(6);
    handleBackToDetail();
  }, [
    isSaving,
    updatedVisit,
    hasUnsavedChanges,
    handleBackToDashboard,
    handleBackToDetail,
  ]);

  const handleConfirmExit = useCallback(() => {
    setShowExitModal(false);
    handleBackToDetail();
  }, [handleBackToDetail]);

  const handleChooseVisitType = (code: VisitTypeCode) => {
    triggerHaptic(8);
    setVisitType(code);
    if (selectDelayRef.current !== null) {
      window.clearTimeout(selectDelayRef.current);
    }
    selectDelayRef.current = window.setTimeout(() => {
      setShowVisitTypeSheet(false);
      selectDelayRef.current = null;
    }, 150);
  };

  const handleChooseTechnician = (name: string) => {
    triggerHaptic(8);
    setTechnicianName(name);
    if (selectDelayRef.current !== null) {
      window.clearTimeout(selectDelayRef.current);
    }
    selectDelayRef.current = window.setTimeout(() => {
      setShowTechSheet(false);
      selectDelayRef.current = null;
    }, 150);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;

    if (!visitDate || !visitType || !technicianName || !activityDesc.trim()) {
      triggerHaptic(16);
      triggerSnackbar(
        "error",
        "Data Belum Lengkap",
        "Pastikan tanggal, jenis, teknisi, dan deskripsi aktivitas terisi."
      );
      return;
    }

    if (snackbar) dismissSnackbar();
    triggerHaptic(10);
    setIsSaving(true);

    const t1 = window.setTimeout(() => {
      setIsFormExiting(true);
    }, 520);

    const t2 = window.setTimeout(() => {
      saveVisitRecord({
        ...existingVisit,
        visitDate,
        visitTypeCode: visitType,
        technicianName,
        activityDescription: activityDesc.trim(),
        technicianNotes: technicianNotes.trim(),
      });

      scrollToTopSmooth();
      setUpdatedVisit({
        visitNumber: existingVisit.visitNumber,
        visitDate,
      });
      setIsSaving(false);
      setIsFormExiting(false);
      triggerHaptic(14);
    }, 840);

    submitTimersRef.current.push(t1, t2);
  };

  return (
    <main
      ref={mainRef}
      style={MOBILE_SCALE_VARS}
      className={`min-h-dvh w-full min-w-0 overflow-x-clip pb-[calc(104*var(--u)+env(safe-area-inset-bottom))] ${
        updatedVisit ? "bg-white" : "bg-[#FAFAFC]"
      }`}
    >
      {/* Header Marun */}
      <header className="sticky top-0 z-40 w-full bg-[#83051C] text-white">
        <div className="mx-auto flex w-full max-w-[680px] items-center gap-[calc(10*var(--u))] px-[calc(14*var(--u))] pb-[calc(14*var(--u))] pt-[calc(env(safe-area-inset-top)+calc(11*var(--u)))]">
          <button
            type="button"
            onClick={handleRequestCancel}
            aria-label="Kembali"
            className="flex h-[calc(34*var(--u))] w-[calc(34*var(--u))] shrink-0 items-center justify-center rounded-full text-white transition-colors duration-[260ms] active:bg-white/15"
          >
            <ArrowLeft
              className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
              weight="bold"
            />
          </button>

          <h1 className="truncate font-display text-[calc(17.5*var(--u))] font-bold leading-tight tracking-[-0.02em] text-white">
            Ubah Kunjungan
          </h1>
        </div>
      </header>

      {/* Success Page State */}
      {updatedVisit ? (
        <section className="mx-auto flex min-h-[calc(100dvh-calc(140*var(--u)))] w-full max-w-[680px] flex-col items-center justify-center px-[calc(20*var(--u))] py-[calc(24*var(--u))] text-center">
          <EditSuccessIllustration />

          <h2 className="moku-success-step-1 mt-[calc(18*var(--u))] font-display text-[calc(20*var(--u))] font-bold leading-tight tracking-[-0.02em] text-[#171717]">
            Perubahan Berhasil Disimpan
          </h2>

          <p className="moku-success-step-2 mt-[calc(9*var(--u))] max-w-[calc(270*var(--u))] text-[calc(13.5*var(--u))] font-normal leading-[1.5] text-[#6E6873]">
            Data kunjungan telah diperbarui.
          </p>

          {/* Kartu Ringkasan Kunjungan */}
          <div className="moku-success-step-3 mt-[calc(24*var(--u))] w-full divide-y divide-[#F0E4E7] rounded-[calc(16*var(--u))] bg-[#FDF7F8] px-[calc(16*var(--u))] text-left">
            <div className="flex items-center gap-[calc(14*var(--u))] py-[calc(14*var(--u))]">
              <CalendarBlank
                weight="regular"
                className="h-[calc(22*var(--u))] w-[calc(22*var(--u))] shrink-0 text-[#8E001C]"
              />
              <span
                aria-hidden="true"
                className="h-[calc(28*var(--u))] w-px shrink-0 bg-[#E8D8DC]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[calc(11.5*var(--u))] font-normal text-[#6E6873]">
                  Nomor Kunjungan
                </p>
                <p className="mt-[calc(2*var(--u))] truncate font-display text-[calc(15*var(--u))] font-bold tracking-[-0.01em] text-[#171717]">
                  {updatedVisit.visitNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-[calc(14*var(--u))] py-[calc(14*var(--u))]">
              <CalendarBlank
                weight="regular"
                className="h-[calc(22*var(--u))] w-[calc(22*var(--u))] shrink-0 text-[#8E001C]"
              />
              <span
                aria-hidden="true"
                className="h-[calc(28*var(--u))] w-px shrink-0 bg-[#E8D8DC]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[calc(11.5*var(--u))] font-normal text-[#6E6873]">
                  Tanggal Kunjungan
                </p>
                <p className="mt-[calc(2*var(--u))] truncate font-display text-[calc(15*var(--u))] font-bold tracking-[-0.01em] text-[#171717]">
                  {formatIndonesianDate(updatedVisit.visitDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="moku-success-step-4 mt-[calc(24*var(--u))] flex w-full flex-col gap-[calc(12*var(--u))]">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(8);
                navigateWithTransition(
                  `/visits/detail/${encodeURIComponent(updatedVisit.visitNumber)}`,
                  "back"
                );
              }}
              style={{ color: "#FFFFFF" }}
              className="flex min-h-[calc(48*var(--u))] w-full items-center justify-center gap-[calc(8*var(--u))] rounded-[calc(13*var(--u))] bg-[#8E001C] px-[calc(18*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(14.5*var(--u))] font-semibold tracking-[-0.01em] text-white transition-[transform,background-color] duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.985] active:bg-[#730217]"
            >
              <FloppyDisk
                weight="regular"
                className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0"
              />
              Lihat Detail Kunjungan
            </button>

            <button
              type="button"
              onClick={handleBackToDashboard}
              className="flex min-h-[calc(48*var(--u))] w-full items-center justify-center gap-[calc(8*var(--u))] rounded-[calc(13*var(--u))] border border-[#8E001C] bg-white px-[calc(18*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(14.5*var(--u))] font-semibold tracking-[-0.01em] text-[#8E001C] transition-[transform,background-color] duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.985] active:bg-[#FDF2F4]"
            >
              <ArrowLeft
                weight="bold"
                className="h-[calc(17*var(--u))] w-[calc(17*var(--u))] shrink-0"
              />
              Kembali ke Dashboard
            </button>
          </div>
        </section>
      ) : (
        /* Form Body */
        <form
          onSubmit={handleSubmit}
          noValidate
          className={`moku-edit-enter mx-auto w-full max-w-[680px] space-y-[calc(14*var(--u))] px-[calc(14*var(--u))] pt-[calc(14*var(--u))] transition-[opacity,transform] duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isFormExiting
              ? "pointer-events-none -translate-y-[10px] scale-[0.99] opacity-0"
              : "translate-y-0 scale-100 opacity-100"
          }`}
        >
          {/* 1. Card Informasi Kunjungan */}
          <section className="space-y-[calc(13*var(--u))] rounded-[calc(18*var(--u))] border border-[#EEEEEE] bg-white p-[calc(15*var(--u))]">
            <div className="flex items-center gap-[calc(9*var(--u))]">
              <CalendarBlank
                weight="regular"
                className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#8E001C]"
              />
              <h2 className="font-display text-[calc(15*var(--u))] font-bold tracking-[-0.015em] text-[#171717]">
                Informasi Kunjungan
              </h2>
            </div>

            {/* Tanggal Kunjungan * */}
            <div>
              <label className="mb-[calc(6*var(--u))] block text-[calc(12.5*var(--u))] font-medium text-[#4A454F]">
                Tanggal Kunjungan <span className="text-[#DC0E2E]">*</span>
              </label>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  triggerHaptic(6);
                  setShowDateSheet(true);
                }}
                className={`flex min-h-[calc(44*var(--u))] w-full items-center justify-between gap-[calc(10*var(--u))] rounded-[calc(12*var(--u))] border bg-white px-[calc(12*var(--u))] text-left transition-colors duration-[260ms] active:bg-[#FAFAFC] ${
                  showDateSheet
                    ? "border-[#8E001C] ring-2 ring-[#8E001C]/10"
                    : "border-[#E0E0E6]"
                }`}
              >
                <span className="flex min-w-0 flex-1 items-center gap-[calc(10*var(--u))]">
                  <CalendarBlank
                    weight="regular"
                    className="h-[calc(18*var(--u))] w-[calc(18*var(--u))] shrink-0 text-[#5A555F]"
                  />
                  <span className="truncate text-[calc(13.5*var(--u))] font-semibold text-[#171717]">
                    {formatIndonesianDate(visitDate)}
                  </span>
                </span>
                <CaretDown
                  weight="bold"
                  className={`h-[calc(14*var(--u))] w-[calc(14*var(--u))] shrink-0 text-[#5A555F] transition-transform duration-300 ${
                    showDateSheet ? "rotate-180 text-[#8E001C]" : "rotate-0"
                  }`}
                />
              </button>
            </div>

            {/* Jenis Kunjungan * */}
            <div>
              <label className="mb-[calc(6*var(--u))] block text-[calc(12.5*var(--u))] font-medium text-[#4A454F]">
                Jenis Kunjungan <span className="text-[#DC0E2E]">*</span>
              </label>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  triggerHaptic(6);
                  setShowVisitTypeSheet(true);
                }}
                className={`flex min-h-[calc(44*var(--u))] w-full items-center justify-between gap-[calc(10*var(--u))] rounded-[calc(12*var(--u))] border bg-white px-[calc(12*var(--u))] text-left transition-colors duration-[260ms] active:bg-[#FAFAFC] ${
                  showVisitTypeSheet
                    ? "border-[#8E001C] ring-2 ring-[#8E001C]/10"
                    : "border-[#E0E0E6]"
                }`}
              >
                <span className="flex min-w-0 flex-1 items-center gap-[calc(10*var(--u))]">
                  <VisitTypeIcon
                    kind={selectedVisitTypeObj.icon}
                    className="h-[calc(18*var(--u))] w-[calc(18*var(--u))] shrink-0 text-[#5A555F]"
                  />
                  <span className="truncate text-[calc(13.5*var(--u))] font-semibold text-[#171717]">
                    {selectedVisitTypeObj.title} ({selectedVisitTypeObj.code})
                  </span>
                </span>
                <CaretDown
                  weight="bold"
                  className={`h-[calc(14*var(--u))] w-[calc(14*var(--u))] shrink-0 text-[#5A555F] transition-transform duration-300 ${
                    showVisitTypeSheet ? "rotate-180 text-[#8E001C]" : "rotate-0"
                  }`}
                />
              </button>
            </div>

            {/* Teknisi * */}
            <div>
              <label className="mb-[calc(6*var(--u))] block text-[calc(12.5*var(--u))] font-medium text-[#4A454F]">
                Teknisi <span className="text-[#DC0E2E]">*</span>
              </label>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  triggerHaptic(6);
                  setShowTechSheet(true);
                }}
                className={`flex min-h-[calc(44*var(--u))] w-full items-center justify-between gap-[calc(10*var(--u))] rounded-[calc(12*var(--u))] border bg-white px-[calc(12*var(--u))] text-left transition-colors duration-[260ms] active:bg-[#FAFAFC] ${
                  showTechSheet
                    ? "border-[#8E001C] ring-2 ring-[#8E001C]/10"
                    : "border-[#E0E0E6]"
                }`}
              >
                <span className="flex min-w-0 flex-1 items-center gap-[calc(10*var(--u))]">
                  <User
                    weight="regular"
                    className="h-[calc(18*var(--u))] w-[calc(18*var(--u))] shrink-0 text-[#5A555F]"
                  />
                  <span className="truncate text-[calc(13.5*var(--u))] font-semibold text-[#171717]">
                    {technicianName}
                  </span>
                </span>
                <CaretDown
                  weight="bold"
                  className={`h-[calc(14*var(--u))] w-[calc(14*var(--u))] shrink-0 text-[#5A555F] transition-transform duration-300 ${
                    showTechSheet ? "rotate-180 text-[#8E001C]" : "rotate-0"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* 2. Card Informasi Mesin (Read-only / Terkunci) */}
          <section className="space-y-[calc(10*var(--u))] rounded-[calc(18*var(--u))] border border-[#EEEEEE] bg-white p-[calc(15*var(--u))]">
            <div className="flex items-center gap-[calc(9*var(--u))]">
              <Printer
                weight="regular"
                className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#8E001C]"
              />
              <h2 className="font-display text-[calc(15*var(--u))] font-bold tracking-[-0.015em] text-[#171717]">
                Informasi Mesin
              </h2>
            </div>

            <div className="flex items-center justify-between gap-[calc(10*var(--u))] rounded-[calc(12*var(--u))] bg-[#F1F1F5] px-[calc(13*var(--u))] py-[calc(10*var(--u))]">
              <div className="min-w-0 flex-1">
                <p className="text-[calc(11*var(--u))] font-normal text-[#6E6873]">
                  Nomor Mesin
                </p>
                <p className="mt-[calc(1.5*var(--u))] truncate font-display text-[calc(14*var(--u))] font-semibold text-[#4A454F]">
                  {existingVisit.machineCode}
                </p>
              </div>
              <LockSimple
                weight="regular"
                className="h-[calc(18*var(--u))] w-[calc(18*var(--u))] shrink-0 text-[#8E8994]"
              />
            </div>

            <div className="flex items-center justify-between gap-[calc(10*var(--u))] rounded-[calc(12*var(--u))] bg-[#F1F1F5] px-[calc(13*var(--u))] py-[calc(10*var(--u))]">
              <div className="min-w-0 flex-1">
                <p className="text-[calc(11*var(--u))] font-normal text-[#6E6873]">
                  Model Mesin
                </p>
                <p className="mt-[calc(1.5*var(--u))] truncate font-display text-[calc(14*var(--u))] font-semibold text-[#4A454F]">
                  {existingVisit.machineModel}
                </p>
              </div>
              <LockSimple
                weight="regular"
                className="h-[calc(18*var(--u))] w-[calc(18*var(--u))] shrink-0 text-[#8E8994]"
              />
            </div>
          </section>

          {/* 3. Card Deskripsi Aktivitas (Paragraf Biasa) */}
          <section className="space-y-[calc(10*var(--u))] rounded-[calc(18*var(--u))] border border-[#EEEEEE] bg-white p-[calc(15*var(--u))]">
            <div className="flex items-center gap-[calc(9*var(--u))]">
              <FileText
                weight="regular"
                className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#8E001C]"
              />
              <h2 className="font-display text-[calc(15*var(--u))] font-bold tracking-[-0.015em] text-[#171717]">
                Deskripsi Aktivitas <span className="text-[#DC0E2E]">*</span>
              </h2>
            </div>

            <div>
              <div className="rounded-[calc(12*var(--u))] border border-[#E0E0E6] bg-white px-[calc(12*var(--u))] py-[calc(10*var(--u))] transition-colors duration-[260ms] focus-within:border-[#8E001C] focus-within:ring-2 focus-within:ring-[#8E001C]/10">
                <textarea
                  rows={4}
                  disabled={isSaving}
                  maxLength={MAX_TEXT_LENGTH}
                  value={activityDesc}
                  onChange={(e) => {
                    setActivityDesc(e.target.value);
                    if (snackbar?.type === "error") dismissSnackbar();
                  }}
                  placeholder="Jelaskan aktivitas yang dilakukan pada kunjungan ini..."
                  style={NO_OUTLINE_STYLE}
                  className="w-full resize-none border-0 bg-transparent text-[calc(13*var(--u))] font-normal leading-[1.48] text-[#29232A] outline-none placeholder:text-[#8E8994] focus:outline-none focus:ring-0"
                />
              </div>

              <p className="mt-[calc(5*var(--u))] text-right text-[calc(11.5*var(--u))] font-medium tabular-nums text-[#6E6873]">
                {activityDesc.length} / {MAX_TEXT_LENGTH}
              </p>
            </div>
          </section>

          {/* 4. Card Tindakan / Catatan Teknisi */}
          <section className="space-y-[calc(10*var(--u))] rounded-[calc(18*var(--u))] border border-[#EEEEEE] bg-white p-[calc(15*var(--u))]">
            <div className="flex items-center gap-[calc(9*var(--u))]">
              <NotePencil
                weight="regular"
                className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#8E001C]"
              />
              <h2 className="font-display text-[calc(15*var(--u))] font-bold tracking-[-0.015em] text-[#171717]">
                Tindakan / Catatan Teknisi
              </h2>
            </div>

            <div>
              <div className="rounded-[calc(12*var(--u))] border border-[#E0E0E6] bg-white px-[calc(12*var(--u))] py-[calc(10*var(--u))] transition-colors duration-[260ms] focus-within:border-[#8E001C] focus-within:ring-2 focus-within:ring-[#8E001C]/10">
                <textarea
                  rows={4}
                  disabled={isSaving}
                  maxLength={MAX_TEXT_LENGTH}
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  placeholder="Tambahkan tindakan atau catatan teknisi..."
                  style={NO_OUTLINE_STYLE}
                  className="w-full resize-none border-0 bg-transparent text-[calc(13*var(--u))] font-normal leading-[1.48] text-[#29232A] outline-none placeholder:text-[#8E8994] focus:outline-none focus:ring-0"
                />
              </div>

              <p className="mt-[calc(5*var(--u))] text-right text-[calc(11.5*var(--u))] font-medium tabular-nums text-[#6E6873]">
                {technicianNotes.length} / {MAX_TEXT_LENGTH}
              </p>
            </div>
          </section>

          {/* 5. Tombol Aksi Bawah (2 Kolom, Flat) */}
          <section className="grid grid-cols-2 gap-[calc(10*var(--u))] pt-[calc(4*var(--u))]">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleRequestCancel}
              className="flex min-h-[calc(46*var(--u))] items-center justify-center rounded-[calc(13*var(--u))] border border-[#8E001C] bg-white px-[calc(12*var(--u))] py-[calc(10*var(--u))] font-display text-[calc(13.5*var(--u))] font-semibold text-[#8E001C] transition-[transform,background-color] duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] active:bg-[#FDF2F4] disabled:opacity-60"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSaving}
              style={{ color: "#FFFFFF" }}
              className="flex min-h-[calc(46*var(--u))] items-center justify-center gap-[calc(7*var(--u))] rounded-[calc(13*var(--u))] bg-[#8E001C] px-[calc(12*var(--u))] py-[calc(10*var(--u))] font-display text-[calc(13.5*var(--u))] font-semibold text-white transition-[transform,background-color,opacity] duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] active:bg-[#730217] disabled:opacity-80"
            >
              {isSaving ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-[calc(15*var(--u))] w-[calc(15*var(--u))] animate-spin rounded-full border-[2px] border-white/30 border-t-white"
                  />
                  Menyimpan...
                </>
              ) : (
                <>
                  <FloppyDisk
                    weight="regular"
                    className="h-[calc(17*var(--u))] w-[calc(17*var(--u))] shrink-0"
                  />
                  <span className="truncate">Simpan Perubahan</span>
                </>
              )}
            </button>
          </section>
        </form>
      )}

      {/* Modal Konfirmasi Batal / Keluar */}
      <MokuModalDialog
        isOpen={showExitModal}
        title="Buang Perubahan?"
        description="Perubahan yang sudah kamu buat belum disimpan dan akan hilang jika keluar sekarang."
        confirmLabel="Ya, Buang"
        cancelLabel="Lanjut Ubah"
        tone="danger"
        onConfirm={handleConfirmExit}
        onCancel={() => setShowExitModal(false)}
      />

      {/* Bottom Sheet Kalender */}
      <CalendarBottomSheet
        isOpen={showDateSheet}
        selectedDate={visitDate}
        onSelect={(iso) => setVisitDate(iso)}
        onClose={() => setShowDateSheet(false)}
      />

      {/* Bottom Sheet Jenis Kunjungan */}
      <ElasticBottomSheet
        isOpen={showVisitTypeSheet}
        title="Pilih Jenis Kunjungan"
        onClose={() => setShowVisitTypeSheet(false)}
      >
        <div className="max-h-[54dvh] divide-y divide-[#EFEFF2] overflow-y-auto">
          {VISIT_TYPE_OPTIONS.map((option) => {
            const isActive = visitType === option.code;
            return (
              <button
                key={option.code}
                type="button"
                onClick={() => handleChooseVisitType(option.code)}
                className={`flex w-full items-center justify-between gap-[calc(12*var(--u))] rounded-[calc(12*var(--u))] px-[calc(8*var(--u))] py-[calc(11*var(--u))] text-left transition-colors duration-[260ms] ${
                  isActive ? "bg-[#FCECEF]/70" : "bg-white active:bg-[#F7F7F9]"
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-[calc(12*var(--u))]">
                  <span className="flex h-[calc(40*var(--u))] w-[calc(40*var(--u))] shrink-0 items-center justify-center rounded-[calc(11*var(--u))] bg-[#FCECEF] text-[#171717]">
                    <VisitTypeIcon
                      kind={option.icon}
                      className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate font-display text-[calc(14*var(--u))] font-bold leading-tight ${
                        isActive ? "text-[#8E001C]" : "text-[#171717]"
                      }`}
                    >
                      {option.title} ({option.code})
                    </p>
                    <p className="mt-[calc(2*var(--u))] text-[calc(12*var(--u))] font-normal leading-[1.35] text-[#6E6873]">
                      {option.description}
                    </p>
                  </div>
                </div>

                {isActive && (
                  <Check
                    weight="bold"
                    className="h-[calc(18*var(--u))] w-[calc(18*var(--u))] shrink-0 text-[#8E001C]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </ElasticBottomSheet>

      {/* Bottom Sheet Pilih Teknisi */}
      <ElasticBottomSheet
        isOpen={showTechSheet}
        title="Pilih Teknisi"
        onClose={() => setShowTechSheet(false)}
      >
        <div className="max-h-[48dvh] divide-y divide-[#EFEFF2] overflow-y-auto">
          {technicianList.map((name) => {
            const isActive = technicianName === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => handleChooseTechnician(name)}
                className={`flex w-full items-center justify-between gap-[calc(12*var(--u))] rounded-[calc(12*var(--u))] px-[calc(12*var(--u))] py-[calc(12*var(--u))] text-left transition-colors duration-[260ms] ${
                  isActive ? "bg-[#FCECEF]" : "bg-white active:bg-[#F7F7F9]"
                }`}
              >
                <span className="flex min-w-0 flex-1 items-center gap-[calc(10*var(--u))]">
                  <User
                    weight="regular"
                    className={`h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0 ${
                      isActive ? "text-[#8E001C]" : "text-[#5A555F]"
                    }`}
                  />
                  <span
                    className={`truncate text-[calc(14*var(--u))] ${
                      isActive
                        ? "font-bold text-[#8E001C]"
                        : "font-medium text-[#171717]"
                    }`}
                  >
                    {name}
                  </span>
                </span>

                {isActive && (
                  <Check
                    weight="bold"
                    className="h-[calc(18*var(--u))] w-[calc(18*var(--u))] shrink-0 text-[#8E001C]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </ElasticBottomSheet>

      {/* Snackbar Feedback */}
      {snackbar &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            key={snackbar.id}
            style={MOBILE_SCALE_VARS}
            role={snackbar.type === "error" ? "alert" : "status"}
            aria-live="assertive"
            className={`fixed bottom-[calc(78px+env(safe-area-inset-bottom))] left-4 right-4 z-[9998] mx-auto flex max-w-[600px] items-center justify-between gap-[calc(10*var(--u))] overflow-hidden rounded-[calc(12*var(--u))] bg-[#22252A] py-[calc(10*var(--u))] pl-[calc(14*var(--u))] pr-[calc(10*var(--u))] text-white shadow-[0_8px_22px_rgba(0,0,0,0.26)] ${
              isSnackbarClosing
                ? "moku-snack-exit pointer-events-none"
                : "moku-snack-enter"
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute inset-y-0 left-0 w-[calc(4*var(--u))] ${
                snackbar.type === "error" ? "bg-[#DC0E2E]" : "bg-[#22C55E]"
              }`}
            />

            <div className="flex min-w-0 flex-1 items-center gap-[calc(10*var(--u))]">
              {snackbar.type === "error" ? (
                <WarningCircle
                  weight="regular"
                  className="h-[calc(22*var(--u))] w-[calc(22*var(--u))] shrink-0 text-[#DC0E2E]"
                />
              ) : (
                <CheckCircle
                  weight="fill"
                  className="h-[calc(22*var(--u))] w-[calc(22*var(--u))] shrink-0 text-[#22C55E]"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-display text-[calc(13*var(--u))] font-bold leading-tight text-white">
                  {snackbar.title}
                </p>
                <p className="mt-[calc(1.5*var(--u))] truncate text-[calc(11.5*var(--u))] font-normal leading-tight text-[#B8BCC4]">
                  {snackbar.description}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={dismissSnackbar}
              aria-label="Tutup"
              className="flex h-[calc(26*var(--u))] w-[calc(26*var(--u))] shrink-0 items-center justify-center rounded-full text-white/80 transition-colors duration-[260ms] active:bg-white/10"
            >
              <X
                weight="bold"
                className="h-[calc(14*var(--u))] w-[calc(14*var(--u))]"
              />
            </button>
          </div>,
          document.body
        )}

      <style>{`
        .moku-edit-enter {
          animation: moku-edit-in 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .moku-cal-fade {
          animation: moku-cal-in 300ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .moku-snack-enter {
          animation: moku-snack-up 380ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .moku-snack-exit {
          animation: moku-snack-down 320ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
        .moku-edit-blob {
          transform-origin: 90px 84px;
          animation: moku-blob-in 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .moku-edit-board {
          transform-origin: 88px 84px;
          animation: moku-board-in 680ms cubic-bezier(0.16, 1, 0.3, 1) 70ms both;
        }
        .moku-edit-badge {
          transform-origin: 113px 103px;
          animation: moku-badge-in 540ms cubic-bezier(0.22, 1.25, 0.36, 1) 240ms both;
        }
        .moku-edit-check {
          stroke-dasharray: 32;
          stroke-dashoffset: 32;
          animation: moku-check-draw 460ms cubic-bezier(0.22, 1, 0.36, 1) 420ms forwards;
        }
        .moku-edit-rays {
          transform-origin: 130px 34px;
          animation: moku-rays-in 480ms cubic-bezier(0.16, 1, 0.3, 1) 540ms both;
        }
        .moku-success-step-1 {
          animation: moku-fade-up 620ms cubic-bezier(0.16, 1, 0.3, 1) 220ms both;
        }
        .moku-success-step-2 {
          animation: moku-fade-up 620ms cubic-bezier(0.16, 1, 0.3, 1) 310ms both;
        }
        .moku-success-step-3 {
          animation: moku-fade-up 640ms cubic-bezier(0.16, 1, 0.3, 1) 400ms both;
        }
        .moku-success-step-4 {
          animation: moku-fade-up 640ms cubic-bezier(0.16, 1, 0.3, 1) 500ms both;
        }
        @keyframes moku-edit-in {
          from {
            opacity: 0;
            transform: translate3d(0, 10px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes moku-cal-in {
          from {
            opacity: 0;
            transform: translate3d(0, 5px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes moku-snack-up {
          from {
            opacity: 0;
            transform: translate3d(0, 16px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes moku-snack-down {
          from {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
          to {
            opacity: 0;
            transform: translate3d(0, 16px, 0);
          }
        }
        @keyframes moku-blob-in {
          from {
            opacity: 0;
            transform: scale(0.75);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes moku-board-in {
          from {
            opacity: 0;
            transform: translate3d(0, 14px, 0) scale(0.92) rotate(-7deg);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1) rotate(-7deg);
          }
        }
        @keyframes moku-badge-in {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          70% {
            opacity: 1;
            transform: scale(1.08);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes moku-check-draw {
          from {
            stroke-dashoffset: 32;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes moku-rays-in {
          from {
            opacity: 0;
            transform: scale(0.65) translate3d(-4px, 4px, 0);
          }
          to {
            opacity: 1;
            transform: scale(1) translate3d(0, 0, 0);
          }
        }
        @keyframes moku-fade-up {
          from {
            opacity: 0;
            transform: translate3d(0, 12px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .moku-edit-enter,
          .moku-cal-fade,
          .moku-snack-enter,
          .moku-snack-exit,
          .moku-edit-blob,
          .moku-edit-board,
          .moku-edit-badge,
          .moku-edit-check,
          .moku-edit-rays,
          .moku-success-step-1,
          .moku-success-step-2,
          .moku-success-step-3,
          .moku-success-step-4 {
            animation: none;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </main>
  );
          }
