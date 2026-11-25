import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type PointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Buildings,
  CalendarBlank,
  CaretDown,
  ChatText,
  Check,
  CheckCircle,
  FileText,
  Printer,
  SquaresFour,
  Stack,
  User,
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
  label: string;
}

const MACHINE_OPTIONS: MachineOption[] = [
  { code: "MK-001", model: "iR-ADV DX C3826i", customer: "PT. Sinar Mandiri" },
  { code: "MK-002", model: "imageRUNNER 2625i", customer: "CV. Multi Jaya" },
  { code: "MK-003", model: "iR-ADV 4745i", customer: "PT. Prima Solusi" },
  { code: "MK-004", model: "iR-ADV C5535i", customer: "PT. Citra Jaya" },
  { code: "MK-007", model: "iR-ADV C5550i", customer: "PT. Maju Bersama" },
];

const VISIT_TYPE_OPTIONS: VisitTypeOption[] = [
  { code: "IND", label: "Driver Installation" },
  { code: "INS", label: "Installation" },
  { code: "DIS", label: "Dismantle" },
  { code: "PMC", label: "Preventive Maintenance" },
  { code: "UMC", label: "Unscheduled Maintenance" },
];

const MAX_TEXT_LENGTH = 500;
const SHEET_TRANSITION_MS = 420;
const SHEET_UNMOUNT_MS = 460;

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatIndonesianDate(isoDate: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function triggerHaptic(duration = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(duration);
  }
}

/* =========================================================
   REUSABLE ELASTIC BOTTOM SHEET PICKER (PORTAL)
========================================================= */

interface PickerSheetItem {
  value: string;
  title: string;
  subtitle?: string;
}

