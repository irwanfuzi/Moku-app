import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
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
  CircleNotch,
  EnvelopeSimple,
  Info,
  LockSimple,
  Phone,
  User,
  WarningCircle,
} from "@phosphor-icons/react";
import { useAppLayout } from "@/components/layout/app-shell";
import {
  getAccountProfile,
  isUsernameAlignedWithIdentity,
  isUsernameTaken,
  saveAccountProfile,
} from "@/lib/account-profile";

const AVATAR_URL = "/images/moku/brand/moku-avatar.png";

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

const SNACKBAR_EXIT_MS = 380;

const VALID_DOMAINS = new Set([
  "moku.id",
  "gmail.com",
  "yahoo.com",
  "yahoo.co.id",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
]);

const COMPANY_TLD_SUFFIXES = [".co.id", ".ac.id", ".go.id", ".or.id"];

const MASH_PATTERNS = [
  "qwerty",
  "asdfgh",
  "asdf",
  "zxcvbn",
  "zxcv",
  "asdasd",
  "qweqwe",
  "testtest",
  "ngasal",
];

type FieldKey = "fullName" | "username" | "email" | "phone";
type FieldErrors = Partial<Record<FieldKey, string>>;
type UsernameCheckStatus = "idle" | "checking" | "available" | "taken";
type SavePhase = "idle" | "saving" | "saved";

function triggerHaptic(duration = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(duration);
  }
}

function isRepeatedOrMash(text: string): boolean {
  const clean = text.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!clean) return true;
  if (/(.)\1{3,}/.test(clean)) return true;
  if (/(.{2,})\1{2,}/.test(clean)) return true;
  return MASH_PATTERNS.some((pat) => clean.includes(pat));
}

function isAllowedEmailDomain(domain: string): boolean {
  if (VALID_DOMAINS.has(domain)) return true;

  for (const suffix of COMPANY_TLD_SUFFIXES) {
    if (domain.endsWith(suffix)) {
      const prefix = domain.slice(0, domain.length - suffix.length);
      const companyLabels = prefix.split(".").filter(Boolean);
      const mainCompany = companyLabels[companyLabels.length - 1] || "";
      if (
        mainCompany.length >= 2 &&
        companyLabels.every(
          (lbl) =>
            lbl.length >= 2 &&
            !lbl.startsWith("-") &&
            !lbl.endsWith("-") &&
            /^[a-z0-9-]+$/.test(lbl)
        ) &&
        !isRepeatedOrMash(mainCompany)
      ) {
        return true;
      }
    }
  }

  return false;
}

function getEmailError(value: string): string | undefined {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "Format email tidak valid";
  if (/\s/.test(trimmed) || trimmed.includes("..")) {
    return "Format email tidak valid";
  }

  const parts = trimmed.split("@");
  if (parts.length !== 2) {
    return "Format email tidak valid";
  }

  const [localPart, domainPart] = parts;
  if (!localPart || localPart.length < 2) {
    return "Format email tidak valid";
  }
  if (
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    !/^[a-z0-9._%+-]+$/.test(localPart)
  ) {
    return "Format email tidak valid";
  }
  if (isRepeatedOrMash(localPart)) {
    return "Format email tidak valid";
  }

  const domainLabels = domainPart.split(".");
  if (domainLabels.length < 2) {
    return "Format email tidak valid";
  }

  for (const label of domainLabels) {
    if (
      !label ||
      label.length < 2 ||
      label.startsWith("-") ||
      label.endsWith("-") ||
      !/^[a-z0-9-]+$/.test(label)
    ) {
      return "Format email tidak valid";
    }
  }

  if (!isAllowedEmailDomain(domainPart)) {
    return "Format email tidak valid";
  }

  return undefined;
}

function looksLikeCompletedEmailAttempt(value: string): boolean {
  const trimmed = value.trim();
  const atIdx = trimmed.indexOf("@");
  if (atIdx < 0) return false;
  const afterAt = trimmed.slice(atIdx + 1);
  return afterAt.includes(".") && afterAt.split(".").pop()!.length >= 2;
}

