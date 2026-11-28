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
import { registerOpenBottomSheet } from "@/lib/bottom-sheet-lock";

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

const SHEET_ANIMATION_MS = 280;
const DISMISS_DRAG_Y_PX = 56;
const DISMISS_VELOCITY_Y = 0.28;
const EDGE_BACK_ZONE_PX = 40;
const EDGE_BACK_TRIGGER_PX = 32;

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
    const releaseLockRef = useRef<(() => void) | null>(null);
    const isClosingRef = useRef(false);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
      onCloseRef.current = onClose;
    }, [onClose]);

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
    const [keyboardInset, setKeyboardInset] = useState(0);

    // Lacak tinggi virtual keyboard lewat visualViewport agar sheet selalu duduk di atas keyboard
    useEffect(() => {
      if (!isOpen || typeof window === "undefined") {
        setKeyboardInset(0);
        return;
      }

      const vv = window.visualViewport;
      if (!vv) return;

      const updateViewport = () => {
        const inset = Math.max(
          0,
          Math.round(window.innerHeight - vv.height - vv.offsetTop)
        );
        setKeyboardInset(inset);
      };

      updateViewport();
      vv.addEventListener("resize", updateViewport);
      vv.addEventListener("scroll", updateViewport);
      window.addEventListener("resize", updateViewport);

      return () => {
        vv.removeEventListener("resize", updateViewport);
        vv.removeEventListener("scroll", updateViewport);
        window.removeEventListener("resize", updateViewport);
      };
    }, [isOpen]);

    const dismissSheet = useCallback((afterClose?: () => void) => {
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
        releaseLockRef.current?.();
        releaseLockRef.current = null;
        onCloseRef.current();
        afterClose?.();
      }, SHEET_ANIMATION_MS);
    }, []);

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
        releaseLockRef.current?.();
        releaseLockRef.current = null;
        return;
      }

      if (!releaseLockRef.current) {
        releaseLockRef.current = registerOpenBottomSheet(() => {
          dismissSheet();
        });
      }

      isClosingRef.current = false;
      setIsEntered(false);
      setIsDragging(false);
      setDragY(0);

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
        releaseLockRef.current?.();
        releaseLockRef.current = null;
      };
    }, [dismissSheet, isOpen]);

    useEffect(() => {
      if (!isOpen) return;

      let edgeStartX = 0;
      let edgeStartY = 0;
      let edgeDir: 1 | -1 = 1;
      let edgeTracking = false;

      const onCaptureTouchStart = (e: globalThis.TouchEvent) => {
        if (isClosingRef.current || e.touches.length !== 1) return;
        const t = e.touches[0];
        const vw = window.innerWidth;
        const fromLeft = t.clientX <= EDGE_BACK_ZONE_PX;
        const fromRight = t.clientX >= vw - EDGE_BACK_ZONE_PX;
        if (fromLeft || fromRight) {
          edgeStartX = t.clientX;
          edgeStartY = t.clientY;
          edgeDir = fromLeft ? 1 : -1;
          edgeTracking = true;
          e.stopPropagation();
        } else {
          edgeTracking = false;
        }
      };

      const onCaptureTouchMove = (e: globalThis.TouchEvent) => {
        if (!edgeTracking || isClosingRef.current || e.touches.length !== 1) {
          return;
        }
        const t = e.touches[0];
        const inwardDx = (t.clientX - edgeStartX) * edgeDir;
        const dy = Math.abs(t.clientY - edgeStartY);

        if (dy > Math.abs(inwardDx) && dy > 12) {
          edgeTracking = false;
          return;
        }

        e.stopPropagation();
        if (inwardDx >= EDGE_BACK_TRIGGER_PX) {
          edgeTracking = false;
          dismissSheet();
        }
      };

      const onCaptureTouchEnd = () => {
        edgeTracking = false;
      };

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

      window.addEventListener("touchstart", onCaptureTouchStart, {
        capture: true,
        passive: false,
      });
      window.addEventListener("touchmove", onCaptureTouchMove, {
        capture: true,
        passive: false,
      });
      window.addEventListener("touchend", onCaptureTouchEnd, true);
      document.addEventListener("ionBackButton", handleIonBack, true);
      document.addEventListener("backbutton", handleHardwareBack, true);

      return () => {
        window.removeEventListener("touchstart", onCaptureTouchStart, true);
        window.removeEventListener("touchmove", onCaptureTouchMove, true);
        window.removeEventListener("touchend", onCaptureTouchEnd, true);
        document.removeEventListener("ionBackButton", handleIonBack, true);
        document.removeEventListener("backbutton", handleHardwareBack, true);
      };
    }, [backButtonPriority, dismissSheet, isOpen]);

    if (!isOpen || typeof document === "undefined") return null;

    const handlePanelTouchStart = (e: TouchEvent<HTMLDivElement>) => {
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

    const handlePanelTouchMove = (e: TouchEvent<HTMLDivElement>) => {
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

    const handlePanelTouchEnd = () => {
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
        style={{
          ...MOBILE_SCALE_VARS,
          touchAction: "none",
          paddingBottom: keyboardInset > 0 ? `${keyboardInset}px` : undefined,
        }}
        onContextMenu={(e) => e.preventDefault()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={`fixed inset-0 ${zIndexClassName} flex flex-col justify-end select-none transition-[padding-bottom] duration-200 ease-out`}
      >
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

        <div
          onTouchStart={handlePanelTouchStart}
          onTouchMove={handlePanelTouchMove}
          onTouchEnd={handlePanelTouchEnd}
          onTouchCancel={handlePanelTouchEnd}
          style={{
            touchAction: "none",
            maxHeight:
              keyboardInset > 0
                ? `calc(100dvh - ${keyboardInset}px - 16px)`
                : "88dvh",
            paddingTop: "calc(10 * var(--u))",
            paddingBottom:
              keyboardInset > 0
                ? "calc(12 * var(--u))"
                : `calc(env(safe-area-inset-bottom) + ${bottomPaddingUnits} * var(--u))`,
            transform: `translate3d(0, ${sheetTranslateY}, 0)`,
            transition: isDragging
              ? "none"
              : `transform ${SHEET_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            willChange: "transform",
          }}
          className={`relative z-10 mx-auto flex w-full max-w-[680px] flex-col rounded-t-[calc(24*var(--u))] border-t border-[#EFEFF3] bg-white px-[calc(18*var(--u))] ${sheetClassName}`}
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
