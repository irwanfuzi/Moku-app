import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  CheckCircle,
  EnvelopeSimple,
  PencilSimpleLine,
  Phone,
  WarningCircle,
} from "@phosphor-icons/react";
import MokuBottomSheet, {
  type MokuBottomSheetRef,
} from "@/components/ui/MokuBottomSheet";

export type OtpTarget = "email" | "phone";

interface OtpVerificationSheetProps {
  isOpen: boolean;
  target: OtpTarget;
  destination: string;
  resendCooldown: number;
  error?: string;
  onClose: () => void;
  onChangeDestination: () => void;
  /** Kembalikan true jika kode valid, false jika tidak valid */
  onVerify: (code: string) => boolean;
  /** Dipanggil setelah bottom sheet selesai meluncur turun saat verifikasi berhasil */
  onVerifySuccess: () => void;
  onResend: () => void;
  onClearError?: () => void;
}

const OTP_LENGTH = 6;
const AUTO_VERIFY_DELAY_MS = 200;
const SUCCESS_HOLD_MS = 480;

function triggerLightHaptic(pattern: number | number[] = 4) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

export default function OtpVerificationSheet({
  isOpen,
  target,
  destination,
  resendCooldown,
  error,
  onClose,
  onChangeDestination,
  onVerify,
  onVerifySuccess,
  onResend,
  onClearError,
}: OtpVerificationSheetProps) {
  const sheetRef = useRef<MokuBottomSheetRef>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const successTimerRef = useRef<number | null>(null);
  const autoVerifyTimerRef = useRef<number | null>(null);

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [poppedIndex, setPoppedIndex] = useState<number | null>(null);
  const [popNonce, setPopNonce] = useState(0);
  const [shakeNonce, setShakeNonce] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const clearAutoVerifyTimer = useCallback(() => {
    if (autoVerifyTimerRef.current !== null) {
      window.clearTimeout(autoVerifyTimerRef.current);
      autoVerifyTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      clearAutoVerifyTimer();
      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
      }
      return;
    }

    setDigits(Array(OTP_LENGTH).fill(""));
    setActiveIndex(0);
    setPoppedIndex(null);
    setIsSuccess(false);

    // Fokus setelah animasi naik MokuBottomSheet (420ms) selesai agar transisi tetap mulus
    const focusTimer = window.setTimeout(() => {
      inputRefs.current[0]?.focus({ preventScroll: true });
    }, 450);

    return () => {
      window.clearTimeout(focusTimer);
      clearAutoVerifyTimer();
      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
        successTimerRef.current = null;
      }
    };
  }, [clearAutoVerifyTimer, isOpen, destination, target]);

  const triggerBoxPop = (idx: number) => {
    setPoppedIndex(idx);
    setPopNonce((n) => n + 1);
  };

  const executeVerify = useCallback(
    (codeToVerify: string) => {
      if (isSuccess) return;
      clearAutoVerifyTimer();

      const valid = onVerify(codeToVerify);
      if (!valid) {
        triggerLightHaptic([12, 24, 12]);
        setShakeNonce((n) => n + 1);
        return;
      }

      // Tutup keyboard dulu, tampilkan feedback sukses yang nyaman dibaca, lalu luncurkan sheet turun
      inputRefs.current.forEach((el) => el?.blur());
      setIsSuccess(true);
      triggerLightHaptic([8, 25, 10]);

      successTimerRef.current = window.setTimeout(() => {
        successTimerRef.current = null;
        sheetRef.current?.closeSheet(() => {
          onVerifySuccess();
        });
      }, SUCCESS_HOLD_MS);
    },
    [clearAutoVerifyTimer, isSuccess, onVerify, onVerifySuccess]
  );

  const scheduleAutoVerifyIfComplete = useCallback(
    (nextDigits: string[]) => {
      clearAutoVerifyTimer();
      const joined = nextDigits.join("");
      if (joined.length === OTP_LENGTH && nextDigits.every((d) => d !== "")) {
        autoVerifyTimerRef.current = window.setTimeout(() => {
          autoVerifyTimerRef.current = null;
          executeVerify(joined);
        }, AUTO_VERIFY_DELAY_MS);
      }
    },
    [clearAutoVerifyTimer, executeVerify]
  );

  const handleDigitChange = (index: number, rawValue: string) => {
    if (isSuccess) return;
    const clean = rawValue.replace(/\D/g, "");
    onClearError?.();

    if (!clean) {
      clearAutoVerifyTimer();
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    if (clean.length > 1) {
      const next = [...digits];
      let lastFilled = index;
      for (let i = 0; i < OTP_LENGTH - index && i < clean.length; i++) {
        next[index + i] = clean[i];
        lastFilled = index + i;
      }
      setDigits(next);
      triggerLightHaptic(6);
      triggerBoxPop(lastFilled);

      const nextFocus = Math.min(index + clean.length, OTP_LENGTH - 1);
      setActiveIndex(nextFocus);
      inputRefs.current[nextFocus]?.focus();
      scheduleAutoVerifyIfComplete(next);
      return;
    }

    const next = [...digits];
    next[index] = clean[0];
    setDigits(next);
    triggerLightHaptic(4);
    triggerBoxPop(index);

    if (index < OTP_LENGTH - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }

    scheduleAutoVerifyIfComplete(next);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (isSuccess) return;

    if (e.key === "Backspace") {
      clearAutoVerifyTimer();
      onClearError?.();
      triggerLightHaptic(3);
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      executeVerify(digits.join(""));
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (isSuccess) return;
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    onClearError?.();
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);
    triggerLightHaptic(6);

    const nextFocus = Math.min(pasted.length - 1, OTP_LENGTH - 1);
    triggerBoxPop(nextFocus);
    setActiveIndex(nextFocus);
    inputRefs.current[nextFocus]?.focus();
    scheduleAutoVerifyIfComplete(next);
  };

  const handleChangeDestination = () => {
    if (isSuccess) return;
    clearAutoVerifyTimer();
    inputRefs.current.forEach((el) => el?.blur());
    sheetRef.current?.closeSheet(() => {
      onChangeDestination();
    });
  };

  const getOtpBoxStyle = (
    isFocused: boolean,
    hasValue: boolean
  ): CSSProperties => {
    const base: CSSProperties = {
      height: "calc(54 * var(--u))",
      fontSize: "clamp(24px, calc(28 * var(--u)), 30px)",
      borderStyle: "solid",
      outline: "none",
      WebkitTapHighlightColor: "transparent",
      appearance: "none",
    };

    if (isSuccess) {
      return {
        ...base,
        borderWidth: "1.5px",
        borderColor: "#16A34A",
        backgroundColor: "#F0FDF4",
        color: "#15803D",
        boxShadow: "0 0 0 3px rgba(22, 163, 74, 0.12)",
      };
    }

    if (error) {
      return {
        ...base,
        borderWidth: "1.5px",
        borderColor: "#C8102E",
        backgroundColor: "#FFF9FA",
        color: "#171717",
        boxShadow: "0 0 0 3px rgba(200, 16, 46, 0.10)",
      };
    }

    if (isFocused) {
      return {
        ...base,
        borderWidth: "2px",
        borderColor: "#740319",
        backgroundColor: "#FFFFFF",
        color: "#171717",
        boxShadow: "0 0 0 3px rgba(116, 3, 25, 0.10)",
      };
    }

    if (hasValue) {
      return {
        ...base,
        borderWidth: "1.5px",
        borderColor: "rgba(116, 3, 25, 0.42)",
        backgroundColor: "#FDF8F9",
        color: "#171717",
        boxShadow: "none",
      };
    }

    return {
      ...base,
      borderWidth: "1.5px",
      borderColor: "#E2E2E8",
      backgroundColor: "#FFFFFF",
      color: "#171717",
      boxShadow: "none",
    };
  };

  const isEmail = target === "email";
  const formattedDestination = isEmail ? destination : `+62 ${destination}`;
  const isComplete = digits.every((d) => d !== "");

  return (
    <MokuBottomSheet
      ref={sheetRef}
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy="moku-otp-sheet-title"
      backButtonPriority={9999}
      zIndexClassName="z-[9998]"
      bottomPaddingUnits={18}
    >
      <div className="moku-otp-content-in">
        {/* Header: Ikon + Judul + Deskripsi */}
        <div
          style={{ marginBottom: "calc(22 * var(--u))" }}
          className="flex items-start gap-[calc(14*var(--u))] pt-[calc(4*var(--u))]"
        >
          <div
            style={{
              width: "calc(48 * var(--u))",
              height: "calc(48 * var(--u))",
            }}
            className="flex shrink-0 items-center justify-center rounded-[calc(12*var(--u))] bg-[#FCECEF] text-[#740319]"
          >
            {isEmail ? (
              <EnvelopeSimple
                weight="regular"
                className="h-[calc(24*var(--u))] w-[calc(24*var(--u))]"
              />
            ) : (
              <Phone
                weight="regular"
                className="h-[calc(24*var(--u))] w-[calc(24*var(--u))]"
              />
            )}
          </div>

          <div className="min-w-0 flex-1 text-left">
            <h3
              id="moku-otp-sheet-title"
              style={{ margin: 0, marginBottom: "calc(4 * var(--u))" }}
              className="font-display text-[calc(19*var(--u))] font-bold leading-tight tracking-[-0.015em] text-[#171717]"
            >
              {isEmail ? "Verifikasi Email" : "Verifikasi Nomor Telepon"}
            </h3>
            <p
              style={{ margin: 0 }}
              className="text-[calc(13.5*var(--u))] font-normal leading-[1.45] text-[#4B4B55]"
            >
              Masukkan 6 digit kode OTP yang telah dikirim ke{" "}
              {isEmail ? "email" : "nomor"}{" "}
              <span className="font-semibold text-[#171717]">
                {formattedDestination}.
              </span>
            </p>
          </div>
        </div>

        {/* 6 Kotak Input OTP Bersih Tanpa Outline Browser */}
        <div
          key={shakeNonce}
          className={`grid grid-cols-6 gap-[calc(8*var(--u))] px-[calc(6*var(--u))] ${
            shakeNonce > 0 && error ? "moku-otp-shake" : ""
          }`}
        >
          {digits.map((digit, idx) => {
            const isFocused = activeIndex === idx && !isSuccess;
            const hasValue = digit !== "";
            const isPopping = poppedIndex === idx;

            return (
              <input
                key={`${idx}-${isPopping ? popNonce : 0}`}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={idx === 0 ? "one-time-code" : "off"}
                maxLength={OTP_LENGTH}
                value={digit}
                readOnly={isSuccess}
                aria-label={`Digit OTP ke-${idx + 1}`}
                onFocus={() => setActiveIndex(idx)}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                style={getOtpBoxStyle(isFocused, hasValue)}
                className={`moku-otp-input w-full rounded-[calc(12*var(--u))] text-center font-display font-bold leading-none caret-[#740319] transition-[border-color,background-color,box-shadow,transform,color] duration-250 ease-out ${
                  isPopping && hasValue ? "moku-otp-pop" : ""
                }`}
              />
            );
          })}
        </div>

        {/* Pesan Error Validasi OTP */}
        {error && !isSuccess && (
          <p
            role="alert"
            style={{ margin: 0, marginTop: "calc(10 * var(--u))" }}
            className="moku-otp-fade-in flex items-center justify-center gap-[calc(5*var(--u))] text-[calc(12*var(--u))] font-medium text-[#C8102E]"
          >
            <WarningCircle
              weight="fill"
              className="h-[calc(14*var(--u))] w-[calc(14*var(--u))] shrink-0"
            />
            <span>{error}</span>
          </p>
        )}

        {/* Tombol Verifikasi */}
        <button
          type="button"
          onClick={() => executeVerify(digits.join(""))}
          disabled={isSuccess || !isComplete}
          style={{ marginTop: "calc(22 * var(--u))" }}
          className={`flex min-h-[calc(48*var(--u))] w-full cursor-pointer items-center justify-center gap-[calc(8*var(--u))] rounded-[calc(12*var(--u))] px-[calc(18*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(15*var(--u))] font-semibold text-white transition-[transform,background-color,opacity] duration-300 ease-out active:scale-[0.985] disabled:cursor-not-allowed ${
            isSuccess
              ? "bg-[#15803D]"
              : isComplete
              ? "bg-[#740319] active:bg-[#5B0213]"
              : "bg-[#740319]/45"
          }`}
        >
          {isSuccess ? (
            <span className="moku-otp-pop inline-flex items-center gap-[calc(8*var(--u))]">
              <CheckCircle
                weight="fill"
                className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] text-white"
              />
              <span>Terverifikasi</span>
            </span>
          ) : (
            <span>Verifikasi</span>
          )}
        </button>

        {/* Kirim Ulang OTP */}
        <div
          style={{
            marginTop: "calc(16 * var(--u))",
            marginBottom: "calc(18 * var(--u))",
          }}
          className="text-center text-[calc(13*var(--u))] text-[#3F3F46]"
        >
          <span>Belum menerima kode? </span>
          {resendCooldown > 0 ? (
            <>
              <span>Kirim ulang dalam </span>
              <span className="font-semibold text-[#740319] underline underline-offset-2">
                {resendCooldown} detik
              </span>
            </>
          ) : (
            <button
              type="button"
              disabled={isSuccess}
              onClick={onResend}
              className="cursor-pointer font-semibold text-[#740319] underline underline-offset-2 active:opacity-75 disabled:opacity-50"
            >
              Kirim ulang
            </button>
          )}
        </div>

        {/* Garis Pemisah + Aksi Ubah Email / Nomor */}
        <div
          style={{ paddingTop: "calc(14 * var(--u))" }}
          className="border-t border-[#EFEFF3] text-center"
        >
          <button
            type="button"
            disabled={isSuccess}
            onClick={handleChangeDestination}
            className="inline-flex cursor-pointer items-center justify-center gap-[calc(8*var(--u))] py-[calc(4*var(--u))] font-display text-[calc(14*var(--u))] font-semibold text-[#740319] underline underline-offset-4 transition-opacity duration-200 active:opacity-75 disabled:opacity-50"
          >
            <PencilSimpleLine
              weight="regular"
              className="h-[calc(17*var(--u))] w-[calc(17*var(--u))]"
            />
            <span>{isEmail ? "Ubah Email" : "Ubah Nomor Telepon"}</span>
          </button>
        </div>
      </div>

      <style>{`
        .moku-otp-input:focus,
        .moku-otp-input:focus-visible {
          outline: none !important;
        }
        .moku-otp-content-in {
          animation: moku-otp-rise 400ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .moku-otp-pop {
          animation: moku-otp-box-pop 240ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .moku-otp-shake {
          animation: moku-otp-box-shake 380ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
        .moku-otp-fade-in {
          animation: moku-otp-fade 260ms ease-out both;
        }
        @keyframes moku-otp-rise {
          from {
            opacity: 0;
            transform: translate3d(0, 12px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes moku-otp-box-pop {
          0% {
            transform: scale(0.94);
          }
          55% {
            transform: scale(1.06);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes moku-otp-box-shake {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          20% {
            transform: translate3d(-6px, 0, 0);
          }
          40% {
            transform: translate3d(6px, 0, 0);
          }
          60% {
            transform: translate3d(-4px, 0, 0);
          }
          80% {
            transform: translate3d(4px, 0, 0);
          }
        }
        @keyframes moku-otp-fade {
          from {
            opacity: 0;
            transform: translate3d(0, -4px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </MokuBottomSheet>
  );
            }
