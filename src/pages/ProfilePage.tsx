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
  CaretRight,
  CheckCircle,
  IdentificationBadge,
  Info,
  LockKey,
  MapPin,
  PencilSimple,
  Phone,
  SignOut,
  User,
} from "@phosphor-icons/react";
import { useAppLayout } from "@/components/layout/app-shell";
import MokuModalDialog from "@/components/ui/moku-modal-dialog";

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

  const [notifEnabled, setNotifEnabled] = useState(true);
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
    metas.forEach((meta) => meta.setAttribute("content", "#83051C"));
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

  const handleToggleNotif = () => {
    triggerHaptic(8);
    setNotifEnabled((prev) => {
      const next = !prev;
      triggerToast(
        next ? "Notifikasi kunjungan diaktifkan." : "Notifikasi dimatikan."
      );
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
      className="min-h-dvh w-full min-w-0 overflow-x-clip bg-white pb-[calc(104*var(--u)+env(safe-area-inset-bottom))]"
    >
      {/* Header Marun */}
      <header className="sticky top-0 z-40 w-full bg-[#83051C] text-white">
        <div className="mx-auto flex w-full max-w-[680px] items-center justify-between px-[calc(16*var(--u))] pb-[calc(14*var(--u))] pt-[calc(env(safe-area-inset-top)+calc(12*var(--u)))]">
          <h1 className="font-display text-[calc(18*var(--u))] font-bold leading-tight tracking-[-0.02em] text-white">
            Profil
          </h1>
          <span className="rounded-full bg-white/15 px-[calc(10*var(--u))] py-[calc(4*var(--u))] text-[calc(11*var(--u))] font-semibold text-white">
            v1.0.0
          </span>
        </div>
      </header>

      {/* Body Konten */}
      <div className="moku-profile-enter mx-auto w-full max-w-[680px] space-y-[calc(14*var(--u))] px-[calc(16*var(--u))] pt-[calc(16*var(--u))]">
        {/* 1. Kartu Identitas Teknisi */}
        <section className="flex items-center gap-[calc(14*var(--u))] rounded-[calc(16*var(--u))] bg-[#FDF4F5] px-[calc(15*var(--u))] py-[calc(15*var(--u))]">
          <div className="flex h-[calc(58*var(--u))] w-[calc(58*var(--u))] shrink-0 items-center justify-center rounded-full bg-[#8E001C] font-display text-[calc(20*var(--u))] font-bold text-white">
            BS
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-[calc(16.5*var(--u))] font-bold leading-tight tracking-[-0.015em] text-[#171717]">
              Budi Santoso
            </h2>
            <p className="mt-[calc(3*var(--u))] truncate text-[calc(12.5*var(--u))] font-normal text-[#5A555F]">
              Teknisi Lapangan • TEK-001
            </p>
            <span className="mt-[calc(6*var(--u))] inline-flex items-center gap-[calc(4*var(--u))] rounded-full bg-[#DCF5E3] px-[calc(9*var(--u))] py-[calc(3*var(--u))] text-[calc(11*var(--u))] font-semibold text-[#15803D]">
              Aktif Bertugas
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(6);
              triggerToast("Fitur ubah profil segera tersedia.");
            }}
            aria-label="Ubah Profil"
            className="flex h-[calc(36*var(--u))] w-[calc(36*var(--u))] shrink-0 items-center justify-center rounded-full bg-white text-[#8E001C] transition-transform duration-200 active:scale-95"
          >
            <PencilSimple
              weight="bold"
              className="h-[calc(17*var(--u))] w-[calc(17*var(--u))]"
            />
          </button>
        </section>

        {/* 2. Ringkasan Kunjungan */}
        <section className="grid grid-cols-2 gap-[calc(10*var(--u))]">
          <div className="rounded-[calc(14*var(--u))] bg-[#F7F7F9] px-[calc(14*var(--u))] py-[calc(12*var(--u))]">
            <p className="text-[calc(11.5*var(--u))] font-normal text-[#5A555F]">
              Kunjungan Bulan Ini
            </p>
            <p className="mt-[calc(4*var(--u))] font-display text-[calc(20*var(--u))] font-bold leading-none text-[#171717]">
              24
            </p>
          </div>

          <div className="rounded-[calc(14*var(--u))] bg-[#F7F7F9] px-[calc(14*var(--u))] py-[calc(12*var(--u))]">
            <p className="text-[calc(11.5*var(--u))] font-normal text-[#5A555F]">
              Total Kunjungan
            </p>
            <p className="mt-[calc(4*var(--u))] font-display text-[calc(20*var(--u))] font-bold leading-none text-[#8E001C]">
              148
            </p>
          </div>
        </section>

        {/* 3. Informasi Akun */}
        <section>
          <h3 className="mb-[calc(8*var(--u))] px-[calc(2*var(--u))] font-display text-[calc(13.5*var(--u))] font-bold text-[#171717]">
            Informasi Akun
          </h3>

          <div className="divide-y divide-[#ECECF0] rounded-[calc(16*var(--u))] bg-[#F7F7F9] px-[calc(15*var(--u))]">
            <div className="flex items-center gap-[calc(12*var(--u))] py-[calc(12*var(--u))]">
              <IdentificationBadge
                weight="regular"
                className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0 text-[#8E001C]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[calc(11.5*var(--u))] text-[#5A555F]">
                  ID Karyawan
                </p>
                <p className="truncate text-[calc(13*var(--u))] font-semibold text-[#171717]">
                  TEK-001
                </p>
              </div>
            </div>

            <div className="flex items-center gap-[calc(12*var(--u))] py-[calc(12*var(--u))]">
              <Phone
                weight="regular"
                className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0 text-[#8E001C]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[calc(11.5*var(--u))] text-[#5A555F]">
                  Nomor Telepon
                </p>
                <p className="truncate text-[calc(13*var(--u))] font-semibold text-[#171717]">
                  0812-3456-7890
                </p>
              </div>
            </div>

            <div className="flex items-center gap-[calc(12*var(--u))] py-[calc(12*var(--u))]">
              <MapPin
                weight="regular"
                className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0 text-[#8E001C]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[calc(11.5*var(--u))] text-[#5A555F]">
                  Area Tugas
                </p>
                <p className="truncate text-[calc(13*var(--u))] font-semibold text-[#171717]">
                  Jakarta Selatan & Pusat
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Pengaturan */}
        <section>
          <h3 className="mb-[calc(8*var(--u))] px-[calc(2*var(--u))] font-display text-[calc(13.5*var(--u))] font-bold text-[#171717]">
            Pengaturan
          </h3>

          <div className="divide-y divide-[#ECECF0] rounded-[calc(16*var(--u))] border border-[#E6E6EC] bg-white px-[calc(15*var(--u))]">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                triggerToast("Menu ubah data diri segera tersedia.");
              }}
              className="flex w-full items-center justify-between gap-[calc(10*var(--u))] py-[calc(13*var(--u))] text-left active:opacity-75"
            >
              <span className="flex items-center gap-[calc(12*var(--u))] text-[calc(13.5*var(--u))] font-medium text-[#171717]">
                <User
                  weight="regular"
                  className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] text-[#8E001C]"
                />
                Ubah Data Diri
              </span>
              <CaretRight
                weight="bold"
                className="h-[calc(15*var(--u))] w-[calc(15*var(--u))] text-[#8E8A94]"
              />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                triggerToast("Menu ubah kata sandi segera tersedia.");
              }}
              className="flex w-full items-center justify-between gap-[calc(10*var(--u))] py-[calc(13*var(--u))] text-left active:opacity-75"
            >
              <span className="flex items-center gap-[calc(12*var(--u))] text-[calc(13.5*var(--u))] font-medium text-[#171717]">
                <LockKey
                  weight="regular"
                  className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] text-[#8E001C]"
                />
                Keamanan & Kata Sandi
              </span>
              <CaretRight
                weight="bold"
                className="h-[calc(15*var(--u))] w-[calc(15*var(--u))] text-[#8E8A94]"
              />
            </button>

            <div className="flex items-center justify-between gap-[calc(10*var(--u))] py-[calc(12*var(--u))]">
              <span className="flex items-center gap-[calc(12*var(--u))] text-[calc(13.5*var(--u))] font-medium text-[#171717]">
                <Bell
                  weight="regular"
                  className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] text-[#8E001C]"
                />
                Notifikasi Kunjungan
              </span>

              <button
                type="button"
                role="switch"
                aria-checked={notifEnabled}
                onClick={handleToggleNotif}
                className={`relative inline-flex h-[calc(24*var(--u))] w-[calc(42*var(--u))] shrink-0 items-center rounded-full transition-colors duration-200 ${
                  notifEnabled ? "bg-[#8E001C]" : "bg-[#D1D1D8]"
                }`}
              >
                <span
                  className={`inline-block h-[calc(18*var(--u))] w-[calc(18*var(--u))] rounded-full bg-white transition-transform duration-200 ${
                    notifEnabled
                      ? "translate-x-[calc(21*var(--u))]"
                      : "translate-x-[calc(3*var(--u))]"
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                triggerToast("MOKU — Monitoring Operasional Kunjungan Unit v1.0.0");
              }}
              className="flex w-full items-center justify-between gap-[calc(10*var(--u))] py-[calc(13*var(--u))] text-left active:opacity-75"
            >
              <span className="flex items-center gap-[calc(12*var(--u))] text-[calc(13.5*var(--u))] font-medium text-[#171717]">
                <Info
                  weight="regular"
                  className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] text-[#8E001C]"
                />
                Tentang Aplikasi
              </span>
              <CaretRight
                weight="bold"
                className="h-[calc(15*var(--u))] w-[calc(15*var(--u))] text-[#8E8A94]"
              />
            </button>
          </div>
        </section>

        {/* 5. Tombol Keluar */}
        <section className="pt-[calc(4*var(--u))]">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setShowLogoutModal(true);
            }}
            className="flex min-h-[calc(46*var(--u))] w-full items-center justify-center gap-[calc(8*var(--u))] rounded-[calc(13*var(--u))] border border-[#8E001C] bg-white px-[calc(16*var(--u))] py-[calc(10*var(--u))] font-display text-[calc(14*var(--u))] font-semibold text-[#8E001C] transition-[transform,background-color] duration-[260ms] active:scale-[0.985] active:bg-[#FDF2F4]"
          >
            <SignOut
              weight="bold"
              className="h-[calc(18*var(--u))] w-[calc(18*var(--u))]"
            />
            Keluar Akun
          </button>
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
