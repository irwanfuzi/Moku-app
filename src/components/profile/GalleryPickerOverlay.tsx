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
  FolderOpen,
  Image as ImageIcon,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  Trash,
} from "@phosphor-icons/react";
import { DEFAULT_AVATAR_URL } from "@/lib/account-profile";

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

const CLOSE_ANIMATION_MS = 260;
const EDGE_SWIPE_ZONE_PX = 40;
const DISMISS_DISTANCE_PX = 76;
const DISMISS_VELOCITY_PX_MS = 0.35;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

interface GalleryItem {
  id: string;
  label: string;
  src: string;
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

function buildPresetGalleryItems(): GalleryItem[] {
  const presets: Array<{
    id: string;
    label: string;
    bg: string;
    accent: string;
    badgeBg: string;
  }> = [
    {
      id: "preset-1",
      label: "Foto 1",
      bg: "#F8E8EC",
      accent: "#740319",
      badgeBg: "#FCECEF",
    },
    {
      id: "preset-2",
      label: "Foto 2",
      bg: "#E8EFFB",
      accent: "#1D4ED8",
      badgeBg: "#DBEAFE",
    },
    {
      id: "preset-3",
      label: "Foto 3",
      bg: "#EAF6EE",
      accent: "#15803D",
      badgeBg: "#DCFCE7",
    },
    {
      id: "preset-4",
      label: "Foto 4",
      bg: "#FEF3E2",
      accent: "#B45309",
      badgeBg: "#FDE68A",
    },
  ];

  return presets.map((item) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360">
      <rect width="360" height="360" fill="${item.bg}" />
      <circle cx="180" cy="142" r="56" fill="${item.accent}" opacity="0.88" />
      <path d="M72 318 C72 246, 288 246, 288 318 Z" fill="${item.accent}" opacity="0.88" />
      <rect x="232" y="24" width="104" height="34" rx="17" fill="${item.badgeBg}" />
      <text x="284" y="46" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="${item.accent}">${item.label}</text>
    </svg>`;
    return {
      id: item.id,
      label: item.label,
      src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    };
  });
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

  const presetItems = useMemo(() => buildPresetGalleryItems(), []);
  const [customItems, setCustomItems] = useState<GalleryItem[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => new Set());
  const [selectedId, setSelectedId] = useState<string>("preset-1");

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const [adjustingUrl, setAdjustingUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1.15);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isPanning, setIsPanning] = useState(false);

  const visibleItems = useMemo(() => {
    const combined = [...customItems, ...presetItems];
    return combined.filter((item) => !deletedIds.has(item.id));
  }, [customItems, deletedIds, presetItems]);

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

  // Jalur back tunggal: jika sedang menyesuaikan foto kembali ke galeri, jika di galeri tutup overlay
  const triggerBackStep = useCallback(() => {
    if (isClosingRef.current) return;
    if (adjustingUrl) {
      triggerHaptic(6);
      setIsDragging(false);
      setDragX(0);
      resetAdjustState();
    } else {
      triggerOverlayClose();
    }
  }, [adjustingUrl, resetAdjustState, triggerOverlayClose]);

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
      triggerBackStep();
    };

    const handleIonBack = (ev: Event) => {
      if (!guardActiveRef.current) return;
      ev.stopImmediatePropagation();
      const customEv = ev as CustomEvent<{
        register: (priority: number, handler: () => void) => void;
      }>;
      if (customEv.detail?.register) {
        customEv.detail.register(9999, () => {
          triggerBackStep();
        });
      } else {
        triggerBackStep();
      }
    };

    window.addEventListener("popstate", handlePopState, true);
    document.addEventListener("ionBackButton", handleIonBack, true);

    return () => {
      window.removeEventListener("popstate", handlePopState, true);
      document.removeEventListener("ionBackButton", handleIonBack, true);
      guardActiveRef.current = false;
    };
  }, [isOpen, triggerBackStep]);

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
      triggerBackStep();
    } else {
      setIsDragging(false);
      setDragX(0);
    }
  };

  const openAdjustForSrc = (src: string) => {
    triggerHaptic(8);
    setZoom(1.15);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    setAdjustingUrl(src);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const newId = `custom-${Date.now()}`;
        const newItem: GalleryItem = {
          id: newId,
          label: file.name || "Foto Galeri",
          src: reader.result,
        };
        setCustomItems((prev) => [newItem, ...prev]);
        setSelectedId(newId);
        openAdjustForSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteThumbnail = (id: string) => {
    triggerHaptic(8);
    setDeletedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    if (selectedId === id) {
      const remaining = visibleItems.filter((item) => item.id !== id);
      setSelectedId(remaining[0]?.id || "");
    }
  };

  const handleConfirmSelectedThumbnail = () => {
    const activeItem =
      visibleItems.find((item) => item.id === selectedId) || visibleItems[0];
    if (!activeItem) return;
    openAdjustForSrc(activeItem.src);
  };

  const handleRotateClockwise = () => {
    triggerHaptic(7);
    setRotation((prev) => prev + 90);
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

  // Mode Sesuaikan Foto
  if (adjustingUrl) {
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
        className="moku-gal-enter fixed inset-0 z-[9999] flex flex-col justify-between bg-[#1F1F23] text-white select-none"
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
              onClick={triggerBackStep}
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
            src={adjustingUrl || DEFAULT_AVATAR_URL}
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
                onClick={triggerBackStep}
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
      aria-label="Pilih dari Galeri"
      className="moku-gal-enter fixed inset-0 z-[9999] flex flex-col justify-between bg-[#FAFAFB] text-[#171717] select-none"
    >
      {/* Top Header Marun */}
      <header className="sticky top-0 z-10 w-full bg-[#740319] text-white">
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
              onClick={triggerBackStep}
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

          <button
            type="button"
            onClick={() => {
              triggerHaptic(7);
              fileInputRef.current?.click();
            }}
            aria-label="Pilih File dari Perangkat"
            className="flex h-[calc(34*var(--u))] cursor-pointer items-center gap-[calc(6*var(--u))] rounded-full bg-white/14 px-[calc(12*var(--u))] text-[calc(12*var(--u))] font-semibold text-white transition-[transform,background-color] duration-200 active:scale-95 active:bg-white/25"
          >
            <FolderOpen
              weight="bold"
              className="h-[calc(14*var(--u))] w-[calc(14*var(--u))]"
            />
            <span>File</span>
          </button>
        </div>
      </header>

      {/* Grid Thumbnail Galeri */}
      <div className="mx-auto w-full max-w-[680px] flex-1 overflow-y-auto px-[calc(16*var(--u))] pt-[calc(18*var(--u))]">
        {visibleItems.length === 0 ? (
          <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-[calc(16*var(--u))] border border-dashed border-[#DDDDE4] bg-white px-[calc(20*var(--u))] text-center">
            <ImageIcon
              weight="regular"
              className="h-[calc(36*var(--u))] w-[calc(36*var(--u))] text-[#8A8A96]"
            />
            <p
              style={{ margin: 0, marginTop: "calc(10 * var(--u))" }}
              className="text-[calc(13.5*var(--u))] font-medium text-[#52525B]"
            >
              Belum ada foto di galeri ini.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{ marginTop: "calc(14 * var(--u))" }}
              className="flex h-[calc(38*var(--u))] cursor-pointer items-center gap-[calc(6*var(--u))] rounded-[calc(10*var(--u))] bg-[#740319] px-[calc(14*var(--u))] text-[calc(12.5*var(--u))] font-semibold text-white active:bg-[#5B0213]"
            >
              <FolderOpen
                weight="bold"
                className="h-[calc(15*var(--u))] w-[calc(15*var(--u))]"
              />
              <span>Pilih dari Perangkat</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-[calc(12*var(--u))]">
            {visibleItems.map((item) => {
              const isSelected = item.id === selectedId;
              return (
                <div
                  key={item.id}
                  style={{ aspectRatio: "1 / 1" }}
                  className={`relative overflow-hidden rounded-[calc(14*var(--u))] border bg-white transition-[transform,border-color] duration-200 ${
                    isSelected
                      ? "border-[calc(2.5*var(--u))] border-[#740319]"
                      : "border-[#EFEFF3]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(6);
                      setSelectedId(item.id);
                    }}
                    className="h-full w-full cursor-pointer"
                  >
                    <img
                      src={item.src}
                      alt={item.label}
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      className="h-full w-full object-cover select-none"
                    />
                  </button>

                  {/* Tombol Hapus Thumbnail Compact */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteThumbnail(item.id);
                    }}
                    aria-label={`Hapus ${item.label}`}
                    style={{
                      width: "calc(28 * var(--u))",
                      height: "calc(28 * var(--u))",
                      top: "calc(8 * var(--u))",
                      left: "calc(8 * var(--u))",
                    }}
                    className="flex cursor-pointer items-center justify-center rounded-full bg-black/55 text-white transition-transform active:scale-90"
                  >
                    <Trash
                      weight="bold"
                      className="h-[calc(13*var(--u))] w-[calc(13*var(--u))]"
                    />
                  </button>

