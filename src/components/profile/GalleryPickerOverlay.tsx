import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type TouchEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  CaretDown,
  Check,
  Image as ImageIcon,
} from "@phosphor-icons/react";

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

const CLOSE_ANIMATION_MS = 260;
const EDGE_SWIPE_ZONE_PX = 48;
const DISMISS_DISTANCE_PX = 76;
const DISMISS_VELOCITY_PX_MS = 0.35;

type AlbumFilter = "all" | "field" | "workspace";

interface DevicePhotoItem {
  id: string;
  src: string;
  album: Exclude<AlbumFilter, "all">;
  label: string;
}

const ALBUM_OPTIONS: Array<{ value: AlbumFilter; label: string }> = [
  { value: "all", label: "Semua Foto" },
  { value: "field", label: "Kunjungan & Unit" },
  { value: "workspace", label: "Ruang & Perangkat" },
];

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

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const [album, setAlbum] = useState<AlbumFilter>("all");
  const [isAlbumMenuOpen, setIsAlbumMenuOpen] = useState(false);
  const [devicePhotos, setDevicePhotos] = useState<DevicePhotoItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  const visibleItems = useMemo(() => {
    if (album === "all") return devicePhotos;
    return devicePhotos.filter((item) => item.album === album);
  }, [album, devicePhotos]);

  const selectedItem = useMemo(
    () => devicePhotos.find((item) => item.id === selectedId) ?? null,
    [devicePhotos, selectedId]
  );

  const selectedCount = selectedItem ? 1 : 0;

  const openDevicePicker = useCallback(() => {
    triggerHaptic(6);
    fileInputRef.current?.click();
  }, []);

  const triggerOverlayClose = useCallback(
    (afterClose?: () => void) => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      guardActiveRef.current = false;
      triggerHaptic(6);
      setIsAlbumMenuOpen(false);
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
        afterClose?.();
      }, CLOSE_ANIMATION_MS);
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) {
      setIsAlbumMenuOpen(false);
      setDragX(0);
      setIsDragging(false);
      setIsExiting(false);
      isClosingRef.current = false;
      guardActiveRef.current = false;
      return;
    }

    isClosingRef.current = false;
    setIsAlbumMenuOpen(false);
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
  }, [isOpen]);

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
      triggerOverlayClose();
    };

    const handleIonBack = (ev: Event) => {
      if (!guardActiveRef.current) return;
      ev.stopImmediatePropagation();
      const customEv = ev as CustomEvent<{
        register: (priority: number, handler: () => void) => void;
      }>;
      if (customEv.detail?.register) {
        customEv.detail.register(9999, () => {
          triggerOverlayClose();
        });
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
  }, [isOpen, triggerOverlayClose]);

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
      const assignedAlbum: Exclude<AlbumFilter, "all"> =
        album === "workspace" ? "workspace" : "field";
      const newItem: DevicePhotoItem = {
        id: newId,
        src: result,
        album: assignedAlbum,
        label: file.name || "Foto Galeri",
      };
      triggerHaptic([8, 20, 8]);
      setDevicePhotos((prev) => [newItem, ...prev]);
      setSelectedId(newId);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmPhoto = () => {
    if (!selectedItem || isClosingRef.current) return;
    triggerHaptic([8, 25, 10]);
    const chosenSrc = selectedItem.src;
    triggerOverlayClose(() => {
      onSelectPhoto(chosenSrc);
    });
  };

  const activeAlbumLabel =
    ALBUM_OPTIONS.find((opt) => opt.value === album)?.label ?? "Semua Foto";

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

      {/* Filter Bar + Grid Foto 3 Kolom dari Perangkat */}
      <div className="mx-auto flex w-full max-w-[680px] flex-1 flex-col overflow-y-auto px-[calc(16*var(--u))] pt-[calc(16*var(--u))] pb-[calc(20*var(--u))]">
        {/* Dropdown Filter Album */}
        <div className="relative mb-[calc(16*var(--u))] inline-block self-start">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(6);
              setIsAlbumMenuOpen((prev) => !prev);
            }}
            aria-expanded={isAlbumMenuOpen}
            className="flex h-[calc(38*var(--u))] cursor-pointer items-center gap-[calc(10*var(--u))] rounded-[calc(10*var(--u))] border border-[#E4E4EA] bg-white px-[calc(14*var(--u))] text-[calc(13.5*var(--u))] font-medium text-[#171717] shadow-[0_1px_4px_rgba(0,0,0,0.04)] active:bg-[#F7F7F9]"
          >
            <span>{activeAlbumLabel}</span>
            <CaretDown
              weight="bold"
              className={`h-[calc(14*var(--u))] w-[calc(14*var(--u))] text-[#52525B] transition-transform duration-200 ${
                isAlbumMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isAlbumMenuOpen && (
            <div
              role="menu"
              className="moku-gal-menu absolute left-0 top-[calc(100%+6*var(--u))] z-40 min-w-[calc(176*var(--u))] overflow-hidden rounded-[calc(12*var(--u))] border border-[#ECECF0] bg-white py-[calc(4*var(--u))] shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            >
              {ALBUM_OPTIONS.map((opt) => {
                const isActive = opt.value === album;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={isActive}
                    onClick={() => {
                      triggerHaptic(6);
                      setAlbum(opt.value);
                      setIsAlbumMenuOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between px-[calc(14*var(--u))] py-[calc(10*var(--u))] text-left text-[calc(13*var(--u))] transition-colors ${
                      isActive
                        ? "bg-[#FDF2F4] font-semibold text-[#740319]"
                        : "font-normal text-[#171717] active:bg-[#F4F4F7]"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isActive && (
                      <Check
                        weight="bold"
                        className="h-[calc(14*var(--u))] w-[calc(14*var(--u))] text-[#740319]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Grid 3 Kolom + Kartu Pilih dari Perangkat */}
        <div className="grid grid-cols-3 gap-[calc(10*var(--u))]">
          {visibleItems.map((item) => {
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
            onClick={handleConfirmPhoto}
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
        .moku-gal-menu {
          animation: moku-gal-drop 200ms cubic-bezier(0.22, 1, 0.36, 1) both;
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
        @keyframes moku-gal-drop {
          from {
            opacity: 0;
            transform: translate3d(0, -6px, 0) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
