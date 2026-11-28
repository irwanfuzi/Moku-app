type Listener = (hasOpenSheet: boolean) => void;

interface SheetEntry {
  id: number;
  dismiss: () => void;
}

const openSheets: SheetEntry[] = [];
const listeners = new Set<Listener>();
let nextSheetId = 1;
let hasHistoryGuard = false;
let ignoreInternalBackPop = false;

function notify() {
  const locked = openSheets.length > 0;
  listeners.forEach((fn) => fn(locked));
}

export function registerOpenBottomSheet(dismiss: () => void): () => void {
  const id = nextSheetId++;
  openSheets.push({ id, dismiss });

  // Pastikan hanya ada 1 history guard aktif untuk lapisan sheet
  if (typeof window !== "undefined" && !hasHistoryGuard) {
    window.history.pushState(
      { ...(window.history.state || {}), __mokuSheetGuard: true },
      "",
      window.location.href
    );
    hasHistoryGuard = true;
  }

  notify();

  let released = false;
  return () => {
    if (released) return;
    released = true;

    const idx = openSheets.findIndex((item) => item.id === id);
    if (idx !== -1) {
      openSheets.splice(idx, 1);
    }

    // Jika semua sheet sudah tertutup dan history guard masih ada (ditutup via tap/drag/tombol),
    // bersihkan 1 history guard dengan aman agar stack history tetap utuh.
    if (
      openSheets.length === 0 &&
      hasHistoryGuard &&
      typeof window !== "undefined"
    ) {
      hasHistoryGuard = false;
      ignoreInternalBackPop = true;
      window.history.back();
    }

    notify();
  };
}

export function isAnyBottomSheetOpen(): boolean {
  return openSheets.length > 0;
}

/**
 * Dipanggil oleh handler popstate di App.tsx.
 * Mengembalikan `true` jika popstate tersebut adalah konsumsi internal atau penutupan sheet.
 */
export function handleSheetPopState(): boolean {
  if (ignoreInternalBackPop) {
    ignoreInternalBackPop = false;
    return true;
  }

  if (openSheets.length > 0) {
    // OS/Chrome baru saja memakan history guard -> tandai sudah dikonsumsi
    hasHistoryGuard = false;
    const top = openSheets[openSheets.length - 1];
    top?.dismiss();
    return true;
  }

  return false;
}

export function subscribeBottomSheetLock(listener: Listener): () => void {
  listeners.add(listener);
  listener(openSheets.length > 0);
  return () => {
    listeners.delete(listener);
  };
}
