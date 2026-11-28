import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type TouchEvent,
} from "react";
import { createPortal } from "react-dom";

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

const SHEET_ANIMATION_MS = 280;
const DISMISS_DRAG_Y_PX = 56;
const DISMISS_VELOCITY_Y = 0.28;

export interface MokuBottomSheetRef {
  closeSheet: (afterClose?: () => void) => void;
}

export interface MokuBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  showHandle?: boolean;
  closeOnBackdropClick?: boolean;
  enableDragToDismiss?: boolean;
  backButtonPriority?: number;
  zIndexClassName?: string;
  sheetClassName?: string;
  contentClassName?: string;
  bottomPaddingUnits?: number;
}

function triggerHaptic(duration = 6) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(duration);
  }
}

const MokuBottomSheet = forwardRef<MokuBottomSheetRef, MokuBottomSheetProps>(
  function MokuBottomSheet(
    {
      isOpen,
      onClose,
      children,
      ariaLabel,
      ariaLabelledBy,
      showHandle = true,
      closeOnBackdropClick = true,
      enableDragToDismiss = true,
      backButtonPriority = 9998,
      zIndexClassName = "z-[9998]",
      sheetClassName = "",
      contentClassName = "",
      bottomPaddingUnits = 18,
    },
    ref
  ) {
    const closeTimerRef = useRef<number | null>(null);
    const enterRafRef = useRef<number | null>(null);
    const isClosingRef = useRef(false);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    const dragRef = useRef<{
      startY: number;
      startTime: number;
      tracking: boolean;
    }>({
      startY: 0,
      startTime: 0,
      tracking: false,
    });

    const [isEntered, setIsEntered] = useState(false);
    const [dragY, setDragY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const dismissSheet = useCallback(
      (afterClose?: () => void) => {
        if (isClosingRef.current) return;
        isClosingRef.current = true;
        triggerHaptic(6);

        if (enterRafRef.current !== null) {
          window.cancelAnimationFrame(enterRafRef.current);
          enterRafRef.current = null;
        }

        setIsDragging(false);
        setIsEntered(false);

        if (closeTimerRef.current !== null) {
          window.clearTimeout(closeTimerRef.current);
        }
        closeTimerRef.current = window.setTimeout(() => {
          closeTimerRef.current = null;
          isClosingRef.current = false;
          setDragY(0);
          onClose();
          afterClose?.();
        }, SHEET_ANIMATION_MS);
      },
      [onClose]
    );

    useImperativeHandle(
      ref,
      () => ({
        closeSheet: dismissSheet,
      }),
      [dismissSheet]
    );

    useEffect(() => {
      if (!isOpen) {
        isClosingRef.current = false;
        setIsEntered(false);
        setIsDragging(false);
        setDragY(0);
        return;
      }

      isClosingRef.current = false;
      setIsEntered(false);
      setIsDragging(false);
      setDragY(0);

      // Mulai posisi di 100%, lalu transisikan naik ke 0% di frame berikutnya
      enterRafRef.current = window.requestAnimationFrame(() => {
        enterRafRef.current = window.requestAnimationFrame(() => {
          enterRafRef.current = null;
          setIsEntered(true);
        });
      });

      return () => {
        if (enterRafRef.current !== null) {
          window.cancelAnimationFrame(enterRafRef.current);
          enterRafRef.current = null;
        }
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
          customEv.detail.register(backButtonPriority, () => {
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
    }, [backButtonPriority, dismissSheet, isOpen]);

    if (!isOpen || typeof document === "undefined") return null;

    const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
      if (!enableDragToDismiss || isClosingRef.current || e.touches.length !== 1) {
        return;
      }

      const scrollEl = scrollContainerRef.current;
      if (scrollEl && scrollEl.scrollTop > 0) {
        dragRef.current.tracking = false;
        return;
      }

      dragRef.current = {
        startY: e.touches[0].clientY,
        startTime: performance.now(),
        tracking: true,
      };
    };

    const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
      const state = dragRef.current;
      if (
        !enableDragToDismiss ||
        !state.tracking ||
        isClosingRef.current ||
        e.touches.length !== 1
      ) {
        return;
      }

      const dy = e.touches[0].clientY - state.startY;
      if (dy <= 0) {
        setDragY(0);
        return;
      }

      if (!isDragging && dy > 4) {
        setIsDragging(true);
      }
      setDragY(dy);
    };

    const handleTouchEnd = () => {
      const state = dragRef.current;
      if (!state.tracking) return;
      state.tracking = false;

      if (!isDragging && dragY === 0) return;

      const elapsed = Math.max(1, performance.now() - state.startTime);
      const velocity = dragY / elapsed;

      if (dragY >= DISMISS_DRAG_Y_PX || velocity >= DISMISS_VELOCITY_Y) {
        dismissSheet();
      } else {
        setIsDragging(false);
        setDragY(0);
      }
    };

    const sheetTranslateY = !isEntered
      ? "100%"
      : dragY > 0
      ? `${dragY}px`
      : "0px";

    const backdropOpacity = !isEntered
      ? 0
      : dragY > 0
      ? Math.max(0.2, 1 - dragY / 340)
      : 1;

    return createPortal(
      <div
        style={{ ...MOBILE_SCALE_VARS, touchAction: "none" }}
        onContextMenu={(e) => e.preventDefault()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={`fixed inset-0 ${zIndexClassName} flex flex-col justify-end select-none`}
      >
        {/* Backdrop */}
        <div
          onClick={() => {
            if (closeOnBackdropClick) dismissSheet();
          }}
          aria-hidden="true"
          style={{
            opacity: backdropOpacity,
            transition: isDragging
              ? "none"
              : `opacity ${SHEET_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
          className="fixed inset-0 bg-black/48"
        />

        {/* Panel Sheet */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          style={{
            touchAction: "none",
            paddingTop: "calc(10 * var(--u))",
            paddingBottom: `calc(env(safe-area-inset-bottom) + ${bottomPaddingUnits} * var(--u))`,
            transform: `translate3d(0, ${sheetTranslateY}, 0)`,
            transition: isDragging
              ? "none"
              : `transform ${SHEET_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            willChange: "transform",
          }}
          className={`relative z-10 mx-auto flex max-h-[88dvh] w-full max-w-[680px] flex-col rounded-t-[calc(24*var(--u))] border-t border-[#EFEFF3] bg-white px-[calc(18*var(--u))] ${sheetClassName}`}
        >
          {showHandle && (
            <div
              aria-hidden="true"
              style={{
                width: "calc(40 * var(--u))",
                height: "calc(4 * var(--u))",
                marginBottom: "calc(12 * var(--u))",
              }}
              className="mx-auto shrink-0 rounded-full bg-[#D4D4DC]"
            />
          )}

          <div
            ref={scrollContainerRef}
            style={{ touchAction: "pan-y" }}
            className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${contentClassName}`}
          >
            {children}
          </div>
        </div>
      </div>,
      document.body
    );
  }
);

export default MokuBottomSheet;
