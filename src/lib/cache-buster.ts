declare const __APP_BUILD_VERSION__: string;

const VERSION_STORAGE_KEY = "moku_app_build_version";
const RELOAD_GUARD_KEY = "moku_cache_reloaded_for";

async function clearBrowserCachesAndWorkers(): Promise<void> {
  if (typeof window === "undefined") return;

  if ("caches" in window) {
    const cacheKeys = await window.caches.keys();
    await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
  }

  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map((registration) => registration.unregister())
    );
  }
}

async function registerVersionedServiceWorker(version: string): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const swUrl = `/sw.js?v=${encodeURIComponent(version || "v2")}`;
  const reg = await navigator.serviceWorker.register(swUrl);
  await reg.update().catch(() => {});
}

export async function enforceLatestBuildCache(): Promise<void> {
  if (typeof window === "undefined") return;

  const currentVersion =
    typeof __APP_BUILD_VERSION__ !== "undefined"
      ? String(__APP_BUILD_VERSION__)
      : "";

  if (!currentVersion) {
    await registerVersionedServiceWorker("v2");
    return;
  }

  try {
    const previousVersion = window.localStorage.getItem(VERSION_STORAGE_KEY);
    const alreadyReloadedForVersion =
      window.sessionStorage.getItem(RELOAD_GUARD_KEY) === currentVersion;

    if (previousVersion && previousVersion !== currentVersion) {
      window.localStorage.setItem(VERSION_STORAGE_KEY, currentVersion);

      if (!alreadyReloadedForVersion) {
        window.sessionStorage.setItem(RELOAD_GUARD_KEY, currentVersion);
        await clearBrowserCachesAndWorkers();
        await registerVersionedServiceWorker(currentVersion);
        window.location.reload();
        return;
      }
    } else {
      window.localStorage.setItem(VERSION_STORAGE_KEY, currentVersion);
    }

    await registerVersionedServiceWorker(currentVersion);
  } catch {
    // Abaikan jika storage diblokir browser
  }
}

export function bindAutoUpdateOnResume(): () => void {
  if (typeof window === "undefined") return () => {};

  const handleVisibilityOrFocus = () => {
    if (document.visibilityState === "visible") {
      enforceLatestBuildCache().catch(() => {});
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityOrFocus);
  window.addEventListener("focus", handleVisibilityOrFocus);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    window.removeEventListener("focus", handleVisibilityOrFocus);
  };
}
