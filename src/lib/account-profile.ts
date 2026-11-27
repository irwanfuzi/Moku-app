import { useEffect, useState } from "react";

export interface AccountProfile {
  fullName: string;
  username: string;
  email: string;
  phone: string; // tanpa +62, misal: "812-3456-7890"
  role: string;
  branch: string;
  joinedAt: string;
  avatarUrl: string | null; // null = tampil inisial, DEFAULT_AVATAR_URL = robot moku
}

const STORAGE_KEY = "moku_account_profile_v1";
const PROFILE_UPDATED_EVENT = "moku:account-profile-updated";

export const DEFAULT_AVATAR_URL = "/images/moku/brand/moku-avatar.png";
export const REMOVED_AVATAR_VALUE = "__removed__";

export const DEFAULT_ACCOUNT_PROFILE: AccountProfile = {
  fullName: "Budi Santoso",
  username: "budisantoso",
  email: "budi.santoso@moku.id",
  phone: "812-3456-7890",
  role: "Teknisi",
  branch: "Cabang Jakarta 3",
  joinedAt: "12 Jan 2024",
  avatarUrl: DEFAULT_AVATAR_URL,
};

// Simulasi daftar username yang sudah dipakai user lain di sistem
export const TAKEN_USERNAMES = new Set([
  "admin",
  "administrator",
  "moku",
  "budi.admin",
  "budi.santoso",
  "budisantoso1",
  "andi.wijaya",
  "siti.rahma",
  "agus.pratama",
  "teknisi.jkt3",
]);

function resolveAvatarUrl(rawAvatar: unknown): string | null {
  if (rawAvatar === REMOVED_AVATAR_VALUE) {
    return null;
  }
  if (typeof rawAvatar === "string" && rawAvatar.trim().length > 0) {
    return rawAvatar;
  }
  return DEFAULT_AVATAR_URL;
}

export function getAccountProfile(): AccountProfile {
  if (typeof window === "undefined") return DEFAULT_ACCOUNT_PROFILE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ACCOUNT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<AccountProfile>;
    return {
      ...DEFAULT_ACCOUNT_PROFILE,
      ...parsed,
      avatarUrl: resolveAvatarUrl(parsed.avatarUrl),
    };
  } catch {
    return DEFAULT_ACCOUNT_PROFILE;
  }
}

export function saveAccountProfile(
  patch: Partial<AccountProfile>
): AccountProfile {
  const current = getAccountProfile();
  const nextAvatar =
    "avatarUrl" in patch
      ? resolveAvatarUrl(patch.avatarUrl)
      : current.avatarUrl;

  const next: AccountProfile = {
    ...current,
    ...patch,
    avatarUrl: nextAvatar,
  };

  if (typeof window !== "undefined") {
    try {
      const toStore: Partial<AccountProfile> = {
        ...next,
        avatarUrl:
          next.avatarUrl === null ? REMOVED_AVATAR_VALUE : next.avatarUrl,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      // Abaikan jika localStorage penuh akibat ukuran gambar besar; tetap kirim event
    }
    window.dispatchEvent(
      new CustomEvent<AccountProfile>(PROFILE_UPDATED_EVENT, { detail: next })
    );
  }
  return next;
}

export function useAccountProfile(): AccountProfile {
  const [profile, setProfile] = useState<AccountProfile>(() =>
    getAccountProfile()
  );

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<AccountProfile>;
      if (customEvent.detail) {
        setProfile(customEvent.detail);
      } else {
        setProfile(getAccountProfile());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setProfile(getAccountProfile());
      }
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return profile;
}

export function isUsernameTaken(
  candidate: string,
  currentUsername: string
): boolean {
  const normalized = candidate.trim().toLowerCase();
  const current = currentUsername.trim().toLowerCase();
  if (!normalized || normalized === current) return false;
  return TAKEN_USERNAMES.has(normalized);
}

/**
 * Validasi bahwa username mengacu pada nama lengkap atau bagian lokal alamat email.
 */
export function isUsernameAlignedWithIdentity(
  username: string,
  fullName: string,
  email: string
): boolean {
  const normalizedUser = username.trim().toLowerCase().replace(/[._]/g, "");
  if (!normalizedUser) return false;

  const emailLocal = (email.split("@")[0] || "").trim().toLowerCase();
  const emailTokens = emailLocal
    .split(/[._-]+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter((t) => t.length >= 3);

  const nameTokens = fullName
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter((t) => t.length >= 3);

  const referenceTokens = Array.from(new Set([...emailTokens, ...nameTokens]));
  if (referenceTokens.length === 0) return true;

  return referenceTokens.some((token) => normalizedUser.includes(token));
}