                  {isSelected && (
                    <span
                      aria-hidden="true"
                      style={{
                        width: "calc(26 * var(--u))",
                        height: "calc(26 * var(--u))",
                        top: "calc(8 * var(--u))",
                        right: "calc(8 * var(--u))",
                      }}
                      className="pointer-events-none flex items-center justify-center rounded-full bg-[#740319] text-white"
                    >
                      <Check
                        weight="bold"
                        className="h-[calc(14*var(--u))] w-[calc(14*var(--u))]"
                      />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Aksi */}
      <div
        style={{
          paddingTop: "calc(14 * var(--u))",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 18 * var(--u))",
        }}
        className="w-full border-t border-[#EFEFF3] bg-white px-[calc(16*var(--u))]"
      >
        <div className="mx-auto grid w-full max-w-[680px] grid-cols-2 gap-[calc(12*var(--u))]">
          <button
            type="button"
            onClick={() => triggerOverlayClose()}
            className="flex h-[calc(46*var(--u))] w-full cursor-pointer items-center justify-center rounded-[calc(10*var(--u))] border-[1.5px] border-[#740319] bg-white px-[calc(14*var(--u))] font-display text-[calc(14*var(--u))] font-semibold text-[#740319] transition-[transform,background-color] duration-200 active:scale-[0.985] active:bg-[#FDF2F4]"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleConfirmSelectedThumbnail}
            disabled={visibleItems.length === 0}
            className="flex h-[calc(46*var(--u))] w-full cursor-pointer items-center justify-center rounded-[calc(10*var(--u))] bg-[#740319] px-[calc(14*var(--u))] font-display text-[calc(14*var(--u))] font-semibold text-white transition-[transform,background-color,opacity] duration-200 active:scale-[0.985] active:bg-[#5B0213] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Pilih Foto
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

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
