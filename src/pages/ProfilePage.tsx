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
import { useAccountProfile } from "@/lib/account-profile";

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
  const profile = useAccountProfile();

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
      {/* Header Profil Marun — Vertical Rhythm 4u & Proximity */}
      <header className="w-full bg-[#740319] text-white">
        <div
          style={{
            paddingTop: "calc(env(safe-area-inset-top) + 24 * var(--u))",
            paddingBottom: "calc(24 * var(--u))",
          }}
          className="mx-auto flex w-full max-w-[680px] flex-col items-center px-[calc(16*var(--u))] text-center"
        >
          {/* Avatar Lingkaran + Border Putih */}
          <div
            style={{
              width: "calc(112 * var(--u))",
              height: "calc(112 * var(--u))",
              marginBottom: "calc(12 * var(--u))",
            }}
            className="flex items-center justify-center overflow-hidden rounded-full border-[calc(3.5*var(--u))] border-white bg-[#FCECEF]"
          >
            {!avatarError ? (
              <img
                src={AVATAR_URL}
                alt={profile.fullName}
                onError={() => setAvatarError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-display text-[calc(34*var(--u))] font-bold text-[#740319]">
                BS
              </span>
            )}
          </div>

          {/* Grup Identitas Inti: Nama & Email (rapat 4u) */}
          <h1
            style={{ margin: 0, marginBottom: "calc(4 * var(--u))" }}
            className="font-display text-[calc(22*var(--u))] font-bold leading-tight tracking-[-0.02em] text-white"
          >
            {profile.fullName}
          </h1>
          <p
            style={{ margin: 0, marginBottom: "calc(16 * var(--u))" }}
            className="text-[calc(14*var(--u))] font-normal leading-snug text-white/90"
          >
            {profile.email}
          </p>

          {/* Grup Metadata Operasional: Jabatan | Cabang (terpisah 16u) */}
          <div className="flex items-center justify-center gap-[calc(12*var(--u))] text-[calc(13*var(--u))] font-normal text-white/95">
            <span className="inline-flex items-center gap-[calc(6*var(--u))]">
              <User
                weight="regular"
                className="h-[calc(16*var(--u))] w-[calc(16*var(--u))]"
              />
              {profile.role}
            </span>

            <span className="h-[calc(12*var(--u))] w-[1px] bg-white/45" />

            <span className="inline-flex items-center gap-[calc(6*var(--u))]">
              <Buildings
                weight="regular"
                className="h-[calc(16*var(--u))] w-[calc(16*var(--u))]"
              />
              {profile.branch}
            </span>
          </div>
        </div>
      </header>

      {/* Konten Menu Profil — Jarak antar-seksi 24u, judul ke kartu 8u */}
      <div className="moku-profile-enter mx-auto w-full max-w-[680px] space-y-[calc(24*var(--u))] px-[calc(16*var(--u))] pt-[calc(24*var(--u))]">
        {/* 1. Seksi Akun */}
        <section>
          <h2
            style={{ margin: 0, marginBottom: "calc(8 * var(--u))" }}
            className="px-[calc(4*var(--u))] font-display text-[calc(15*var(--u))] font-bold text-[#171717]"
          >
            Akun
          </h2>

          <div className="divide-y divide-[#F0F0F4] overflow-hidden rounded-[calc(16*var(--u))] border border-[#EFEFF3] bg-white">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                navigateWithTransition("/profile/account-info", "forward");
              }}
              className="group flex min-h-[calc(48*var(--u))] w-full cursor-pointer select-none items-center justify-between gap-[calc(12*var(--u))] px-[calc(16*var(--u))] py-[calc(12*var(--u))] text-left transition-colors duration-150 active:bg-[#F4F4F7]"
            >
              <span className="flex items-center gap-[calc(12*var(--u))] text-[calc(14.5*var(--u))] font-normal text-[#171717]">
                <User
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#1E1E24]"
                />
                Informasi Akun
              </span>
              <CaretRight
                weight="regular"
                className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#8A8A96] transition-transform duration-150 group-active:translate-x-[2px]"
              />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                triggerToast("Halaman Ubah Kata Sandi segera tersedia.");
              }}
              className="group flex min-h-[calc(48*var(--u))] w-full cursor-pointer select-none items-center justify-between gap-[calc(12*var(--u))] px-[calc(16*var(--u))] py-[calc(12*var(--u))] text-left transition-colors duration-150 active:bg-[#F4F4F7]"
            >
              <span className="flex items-center gap-[calc(12*var(--u))] text-[calc(14.5*var(--u))] font-normal text-[#171717]">
                <Lock
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#1E1E24]"
                />
                Ubah Kata Sandi
              </span>
              <CaretRight
                weight="regular"
                className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#8A8A96] transition-transform duration-150 group-active:translate-x-[2px]"
              />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                triggerToast("Halaman Keamanan Akun segera tersedia.");
              }}
              className="group flex min-h-[calc(48*var(--u))] w-full cursor-pointer select-none items-center justify-between gap-[calc(12*var(--u))] px-[calc(16*var(--u))] py-[calc(12*var(--u))] text-left transition-colors duration-150 active:bg-[#F4F4F7]"
            >
              <span className="flex items-center gap-[calc(12*var(--u))] text-[calc(14.5*var(--u))] font-normal text-[#171717]">
                <ShieldCheck
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#1E1E24]"
                />
                Keamanan Akun
              </span>
              <CaretRight
                weight="regular"
                className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#8A8A96] transition-transform duration-150 group-active:translate-x-[2px]"
              />
            </button>
          </div>
        </section>

        {/* 2. Seksi Preferensi */}
        <section>
          <h2
            style={{ margin: 0, marginBottom: "calc(8 * var(--u))" }}
            className="px-[calc(4*var(--u))] font-display text-[calc(15*var(--u))] font-bold text-[#171717]"
          >
            Preferensi
          </h2>

          <div className="divide-y divide-[#F0F0F4] overflow-hidden rounded-[calc(16*var(--u))] border border-[#EFEFF3] bg-white">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                navigateWithTransition("/notifications", "forward");
              }}
              className="group flex min-h-[calc(48*var(--u))] w-full cursor-pointer select-none items-center justify-between gap-[calc(12*var(--u))] px-[calc(16*var(--u))] py-[calc(12*var(--u))] text-left transition-colors duration-150 active:bg-[#F4F4F7]"
            >
              <span className="flex items-center gap-[calc(12*var(--u))] text-[calc(14.5*var(--u))] font-normal text-[#171717]">
                <Bell
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#1E1E24]"
                />
                Notifikasi
              </span>
              <CaretRight
                weight="regular"
                className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#8A8A96] transition-transform duration-150 group-active:translate-x-[2px]"
              />
            </button>

            <div className="flex min-h-[calc(48*var(--u))] items-center justify-between gap-[calc(12*var(--u))] px-[calc(16*var(--u))] py-[calc(12*var(--u))]">
              <span className="flex items-center gap-[calc(12*var(--u))] text-[calc(14.5*var(--u))] font-normal text-[#171717]">
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
                className={`relative inline-flex h-[calc(24*var(--u))] w-[calc(44*var(--u))] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 active:scale-95 ${
                  darkMode ? "bg-[#740319]" : "bg-[#C8C8CE]"
                }`}
              >
                <span
                  className={`inline-block h-[calc(20*var(--u))] w-[calc(20*var(--u))] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.22)] transition-transform duration-200 ${
                    darkMode
                      ? "translate-x-[calc(22*var(--u))]"
                      : "translate-x-[calc(2*var(--u))]"
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
              className="group flex min-h-[calc(48*var(--u))] w-full cursor-pointer select-none items-center justify-between gap-[calc(12*var(--u))] px-[calc(16*var(--u))] py-[calc(12*var(--u))] text-left transition-colors duration-150 active:bg-[#F4F4F7]"
            >
              <span className="flex items-center gap-[calc(12*var(--u))] text-[calc(14.5*var(--u))] font-normal text-[#171717]">
                <Translate
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#1E1E24]"
                />
                Bahasa
              </span>

              <span className="flex items-center gap-[calc(8*var(--u))]">
                <span className="text-[calc(13.5*var(--u))] font-normal text-[#6B6B76]">
                  Bahasa Indonesia
                </span>
                <CaretRight
                  weight="regular"
                  className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#8A8A96] transition-transform duration-150 group-active:translate-x-[2px]"
                />
              </span>
            </button>
          </div>
        </section>

        {/* 3. Seksi Lainnya */}
        <section>
          <h2
            style={{ margin: 0, marginBottom: "calc(8 * var(--u))" }}
            className="px-[calc(4*var(--u))] font-display text-[calc(15*var(--u))] font-bold text-[#171717]"
          >
            Lainnya
          </h2>

          <div className="divide-y divide-[#F0F0F4] overflow-hidden rounded-[calc(16*var(--u))] border border-[#EFEFF3] bg-white">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                triggerToast("Halaman Kebijakan Privasi segera tersedia.");
              }}
              className="group flex min-h-[calc(48*var(--u))] w-full cursor-pointer select-none items-center justify-between gap-[calc(12*var(--u))] px-[calc(16*var(--u))] py-[calc(12*var(--u))] text-left transition-colors duration-150 active:bg-[#F4F4F7]"
            >
              <span className="flex items-center gap-[calc(12*var(--u))] text-[calc(14.5*var(--u))] font-normal text-[#171717]">
                <FileText
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#1E1E24]"
                />
                Kebijakan Privasi
              </span>
              <CaretRight
                weight="regular"
                className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#8A8A96] transition-transform duration-150 group-active:translate-x-[2px]"
              />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                triggerToast("Halaman Pusat Bantuan segera tersedia.");
              }}
              className="group flex min-h-[calc(48*var(--u))] w-full cursor-pointer select-none items-center justify-between gap-[calc(12*var(--u))] px-[calc(16*var(--u))] py-[calc(12*var(--u))] text-left transition-colors duration-150 active:bg-[#F4F4F7]"
            >
              <span className="flex items-center gap-[calc(12*var(--u))] text-[calc(14.5*var(--u))] font-normal text-[#171717]">
                <Question
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#1E1E24]"
                />
                Pusat Bantuan
              </span>
              <CaretRight
                weight="regular"
                className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#8A8A96] transition-transform duration-150 group-active:translate-x-[2px]"
              />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                triggerToast("MOKU — Monitoring Operasional Kunjungan Unit v1.4.0");
              }}
              className="group flex min-h-[calc(48*var(--u))] w-full cursor-pointer select-none items-center justify-between gap-[calc(12*var(--u))] px-[calc(16*var(--u))] py-[calc(12*var(--u))] text-left transition-colors duration-150 active:bg-[#F4F4F7]"
            >
              <span className="flex items-center gap-[calc(12*var(--u))] text-[calc(14.5*var(--u))] font-normal text-[#171717]">
                <Info
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#1E1E24]"
                />
                Tentang MOKU
              </span>

              <span className="flex items-center gap-[calc(8*var(--u))]">
                <span className="text-[calc(13.5*var(--u))] font-normal text-[#6B6B76]">
                  v1.4.0
                </span>
                <CaretRight
                  weight="regular"
                  className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#8A8A96] transition-transform duration-150 group-active:translate-x-[2px]"
                />
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setShowLogoutModal(true);
              }}
              className="group flex min-h-[calc(48*var(--u))] w-full cursor-pointer select-none items-center justify-between gap-[calc(12*var(--u))] px-[calc(16*var(--u))] py-[calc(12*var(--u))] text-left transition-colors duration-150 active:bg-[#FDF2F4]"
            >
              <span className="flex items-center gap-[calc(12*var(--u))] text-[calc(14.5*var(--u))] font-semibold text-[#C8102E]">
                <SignOut
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] text-[#C8102E]"
                />
                Keluar Akun
              </span>
              <CaretRight
                weight="regular"
                className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#C8102E]/70 transition-transform duration-150 group-active:translate-x-[2px]"
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
            className="h-[calc(24*var(--u))] w-[calc(24*var(--u))] text-[#8E001C]"
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
            className={`fixed bottom-[calc(80px+env(safe-area-inset-bottom))] left-4 right-4 z-[9998] mx-auto flex max-w-[600px] items-center gap-[calc(12*var(--u))] rounded-[calc(12*var(--u))] bg-[#22252A] px-[calc(16*var(--u))] py-[calc(12*var(--u))] text-white shadow-[0_8px_22px_rgba(0,0,0,0.26)] ${
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
