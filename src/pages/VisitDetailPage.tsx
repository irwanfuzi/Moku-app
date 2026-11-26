import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowSquareOut,
  Buildings,
  CalendarBlank,
  Check,
  CheckCircle,
  Copy,
  DotsThreeVertical,
  DownloadSimple,
  FilePdf,
  FileText,
  GearSix,
  Laptop,
  MapPin,
  Package,
  PencilSimple,
  Printer,
  ShareNetwork,
  User,
  Wrench,
  X,
} from "@phosphor-icons/react";
import { useAppLayout } from "@/components/layout/app-shell";
import MokuModalDialog from "@/components/ui/moku-modal-dialog";
import { useBackGesture } from "@/hooks/use-back-gesture";
import {
  generateVisitReportPdf,
  triggerBrowserPdfDownload,
  type GeneratedVisitPdf,
} from "@/lib/visit-pdf";
import {
  getVisitByNumber,
  VISIT_TYPE_LABELS,
  type VisitTypeCode,
} from "@/lib/visit-store";

/* =========================================================
   CONSTANTS & HELPERS
========================================================= */

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

const SNACKBAR_EXIT_MS = 320;
const SHEET_EXIT_MS = 360;
const DEFAULT_DOWNLOAD_MB = 0.2;
const DOWNLOAD_DURATION_MS = 2400;

function formatIndonesianDate(isoDate: string): string {
  if (!isoDate) return "-";
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}

function formatMb(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

function triggerHaptic(duration = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(duration);
  }
}

function VisitTypeDetailIcon({
  code,
  className,
}: {
  code: VisitTypeCode;
  className: string;
}) {
  switch (code) {
    case "IND":
      return <Laptop className={className} weight="regular" />;
    case "INS":
      return <Printer className={className} weight="regular" />;
    case "DIS":
      return <Package className={className} weight="regular" />;
    case "PMC":
      return <Wrench className={className} weight="regular" />;
    case "UMC":
    default:
      return <GearSix className={className} weight="regular" />;
  }
}

function CancelDownloadIcon() {
  return (
    <span className="relative inline-flex items-center justify-center">
      <DownloadSimple
        weight="bold"
        className="h-[calc(25*var(--u))] w-[calc(25*var(--u))] text-[#8E001C]"
      />
      <span className="absolute -bottom-[calc(3*var(--u))] -right-[calc(4*var(--u))] flex h-[calc(15*var(--u))] w-[calc(15*var(--u))] items-center justify-center rounded-full bg-[#B8001F] ring-[2px] ring-[#FCECEF]">
        <X
          weight="bold"
          className="h-[calc(9*var(--u))] w-[calc(9*var(--u))] text-white"
        />
      </span>
    </span>
  );
}

function DownloadCancelledIcon() {
  return (
    <span className="relative inline-flex items-center justify-center">
      <FileText
        weight="regular"
        className="h-[calc(27*var(--u))] w-[calc(27*var(--u))] text-[#8E001C]"
      />
      <span className="absolute -bottom-[calc(2*var(--u))] -right-[calc(4*var(--u))] flex h-[calc(16*var(--u))] w-[calc(16*var(--u))] items-center justify-center rounded-full bg-[#B8001F] ring-[2px] ring-[#FCECEF]">
        <X
          weight="bold"
          className="h-[calc(9.5*var(--u))] w-[calc(9.5*var(--u))] text-white"
        />
      </span>
    </span>
  );
}

/* =========================================================
   VISIT DETAIL PAGE
========================================================= */

