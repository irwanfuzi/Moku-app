import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { CalendarBlank, Check, X } from "@phosphor-icons/react";

export interface PeriodOption {
  value: string;
  label: string;
  subtitle?: string;
}

interface PeriodPickerSheetProps {
  open: boolean;
  title?: string;
  periods: PeriodOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.85px, min(0.265vw, 0.12dvh), 1.12px)",
} as CSSProperties;

const DISMISS_THRESHOLD = 96;
const CLOSE_ANIMATION_MS = 260;

export default function PeriodPickerSheet({
  open,
  title = "Pilih Periode",
  periods,
  selectedValue,
  onSelect,
  onClose,
}: PeriodPickerSheetProps) {
  const [shouldRender, setShouldRender] = useState(open);
  const [isClosing, setIsClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [justPickedValue, setJustPickedValue] = useState<string | null>(null);

  const dragStartYRef = useRef<number | null>(null);
  const dragCurrentYRef = useRef(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const pickTimerRef = useRef<number | null>(null);

  const triggerClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    setIsDragging(false);
    dragStartYRef.current = null;
    dragCurrentYRef.current = 0;
    setDragY(0);
    setIsClosing(true);

    closeTimerRef.current = window.setTimeout(() => {
      setShouldRender(false);
      setIsClosing(false);
      closeTimerRef.current = null;
      onClose();
    }, CLOSE_ANIMATION_MS);
  }, [onClose]);

  useEffect(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (open) {
      setShouldRender(true);
      setIsClosing(false);
      setDragY(0);
      setIsDragging(false);
      dragStartYRef.current = null;
      dragCurrentYRef.current = 0;
    } else if (shouldRender) {
      setIsClosing(true);
      closeTimerRef.current = window.setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
        setDragY(0);
        closeTimerRef.current = null;
      }, CLOSE_ANIMATION_MS);
    }
  }, [open, shouldRender]);

  useEffect(() => {
    if (!shouldRender) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        triggerClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shouldRender, triggerClose]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
      if (pickTimerRef.current !== null) window.clearTimeout(pickTimerRef.current);
    };
  }, []);

  const handlePointerDown = (
    e: ReactPointerEvent<HTMLDivElement>,
    fromHeader: boolean
  ) => {
    if (isClosing) return;
    if (!fromHeader) {
      const scrollTop = listRef.current?.scrollTop ?? 0;
      if (scrollTop > 0) return;
    }
    dragStartYRef.current = e.clientY;
    dragCurrentYRef.current = 0;
    setIsDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging || dragStartYRef.current === null) return;
    const deltaY = e.clientY - dragStartYRef.current;

    if (deltaY <= 0) {
      dragCurrentYRef.current = 0;
      setDragY(0);
      return;
    }

    const damped = deltaY > 140 ? 140 + (deltaY - 140) * 0.35 : deltaY;
    dragCurrentYRef.current = damped;
    setDragY(damped);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    const finalOffset = dragCurrentYRef.current;
    setIsDragging(false);
    dragStartYRef.current = null;
    dragCurrentYRef.current = 0;

    if (finalOffset >= DISMISS_THRESHOLD) {
      triggerClose();
    } else {
      setDragY(0);
    }
  };

  const handleChoosePeriod = (value: string) => {
    if (isClosing) return;
    setJustPickedValue(value);

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(8);
    }

    onSelect(value);

    if (pickTimerRef.current !== null) {
      window.clearTimeout(pickTimerRef.current);
    }
    pickTimerRef.current = window.setTimeout(() => {
      setJustPickedValue(null);
      triggerClose();
    }, 180);
  };

  if (!shouldRender) return null;

  const backdropOpacity = isClosing
    ? 0
    : Math.max(0.15, 0.45 * (1 - Math.min(dragY, 220) / 260));

  return (
    <div
      style={MOBILE_SCALE_VARS}
      className="fixed inset-0 z-50 flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        onClick={triggerClose}
        style={{
          opacity: backdropOpacity,
          transition: isDragging ? "none" : "opacity 260ms ease-out",
        }}
        className="fixed inset-0 bg-black"
      />

      {/* Bottom Sheet */}
      <div
        style={{
          transform: isClosing
            ? "translate3d(0, 100%, 0)"
            : `translate3d(0, ${dragY}px, 0)`,
          transition: isDragging
            ? "none"
            : "transform 280ms cubic-bezier(0.22, 1.12, 0.36, 1)",
          willChange: "transform",
        }}
        className={`relative z-10 mx-auto w-full max-w-[680px] rounded-t-[calc(24*var(--u))] bg-white pb-[calc(24*var(--u)+env(safe-area-inset-bottom))] shadow-2xl ${
          !isDragging && !isClosing && dragY === 0 ? "moku-sheet-enter" : ""
        }`}
      >
        {/* Drag Handle & Header */}
        <div
          onPointerDown={(e) => handlePointerDown(e, true)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: "none" }}
          className="cursor-grab select-none px-[calc(18*var(--u))] pt-[calc(10*var(--u))] pb-[calc(12*var(--u))] active:cursor-grabbing"
        >
          <div className="mx-auto mb-[calc(10*var(--u))] h-[calc(4.5*var(--u))] w-[calc(40*var(--u))] rounded-full bg-[#DCDCE2]" />

          <div className="flex items-center justify-between gap-[calc(10*var(--u))]">
            <div className="flex items-center gap-[calc(8*var(--u))]">
              <span className="flex h-[calc(32*var(--u))] w-[calc(32*var(--u))] items-center justify-center rounded-full bg-[#FCECEF] text-[#8E001C]">
                <CalendarBlank
                  className="h-[calc(17*var(--u))] w-[calc(17*var(--u))]"
                  weight="bold"
                />
              </span>
              <h2 className="font-display text-[calc(16*var(--u))] font-bold tracking-[-0.02em] text-[#171717]">
                {title}
              </h2>
            </div>

            <button
              type="button"
              onClick={triggerClose}
              aria-label="Tutup pemilih periode"
              className="flex h-[calc(32*var(--u))] w-[calc(32*var(--u))] items-center justify-center rounded-full text-[#5E5863] transition-colors active:bg-[#F2F2F5]"
            >
              <X
                className="h-[calc(18*var(--u))] w-[calc(18*var(--u))]"
                weight="bold"
              />
            </button>
          </div>
        </div>

        {/* List Periode */}
        <div
          ref={listRef}
          onPointerDown={(e) => handlePointerDown(e, false)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="max-h-[55dvh] space-y-[calc(8*var(--u))] overflow-y-auto px-[calc(18*var(--u))] pt-[calc(4*var(--u))] pb-[calc(8*var(--u))]"
        >
          {periods.map((period) => {
            const isSelected = period.value === selectedValue;
            const isJustPicked = period.value === justPickedValue;

            return (
              <button
                key={period.value}
                type="button"
                onClick={() => handleChoosePeriod(period.value)}
                className={`flex w-full items-center justify-between gap-[calc(12*var(--u))] rounded-[calc(14*var(--u))] border px-[calc(14*var(--u))] py-[calc(12*var(--u))] text-left transition-all duration-200 ${
                  isJustPicked ? "scale-[0.985]" : "scale-100"
                } ${
                  isSelected
                    ? "border-[#8E001C]/25 bg-[#FDF2F4]"
                    : "border-[#EFEFF2] bg-white active:bg-[#FAFAFC]"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-display text-[calc(14*var(--u))] font-bold leading-snug transition-colors duration-200 ${
                      isSelected ? "text-[#8E001C]" : "text-[#171717]"
                    }`}
                  >
                    {period.label}
                  </p>
                  {period.subtitle && (
                    <p className="mt-[calc(2*var(--u))] text-[calc(12*var(--u))] font-normal text-[#6E6873]">
                      {period.subtitle}
                    </p>
                  )}
                </div>

                <span
                  className={`flex h-[calc(24*var(--u))] w-[calc(24*var(--u))] shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                    isSelected
                      ? "scale-100 bg-[#8E001C] text-white opacity-100"
                      : "scale-75 bg-[#F2F2F5] text-transparent opacity-0"
                  }`}
                >
                  <Check
                    className="h-[calc(14*var(--u))] w-[calc(14*var(--u))]"
                    weight="bold"
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        .moku-sheet-enter {
          animation: moku-sheet-up 300ms cubic-bezier(0.22, 1.12, 0.36, 1) both;
        }

        @keyframes moku-sheet-up {
          from {
            transform: translate3d(0, 100%, 0);
          }
          to {
            transform: translate3d(0, 0, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .moku-sheet-enter {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
