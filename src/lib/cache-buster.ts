declare const __APP_BUILD_VERSION__: string;

const VERSION_STORAGE_KEY = "moku_app_build_version";

async function clearOldBrowserCaches(): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;

  const currentVersion =
    typeof __APP_BUILD_VERSION__ !== "undefined"
      ? String(__APP_BUILD_VERSION__)
      : "v2";
  const activeCacheName = `moku-static-${currentVersion}`;

  const cacheKeys = await window.caches.keys();
  await Promise.all(
    cacheKeys
      .filter((key) => key !== activeCacheName)
      .map((key) => window.caches.delete(key))
  );
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

    if (previousVersion !== currentVersion) {
      window.localStorage.setItem(VERSION_STORAGE_KEY, currentVersion);
      // Bersihkan cache lama di background tanpa window.location.reload()
      await clearOldBrowserCaches();
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
