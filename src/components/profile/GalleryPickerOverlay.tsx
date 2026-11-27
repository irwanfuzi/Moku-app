import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type PointerEvent,
  type TouchEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  ArrowClockwise,
  ArrowLeft,
  Check,
  Image as ImageIcon,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
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

interface DevicePhotoItem {
  id: string;
  src: string;
  label: string;
}

interface GalleryPickerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto: (dataUrl: string) => void;
}

function triggerHaptic(duration = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(duration);
  }
}

export default function GalleryPickerOverlay({
  isOpen,
  onClose,
  onSelectPhoto,
}: GalleryPickerOverlayProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  const [devicePhotos, setDevicePhotos] = useState<DevicePhotoItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  // Mode layar Sesuaikan Foto setelah tombol "Gunakan Foto" diklik
  const [adjustingUrl, setAdjustingUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1.15);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isPanning, setIsPanning] = useState(false);

  const selectedItem = useMemo(
    () => devicePhotos.find((item) => item.id === selectedId) ?? null,
    [devicePhotos, selectedId]
  );

  const selectedCount = selectedItem ? 1 : 0;

  const openDevicePicker = useCallback(() => {
    triggerHaptic(6);
    fileInputRef.current?.click();
  }, []);

  const resetAdjustState = useCallback(() => {
    setAdjustingUrl(null);
    setZoom(1.15);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  }, []);

  const triggerOverlayClose = useCallback(
    (afterClose?: () => void) => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      guardActiveRef.current = false;
      triggerHaptic(6);
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
    [onClose, resetAdjustState]
  );

  useEffect(() => {
    if (!isOpen) {
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

    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((meta) => meta.setAttribute("content", "#740319"));

    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [isOpen, resetAdjustState]);

  // Samakan perilaku system swipe-back & hardware back dengan tombol back kiri atas
  useEffect(() => {
    if (!isOpen) return;

    lockedUrlRef.current = window.location.href;
    window.history.pushState(
      { mokuGalleryOverlay: true },
      "",
      lockedUrlRef.current
    );
    guardActiveRef.current = true;

    const handlePopState = (ev: PopStateEvent) => {
      if (!guardActiveRef.current) return;
      ev.stopImmediatePropagation();

      window.history.pushState(
        { mokuGalleryRestored: true },
        "",
        lockedUrlRef.current
      );
      if (adjustingUrl) {
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
          if (adjustingUrl) {
            resetAdjustState();
          } else {
            triggerOverlayClose();
          }
        });
      } else if (adjustingUrl) {
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
  }, [adjustingUrl, isOpen, resetAdjustState, triggerOverlayClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (adjustingUrl || isClosingRef.current || e.touches.length !== 1) return;
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
    if (
      adjustingUrl ||
      !state.active ||
      isClosingRef.current ||
      e.touches.length !== 1
    ) {
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
      triggerOverlayClose();
    } else {
      setIsDragging(false);
      setDragX(0);
    }
  };

  const handleDeviceFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) return;
      const newId = `gal-${Date.now()}`;
      const newItem: DevicePhotoItem = {
        id: newId,
        src: result,
        label: file.name || "Foto Galeri",
      };
      triggerHaptic([8, 20, 8]);
      setDevicePhotos((prev) => [newItem, ...prev]);
      setSelectedId(newId);
    };
    reader.readAsDataURL(file);
  };

  const handleStartAdjustPhoto = () => {
    if (!selectedItem || isClosingRef.current) return;
    triggerHaptic(8);
    setZoom(1.15);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    setAdjustingUrl(selectedItem.src);
  };

  // Putar searah jarum jam bertahap: 90, 180, 270, 360, dst.
  const handleRotateClockwise = () => {
    triggerHaptic(7);
    setRotation((prev) => prev + 90);
  };

  const handleCancelAdjust = () => {
    if (isClosingRef.current) return;
    triggerHaptic(6);
    resetAdjustState();
  };

  const handlePanPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!adjustingUrl) return;
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
    if (!adjustingUrl || !imgEl || !circleEl || !canvas || isClosingRef.current) {
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
      onSelectPhoto(croppedDataUrl);
    });
  };

  const overlayStyle: CSSProperties = {
    ...MOBILE_SCALE_VARS,
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

  // Layar "Sesuaikan Foto" setelah "Gunakan Foto" diklik
  if (adjustingUrl) {
    const zoomPercent = Math.round(
      ((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100
    );

    return createPortal(
      <div
        style={overlayStyle}
        role="dialog"
        aria-modal="true"
        aria-label="Sesuaikan Foto"
        className="moku-crop-enter fixed inset-0 z-[9999] flex flex-col justify-between bg-[#1F1F23] text-white select-none"
      >
        {/* Top Header Marun */}
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
              onClick={handleCancelAdjust}
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

        {/* Area Crop + Grid 3x3 + Lingkaran Avatar + Teks Panduan */}
        <div
          ref={cropStageRef}
          onPointerDown={handlePanPointerDown}
          onPointerMove={handlePanPointerMove}
          onPointerUp={handlePanPointerUp}
          onPointerCancel={handlePanPointerUp}
          style={{ touchAction: "none" }}
          className="relative mx-auto flex w-full max-w-[680px] flex-1 cursor-grab flex-col items-center justify-center overflow-hidden bg-[#26262A] active:cursor-grabbing"
        >
          {/* Foto yang dapat di-pan, di-zoom, dan di-rotasi searah jarum jam */}
          <img
            ref={cropImageRef}
            src={adjustingUrl}
            alt="Sesuaikan Foto Profil"
            draggable={false}
            style={{
              width: "min(86vw, 356 * var(--u))",
              height: "min(86vw, 356 * var(--u))",
              transform: `translate3d(${offset.x}px, ${offset.y}px, 0) rotate(${rotation}deg) scale(${zoom})`,
              transition: isPanning
                ? "none"
                : "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            className="pointer-events-none object-cover"
          />

          {/* Overlay Grid 3x3 + Lingkaran Putih */}
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

          {/* Keterangan Panduan */}
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

        {/* Panel Bawah Putih: Slider Zoom + Tombol Rotasi Searah Jarum Jam + Tombol Batal & Simpan */}
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
                    className="pointer-events-none absolute rounded-full border-[calc(3*var(--u))] border-[#740319] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.25)]"
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
                onClick={handleCancelAdjust}
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
          .moku-crop-enter {
            animation: moku-crop-in 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
          }
          @keyframes moku-crop-in {
            from {
              opacity: 0;
              transform: scale(0.97) translate3d(0, 10px, 0);
            }
            to {
              opacity: 1;
              transform: scale(1) translate3d(0, 0, 0);
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
      role="dialog"
      aria-modal="true"
      aria-label="Pilih dari Galeri"
      className="moku-gal-enter fixed inset-0 z-[9999] flex flex-col justify-between bg-white text-[#171717] select-none"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleDeviceFileChange}
        className="sr-only"
      />

      {/* Top Header Marun */}
      <header className="sticky top-0 z-30 w-full bg-[#740319] text-white">
        <div
          style={{
            paddingTop: "calc(env(safe-area-inset-top) + 12 * var(--u))",
            paddingBottom: "calc(12 * var(--u))",
          }}
          className="mx-auto flex w-full max-w-[680px] items-center gap-[calc(8*var(--u))] px-[calc(12*var(--u))]"
        >
          <button
            type="button"
            onClick={() => triggerOverlayClose()}
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
            Pilih dari Galeri
          </h2>
        </div>
      </header>

      {/* Grid Foto 3 Kolom dari Perangkat */}
      <div className="mx-auto flex w-full max-w-[680px] flex-1 flex-col overflow-y-auto px-[calc(16*var(--u))] pt-[calc(16*var(--u))] pb-[calc(20*var(--u))]">
        <div className="grid grid-cols-3 gap-[calc(10*var(--u))]">
          {devicePhotos.map((item) => {
            const isSelected = item.id === selectedId;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  triggerHaptic(6);
                  setSelectedId(isSelected ? "" : item.id);
                }}
                aria-pressed={isSelected}
                aria-label={item.label}
                className={`group relative aspect-square w-full cursor-pointer overflow-hidden rounded-[calc(12*var(--u))] bg-[#F3F4F6] text-left transition-[transform,box-shadow] duration-200 active:scale-[0.97] ${
                  isSelected
                    ? "ring-[calc(2*var(--u))] ring-[#740319]"
                    : "ring-1 ring-black/5"
                }`}
              >
                <img
                  src={item.src}
                  alt={item.label}
                  draggable={false}
                  className="h-full w-full object-cover"
                />

                <span
                  aria-hidden="true"
                  className={`absolute right-[calc(8*var(--u))] top-[calc(8*var(--u))] flex h-[calc(24*var(--u))] w-[calc(24*var(--u))] items-center justify-center rounded-full transition-colors duration-200 ${
                    isSelected
                      ? "bg-[#740319] text-white"
                      : "border-[calc(1.8*var(--u))] border-white bg-black/20"
                  }`}
                >
                  {isSelected && (
                    <Check
                      weight="bold"
                      className="h-[calc(13*var(--u))] w-[calc(13*var(--u))] text-white"
                    />
                  )}
                </span>
              </button>
            );
          })}

          {/* Kartu Pilih dari Perangkat */}
          <button
            type="button"
            onClick={openDevicePicker}
            aria-label="Pilih dari Perangkat"
            className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-[calc(6*var(--u))] rounded-[calc(12*var(--u))] border border-dashed border-[#D4D4DC] bg-[#FAFAFB] p-[calc(8*var(--u))] text-center transition-colors active:bg-[#FDF2F4]"
          >
            <span className="flex h-[calc(36*var(--u))] w-[calc(36*var(--u))] items-center justify-center rounded-full bg-[#FDF2F4] text-[#740319]">
              <ImageIcon
                weight="regular"
                className="h-[calc(18*var(--u))] w-[calc(18*var(--u))]"
              />
            </span>
            <span className="text-[calc(11*var(--u))] font-medium leading-tight text-[#52525B]">
              Pilih dari Perangkat
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Bar: Counter & Tombol "Gunakan Foto" */}
      <div
        style={{
          paddingTop: "calc(12 * var(--u))",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 14 * var(--u))",
        }}
        className="sticky bottom-0 z-30 w-full border-t border-[#EFEFF3] bg-white px-[calc(16*var(--u))]"
      >
        <div className="mx-auto flex w-full max-w-[680px] items-center justify-between gap-[calc(16*var(--u))]">
          <span className="text-[calc(14*var(--u))] font-normal text-[#171717]">
            {selectedCount} foto dipilih
          </span>

          <button
            type="button"
            onClick={handleStartAdjustPhoto}
            disabled={!selectedItem}
            className="flex h-[calc(44*var(--u))] min-w-[calc(168*var(--u))] cursor-pointer items-center justify-center rounded-[calc(10*var(--u))] bg-[#740319] px-[calc(20*var(--u))] font-display text-[calc(14*var(--u))] font-semibold text-white transition-[transform,background-color,opacity] duration-200 active:scale-[0.98] active:bg-[#5B0213] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Gunakan Foto
          </button>
        </div>
      </div>

      <style>{`
        .moku-gal-enter {
          animation: moku-gal-in 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes moku-gal-in {
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
