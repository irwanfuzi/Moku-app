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
  ArrowClockwise,
  ArrowLeft,
  Camera,
  CameraRotate,
  Image as ImageIcon,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  User,
} from "@phosphor-icons/react";

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

const CLOSE_ANIMATION_MS = 260;
const EDGE_SWIPE_ZONE_PX = 40;
const DISMISS_DISTANCE_PX = 76;
const DISMISS_VELOCITY_PX_MS = 0.35;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

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
  const streamRef = useRef<MediaStream | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cropStageRef = useRef<HTMLDivElement | null>(null);
  const cropCircleRef = useRef<HTMLDivElement | null>(null);
  const cropImageRef = useRef<HTMLImageElement | null>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const closeTimerRef = useRef<number | null>(null);
  const isClosingRef = useRef(false);
  const guardActiveRef = useRef(false);
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

  const panRef = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>({
    dragging: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1.15);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isPanning, setIsPanning] = useState(false);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  }, []);

  const resetAdjustState = useCallback(() => {
    setCapturedUrl(null);
    setZoom(1.15);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  }, []);

  const startCameraStream = useCallback(
    async (mode: "user" | "environment") => {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        setCameraError("Kamera tidak didukung di perangkat ini.");
        setCameraReady(false);
        return;
      }

      stopCameraStream();
      setCameraError(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1080 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraReady(true);
      } catch {
        setCameraError("Izin kamera belum aktif atau kamera tidak tersedia.");
        setCameraReady(false);
      }
    },
    [stopCameraStream]
  );

  const triggerOverlayClose = useCallback(
    (afterClose?: () => void) => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      guardActiveRef.current = false;
      triggerHaptic(6);
      stopCameraStream();
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
        resetAdjustState();
        onClose();
        afterClose?.();
      }, CLOSE_ANIMATION_MS);
    },
    [onClose, resetAdjustState, stopCameraStream]
  );

  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      resetAdjustState();
      setDragX(0);
      setIsDragging(false);
      setIsExiting(false);
      isClosingRef.current = false;
      guardActiveRef.current = false;
      return;
    }

    isClosingRef.current = false;
    resetAdjustState();
    setDragX(0);
    setIsDragging(false);
    setIsExiting(false);
    startCameraStream(facingMode);

    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((meta) => meta.setAttribute("content", "#740319"));

    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      stopCameraStream();
    };
  }, [
    facingMode,
    isOpen,
    resetAdjustState,
    startCameraStream,
    stopCameraStream,
  ]);

  useEffect(() => {
    if (!isOpen) return;

    lockedUrlRef.current = window.location.href;
    window.history.pushState(
      { mokuCameraOverlay: true },
      "",
      lockedUrlRef.current
    );
    guardActiveRef.current = true;

    const handlePopState = (ev: PopStateEvent) => {
      if (!guardActiveRef.current) return;
      ev.stopImmediatePropagation();

      window.history.pushState(
        { mokuCameraRestored: true },
        "",
        lockedUrlRef.current
      );
      if (capturedUrl) {
        triggerHaptic(6);
        resetAdjustState();
      } else {
        triggerOverlayClose();
      }
    };

    const handleIonBack = (ev: Event) => {
      if (!guardActiveRef.current) return;
      ev.stopImmediatePropagation();
      const customEv = ev as CustomEvent<{
        register: (priority: number, handler: () => void) => void;
      }>;
      if (customEv.detail?.register) {
        customEv.detail.register(9999, () => {
          if (capturedUrl) {
            resetAdjustState();
          } else {
            triggerOverlayClose();
          }
        });
      } else if (capturedUrl) {
        resetAdjustState();
      } else {
        triggerOverlayClose();
      }
    };

    window.addEventListener("popstate", handlePopState, true);
    document.addEventListener("ionBackButton", handleIonBack, true);

    return () => {
      window.removeEventListener("popstate", handlePopState, true);
      document.removeEventListener("ionBackButton", handleIonBack, true);
      guardActiveRef.current = false;
    };
  }, [capturedUrl, isOpen, resetAdjustState, triggerOverlayClose]);

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
    if (!state.active || isClosingRef.current || e.touches.length !== 1) {
      return;
    }

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
      if (capturedUrl) {
        triggerHaptic(6);
        setIsDragging(false);
        setDragX(0);
        resetAdjustState();
      } else {
        triggerOverlayClose();
      }
    } else {
      setIsDragging(false);
      setDragX(0);
    }
  };

  const handleBackButtonClick = () => {
    if (isClosingRef.current) return;
    if (capturedUrl) {
      triggerHaptic(6);
      resetAdjustState();
    } else {
      triggerOverlayClose();
    }
  };

  const handleSwitchCamera = () => {
    if (isClosingRef.current) return;
    triggerHaptic(7);
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleShutterClick = () => {
    if (isClosingRef.current) return;
    triggerHaptic([8, 20, 8]);

    const video = videoRef.current;
    const canvas = captureCanvasRef.current;

    if (video && videoReady(video) && canvas) {
      const vw = video.videoWidth || 720;
      const vh = video.videoHeight || 720;
      const side = Math.min(vw, vh);
      const sx = (vw - side) / 2;
      const sy = (vh - side) / 2;

      canvas.width = 720;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.save();
        if (facingMode === "user") {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(
          video,
          sx,
          sy,
          side,
          side,
          0,
          0,
          canvas.width,
          canvas.height
        );
        ctx.restore();

        const shotUrl = canvas.toDataURL("image/jpeg", 0.92);
        stopCameraStream();
        setZoom(1.15);
        setRotation(0);
        setOffset({ x: 0, y: 0 });
        setCapturedUrl(shotUrl);
        return;
      }
    }

    stopCameraStream();
    setZoom(1.15);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    setCapturedUrl(buildFallbackAvatarDataUrl());
  };

  const handleRotateClockwise = () => {
    triggerHaptic(7);
    setRotation((prev) => prev + 90);
  };

  const handlePanPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!capturedUrl) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsPanning(true);
    panRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  };

  const handlePanPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!panRef.current.dragging) return;
    const dx = e.clientX - panRef.current.startX;
    const dy = e.clientY - panRef.current.startY;
    const maxPan = 180 * zoom;
    setOffset({
      x: Math.max(-maxPan, Math.min(maxPan, panRef.current.originX + dx)),
      y: Math.max(-maxPan, Math.min(maxPan, panRef.current.originY + dy)),
    });
  };

  const handlePanPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!panRef.current.dragging) return;
    panRef.current.dragging = false;
    setIsPanning(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleSaveAdjustedPhoto = () => {
    const imgEl = cropImageRef.current;
    const circleEl = cropCircleRef.current;
    const canvas = exportCanvasRef.current;
    if (!capturedUrl || !imgEl || !circleEl || !canvas || isClosingRef.current) {
      return;
    }

    triggerHaptic([8, 25, 10]);

    const natW = imgEl.naturalWidth || 720;
    const natH = imgEl.naturalHeight || 720;
    const circleRect = circleEl.getBoundingClientRect();
    const circleSizePx = Math.max(1, circleRect.width);

    canvas.width = 720;
    canvas.height = 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const imgRect = imgEl.getBoundingClientRect();
    const imgCenterX = imgRect.left + imgRect.width / 2;
    const imgCenterY = imgRect.top + imgRect.height / 2;
    const circleCenterX = circleRect.left + circleRect.width / 2;
    const circleCenterY = circleRect.top + circleRect.height / 2;

    const outputScale = canvas.width / circleSizePx;
    const baseFitScale = Math.max(
      circleSizePx / Math.max(1, natW),
      circleSizePx / Math.max(1, natH)
    );

    const relCenterX = (imgCenterX - circleCenterX) * outputScale;
    const relCenterY = (imgCenterY - circleCenterY) * outputScale;
    const normalizedDeg = ((rotation % 360) + 360) % 360;

    ctx.save();
    ctx.translate(
      canvas.width / 2 + relCenterX,
      canvas.height / 2 + relCenterY
    );
    ctx.rotate((normalizedDeg * Math.PI) / 180);
    ctx.scale(
      zoom * outputScale * baseFitScale,
      zoom * outputScale * baseFitScale
    );
    ctx.drawImage(imgEl, -natW / 2, -natH / 2, natW, natH);
    ctx.restore();

    const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.92);
    triggerOverlayClose(() => {
      onCapture(croppedDataUrl);
    });
  };

  const overlayStyle: CSSProperties = {
    ...MOBILE_SCALE_VARS,
    WebkitTouchCallout: "none",
    WebkitUserSelect: "none",
    transform: isExiting
      ? "translate3d(100%, 0, 0)"
      : dragX > 0
      ? `translate3d(${dragX}px, 0, 0)`
      : undefined,
    opacity: isExiting ? 0 : dragX > 0 ? Math.max(0.55, 1 - dragX / 480) : 1,
    transition: isDragging
      ? "none"
      : `transform ${CLOSE_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${CLOSE_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
  };

  if (capturedUrl) {
    const zoomPercent = Math.round(
      ((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100
    );

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
        aria-label="Sesuaikan Foto"
        className="moku-cam-enter fixed inset-0 z-[9999] flex flex-col justify-between bg-[#1F1F23] text-white select-none"
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
              onClick={handleBackButtonClick}
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
              Sesuaikan Foto
            </h2>
          </div>
        </header>

        <div
          ref={cropStageRef}
          onPointerDown={handlePanPointerDown}
          onPointerMove={handlePanPointerMove}
          onPointerUp={handlePanPointerUp}
          onPointerCancel={handlePanPointerUp}
          onContextMenu={(e) => e.preventDefault()}
          style={{ touchAction: "none" }}
          className="relative mx-auto flex w-full max-w-[680px] flex-1 cursor-grab flex-col items-center justify-center overflow-hidden bg-[#26262A] active:cursor-grabbing"
        >
          <img
            ref={cropImageRef}
            src={capturedUrl}
            alt="Sesuaikan Foto Profil"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              width: "min(86vw, 356 * var(--u))",
              height: "min(86vw, 356 * var(--u))",
              transform: `translate3d(${offset.x}px, ${offset.y}px, 0) rotate(${rotation}deg) scale(${zoom})`,
              transition: isPanning
                ? "none"
                : "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            className="pointer-events-none object-cover select-none"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div
              ref={cropCircleRef}
              style={{
                width: "min(86vw, 356 * var(--u))",
                height: "min(86vw, 356 * var(--u))",
              }}
              className="relative overflow-hidden rounded-full border-[calc(2*var(--u))] border-white/95 shadow-[0_0_0_9999px_rgba(0,0,0,0.48)]"
            >
              <div className="absolute inset-y-0 left-1/3 w-[1px] bg-white/35" />
              <div className="absolute inset-y-0 left-2/3 w-[1px] bg-white/35" />
              <div className="absolute inset-x-0 top-1/3 h-[1px] bg-white/35" />
              <div className="absolute inset-x-0 top-2/3 h-[1px] bg-white/35" />
            </div>
          </div>

          <p
            style={{
              margin: 0,
              marginTop: "calc(22 * var(--u))",
            }}
            className="relative z-10 max-w-[270px] text-center text-[calc(13*var(--u))] font-normal leading-relaxed text-white/90"
          >
            Atur posisi, ukuran, dan rotasi foto agar sesuai dengan lingkaran
            avatar.
          </p>
        </div>

        <div
          style={{
            paddingTop: "calc(18 * var(--u))",
            paddingBottom: "calc(env(safe-area-inset-bottom) + 22 * var(--u))",
          }}
          className="w-full bg-white px-[calc(16*var(--u))] text-[#171717]"
        >
          <div className="mx-auto w-full max-w-[680px]">
            <div
              style={{ marginBottom: "calc(20 * var(--u))" }}
              className="mx-auto flex w-full max-w-[520px] items-center gap-[calc(12*var(--u))]"
            >
              <div className="flex min-w-0 flex-1 items-center gap-[calc(12*var(--u))]">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(5);
                    setZoom((prev) =>
                      Math.max(MIN_ZOOM, Number((prev - 0.2).toFixed(2)))
                    );
                  }}
                  aria-label="Perkecil Foto"
                  className="flex h-[calc(32*var(--u))] w-[calc(32*var(--u))] shrink-0 cursor-pointer items-center justify-center rounded-full text-[#171717] transition-transform active:scale-90 active:bg-[#F4F4F7]"
                >
                  <MagnifyingGlassMinus
                    weight="regular"
                    className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                  />
                </button>

                <div className="relative flex flex-1 items-center">
                  <div className="h-[calc(4*var(--u))] w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                    <div
                      style={{ width: `${zoomPercent}%` }}
                      className="h-full bg-[#740319] transition-[width] duration-100"
                    />
                  </div>
                  <input
                    type="range"
                    min={MIN_ZOOM}
                    max={MAX_ZOOM}
                    step={0.02}
                    value={zoom}
                    aria-label="Tingkat Zoom Foto"
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  <div
                    aria-hidden="true"
                    style={{
                      left: `calc(${zoomPercent}% - 8 * var(--u))`,
                      width: "calc(16 * var(--u))",
                      height: "calc(16 * var(--u))",
                    }}
                    className="pointer-events-none absolute rounded-full border-[calc(3*var(--u))] border-[#740319] bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(5);
                    setZoom((prev) =>
                      Math.min(MAX_ZOOM, Number((prev + 0.2).toFixed(2)))
                    );
                  }}
                  aria-label="Perbesar Foto"
                  className="flex h-[calc(32*var(--u))] w-[calc(32*var(--u))] shrink-0 cursor-pointer items-center justify-center rounded-full text-[#171717] transition-transform active:scale-90 active:bg-[#F4F4F7]"
                >
                  <MagnifyingGlassPlus
                    weight="regular"
                    className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={handleRotateClockwise}
                aria-label="Putar Searah Jarum Jam"
                style={{
                  width: "calc(54 * var(--u))",
                  height: "calc(40 * var(--u))",
                }}
                className="flex shrink-0 cursor-pointer items-center justify-center rounded-[calc(10*var(--u))] bg-[#F3F4F6] text-[#171717] transition-[transform,background-color] duration-200 active:scale-92 active:bg-[#E5E7EB]"
              >
                <ArrowClockwise
                  weight="bold"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-[calc(12*var(--u))]">
              <button
                type="button"
                onClick={handleBackButtonClick}
                className="flex h-[calc(46*var(--u))] w-full cursor-pointer items-center justify-center rounded-[calc(10*var(--u))] border-[1.5px] border-[#740319] bg-white px-[calc(14*var(--u))] font-display text-[calc(14*var(--u))] font-semibold text-[#740319] transition-[transform,background-color] duration-200 active:scale-[0.985] active:bg-[#FDF2F4]"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveAdjustedPhoto}
                className="flex h-[calc(46*var(--u))] w-full cursor-pointer items-center justify-center rounded-[calc(10*var(--u))] bg-[#740319] px-[calc(14*var(--u))] font-display text-[calc(14*var(--u))] font-semibold text-white transition-[transform,background-color] duration-200 active:scale-[0.985] active:bg-[#5B0213]"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>

        <canvas ref={exportCanvasRef} className="hidden" />

        <style>{`
          .moku-cam-enter {
            animation: moku-cam-in 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
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
      className="moku-cam-enter fixed inset-0 z-[9999] flex flex-col justify-between bg-[#141417] text-white select-none"
    >
      <header className="w-full bg-[#740319] text-white">
        <div
          style={{
            paddingTop: "calc(env(safe-area-inset-top) + 12 * var(--u))",
            paddingBottom: "calc(12 * var(--u))",
          }}
          className="mx-auto flex w-full max-w-[680px] items-center justify-between gap-[calc(8*var(--u))] px-[calc(12*var(--u))]"
        >
          <div className="flex items-center gap-[calc(8*var(--u))]">
            <button
              type="button"
              onClick={handleBackButtonClick}
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
            onClick={handleSwitchCamera}
            aria-label="Ganti Kamera"
            className="flex h-[calc(40*var(--u))] w-[calc(40*var(--u))] shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-[transform,background-color] duration-200 active:scale-90 active:bg-white/15"
          >
            <CameraRotate
              weight="regular"
              className="h-[calc(21*var(--u))] w-[calc(21*var(--u))]"
            />
          </button>
        </div>
      </header>

      <div className="relative mx-auto flex w-full max-w-[680px] flex-1 flex-col items-center justify-center overflow-hidden bg-[#19191E]">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{
            transform: facingMode === "user" ? "scaleX(-1)" : undefined,
          }}
          className={`h-full w-full object-cover transition-opacity duration-200 ${
            cameraReady ? "opacity-100" : "opacity-0"
          }`}
        />

        {!cameraReady && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-[calc(24*var(--u))] text-center">
            <div
              style={{
                width: "min(76vw, 290 * var(--u))",
                height: "min(76vw, 290 * var(--u))",
              }}
              className="flex items-center justify-center rounded-full border-[calc(2.5*var(--u))] border-white/80 bg-white/5"
            >
              <User
                weight="fill"
                className="h-[calc(92*var(--u))] w-[calc(92*var(--u))] text-white/30"
              />
            </div>

            {cameraError && (
              <p
                style={{ margin: 0, marginTop: "calc(16 * var(--u))" }}
                className="max-w-[280px] text-[calc(12.5*var(--u))] text-white/80"
              >
                {cameraError}
              </p>
            )}
          </div>
        )}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        >
          <div
            style={{
              width: "min(76vw, 290 * var(--u))",
              height: "min(76vw, 290 * var(--u))",
            }}
            className="rounded-full border-[calc(2*var(--u))] border-white/75"
          />
          <p
            style={{ margin: 0, marginTop: "calc(14 * var(--u))" }}
            className="text-[calc(12.5*var(--u))] font-normal text-white/85"
          >
            Posisikan wajah di dalam lingkaran
          </p>
        </div>
      </div>

      <div
        style={{
          paddingTop: "calc(18 * var(--u))",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 22 * var(--u))",
        }}
        className="w-full bg-[#141417] px-[calc(24*var(--u))]"
      >
        <div className="mx-auto flex w-full max-w-[680px] items-center justify-between">
          <button
            type="button"
            onClick={() => {
              triggerOverlayClose(() => {
                onOpenGallery();
              });
            }}
            aria-label="Buka Galeri"
            className="flex h-[calc(44*var(--u))] w-[calc(44*var(--u))] cursor-pointer items-center justify-center rounded-full bg-white/12 text-white transition-[transform,background-color] duration-200 active:scale-90 active:bg-white/20"
          >
            <ImageIcon
              weight="regular"
              className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
            />
          </button>

          <button
            type="button"
            onClick={handleShutterClick}
            aria-label="Ambil Foto Sekarang"
            style={{
              width: "calc(68 * var(--u))",
              height: "calc(68 * var(--u))",
            }}
            className="flex cursor-pointer items-center justify-center rounded-full border-[calc(3*var(--u))] border-white bg-[#740319] text-white transition-[transform,background-color] duration-200 active:scale-92 active:bg-[#5B0213]"
          >
            <Camera
              weight="fill"
              className="h-[calc(26*var(--u))] w-[calc(26*var(--u))]"
            />
          </button>

          <div className="w-[calc(44*var(--u))]" aria-hidden="true" />
        </div>
      </div>

      <canvas ref={captureCanvasRef} className="hidden" />

      <style>{`
        .moku-cam-enter {
          animation: moku-cam-in 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
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

function videoReady(video: HTMLVideoElement): boolean {
  return video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0;
}

function buildFallbackAvatarDataUrl(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#FCECEF";
  ctx.fillRect(0, 0, 720, 720);

  ctx.fillStyle = "#740319";
  ctx.beginPath();
  ctx.arc(360, 275, 110, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(360, 620, 220, Math.PI, 0);
  ctx.fill();

  return canvas.toDataURL("image/jpeg", 0.92);
                        }
