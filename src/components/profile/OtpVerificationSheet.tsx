import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import {
  Clock,
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
  onVerify: (code: string) => void;
  onResend: () => void;
  onClearError?: () => void;
}

const OTP_LENGTH = 6;

export default function OtpVerificationSheet({
  isOpen,
  target,
  destination,
  resendCooldown,
  error,
  onClose,
  onChangeDestination,
  onVerify,
  onResend,
  onClearError,
}: OtpVerificationSheetProps) {
  const sheetRef = useRef<MokuBottomSheetRef>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setDigits(Array(OTP_LENGTH).fill(""));
    setActiveIndex(0);

    const focusTimer = window.setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 260);

    return () => window.clearTimeout(focusTimer);
  }, [isOpen, destination, target]);

  const handleDigitChange = (index: number, rawValue: string) => {
    const clean = rawValue.replace(/\D/g, "");
    onClearError?.();

    if (!clean) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    // Dukung paste / autofill OTP lebih dari 1 digit
    if (clean.length > 1) {
      const next = [...digits];
      for (let i = 0; i < OTP_LENGTH - index && i < clean.length; i++) {
        next[index + i] = clean[i];
      }
      setDigits(next);
      const nextFocus = Math.min(index + clean.length, OTP_LENGTH - 1);
      setActiveIndex(nextFocus);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = clean[0];
    setDigits(next);

    if (index < OTP_LENGTH - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      onClearError?.();
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
      onVerify(digits.join(""));
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
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
    const nextFocus = Math.min(pasted.length, OTP_LENGTH - 1);
    setActiveIndex(nextFocus);
    inputRefs.current[nextFocus]?.focus();
  };

  const handleChangeDestination = () => {
    sheetRef.current?.closeSheet(() => {
      onChangeDestination();
    });
  };

  const isEmail = target === "email";
  const formattedDestination = isEmail ? destination : `+62 ${destination}`;

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

      {/* 6 Kotak Input OTP */}
      <div className="grid grid-cols-6 gap-[calc(8*var(--u))] px-[calc(8*var(--u))]">
        {digits.map((digit, idx) => {
          const isFocused = activeIndex === idx;
          return (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={idx === 0 ? "one-time-code" : "off"}
              maxLength={OTP_LENGTH}
              value={digit}
              aria-label={`Digit OTP ke-${idx + 1}`}
              onFocus={() => setActiveIndex(idx)}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              style={{
                height: "calc(50 * var(--u))",
              }}
              className={`w-full rounded-[calc(12*var(--u))] border text-center font-display text-[calc(20*var(--u))] font-bold text-[#171717] caret-[#740319] outline-none transition-colors duration-200 ${
                error
                  ? "border-[#C8102E] bg-[#FFF9FA]"
                  : isFocused
                  ? "border-[1.5px] border-[#740319] bg-white"
                  : "border-[#D4D4DC] bg-white"
              }`}
            />
          );
        })}
      </div>

      {/* Pesan Error Validasi OTP */}
      {error && (
        <p
          role="alert"
          style={{ margin: 0, marginTop: "calc(10 * var(--u))" }}
          className="flex items-center justify-center gap-[calc(5*var(--u))] text-[calc(12*var(--u))] font-medium text-[#C8102E]"
        >
          <WarningCircle
            weight="fill"
            className="h-[calc(14*var(--u))] w-[calc(14*var(--u))] shrink-0"
          />
          <span>{error}</span>
        </p>
      )}

      {/* Info Masa Berlaku OTP */}
      <div
        style={{
          marginTop: "calc(16 * var(--u))",
          marginBottom: "calc(20 * var(--u))",
        }}
        className="flex items-center justify-center gap-[calc(6*var(--u))] text-[calc(12.5*var(--u))] text-[#3F3F46]"
      >
        <Clock
          weight="regular"
          className="h-[calc(15*var(--u))] w-[calc(15*var(--u))] shrink-0 text-[#171717]"
        />
        <span>Kode OTP berlaku selama 5 menit.</span>
      </div>

      {/* Tombol Verifikasi */}
      <button
        type="button"
        onClick={() => onVerify(digits.join(""))}
        className="flex min-h-[calc(48*var(--u))] w-full cursor-pointer items-center justify-center rounded-[calc(12*var(--u))] bg-[#740319] px-[calc(18*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(15*var(--u))] font-semibold text-white transition-[transform,background-color] duration-200 active:scale-[0.985] active:bg-[#5B0213]"
      >
        Verifikasi
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
            onClick={onResend}
            className="cursor-pointer font-semibold text-[#740319] underline underline-offset-2 active:opacity-75"
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
          onClick={handleChangeDestination}
          className="inline-flex cursor-pointer items-center justify-center gap-[calc(8*var(--u))] py-[calc(4*var(--u))] font-display text-[calc(14*var(--u))] font-semibold text-[#740319] underline underline-offset-4 transition-opacity duration-200 active:opacity-75"
        >
          <PencilSimpleLine
            weight="regular"
            className="h-[calc(17*var(--u))] w-[calc(17*var(--u))]"
          />
          <span>{isEmail ? "Ubah Email" : "Ubah Nomor Telepon"}</span>
        </button>
      </div>
    </MokuBottomSheet>
  );
          }
