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
  Phone,
  User,
} from "@phosphor-icons/react";
import { useAppLayout } from "@/components/layout/app-shell";
import {
  DEFAULT_AVATAR_URL,
  getAccountProfile,
  type AccountProfile,
} from "@/lib/account-profile";

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

  const [profile, setProfile] = useState<AccountProfile>(() =>
    getAccountProfile()
  );
  const [avatarError, setAvatarError] = useState(false);

  const syncProfile = useCallback(() => {
    const latest = getAccountProfile();
    setProfile(latest);
    setAvatarError(false);
  }, []);

  useEffect(() => {
    syncProfile();
  }, [syncProfile]);

  useIonViewWillEnter(() => {
    syncProfile();
  });

  const isMobileView = !isReady || isMobile;

  useEffect(() => {
    if (!isMobileView) return;
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((meta) => meta.setAttribute("content", "#740319"));
  }, [isMobileView]);

  const handleBack = () => {
    triggerHaptic(6);
    if (ionRouter.canGoBack()) {
      ionRouter.goBack();
    } else {
      navigateWithTransition("/profile", "back");
    }
  };

  const handleOpenEdit = () => {
    triggerHaptic(8);
    navigateWithTransition("/profile/edit-account-info", "forward");
  };

  const avatarSrc = profile.avatarUrl || DEFAULT_AVATAR_URL;

  return (
    <main
      style={MOBILE_SCALE_VARS}
      className="min-h-dvh w-full min-w-0 overflow-x-clip bg-[#FAFAFB] pb-[calc(96*var(--u)+env(safe-area-inset-bottom))]"
    >
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

      <div className="moku-info-enter mx-auto w-full max-w-[680px] px-[calc(16*var(--u))] pt-[calc(24*var(--u))]">
        {/* Avatar 120u Tanpa Nama & Label Jabatan di Bawahnya */}
        <section className="flex flex-col items-center text-center">
          <div
            key={avatarSrc}
            style={{
              width: "calc(120 * var(--u))",
              height: "calc(120 * var(--u))",
            }}
            className="moku-info-avatar flex items-center justify-center overflow-hidden rounded-full bg-[#FCECEF] shadow-[0_6px_20px_rgba(116,3,25,0.08)]"
          >
            {!avatarError ? (
              <img
                src={avatarSrc}
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

        {/* Data Pribadi */}
        <section
          style={{ marginTop: "calc(22 * var(--u))" }}
          className="rounded-[calc(16*var(--u))] border border-[#EFEFF3] bg-white p-[calc(16*var(--u))] shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
        >
          <h2
            style={{ margin: 0, marginBottom: "calc(14 * var(--u))" }}
            className="font-display text-[calc(15.5*var(--u))] font-bold text-[#171717]"
          >
            Data Pribadi
          </h2>

          <div className="divide-y divide-[#F2F2F6]">
            <div className="flex items-center gap-[calc(12*var(--u))] py-[calc(12*var(--u))] first:pt-0 last:pb-0">
              <div className="flex h-[calc(36*var(--u))] w-[calc(36*var(--u))] shrink-0 items-center justify-center rounded-full bg-[#FDF2F4] text-[#740319]">
                <User
                  weight="regular"
                  className="h-[calc(18*var(--u))] w-[calc(18*var(--u))]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  style={{ margin: 0 }}
                  className="text-[calc(11.5*var(--u))] font-medium text-[#6B6B76]"
                >
                  Nama Lengkap
                </p>
                <p
                  style={{ margin: 0, marginTop: "calc(2 * var(--u))" }}
                  className="truncate text-[calc(14*var(--u))] font-semibold text-[#171717]"
                >
                  {profile.fullName || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-[calc(12*var(--u))] py-[calc(12*var(--u))] first:pt-0 last:pb-0">
              <div className="flex h-[calc(36*var(--u))] w-[calc(36*var(--u))] shrink-0 items-center justify-center rounded-full bg-[#FDF2F4] text-[#740319]">
                <At
                  weight="regular"
                  className="h-[calc(18*var(--u))] w-[calc(18*var(--u))]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  style={{ margin: 0 }}
                  className="text-[calc(11.5*var(--u))] font-medium text-[#6B6B76]"
                >
                  Username
                </p>
                <p
                  style={{ margin: 0, marginTop: "calc(2 * var(--u))" }}
                  className="truncate text-[calc(14*var(--u))] font-semibold text-[#171717]"
                >
                  {profile.username || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-[calc(12*var(--u))] py-[calc(12*var(--u))] first:pt-0 last:pb-0">
              <div className="flex h-[calc(36*var(--u))] w-[calc(36*var(--u))] shrink-0 items-center justify-center rounded-full bg-[#FDF2F4] text-[#740319]">
                <EnvelopeSimple
                  weight="regular"
                  className="h-[calc(18*var(--u))] w-[calc(18*var(--u))]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  style={{ margin: 0 }}
                  className="text-[calc(11.5*var(--u))] font-medium text-[#6B6B76]"
                >
                  Email
                </p>
                <p
                  style={{ margin: 0, marginTop: "calc(2 * var(--u))" }}
                  className="truncate text-[calc(14*var(--u))] font-semibold text-[#171717]"
                >
                  {profile.email || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-[calc(12*var(--u))] py-[calc(12*var(--u))] first:pt-0 last:pb-0">
              <div className="flex h-[calc(36*var(--u))] w-[calc(36*var(--u))] shrink-0 items-center justify-center rounded-full bg-[#FDF2F4] text-[#740319]">
                <Phone
                  weight="regular"
                  className="h-[calc(18*var(--u))] w-[calc(18*var(--u))]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  style={{ margin: 0 }}
                  className="text-[calc(11.5*var(--u))] font-medium text-[#6B6B76]"
                >
                  Nomor Telepon
                </p>
                <p
                  style={{ margin: 0, marginTop: "calc(2 * var(--u))" }}
                  className="truncate text-[calc(14*var(--u))] font-semibold text-[#171717]"
                >
                  {profile.phone ? `+62 ${profile.phone}` : "-"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Operasional */}
        <section
          style={{ marginTop: "calc(16 * var(--u))" }}
          className="rounded-[calc(16*var(--u))] border border-[#EFEFF3] bg-white p-[calc(16*var(--u))] shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
        >
          <h2
            style={{ margin: 0, marginBottom: "calc(14 * var(--u))" }}
            className="font-display text-[calc(15.5*var(--u))] font-bold text-[#171717]"
          >
            Data Operasional
          </h2>

          <div className="divide-y divide-[#F2F2F6]">
            <div className="flex items-center gap-[calc(12*var(--u))] py-[calc(12*var(--u))] first:pt-0 last:pb-0">
              <div className="flex h-[calc(36*var(--u))] w-[calc(36*var(--u))] shrink-0 items-center justify-center rounded-full bg-[#FDF2F4] text-[#740319]">
                <Briefcase
                  weight="regular"
                  className="h-[calc(18*var(--u))] w-[calc(18*var(--u))]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  style={{ margin: 0 }}
                  className="text-[calc(11.5*var(--u))] font-medium text-[#6B6B76]"
                >
                  Jabatan / Role
                </p>
                <p
                  style={{ margin: 0, marginTop: "calc(2 * var(--u))" }}
                  className="truncate text-[calc(14*var(--u))] font-semibold text-[#171717]"
                >
                  {profile.role || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-[calc(12*var(--u))] py-[calc(12*var(--u))] first:pt-0 last:pb-0">
              <div className="flex h-[calc(36*var(--u))] w-[calc(36*var(--u))] shrink-0 items-center justify-center rounded-full bg-[#FDF2F4] text-[#740319]">
                <Buildings
                  weight="regular"
                  className="h-[calc(18*var(--u))] w-[calc(18*var(--u))]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  style={{ margin: 0 }}
                  className="text-[calc(11.5*var(--u))] font-medium text-[#6B6B76]"
                >
                  Cabang
                </p>
                <p
                  style={{ margin: 0, marginTop: "calc(2 * var(--u))" }}
                  className="truncate text-[calc(14*var(--u))] font-semibold text-[#171717]"
                >
                  {profile.branch || "-"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tombol Ubah Informasi Akun */}
        <section style={{ marginTop: "calc(24 * var(--u))" }}>
          <button
            type="button"
            onClick={handleOpenEdit}
            style={{
              backgroundColor: "#740319",
              color: "#FFFFFF",
            }}
            className="flex min-h-[calc(48*var(--u))] w-full cursor-pointer select-none items-center justify-center rounded-[calc(12*var(--u))] px-[calc(16*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(14.5*var(--u))] font-semibold text-white shadow-[0_4px_12px_rgba(116,3,25,0.22)] transition-[transform,background-color] duration-200 active:scale-[0.985]"
          >
            <span>Ubah Informasi Akun</span>
          </button>
        </section>
      </div>

      <style>{`
        .moku-info-enter {
          animation: moku-info-in 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .moku-info-avatar {
          animation: moku-info-pop 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
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
        @keyframes moku-info-pop {
          from {
            opacity: 0.4;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </main>
  );
}
