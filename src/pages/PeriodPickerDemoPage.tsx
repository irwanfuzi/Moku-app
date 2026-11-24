import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, CalendarBlank, CaretDown } from "@phosphor-icons/react";
import { useAppLayout } from "@/components/layout/app-shell";
import PeriodPickerSheet, {
  type PeriodOption,
} from "@/components/period-picker-sheet";

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.85px, min(0.265vw, 0.12dvh), 1.12px)",
} as CSSProperties;

const PERIOD_OPTIONS: PeriodOption[] = [
  {
    value: "2026-11",
    label: "November 2026",
    subtitle: "Periode berjalan saat ini",
  },
  {
    value: "2026-10",
    label: "Oktober 2026",
    subtitle: "1 – 31 Oktober 2026",
  },
  {
    value: "2026-09",
    label: "September 2026",
    subtitle: "1 – 30 September 2026",
  },
  {
    value: "2026-08",
    label: "Agustus 2026",
    subtitle: "1 – 31 Agustus 2026",
  },
];

export default function PeriodPickerDemoPage() {
  const { backWithTransition } = useAppLayout();

  const [selectedPeriod, setSelectedPeriod] = useState<string>("2026-11");
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [periodPulse, setPeriodPulse] = useState<boolean>(false);
  const [contentFade, setContentFade] = useState<boolean>(false);

  const pulseTimerRef = useRef<number | null>(null);
  const fadeTimerRef = useRef<number | null>(null);

  const activePeriod = useMemo(
    () =>
      PERIOD_OPTIONS.find((item) => item.value === selectedPeriod) ??
      PERIOD_OPTIONS[0],
    [selectedPeriod]
  );

  useEffect(() => {
    return () => {
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current);
      if (fadeTimerRef.current !== null) window.clearTimeout(fadeTimerRef.current);
    };
  }, []);

  const handlePeriodChange = (nextValue: string) => {
    setSelectedPeriod(nextValue);

    setPeriodPulse(true);
    setContentFade(true);

    if (pulseTimerRef.current !== null) {
      window.clearTimeout(pulseTimerRef.current);
    }
    if (fadeTimerRef.current !== null) {
      window.clearTimeout(fadeTimerRef.current);
    }

    pulseTimerRef.current = window.setTimeout(() => {
      setPeriodPulse(false);
    }, 340);

    fadeTimerRef.current = window.setTimeout(() => {
      setContentFade(false);
    }, 280);
  };

  return (
    <main
      style={MOBILE_SCALE_VARS}
      className="min-h-dvh w-full min-w-0 overflow-x-clip bg-white pb-[calc(40*var(--u)+env(safe-area-inset-bottom))]"
    >
      {/* Header Marun */}
      <header className="sticky top-0 z-40 w-full bg-[#83051C] text-white">
        <div className="mx-auto flex w-full max-w-[680px] items-center justify-between gap-[calc(10*var(--u))] px-[calc(16*var(--u))] pb-[calc(32*var(--u))] pt-[calc(env(safe-area-inset-top)+calc(12*var(--u)))]">
          <div className="flex min-w-0 items-center gap-[calc(10*var(--u))]">
            <button
              type="button"
              onClick={() => backWithTransition("/")}
              aria-label="Kembali"
              className="flex h-[calc(36*var(--u))] w-[calc(36*var(--u))] shrink-0 items-center justify-center rounded-full text-white transition-colors duration-200 active:bg-white/15"
            >
              <ArrowLeft
                className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                weight="bold"
              />
            </button>

            <h1 className="truncate font-display text-[calc(17.5*var(--u))] font-bold leading-tight tracking-[-0.02em] text-white">
              Ringkasan Periode
            </h1>
          </div>
        </div>
      </header>

      {/* Sheet Putih Melengkung */}
      <div className="relative z-40 -mt-[calc(20*var(--u))] min-h-[calc(100dvh-calc(68*var(--u)))] rounded-t-[calc(24*var(--u))] bg-white px-[calc(18*var(--u))] pt-[calc(20*var(--u))]">
        <div className="mx-auto w-full max-w-[680px]">
          <div className="flex items-center justify-between gap-[calc(10*var(--u))]">
            <span className="text-[calc(13*var(--u))] font-normal text-[#6E6873]">
              Periode Aktif
            </span>

            {/* Chip Pemilih Periode dengan Micro-Interaction */}
            <button
              type="button"
              onClick={() => setIsSheetOpen(true)}
              className={`inline-flex items-center gap-[calc(8*var(--u))] rounded-[calc(12*var(--u))] border px-[calc(12*var(--u))] py-[calc(8*var(--u))] font-display text-[calc(13*var(--u))] font-bold transition-all duration-300 active:scale-[0.98] ${
                periodPulse
                  ? "scale-[1.04] border-[#8E001C]/40 bg-[#FDF2F4] text-[#8E001C] shadow-xs"
                  : "scale-100 border-[#E8E9ED] bg-white text-[#1E1C21]"
              }`}
            >
              <CalendarBlank
                className="h-[calc(15*var(--u))] w-[calc(15*var(--u))] text-[#8E001C]"
                weight="bold"
              />
              <span>{activePeriod.label}</span>
              <CaretDown
                className="h-[calc(14*var(--u))] w-[calc(14*var(--u))] text-[#6E6873]"
                weight="bold"
              />
            </button>
          </div>

          {/* Kartu Konten yang Merespons Perubahan Periode */}
          <section
            className={`mt-[calc(18*var(--u))] rounded-[calc(18*var(--u))] bg-[#F6F6F8] p-[calc(14*var(--u))] transition-all duration-300 ${
              contentFade
                ? "translate-y-[calc(2*var(--u))] opacity-80"
                : "translate-y-0 opacity-100"
            }`}
          >
            <div className="rounded-[calc(14*var(--u))] bg-white p-[calc(14*var(--u))] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <p className="text-[calc(12*var(--u))] font-normal text-[#6E6873]">
                Periode Terpilih
              </p>
              <p className="mt-[calc(3*var(--u))] font-display text-[calc(15*var(--u))] font-bold text-[#1E1C21]">
                {activePeriod.label}
              </p>
              {activePeriod.subtitle && (
                <p className="mt-[calc(3*var(--u))] text-[calc(12.5*var(--u))] font-normal text-[#6E6873]">
                  {activePeriod.subtitle}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      <PeriodPickerSheet
        open={isSheetOpen}
        title="Pilih Periode"
        periods={PERIOD_OPTIONS}
        selectedValue={selectedPeriod}
        onSelect={handlePeriodChange}
        onClose={() => setIsSheetOpen(false)}
      />
    </main>
  );
}
