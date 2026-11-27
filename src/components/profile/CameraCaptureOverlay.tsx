import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type TouchEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  CameraRotate,
  Image as ImageIcon,
  Info,
  Lightning,
  LightningA,
  LightningSlash,
  WarningCircle,
} from "@phosphor-icons/react";

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

const CLOSE_ANIMATION_MS = 260;
const EDGE_SWIPE_ZONE_PX = 48;
const DISMISS_DISTANCE_PX = 76;
const DISMISS_VELOCITY_PX_MS = 0.35;

type FlashMode = "auto" | "on" | "off";

interface CameraCaptureOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  onOpenGallery: () => void;
}

function triggerHaptic(duration = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(duration);
  }
}

export default function CameraCaptureOverlay({
  isOpen,
  onClose,
  onCapture,
  onOpenGallery,
}: CameraCaptureOverlayProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const circleGuideRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const isClosingRef = useRef(false);
  const guardEntryActiveRef = useRef(false);
  const lockedUrlRef = useRef<string>("");

  const swipeStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    active: boolean;
    direction: 1 | -1;
    lockedHorizontal: boolean;
  }>({
    x: 0,
    y: 0,
    time: 0,
    active: false,
    direction: 1,
    lockedHorizontal: false,
  });

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [flashMode, setFlashMode] = useState<FlashMode>("auto");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashingScreen, setIsFlashingScreen] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Fungsi penutup visual tunggal — identik untuk tombol Back & Swipe-Back
  const closeOverlayVisual = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    triggerHaptic(6);
    stopStream();
    setIsDragging(false);
    setIsExiting(true);

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      isClosingRef.current = false;
      setIsExiting(false);
      setDragX(0);
      onClose();
    }, CLOSE_ANIMATION_MS);
  }, [onClose, stopStream]);

  // Dipanggil dari tombol panah kiri atas atau gestur swipe layar
  const handleBackAction = useCallback(() => {
    if (isClosingRef.current) return;
    if (guardEntryActiveRef.current) {
      guardEntryActiveRef.current = false;
      window.history.replaceState({ mokuBase: true }, "", lockedUrlRef.current);
    }
    closeOverlayVisual();
  }, [closeOverlayVisual]);

  const startCamera = useCallback(
    async (targetFacing: "user" | "environment") => {
      stopStream();
      setCameraReady(false);
      setCameraError(null);

      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setCameraError("Perangkat atau browser tidak mendukung akses kamera.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetFacing },
            width: { ideal: 1280 },
            height: { ideal: 1280 },
          },
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch {
        setCameraError(
          "Izin kamera ditolak atau kamera sedang digunakan aplikasi lain."
        );
      }
    },
    [stopStream]
  );

  useEffect(() => {
    if (!isOpen) {
      stopStream();
      setCameraReady(false);
      setDragX(0);
      setIsDragging(false);
      setIsExiting(false);
      isClosingRef.current = false;
      return;
    }

    isClosingRef.current = false;
    setDragX(0);
    setIsDragging(false);
    setIsExiting(false);

    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((meta) => meta.setAttribute("content", "#000000"));

    startCamera(facingMode);

    return () => {
      stopStream();
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      metas.forEach((meta) => meta.setAttribute("content", "#740319"));
    };
  }, [facingMode, isOpen, startCamera, stopStream]);

  // Pasang anchor state + overlay state pada URL saat ini agar system swipe-back menutup kamera dan kembali ke Ubah Informasi Akun
  useEffect(() => {
    if (!isOpen) return;

    lockedUrlRef.current = window.location.href;
    window.history.replaceState({ mokuBase: true }, "", lockedUrlRef.current);
    window.history.pushState(
      { mokuCameraOverlay: true },
      "",
      lockedUrlRef.current
    );
    guardEntryActiveRef.current = true;

    const handlePopState = (ev: PopStateEvent) => {
      ev.stopImmediatePropagation();
      if (guardEntryActiveRef.current) {
        guardEntryActiveRef.current = false;
        closeOverlayVisual();
      }
    };

    const handleIonBack = (ev: Event) => {
      ev.stopImmediatePropagation();
      const customEv = ev as CustomEvent<{
        register: (priority: number, handler: () => void) => void;
      }>;
      if (customEv.detail?.register) {
        customEv.detail.register(9999, () => {
          handleBackAction();
        });
      } else {
        handleBackAction();
      }
    };

    window.addEventListener("popstate", handlePopState, true);
    document.addEventListener("ionBackButton", handleIonBack, true);

    return () => {
      window.removeEventListener("popstate", handlePopState, true);
      document.removeEventListener("ionBackButton", handleIonBack, true);
      if (guardEntryActiveRef.current) {
        guardEntryActiveRef.current = false;
        window.history.replaceState({ mokuBase: true }, "", lockedUrlRef.current);
      }
    };
  }, [closeOverlayVisual, handleBackAction, isOpen]);

  useEffect(() => {
    const stream = streamRef.current;
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track || !track.getCapabilities) return;

    const caps = track.getCapabilities() as MediaTrackCapabilities & {
      torch?: boolean;
    };
    if (caps.torch && facingMode === "environment") {
      track
        .applyConstraints({
          advanced: [{ torch: flashMode === "on" } as MediaTrackConstraintSet],
        })
        .catch(() => {});
    }
  }, [flashMode, facingMode, cameraReady]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (isClosingRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const vw = window.innerWidth;
    const isFromLeftEdge = touch.clientX <= EDGE_SWIPE_ZONE_PX;
    const isFromRightEdge = touch.clientX >= vw - EDGE_SWIPE_ZONE_PX;

    if (!isFromLeftEdge && !isFromRightEdge) {
      swipeStartRef.current.active = false;
      return;
    }

    swipeStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: performance.now(),
      active: true,
      direction: isFromLeftEdge ? 1 : -1,
      lockedHorizontal: false,
    };
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    const state = swipeStartRef.current;
    if (!state.active || isClosingRef.current || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const rawDx = touch.clientX - state.x;
    const dy = touch.clientY - state.y;
    const inwardDelta = rawDx * state.direction;

    if (!state.lockedHorizontal) {
      if (Math.abs(dy) > Math.abs(rawDx) && Math.abs(dy) > 10) {
        state.active = false;
        setIsDragging(false);
        setDragX(0);
        return;
      }
      if (inwardDelta > 10) {
        state.lockedHorizontal = true;
        setIsDragging(true);
      } else {
        return;
      }
    }

    setDragX(Math.max(0, inwardDelta));
  };

  const handleTouchEnd = () => {
    const state = swipeStartRef.current;
    if (!state.active) return;
    state.active = false;

    if (!state.lockedHorizontal) {
      setIsDragging(false);
      setDragX(0);
      return;
    }

    const elapsed = Math.max(1, performance.now() - state.time);
    const velocity = dragX / elapsed;

    if (dragX >= DISMISS_DISTANCE_PX || velocity >= DISMISS_VELOCITY_PX_MS) {
      handleBackAction();
    } else {
      setIsDragging(false);
      setDragX(0);
    }
  };

  const handleCycleFlash = () => {
    triggerHaptic(6);
    setFlashMode((prev) =>
      prev === "auto" ? "on" : prev === "on" ? "off" : "auto"
    );
  };

  const handleSwitchCamera = () => {
    triggerHaptic(8);
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleTakeSnapshot = () => {
    const video = videoRef.current;
    const circleEl = circleGuideRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !cameraReady || isClosingRef.current) return;

    triggerHaptic([10, 20, 10]);

    if (flashMode === "on" || (flashMode === "auto" && facingMode === "user")) {
      setIsFlashingScreen(true);
      window.setTimeout(() => setIsFlashingScreen(false), 180);
    }

    const vw = video.videoWidth || 720;
    const vh = video.videoHeight || 720;

    const videoRect = video.getBoundingClientRect();
    const circleRect = circleEl?.getBoundingClientRect();

    let sx = (vw - Math.min(vw, vh)) / 2;
    let sy = (vh - Math.min(vw, vh)) / 2;
    let sSize = Math.min(vw, vh);

    if (
      circleRect &&
      videoRect.width > 0 &&
      videoRect.height > 0 &&
      circleRect.width > 0
    ) {
      const scale = Math.max(videoRect.width / vw, videoRect.height / vh);
      const renderedWidth = vw * scale;
      const renderedHeight = vh * scale;
      const offsetX = (renderedWidth - videoRect.width) / 2;
      const offsetY = (renderedHeight - videoRect.height) / 2;

      const circleLeftInVideo = circleRect.left - videoRect.left + offsetX;
      const circleTopInVideo = circleRect.top - videoRect.top + offsetY;

      sSize = circleRect.width / scale;
      sx = circleLeftInVideo / scale;
      sy = circleTopInVideo / scale;

      if (facingMode === "user") {
        sx = vw - sx - sSize;
      }

      sSize = Math.min(sSize, vw, vh);
      sx = Math.max(0, Math.min(vw - sSize, sx));
      sy = Math.max(0, Math.min(vh - sSize, sy));
    }

    canvas.width = 720;
    canvas.height = 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(
      video,
      sx,
      sy,
      sSize,
      sSize,
      0,
      0,
      canvas.width,
      canvas.height
    );
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    stopStream();
    if (guardEntryActiveRef.current) {
      guardEntryActiveRef.current = false;
      window.history.replaceState({ mokuBase: true }, "", lockedUrlRef.current);
    }
    onCapture(dataUrl);
  };

  const overlayStyle: CSSProperties = {
    ...MOBILE_SCALE_VARS,
    transform: isExiting
      ? "translate3d(100%, 0, 0)"
      : dragX > 0
      ? `translate3d(${dragX}px, 0, 0)`
      : undefined,
    opacity: isExiting ? 0.6 : dragX > 0 ? Math.max(0.55, 1 - dragX / 480) : 1,
    transition: isDragging
      ? "none"
      : `transform ${CLOSE_ANIMATION_MS}ms cubic-bezier(0.25, 1, 0.5, 1), opacity ${CLOSE_ANIMATION_MS}ms cubic-bezier(0.25, 1, 0.5, 1)`,
  };

  return createPortal(
    <div
      style={overlayStyle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Ambil Foto"
      className="moku-cam-enter fixed inset-0 z-[9999] flex flex-col justify-between bg-black text-white select-none"
    >
      {isFlashingScreen && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 bg-white/90 transition-opacity duration-150"
        />
      )}

      {/* Top Bar + Instruksi Pill */}
      <div
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 12 * var(--u))",
          paddingBottom: "calc(14 * var(--u))",
        }}
        className="relative z-20 flex flex-col bg-black px-[calc(12*var(--u))]"
      >
        <div className="mx-auto flex w-full max-w-[680px] items-center justify-between">
          <div className="flex items-center gap-[calc(8*var(--u))]">
            <button
              type="button"
              onClick={handleBackAction}
              aria-label="Kembali"
              className="flex h-[calc(40*var(--u))] w-[calc(40*var(--u))] cursor-pointer items-center justify-center rounded-full text-white transition-[transform,background-color] duration-200 active:scale-90 active:bg-white/15"
            >
              <ArrowLeft
                weight="regular"
                className="h-[calc(22*var(--u))] w-[calc(22*var(--u))]"
              />
            </button>
            <h2
              style={{ margin: 0 }}
              className="font-display text-[calc(19*var(--u))] font-bold tracking-[-0.015em] text-white"
            >
              Ambil Foto
            </h2>
          </div>

          <button
            type="button"
            onClick={handleCycleFlash}
            aria-label={`Mode Flash: ${flashMode}`}
            className="flex h-[calc(40*var(--u))] w-[calc(40*var(--u))] cursor-pointer items-center justify-center rounded-full text-white transition-[transform,background-color] duration-200 active:scale-90 active:bg-white/15"
          >
            {flashMode === "auto" && (
              <LightningA
                weight="regular"
                className="h-[calc(22*var(--u))] w-[calc(22*var(--u))]"
              />
            )}
            {flashMode === "on" && (
              <Lightning
                weight="fill"
                className="h-[calc(22*var(--u))] w-[calc(22*var(--u))] text-[#FACC15]"
              />
            )}
            {flashMode === "off" && (
              <LightningSlash
                weight="regular"
                className="h-[calc(22*var(--u))] w-[calc(22*var(--u))] text-white/70"
              />
            )}
          </button>
        </div>

        <div
          style={{ marginTop: "calc(12 * var(--u))" }}
          className="mx-auto flex items-center gap-[calc(8*var(--u))] rounded-full bg-[#1F1F23] px-[calc(14*var(--u))] py-[calc(7*var(--u))]"
        >
          <Info
            weight="regular"
            className="h-[calc(17*var(--u))] w-[calc(17*var(--u))] shrink-0 text-white"
          />
          <span className="text-[calc(12.5*var(--u))] font-normal text-white/95">
            Posisikan wajah Anda di dalam lingkaran
          </span>
        </div>
      </div>

      {/* Area Viewfinder Kamera + Grid 3x3 + Lingkaran Panduan */}
      <div className="relative mx-auto flex w-full max-w-[680px] flex-1 items-center justify-center overflow-hidden bg-[#17171A]">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            facingMode === "user" ? "-scale-x-100" : ""
          } ${cameraReady ? "opacity-100" : "opacity-0"}`}
        />

        {!cameraError && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="absolute inset-y-0 left-1/3 w-[1px] bg-white/35" />
            <div className="absolute inset-y-0 left-2/3 w-[1px] bg-white/35" />
            <div className="absolute inset-x-0 top-1/3 h-[1px] bg-white/35" />
            <div className="absolute inset-x-0 top-2/3 h-[1px] bg-white/35" />

            <div
              ref={circleGuideRef}
              style={{
                width: "min(84vw, 336 * var(--u))",
                height: "min(84vw, 336 * var(--u))",
              }}
              className="rounded-full border-[calc(2*var(--u))] border-white/95 shadow-[0_0_0_9999px_rgba(0,0,0,0.42)]"
            />
          </div>
        )}

        {cameraError && (
          <div className="relative z-10 mx-[calc(24*var(--u))] flex max-w-[340px] flex-col items-center rounded-[calc(16*var(--u))] bg-[#1F1F23] p-[calc(20*var(--u))] text-center">
            <WarningCircle
              weight="fill"
              className="mb-[calc(10*var(--u))] h-[calc(32*var(--u))] w-[calc(32*var(--u))] text-[#F87171]"
            />
            <p
              style={{ margin: 0, marginBottom: "calc(14 * var(--u))" }}
              className="text-[calc(13*var(--u))] leading-relaxed text-white/90"
            >
              {cameraError}
            </p>
            <button
              type="button"
              onClick={() => {
                stopStream();
                if (guardEntryActiveRef.current) {
                  guardEntryActiveRef.current = false;
                  window.history.replaceState({ mokuBase: true }, "", lockedUrlRef.current);
                }
                onOpenGallery();
              }}
              className="cursor-pointer rounded-[calc(10*var(--u))] bg-[#740319] px-[calc(16*var(--u))] py-[calc(10*var(--u))] text-[calc(13*var(--u))] font-semibold text-white active:bg-[#5B0213]"
            >
              Pilih dari Galeri
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls: Switch Camera | Shutter | Gallery */}
      <div
        style={{
          paddingTop: "calc(22 * var(--u))",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 26 * var(--u))",
        }}
        className="relative z-20 bg-black px-[calc(28*var(--u))]"
      >
        <div className="mx-auto flex w-full max-w-[420px] items-center justify-between">
          <button
            type="button"
            onClick={handleSwitchCamera}
            aria-label="Ganti Kamera"
            className="flex h-[calc(48*var(--u))] w-[calc(48*var(--u))] cursor-pointer items-center justify-center rounded-full text-white transition-[transform,background-color] duration-200 active:scale-90 active:bg-white/15"
          >
            <CameraRotate
              weight="regular"
              className="h-[calc(28*var(--u))] w-[calc(28*var(--u))]"
            />
          </button>

          <button
            type="button"
            onClick={handleTakeSnapshot}
            disabled={!cameraReady}
            aria-label="Jepret Foto"
            style={{
              width: "calc(72 * var(--u))",
              height: "calc(72 * var(--u))",
            }}
            className="flex cursor-pointer items-center justify-center rounded-full border-[calc(3*var(--u))] border-white p-[calc(4*var(--u))] transition-transform duration-150 active:scale-92 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <span className="h-full w-full rounded-full bg-white" />
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(6);
              stopStream();
              if (guardEntryActiveRef.current) {
                guardEntryActiveRef.current = false;
                window.history.replaceState({ mokuBase: true }, "", lockedUrlRef.current);
              }
              onOpenGallery();
            }}
            aria-label="Pilih dari Galeri"
            className="flex h-[calc(48*var(--u))] w-[calc(48*var(--u))] cursor-pointer items-center justify-center rounded-full text-white transition-[transform,background-color] duration-200 active:scale-90 active:bg-white/15"
          >
            <ImageIcon
              weight="regular"
              className="h-[calc(26*var(--u))] w-[calc(26*var(--u))]"
            />
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        .moku-cam-enter {
          animation: moku-cam-in 320ms cubic-bezier(0.25, 1, 0.5, 1) both;
        }
        @keyframes moku-cam-in {
          from {
            opacity: 0;
            transform: translate3d(24px, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