function SelectBottomSheet({
  isOpen,
  title,
  items,
  selectedValue,
  onSelect,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  items: PickerSheetItem[];
  selectedValue: string;
  onSelect: (value: string) => void;
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

  const handleChoose = (val: string) => {
    triggerHaptic(8);
    onSelect(val);
    if (selectDelayRef.current !== null) {
      window.clearTimeout(selectDelayRef.current);
    }
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

        <div className="mb-[calc(10*var(--u))] flex items-center justify-between">
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

        <div className="max-h-[54dvh] space-y-[calc(6*var(--u))] overflow-y-auto">
          {items.map((item) => {
            const isActive = selectedValue === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => handleChoose(item.value)}
                className={`flex w-full items-center justify-between gap-[calc(10*var(--u))] rounded-[calc(14*var(--u))] px-[calc(14*var(--u))] py-[calc(12*var(--u))] text-left transition-all duration-300 ease-out active:scale-[0.985] ${
                  isActive
                    ? "bg-[#FCECEF] font-bold text-[#8E001C]"
                    : "bg-white font-medium text-[#29232A] active:bg-[#F7F7F9]"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[calc(14*var(--u))] leading-tight">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p
                      className={`mt-[calc(2*var(--u))] truncate text-[calc(12*var(--u))] font-normal ${
                        isActive ? "text-[#8E001C]/80" : "text-[#6E6873]"
                      }`}
                    >
                      {item.subtitle}
                    </p>
                  )}
                </div>

                <span
                  className={`flex h-[calc(22*var(--u))] w-[calc(22*var(--u))] shrink-0 items-center justify-center rounded-full bg-[#8E001C] text-white transition-all duration-300 ease-[cubic-bezier(0.22,1.28,0.36,1)] ${
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
  const [visitDate, setVisitDate] = useState(getTodayIsoDate);
  const [visitType, setVisitType] = useState("");
  const [activityDesc, setActivityDesc] = useState("");
  const [technicianNotes, setTechnicianNotes] = useState("");

  const [showMachineSheet, setShowMachineSheet] = useState(false);
  const [showVisitTypeSheet, setShowVisitTypeSheet] = useState(false);
  const [submittedError, setSubmittedError] = useState("");
  const [savedToast, setSavedToast] = useState(false);

  const dateInputRef = useRef<HTMLInputElement | null>(null);
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

  const isMobileView = !isReady || isMobile;

  useEffect(() => {
    if (!isMobileView) return;
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((meta) => meta.setAttribute("content", "#83051C"));
  }, [isMobileView]);

  const handleBack = useCallback(() => {
    backWithTransition("/");
  }, [backWithTransition]);

  const handleOpenDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        // Fallback ke focus/click
      }
    }
    input.focus();
    input.click();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedMachineCode) {
      setSubmittedError("Silakan pilih Nomor Mesin terlebih dahulu.");
      return;
    }
    if (!visitDate) {
      setSubmittedError("Silakan tentukan Tanggal Kunjungan.");
      return;
    }
    if (!visitType) {
      setSubmittedError("Silakan pilih Jenis Kunjungan.");
      return;
    }
    if (!activityDesc.trim()) {
      setSubmittedError("Deskripsi Aktivitas wajib diisi.");
      return;
    }

    setSubmittedError("");
    triggerHaptic(12);
    setSavedToast(true);

    window.setTimeout(() => {
      setSavedToast(false);
      backWithTransition("/");
    }, 1300);
  };

  const machineSheetItems: PickerSheetItem[] = useMemo(
    () =>
      MACHINE_OPTIONS.map((m) => ({
        value: m.code,
        title: m.code,
        subtitle: `${m.model} • ${m.customer}`,
      })),
    []
  );

  const visitTypeSheetItems: PickerSheetItem[] = useMemo(
    () =>
      VISIT_TYPE_OPTIONS.map((v) => ({
        value: v.code,
        title: v.code,
        subtitle: v.label,
      })),
    []
  );

  return (
    <main
      style={MOBILE_SCALE_VARS}
      className="min-h-dvh w-full min-w-0 overflow-x-clip bg-white pb-[calc(32*var(--u)+env(safe-area-inset-bottom))]"
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
        {submittedError && (
          <div
            role="alert"
            className="rounded-[calc(12*var(--u))] border border-[#F5C2CB] bg-[#FDF2F4] px-[calc(12*var(--u))] py-[calc(10*var(--u))] text-[calc(12.5*var(--u))] font-medium text-[#B81432]"
          >
            {submittedError}
          </div>
        )}

        {/* 1. Nomor Mesin * */}
        <div>
          <label className="mb-[calc(6*var(--u))] block font-display text-[calc(13.5*var(--u))] font-bold text-[#171717]">
            Nomor Mesin <span className="text-[#DC0E2E]">*</span>
          </label>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(6);
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

        {/* 4. Tanggal Kunjungan * */}
        <div>
          <label
            htmlFor="visit-date-input"
            className="mb-[calc(6*var(--u))] block font-display text-[calc(13.5*var(--u))] font-bold text-[#171717]"
          >
            Tanggal Kunjungan <span className="text-[#DC0E2E]">*</span>
          </label>
          <div
            onClick={handleOpenDatePicker}
            className="relative flex min-h-[calc(46*var(--u))] w-full cursor-pointer items-center justify-between gap-[calc(10*var(--u))] rounded-[calc(12*var(--u))] border border-[#DEDEE4] bg-white px-[calc(13*var(--u))] transition-colors duration-200 focus-within:border-[#8E001C] focus-within:ring-2 focus-within:ring-[#8E001C]/10"
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
              className="h-[calc(18*var(--u))] w-[calc(18*var(--u))] shrink-0 text-[#29232A]"
            />

            <input
              ref={dateInputRef}
              id="visit-date-input"
              type="date"
              value={visitDate}
              onChange={(e) => {
                setVisitDate(e.target.value);
                setSubmittedError("");
              }}
              aria-label="Tanggal Kunjungan"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
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
                  ? `${selectedVisitTypeObj.code} — ${selectedVisitTypeObj.label}`
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
                  setSubmittedError("");
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

      {/* Bottom Sheet Pilih Mesin */}
      <SelectBottomSheet
        isOpen={showMachineSheet}
        title="Pilih Mesin"
        items={machineSheetItems}
        selectedValue={selectedMachineCode}
        onSelect={(val) => {
          setSelectedMachineCode(val);
          setSubmittedError("");
        }}
        onClose={() => setShowMachineSheet(false)}
      />

      {/* Bottom Sheet Pilih Jenis Kunjungan */}
      <SelectBottomSheet
        isOpen={showVisitTypeSheet}
        title="Pilih Jenis Kunjungan"
        items={visitTypeSheetItems}
        selectedValue={visitType}
        onSelect={(val) => {
          setVisitType(val);
          setSubmittedError("");
        }}
        onClose={() => setShowVisitTypeSheet(false)}
      />

      {/* Snackbar Konfirmasi Simpan */}
      {savedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-4 right-4 z-50 mx-auto flex max-w-[640px] items-center gap-2.5 rounded-[13px] bg-[#730217] px-4 py-3 text-white shadow-xl"
        >
          <CheckCircle size={19} weight="fill" className="shrink-0 text-white" />
          <span className="truncate text-xs font-medium sm:text-sm">
            Kunjungan {selectedMachineCode} berhasil disimpan.
          </span>
        </div>
      )}
    </main>
  );
}
