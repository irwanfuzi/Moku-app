import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type TouchEvent,
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

const EDGE_SWIPE_ZONE_PX = 40;
const SWIPE_TRIGGER_PX = 68;
const SWIPE_VELOCITY_PX_MS = 0.35;

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
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const isNavigatingBackRef = useRef(false);
  const swipeStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    active: boolean;
    direction: 1 | -1;
    lockedHorizontal: boolean;
  }>({
    x: 0,
    y: 0,
    time: 0,
    active: false,
    direction: 1,
    lockedHorizontal: false,
  });

  const isMobileView = !isReady || isMobile;

  const refreshProfile = useCallback(() => {
    isNavigatingBackRef.current = false;
    setDragX(0);
    setIsDragging(false);
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

  const triggerBackAction = useCallback(() => {
    if (isNavigatingBackRef.current) return;
    isNavigatingBackRef.current = true;
    triggerHaptic(6);
    setIsDragging(false);
    setDragX(0);

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
          triggerBackAction();
        });
      }
    };

    document.addEventListener("ionBackButton", handleIonBack);
    return () => {
      document.removeEventListener("ionBackButton", handleIonBack);
    };
  }, [triggerBackAction]);

  const handleOpenEdit = () => {
    if (isNavigatingBackRef.current) return;
    triggerHaptic(8);
    navigateWithTransition("/profile/account-info/edit", "forward");
  };

  const handleTouchStart = (e: TouchEvent<HTMLElement>) => {
    if (isNavigatingBackRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const vw = window.innerWidth;
    const isFromLeftEdge = touch.clientX <= EDGE_SWIPE_ZONE_PX;
    const isFromRightEdge = touch.clientX >= vw - EDGE_SWIPE_ZONE_PX;

    if (!isFromLeftEdge && !isFromRightEdge) {
      swipeStartRef.current.active = false;
      return;
    }

    swipeStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: performance.now(),
      active: true,
      direction: isFromLeftEdge ? 1 : -1,
      lockedHorizontal: false,
    };
  };

  const handleTouchMove = (e: TouchEvent<HTMLElement>) => {
    const state = swipeStartRef.current;
    if (!state.active || isNavigatingBackRef.current || e.touches.length !== 1) {
      return;
    }

    const touch = e.touches[0];
    const rawDx = touch.clientX - state.x;
    const dy = touch.clientY - state.y;
    const inwardDelta = rawDx * state.direction;

    if (!state.lockedHorizontal) {
      if (Math.abs(dy) > Math.abs(rawDx) && Math.abs(dy) > 10) {
        state.active = false;
        setIsDragging(false);
        setDragX(0);
        return;
      }
      if (inwardDelta > 10) {
        state.lockedHorizontal = true;
        setIsDragging(true);
      } else {
        return;
      }
    }

    setDragX(Math.max(0, inwardDelta));
  };

  const handleTouchEnd = () => {
    const state = swipeStartRef.current;
    if (!state.active) return;
    state.active = false;

    if (!state.lockedHorizontal) {
      setIsDragging(false);
      setDragX(0);
      return;
    }

    const elapsed = Math.max(1, performance.now() - state.time);
    const velocity = dragX / elapsed;

    if (dragX >= SWIPE_TRIGGER_PX || velocity >= SWIPE_VELOCITY_PX_MS) {
      triggerBackAction();
    } else {
      setIsDragging(false);
      setDragX(0);
    }
  };

  const pageStyle: CSSProperties = {
    ...MOBILE_SCALE_VARS,
    transform: dragX > 0 ? `translate3d(${dragX}px, 0, 0)` : undefined,
    opacity: dragX > 0 ? Math.max(0.65, 1 - dragX / 480) : 1,
    transition: isDragging
      ? "none"
      : "transform 240ms cubic-bezier(0.22, 1, 0.36, 1), opacity 240ms cubic-bezier(0.22, 1, 0.36, 1)",
  };

  const formattedPhone = profile.phone.startsWith("+62")
    ? profile.phone
    : `+62 ${profile.phone}`;

  return (
    <main
      style={pageStyle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="min-h-dvh w-full min-w-0 overflow-x-clip bg-[#FAFAFB] pb-[calc(36*var(--u)+env(safe-area-inset-bottom))]"
    >
      {/* Top Header Marun dengan Tombol Edit Icon-Only */}
      <header className="sticky top-0 z-40 w-full bg-[#740319] text-white">
        <div
          style={{
            paddingTop: "calc(env(safe-area-inset-top) + 12 * var(--u))",
            paddingBottom: "calc(12 * var(--u))",
          }}
          className="mx-auto flex w-full max-w-[680px] items-center justify-between gap-[calc(8*var(--u))] px-[calc(12*var(--u))]"
        >
          <div className="flex items-center gap-[calc(8*var(--u))]">
            <button
              type="button"
              onClick={triggerBackAction}
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

          <button
            type="button"
            onClick={handleOpenEdit}
            aria-label="Ubah Informasi Akun"
            className="flex h-[calc(40*var(--u))] w-[calc(40*var(--u))] shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-[transform,background-color] duration-260 ease-out active:scale-90 active:bg-white/15"
          >
            <PencilSimple
              weight="regular"
              className="h-[calc(21*var(--u))] w-[calc(21*var(--u))]"
            />
          </button>
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

        {/* Kartu Data Pribadi */}
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
                  Posisi
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
              Posisi dan cabang tidak dapat diubah. Hubungi admin jika ada
              perubahan data operasional.
            </p>
          </div>
        </section>
      </div>

      <style>{`
        .moku-info-enter {
          animation: moku-info-in 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
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
      `}</style>
    </main>
  );
}
