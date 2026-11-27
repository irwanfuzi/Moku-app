import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import { useIonRouter } from "@ionic/react";
import {
  ArrowLeft,
  At,
  Briefcase,
  Buildings,
  Camera,
  CaretDown,
  CheckCircle,
  EnvelopeSimple,
  Info,
  LockSimple,
  Phone,
  User,
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

export default function EditAccountInfoPage() {
  const { isMobile, isReady, navigateWithTransition } = useAppLayout();
  const ionRouter = useIonRouter();

  const [avatarError, setAvatarError] = useState(false);
  const [fullName, setFullName] = useState("Budi Santoso");
  const [username, setUsername] = useState("budisantoso");
  const [email, setEmail] = useState("budi.santoso@moku.id");
  const [phone, setPhone] = useState("812-3456-7890");
  const [isSaving, setIsSaving] = useState(false);

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
      navigateWithTransition("/profile/account-info", "back");
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim() || !email.trim() || !phone.trim()) {
      triggerHaptic(12);
      triggerToast("Mohon lengkapi semua kolom bertanda *.");
      return;
    }
    triggerHaptic(10);
    setIsSaving(true);
    window.setTimeout(() => {
      setIsSaving(false);
      triggerToast("Informasi akun berhasil disimpan.");
      window.setTimeout(() => {
        handleBack();
      }, 650);
    }, 450);
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
            Ubah Informasi Akun
          </h1>
        </div>
      </header>

      {/* Form Utama */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="moku-edit-enter mx-auto w-full max-w-[680px] px-[calc(16*var(--u))] pt-[calc(24*var(--u))]"
      >
        {/* Avatar + Ubah Foto Profil */}
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

          <button
            type="button"
            onClick={() => {
              triggerHaptic(6);
              triggerToast("Fitur ubah foto profil segera tersedia.");
            }}
            className="cursor-pointer rounded-[calc(8*var(--u))] px-[calc(8*var(--u))] py-[calc(4*var(--u))] text-[calc(13.5*var(--u))] font-medium text-[#6B6B76] transition-colors duration-150 active:bg-[#F0F0F4] active:text-[#171717]"
          >
            Ubah Foto Profil
          </button>
        </section>

        {/* Kartu 1: Data Pribadi (Editable) */}
        <section
          style={{ marginTop: "calc(20 * var(--u))" }}
          className="rounded-[calc(16*var(--u))] border border-[#EFEFF3] bg-white p-[calc(16*var(--u))] shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
        >
          <h2
            style={{ margin: 0, marginBottom: "calc(16 * var(--u))" }}
            className="font-display text-[calc(15.5*var(--u))] font-bold text-[#171717]"
          >
            Data Pribadi
          </h2>

          <div className="space-y-[calc(16*var(--u))]">
            {/* Nama Lengkap */}
            <div className="flex items-end gap-[calc(12*var(--u))]">
              <div className="flex h-[calc(44*var(--u))] w-[calc(24*var(--u))] shrink-0 items-center justify-center text-[#1E1E24]">
                <User
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="edit-fullname"
                  className="mb-[calc(4*var(--u))] block text-[calc(12.5*var(--u))] font-medium text-[#2D2D34]"
                >
                  Nama Lengkap <span className="text-[#C8102E]">*</span>
                </label>
                <input
                  id="edit-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="h-[calc(44*var(--u))] w-full rounded-[calc(10*var(--u))] border border-[#DDDDE4] bg-white px-[calc(12*var(--u))] text-[calc(14*var(--u))] font-normal text-[#171717] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#9E9EA9] focus:border-[#740319] focus:ring-2 focus:ring-[#740319]/15"
                />
              </div>
            </div>

            {/* Username */}
            <div className="flex items-end gap-[calc(12*var(--u))]">
              <div className="flex h-[calc(44*var(--u))] w-[calc(24*var(--u))] shrink-0 items-center justify-center text-[#1E1E24]">
                <At
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="edit-username"
                  className="mb-[calc(4*var(--u))] block text-[calc(12.5*var(--u))] font-medium text-[#2D2D34]"
                >
                  Username <span className="text-[#C8102E]">*</span>
                </label>
                <input
                  id="edit-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="h-[calc(44*var(--u))] w-full rounded-[calc(10*var(--u))] border border-[#DDDDE4] bg-white px-[calc(12*var(--u))] text-[calc(14*var(--u))] font-normal text-[#171717] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#9E9EA9] focus:border-[#740319] focus:ring-2 focus:ring-[#740319]/15"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex items-end gap-[calc(12*var(--u))]">
              <div className="flex h-[calc(44*var(--u))] w-[calc(24*var(--u))] shrink-0 items-center justify-center text-[#1E1E24]">
                <EnvelopeSimple
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="edit-email"
                  className="mb-[calc(4*var(--u))] block text-[calc(12.5*var(--u))] font-medium text-[#2D2D34]"
                >
                  Email <span className="text-[#C8102E]">*</span>
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email"
                  className="h-[calc(44*var(--u))] w-full rounded-[calc(10*var(--u))] border border-[#DDDDE4] bg-white px-[calc(12*var(--u))] text-[calc(14*var(--u))] font-normal text-[#171717] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#9E9EA9] focus:border-[#740319] focus:ring-2 focus:ring-[#740319]/15"
                />
              </div>
            </div>

            {/* Nomor Telepon */}
            <div className="flex items-end gap-[calc(12*var(--u))]">
              <div className="flex h-[calc(44*var(--u))] w-[calc(24*var(--u))] shrink-0 items-center justify-center text-[#1E1E24]">
                <Phone
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="edit-phone"
                  className="mb-[calc(4*var(--u))] block text-[calc(12.5*var(--u))] font-medium text-[#2D2D34]"
                >
                  Nomor Telepon <span className="text-[#C8102E]">*</span>
                </label>
                <div className="flex items-center gap-[calc(8*var(--u))]">
                  {/* Kode Negara +62 */}
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(6);
                      triggerToast("Kode negara aktif: Indonesia (+62).");
                    }}
                    className="flex h-[calc(44*var(--u))] shrink-0 cursor-pointer items-center gap-[calc(6*var(--u))] rounded-[calc(10*var(--u))] border border-[#DDDDE4] bg-white px-[calc(10*var(--u))] text-[calc(13.5*var(--u))] font-normal text-[#171717] transition-colors duration-150 active:bg-[#F4F4F7]"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-flex h-[calc(12*var(--u))] w-[calc(18*var(--u))] flex-col overflow-hidden rounded-[2px] border border-black/10"
                    >
                      <span className="h-1/2 w-full bg-[#CE1126]" />
                      <span className="h-1/2 w-full bg-white" />
                    </span>
                    <span>+62</span>
                    <CaretDown
                      weight="regular"
                      className="h-[calc(13*var(--u))] w-[calc(13*var(--u))] text-[#6B6B76]"
                    />
                  </button>

                  {/* Input Nomor */}
                  <input
                    id="edit-phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="812-3456-7890"
                    className="h-[calc(44*var(--u))] min-w-0 flex-1 rounded-[calc(10*var(--u))] border border-[#DDDDE4] bg-white px-[calc(12*var(--u))] text-[calc(14*var(--u))] font-normal text-[#171717] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#9E9EA9] focus:border-[#740319] focus:ring-2 focus:ring-[#740319]/15"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Kartu 2: Data Operasional (Read-Only / Locked) */}
        <section
          style={{ marginTop: "calc(16 * var(--u))" }}
          className="rounded-[calc(16*var(--u))] border border-[#EFEFF3] bg-white p-[calc(16*var(--u))] shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
        >
          <h2
            style={{ margin: 0, marginBottom: "calc(16 * var(--u))" }}
            className="font-display text-[calc(15.5*var(--u))] font-bold text-[#171717]"
          >
            Data Operasional
          </h2>

          <div className="space-y-[calc(16*var(--u))]">
            {/* Jabatan / Role (Terkunci) */}
            <div className="flex items-end gap-[calc(12*var(--u))]">
              <div className="flex h-[calc(44*var(--u))] w-[calc(24*var(--u))] shrink-0 items-center justify-center text-[#1E1E24]">
                <Briefcase
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="edit-role"
                  className="mb-[calc(4*var(--u))] block text-[calc(12.5*var(--u))] font-medium text-[#2D2D34]"
                >
                  Jabatan / Role
                </label>
                <div className="relative flex items-center">
                  <input
                    id="edit-role"
                    type="text"
                    value="Teknisi"
                    disabled
                    readOnly
                    className="h-[calc(44*var(--u))] w-full cursor-not-allowed rounded-[calc(10*var(--u))] border border-[#E4E4EA] bg-[#F2F2F5] pl-[calc(12*var(--u))] pr-[calc(38*var(--u))] text-[calc(14*var(--u))] font-normal text-[#52525B]"
                  />
                  <LockSimple
                    weight="regular"
                    className="pointer-events-none absolute right-[calc(12*var(--u))] h-[calc(18*var(--u))] w-[calc(18*var(--u))] text-[#7A7A86]"
                  />
                </div>
              </div>
            </div>

            {/* Cabang (Terkunci) */}
            <div className="flex items-end gap-[calc(12*var(--u))]">
              <div className="flex h-[calc(44*var(--u))] w-[calc(24*var(--u))] shrink-0 items-center justify-center text-[#1E1E24]">
                <Buildings
                  weight="regular"
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="edit-branch"
                  className="mb-[calc(4*var(--u))] block text-[calc(12.5*var(--u))] font-medium text-[#2D2D34]"
                >
                  Cabang
                </label>
                <div className="relative flex items-center">
                  <input
                    id="edit-branch"
                    type="text"
                    value="Cabang Jakarta 3"
                    disabled
                    readOnly
                    className="h-[calc(44*var(--u))] w-full cursor-not-allowed rounded-[calc(10*var(--u))] border border-[#E4E4EA] bg-[#F2F2F5] pl-[calc(12*var(--u))] pr-[calc(38*var(--u))] text-[calc(14*var(--u))] font-normal text-[#52525B]"
                  />
                  <LockSimple
                    weight="regular"
                    className="pointer-events-none absolute right-[calc(12*var(--u))] h-[calc(18*var(--u))] w-[calc(18*var(--u))] text-[#7A7A86]"
                  />
                </div>
              </div>
            </div>

            {/* Banner Info */}
            <div className="flex items-start gap-[calc(10*var(--u))] rounded-[calc(10*var(--u))] bg-[#FDF2F4] px-[calc(12*var(--u))] py-[calc(12*var(--u))]">
              <Info
                weight="regular"
                className="mt-[1px] h-[calc(18*var(--u))] w-[calc(18*var(--u))] shrink-0 text-[#740319]"
              />
              <p
                style={{ margin: 0 }}
                className="text-[calc(12*var(--u))] font-normal leading-relaxed text-[#2D2D34]"
              >
                Jabatan dan cabang tidak dapat diubah. Hubungi admin jika ada
                perubahan data operasional.
              </p>
            </div>
          </div>
        </section>

        {/* Tombol Aksi (Terpisah 24u dari kartu, jarak antar-tombol 12u) */}
        <section
          style={{ marginTop: "calc(24 * var(--u))" }}
          className="space-y-[calc(12*var(--u))]"
        >
          <button
            type="submit"
            disabled={isSaving}
            className="flex min-h-[calc(48*var(--u))] w-full cursor-pointer select-none items-center justify-center rounded-[calc(12*var(--u))] bg-[#740319] px-[calc(16*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(14.5*var(--u))] font-semibold text-white shadow-[0_4px_12px_rgba(116,3,25,0.22)] transition-[transform,background-color,opacity] duration-150 active:scale-[0.985] active:bg-[#5B0213] disabled:cursor-not-allowed disabled:opacity-65"
          >
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>

          <button
            type="button"
            onClick={handleBack}
            className="flex min-h-[calc(48*var(--u))] w-full cursor-pointer select-none items-center justify-center rounded-[calc(12*var(--u))] border-[1.5px] border-[#740319] bg-white px-[calc(16*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(14.5*var(--u))] font-semibold text-[#740319] transition-[transform,background-color] duration-150 active:scale-[0.985] active:bg-[#FDF2F4]"
          >
            Batal
          </button>
        </section>
      </form>

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
        .moku-edit-enter {
          animation: moku-edit-in 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .moku-toast-enter {
          animation: moku-toast-up 380ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .moku-toast-exit {
          animation: moku-toast-down 320ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
        @keyframes moku-edit-in {
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
