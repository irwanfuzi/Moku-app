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
import { useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Buildings,
  CalendarBlank,
  CaretDown,
  CaretLeft,
  CaretRight,
  ChatText,
  Check,
  CheckCircle,
  FileText,
  GearSix,
  Laptop,
  MagnifyingGlass,
  Package,
  Printer,
  SquaresFour,
  Stack,
  User,
  WarningCircle,
  Wrench,
  X,
} from "@phosphor-icons/react";
import { useAppLayout } from "@/components/layout/app-shell";

/* =========================================================
   DATA & CONSTANTS
========================================================= */

interface MachineOption {
  code: string;
  model: string;
  customer: string;
}

interface VisitTypeOption {
  code: string;
  title: string;
  description: string;
  icon: "laptop" | "printer" | "package" | "wrench" | "gear";
}

const MACHINE_OPTIONS: MachineOption[] = [
  { code: "MK-001", model: "iR-ADV DX C3826i", customer: "PT. Sinar Mandiri" },
  { code: "MK-002", model: "imageRUNNER 2625i", customer: "CV. Sukses Abadi" },
  { code: "MK-003", model: "iR-ADV 4745i", customer: "PT. Prima Solusi" },
  { code: "MK-004", model: "iR-ADV C5535i", customer: "PT. Citra Jaya" },
  { code: "MK-007", model: "iR-ADV C5550i", customer: "PT. Maju Bersama" },
];

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

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MAX_TEXT_LENGTH = 500;
const SHEET_TRANSITION_MS = 420;
const SHEET_UNMOUNT_MS = 460;

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

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
            className="flex h-[calc(32*var(--u))] w-[calc(32*var(--u))] items-center justify-center rounded-full text-[#5A555F] transition-colors duration-200 active:bg-[#F2F2F5]"
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

  return (
    <ElasticBottomSheet
      isOpen={isOpen}
      title="Pilih Tanggal Kunjungan"
      onClose={onClose}
    >
      {/* Navigasi Bulan & Tahun */}
      <div className="mb-[calc(12*var(--u))] flex items-center justify-between rounded-[calc(14*var(--u))] bg-[#F7F7F9] px-[calc(8*var(--u))] py-[calc(6*var(--u))]">
        <button
          type="button"
          onClick={handlePrevMonth}
          aria-label="Bulan sebelumnya"
          className="flex h-[calc(34*var(--u))] w-[calc(34*var(--u))] items-center justify-center rounded-full text-[#29232A] transition-colors active:bg-white"
        >
          <CaretLeft
            weight="bold"
            className="h-[calc(16*var(--u))] w-[calc(16*var(--u))]"
          />
        </button>

        <span className="font-display text-[calc(14.5*var(--u))] font-bold text-[#171717]">
          {formatMonthYear(viewYear, viewMonth)}
        </span>

        <button
          type="button"
          onClick={handleNextMonth}
          aria-label="Bulan berikutnya"
          className="flex h-[calc(34*var(--u))] w-[calc(34*var(--u))] items-center justify-center rounded-full text-[#29232A] transition-colors active:bg-white"
        >
          <CaretRight
            weight="bold"
            className="h-[calc(16*var(--u))] w-[calc(16*var(--u))]"
          />
        </button>
      </div>

      {/* Header Hari */}
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

      {/* Grid Tanggal */}
      <div className="grid grid-cols-7 gap-y-[calc(4*var(--u))] text-center">
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
              className={`mx-auto flex h-[calc(38*var(--u))] w-[calc(38*var(--u))] items-center justify-center rounded-full text-[calc(13.5*var(--u))] transition-all duration-200 active:scale-90 ${
                isSelected
                  ? "bg-[#8E001C] font-bold text-white shadow-[0_3px_10px_rgba(142,0,28,0.28)]"
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

      {/* Tombol Cepat Hari Ini */}
      <div className="mt-[calc(14*var(--u))] flex justify-end border-t border-[#EFEFF2] pt-[calc(10*var(--u))]">
        <button
          type="button"
          onClick={() => handlePickDate(todayIso)}
          className="rounded-full bg-[#FCECEF] px-[calc(14*var(--u))] py-[calc(7*var(--u))] text-[calc(12.5*var(--u))] font-bold text-[#8E001C] transition-transform active:scale-95"
        >
          Pilih Hari Ini
        </button>
      </div>
    </ElasticBottomSheet>
  );
}

/* =========================================================
   CREATE VISIT PAGE
========================================================= */

export default function CreateVisitPage() {
  const { isMobile, isReady, backWithTransition } = useAppLayout();
  const location = useLocation();

  const initialMachineCode = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const eq = params.get("equipment") ?? "";
    return MACHINE_OPTIONS.some((m) => m.code === eq) ? eq : "";
  }, [location.search]);

  const [selectedMachineCode, setSelectedMachineCode] =
    useState(initialMachineCode);
  const [machineSearch, setMachineSearch] = useState("");
  const [visitDate, setVisitDate] = useState(getTodayIsoDate);
  const [visitType, setVisitType] = useState("");
  const [activityDesc, setActivityDesc] = useState("");
  const [technicianNotes, setTechnicianNotes] = useState("");

  const [showMachineSheet, setShowMachineSheet] = useState(false);
  const [showDateSheet, setShowDateSheet] = useState(false);
  const [showVisitTypeSheet, setShowVisitTypeSheet] = useState(false);

  const [errorSnackbar, setErrorSnackbar] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [savedToast, setSavedToast] = useState(false);

  const selectDelayRef = useRef<number | null>(null);
  const recordedBy = "Budi Santoso";

  const selectedMachine = useMemo(
    () =>
      MACHINE_OPTIONS.find((item) => item.code === selectedMachineCode) ?? null,
    [selectedMachineCode]
  );

  const selectedVisitTypeObj = useMemo(
    () => VISIT_TYPE_OPTIONS.find((item) => item.code === visitType) ?? null,
    [visitType]
  );

  const filteredMachines = useMemo(() => {
    const q = machineSearch.trim().toLowerCase();
    if (!q) return MACHINE_OPTIONS;
    return MACHINE_OPTIONS.filter(
      (m) =>
        m.code.toLowerCase().includes(q) ||
        m.customer.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q)
    );
  }, [machineSearch]);

  const isMobileView = !isReady || isMobile;

  useEffect(() => {
    if (!isMobileView) return;
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((meta) => meta.setAttribute("content", "#83051C"));
  }, [isMobileView]);

  useEffect(() => {
    if (!errorSnackbar) return;
    const timer = window.setTimeout(() => {
      setErrorSnackbar(null);
    }, 4200);
    return () => window.clearTimeout(timer);
  }, [errorSnackbar]);

  useEffect(() => {
    return () => {
      if (selectDelayRef.current !== null) {
        window.clearTimeout(selectDelayRef.current);
      }
    };
  }, []);

  const handleBack = useCallback(() => {
    backWithTransition("/");
  }, [backWithTransition]);

  const handleChooseMachine = (code: string) => {
    triggerHaptic(8);
    setSelectedMachineCode(code);
    setErrorSnackbar(null);

    if (selectDelayRef.current !== null) {
      window.clearTimeout(selectDelayRef.current);
    }
    selectDelayRef.current = window.setTimeout(() => {
      setShowMachineSheet(false);
      selectDelayRef.current = null;
    }, 150);
  };

  const handleChooseVisitType = (code: string) => {
    triggerHaptic(8);
    setVisitType(code);
    setErrorSnackbar(null);

    if (selectDelayRef.current !== null) {
      window.clearTimeout(selectDelayRef.current);
    }
    selectDelayRef.current = window.setTimeout(() => {
      setShowVisitTypeSheet(false);
      selectDelayRef.current = null;
    }, 150);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !selectedMachineCode ||
      !visitDate ||
      !visitType ||
      !activityDesc.trim()
    ) {
      triggerHaptic(16);
      setErrorSnackbar({
        title: "Data Belum Lengkap",
        description: "Lengkapi semua kolom wajib sebelum menyimpan kunjungan.",
      });
      return;
    }

    setErrorSnackbar(null);
    triggerHaptic(12);
    setSavedToast(true);

    window.setTimeout(() => {
      setSavedToast(false);
      backWithTransition("/");
    }, 1300);
  };

  return (
    <main
      style={MOBILE_SCALE_VARS}
      className="min-h-dvh w-full min-w-0 overflow-x-clip bg-white pb-[calc(108*var(--u)+env(safe-area-inset-bottom))]"
    >
      {/* Header Marun */}
      <header className="sticky top-0 z-40 w-full bg-[#83051C] text-white">
        <div className="mx-auto flex w-full max-w-[680px] items-center gap-[calc(10*var(--u))] px-[calc(14*var(--u))] pb-[calc(14*var(--u))] pt-[calc(env(safe-area-inset-top)+calc(11*var(--u)))]">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Kembali"
            className="flex h-[calc(34*var(--u))] w-[calc(34*var(--u))] shrink-0 items-center justify-center rounded-full text-white transition-colors duration-200 active:bg-white/15"
          >
            <ArrowLeft
              className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
              weight="bold"
            />
          </button>

          <h1 className="truncate font-display text-[calc(17.5*var(--u))] font-bold leading-tight tracking-[-0.02em] text-white">
            Buat Kunjungan
          </h1>
        </div>
      </header>

      {/* Form Body */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto w-full max-w-[680px] space-y-[calc(16*var(--u))] px-[calc(16*var(--u))] pt-[calc(18*var(--u))]"
      >
        {/* 1. Nomor Mesin * */}
        <div>
          <label className="mb-[calc(6*var(--u))] block font-display text-[calc(13.5*var(--u))] font-bold text-[#171717]">
            Nomor Mesin <span className="text-[#DC0E2E]">*</span>
          </label>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(6);
              setMachineSearch("");
              setShowMachineSheet(true);
            }}
            className={`flex min-h-[calc(46*var(--u))] w-full items-center justify-between gap-[calc(10*var(--u))] rounded-[calc(12*var(--u))] border bg-white px-[calc(13*var(--u))] text-left transition-colors duration-200 active:bg-[#FAFAFC] ${
              showMachineSheet
                ? "border-[#8E001C] ring-2 ring-[#8E001C]/10"
                : "border-[#DEDEE4]"
            }`}
          >
            <span className="flex min-w-0 flex-1 items-center gap-[calc(11*var(--u))]">
              <Printer
                weight="regular"
                className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0 text-[#29232A]"
              />
              <span
                className={`truncate text-[calc(13.5*var(--u))] ${
                  selectedMachine
                    ? "font-semibold text-[#171717]"
                    : "font-normal text-[#8E8994]"
                }`}
              >
                {selectedMachine ? selectedMachine.code : "Pilih mesin"}
              </span>
            </span>

            <CaretDown
              weight="bold"
              className={`h-[calc(15*var(--u))] w-[calc(15*var(--u))] shrink-0 text-[#29232A] transition-transform duration-300 ${
                showMachineSheet ? "rotate-180 text-[#8E001C]" : "rotate-0"
              }`}
            />
          </button>
        </div>

        {/* 2. Model Mesin (Auto-filled / Read-only) */}
        <div>
          <label className="mb-[calc(6*var(--u))] block font-display text-[calc(13.5*var(--u))] font-bold text-[#171717]">
            Model Mesin
          </label>
          <div className="flex min-h-[calc(46*var(--u))] w-full items-center gap-[calc(11*var(--u))] rounded-[calc(12*var(--u))] bg-[#EAEAEF] px-[calc(13*var(--u))]">
            <Stack
              weight="regular"
              className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0 text-[#4F4B53]"
            />
            <span
              className={`truncate text-[calc(13.5*var(--u))] ${
                selectedMachine
                  ? "font-semibold text-[#171717]"
                  : "font-normal text-[#8E8994]"
              }`}
            >
              {selectedMachine ? selectedMachine.model : "-"}
            </span>
          </div>
        </div>

        {/* 3. Pelanggan (Auto-filled / Read-only) */}
        <div>
          <label className="mb-[calc(6*var(--u))] block font-display text-[calc(13.5*var(--u))] font-bold text-[#171717]">
            Pelanggan
          </label>
          <div className="flex min-h-[calc(46*var(--u))] w-full items-center gap-[calc(11*var(--u))] rounded-[calc(12*var(--u))] bg-[#EAEAEF] px-[calc(13*var(--u))]">
            <Buildings
              weight="regular"
              className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0 text-[#4F4B53]"
            />
            <span
              className={`truncate text-[calc(13.5*var(--u))] ${
                selectedMachine
                  ? "font-semibold text-[#171717]"
                  : "font-normal text-[#8E8994]"
              }`}
            >
              {selectedMachine ? selectedMachine.customer : "-"}
            </span>
          </div>
        </div>

        {/* 4. Tanggal Kunjungan * (Bottom Sheet Kalender) */}
        <div>
          <label className="mb-[calc(6*var(--u))] block font-display text-[calc(13.5*var(--u))] font-bold text-[#171717]">
            Tanggal Kunjungan <span className="text-[#DC0E2E]">*</span>
          </label>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(6);
              setShowDateSheet(true);
            }}
            className={`flex min-h-[calc(46*var(--u))] w-full items-center justify-between gap-[calc(10*var(--u))] rounded-[calc(12*var(--u))] border bg-white px-[calc(13*var(--u))] text-left transition-colors duration-200 active:bg-[#FAFAFC] ${
              showDateSheet
                ? "border-[#8E001C] ring-2 ring-[#8E001C]/10"
                : "border-[#DEDEE4]"
            }`}
          >
            <span className="flex min-w-0 flex-1 items-center gap-[calc(11*var(--u))]">
              <CalendarBlank
                weight="regular"
                className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0 text-[#29232A]"
              />
              <span className="truncate text-[calc(13.5*var(--u))] font-medium text-[#171717]">
                {formatIndonesianDate(visitDate) || "Pilih tanggal"}
              </span>
            </span>

            <CalendarBlank
              weight="regular"
              className={`h-[calc(18*var(--u))] w-[calc(18*var(--u))] shrink-0 transition-colors duration-200 ${
                showDateSheet ? "text-[#8E001C]" : "text-[#29232A]"
              }`}
            />
          </button>
        </div>

        {/* 5. Jenis Kunjungan * */}
        <div>
          <label className="mb-[calc(6*var(--u))] block font-display text-[calc(13.5*var(--u))] font-bold text-[#171717]">
            Jenis Kunjungan <span className="text-[#DC0E2E]">*</span>
          </label>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(6);
              setShowVisitTypeSheet(true);
            }}
            className={`flex min-h-[calc(46*var(--u))] w-full items-center justify-between gap-[calc(10*var(--u))] rounded-[calc(12*var(--u))] border bg-white px-[calc(13*var(--u))] text-left transition-colors duration-200 active:bg-[#FAFAFC] ${
              showVisitTypeSheet
                ? "border-[#8E001C] ring-2 ring-[#8E001C]/10"
                : "border-[#DEDEE4]"
            }`}
          >
            <span className="flex min-w-0 flex-1 items-center gap-[calc(11*var(--u))]">
              <SquaresFour
                weight="regular"
                className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0 text-[#29232A]"
              />
              <span
                className={`truncate text-[calc(13.5*var(--u))] ${
                  selectedVisitTypeObj
                    ? "font-semibold text-[#171717]"
                    : "font-normal text-[#8E8994]"
                }`}
              >
                {selectedVisitTypeObj
                  ? selectedVisitTypeObj.title
                  : "Pilih jenis kunjungan"}
              </span>
            </span>

            <CaretDown
              weight="bold"
              className={`h-[calc(15*var(--u))] w-[calc(15*var(--u))] shrink-0 text-[#29232A] transition-transform duration-300 ${
                showVisitTypeSheet ? "rotate-180 text-[#8E001C]" : "rotate-0"
              }`}
            />
          </button>
          <p className="mt-[calc(5*var(--u))] text-[calc(11.5*var(--u))] font-normal text-[#6E6873]">
            Pilihan: IND, INS, DIS, PMC, UMC
          </p>
        </div>

        {/* 6. Deskripsi Aktivitas * */}
        <div>
          <label
            htmlFor="activity-desc-input"
            className="mb-[calc(6*var(--u))] block font-display text-[calc(13.5*var(--u))] font-bold text-[#171717]"
          >
            Deskripsi Aktivitas <span className="text-[#DC0E2E]">*</span>
          </label>
          <div className="relative rounded-[calc(12*var(--u))] border border-[#DEDEE4] bg-white px-[calc(13*var(--u))] pb-[calc(26*var(--u))] pt-[calc(11*var(--u))] transition-colors duration-200 focus-within:border-[#8E001C] focus-within:ring-2 focus-within:ring-[#8E001C]/10">
            <div className="flex items-start gap-[calc(11*var(--u))]">
              <FileText
                weight="regular"
                className="mt-[calc(2*var(--u))] h-[calc(18*var(--u))] w-[calc(18*var(--u))] shrink-0 text-[#29232A]"
              />
              <textarea
                id="activity-desc-input"
                rows={3}
                maxLength={MAX_TEXT_LENGTH}
                value={activityDesc}
                onChange={(e) => {
                  setActivityDesc(e.target.value);
                  if (errorSnackbar) setErrorSnackbar(null);
                }}
                placeholder="Jelaskan aktivitas yang dilakukan pada kunjungan ini..."
                className="w-full resize-none bg-transparent text-[calc(13.5*var(--u))] leading-[1.45] text-[#171717] outline-none placeholder:text-[#8E8994]"
              />
            </div>

            <span className="pointer-events-none absolute bottom-[calc(8*var(--u))] right-[calc(12*var(--u))] text-[calc(11.5*var(--u))] font-medium tabular-nums text-[#6E6873]">
              {activityDesc.length}/{MAX_TEXT_LENGTH}
            </span>
          </div>
        </div>

        {/* 7. Catatan Teknisi */}
        <div>
          <label
            htmlFor="tech-notes-input"
            className="mb-[calc(6*var(--u))] block font-display text-[calc(13.5*var(--u))] font-bold text-[#171717]"
          >
            Catatan Teknisi
          </label>
          <div className="relative rounded-[calc(12*var(--u))] border border-[#DEDEE4] bg-white px-[calc(13*var(--u))] pb-[calc(26*var(--u))] pt-[calc(11*var(--u))] transition-colors duration-200 focus-within:border-[#8E001C] focus-within:ring-2 focus-within:ring-[#8E001C]/10">
            <div className="flex items-start gap-[calc(11*var(--u))]">
              <ChatText
                weight="regular"
                className="mt-[calc(2*var(--u))] h-[calc(18*var(--u))] w-[calc(18*var(--u))] shrink-0 text-[#29232A]"
              />
              <textarea
                id="tech-notes-input"
                rows={3}
                maxLength={MAX_TEXT_LENGTH}
                value={technicianNotes}
                onChange={(e) => setTechnicianNotes(e.target.value)}
                placeholder="Tambahkan catatan jika diperlukan..."
                className="w-full resize-none bg-transparent text-[calc(13.5*var(--u))] leading-[1.45] text-[#171717] outline-none placeholder:text-[#8E8994]"
              />
            </div>

            <span className="pointer-events-none absolute bottom-[calc(8*var(--u))] right-[calc(12*var(--u))] text-[calc(11.5*var(--u))] font-medium tabular-nums text-[#6E6873]">
              {technicianNotes.length}/{MAX_TEXT_LENGTH}
            </span>
          </div>
        </div>

        {/* 8. Dicatat oleh (Read-only) */}
        <div>
          <label className="mb-[calc(6*var(--u))] block font-display text-[calc(13.5*var(--u))] font-bold text-[#171717]">
            Dicatat oleh
          </label>
          <div className="flex min-h-[calc(46*var(--u))] w-full items-center gap-[calc(11*var(--u))] rounded-[calc(12*var(--u))] bg-[#EAEAEF] px-[calc(13*var(--u))]">
            <User
              weight="regular"
              className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0 text-[#4F4B53]"
            />
            <span className="truncate text-[calc(13.5*var(--u))] font-semibold text-[#171717]">
              {recordedBy}
            </span>
          </div>
        </div>

        {/* 9. Tombol Simpan Kunjungan */}
        <div className="pt-[calc(8*var(--u))]">
          <button
            type="submit"
            disabled={savedToast}
            style={{ color: "#FFFFFF" }}
            className="flex min-h-[calc(48*var(--u))] w-full items-center justify-center rounded-[calc(13*var(--u))] bg-[#8E001C] px-[calc(18*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(15*var(--u))] font-bold tracking-[-0.01em] text-white shadow-[0_4px_14px_rgba(142,0,28,0.22)] transition-transform duration-150 active:scale-[0.985] active:bg-[#730217] disabled:opacity-75"
          >
            {savedToast ? "Menyimpan..." : "Simpan Kunjungan"}
          </button>
        </div>
      </form>

      {/* Bottom Sheet Pilih Mesin (dengan Pencarian + Ikon Printer) */}
      <ElasticBottomSheet
        isOpen={showMachineSheet}
        title="Pilih Mesin"
        onClose={() => setShowMachineSheet(false)}
      >
        <div
          data-no-sheet-drag="true"
          className="mb-[calc(10*var(--u))] flex h-[calc(42*var(--u))] items-center gap-[calc(9*var(--u))] rounded-[calc(12*var(--u))] border border-[#E2E2E8] bg-[#FAFAFC] px-[calc(12*var(--u))] focus-within:border-[#8E001C] focus-within:bg-white"
        >
          <MagnifyingGlass
            weight="regular"
            className="h-[calc(18*var(--u))] w-[calc(18*var(--u))] shrink-0 text-[#5A555F]"
          />
          <input
            type="text"
            value={machineSearch}
            onChange={(e) => setMachineSearch(e.target.value)}
            placeholder="Cari nomor mesin atau pelanggan..."
            className="w-full bg-transparent text-[calc(13.5*var(--u))] text-[#171717] outline-none placeholder:text-[#8E8994]"
          />
          {machineSearch && (
            <button
              type="button"
              onClick={() => setMachineSearch("")}
              aria-label="Hapus pencarian"
              className="flex h-[calc(22*var(--u))] w-[calc(22*var(--u))] shrink-0 items-center justify-center rounded-full bg-[#E8E8EE] text-[#5A555F]"
            >
              <X weight="bold" className="h-[calc(12*var(--u))] w-[calc(12*var(--u))]" />
            </button>
          )}
        </div>

        <div className="max-h-[48dvh] divide-y divide-[#EFEFF2] overflow-y-auto">
          {filteredMachines.length > 0 ? (
            filteredMachines.map((machine) => {
              const isActive = selectedMachineCode === machine.code;
              return (
                <button
                  key={machine.code}
                  type="button"
                  onClick={() => handleChooseMachine(machine.code)}
                  className={`flex w-full items-center justify-between gap-[calc(12*var(--u))] rounded-[calc(12*var(--u))] px-[calc(12*var(--u))] py-[calc(11*var(--u))] text-left transition-colors duration-200 ${
                    isActive
                      ? "bg-[#FCECEF]"
                      : "bg-white active:bg-[#F7F7F9]"
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-[calc(12*var(--u))]">
                    <Printer
                      weight="regular"
                      className={`h-[calc(21*var(--u))] w-[calc(21*var(--u))] shrink-0 ${
                        isActive ? "text-[#8E001C]" : "text-[#29232A]"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate font-display text-[calc(14*var(--u))] font-bold leading-tight ${
                          isActive ? "text-[#8E001C]" : "text-[#171717]"
                        }`}
                      >
                        {machine.code}
                      </p>
                      <p className="mt-[calc(2*var(--u))] truncate text-[calc(12.5*var(--u))] font-normal text-[#6E6873]">
                        {machine.customer}
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
            })
          ) : (
            <p className="py-[calc(24*var(--u))] text-center text-[calc(13*var(--u))] text-[#6E6873]">
              Mesin atau pelanggan tidak ditemukan.
            </p>
          )}
        </div>
      </ElasticBottomSheet>

      {/* Bottom Sheet Kalender Tanggal Kunjungan */}
      <CalendarBottomSheet
        isOpen={showDateSheet}
        selectedDate={visitDate}
        onSelect={(iso) => {
          setVisitDate(iso);
          setErrorSnackbar(null);
        }}
        onClose={() => setShowDateSheet(false)}
      />

      {/* Bottom Sheet Pilih Jenis Kunjungan (dengan Ikon & Deskripsi) */}
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
                className={`flex w-full items-center justify-between gap-[calc(12*var(--u))] rounded-[calc(12*var(--u))] px-[calc(8*var(--u))] py-[calc(11*var(--u))] text-left transition-colors duration-200 ${
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
                      {option.title}
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

      {/* Snackbar Error State (Portal agar selalu tampil di atas bottom navbar) */}
      {errorSnackbar &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={MOBILE_SCALE_VARS}
            role="alert"
            aria-live="assertive"
            className="moku-snack-enter fixed bottom-[calc(84px+env(safe-area-inset-bottom))] left-4 right-4 z-[9998] mx-auto flex max-w-[600px] items-center justify-between gap-[calc(12*var(--u))] overflow-hidden rounded-[calc(14*var(--u))] bg-[#22252A] py-[calc(13*var(--u))] pl-[calc(16*var(--u))] pr-[calc(12*var(--u))] text-white shadow-[0_10px_28px_rgba(0,0,0,0.28)]"
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-[calc(4.5*var(--u))] bg-[#DC0E2E]"
            />

            <div className="flex min-w-0 flex-1 items-center gap-[calc(12*var(--u))]">
              <WarningCircle
                weight="regular"
                className="h-[calc(26*var(--u))] w-[calc(26*var(--u))] shrink-0 text-[#DC0E2E]"
              />
              <div className="min-w-0 flex-1">
                <p className="font-display text-[calc(14*var(--u))] font-bold leading-tight text-white">
                  {errorSnackbar.title}
                </p>
                <p className="mt-[calc(2*var(--u))] text-[calc(12*var(--u))] font-normal leading-[1.35] text-[#B8BCC4]">
                  {errorSnackbar.description}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setErrorSnackbar(null)}
              aria-label="Tutup peringatan"
              className="flex h-[calc(28*var(--u))] w-[calc(28*var(--u))] shrink-0 items-center justify-center rounded-full text-white/80 transition-colors active:bg-white/10"
            >
              <X
                weight="bold"
                className="h-[calc(16*var(--u))] w-[calc(16*var(--u))]"
              />
            </button>
          </div>,
          document.body
        )}

      {/* Snackbar Konfirmasi Simpan (Portal) */}
      {savedToast &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={MOBILE_SCALE_VARS}
            role="status"
            aria-live="polite"
            className="moku-snack-enter fixed bottom-[calc(84px+env(safe-area-inset-bottom))] left-4 right-4 z-[9998] mx-auto flex max-w-[600px] items-center gap-2.5 rounded-[13px] bg-[#730217] px-4 py-3 text-white shadow-xl"
          >
            <CheckCircle
              size={19}
              weight="fill"
              className="shrink-0 text-white"
            />
            <span className="truncate text-xs font-medium sm:text-sm">
              Kunjungan {selectedMachineCode} berhasil disimpan.
            </span>
          </div>,
          document.body
        )}

      <style>{`
        .moku-snack-enter {
          animation: moku-snack-up 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes moku-snack-up {
          from {
            opacity: 0;
            transform: translate3d(0, 14px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </main>
  );
              }