export default function VisitDetailPage() {
  const { visitNumber } = useParams<{ visitNumber?: string }>();
  const location = useLocation();
  const { isMobile, isReady, navigateWithTransition } = useAppLayout();

  const [visit, setVisit] = useState(() => getVisitByNumber(visitNumber));

  useEffect(() => {
    setVisit(getVisitByNumber(visitNumber));
  }, [visitNumber, location.key]);

  // Menu Opsi Lainnya Sheet
  const [showMenuSheet, setShowMenuSheet] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // Download Laporan Sheet & States
  const [showDownloadSheet, setShowDownloadSheet] = useState(false);
  const [downloadMounted, setDownloadMounted] = useState(false);
  const [downloadVisible, setDownloadVisible] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<
    "downloading" | "completed"
  >("downloading");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadTotalMb, setDownloadTotalMb] = useState(DEFAULT_DOWNLOAD_MB);
  const [showCancelDownloadModal, setShowCancelDownloadModal] = useState(false);
  const [showDownloadCancelledModal, setShowDownloadCancelledModal] =
    useState(false);

  // Toast / Snackbar
  const [toast, setToast] = useState<{ id: number; message: string } | null>(
    null
  );
  const [isToastClosing, setIsToastClosing] = useState(false);

  const toastAutoRef = useRef<number | null>(null);
  const toastExitRef = useRef<number | null>(null);
  const downloadRafRef = useRef<number | null>(null);
  const downloadCompleteTimerRef = useRef<number | null>(null);
  const downloadElapsedRef = useRef(0);
  const generatedPdfRef = useRef<GeneratedVisitPdf | null>(null);

  const isMobileView = !isReady || isMobile;

  useEffect(() => {
    if (!isMobileView) return;
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((meta) => meta.setAttribute("content", "#83051C"));
  }, [isMobileView]);

  // Transisi Menu Sheet
  useEffect(() => {
    if (showMenuSheet) {
      setMenuMounted(true);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setMenuVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    } else {
      setMenuVisible(false);
      const timer = window.setTimeout(() => {
        setMenuMounted(false);
      }, SHEET_EXIT_MS);
      return () => window.clearTimeout(timer);
    }
  }, [showMenuSheet]);

  // Transisi Download Sheet
  useEffect(() => {
    if (showDownloadSheet) {
      setDownloadMounted(true);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setDownloadVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    } else {
      setDownloadVisible(false);
      const timer = window.setTimeout(() => {
        setDownloadMounted(false);
        setDownloadProgress(0);
        setDownloadStatus("downloading");
        downloadElapsedRef.current = 0;
      }, SHEET_EXIT_MS);
      return () => window.clearTimeout(timer);
    }
  }, [showDownloadSheet]);

  const dismissToast = useCallback(() => {
    if (toastAutoRef.current !== null) {
      window.clearTimeout(toastAutoRef.current);
      toastAutoRef.current = null;
    }
    setIsToastClosing(true);
    if (toastExitRef.current !== null) {
      window.clearTimeout(toastExitRef.current);
    }
    toastExitRef.current = window.setTimeout(() => {
      setToast(null);
      setIsToastClosing(false);
      toastExitRef.current = null;
    }, SNACKBAR_EXIT_MS);
  }, []);

  const triggerToast = useCallback(
    (message: string) => {
      if (toastAutoRef.current !== null) {
        window.clearTimeout(toastAutoRef.current);
      }
      if (toastExitRef.current !== null) {
        window.clearTimeout(toastExitRef.current);
      }
      setIsToastClosing(false);
      setToast({ id: Date.now(), message });
      toastAutoRef.current = window.setTimeout(() => {
        dismissToast();
      }, 3200);
    },
    [dismissToast]
  );

  const revokeGeneratedPdf = useCallback(() => {
    if (generatedPdfRef.current) {
      URL.revokeObjectURL(generatedPdfRef.current.url);
      generatedPdfRef.current = null;
    }
  }, []);

  const stopDownloadTimers = useCallback(() => {
    if (downloadRafRef.current !== null) {
      cancelAnimationFrame(downloadRafRef.current);
      downloadRafRef.current = null;
    }
    if (downloadCompleteTimerRef.current !== null) {
      window.clearTimeout(downloadCompleteTimerRef.current);
      downloadCompleteTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopDownloadTimers();
      revokeGeneratedPdf();
      if (toastAutoRef.current !== null) {
        window.clearTimeout(toastAutoRef.current);
      }
      if (toastExitRef.current !== null) {
        window.clearTimeout(toastExitRef.current);
      }
    };
  }, [stopDownloadTimers, revokeGeneratedPdf]);

  const runDownloadLoop = useCallback(
    (initialElapsed: number) => {
      stopDownloadTimers();
      const startTime = performance.now() - initialElapsed;

      const tick = (now: number) => {
        const elapsed = Math.min(DOWNLOAD_DURATION_MS, now - startTime);
        downloadElapsedRef.current = elapsed;
        const ratio = elapsed / DOWNLOAD_DURATION_MS;
        const eased = 1 - Math.pow(1 - ratio, 1.4);
        const pct = Math.round(eased * 100);
        setDownloadProgress(pct);

        if (ratio < 1) {
          downloadRafRef.current = requestAnimationFrame(tick);
        } else {
          downloadRafRef.current = null;
          downloadCompleteTimerRef.current = window.setTimeout(() => {
            if (generatedPdfRef.current) {
              triggerBrowserPdfDownload(
                generatedPdfRef.current.url,
                generatedPdfRef.current.filename
              );
            }
            setShowCancelDownloadModal(false);
            setShowDownloadCancelledModal(false);
            setDownloadStatus("completed");
            triggerHaptic(14);
            downloadCompleteTimerRef.current = null;
          }, 220);
        }
      };

      downloadRafRef.current = requestAnimationFrame(tick);
    },
    [stopDownloadTimers]
  );

  const handleDownloadPdf = useCallback(async () => {
    triggerHaptic(10);
    stopDownloadTimers();
    revokeGeneratedPdf();

    downloadElapsedRef.current = 0;
    setDownloadProgress(0);
    setDownloadStatus("downloading");
    setShowCancelDownloadModal(false);
    setShowDownloadCancelledModal(false);
    setShowDownloadSheet(true);

    try {
      const pdf = await generateVisitReportPdf(visit);
      generatedPdfRef.current = pdf;
      setDownloadTotalMb(pdf.sizeMb);
      runDownloadLoop(0);
    } catch {
      setShowDownloadSheet(false);
      triggerToast("Gagal menyiapkan file PDF.");
    }
  }, [
    visit,
    stopDownloadTimers,
    revokeGeneratedPdf,
    runDownloadLoop,
    triggerToast,
  ]);

  const handleRequestCancelDownload = useCallback(() => {
    if (downloadStatus === "completed") {
      triggerHaptic(6);
      setShowDownloadSheet(false);
      return;
    }
    triggerHaptic(10);
    stopDownloadTimers();
    setShowCancelDownloadModal(true);
  }, [downloadStatus, stopDownloadTimers]);

  const handleResumeDownload = useCallback(() => {
    setShowCancelDownloadModal(false);
    runDownloadLoop(downloadElapsedRef.current);
  }, [runDownloadLoop]);

  const handleConfirmCancelDownload = useCallback(() => {
    stopDownloadTimers();
    revokeGeneratedPdf();
    setShowCancelDownloadModal(false);
    setShowDownloadCancelledModal(true);
  }, [stopDownloadTimers, revokeGeneratedPdf]);

  const handleCloseDownloadCancelled = useCallback(() => {
    setShowDownloadCancelledModal(false);
    setShowDownloadSheet(false);
  }, []);

  const handleOpenDownloadedFile = useCallback(async () => {
    triggerHaptic(8);
    const pdf = generatedPdfRef.current;
    if (!pdf) {
      setShowDownloadSheet(false);
      return;
    }

    try {
      const file = new File([pdf.blob], pdf.filename, {
        type: "application/pdf",
      });

      if (
        typeof navigator !== "undefined" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `Laporan Kunjungan ${visit.visitNumber}`,
        });
        setShowDownloadSheet(false);
        return;
      }
    } catch (err) {
      // Jika user membatalkan dialog share bawaan OS, cukup tutup sheet
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
    }

    // Fallback untuk browser desktop / browser yang belum mendukung Web Share Files
    window.open(pdf.url, "_blank", "noopener,noreferrer");
    setShowDownloadSheet(false);
    triggerToast(`Membuka ${pdf.filename}...`);
  }, [triggerToast, visit.visitNumber]);

  const handleCloseDownloadSuccess = useCallback(() => {
    triggerHaptic(6);
    setShowDownloadSheet(false);
  }, []);

  const handleBackToDashboard = useCallback(() => {
    triggerHaptic(6);
    navigateWithTransition("/", "back");
  }, [navigateWithTransition]);

  const { rearm: rearmBackGesture } = useBackGesture(true, () => {
    if (showDownloadCancelledModal) {
      triggerHaptic(6);
      handleCloseDownloadCancelled();
      rearmBackGesture();
      return;
    }
    if (showCancelDownloadModal) {
      triggerHaptic(6);
      handleResumeDownload();
      rearmBackGesture();
      return;
    }
    if (showDownloadSheet) {
      handleRequestCancelDownload();
      rearmBackGesture();
      return;
    }
    if (showMenuSheet) {
      triggerHaptic(6);
      setShowMenuSheet(false);
      rearmBackGesture();
      return;
    }
    handleBackToDashboard();
  });

  const handleCopyVisitNumber = async () => {
    triggerHaptic(8);
    setShowMenuSheet(false);
    try {
      await navigator.clipboard?.writeText(visit.visitNumber);
      triggerToast(`Nomor ${visit.visitNumber} berhasil disalin.`);
    } catch {
      triggerToast(`Nomor kunjungan: ${visit.visitNumber}`);
    }
  };

  const handleEditVisit = () => {
    triggerHaptic(8);
    navigateWithTransition(
      `/visits/edit/${encodeURIComponent(visit.visitNumber)}`,
      "forward"
    );
  };

  const visitTypeDisplay = `${VISIT_TYPE_LABELS[visit.visitTypeCode]} (${visit.visitTypeCode})`;
  const downloadedMb = (downloadTotalMb * downloadProgress) / 100;
  const remainingSeconds = Math.max(
    1,
    Math.ceil(((100 - downloadProgress) / 100) * (DOWNLOAD_DURATION_MS / 1000))
  );

  return (
    <main
      style={MOBILE_SCALE_VARS}
      className="min-h-dvh w-full min-w-0 overflow-x-clip bg-white pb-[calc(104*var(--u)+env(safe-area-inset-bottom))]"
    >
      {/* Header Marun */}
      <header className="sticky top-0 z-40 w-full bg-[#83051C] text-white">
        <div className="mx-auto flex w-full max-w-[680px] items-center justify-between gap-[calc(10*var(--u))] px-[calc(14*var(--u))] pb-[calc(14*var(--u))] pt-[calc(env(safe-area-inset-top)+calc(11*var(--u)))]">
          <div className="flex min-w-0 items-center gap-[calc(8*var(--u))]">
            <button
              type="button"
              onClick={handleBackToDashboard}
              aria-label="Kembali ke Dashboard"
              className="flex h-[calc(34*var(--u))] w-[calc(34*var(--u))] shrink-0 items-center justify-center rounded-full text-white transition-colors duration-[260ms] active:bg-white/15"
            >
              <ArrowLeft
                className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                weight="bold"
              />
            </button>

            <h1 className="truncate font-display text-[calc(17.5*var(--u))] font-bold leading-tight tracking-[-0.02em] text-white">
              Detail Kunjungan
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(6);
              setShowMenuSheet(true);
            }}
            aria-label="Opsi lainnya"
            className="flex h-[calc(34*var(--u))] w-[calc(34*var(--u))] shrink-0 items-center justify-center rounded-full text-white transition-colors duration-[260ms] active:bg-white/15"
          >
            <DotsThreeVertical
              weight="bold"
              className="h-[calc(22*var(--u))] w-[calc(22*var(--u))]"
            />
          </button>
        </div>
      </header>

      {/* Body Konten */}
      <div className="moku-detail-enter mx-auto w-full max-w-[680px] space-y-[calc(14*var(--u))] px-[calc(16*var(--u))] pt-[calc(16*var(--u))]">
        {/* 1. Kartu Nomor Kunjungan & Status */}
        <section className="flex items-center justify-between gap-[calc(10*var(--u))] rounded-[calc(16*var(--u))] bg-[#FDF4F5] px-[calc(15*var(--u))] py-[calc(14*var(--u))]">
          <div className="flex min-w-0 flex-1 items-center gap-[calc(12*var(--u))]">
            <CalendarBlank
              weight="regular"
              className="h-[calc(24*var(--u))] w-[calc(24*var(--u))] shrink-0 text-[#8E001C]"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[calc(16*var(--u))] font-bold leading-tight tracking-[-0.015em] text-[#171717]">
                {visit.visitNumber}
              </p>
              <p className="mt-[calc(3*var(--u))] truncate text-[calc(12.5*var(--u))] font-normal text-[#5A555F]">
                {formatIndonesianDate(visit.visitDate)}
              </p>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center gap-[calc(5*var(--u))] rounded-full bg-[#DCF5E3] px-[calc(11*var(--u))] py-[calc(5*var(--u))] text-[calc(12*var(--u))] font-bold text-[#15803D]">
            <Check
              weight="bold"
              className="h-[calc(13*var(--u))] w-[calc(13*var(--u))]"
            />
            {visit.status}
          </span>
        </section>

        {/* 2. Kartu Unit Mesin */}
        <section className="flex items-center gap-[calc(14*var(--u))] rounded-[calc(16*var(--u))] bg-[#F7F7F9] px-[calc(15*var(--u))] py-[calc(13*var(--u))]">
          <div className="flex h-[calc(52*var(--u))] w-[calc(52*var(--u))] shrink-0 items-center justify-center rounded-[calc(13*var(--u))] bg-white shadow-[0_1px_4px_rgba(23,23,23,0.06)]">
            <Printer
              weight="duotone"
              className="h-[calc(28*var(--u))] w-[calc(28*var(--u))] text-[#8E001C]"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[calc(16*var(--u))] font-bold leading-tight text-[#171717]">
              {visit.machineCode}
            </p>
            <p className="mt-[calc(3*var(--u))] truncate text-[calc(12.5*var(--u))] font-normal text-[#5A555F]">
              {visit.machineModel}
            </p>
          </div>
        </section>

        {/* 3. Kartu Informasi Detail */}
        <section className="divide-y divide-[#ECECF0] rounded-[calc(16*var(--u))] bg-[#F7F7F9] px-[calc(15*var(--u))]">
          <div className="grid grid-cols-[calc(20*var(--u))_calc(102*var(--u))_calc(10*var(--u))_minmax(0,1fr)] items-start gap-x-[calc(8*var(--u))] py-[calc(12*var(--u))] text-[calc(12.5*var(--u))]">
            <Buildings
              weight="regular"
              className="mt-[calc(1*var(--u))] h-[calc(18*var(--u))] w-[calc(18*var(--u))] text-[#8E001C]"
            />
            <span className="font-normal text-[#5A555F]">Pelanggan</span>
            <span className="text-[#5A555F]">:</span>
            <span className="font-bold text-[#171717]">
              {visit.customerName}
            </span>
          </div>

          <div className="grid grid-cols-[calc(20*var(--u))_calc(102*var(--u))_calc(10*var(--u))_minmax(0,1fr)] items-start gap-x-[calc(8*var(--u))] py-[calc(12*var(--u))] text-[calc(12.5*var(--u))]">
            <MapPin
              weight="regular"
              className="mt-[calc(1*var(--u))] h-[calc(18*var(--u))] w-[calc(18*var(--u))] text-[#8E001C]"
            />
            <span className="font-normal text-[#5A555F]">Lokasi</span>
            <span className="text-[#5A555F]">:</span>
            <span className="font-semibold leading-[1.38] text-[#171717]">
              {visit.location}
            </span>
          </div>

          <div className="grid grid-cols-[calc(20*var(--u))_calc(102*var(--u))_calc(10*var(--u))_minmax(0,1fr)] items-start gap-x-[calc(8*var(--u))] py-[calc(12*var(--u))] text-[calc(12.5*var(--u))]">
            <User
              weight="regular"
              className="mt-[calc(1*var(--u))] h-[calc(18*var(--u))] w-[calc(18*var(--u))] text-[#8E001C]"
            />
            <span className="font-normal text-[#5A555F]">Teknisi</span>
            <span className="text-[#5A555F]">:</span>
            <span className="font-bold text-[#171717]">
              {visit.technicianName}
            </span>
          </div>

          <div className="grid grid-cols-[calc(20*var(--u))_calc(102*var(--u))_calc(10*var(--u))_minmax(0,1fr)] items-start gap-x-[calc(8*var(--u))] py-[calc(12*var(--u))] text-[calc(12.5*var(--u))]">
            <VisitTypeDetailIcon
              code={visit.visitTypeCode}
              className="mt-[calc(1*var(--u))] h-[calc(18*var(--u))] w-[calc(18*var(--u))] text-[#8E001C]"
            />
            <span className="font-normal text-[#5A555F]">Jenis Kunjungan</span>
            <span className="text-[#5A555F]">:</span>
            <span className="font-bold leading-[1.35] text-[#171717]">
              {visitTypeDisplay}
            </span>
          </div>
        </section>

        {/* 4. Deskripsi Aktivitas (Paragraf Biasa) */}
        <section className="pt-[calc(4*var(--u))]">
          <div className="mb-[calc(8*var(--u))] flex items-center gap-[calc(8*var(--u))]">
            <FileText
              weight="regular"
              className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] text-[#8E001C]"
            />
            <h2 className="font-display text-[calc(14.5*var(--u))] font-bold tracking-[-0.015em] text-[#171717]">
              Deskripsi Aktivitas
            </h2>
          </div>

          <div className="rounded-[calc(16*var(--u))] bg-[#F7F7F9] px-[calc(15*var(--u))] py-[calc(13*var(--u))]">
            <p className="whitespace-pre-line text-[calc(13*var(--u))] leading-[1.5] text-[#29232A]">
              {visit.activityDescription?.trim() || "-"}
            </p>
          </div>
        </section>

        {/* 5. Tindakan / Catatan Teknisi */}
        <section className="pt-[calc(4*var(--u))]">
          <div className="mb-[calc(8*var(--u))] flex items-center gap-[calc(8*var(--u))]">
            <Wrench
              weight="regular"
              className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] text-[#8E001C]"
            />
            <h2 className="font-display text-[calc(14.5*var(--u))] font-bold tracking-[-0.015em] text-[#171717]">
              Tindakan / Catatan Teknisi
            </h2>
          </div>

          <div className="rounded-[calc(16*var(--u))] border border-[#E6E6EC] bg-white px-[calc(15*var(--u))] py-[calc(13*var(--u))]">
            <p className="whitespace-pre-line text-[calc(13*var(--u))] leading-[1.5] text-[#29232A]">
              {visit.technicianNotes?.trim() ||
                "Tidak ada catatan teknisi tambahan."}
            </p>
          </div>
        </section>

        {/* 6. Tombol Aksi Bawah (2 Kolom, Flat) */}
        <section className="grid grid-cols-2 gap-[calc(10*var(--u))] pt-[calc(8*var(--u))]">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex min-h-[calc(46*var(--u))] items-center justify-center gap-[calc(6*var(--u))] rounded-[calc(13*var(--u))] border border-[#8E001C] bg-white px-[calc(10*var(--u))] py-[calc(10*var(--u))] font-display text-[calc(13*var(--u))] font-semibold text-[#8E001C] transition-[transform,background-color] duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] active:bg-[#FDF2F4]"
          >
            <DownloadSimple
              weight="bold"
              className="h-[calc(17*var(--u))] w-[calc(17*var(--u))] shrink-0"
            />
            <span className="truncate">Unduh Laporan</span>
          </button>

          <button
            type="button"
            onClick={handleEditVisit}
            style={{ color: "#FFFFFF" }}
            className="flex min-h-[calc(46*var(--u))] items-center justify-center gap-[calc(6*var(--u))] rounded-[calc(13*var(--u))] bg-[#8E001C] px-[calc(10*var(--u))] py-[calc(10*var(--u))] font-display text-[calc(13*var(--u))] font-semibold text-white transition-[transform,background-color] duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] active:bg-[#730217]"
          >
            <PencilSimple
              weight="regular"
              className="h-[calc(17*var(--u))] w-[calc(17*var(--u))] shrink-0"
            />
            <span className="truncate">Ubah Kunjungan</span>
          </button>
        </section>
      </div>

      {/* Bottom Sheet Unduh Laporan (Mengunduh -> Berhasil Diunduh) */}
      {downloadMounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={MOBILE_SCALE_VARS}
            role="dialog"
            aria-modal="true"
            aria-label={
              downloadStatus === "completed"
                ? "Laporan Berhasil Diunduh"
                : "Mengunduh Laporan"
            }
            className="fixed inset-0 z-[9999] flex items-end justify-center select-none [-webkit-touch-callout:none] [-webkit-user-select:none]"
          >
            <div
              onClick={handleRequestCancelDownload}
              style={{
                opacity: downloadVisible ? 0.45 : 0,
                transition: "opacity 360ms ease-out",
              }}
              className="fixed inset-0 bg-black backdrop-blur-[1.5px]"
            />

            <div
              style={{
                transform: downloadVisible
                  ? "translate3d(0, 0, 0)"
                  : "translate3d(0, 105%, 0)",
                transition: downloadVisible
                  ? "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)"
                  : "transform 360ms cubic-bezier(0.32, 0.72, 0, 1)",
              }}
              className="relative z-10 w-full max-w-[600px] rounded-t-[calc(24*var(--u))] bg-white px-[calc(20*var(--u))] pb-[calc(26px+env(safe-area-inset-bottom))] pt-[calc(12*var(--u))] shadow-[0_-8px_30px_rgba(23,23,23,0.18)]"
            >
              {/* Drag Handle */}
              <div className="mx-auto mb-[calc(20*var(--u))] h-[calc(4*var(--u))] w-[calc(40*var(--u))] rounded-full bg-[#DCDCE2]" />

              {downloadStatus === "completed" ? (
                <div className="moku-detail-enter">
                  {/* Header PDF + Badge Centang Hijau */}
                  <div className="flex items-center gap-[calc(14*var(--u))]">
                    <div className="relative flex h-[calc(60*var(--u))] w-[calc(60*var(--u))] shrink-0 items-center justify-center rounded-full bg-[#FCECEF]">
                      <FilePdf
                        weight="regular"
                        className="h-[calc(30*var(--u))] w-[calc(30*var(--u))] text-[#C8102E]"
                      />
                      <span className="absolute -bottom-[calc(1*var(--u))] -right-[calc(1*var(--u))] flex h-[calc(21*var(--u))] w-[calc(21*var(--u))] items-center justify-center rounded-full bg-[#1E9E3E] ring-[2.5px] ring-white">
                        <Check
                          weight="bold"
                          className="h-[calc(12*var(--u))] w-[calc(12*var(--u))] text-white"
                        />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-[calc(17*var(--u))] font-bold leading-tight tracking-[-0.015em] text-[#171717]">
                        Laporan Berhasil Diunduh
                      </h3>
                      <p className="mt-[calc(4*var(--u))] text-[calc(13*var(--u))] font-normal leading-[1.42] text-[#5A555F]">
                        File {visit.visitNumber}.pdf berhasil disimpan di
                        perangkat Anda.
                      </p>
                    </div>
                  </div>

                  {/* Tombol Aksi (Flat) */}
                  <div className="mt-[calc(22*var(--u))] flex flex-col gap-[calc(11*var(--u))]">
                    <button
                      type="button"
                      onClick={handleOpenDownloadedFile}
                      style={{ color: "#FFFFFF" }}
                      className="flex min-h-[calc(46*var(--u))] w-full items-center justify-center gap-[calc(8*var(--u))] rounded-[calc(12*var(--u))] bg-[#8E001C] px-[calc(16*var(--u))] py-[calc(10*var(--u))] font-display text-[calc(14.5*var(--u))] font-semibold text-white transition-[transform,background-color] duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.985] active:bg-[#730217]"
                    >
                      <ArrowSquareOut
                        weight="bold"
                        className="h-[calc(18*var(--u))] w-[calc(18*var(--u))] shrink-0"
                      />
                      Buka File
                    </button>

                    <button
                      type="button"
                      onClick={handleCloseDownloadSuccess}
                      className="flex min-h-[calc(46*var(--u))] w-full items-center justify-center rounded-[calc(12*var(--u))] border border-[#8E001C] bg-white px-[calc(16*var(--u))] py-[calc(10*var(--u))] font-display text-[calc(14.5*var(--u))] font-semibold text-[#8E001C] transition-[transform,background-color] duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.985] active:bg-[#FDF2F4]"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header PDF + Judul */}
                  <div className="flex items-center gap-[calc(14*var(--u))]">
                    <div className="flex h-[calc(58*var(--u))] w-[calc(58*var(--u))] shrink-0 items-center justify-center rounded-full bg-[#FCECEF]">
                      <FilePdf
                        weight="regular"
                        className="h-[calc(30*var(--u))] w-[calc(30*var(--u))] text-[#C8102E]"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-[calc(17*var(--u))] font-bold leading-tight tracking-[-0.015em] text-[#171717]">
                        Mengunduh Laporan
                      </h3>
                      <p className="mt-[calc(4*var(--u))] truncate text-[calc(13.5*var(--u))] font-normal text-[#5A555F]">
                        {visit.visitNumber}.pdf
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-[calc(22*var(--u))]">
                    <div className="h-[calc(8*var(--u))] w-full overflow-hidden rounded-full bg-[#E5E5EA]">
                      <div
                        style={{ width: `${downloadProgress}%` }}
                        className="h-full rounded-full bg-[#8E001C] transition-[width] duration-100 ease-out"
                      />
                    </div>

                    {/* Metadata Progres */}
                    <div className="mt-[calc(10*var(--u))] flex items-center justify-between gap-[calc(10*var(--u))] text-[calc(12.5*var(--u))] font-normal tabular-nums text-[#4A454F]">
                      <span>
                        {formatMb(downloadedMb)} MB /{" "}
                        {formatMb(downloadTotalMb)} MB ({downloadProgress}%)
                      </span>
                      <span className="text-[#6E6873]">
                        {downloadProgress >= 100
                          ? "Selesai"
                          : `~ ${remainingSeconds} detik lagi`}
                      </span>
                    </div>
                  </div>

                  {/* Tombol Batal (Outline, Flat) */}
                  <button
                    type="button"
                    onClick={handleRequestCancelDownload}
                    className="mt-[calc(22*var(--u))] flex min-h-[calc(46*var(--u))] w-full items-center justify-center rounded-[calc(12*var(--u))] border border-[#8E001C] bg-white px-[calc(16*var(--u))] py-[calc(10*var(--u))] font-display text-[calc(14.5*var(--u))] font-semibold text-[#8E001C] transition-[transform,background-color] duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.985] active:bg-[#FDF2F4]"
                  >
                    Batal
                  </button>
                </>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Modal Konfirmasi Batalkan Unduhan */}
      <MokuModalDialog
        isOpen={showCancelDownloadModal}
        title="Batalkan Unduhan?"
        description="Proses unduh laporan akan dihentikan dan file tidak tersimpan."
        confirmLabel="Ya, Batalkan"
        cancelLabel="Tidak"
        tone="danger"
        icon={<CancelDownloadIcon />}
        onConfirm={handleConfirmCancelDownload}
        onCancel={handleResumeDownload}
      />

      {/* Modal Info Unduhan Dibatalkan */}
      <MokuModalDialog
        isOpen={showDownloadCancelledModal}
        title="Unduhan Dibatalkan"
        description="Laporan tidak jadi diunduh."
        confirmLabel="OK"
        hideCancel
        tone="danger"
        icon={<DownloadCancelledIcon />}
        onConfirm={handleCloseDownloadCancelled}
        onCancel={handleCloseDownloadCancelled}
      />

      {/* Bottom Sheet Menu Opsi Lainnya */}
      {menuMounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={MOBILE_SCALE_VARS}
            role="dialog"
            aria-modal="true"
            aria-label="Opsi Detail Kunjungan"
            className="fixed inset-0 z-[9999] flex items-end justify-center"
          >
            <div
              onClick={() => setShowMenuSheet(false)}
              style={{
                opacity: menuVisible ? 0.45 : 0,
                transition: "opacity 360ms ease-out",
              }}
              className="fixed inset-0 bg-black backdrop-blur-[1.5px]"
            />

            <div
              style={{
                transform: menuVisible
                  ? "translate3d(0, 0, 0)"
                  : "translate3d(0, 105%, 0)",
                transition: menuVisible
                  ? "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)"
                  : "transform 360ms cubic-bezier(0.32, 0.72, 0, 1)",
              }}
              className="relative z-10 w-full max-w-[600px] rounded-t-[calc(24*var(--u))] bg-white px-[calc(18*var(--u))] pb-[calc(24px+env(safe-area-inset-bottom))] pt-[calc(10*var(--u))] shadow-[0_-8px_30px_rgba(23,23,23,0.18)]"
            >
              <div className="mx-auto mb-[calc(12*var(--u))] h-[calc(4*var(--u))] w-[calc(40*var(--u))] rounded-full bg-[#DCDCE2]" />

              <div className="mb-[calc(8*var(--u))] flex items-center justify-between">
                <h3 className="font-display text-[calc(15.5*var(--u))] font-bold text-[#171717]">
                  Opsi Kunjungan
                </h3>
                <button
                  type="button"
                  onClick={() => setShowMenuSheet(false)}
                  aria-label="Tutup"
                  className="flex h-[calc(32*var(--u))] w-[calc(32*var(--u))] items-center justify-center rounded-full text-[#5A555F] transition-colors duration-[260ms] active:bg-[#F2F2F5]"
                >
                  <X
                    weight="bold"
                    className="h-[calc(18*var(--u))] w-[calc(18*var(--u))]"
                  />
                </button>
              </div>

              <div className="divide-y divide-[#EFEFF2]">
                <button
                  type="button"
                  onClick={handleCopyVisitNumber}
                  className="flex w-full items-center gap-[calc(12*var(--u))] py-[calc(13*var(--u))] text-left text-[calc(14*var(--u))] font-medium text-[#171717] transition-colors duration-[260ms] active:bg-[#F7F7F9]"
                >
                  <Copy
                    weight="regular"
                    className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#8E001C]"
                  />
                  Salin Nomor Kunjungan
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenuSheet(false);
                    handleDownloadPdf();
                  }}
                  className="flex w-full items-center gap-[calc(12*var(--u))] py-[calc(13*var(--u))] text-left text-[calc(14*var(--u))] font-medium text-[#171717] transition-colors duration-[260ms] active:bg-[#F7F7F9]"
                >
                  <ShareNetwork
                    weight="regular"
                    className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#8E001C]"
                  />
                  Bagikan Ringkasan Laporan
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Snackbar Feedback */}
      {toast &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            key={toast.id}
            style={MOBILE_SCALE_VARS}
            role="status"
            aria-live="polite"
            className={`fixed bottom-[calc(78px+env(safe-area-inset-bottom))] left-4 right-4 z-[9998] mx-auto flex max-w-[600px] items-center gap-[calc(10*var(--u))] rounded-[calc(12*var(--u))] bg-[#22252A] px-[calc(14*var(--u))] py-[calc(11*var(--u))] text-white shadow-[0_8px_22px_rgba(0,0,0,0.26)] ${
              isToastClosing
                ? "moku-toast-exit pointer-events-none"
                : "moku-toast-enter"
            }`}
          >
            <CheckCircle
              weight="fill"
              className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0 text-[#22C55E]"
            />
            <span className="truncate text-[calc(12.5*var(--u))] font-medium text-white">
              {toast.message}
            </span>
          </div>,
          document.body
        )}

      <style>{`
        .moku-detail-enter {
          animation: moku-detail-in 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .moku-toast-enter {
          animation: moku-toast-up 380ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .moku-toast-exit {
          animation: moku-toast-down 320ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
        @keyframes moku-detail-in {
          from {
            opacity: 0;
            transform: translate3d(0, 10px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes moku-toast-up {
          from {
            opacity: 0;
            transform: translate3d(0, 16px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes moku-toast-down {
          from {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
          to {
            opacity: 0;
            transform: translate3d(0, 16px, 0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .moku-detail-enter,
          .moku-toast-enter,
          .moku-toast-exit {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