export default function EditAccountInfoPage() {
  const { isMobile, isReady, navigateWithTransition } = useAppLayout();
  const ionRouter = useIonRouter();

  const initialProfile = useRef(getAccountProfile());

  const [avatarError, setAvatarError] = useState(false);
  const [fullName, setFullName] = useState(initialProfile.current.fullName);
  const [username, setUsername] = useState(initialProfile.current.username);
  const [email, setEmail] = useState(initialProfile.current.email);
  const [phone, setPhone] = useState(initialProfile.current.phone);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [usernameStatus, setUsernameStatus] =
    useState<UsernameCheckStatus>("idle");
  const [savePhase, setSavePhase] = useState<SavePhase>("idle");

  const [toast, setToast] = useState<{
    id: number;
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const [isToastClosing, setIsToastClosing] = useState(false);

  const toastAutoRef = useRef<number | null>(null);
  const toastExitRef = useRef<number | null>(null);
  const usernameCheckRef = useRef<number | null>(null);
  const emailTypingRef = useRef<number | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const doneTimerRef = useRef<number | null>(null);

  const identityRef = useRef({
    fullName: initialProfile.current.fullName,
    email: initialProfile.current.email,
  });

  useEffect(() => {
    identityRef.current = { fullName, email };
  }, [fullName, email]);

  const isMobileView = !isReady || isMobile;
  const isBusy = savePhase !== "idle";

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
    (message: string, tone: "success" | "error" = "success") => {
      if (toastAutoRef.current !== null) {
        window.clearTimeout(toastAutoRef.current);
      }
      if (toastExitRef.current !== null) {
        window.clearTimeout(toastExitRef.current);
      }
      setIsToastClosing(false);
      setToast({ id: Date.now(), message, tone });
      toastAutoRef.current = window.setTimeout(() => {
        dismissToast();
      }, 2600);
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
      if (usernameCheckRef.current !== null) {
        window.clearTimeout(usernameCheckRef.current);
      }
      if (emailTypingRef.current !== null) {
        window.clearTimeout(emailTypingRef.current);
      }
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
      if (doneTimerRef.current !== null) {
        window.clearTimeout(doneTimerRef.current);
      }
    };
  }, []);

  const validateField = useCallback(
    (
      field: FieldKey,
      value: string,
      ctx?: { fullName?: string; email?: string }
    ): string | undefined => {
      const trimmed = value.trim();
      const activeName = ctx?.fullName ?? fullName;
      const activeEmail = ctx?.email ?? email;

      switch (field) {
        case "fullName":
          if (!trimmed) return "Nama lengkap wajib diisi.";
          if (trimmed.length < 3) return "Nama lengkap minimal 3 karakter.";
          return undefined;
        case "username":
          if (!trimmed) return "Username wajib diisi.";
          if (trimmed.length < 4) return "Username minimal 4 karakter.";
          if (!/^[a-zA-Z0-9._]+$/.test(trimmed)) {
            return "Username hanya boleh huruf, angka, titik, atau underscore.";
          }
          if (!isUsernameAlignedWithIdentity(trimmed, activeName, activeEmail)) {
            return "Username harus mengacu pada nama atau alamat email Anda.";
          }
          if (isUsernameTaken(trimmed, initialProfile.current.username)) {
            return "Username sudah digunakan pengguna lain.";
          }
          return undefined;
        case "email":
          return getEmailError(value);
        case "phone": {
          const digits = trimmed.replace(/\D/g, "");
          if (!digits) return "Nomor telepon wajib diisi.";
          if (digits.length < 9 || digits.length > 13) {
            return "Nomor telepon harus terdiri dari 9–13 digit.";
          }
          return undefined;
        }
        default:
          return undefined;
      }
    },
    [email, fullName]
  );

  // Evaluasi email setelah jeda ngetik saat alamat email tampak sudah diketik lengkap
  useEffect(() => {
    if (emailTypingRef.current !== null) {
      window.clearTimeout(emailTypingRef.current);
      emailTypingRef.current = null;
    }

    const shouldEvaluate =
      looksLikeCompletedEmailAttempt(email) || Boolean(errors.email);
    if (!shouldEvaluate) return;

    emailTypingRef.current = window.setTimeout(() => {
      const emailErr = getEmailError(email);
      setErrors((prev) => {
        if (prev.email === emailErr) return prev;
        const next = { ...prev };
        if (emailErr) next.email = emailErr;
        else delete next.email;
        return next;
      });
    }, 500);
  }, [email, errors.email]);

  useEffect(() => {
    if (usernameCheckRef.current !== null) {
      window.clearTimeout(usernameCheckRef.current);
      usernameCheckRef.current = null;
    }

    const trimmed = username.trim();
    const isSameAsInitial =
      trimmed.toLowerCase() ===
      initialProfile.current.username.trim().toLowerCase();

    const { fullName: currentFullName, email: currentEmail } =
      identityRef.current;

    if (
      !trimmed ||
      trimmed.length < 4 ||
      !/^[a-zA-Z0-9._]+$/.test(trimmed) ||
      !isUsernameAlignedWithIdentity(trimmed, currentFullName, currentEmail) ||
      isSameAsInitial
    ) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");
    usernameCheckRef.current = window.setTimeout(() => {
      const taken = isUsernameTaken(trimmed, initialProfile.current.username);
      if (taken) {
        setUsernameStatus("taken");
        setErrors((prev) => ({
          ...prev,
          username: "Username sudah digunakan pengguna lain.",
        }));
      } else {
        setUsernameStatus("available");
        setErrors((prev) => {
          if (!prev.username) return prev;
          const next = { ...prev };
          delete next.username;
          return next;
        });
      }
    }, 360);
  }, [username]);

  const navigateBackSmooth = useCallback(() => {
    if (ionRouter.canGoBack()) {
      ionRouter.goBack();
    } else {
      navigateWithTransition("/profile/account-info", "back");
    }
  }, [ionRouter, navigateWithTransition]);

  const handleBack = () => {
    if (isBusy) return;
    triggerHaptic(6);
    navigateBackSmooth();
  };

  const clearFieldError = (field: FieldKey) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleBlur = (field: FieldKey, value: string) => {
    if (field === "email" && emailTypingRef.current !== null) {
      window.clearTimeout(emailTypingRef.current);
      emailTypingRef.current = null;
    }
    const err = validateField(field, value);
    setErrors((prev) => {
      if (!err && !prev[field]) return prev;
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });
  };

  const handlePreventEnter = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleSave = () => {
    if (isBusy || usernameStatus === "checking") return;

    const nextErrors: FieldErrors = {};
    const fields: Array<{ key: FieldKey; value: string; id: string }> = [
      { key: "fullName", value: fullName, id: "edit-fullname" },
      { key: "username", value: username, id: "edit-username" },
      { key: "email", value: email, id: "edit-email" },
      { key: "phone", value: phone, id: "edit-phone" },
    ];

    let firstInvalidId: string | null = null;
    for (const item of fields) {
      const err = validateField(item.key, item.value);
      if (err) {
        nextErrors[item.key] = err;
        if (!firstInvalidId) firstInvalidId = item.id;
      }
    }

    setErrors(nextErrors);

    if (firstInvalidId) {
      triggerHaptic(14);
      triggerToast("Periksa kembali kolom yang bertanda merah.", "error");
      const targetEl = document.getElementById(firstInvalidId);
      if (targetEl) {
        targetEl.focus();
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    triggerHaptic(10);
    setSavePhase("saving");

    saveTimerRef.current = window.setTimeout(() => {
      const updated = saveAccountProfile({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim(),
        phone: phone.trim(),
      });
      initialProfile.current = updated;
      setSavePhase("saved");
      triggerHaptic([8, 30, 10]);
      triggerToast("Informasi akun berhasil disimpan.", "success");

      doneTimerRef.current = window.setTimeout(() => {
        navigateBackSmooth();
      }, 380);
    }, 360);
  };

  const getInputClass = (hasError: boolean) =>
    `h-[calc(44*var(--u))] w-full rounded-[calc(10*var(--u))] border px-[calc(12*var(--u))] text-[calc(14*var(--u))] font-normal text-[#171717] outline-none transition-[border-color,box-shadow,background-color] duration-220 placeholder:text-[#9E9EA9] ${
      hasError
        ? "border-[#C8102E] bg-[#FFF9FA] focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/15"
        : "border-[#DDDDE4] bg-white focus:border-[#740319] focus:ring-2 focus:ring-[#740319]/15"
    }`;

  return (
    <main
      style={MOBILE_SCALE_VARS}
      className="min-h-dvh w-full min-w-0 overflow-x-clip bg-[#FAFAFB] pb-[calc(104*var(--u)+env(safe-area-inset-bottom))]"
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
            disabled={isBusy}
            aria-label="Kembali"
            className="flex h-[calc(40*var(--u))] w-[calc(40*var(--u))] shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-[transform,background-color,opacity] duration-220 ease-out active:scale-90 active:bg-white/15 disabled:opacity-50"
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

      <form
        onSubmit={(e) => e.preventDefault()}
        onKeyDown={handlePreventEnter}
        noValidate
        className="moku-edit-enter mx-auto w-full max-w-[680px] px-[calc(16*var(--u))] pt-[calc(24*var(--u))]"
      >
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
                  alt={fullName || "Profil"}
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
              className="absolute bottom-0 right-0 flex cursor-pointer items-center justify-center rounded-full border-[calc(2.5*var(--u))] border-white bg-[#740319] text-white shadow-[0_2px_8px_rgba(116,3,25,0.35)] transition-[transform,background-color] duration-220 ease-out active:scale-90 active:bg-[#5B0213]"
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
            className="cursor-pointer rounded-[calc(8*var(--u))] px-[calc(8*var(--u))] py-[calc(4*var(--u))] text-[calc(13.5*var(--u))] font-medium text-[#6B6B76] transition-colors duration-220 active:bg-[#F0F0F4] active:text-[#171717]"
          >
            Ubah Foto Profil
          </button>
        </section>

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
            <div className="flex items-start gap-[calc(12*var(--u))]">
              <div
                style={{ marginTop: "calc(22 * var(--u))" }}
                className={`flex h-[calc(44*var(--u))] w-[calc(24*var(--u))] shrink-0 items-center justify-center transition-colors duration-220 ${
                  errors.fullName ? "text-[#C8102E]" : "text-[#1E1E24]"
                }`}
              >
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
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={
                    errors.fullName ? "edit-fullname-error" : undefined
                  }
                  onChange={(e) => {
                    setFullName(e.target.value);
                    clearFieldError("fullName");
                  }}
                  onBlur={() => handleBlur("fullName", fullName)}
                  placeholder="Masukkan nama lengkap"
                  className={getInputClass(Boolean(errors.fullName))}
                />
                {errors.fullName && (
                  <p
                    id="edit-fullname-error"
                    role="alert"
                    style={{ margin: 0, marginTop: "calc(4 * var(--u))" }}
                    className="moku-field-msg flex items-center gap-[calc(4*var(--u))] text-[calc(11.5*var(--u))] font-medium text-[#C8102E]"
                  >
                    <WarningCircle
                      weight="fill"
                      className="h-[calc(14*var(--u))] w-[calc(14*var(--u))] shrink-0"
                    />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-[calc(12*var(--u))]">
              <div
                style={{ marginTop: "calc(22 * var(--u))" }}
                className={`flex h-[calc(44*var(--u))] w-[calc(24*var(--u))] shrink-0 items-center justify-center transition-colors duration-220 ${
                  errors.username ? "text-[#C8102E]" : "text-[#1E1E24]"
                }`}
              >
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
                <div className="relative flex items-center">
                  <input
                    id="edit-username"
                    type="text"
                    value={username}
                    aria-invalid={Boolean(errors.username)}
                    aria-describedby={
                      errors.username ? "edit-username-error" : undefined
                    }
                    onChange={(e) => {
                      setUsername(e.target.value);
                      clearFieldError("username");
                    }}
                    onBlur={() => handleBlur("username", username)}
                    placeholder="Masukkan username"
                    className={`${getInputClass(
                      Boolean(errors.username)
                    )} pr-[calc(36*var(--u))]`}
                  />
                  {usernameStatus === "checking" && (
                    <CircleNotch
                      weight="bold"
                      className="moku-spin-slow pointer-events-none absolute right-[calc(12*var(--u))] h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#6B6B76]"
                    />
                  )}
                  {usernameStatus === "available" && !errors.username && (
                    <CheckCircle
                      weight="fill"
                      className="moku-field-msg pointer-events-none absolute right-[calc(12*var(--u))] h-[calc(18*var(--u))] w-[calc(18*var(--u))] text-[#16A34A]"
                    />
                  )}
                </div>

                {errors.username ? (
                  <p
                    id="edit-username-error"
                    role="alert"
                    style={{ margin: 0, marginTop: "calc(4 * var(--u))" }}
                    className="moku-field-msg flex items-center gap-[calc(4*var(--u))] text-[calc(11.5*var(--u))] font-medium text-[#C8102E]"
                  >
                    <WarningCircle
                      weight="fill"
                      className="h-[calc(14*var(--u))] w-[calc(14*var(--u))] shrink-0"
                    />
                    <span>{errors.username}</span>
                  </p>
                ) : usernameStatus === "available" ? (
                  <p
                    style={{ margin: 0, marginTop: "calc(4 * var(--u))" }}
                    className="moku-field-msg flex items-center gap-[calc(4*var(--u))] text-[calc(11.5*var(--u))] font-medium text-[#16A34A]"
                  >
                    <CheckCircle
                      weight="fill"
                      className="h-[calc(14*var(--u))] w-[calc(14*var(--u))] shrink-0"
                    />
                    <span>Username tersedia.</span>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex items-start gap-[calc(12*var(--u))]">
              <div
                style={{ marginTop: "calc(22 * var(--u))" }}
                className={`flex h-[calc(44*var(--u))] w-[calc(24*var(--u))] shrink-0 items-center justify-center transition-colors duration-220 ${
                  errors.email ? "text-[#C8102E]" : "text-[#1E1E24]"
                }`}
              >
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
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={email}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "edit-email-error" : undefined
                  }
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  onBlur={() => handleBlur("email", email)}
                  placeholder="nama@moku.id atau nama@gmail.com"
                  className={getInputClass(Boolean(errors.email))}
                />
                {errors.email && (
                  <p
                    id="edit-email-error"
                    role="alert"
                    style={{ margin: 0, marginTop: "calc(4 * var(--u))" }}
                    className="moku-field-msg flex items-center gap-[calc(4*var(--u))] text-[calc(11.5*var(--u))] font-medium text-[#C8102E]"
                  >
                    <WarningCircle
                      weight="fill"
                      className="h-[calc(14*var(--u))] w-[calc(14*var(--u))] shrink-0"
                    />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-[calc(12*var(--u))]">
              <div
                style={{ marginTop: "calc(22 * var(--u))" }}
                className={`flex h-[calc(44*var(--u))] w-[calc(24*var(--u))] shrink-0 items-center justify-center transition-colors duration-220 ${
                  errors.phone ? "text-[#C8102E]" : "text-[#1E1E24]"
                }`}
              >
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
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(6);
                      triggerToast("Kode negara aktif: Indonesia (+62).");
                    }}
                    className={`flex h-[calc(44*var(--u))] shrink-0 cursor-pointer items-center gap-[calc(6*var(--u))] rounded-[calc(10*var(--u))] border px-[calc(10*var(--u))] text-[calc(13.5*var(--u))] font-normal text-[#171717] transition-colors duration-220 active:bg-[#F4F4F7] ${
                      errors.phone
                        ? "border-[#C8102E] bg-[#FFF9FA]"
                        : "border-[#DDDDE4] bg-white"
                    }`}
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

                  <input
                    id="edit-phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={
                      errors.phone ? "edit-phone-error" : undefined
                    }
                    onChange={(e) => {
                      setPhone(e.target.value);
                      clearFieldError("phone");
                    }}
                    onBlur={() => handleBlur("phone", phone)}
                    placeholder="812-3456-7890"
                    className={`min-w-0 flex-1 ${getInputClass(
                      Boolean(errors.phone)
                    )}`}
                  />
                </div>
                {errors.phone && (
                  <p
                    id="edit-phone-error"
                    role="alert"
                    style={{ margin: 0, marginTop: "calc(4 * var(--u))" }}
                    className="moku-field-msg flex items-center gap-[calc(4*var(--u))] text-[calc(11.5*var(--u))] font-medium text-[#C8102E]"
                  >
                    <WarningCircle
                      weight="fill"
                      className="h-[calc(14*var(--u))] w-[calc(14*var(--u))] shrink-0"
                    />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

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
                    value={initialProfile.current.role}
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
                    value={initialProfile.current.branch}
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

            <div className="flex items-start gap-[calc(12*var(--u))] rounded-[calc(10*var(--u))] bg-[#FDF2F4] px-[calc(12*var(--u))] py-[calc(12*var(--u))]">
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

        <section
          style={{ marginTop: "calc(24 * var(--u))" }}
          className="space-y-[calc(12*var(--u))]"
        >
          <button
            type="button"
            onClick={handleSave}
            disabled={isBusy || usernameStatus === "checking"}
            className={`relative flex min-h-[calc(48*var(--u))] w-full cursor-pointer select-none items-center justify-center gap-[calc(8*var(--u))] overflow-hidden rounded-[calc(12*var(--u))] px-[calc(16*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(14.5*var(--u))] font-semibold text-white transition-[transform,background-color,box-shadow,opacity] duration-220 ease-out active:scale-[0.985] disabled:cursor-not-allowed ${
              savePhase === "saved"
                ? "bg-[#15803D] shadow-[0_4px_14px_rgba(21,128,61,0.28)]"
                : savePhase === "saving"
                ? "moku-save-pulse bg-[#5B0213] shadow-[0_4px_14px_rgba(116,3,25,0.28)]"
                : "bg-[#740319] shadow-[0_4px_12px_rgba(116,3,25,0.22)] hover:bg-[#620215] active:bg-[#5B0213] disabled:opacity-65"
            }`}
          >
            {savePhase === "saving" && (
              <>
                <CircleNotch
                  weight="bold"
                  className="moku-spin-slow h-[calc(18*var(--u))] w-[calc(18*var(--u))] text-white"
                />
                <span>Menyimpan...</span>
              </>
            )}
            {savePhase === "saved" && (
              <span className="moku-saved-pop inline-flex items-center gap-[calc(8*var(--u))]">
                <CheckCircle
                  weight="fill"
                  className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] text-white"
                />
                <span>Tersimpan</span>
              </span>
            )}
            {savePhase === "idle" && <span>Simpan Perubahan</span>}
          </button>

          <button
            type="button"
            onClick={handleBack}
            disabled={isBusy}
            className="flex min-h-[calc(48*var(--u))] w-full cursor-pointer select-none items-center justify-center rounded-[calc(12*var(--u))] border-[1.5px] border-[#740319] bg-white px-[calc(16*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(14.5*var(--u))] font-semibold text-[#740319] transition-[transform,background-color,opacity] duration-220 ease-out active:scale-[0.985] active:bg-[#FDF2F4] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>
        </section>
      </form>

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
            {toast.tone === "error" ? (
              <WarningCircle
                weight="fill"
                className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] shrink-0 text-[#F87171]"
              />
            ) : (
              <CheckCircle
                weight="fill"
                className="h-[calc(20*var(--u))] w-[calc(20*var(--u))] shrink-0 text-[#22C55E]"
              />
            )}
            <span className="truncate text-[calc(12.5*var(--u))] font-medium text-white">
              {toast.message}
            </span>
          </div>,
          document.body
        )}

      <style>{`
        .moku-edit-enter {
          animation: moku-edit-in 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .moku-field-msg {
          animation: moku-field-fade 280ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .moku-spin-slow {
          animation: moku-spin 900ms linear infinite;
        }
        .moku-save-pulse {
          animation: moku-save-ring 1100ms cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        .moku-saved-pop {
          animation: moku-saved-scale 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .moku-toast-enter {
          animation: moku-toast-up 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .moku-toast-exit {
          animation: moku-toast-down 380ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes moku-edit-in {
          from {
            opacity: 0;
            transform: translate3d(0, 12px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes moku-field-fade {
          from {
            opacity: 0;
            transform: translate3d(0, -3px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes moku-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes moku-save-ring {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(116, 3, 25, 0.32), 0 4px 14px rgba(116, 3, 25, 0.26);
          }
          50% {
            box-shadow: 0 0 0 7px rgba(116, 3, 25, 0), 0 4px 14px rgba(116, 3, 25, 0.26);
          }
        }
        @keyframes moku-saved-scale {
          0% {
            opacity: 0;
            transform: scale(0.94);
          }
          65% {
            opacity: 1;
            transform: scale(1.02);
          }
          100% {
            opacity: 1;
            transform: scale(1);
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
