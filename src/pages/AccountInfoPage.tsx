import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
} from "react";
import { useIonRouter, useIonViewWillEnter } from "@ionic/react";
import {
  ArrowLeft,
  At,
  Briefcase,
  Buildings,
  EnvelopeSimple,
  Info,
  PencilSimple,
  Phone,
  User,
} from "@phosphor-icons/react";
import { useAppLayout } from "@/components/layout/app-shell";
import { DEFAULT_AVATAR_URL, getAccountProfile } from "@/lib/account-profile";

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

function triggerHaptic(duration = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(duration);
  }
}

export default function AccountInfoPage() {
  const { isMobile, isReady, navigateWithTransition } = useAppLayout();
  const ionRouter = useIonRouter();

  const [profile, setProfile] = useState(() => getAccountProfile());
  const [avatarError, setAvatarError] = useState(false);

  const isMobileView = !isReady || isMobile;

  const refreshProfile = useCallback(() => {
    setProfile(getAccountProfile());
    setAvatarError(false);
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useIonViewWillEnter(() => {
    refreshProfile();
  });

  useEffect(() => {
    if (!isMobileView) return;
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((meta) => meta.setAttribute("content", "#740319"));
  }, [isMobileView]);

  const navigateBackSmooth = useCallback(() => {
    if (ionRouter.canGoBack()) {
      ionRouter.goBack();
    } else {
      navigateWithTransition("/profile", "back");
    }
  }, [ionRouter, navigateWithTransition]);

  useEffect(() => {
    const handleIonBack = (ev: Event) => {
      const customEv = ev as CustomEvent<{
        register: (priority: number, handler: () => void) => void;
      }>;
      if (customEv.detail?.register) {
        customEv.detail.register(100, () => {
          triggerHaptic(6);
          navigateBackSmooth();
        });
      }
    };

    document.addEventListener("ionBackButton", handleIonBack);
    return () => {
      document.removeEventListener("ionBackButton", handleIonBack);
    };
  }, [navigateBackSmooth]);

  const handleBack = () => {
    triggerHaptic(6);
    navigateBackSmooth();
  };

  const handleOpenEdit = () => {
    triggerHaptic(8);
    navigateWithTransition("/profile/account-info/edit", "forward");
  };

  const formattedPhone = profile.phone.startsWith("+62")
    ? profile.phone
    : `+62 ${profile.phone}`;

  return (
    <main
      style={MOBILE_SCALE_VARS}
      className="min-h-dvh w-full min-w-0 overflow-x-clip bg-[#FAFAFB] pb-[calc(92*var(--u)+env(safe-area-inset-bottom))]"
    >
      {/* Top Header Marun Bersih */}
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
            className="flex h-[calc(40*var(--u))] w-[calc(40*var(--u))] shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-[transform,background-color] duration-260 ease-out active:scale-90 active:bg-white/15"
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

      <div className="moku-info-enter mx-auto w-full max-w-[680px] px-[calc(16*var(--u))] pt-[calc(20*var(--u))]">
        {/* Avatar Besar Bersih Tanpa Teks di Bawahnya */}
        <section className="flex flex-col items-center text-center">
          <div
            style={{
              width: "calc(120 * var(--u))",
              height: "calc(120 * var(--u))",
            }}
            className="flex items-center justify-center overflow-hidden rounded-full bg-[#FCECEF] shadow-[0_6px_20px_rgba(116,3,25,0.08)]"
          >
            {!avatarError ? (
              <img
                src={profile.avatarUrl || DEFAULT_AVATAR_URL}
                alt="Foto Profil"
                onError={() => setAvatarError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <User
                weight="fill"
                className="h-[calc(48*var(--u))] w-[calc(48*var(--u))] text-[#740319]"
              />
            )}
          </div>
        </section>

        {/* Kartu Data Pribadi (Rapat & Proporsional) */}
        <section
          style={{ marginTop: "calc(18 * var(--u))" }}
          className="rounded-[calc(16*var(--u))] border border-[#EFEFF3] bg-white px-[calc(16*var(--u))] py-[calc(14*var(--u))] shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
        >
          <h2
            style={{ margin: 0, marginBottom: "calc(8 * var(--u))" }}
            className="font-display text-[calc(15*var(--u))] font-bold text-[#171717]"
          >
            Data Pribadi
          </h2>

          <div className="divide-y divide-[#F2F2F6]">
            <div className="flex items-center gap-[calc(12*var(--u))] py-[calc(10*var(--u))]">
              <User
                weight="regular"
                className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0 text-[#1E1E24]"
              />
              <div className="min-w-0 flex-1">
                <p
                  style={{ margin: 0 }}
                  className="text-[calc(11*var(--u))] font-medium leading-tight text-[#6B6B76]"
                >
                  Nama Lengkap
                </p>
                <p
                  style={{ margin: 0, marginTop: "calc(2 * var(--u))" }}
                  className="truncate text-[calc(13.5*var(--u))] font-semibold leading-snug text-[#171717]"
                >
                  {profile.fullName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-[calc(12*var(--u))] py-[calc(10*var(--u))]">
              <At
                weight="regular"
                className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0 text-[#1E1E24]"
              />
              <div className="min-w-0 flex-1">
                <p
                  style={{ margin: 0 }}
                  className="text-[calc(11*var(--u))] font-medium leading-tight text-[#6B6B76]"
                >
                  Username
                </p>
                <p
                  style={{ margin: 0, marginTop: "calc(2 * var(--u))" }}
                  className="truncate text-[calc(13.5*var(--u))] font-semibold leading-snug text-[#171717]"
                >
                  {profile.username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-[calc(12*var(--u))] py-[calc(10*var(--u))]">
              <EnvelopeSimple
                weight="regular"
                className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0 text-[#1E1E24]"
              />
              <div className="min-w-0 flex-1">
                <p
                  style={{ margin: 0 }}
                  className="text-[calc(11*var(--u))] font-medium leading-tight text-[#6B6B76]"
                >
                  Email
                </p>
                <p
                  style={{ margin: 0, marginTop: "calc(2 * var(--u))" }}
                  className="truncate text-[calc(13.5*var(--u))] font-semibold leading-snug text-[#171717]"
                >
                  {profile.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-[calc(12*var(--u))] pb-[calc(2*var(--u))] pt-[calc(10*var(--u))]">
              <Phone
                weight="regular"
                className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0 text-[#1E1E24]"
              />
              <div className="min-w-0 flex-1">
                <p
                  style={{ margin: 0 }}
                  className="text-[calc(11*var(--u))] font-medium leading-tight text-[#6B6B76]"
                >
                  Nomor Telepon
                </p>
                <p
                  style={{ margin: 0, marginTop: "calc(2 * var(--u))" }}
                  className="truncate text-[calc(13.5*var(--u))] font-semibold leading-snug text-[#171717]"
                >
                  {formattedPhone}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Kartu Data Operasional */}
        <section
          style={{ marginTop: "calc(12 * var(--u))" }}
          className="rounded-[calc(16*var(--u))] border border-[#EFEFF3] bg-white px-[calc(16*var(--u))] py-[calc(14*var(--u))] shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
        >
          <h2
            style={{ margin: 0, marginBottom: "calc(8 * var(--u))" }}
            className="font-display text-[calc(15*var(--u))] font-bold text-[#171717]"
          >
            Data Operasional
          </h2>

          <div className="divide-y divide-[#F2F2F6]">
            <div className="flex items-center gap-[calc(12*var(--u))] py-[calc(10*var(--u))]">
              <Briefcase
                weight="regular"
                className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0 text-[#1E1E24]"
              />
              <div className="min-w-0 flex-1">
                <p
                  style={{ margin: 0 }}
                  className="text-[calc(11*var(--u))] font-medium leading-tight text-[#6B6B76]"
                >
                  Jabatan / Role
                </p>
                <p
                  style={{ margin: 0, marginTop: "calc(2 * var(--u))" }}
                  className="truncate text-[calc(13.5*var(--u))] font-semibold leading-snug text-[#171717]"
                >
                  {profile.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-[calc(12*var(--u))] py-[calc(10*var(--u))]">
              <Buildings
                weight="regular"
                className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0 text-[#1E1E24]"
              />
              <div className="min-w-0 flex-1">
                <p
                  style={{ margin: 0 }}
                  className="text-[calc(11*var(--u))] font-medium leading-tight text-[#6B6B76]"
                >
                  Cabang
                </p>
                <p
                  style={{ margin: 0, marginTop: "calc(2 * var(--u))" }}
                  className="truncate text-[calc(13.5*var(--u))] font-semibold leading-snug text-[#171717]"
                >
                  {profile.branch}
                </p>
              </div>
            </div>
          </div>

          <div
            style={{ marginTop: "calc(8 * var(--u))" }}
            className="flex items-start gap-[calc(10*var(--u))] rounded-[calc(10*var(--u))] bg-[#FDF2F4] px-[calc(12*var(--u))] py-[calc(10*var(--u))]"
          >
            <Info
              weight="regular"
              className="mt-[1px] h-[calc(17*var(--u))] w-[calc(17*var(--u))] shrink-0 text-[#740319]"
            />
            <p
              style={{ margin: 0 }}
              className="text-[calc(11.5*var(--u))] font-normal leading-relaxed text-[#2D2D34]"
            >
              Jabatan dan cabang tidak dapat diubah. Hubungi admin jika ada
              perubahan data operasional.
            </p>
          </div>
        </section>
      </div>

      {/* Floating Action Button (FAB) Icon-Only di Pojok Kanan Bawah */}
      <div
        style={{
          bottom: "calc(20 * var(--u) + env(safe-area-inset-bottom))",
        }}
        className="pointer-events-none fixed inset-x-0 z-40"
      >
        <div className="mx-auto flex w-full max-w-[680px] justify-end px-[calc(16*var(--u))]">
          <button
            type="button"
            onClick={handleOpenEdit}
            aria-label="Ubah Informasi Akun"
            style={{
              width: "calc(52 * var(--u))",
              height: "calc(52 * var(--u))",
            }}
            className="moku-fab-pop pointer-events-auto flex cursor-pointer items-center justify-center rounded-full bg-[#740319] text-white shadow-[0_8px_22px_rgba(116,3,25,0.32)] transition-[transform,background-color,box-shadow] duration-200 ease-out hover:bg-[#620215] active:scale-92 active:bg-[#5B0213]"
          >
            <PencilSimple
              weight="bold"
              className="h-[calc(22*var(--u))] w-[calc(22*var(--u))]"
            />
          </button>
        </div>
      </div>

      <style>{`
        .moku-info-enter {
          animation: moku-info-in 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .moku-fab-pop {
          animation: moku-fab-in 420ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both;
        }
        @keyframes moku-info-in {
          from {
            opacity: 0;
            transform: translate3d(0, 12px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes moku-fab-in {
          from {
            opacity: 0;
            transform: scale(0.8) translate3d(0, 10px, 0);
          }
          to {
            opacity: 1;
            transform: scale(1) translate3d(0, 0, 0);
          }
        }
      `}</style>
    </main>
  );
}
