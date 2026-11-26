import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { WarningCircle } from "@phosphor-icons/react";

export interface MokuModalDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  hideCancel?: boolean;
  tone?: "danger" | "primary";
  icon?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

const MODAL_TRANSITION_MS = 280;
const MODAL_UNMOUNT_MS = 310;

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

function triggerHaptic(duration = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(duration);
  }
}

export default function MokuModalDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  hideCancel = false,
  tone = "danger",
  icon,
  onConfirm,
  onCancel,
}: MokuModalDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    } else {
      setVisible(false);
      const timer = window.setTimeout(() => {
        setMounted(false);
      }, MODAL_UNMOUNT_MS);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onCancel]);

  if (!mounted || typeof document === "undefined") return null;

  const isDanger = tone === "danger";

  return createPortal(
    <div
      style={MOBILE_SCALE_VARS}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="moku-modal-title"
      aria-describedby="moku-modal-desc"
      className="fixed inset-0 z-[10000] flex items-center justify-center px-[calc(20*var(--u))] select-none [-webkit-touch-callout:none] [-webkit-user-select:none]"
    >
      {/* Backdrop */}
      <div
        onClick={() => {
          triggerHaptic(6);
          onCancel();
        }}
        style={{
          opacity: visible ? 0.45 : 0,
          transition: `opacity ${MODAL_TRANSITION_MS}ms ease-out`,
        }}
        className="fixed inset-0 bg-black backdrop-blur-[1.5px]"
      />

      {/* Dialog Card (Flat) */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible
            ? "translate3d(0, 0, 0) scale(1)"
            : "translate3d(0, 10px, 0) scale(0.95)",
          transition: visible
            ? `opacity ${MODAL_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${MODAL_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
            : `opacity 220ms ease-in, transform 220ms cubic-bezier(0.32, 0.72, 0, 1)`,
          willChange: "opacity, transform",
        }}
        className="relative z-10 w-full max-w-[calc(330*var(--u))] rounded-[calc(20*var(--u))] border border-[#EFEFF2] bg-white p-[calc(20*var(--u))] text-center shadow-[0_12px_36px_rgba(23,23,23,0.16)]"
      >
        {/* Ikon */}
        <div
          className={`mx-auto mb-[calc(14*var(--u))] flex h-[calc(54*var(--u))] w-[calc(54*var(--u))] items-center justify-center rounded-full ${
            isDanger ? "bg-[#FCECEF] text-[#8E001C]" : "bg-[#F4F4F7] text-[#29232A]"
          }`}
        >
          {icon ?? (
            <WarningCircle
              weight="regular"
              className="h-[calc(26*var(--u))] w-[calc(26*var(--u))]"
            />
          )}
        </div>

        {/* Judul */}
        <h3
          id="moku-modal-title"
          className="font-display text-[calc(16.5*var(--u))] font-bold leading-snug tracking-[-0.015em] text-[#171717]"
        >
          {title}
        </h3>

        {/* Deskripsi */}
        <p
          id="moku-modal-desc"
          className="mt-[calc(8*var(--u))] text-[calc(13*var(--u))] font-normal leading-[1.5] text-[#6E6873]"
        >
          {description}
        </p>

        {/* Tombol Aksi (1 Kolom Penuh atau 2 Kolom, Flat) */}
        <div
          className={`mt-[calc(20*var(--u))] grid gap-[calc(10*var(--u))] ${
            hideCancel ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {!hideCancel && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                onCancel();
              }}
              className="flex min-h-[calc(44*var(--u))] items-center justify-center rounded-[calc(12*var(--u))] border border-[#DEDEE4] bg-white px-[calc(12*var(--u))] py-[calc(9*var(--u))] font-display text-[calc(13.5*var(--u))] font-semibold text-[#4A454F] transition-[transform,background-color] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] active:bg-[#F7F7F9]"
            >
              {cancelLabel}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              onConfirm();
            }}
            style={{ color: "#FFFFFF" }}
            className="flex min-h-[calc(44*var(--u))] items-center justify-center rounded-[calc(12*var(--u))] bg-[#8E001C] px-[calc(12*var(--u))] py-[calc(9*var(--u))] font-display text-[calc(13.5*var(--u))] font-semibold text-white transition-[transform,background-color] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] active:bg-[#730217]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
 
