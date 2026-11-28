type Listener = (hasOpenSheet: boolean) => void;

interface SheetEntry {
  id: number;
  dismiss: () => void;
}

const openSheets: SheetEntry[] = [];
const listeners = new Set<Listener>();
let nextSheetId = 1;

function notify() {
  const locked = openSheets.length > 0;
  listeners.forEach((fn) => fn(locked));
}

export function registerOpenBottomSheet(dismiss: () => void): () => void {
  const id = nextSheetId++;
  openSheets.push({ id, dismiss });

  // Sisipkan 1 state history agar system back / swipe-back browser memakan state ini dulu,
  // bukan memundurkan rute halaman utama.
  if (typeof window !== "undefined") {
    const currentState = window.history.state || {};
    if (currentState.__mokuSheetGuard !== openSheets.length) {
      window.history.pushState(
        { ...currentState, __mokuSheetGuard: openSheets.length },
        ""
      );
    }
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
    notify();
  };
}

export function isAnyBottomSheetOpen(): boolean {
  return openSheets.length > 0;
}

export function dismissTopBottomSheet(): boolean {
  const top = openSheets[openSheets.length - 1];
  if (!top) return false;
  top.dismiss();
  return true;
}

export function subscribeBottomSheetLock(listener: Listener): () => void {
  listeners.add(listener);
  listener(openSheets.length > 0);
  return () => {
    listeners.delete(listener);
  };
}
