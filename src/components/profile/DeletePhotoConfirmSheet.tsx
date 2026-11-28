import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type TouchEvent,
} from "react";
import { createPortal } from "react-dom";

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

const CLOSE_ANIMATION_MS = 230;
const DISMISS_DRAG_Y_PX = 68;
const DISMISS_VELOCITY_Y = 0.35;

interface DeletePhotoConfirmSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  illustrationSrc?: string;
}

function triggerHaptic(duration = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(duration);
  }
}

export default function DeletePhotoConfirmSheet({
  isOpen,
  onClose,
  onConfirmDelete,
  illustrationSrc = "/images/moku/illustrations/asset-delete-foto.png",
}: DeletePhotoConfirmSheetProps) {
  const closeTimerRef = useRef<number | null>(null);
  const isClosingRef = useRef(false);

  const dragRef = useRef<{
    startY: number;
    startTime: number;
    tracking: boolean;
  }>({
    startY: 0,
    startTime: 0,
    tracking: false,
  });

  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const dismissSheet = useCallback(
    (afterClose?: () => void) => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;
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
        setDragY(0);
        onClose();
        afterClose?.();
      }, CLOSE_ANIMATION_MS);
    },
    [onClose]
  );

  const handleConfirm = useCallback(() => {
    if (isClosingRef.current) return;
    triggerHaptic([8, 22, 10]);
    dismissSheet(() => {
      onConfirmDelete();
    });
  }, [dismissSheet, onConfirmDelete]);

  useEffect(() => {
    if (!isOpen) {
      isClosingRef.current = false;
      setIsExiting(false);
      setIsDragging(false);
      setDragY(0);
      return;
    }

    isClosingRef.current = false;
    setIsExiting(false);
    setIsDragging(false);
    setDragY(0);

    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleIonBack = (ev: Event) => {
      if (isClosingRef.current) return;
      ev.stopImmediatePropagation();
      const customEv = ev as CustomEvent<{
        register: (priority: number, handler: () => void) => void;
      }>;
      if (customEv.detail?.register) {
        customEv.detail.register(9999, () => {
          dismissSheet();
        });
      } else {
        dismissSheet();
      }
    };

    const handleHardwareBack = (ev: Event) => {
      if (isClosingRef.current) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      dismissSheet();
    };

    document.addEventListener("ionBackButton", handleIonBack, true);
    document.addEventListener("backbutton", handleHardwareBack, true);

    return () => {
      document.removeEventListener("ionBackButton", handleIonBack, true);
      document.removeEventListener("backbutton", handleHardwareBack, true);
    };
  }, [dismissSheet, isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (isClosingRef.current || e.touches.length !== 1) return;
    dragRef.current = {
      startY: e.touches[0].clientY,
      startTime: performance.now(),
      tracking: true,
    };
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    const state = dragRef.current;
    if (!state.tracking || isClosingRef.current || e.touches.length !== 1) return;

    const dy = e.touches[0].clientY - state.startY;
    if (dy <= 0) {
      setDragY(0);
      return;
    }

    if (!isDragging && dy > 6) {
      setIsDragging(true);
    }
    setDragY(dy);
  };

  const handleTouchEnd = () => {
    const state = dragRef.current;
    if (!state.tracking) return;
    state.tracking = false;

    const elapsed = Math.max(1, performance.now() - state.startTime);
    const velocity = dragY / elapsed;

    if (dragY >= DISMISS_DRAG_Y_PX || velocity >= DISMISS_VELOCITY_Y) {
      dismissSheet();
    } else {
      setIsDragging(false);
      setDragY(0);
    }
  };

  const sheetTranslateY = isExiting
    ? "100%"
    : dragY > 0
    ? `${dragY}px`
    : "0px";

  const backdropOpacity = isExiting
    ? 0
    : dragY > 0
    ? Math.max(0.25, 1 - dragY / 360)
    : 1;

  return createPortal(
    <div
      style={MOBILE_SCALE_VARS}
      onContextMenu={(e) => e.preventDefault()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="moku-delete-photo-title"
      className="fixed inset-0 z-[9998] flex flex-col justify-end select-none"
    >
      <div
        onClick={() => dismissSheet()}
        aria-hidden="true"
        style={{
          opacity: backdropOpacity,
          transition: isDragging
            ? "none"
            : `opacity ${CLOSE_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
        className="moku-del-backdrop fixed inset-0 bg-black/52"
      />

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          paddingTop: "calc(12 * var(--u))",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 22 * var(--u))",
          transform: `translate3d(0, ${sheetTranslateY}, 0)`,
          transition: isDragging
            ? "none"
            : `transform ${CLOSE_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
        className="moku-del-sheet relative z-10 mx-auto w-full max-w-[680px] rounded-t-[calc(24*var(--u))] bg-white px-[calc(20*var(--u))] text-center shadow-[0_-10px_32px_rgba(0,0,0,0.16)]"
      >
        <div
          aria-hidden="true"
          style={{
            width: "calc(44 * var(--u))",
            height: "calc(4 * var(--u))",
            marginBottom: "calc(18 * var(--u))",
          }}
          className="mx-auto rounded-full bg-[#D4D4DC]"
        />

        <div
          style={{
            width: "calc(136 * var(--u))",
            height: "calc(136 * var(--u))",
            marginBottom: "calc(14 * var(--u))",
          }}
          className="mx-auto flex items-center justify-center"
        >
          <img
            src={illustrationSrc}
            alt="Ilustrasi Hapus Foto Profil"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            style={{ WebkitTouchCallout: "none" }}
            className="h-full w-full object-contain select-none"
          />
        </div>

        <h3
          id="moku-delete-photo-title"
          style={{
            margin: 0,
            marginBottom: "calc(8 * var(--u))",
          }}
          className="font-display text-[calc(20*var(--u))] font-bold tracking-[-0.015em] text-[#171717]"
        >
          Hapus Foto Profil?
        </h3>

        <p
          style={{
            margin: 0,
            marginBottom: "calc(24 * var(--u))",
          }}
          className="mx-auto max-w-[290px] text-[calc(14*var(--u))] font-normal leading-relaxed text-[#3F3F46]"
        >
          Foto profil kamu akan dihapus dan diganti dengan avatar default.
        </p>

        <div className="space-y-[calc(12*var(--u))]">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex min-h-[calc(48*var(--u))] w-full cursor-pointer items-center justify-center rounded-[calc(12*var(--u))] bg-[#740319] px-[calc(16*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(14.5*var(--u))] font-semibold text-white transition-[transform,background-color] duration-200 active:scale-[0.985] active:bg-[#5B0213]"
          >
            Hapus Foto
          </button>

          <button
            type="button"
            onClick={() => dismissSheet()}
            className="flex min-h-[calc(48*var(--u))] w-full cursor-pointer items-center justify-center rounded-[calc(12*var(--u))] border-[1.5px] border-[#740319] bg-white px-[calc(16*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(14.5*var(--u))] font-semibold text-[#740319] transition-[transform,background-color] duration-200 active:scale-[0.985] active:bg-[#FDF2F4]"
          >
            Batal
          </button>
        </div>
      </div>

      <style>{`
        .moku-del-backdrop {
          animation: moku-del-fade 220ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .moku-del-sheet {
          animation: moku-del-up 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes moku-del-fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes moku-del-up {
          from {
            transform: translate3d(0, 100%, 0);
          }
          to {
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
