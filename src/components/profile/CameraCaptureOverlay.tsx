import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
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

const CLOSE_ANIMATION_MS = 180;
const SWIPE_TRIGGER_PX = 54;
const SWIPE_VELOCITY_PX_MS = 0.25;

type FlashMode = "auto" | "on" | "off";

interface FocusIndicatorState {
  id: number;
  x: number;
  y: number;
}

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
  const viewfinderRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const circleGuideRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const isClosingRef = useRef(false);
  const hasGuardEntryRef = useRef(false);

  const swipeRef = useRef<{
    x: number;
    y: number;
    time: number;
    tracking: boolean;
    swiping: boolean;
  }>({
    x: 0,
    y: 0,
    time: 0,
    tracking: false,
    swiping: false,
  });

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [flashMode, setFlashMode] = useState<FlashMode>("auto");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashingScreen, setIsFlashingScreen] = useState(false);
  const [focusIndicator, setFocusIndicator] =
    useState<FocusIndicatorState | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Tutup overlay secara langsung agar tidak melewati layar EditAccountInfoPage
  const closeImmediately = useCallback(
    (afterClose?: () => void) => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      hasGuardEntryRef.current = false;
      stopStream();
      setIsDragging(false);
      setIsExiting(false);
      setDragX(0);
      setPreviewUrl(null);
      setFocusIndicator(null);
      onClose();
      window.setTimeout(() => {
        isClosingRef.current = false;
        afterClose?.();
      }, 0);
    },
    [onClose, stopStream]
  );

  const triggerOverlayClose = useCallback(
    (afterClose?: () => void) => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      hasGuardEntryRef.current = false;
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
        setPreviewUrl(null);
        setFocusIndicator(null);
        onClose();
        afterClose?.();
      }, CLOSE_ANIMATION_MS);
    },
    [onClose, stopStream]
  );

  const handleRetakePhoto = useCallback(() => {
    if (isClosingRef.current) return;
    triggerHaptic(6);
    setDragX(0);
    setIsDragging(false);
    setPreviewUrl(null);
  }, []);

  const triggerBackAction = useCallback(() => {
    if (isClosingRef.current) return;
    if (previewUrl) {
      handleRetakePhoto();
    } else {
      triggerOverlayClose();
    }
  }, [handleRetakePhoto, previewUrl, triggerOverlayClose]);

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

        const videoEl = videoRef.current;
        if (videoEl) {
          videoEl.srcObject = stream;
          setCameraReady(true);
          try {
            await videoEl.play();
          } catch {
            // Frame tetap dapat diambil selama srcObject tersedia
          }
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
      setPreviewUrl(null);
      setFocusIndicator(null);
      setDragX(0);
      setIsDragging(false);
      setIsExiting(false);
      isClosingRef.current = false;
      hasGuardEntryRef.current = false;
      return;
    }

    isClosingRef.current = false;
    setPreviewUrl(null);
    setFocusIndicator(null);
    setDragX(0);
    setIsDragging(false);
    setIsExiting(false);

    if (typeof window !== "undefined" && !hasGuardEntryRef.current) {
      window.history.pushState(
        { mokuCameraOverlayGuard: true },
        "",
        window.location.href
      );
      hasGuardEntryRef.current = true;
    }

    return () => {
      stopStream();
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [isOpen, stopStream]);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

    const handlePopState = (ev: PopStateEvent) => {
      if (isClosingRef.current) return;
      if (hasGuardEntryRef.current) {
        hasGuardEntryRef.current = false;
        ev.stopImmediatePropagation();
      }
      if (previewUrl) {
        handleRetakePhoto();
      } else {
        closeImmediately();
      }
    };

    const handleIonBack = (ev: Event) => {
      if (isClosingRef.current) return;
      ev.stopImmediatePropagation();
      const customEv = ev as CustomEvent<{
        register: (priority: number, handler: () => void) => void;
      }>;
      if (customEv.detail?.register) {
        customEv.detail.register(9999, () => {
          if (previewUrl) {
            handleRetakePhoto();
          } else {
            closeImmediately();
          }
        });
      } else if (previewUrl) {
        handleRetakePhoto();
      } else {
        closeImmediately();
      }
    };

    window.addEventListener("popstate", handlePopState, true);
    document.addEventListener("ionBackButton", handleIonBack, true);

    return () => {
      window.removeEventListener("popstate", handlePopState, true);
      document.removeEventListener("ionBackButton", handleIonBack, true);
    };
  }, [closeImmediately, handleRetakePhoto, isOpen, previewUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((meta) =>
      meta.setAttribute("content", previewUrl ? "#740319" : "#000000")
    );
    return () => {
      metas.forEach((meta) => meta.setAttribute("content", "#740319"));
    };
  }, [isOpen, previewUrl]);

  useEffect(() => {
    if (!isOpen || previewUrl) {
      stopStream();
      setCameraReady(false);
      return;
    }

    startCamera(facingMode);

    return () => {
      stopStream();
    };
  }, [facingMode, isOpen, previewUrl, startCamera, stopStream]);

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

  const handleViewfinderPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (cameraError || isClosingRef.current || swipeRef.current.swiping) {
      return;
    }
    const container = viewfinderRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const localX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const localY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    triggerHaptic(5);
    setFocusIndicator({
      id: Date.now(),
      x: localX,
      y: localY,
    });

    const track = streamRef.current?.getVideoTracks()[0];
    if (track && track.getCapabilities && track.applyConstraints) {
      const caps = track.getCapabilities() as MediaTrackCapabilities & {
        focusMode?: string[];
      };
      const constraints: Record<string, unknown>[] = [];

      const normX =
        facingMode === "user" ? 1 - localX / rect.width : localX / rect.width;
      const normY = localY / rect.height;

      if (Array.isArray(caps.focusMode)) {
        if (caps.focusMode.includes("single-shot")) {
          constraints.push({
            focusMode: "single-shot",
            pointsOfInterest: [{ x: normX, y: normY }],
          });
        } else if (caps.focusMode.includes("continuous")) {
          constraints.push({
            focusMode: "continuous",
            pointsOfInterest: [{ x: normX, y: normY }],
          });
        }
      }

      if (constraints.length > 0) {
        track
          .applyConstraints({
            advanced: constraints as MediaTrackConstraintSet[],
          })
          .catch(() => {});
      }
    }
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (isClosingRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    swipeRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: performance.now(),
      tracking: true,
      swiping: false,
    };
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    const state = swipeRef.current;
    if (!state.tracking || isClosingRef.current || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const dx = touch.clientX - state.x;
    const dy = touch.clientY - state.y;

    if (!state.swiping) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) {
        state.tracking = false;
        setIsDragging(false);
        setDragX(0);
        return;
      }
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        state.swiping = true;
        setFocusIndicator(null);
        setIsDragging(true);
      } else {
        return;
      }
    }

    setDragX(Math.abs(dx));
  };

  const handleTouchEnd = () => {
    const state = swipeRef.current;
    if (!state.tracking) return;
    const wasSwiping = state.swiping;
    state.tracking = false;
    state.swiping = false;

    if (!wasSwiping) {
      setIsDragging(false);
      setDragX(0);
      return;
    }

    const elapsed = Math.max(1, performance.now() - state.time);
    const velocity = dragX / elapsed;

    if (dragX >= SWIPE_TRIGGER_PX || velocity >= SWIPE_VELOCITY_PX_MS) {
      triggerBackAction();
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
    if (!video || !canvas || isClosingRef.current) return;

    const hasStreamFrame =
      cameraReady || video.videoWidth > 0 || video.readyState >= 2;
    if (!hasStreamFrame) return;

    triggerHaptic([10, 20, 10]);

    if (flashMode === "on" || (flashMode === "auto" && facingMode === "user")) {
      setIsFlashingScreen(true);
      window.setTimeout(() => setIsFlashingScreen(false), 200);
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
    setPreviewUrl(dataUrl);
  };

  const handleUsePhoto = () => {
    if (!previewUrl || isClosingRef.current) return;
    triggerHaptic([8, 25, 10]);
    const finalUrl = previewUrl;
    triggerOverlayClose(() => {
      onCapture(finalUrl);
    });
  };

  const overlayStyle: CSSProperties = {
    ...MOBILE_SCALE_VARS,
    WebkitTouchCallout: "none",
    transform: isExiting
      ? "translate3d(100%, 0, 0)"
      : dragX > 0
      ? `translate3d(${dragX}px, 0, 0)`
      : undefined,
    opacity: isExiting ? 0 : dragX > 0 ? Math.max(0.6, 1 - dragX / 420) : 1,
    transition: isDragging
      ? "none"
      : `transform ${CLOSE_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${CLOSE_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
  };

  if (previewUrl) {
    return createPortal(
      <div
        style={overlayStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onContextMenu={(e) => e.preventDefault()}
        role="dialog"
        aria-modal="true"
        aria-label="Pratinjau Foto"
        className="moku-preview-enter fixed inset-0 z-[9999] flex flex-col justify-between bg-white text-[#171717] select-none"
      >
        <header className="w-full bg-[#740319] text-white">
          <div
            style={{
              paddingTop: "calc(env(safe-area-inset-top) + 12 * var(--u))",
              paddingBottom: "calc(12 * var(--u))",
            }}
            className="mx-auto flex w-full max-w-[680px] items-center gap-[calc(8*var(--u))] px-[calc(12*var(--u))]"
          >
            <button
              type="button"
              onClick={triggerBackAction}
              aria-label="Kembali"
              className="flex h-[calc(40*var(--u))] w-[calc(40*var(--u))] shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-[transform,background-color] duration-200 active:scale-90 active:bg-white/15"
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
              Pratinjau Foto
            </h2>
          </div>
        </header>

        <div className="moku-preview-content mx-auto flex w-full max-w-[680px] flex-1 flex-col items-center justify-center px-[calc(24*var(--u))] text-center">
          <div
            style={{
              width: "min(76vw, 312 * var(--u))",
              height: "min(76vw, 312 * var(--u))",
              marginBottom: "calc(28 * var(--u))",
            }}
            className="overflow-hidden rounded-full bg-[#F3F4F6] shadow-[0_6px_24px_rgba(0,0,0,0.08)]"
          >
            <img
              src={previewUrl}
              alt="Pratinjau Foto Profil"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              className="h-full w-full object-cover"
            />
          </div>

          <p
            style={{ margin: 0 }}
            className="max-w-[260px] text-[calc(13.5*var(--u))] font-normal leading-relaxed text-[#6B6B76]"
          >
            Pastikan foto sudah sesuai untuk digunakan sebagai foto profil.
          </p>
        </div>

        <div
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom) + 24 * var(--u))",
          }}
          className="moku-preview-actions mx-auto w-full max-w-[680px] space-y-[calc(12*var(--u))] px-[calc(16*var(--u))]"
        >
          <button
            type="button"
            onClick={handleUsePhoto}
            className="flex min-h-[calc(48*var(--u))] w-full cursor-pointer items-center justify-center rounded-[calc(12*var(--u))] bg-[#740319] px-[calc(16*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(14.5*var(--u))] font-semibold text-white transition-[transform,background-color] duration-200 active:scale-[0.985] active:bg-[#5B0213]"
          >
            Gunakan Foto
          </button>

          <button
            type="button"
            onClick={handleRetakePhoto}
            className="flex min-h-[calc(48*var(--u))] w-full cursor-pointer items-center justify-center rounded-[calc(12*var(--u))] border-[1.5px] border-[#740319] bg-white px-[calc(16*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(14.5*var(--u))] font-semibold text-[#740319] transition-[transform,background-color] duration-200 active:scale-[0.985] active:bg-[#FDF2F4]"
          >
            Ambil Ulang
          </button>
        </div>

        <style>{`
          .moku-preview-enter {
            animation: moku-preview-fade 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
          }
          .moku-preview-content {
            animation: moku-preview-circle 360ms cubic-bezier(0.22, 1, 0.36, 1) both;
          }
          .moku-preview-actions {
            animation: moku-preview-btns 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
          }
          @keyframes moku-preview-fade {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes moku-preview-circle {
            from {
              opacity: 0;
              transform: scale(0.92) translate3d(0, 12px, 0);
            }
            to {
              opacity: 1;
              transform: scale(1) translate3d(0, 0, 0);
            }
          }
          @keyframes moku-preview-btns {
            from {
              opacity: 0;
              transform: translate3d(0, 18px, 0);
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

  return createPortal(
    <div
      style={overlayStyle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
      role="dialog"
      aria-modal="true"
      aria-label="Ambil Foto"
      className="moku-cam-enter fixed inset-0 z-[9999] flex flex-col justify-between bg-black text-white select-none"
    >
      {isFlashingScreen && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 bg-white/85 transition-opacity duration-200"
        />
      )}

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
              onClick={triggerBackAction}
              aria-label="Kembali"
              className="flex h-[calc(40*var(--u))] w-[calc(40*var(--u))] shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-[transform,background-color] duration-200 active:scale-90 active:bg-white/15"
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

      <div
        ref={viewfinderRef}
        onPointerDown={handleViewfinderPointerDown}
        onContextMenu={(e) => e.preventDefault()}
        className="relative mx-auto flex w-full max-w-[680px] flex-1 cursor-crosshair items-center justify-center overflow-hidden bg-[#17171A]"
      >
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          onLoadedMetadata={() => setCameraReady(true)}
          onCanPlay={() => setCameraReady(true)}
          style={{ WebkitTouchCallout: "none" }}
          className={`pointer-events-none h-full w-full object-cover select-none transition-opacity duration-300 ${
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

        {focusIndicator && !cameraError && (
          <div
            key={focusIndicator.id}
            aria-hidden="true"
            style={{
              left: `${focusIndicator.x}px`,
              top: `${focusIndicator.y}px`,
              width: "calc(64 * var(--u))",
              height: "calc(64 * var(--u))",
              transform: "translate3d(-50%, -50%, 0)",
            }}
            className="moku-focus-ring pointer-events-none absolute z-20 rounded-full border-[calc(1.5*var(--u))] border-[#FACC15] shadow-[0_0_0_1px_rgba(0,0,0,0.45)]"
          />
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
                triggerOverlayClose(() => {
                  onOpenGallery();
                });
              }}
              className="cursor-pointer rounded-[calc(10*var(--u))] bg-[#740319] px-[calc(16*var(--u))] py-[calc(10*var(--u))] text-[calc(13*var(--u))] font-semibold text-white active:bg-[#5B0213]"
            >
              Pilih dari Galeri
            </button>
          </div>
        )}
      </div>

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
            aria-label="Jepret Foto"
            style={{
              width: "calc(72 * var(--u))",
              height: "calc(72 * var(--u))",
            }}
            className="flex cursor-pointer items-center justify-center rounded-full border-[calc(3*var(--u))] border-white p-[calc(4*var(--u))] transition-transform duration-150 active:scale-92"
          >
            <span className="h-full w-full rounded-full bg-white" />
          </button>

          <button
            type="button"
            onClick={() => {
              triggerOverlayClose(() => {
                onOpenGallery();
              });
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
          animation: moku-cam-in 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .moku-focus-ring {
          animation: moku-focus-pulse 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
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
        @keyframes moku-focus-pulse {
          0% {
            opacity: 0.95;
            transform: translate3d(-50%, -50%, 0) scale(1.25);
          }
          45% {
            opacity: 1;
            transform: translate3d(-50%, -50%, 0) scale(0.95);
          }
          100% {
            opacity: 0;
            transform: translate3d(-50%, -50%, 0) scale(1);
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
