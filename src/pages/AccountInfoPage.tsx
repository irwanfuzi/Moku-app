import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { useIonRouter } from "@ionic/react";
import {
  ArrowLeft,
  Briefcase,
  Buildings,
  CalendarBlank,
  Camera,
  CheckCircle,
  EnvelopeSimple,
  PencilSimple,
  Phone,
  User,
  UserCircle,
} from "@phosphor-icons/react";
import { useAppLayout } from "@/components/layout/app-shell";

const AVATAR_URL = "/images/moku/brand/moku-avatar.png";

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

const SNACKBAR_EXIT_MS = 320;

function triggerHaptic(duration = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(duration);
  }
}

export default function AccountInfoPage() {
  const { isMobile, isReady, navigateWithTransition } = useAppLayout();
  const ionRouter = useIonRouter();

  const [avatarError, setAvatarError] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(
    null
  );
  const [isToastClosing, setIsToastClosing] = useState(false);

  const toastAutoRef = useRef<number | null>(null);
  const toastExitRef = useRef<number | null>(null);

  const isMobileView = !isReady || isMobile;

  useEffect(() => {
    if (!isMobileView) return;
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((meta) => meta.setAttribute("content", "#740319"));
  }, [isMobileView]);

  const dismissToast = useCallback(() => {
    if (toastAutoRef.current !== null) {
      window.clearTimeout(toastAutoRef.current);
      toastAutoRef.current = null;
    }
    setIsToastClosing(true);
    if (toastExitRef.current !== null) {
      window.clearTimeout(toastExitRef.current);
    }
    toastExitRef.current = window.setTimeout(() => {
      setToast(null);
      setIsToastClosing(false);
      toastExitRef.current = null;
    }, SNACKBAR_EXIT_MS);
  }, []);

  const triggerToast = useCallback(
    (message: string) => {
      if (toastAutoRef.current !== null) {
        window.clearTimeout(toastAutoRef.current);
      }
      if (toastExitRef.current !== null) {
        window.clearTimeout(toastExitRef.current);
      }
      setIsToastClosing(false);
      setToast({ id: Date.now(), message });
      toastAutoRef.current = window.setTimeout(() => {
        dismissToast();
      }, 2800);
    },
    [dismissToast]
  );

  useEffect(() => {
    return () => {
      if (toastAutoRef.current !== null) {
        window.clearTimeout(toastAutoRef.current);
      }
      if (toastExitRef.current !== null) {
        window.clearTimeout(toastExitRef.current);
      }
    };
  }, []);

  const handleBack = () => {
    triggerHaptic(6);
    if (ionRouter.canGoBack()) {
      ionRouter.goBack();
    } else {
      navigateWithTransition("/profile", "back");
    }
  };

  return (
    <main
      style={MOBILE_SCALE_VARS}
      className="min-h-dvh w-full min-w-0 overflow-x-clip bg-[#FAFAFB] pb-[calc(40*var(--u)+env(safe-area-inset-bottom))]"
    >
      {/* Header Marun — Vertical Rhythm 4u */}
      <header className="sticky top-0 z-40 w-full bg-[#740319] text-white">
        <div
          style={{
            paddingTop: "calc(env(safe-area-inset-top) + 12 * var(--u))",
            paddingBottom: "calc(12 * var(--u))",
          }}
          className="mx-auto flex w-full max-w-[680px] items-center gap-[calc(8*var(--u))] px-[calc(12*var(--u))]"
        >
          <button
            type="button"
            onClick={handleBack}
            aria-label="Kembali"
            className="flex h-[calc(40*var(--u))] w-[calc(40*var(--u))] shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-[transform,background-color] duration-150 active:scale-90 active:bg-white/15"
          >
            <ArrowLeft
              weight="regular"
              className="h-[calc(22*var(--u))] w-[calc(22*var(--u))]"
            />
          </button>

          <h1
            style={{ margin: 0 }}
            className="font-display text-[calc(19*var(--u))] font-bold leading-tight tracking-[-0.015em] text-white"
          >
            Informasi Akun
          </h1>
        </div>
      </header>

      {/* Konten Utama */}
      <div className="moku-account-enter mx-auto w-full max-w-[680px] px-[calc(16*var(--u))] pt-[calc(24*var(--u))]">
        {/* Grup Identitas: Avatar → Nama (12u) → Role (4u) */}
        <section className="flex flex-col items-center text-center">
          <div
            style={{ marginBottom: "calc(12 * var(--u))" }}
            className="relative"
          >
            <div
              style={{
                width: "calc(104 * var(--u))",
                height: "calc(104 * var(--u))",
              }}
              className="flex items-center justify-center overflow-hidden rounded-full bg-[#FCECEF]"
            >
              {!avatarError ? (
                <img
                  src={AVATAR_URL}
                  alt="Budi Santoso"
                  onError={() => setAvatarError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-display text-[calc(32*var(--u))] font-bold text-[#740319]">
                  BS
                </span>
              )}
            </div>

            {/* Badge Tombol Kamera (Interaktif) */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                triggerToast("Fitur ubah foto profil segera tersedia.");
              }}
              aria-label="Ubah Foto Profil"
              style={{
                width: "calc(32 * var(--u))",
                height: "calc(32 * var(--u))",
              }}
              className="absolute bottom-0 right-0 flex cursor-pointer items-center justify-center rounded-full border-[calc(2.5*var(--u))] border-white bg-[#740319] text-white shadow-[0_2px_8px_rgba(116,3,25,0.35)] transition-[transform,background-color] duration-150 active:scale-90 active:bg-[#5B0213]"
            >
              <Camera
                weight="fill"
                className="h-[calc(16*var(--u))] w-[calc(16*var(--u))]"
              />
            </button>
          </div>

          <h2
            style={{ margin: 0, marginBottom: "calc(4 * var(--u))" }}
            className="font-display text-[calc(21*var(--u))] font-bold leading-tight tracking-[-0.02em] text-[#171717]"
          >
            Budi Santoso
          </h2>
          <p
            style={{ margin: 0 }}
            className="text-[calc(13.5*var(--u))] font-normal text-[#6B6B76]"
          >
            Teknisi
          </p>
        </section>

        {/* Kartu 1: Data Pribadi (Terpisah 24u dari identitas) */}
        <section
          style={{ marginTop: "calc(24 * var(--u))" }}
          className="rounded-[calc(16*var(--u))] border border-[#EFEFF3] bg-white px-[calc(16*var(--u))] pb-[calc(4*var(--u))] pt-[calc(16*var(--u))] shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
        >
          <h3
            style={{ margin: 0, marginBottom: "calc(8 * var(--u))" }}
            className="font-display text-[calc(15.5*var(--u))] font-bold text-[#171717]"
          >
            Data Pribadi
          </h3>

          <div className="divide-y divide-[#F0F0F4]">
            <div className="flex min-h-[calc(48*var(--u))] items-center justify-between gap-[calc(12*var(--u))] py-[calc(12*var(--u))]">
              <span className="flex shrink-0 items-center gap-[calc(12*var(--u))] text-[calc(13.5*var(--u))] font-normal text-[#6B6B76]">
                <User
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#52525B]"
                />
                Nama Lengkap
              </span>
              <span className="select-text truncate text-right text-[calc(13.5*var(--u))] font-medium text-[#171717]">
                Budi Santoso
              </span>
            </div>

            <div className="flex min-h-[calc(48*var(--u))] items-center justify-between gap-[calc(12*var(--u))] py-[calc(12*var(--u))]">
              <span className="flex shrink-0 items-center gap-[calc(12*var(--u))] text-[calc(13.5*var(--u))] font-normal text-[#6B6B76]">
                <UserCircle
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#52525B]"
                />
                Username
              </span>
              <span className="select-text truncate text-right text-[calc(13.5*var(--u))] font-medium text-[#171717]">
                budisantoso
              </span>
            </div>

            <div className="flex min-h-[calc(48*var(--u))] items-center justify-between gap-[calc(12*var(--u))] py-[calc(12*var(--u))]">
              <span className="flex shrink-0 items-center gap-[calc(12*var(--u))] text-[calc(13.5*var(--u))] font-normal text-[#6B6B76]">
                <EnvelopeSimple
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#52525B]"
                />
                Email
              </span>
              <span className="select-text truncate text-right text-[calc(13.5*var(--u))] font-medium text-[#171717]">
                budi.santoso@moku.id
              </span>
            </div>

            <div className="flex min-h-[calc(48*var(--u))] items-center justify-between gap-[calc(12*var(--u))] py-[calc(12*var(--u))]">
              <span className="flex shrink-0 items-center gap-[calc(12*var(--u))] text-[calc(13.5*var(--u))] font-normal text-[#6B6B76]">
                <Phone
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#52525B]"
                />
                Nomor Telepon
              </span>
              <span className="select-text truncate text-right text-[calc(13.5*var(--u))] font-medium text-[#171717]">
                +62 812-3456-7890
              </span>
            </div>
          </div>
        </section>

        {/* Kartu 2: Data Operasional (Jarak antar-kartu data 16u) */}
        <section
          style={{ marginTop: "calc(16 * var(--u))" }}
          className="rounded-[calc(16*var(--u))] border border-[#EFEFF3] bg-white px-[calc(16*var(--u))] pb-[calc(4*var(--u))] pt-[calc(16*var(--u))] shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
        >
          <h3
            style={{ margin: 0, marginBottom: "calc(8 * var(--u))" }}
            className="font-display text-[calc(15.5*var(--u))] font-bold text-[#171717]"
          >
            Data Operasional
          </h3>

          <div className="divide-y divide-[#F0F0F4]">
            <div className="flex min-h-[calc(48*var(--u))] items-center justify-between gap-[calc(12*var(--u))] py-[calc(12*var(--u))]">
              <span className="flex shrink-0 items-center gap-[calc(12*var(--u))] text-[calc(13.5*var(--u))] font-normal text-[#6B6B76]">
                <Briefcase
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#52525B]"
                />
                Jabatan / Role
              </span>
              <span className="select-text truncate text-right text-[calc(13.5*var(--u))] font-medium text-[#171717]">
                Teknisi
              </span>
            </div>

            <div className="flex min-h-[calc(48*var(--u))] items-center justify-between gap-[calc(12*var(--u))] py-[calc(12*var(--u))]">
              <span className="flex shrink-0 items-center gap-[calc(12*var(--u))] text-[calc(13.5*var(--u))] font-normal text-[#6B6B76]">
                <Buildings
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#52525B]"
                />
                Cabang
              </span>
              <span className="select-text truncate text-right text-[calc(13.5*var(--u))] font-medium text-[#171717]">
                Cabang Jakarta 3
              </span>
            </div>

            <div className="flex min-h-[calc(48*var(--u))] items-center justify-between gap-[calc(12*var(--u))] py-[calc(12*var(--u))]">
              <span className="flex shrink-0 items-center gap-[calc(12*var(--u))] text-[calc(13.5*var(--u))] font-normal text-[#6B6B76]">
                <CalendarBlank
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#52525B]"
                />
                Bergabung Sejak
              </span>
              <span className="select-text truncate text-right text-[calc(13.5*var(--u))] font-medium text-[#171717]">
                12 Jan 2024
              </span>
            </div>
          </div>
        </section>

        {/* Tombol Ubah Informasi Akun (Terpisah 24u dari kartu data) */}
        <section style={{ marginTop: "calc(24 * var(--u))" }}>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              navigateWithTransition("/profile/account-info/edit", "forward");
            }}
            className="flex min-h-[calc(48*var(--u))] w-full cursor-pointer select-none items-center justify-center gap-[calc(8*var(--u))] rounded-[calc(12*var(--u))] border-[1.5px] border-[#740319] bg-white px-[calc(16*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(14*var(--u))] font-semibold text-[#740319] transition-[transform,background-color] duration-150 active:scale-[0.985] active:bg-[#FDF2F4]"
          >
            <PencilSimple
              weight="regular"
              className="h-[calc(18*var(--u))] w-[calc(18*var(--u))]"
            />
            Ubah Informasi Akun
          </button>
        </section>
      </div>

      {/* Snackbar Feedback */}
      {toast &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            key={toast.id}
            style={MOBILE_SCALE_VARS}
            role="status"
            aria-live="polite"
            className={`fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-4 right-4 z-[9998] mx-auto flex max-w-[600px] items-center gap-[calc(12*var(--u))] rounded-[calc(12*var(--u))] bg-[#22252A] px-[calc(16*var(--u))] py-[calc(12*var(--u))] text-white shadow-[0_8px_22px_rgba(0,0,0,0.26)] ${
              isToastClosing
                ? "moku-toast-exit pointer-events-none"
                : "moku-toast-enter"
            }`}
          >
            <CheckCircle
              weight="fill"
              className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] shrink-0 text-[#22C55E]"
            />
            <span className="truncate text-[calc(12.5*var(--u))] font-medium text-white">
              {toast.message}
            </span>
          </div>,
          document.body
        )}

      <style>{`
        .moku-account-enter {
          animation: moku-account-in 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .moku-toast-enter {
          animation: moku-toast-up 380ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .moku-toast-exit {
          animation: moku-toast-down 320ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
        @keyframes moku-account-in {
          from {
            opacity: 0;
            transform: translate3d(0, 10px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes moku-toast-up {
          from {
            opacity: 0;
            transform: translate3d(0, 16px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes moku-toast-down {
          from {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
          to {
            opacity: 0;
            transform: translate3d(0, 16px, 0);
          }
        }
      `}</style>
    </main>
  );
}
