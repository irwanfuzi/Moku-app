import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  Buildings,
  CaretRight,
  CheckCircle,
  FileText,
  Info,
  Lock,
  Moon,
  Question,
  ShieldCheck,
  SignOut,
  Translate,
  User,
} from "@phosphor-icons/react";
import { useAppLayout } from "@/components/layout/app-shell";
import MokuModalDialog from "@/components/ui/moku-modal-dialog";

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

export default function ProfilePage() {
  const { isMobile, isReady, navigateWithTransition } = useAppLayout();

  const [avatarError, setAvatarError] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const handleToggleDarkMode = () => {
    triggerHaptic(8);
    setDarkMode((prev) => {
      const next = !prev;
      triggerToast(next ? "Mode Gelap segera hadir." : "Mode Terang aktif.");
      return next;
    });
  };

  const handleConfirmLogout = () => {
    triggerHaptic(12);
    setShowLogoutModal(false);
    navigateWithTransition("/login", "back");
  };

  return (
    <main
      style={MOBILE_SCALE_VARS}
      className="min-h-dvh w-full min-w-0 overflow-x-clip bg-[#FAFAFB] pb-[calc(104*var(--u)+env(safe-area-inset-bottom))]"
    >
      {/* Header Profil Marun */}
      <header className="w-full bg-[#740319] text-white">
        <div
          style={{
            paddingTop: "calc(env(safe-area-inset-top) + 26 * var(--u))",
            paddingBottom: "calc(22 * var(--u))",
          }}
          className="mx-auto flex w-full max-w-[680px] flex-col items-center px-[calc(16*var(--u))] text-center"
        >
          {/* Avatar Lingkaran + Border Putih */}
          <div
            style={{
              width: "calc(110 * var(--u))",
              height: "calc(110 * var(--u))",
              marginBottom: "calc(12 * var(--u))",
            }}
            className="flex items-center justify-center overflow-hidden rounded-full border-[calc(3.5*var(--u))] border-white bg-[#FCECEF]"
          >
            {!avatarError ? (
              <img
                src={AVATAR_URL}
                alt="Budi Santoso"
                onError={() => setAvatarError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-display text-[calc(34*var(--u))] font-bold text-[#740319]">
                BS
              </span>
            )}
          </div>

          {/* Nama & Email */}
          <h1
            style={{ margin: 0, marginBottom: "calc(4 * var(--u))" }}
            className="font-display text-[calc(22*var(--u))] font-bold leading-tight tracking-[-0.02em] text-white"
          >
            Budi Santoso
          </h1>
          <p
            style={{ margin: 0, marginBottom: "calc(14 * var(--u))" }}
            className="text-[calc(14*var(--u))] font-normal leading-snug text-white/90"
          >
            budi.santoso@moku.id
          </p>

          {/* Jabatan | Cabang */}
          <div className="flex items-center justify-center gap-[calc(12*var(--u))] text-[calc(13*var(--u))] font-normal text-white/95">
            <span className="inline-flex items-center gap-[calc(6*var(--u))]">
              <User
                weight="regular"
                className="h-[calc(15.5*var(--u))] w-[calc(15.5*var(--u))]"
              />
              Teknisi
            </span>

            <span className="h-[calc(13*var(--u))] w-[1px] bg-white/45" />

            <span className="inline-flex items-center gap-[calc(6*var(--u))]">
              <Buildings
                weight="regular"
                className="h-[calc(15.5*var(--u))] w-[calc(15.5*var(--u))]"
              />
              Cabang Jakarta 3
            </span>
          </div>
        </div>
      </header>

      {/* Konten Menu Profil */}
      <div className="moku-profile-enter mx-auto w-full max-w-[680px] space-y-[calc(18*var(--u))] px-[calc(16*var(--u))] pt-[calc(20*var(--u))]">
        {/* 1. Seksi Akun */}
        <section>
          <h2
            style={{ margin: 0, marginBottom: "calc(10 * var(--u))" }}
            className="px-[calc(2*var(--u))] font-display text-[calc(15*var(--u))] font-bold text-[#171717]"
          >
            Akun
          </h2>

          <div className="divide-y divide-[#F0F0F4] rounded-[calc(14*var(--u))] border border-[#EFEFF3] bg-white px-[calc(16*var(--u))]">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                triggerToast("Halaman Informasi Akun segera tersedia.");
              }}
              className="flex w-full items-center justify-between gap-[calc(10*var(--u))] py-[calc(14*var(--u))] text-left transition-opacity active:opacity-70"
            >
              <span className="flex items-center gap-[calc(14*var(--u))] text-[calc(14.5*var(--u))] font-normal text-[#171717]">
                <User
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#1E1E24]"
                />
                Informasi Akun
              </span>
              <CaretRight
                weight="regular"
                className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#4A4A54]"
              />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                triggerToast("Halaman Ubah Kata Sandi segera tersedia.");
              }}
              className="flex w-full items-center justify-between gap-[calc(10*var(--u))] py-[calc(14*var(--u))] text-left transition-opacity active:opacity-70"
            >
              <span className="flex items-center gap-[calc(14*var(--u))] text-[calc(14.5*var(--u))] font-normal text-[#171717]">
                <Lock
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#1E1E24]"
                />
                Ubah Kata Sandi
              </span>
              <CaretRight
                weight="regular"
                className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#4A4A54]"
              />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                triggerToast("Halaman Keamanan Akun segera tersedia.");
              }}
              className="flex w-full items-center justify-between gap-[calc(10*var(--u))] py-[calc(14*var(--u))] text-left transition-opacity active:opacity-70"
            >
              <span className="flex items-center gap-[calc(14*var(--u))] text-[calc(14.5*var(--u))] font-normal text-[#171717]">
                <ShieldCheck
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#1E1E24]"
                />
                Keamanan Akun
              </span>
              <CaretRight
                weight="regular"
                className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#4A4A54]"
              />
            </button>
          </div>
        </section>

        {/* 2. Seksi Preferensi */}
        <section>
          <h2
            style={{ margin: 0, marginBottom: "calc(10 * var(--u))" }}
            className="px-[calc(2*var(--u))] font-display text-[calc(15*var(--u))] font-bold text-[#171717]"
          >
            Preferensi
          </h2>

          <div className="divide-y divide-[#F0F0F4] rounded-[calc(14*var(--u))] border border-[#EFEFF3] bg-white px-[calc(16*var(--u))]">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                navigateWithTransition("/notifications", "forward");
              }}
              className="flex w-full items-center justify-between gap-[calc(10*var(--u))] py-[calc(14*var(--u))] text-left transition-opacity active:opacity-70"
            >
              <span className="flex items-center gap-[calc(14*var(--u))] text-[calc(14.5*var(--u))] font-normal text-[#171717]">
                <Bell
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#1E1E24]"
                />
                Notifikasi
              </span>
              <CaretRight
                weight="regular"
                className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#4A4A54]"
              />
            </button>

            <div className="flex items-center justify-between gap-[calc(10*var(--u))] py-[calc(13*var(--u))]">
              <span className="flex items-center gap-[calc(14*var(--u))] text-[calc(14.5*var(--u))] font-normal text-[#171717]">
                <Moon
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#1E1E24]"
                />
                Mode Gelap
              </span>

              <button
                type="button"
                role="switch"
                aria-checked={darkMode}
                aria-label="Mode Gelap"
                onClick={handleToggleDarkMode}
                className={`relative inline-flex h-[calc(24*var(--u))] w-[calc(44*var(--u))] shrink-0 items-center rounded-full transition-colors duration-200 ${
                  darkMode ? "bg-[#740319]" : "bg-[#C8C8CE]"
                }`}
              >
                <span
                  className={`inline-block h-[calc(19*var(--u))] w-[calc(19*var(--u))] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    darkMode
                      ? "translate-x-[calc(22*var(--u))]"
                      : "translate-x-[calc(2.5*var(--u))]"
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                triggerToast("Bahasa aktif: Bahasa Indonesia.");
              }}
              className="flex w-full items-center justify-between gap-[calc(10*var(--u))] py-[calc(14*var(--u))] text-left transition-opacity active:opacity-70"
            >
              <span className="flex items-center gap-[calc(14*var(--u))] text-[calc(14.5*var(--u))] font-normal text-[#171717]">
                <Translate
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#1E1E24]"
                />
                Bahasa
              </span>

              <span className="flex items-center gap-[calc(6*var(--u))]">
                <span className="text-[calc(13.5*var(--u))] font-normal text-[#6B6B76]">
                  Bahasa Indonesia
                </span>
                <CaretRight
                  weight="regular"
                  className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#4A4A54]"
                />
              </span>
            </button>
          </div>
        </section>

        {/* 3. Seksi Lainnya */}
        <section>
          <h2
            style={{ margin: 0, marginBottom: "calc(10 * var(--u))" }}
            className="px-[calc(2*var(--u))] font-display text-[calc(15*var(--u))] font-bold text-[#171717]"
          >
            Lainnya
          </h2>

          <div className="divide-y divide-[#F0F0F4] rounded-[calc(14*var(--u))] border border-[#EFEFF3] bg-white px-[calc(16*var(--u))]">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                triggerToast("Halaman Kebijakan Privasi segera tersedia.");
              }}
              className="flex w-full items-center justify-between gap-[calc(10*var(--u))] py-[calc(14*var(--u))] text-left transition-opacity active:opacity-70"
            >
              <span className="flex items-center gap-[calc(14*var(--u))] text-[calc(14.5*var(--u))] font-normal text-[#171717]">
                <FileText
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#1E1E24]"
                />
                Kebijakan Privasi
              </span>
              <CaretRight
                weight="regular"
                className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#4A4A54]"
              />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                triggerToast("Halaman Pusat Bantuan segera tersedia.");
              }}
              className="flex w-full items-center justify-between gap-[calc(10*var(--u))] py-[calc(14*var(--u))] text-left transition-opacity active:opacity-70"
            >
              <span className="flex items-center gap-[calc(14*var(--u))] text-[calc(14.5*var(--u))] font-normal text-[#171717]">
                <Question
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#1E1E24]"
                />
                Pusat Bantuan
              </span>
              <CaretRight
                weight="regular"
                className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#4A4A54]"
              />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                triggerToast("MOKU — Monitoring Operasional Kunjungan Unit v1.4.0");
              }}
              className="flex w-full items-center justify-between gap-[calc(10*var(--u))] py-[calc(14*var(--u))] text-left transition-opacity active:opacity-70"
            >
              <span className="flex items-center gap-[calc(14*var(--u))] text-[calc(14.5*var(--u))] font-normal text-[#171717]">
                <Info
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#1E1E24]"
                />
                Tentang MOKU
              </span>

              <span className="flex items-center gap-[calc(6*var(--u))]">
                <span className="text-[calc(13.5*var(--u))] font-normal text-[#6B6B76]">
                  v1.4.0
                </span>
                <CaretRight
                  weight="regular"
                  className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#4A4A54]"
                />
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setShowLogoutModal(true);
              }}
              className="flex w-full items-center justify-between gap-[calc(10*var(--u))] py-[calc(14*var(--u))] text-left transition-opacity active:opacity-70"
            >
              <span className="flex items-center gap-[calc(14*var(--u))] text-[calc(14.5*var(--u))] font-semibold text-[#C8102E]">
                <SignOut
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#C8102E]"
                />
                Keluar Akun
              </span>
              <CaretRight
                weight="regular"
                className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#4A4A54]"
              />
            </button>
          </div>
        </section>
      </div>

      {/* Modal Konfirmasi Keluar */}
      <MokuModalDialog
        isOpen={showLogoutModal}
        title="Keluar dari Akun?"
        description="Anda perlu masuk kembali untuk mengakses data kunjungan MOKU."
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        tone="danger"
        icon={
          <SignOut
            weight="bold"
            className="h-[calc(25*var(--u))] w-[calc(25*var(--u))] text-[#8E001C]"
          />
        }
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Snackbar Feedback */}
      {toast &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            key={toast.id}
            style={MOBILE_SCALE_VARS}
            role="status"
            aria-live="polite"
            className={`fixed bottom-[calc(78px+env(safe-area-inset-bottom))] left-4 right-4 z-[9998] mx-auto flex max-w-[600px] items-center gap-[calc(10*var(--u))] rounded-[calc(12*var(--u))] bg-[#22252A] px-[calc(14*var(--u))] py-[calc(11*var(--u))] text-white shadow-[0_8px_22px_rgba(0,0,0,0.26)] ${
              isToastClosing
                ? "moku-toast-exit pointer-events-none"
                : "moku-toast-enter"
            }`}
          >
            <CheckCircle
              weight="fill"
              className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0 text-[#22C55E]"
            />
            <span className="truncate text-[calc(12.5*var(--u))] font-medium text-white">
              {toast.message}
            </span>
          </div>,
          document.body
        )}

      <style>{`
        .moku-profile-enter {
          animation: moku-profile-in 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .moku-toast-enter {
          animation: moku-toast-up 380ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .moku-toast-exit {
          animation: moku-toast-down 320ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
        @keyframes moku-profile-in {
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
