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
  CaretRight,
  CheckCircle,
  CircleNotch,
  EnvelopeSimple,
  Image as ImageIcon,
  Info,
  LockSimple,
  Phone,
  ShieldCheck,
  Trash,
  User,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { useAppLayout } from "@/components/layout/app-shell";
import CameraCaptureOverlay from "@/components/profile/CameraCaptureOverlay";
import GalleryPickerOverlay from "@/components/profile/GalleryPickerOverlay";
import {
  DEFAULT_AVATAR_URL,
  getAccountProfile,
  isUsernameAlignedWithIdentity,
  isUsernameTaken,
  saveAccountProfile,
} from "@/lib/account-profile";

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

const SNACKBAR_SHOW_DELAY_MS = 140;
const SNACKBAR_VISIBLE_MS = 3600;
const SNACKBAR_EXIT_MS = 420;
const PHOTO_SHEET_EXIT_MS = 380;
const DEMO_OTP_CODE = "123456";

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
type OtpTarget = "email" | "phone";

interface OtpVerificationState {
  target: OtpTarget;
  destination: string;
  code: string;
  error?: string;
  resendCooldown: number;
}

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

function getPhoneError(value: string): string | undefined {
  const digits = value.trim().replace(/\D/g, "");
  if (!digits) return "Nomor telepon wajib diisi.";
  if (digits.length < 9 || digits.length > 13) {
    return "Nomor telepon harus terdiri dari 9–13 digit.";
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

  const [avatarUrl, setAvatarUrl] = useState<string>(
    initialProfile.current.avatarUrl || DEFAULT_AVATAR_URL
  );
  const [avatarError, setAvatarError] = useState(false);

  const [isPhotoSheetOpen, setIsPhotoSheetOpen] = useState(false);
  const [isPhotoSheetClosing, setIsPhotoSheetClosing] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteConfirmClosing, setIsDeleteConfirmClosing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const [fullName, setFullName] = useState(initialProfile.current.fullName);
  const [username, setUsername] = useState(initialProfile.current.username);
  const [email, setEmail] = useState(initialProfile.current.email);
  const [phone, setPhone] = useState(initialProfile.current.phone);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [usernameStatus, setUsernameStatus] =
    useState<UsernameCheckStatus>("idle");
  const [savePhase, setSavePhase] = useState<SavePhase>("idle");

  const [showEmailOtpNotice, setShowEmailOtpNotice] = useState(false);

  const [verifiedEmail, setVerifiedEmail] = useState<string>(
    initialProfile.current.email.trim().toLowerCase()
  );
  const [verifiedPhone, setVerifiedPhone] = useState<string>(
    initialProfile.current.phone.trim()
  );
  const [otpModal, setOtpModal] = useState<OtpVerificationState | null>(null);

  const [toast, setToast] = useState<{
    id: number;
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const [isToastClosing, setIsToastClosing] = useState(false);

  const toastDelayRef = useRef<number | null>(null);
  const toastAutoRef = useRef<number | null>(null);
  const toastExitRef = useRef<number | null>(null);
  const photoSheetExitRef = useRef<number | null>(null);
  const deleteConfirmExitRef = useRef<number | null>(null);
  const usernameCheckRef = useRef<number | null>(null);
  const emailTypingRef = useRef<number | null>(null);
  const emailOtpNoticeRef = useRef<number | null>(null);
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

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim();
  const isEmailValid = !getEmailError(email);
  const isPhoneValid = !getPhoneError(phone);
  const needsEmailOtp = isEmailValid && normalizedEmail !== verifiedEmail;
  const needsPhoneOtp = isPhoneValid && normalizedPhone !== verifiedPhone;

  useEffect(() => {
    if (emailOtpNoticeRef.current !== null) {
      window.clearTimeout(emailOtpNoticeRef.current);
      emailOtpNoticeRef.current = null;
    }

    if (!needsEmailOtp || errors.email) {
      setShowEmailOtpNotice(false);
      return;
    }

    emailOtpNoticeRef.current = window.setTimeout(() => {
      setShowEmailOtpNotice(true);
    }, 340);
  }, [needsEmailOtp, errors.email]);

  useEffect(() => {
    if (!isMobileView) return;
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((meta) => meta.setAttribute("content", "#740319"));
  }, [isMobileView]);

  useEffect(() => {
    if (!otpModal || otpModal.resendCooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setOtpModal((prev) =>
        prev
          ? { ...prev, resendCooldown: Math.max(0, prev.resendCooldown - 1) }
          : null
      );
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [otpModal]);

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
    (
      message: string,
      tone: "success" | "error" = "success",
      delayMs = 0
    ) => {
      if (toastDelayRef.current !== null) {
        window.clearTimeout(toastDelayRef.current);
        toastDelayRef.current = null;
      }
      if (toastAutoRef.current !== null) {
        window.clearTimeout(toastAutoRef.current);
        toastAutoRef.current = null;
      }
      if (toastExitRef.current !== null) {
        window.clearTimeout(toastExitRef.current);
        toastExitRef.current = null;
      }

      const showNow = () => {
        setIsToastClosing(false);
        setToast({ id: Date.now(), message, tone });
        toastAutoRef.current = window.setTimeout(() => {
          dismissToast();
        }, SNACKBAR_VISIBLE_MS);
      };

      if (delayMs > 0) {
        toastDelayRef.current = window.setTimeout(() => {
          toastDelayRef.current = null;
          showNow();
        }, delayMs);
      } else {
        showNow();
      }
    },
    [dismissToast]
  );

  const openPhotoSheet = useCallback(() => {
    if (isBusy) return;
    if (photoSheetExitRef.current !== null) {
      window.clearTimeout(photoSheetExitRef.current);
      photoSheetExitRef.current = null;
    }
    triggerHaptic(8);
    setIsPhotoSheetClosing(false);
    setIsPhotoSheetOpen(true);
  }, [isBusy]);

  const closePhotoSheet = useCallback(
    (afterClose?: () => void) => {
      if (!isPhotoSheetOpen || isPhotoSheetClosing) {
        afterClose?.();
        return;
      }
      triggerHaptic(6);
      setIsPhotoSheetClosing(true);
      if (photoSheetExitRef.current !== null) {
        window.clearTimeout(photoSheetExitRef.current);
      }
      photoSheetExitRef.current = window.setTimeout(() => {
        setIsPhotoSheetOpen(false);
        setIsPhotoSheetClosing(false);
        photoSheetExitRef.current = null;
        afterClose?.();
      }, PHOTO_SHEET_EXIT_MS);
    },
    [isPhotoSheetClosing, isPhotoSheetOpen]
  );

  const openDeleteConfirmSheet = useCallback(() => {
    if (deleteConfirmExitRef.current !== null) {
      window.clearTimeout(deleteConfirmExitRef.current);
      deleteConfirmExitRef.current = null;
    }
    triggerHaptic(8);
    setIsPhotoSheetOpen(false);
    setIsPhotoSheetClosing(false);
    setIsDeleteConfirmClosing(false);
    setIsDeleteConfirmOpen(true);
  }, []);

  const closeDeleteConfirmSheet = useCallback(
    (afterClose?: () => void) => {
      if (!isDeleteConfirmOpen || isDeleteConfirmClosing) {
        afterClose?.();
        return;
      }
      triggerHaptic(6);
      setIsDeleteConfirmClosing(true);
      if (deleteConfirmExitRef.current !== null) {
        window.clearTimeout(deleteConfirmExitRef.current);
      }
      deleteConfirmExitRef.current = window.setTimeout(() => {
        setIsDeleteConfirmOpen(false);
        setIsDeleteConfirmClosing(false);
        deleteConfirmExitRef.current = null;
        afterClose?.();
      }, PHOTO_SHEET_EXIT_MS);
    },
    [isDeleteConfirmClosing, isDeleteConfirmOpen]
  );

  const handleOpenCameraOverlay = () => {
    triggerHaptic(8);
    setIsPhotoSheetOpen(false);
    setIsPhotoSheetClosing(false);
    setIsCameraOpen(true);
  };

  const handleOpenGalleryOverlay = () => {
    triggerHaptic(8);
    setIsPhotoSheetOpen(false);
    setIsPhotoSheetClosing(false);
    setIsGalleryOpen(true);
  };

  const handlePhotoSelected = (dataUrl: string) => {
    setAvatarError(false);
    setAvatarUrl(dataUrl);
    saveAccountProfile({ avatarUrl: dataUrl });
    setIsCameraOpen(false);
    setIsGalleryOpen(false);
    triggerToast("Foto profil diperbarui.", "success", SNACKBAR_SHOW_DELAY_MS);
  };

  const handleConfirmRemovePhoto = () => {
    triggerHaptic([8, 20, 10]);
    closeDeleteConfirmSheet(() => {
      setAvatarError(false);
      setAvatarUrl(DEFAULT_AVATAR_URL);
      saveAccountProfile({ avatarUrl: DEFAULT_AVATAR_URL });
      triggerToast("Foto profil dihapus.", "success", SNACKBAR_SHOW_DELAY_MS);
    });
  };

  useEffect(() => {
    return () => {
      if (toastDelayRef.current !== null) {
        window.clearTimeout(toastDelayRef.current);
      }
      if (toastAutoRef.current !== null) {
        window.clearTimeout(toastAutoRef.current);
      }
      if (toastExitRef.current !== null) {
        window.clearTimeout(toastExitRef.current);
      }
      if (photoSheetExitRef.current !== null) {
        window.clearTimeout(photoSheetExitRef.current);
      }
      if (deleteConfirmExitRef.current !== null) {
        window.clearTimeout(deleteConfirmExitRef.current);
      }
      if (usernameCheckRef.current !== null) {
        window.clearTimeout(usernameCheckRef.current);
      }
      if (emailTypingRef.current !== null) {
        window.clearTimeout(emailTypingRef.current);
      }
      if (emailOtpNoticeRef.current !== null) {
        window.clearTimeout(emailOtpNoticeRef.current);
      }
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
      if (doneTimerRef.current !== null) {
        window.clearTimeout(doneTimerRef.current);
      }
    };
  }, []);

  const openOtpVerification = useCallback(
    (target: OtpTarget, destination: string) => {
      triggerHaptic(8);
      setOtpModal({
        target,
        destination,
        code: "",
        resendCooldown: 30,
      });
      triggerToast(
        target === "email"
          ? `Kode OTP dikirim ke ${destination}`
          : `Kode OTP dikirim ke +62 ${destination}`,
        "success"
      );
    },
    [triggerToast]
  );

  const handleConfirmOtp = () => {
    if (!otpModal) return;
    const cleanCode = otpModal.code.trim();
    if (cleanCode.length !== 6) {
      triggerHaptic(12);
      setOtpModal((prev) =>
        prev ? { ...prev, error: "Masukkan 6 digit kode OTP." } : null
      );
      return;
    }

    if (cleanCode !== DEMO_OTP_CODE) {
      triggerHaptic(14);
      setOtpModal((prev) =>
        prev
          ? {
              ...prev,
              error: `Kode OTP tidak sesuai (gunakan ${DEMO_OTP_CODE}).`,
            }
          : null
      );
      return;
    }

    triggerHaptic([8, 25, 10]);
    if (otpModal.target === "email") {
      setVerifiedEmail(otpModal.destination.trim().toLowerCase());
      setShowEmailOtpNotice(false);
      clearFieldError("email");
      triggerToast("Email baru berhasil diverifikasi.", "success");
    } else {
      setVerifiedPhone(otpModal.destination.trim());
      clearFieldError("phone");
      triggerToast("Nomor telepon baru berhasil diverifikasi.", "success");
    }
    setOtpModal(null);
  };

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
        case "phone":
          return getPhoneError(value);
        default:
          return undefined;
      }
    },
    [email, fullName]
  );

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
    }, 520);
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
    }, 380);
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

  const commitSaveProfile = () => {
    triggerHaptic(10);
    setSavePhase("saving");

    saveTimerRef.current = window.setTimeout(() => {
      const updated = saveAccountProfile({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim(),
        phone: phone.trim(),
        avatarUrl,
      });
      initialProfile.current = updated;
      setVerifiedEmail(updated.email.trim().toLowerCase());
      setVerifiedPhone(updated.phone.trim());
      setSavePhase("saved");
      triggerHaptic([8, 30, 10]);
      triggerToast("Informasi akun berhasil disimpan.", "success");

      doneTimerRef.current = window.setTimeout(() => {
        navigateBackSmooth();
      }, 420);
    }, 420);
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

    if (needsEmailOtp) {
      triggerToast("Klik Verifikasi untuk memvalidasi email baru Anda.", "error");
      return;
    }

    if (needsPhoneOtp) {
      triggerToast("Klik Verifikasi untuk memvalidasi nomor baru Anda.", "error");
      return;
    }

    commitSaveProfile();
  };

  const getInputClass = (hasError: boolean, hasPendingOtp = false) =>
    `h-[calc(44*var(--u))] w-full rounded-[calc(10*var(--u))] border px-[calc(12*var(--u))] text-[calc(14*var(--u))] font-normal text-[#171717] outline-none transition-[border-color,box-shadow,background-color] duration-420 ease-out placeholder:text-[#9E9EA9] ${
      hasError
        ? "border-[#C8102E] bg-[#FFF9FA] focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/15"
        : hasPendingOtp
        ? "border-[#E11D48]/60 bg-white focus:border-[#740319] focus:ring-2 focus:ring-[#740319]/15"
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
            className="flex h-[calc(40*var(--u))] w-[calc(40*var(--u))] shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-[transform,background-color,opacity] duration-260 ease-out active:scale-90 active:bg-white/15 disabled:opacity-50"
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
        {/* Avatar Besar Bersih Tanpa Teks di Bawahnya */}
        <section className="flex flex-col items-center text-center">
          <div className="relative">
            <button
              type="button"
              key={avatarUrl}
              onClick={openPhotoSheet}
              aria-label="Ubah Foto Profil"
              style={{
                width: "calc(120 * var(--u))",
                height: "calc(120 * var(--u))",
              }}
              className="moku-avatar-pop flex cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#FCECEF] transition-transform duration-200 active:scale-[0.97]"
            >
              {!avatarError ? (
                <img
                  src={avatarUrl || DEFAULT_AVATAR_URL}
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
            </button>

            <button
              type="button"
              onClick={openPhotoSheet}
              aria-label="Ubah Foto Profil"
              style={{
                width: "calc(36 * var(--u))",
                height: "calc(36 * var(--u))",
              }}
              className="absolute bottom-0 right-0 flex cursor-pointer items-center justify-center rounded-full border-[calc(3*var(--u))] border-white bg-[#740319] text-white transition-[transform,background-color] duration-260 ease-out active:scale-90 active:bg-[#5B0213]"
            >
              <Camera
                weight="fill"
                className="h-[calc(17*var(--u))] w-[calc(17*var(--u))]"
              />
            </button>
          </div>
        </section>

        <section
          style={{ marginTop: "calc(20 * var(--u))" }}
          className="rounded-[calc(16*var(--u))] border border-[#EFEFF3] bg-white p-[calc(16*var(--u))]"
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
                className={`flex h-[calc(44*var(--u))] w-[calc(24*var(--u))] shrink-0 items-center justify-center transition-colors duration-300 ${
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
                    className="moku-smooth-swap flex items-center gap-[calc(4*var(--u))] text-[calc(11.5*var(--u))] font-medium text-[#C8102E]"
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
                className={`flex h-[calc(44*var(--u))] w-[calc(24*var(--u))] shrink-0 items-center justify-center transition-colors duration-300 ${
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
                      className="moku-smooth-swap pointer-events-none absolute right-[calc(12*var(--u))] h-[calc(18*var(--u))] w-[calc(18*var(--u))] text-[#16A34A]"
                    />
                  )}
                </div>

                {errors.username ? (
                  <p
                    id="edit-username-error"
                    role="alert"
                    style={{ margin: 0, marginTop: "calc(4 * var(--u))" }}
                    className="moku-smooth-swap flex items-center gap-[calc(4*var(--u))] text-[calc(11.5*var(--u))] font-medium text-[#C8102E]"
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
                    className="moku-smooth-swap flex items-center gap-[calc(4*var(--u))] text-[calc(11.5*var(--u))] font-medium text-[#16A34A]"
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
                className={`flex h-[calc(44*var(--u))] w-[calc(24*var(--u))] shrink-0 items-center justify-center transition-colors duration-420 ease-out ${
                  errors.email || showEmailOtpNotice
                    ? "text-[#C8102E]"
                    : "text-[#1E1E24]"
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
                <div className="relative flex items-center">
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
                      const nextVal = e.target.value;
                      setEmail(nextVal);
                      if (errors.email && !getEmailError(nextVal)) {
                        clearFieldError("email");
                      }
                    }}
                    onBlur={() => handleBlur("email", email)}
                    placeholder="nama@moku.id"
                    className={`${getInputClass(
                      Boolean(errors.email),
                      showEmailOtpNotice
                    )} ${showEmailOtpNotice ? "pr-[calc(76*var(--u))]" : ""}`}
                  />
                  {showEmailOtpNotice && (
                    <button
                      type="button"
                      onClick={() =>
                        openOtpVerification("email", normalizedEmail)
                      }
                      className="moku-smooth-swap absolute right-[calc(6*var(--u))] flex h-[calc(30*var(--u))] cursor-pointer items-center justify-center rounded-[calc(7*var(--u))] bg-[#FDF2F4] px-[calc(8*var(--u))] text-[calc(11*var(--u))] font-semibold text-[#740319] transition-colors duration-250 active:bg-[#F9DCE2]"
                    >
                      Verifikasi
                    </button>
                  )}
                </div>

                {errors.email && (
                  <p
                    key="email-err-msg"
                    id="edit-email-error"
                    role="alert"
                    style={{ margin: 0, marginTop: "calc(4 * var(--u))" }}
                    className="moku-smooth-swap flex items-center gap-[calc(4*var(--u))] text-[calc(11.5*var(--u))] font-medium text-[#C8102E]"
                  >
                    <WarningCircle
                      weight="fill"
                      className="h-[calc(14*var(--u))] w-[calc(14*var(--u))] shrink-0"
                    />
                    <span>{errors.email}</span>
                  </p>
                )}

                {showEmailOtpNotice && (
                  <div
                    key="email-otp-banner"
                    style={{ marginTop: "calc(6 * var(--u))" }}
                    className="moku-smooth-swap flex w-full items-center gap-[calc(6*var(--u))] rounded-[calc(8*var(--u))] border border-[#E5E7EB] bg-[#F2F3F5] px-[calc(8*var(--u))] py-[calc(6*var(--u))]"
                  >
                    <Info
                      weight="regular"
                      className="h-[calc(14*var(--u))] w-[calc(14*var(--u))] shrink-0 text-[#1F2937]"
                    />
                    <span className="truncate text-[calc(11*var(--u))] font-normal leading-none text-[#1F2937]">
                      Klik Verifikasi untuk memvalidasi email baru Anda.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-[calc(12*var(--u))]">
              <div
                style={{ marginTop: "calc(22 * var(--u))" }}
                className={`flex h-[calc(44*var(--u))] w-[calc(24*var(--u))] shrink-0 items-center justify-center transition-colors duration-300 ${
                  errors.phone || needsPhoneOtp
                    ? "text-[#C8102E]"
                    : "text-[#1E1E24]"
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
                    className={`flex h-[calc(44*var(--u))] shrink-0 cursor-pointer items-center gap-[calc(6*var(--u))] rounded-[calc(10*var(--u))] border px-[calc(10*var(--u))] text-[calc(13.5*var(--u))] font-normal text-[#171717] transition-colors duration-300 active:bg-[#F4F4F7] ${
                      errors.phone
                        ? "border-[#C8102E] bg-[#FFF9FA]"
                        : needsPhoneOtp
                        ? "border-[#E11D48]/60 bg-white"
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

                  <div className="relative flex min-w-0 flex-1 items-center">
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
                      className={`${getInputClass(
                        Boolean(errors.phone),
                        needsPhoneOtp
                      )} ${needsPhoneOtp ? "pr-[calc(76*var(--u))]" : ""}`}
                    />
                    {needsPhoneOtp && (
                      <button
                        type="button"
                        onClick={() =>
                          openOtpVerification("phone", normalizedPhone)
                        }
                        className="moku-smooth-swap absolute right-[calc(6*var(--u))] flex h-[calc(30*var(--u))] cursor-pointer items-center justify-center rounded-[calc(7*var(--u))] bg-[#FDF2F4] px-[calc(8*var(--u))] text-[calc(11*var(--u))] font-semibold text-[#740319] transition-colors duration-250 active:bg-[#F9DCE2]"
                      >
                        Verifikasi
                      </button>
                    )}
                  </div>
                </div>

                {errors.phone && (
                  <p
                    id="edit-phone-error"
                    role="alert"
                    style={{ margin: 0, marginTop: "calc(4 * var(--u))" }}
                    className="moku-smooth-swap flex items-center gap-[calc(4*var(--u))] text-[calc(11.5*var(--u))] font-medium text-[#C8102E]"
                  >
                    <WarningCircle
                      weight="fill"
                      className="h-[calc(14*var(--u))] w-[calc(14*var(--u))] shrink-0"
                    />
                    <span>{errors.phone}</span>
                  </p>
                )}

                {needsPhoneOtp && (
                  <div
                    style={{ marginTop: "calc(6 * var(--u))" }}
                    className="moku-smooth-swap flex w-full items-center gap-[calc(6*var(--u))] rounded-[calc(8*var(--u))] border border-[#E5E7EB] bg-[#F2F3F5] px-[calc(8*var(--u))] py-[calc(6*var(--u))]"
                  >
                    <Info
                      weight="regular"
                      className="h-[calc(14*var(--u))] w-[calc(14*var(--u))] shrink-0 text-[#1F2937]"
                    />
                    <span className="truncate text-[calc(11*var(--u))] font-normal leading-none text-[#1F2937]">
                      Klik Verifikasi untuk memvalidasi nomor baru Anda.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section
          style={{ marginTop: "calc(16 * var(--u))" }}
          className="rounded-[calc(16*var(--u))] border border-[#EFEFF3] bg-white p-[calc(16*var(--u))]"
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
                  Posisi
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
                Posisi dan cabang tidak dapat diubah. Hubungi admin jika ada
                perubahan data operasional.
              </p>
            </div>
          </div>
        </section>

        {/* Tombol Batal (Kiri) & Simpan (Kanan) Tanpa Bayangan */}
        <section
          style={{ marginTop: "calc(24 * var(--u))" }}
          className="grid grid-cols-2 gap-[calc(12*var(--u))]"
        >
          <button
            type="button"
            onClick={handleBack}
            disabled={isBusy}
            className="flex min-h-[calc(48*var(--u))] w-full cursor-pointer select-none items-center justify-center rounded-[calc(12*var(--u))] border-[1.5px] border-[#740319] bg-white px-[calc(16*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(14.5*var(--u))] font-semibold text-[#740319] transition-[transform,background-color,opacity] duration-260 ease-out active:scale-[0.985] active:bg-[#FDF2F4] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isBusy || usernameStatus === "checking"}
            className={`relative flex min-h-[calc(48*var(--u))] w-full cursor-pointer select-none items-center justify-center gap-[calc(8*var(--u))] overflow-hidden rounded-[calc(12*var(--u))] px-[calc(16*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(14.5*var(--u))] font-semibold text-white transition-[transform,background-color,opacity] duration-260 ease-out active:scale-[0.985] disabled:cursor-not-allowed ${
              savePhase === "saved"
                ? "bg-[#15803D]"
                : savePhase === "saving"
                ? "bg-[#5B0213]"
                : "bg-[#740319] hover:bg-[#620215] active:bg-[#5B0213] disabled:opacity-65"
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
            {savePhase === "idle" && <span>Simpan</span>}
          </button>
        </section>
      </form>

      <CameraCaptureOverlay
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handlePhotoSelected}
        onOpenGallery={handleOpenGalleryOverlay}
      />

      <GalleryPickerOverlay
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectPhoto={handlePhotoSelected}
      />

      {isPhotoSheetOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={MOBILE_SCALE_VARS}
            className={`fixed inset-0 z-[9996] flex items-end justify-center ${
              isPhotoSheetClosing ? "moku-backdrop-out" : "moku-backdrop-in"
            }`}
          >
            <div
              onClick={() => closePhotoSheet()}
              aria-hidden="true"
              className="fixed inset-0 bg-black/45"
            />

            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="photo-sheet-title"
              style={{
                paddingBottom:
                  "calc(env(safe-area-inset-bottom) + 14 * var(--u))",
              }}
              className={`relative z-10 w-full max-w-[680px] rounded-t-[calc(24*var(--u))] bg-white px-[calc(16*var(--u))] pt-[calc(10*var(--u))] ${
                isPhotoSheetClosing ? "moku-sheet-down" : "moku-sheet-up"
              }`}
            >
              <div
                style={{
                  width: "calc(38 * var(--u))",
                  height: "calc(4 * var(--u))",
                  marginBottom: "calc(12 * var(--u))",
                }}
                className="mx-auto rounded-full bg-[#D6D6DC]"
              />

              <div
                style={{ marginBottom: "calc(12 * var(--u))" }}
                className="flex items-center justify-between gap-[calc(12*var(--u))]"
              >
                <div className="w-[calc(32*var(--u))]" aria-hidden="true" />
                <h3
                  id="photo-sheet-title"
                  style={{ margin: 0 }}
                  className="text-center font-display text-[calc(16*var(--u))] font-bold text-[#171717]"
                >
                  Ubah Foto Profil
                </h3>
                <button
                  type="button"
                  onClick={() => closePhotoSheet()}
                  aria-label="Tutup"
                  className="flex h-[calc(32*var(--u))] w-[calc(32*var(--u))] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#F4F4F6] text-[#52525B] transition-[transform,background-color] duration-200 active:scale-90 active:bg-[#E4E4EA]"
                >
                  <X
                    weight="bold"
                    className="h-[calc(15*var(--u))] w-[calc(15*var(--u))]"
                  />
                </button>
              </div>

              <div className="divide-y divide-[#F0F0F4]">
                <button
                  type="button"
                  onClick={handleOpenCameraOverlay}
                  className="flex min-h-[calc(54*var(--u))] w-full cursor-pointer items-center justify-between gap-[calc(12*var(--u))] py-[calc(10*var(--u))] text-left transition-colors duration-200 active:bg-[#FAFAFB]"
                >
                  <span className="flex items-center gap-[calc(12*var(--u))]">
                    <span className="flex h-[calc(38*var(--u))] w-[calc(38*var(--u))] shrink-0 items-center justify-center rounded-full bg-[#FDF2F4] text-[#C8102E]">
                      <Camera
                        weight="regular"
                        className="h-[calc(19*var(--u))] w-[calc(19*var(--u))]"
                      />
                    </span>
                    <span className="text-[calc(14*var(--u))] font-medium text-[#171717]">
                      Ambil Foto
                    </span>
                  </span>
                  <CaretRight
                    weight="regular"
                    className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#8A8A96]"
                  />
                </button>

                <button
                  type="button"
                  onClick={handleOpenGalleryOverlay}
                  className="flex min-h-[calc(54*var(--u))] w-full cursor-pointer items-center justify-between gap-[calc(12*var(--u))] py-[calc(10*var(--u))] text-left transition-colors duration-200 active:bg-[#FAFAFB]"
                >
                  <span className="flex items-center gap-[calc(12*var(--u))]">
                    <span className="flex h-[calc(38*var(--u))] w-[calc(38*var(--u))] shrink-0 items-center justify-center rounded-full bg-[#FDF2F4] text-[#C8102E]">
                      <ImageIcon
                        weight="regular"
                        className="h-[calc(19*var(--u))] w-[calc(19*var(--u))]"
                      />
                    </span>
                    <span className="text-[calc(14*var(--u))] font-medium text-[#171717]">
                      Pilih dari Galeri
                    </span>
                  </span>
                  <CaretRight
                    weight="regular"
                    className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#8A8A96]"
                  />
                </button>

                <button
                  type="button"
                  onClick={openDeleteConfirmSheet}
                  className="flex min-h-[calc(54*var(--u))] w-full cursor-pointer items-center justify-between gap-[calc(12*var(--u))] py-[calc(10*var(--u))] text-left transition-colors duration-200 active:bg-[#FFF9FA]"
                >
                  <span className="flex items-center gap-[calc(12*var(--u))]">
                    <span className="flex h-[calc(38*var(--u))] w-[calc(38*var(--u))] shrink-0 items-center justify-center rounded-full bg-[#FDF2F4] text-[#C8102E]">
                      <Trash
                        weight="regular"
                        className="h-[calc(19*var(--u))] w-[calc(19*var(--u))]"
                      />
                    </span>
                    <span className="text-[calc(14*var(--u))] font-medium text-[#C8102E]">
                      Hapus Foto
                    </span>
                  </span>
                  <CaretRight
                    weight="regular"
                    className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#C8102E]/70"
                  />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {isDeleteConfirmOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={MOBILE_SCALE_VARS}
            className={`fixed inset-0 z-[9997] flex items-end justify-center ${
              isDeleteConfirmClosing ? "moku-backdrop-out" : "moku-backdrop-in"
            }`}
          >
            <div
              onClick={() => closeDeleteConfirmSheet()}
              aria-hidden="true"
              className="fixed inset-0 bg-black/50"
            />

            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-photo-title"
              style={{
                paddingBottom:
                  "calc(env(safe-area-inset-bottom) + 18 * var(--u))",
              }}
              className={`relative z-10 w-full max-w-[680px] rounded-t-[calc(24*var(--u))] bg-white px-[calc(20*var(--u))] pt-[calc(10*var(--u))] text-center ${
                isDeleteConfirmClosing ? "moku-sheet-down" : "moku-sheet-up"
              }`}
            >
              <div
                style={{
                  width: "calc(38 * var(--u))",
                  height: "calc(4 * var(--u))",
                  marginBottom: "calc(18 * var(--u))",
                }}
                className="mx-auto rounded-full bg-[#D6D6DC]"
              />

              <div
                aria-hidden="true"
                style={{ marginBottom: "calc(18 * var(--u))" }}
                className="relative mx-auto flex h-[calc(112*var(--u))] w-[calc(132*var(--u))] items-center justify-center"
              >
                <div className="h-[calc(86*var(--u))] w-[calc(104*var(--u))] rounded-[44%_56%_52%_48%/48%_44%_56%_52%] bg-[#FCECEF]" />

                <span
                  style={{
                    top: "calc(8 * var(--u))",
                    right: "calc(22 * var(--u))",
                  }}
                  className="absolute h-[calc(10*var(--u))] w-[calc(2.5*var(--u))] rotate-[28deg] rounded-full bg-[#9E1B32]"
                />
                <span
                  style={{
                    top: "calc(16 * var(--u))",
                    right: "calc(12 * var(--u))",
                  }}
                  className="absolute h-[calc(8*var(--u))] w-[calc(2.5*var(--u))] rotate-[62deg] rounded-full bg-[#9E1B32]"
                />

                <div
                  style={{
                    top: "calc(12 * var(--u))",
                    left: "calc(46 * var(--u))",
                    width: "calc(34 * var(--u))",
                    height: "calc(28 * var(--u))",
                  }}
                  className="absolute flex -rotate-[16deg] items-center justify-center rounded-[calc(5*var(--u))] border-[calc(2*var(--u))] border-[#740319] bg-white"
                >
                  <ImageIcon
                    weight="fill"
                    className="h-[calc(16*var(--u))] w-[calc(16*var(--u))] text-[#C8102E]"
                  />
                </div>

                <div
                  style={{
                    bottom: "calc(14 * var(--u))",
                    width: "calc(56 * var(--u))",
                  }}
                  className="absolute flex flex-col items-center"
                >
                  <div className="h-[calc(6*var(--u))] w-[calc(64*var(--u))] rounded-full bg-[#740319]" />
                  <div className="mt-[calc(2*var(--u))] flex h-[calc(44*var(--u))] w-full items-center justify-center gap-[calc(5*var(--u))] rounded-b-[calc(10*var(--u))] bg-[#740319] px-[calc(8*var(--u))]">
                    <span className="h-[calc(22*var(--u))] w-[calc(4*var(--u))] rounded-full bg-white/90" />
                    <span className="h-[calc(22*var(--u))] w-[calc(4*var(--u))] rounded-full bg-white/90" />
                    <span className="h-[calc(22*var(--u))] w-[calc(4*var(--u))] rounded-full bg-white/90" />
                  </div>
                </div>
              </div>

              <h3
                id="delete-photo-title"
                style={{ margin: 0, marginBottom: "calc(8 * var(--u))" }}
                className="font-display text-[calc(18*var(--u))] font-bold text-[#171717]"
              >
                Hapus Foto Profil?
              </h3>

              <p
                style={{ margin: 0, marginBottom: "calc(22 * var(--u))" }}
                className="mx-auto max-w-[270px] text-[calc(13*var(--u))] font-normal leading-relaxed text-[#6B6B76]"
              >
                Foto profil kamu akan dihapus dan diganti dengan avatar default.
              </p>

              <div className="space-y-[calc(10*var(--u))]">
                <button
                  type="button"
                  onClick={handleConfirmRemovePhoto}
                  className="flex min-h-[calc(48*var(--u))] w-full cursor-pointer items-center justify-center rounded-[calc(12*var(--u))] bg-[#740319] px-[calc(16*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(14.5*var(--u))] font-semibold text-white transition-[transform,background-color] duration-200 active:scale-[0.985] active:bg-[#5B0213]"
                >
                  Hapus Foto
                </button>

                <button
                  type="button"
                  onClick={() => closeDeleteConfirmSheet()}
                  className="flex min-h-[calc(48*var(--u))] w-full cursor-pointer items-center justify-center rounded-[calc(12*var(--u))] border-[1.5px] border-[#740319] bg-white px-[calc(16*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(14.5*var(--u))] font-semibold text-[#740319] transition-[transform,background-color] duration-200 active:scale-[0.985] active:bg-[#FDF2F4]"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {otpModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={MOBILE_SCALE_VARS}
            className="fixed inset-0 z-[9997] flex items-center justify-center bg-black/45 px-[calc(16*var(--u))] backdrop-blur-[1px]"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="otp-modal-title"
              className="moku-smooth-swap w-full max-w-[420px] rounded-[calc(16*var(--u))] border border-[#EFEFF3] bg-white p-[calc(20*var(--u))]"
            >
              <div className="mb-[calc(12*var(--u))] flex items-center gap-[calc(10*var(--u))]">
                <div className="flex h-[calc(36*var(--u))] w-[calc(36*var(--u))] shrink-0 items-center justify-center rounded-full bg-[#FDF2F4] text-[#740319]">
                  <ShieldCheck
                    weight="fill"
                    className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                  />
                </div>
                <h3
                  id="otp-modal-title"
                  style={{ margin: 0 }}
                  className="font-display text-[calc(16*var(--u))] font-bold text-[#171717]"
                >
                  {otpModal.target === "email"
                    ? "Verifikasi Email Baru"
                    : "Verifikasi Nomor Telepon"}
                </h3>
              </div>

              <p
                style={{ margin: 0, marginBottom: "calc(16 * var(--u))" }}
                className="text-[calc(12.5*var(--u))] font-normal leading-relaxed text-[#52525B]"
              >
                Masukkan 6 digit kode OTP yang dikirim ke{" "}
                <span className="font-semibold text-[#171717]">
                  {otpModal.target === "email"
                    ? otpModal.destination
                    : `+62 ${otpModal.destination}`}
                </span>
                .
              </p>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                value={otpModal.code}
                onChange={(e) => {
                  const digitsOnly = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);
                  setOtpModal((prev) =>
                    prev ? { ...prev, code: digitsOnly, error: undefined } : null
                  );
                }}
                placeholder="6 digit kode OTP"
                className={`h-[calc(44*var(--u))] w-full rounded-[calc(10*var(--u))] border px-[calc(12*var(--u))] text-center text-[calc(16*var(--u))] font-semibold tracking-[0.28em] text-[#171717] outline-none ${
                  otpModal.error
                    ? "border-[#C8102E] bg-[#FFF9FA] focus:border-[#C8102E]"
                    : "border-[#DDDDE4] bg-white focus:border-[#740319]"
                }`}
              />

              {otpModal.error && (
                <p
                  role="alert"
                  style={{ margin: 0, marginTop: "calc(6 * var(--u))" }}
                  className="flex items-center gap-[calc(4*var(--u))] text-[calc(11.5*var(--u))] font-medium text-[#C8102E]"
                >
                  <WarningCircle
                    weight="fill"
                    className="h-[calc(14*var(--u))] w-[calc(14*var(--u))] shrink-0"
                  />
                  <span>{otpModal.error}</span>
                </p>
              )}

              <div
                style={{ marginTop: "calc(12 * var(--u))" }}
                className="flex items-center justify-between text-[calc(12*var(--u))]"
              >
                <span className="text-[#6B6B76]">Kode uji: {DEMO_OTP_CODE}</span>
                <button
                  type="button"
                  disabled={otpModal.resendCooldown > 0}
                  onClick={() => {
                    triggerHaptic(6);
                    setOtpModal((prev) =>
                      prev
                        ? { ...prev, resendCooldown: 30, error: undefined }
                        : null
                    );
                    triggerToast("Kode OTP baru telah dikirim ulang.", "success");
                  }}
                  className="cursor-pointer font-semibold text-[#740319] disabled:cursor-not-allowed disabled:text-[#9E9EA9]"
                >
                  {otpModal.resendCooldown > 0
                    ? `Kirim ulang (${otpModal.resendCooldown}d)`
                    : "Kirim ulang OTP"}
                </button>
              </div>

              <div
                style={{ marginTop: "calc(16 * var(--u))" }}
                className="flex items-center gap-[calc(10*var(--u))]"
              >
                <button
                  type="button"
                  onClick={() => setOtpModal(null)}
                  className="flex h-[calc(44*var(--u))] flex-1 cursor-pointer items-center justify-center rounded-[calc(10*var(--u))] border border-[#DDDDE4] bg-white text-[calc(13.5*var(--u))] font-semibold text-[#2D2D34] active:bg-[#F4F4F7]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOtp}
                  className="flex h-[calc(44*var(--u))] flex-1 cursor-pointer items-center justify-center rounded-[calc(10*var(--u))] bg-[#740319] text-[calc(13.5*var(--u))] font-semibold text-white active:bg-[#5B0213]"
                >
                  Verifikasi
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {toast &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            key={toast.id}
            style={MOBILE_SCALE_VARS}
            role="status"
            aria-live="polite"
            className={`fixed bottom-[calc(80px+env(safe-area-inset-bottom))] left-4 right-4 z-[9998] mx-auto flex max-w-[600px] items-center gap-[calc(12*var(--u))] rounded-[calc(12*var(--u))] bg-[#22252A] px-[calc(16*var(--u))] py-[calc(12*var(--u))] text-white ${
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
          animation: moku-edit-in 540ms cubic-bezier(0.25, 1, 0.5, 1) both;
        }
        .moku-avatar-pop {
          animation: moku-avatar-in 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .moku-smooth-swap {
          animation: moku-swap-in 540ms cubic-bezier(0.25, 1, 0.5, 1) both;
        }
        .moku-backdrop-in {
          animation: moku-fade-in 380ms cubic-bezier(0.25, 1, 0.5, 1) both;
        }
        .moku-backdrop-out {
          animation: moku-fade-out 360ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .moku-sheet-up {
          animation: moku-sheet-in 460ms cubic-bezier(0.25, 1, 0.5, 1) both;
        }
        .moku-sheet-down {
          animation: moku-sheet-exit 380ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .moku-spin-slow {
          animation: moku-spin 950ms linear infinite;
        }
        .moku-saved-pop {
          animation: moku-saved-scale 440ms cubic-bezier(0.25, 1, 0.5, 1) both;
        }
        .moku-toast-enter {
          animation: moku-toast-up 520ms cubic-bezier(0.25, 1, 0.5, 1) both;
        }
        .moku-toast-exit {
          animation: moku-toast-down 460ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
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
        @keyframes moku-avatar-in {
          from {
            opacity: 0.35;
            transform: scale(0.94);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes moku-swap-in {
          from {
            opacity: 0;
            transform: translate3d(0, -6px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes moku-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes moku-fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        @keyframes moku-sheet-in {
          from {
            opacity: 0.4;
            transform: translate3d(0, 100%, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes moku-sheet-exit {
          from {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
          to {
            opacity: 0;
            transform: translate3d(0, 100%, 0);
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
        @keyframes moku-saved-scale {
          0% {
            opacity: 0;
            transform: scale(0.95);
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
