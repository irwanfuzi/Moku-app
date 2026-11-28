type Listener = (hasOpenSheet: boolean) => void;

let openSheetCount = 0;
const listeners = new Set<Listener>();

function notify() {
  const locked = openSheetCount > 0;
  listeners.forEach((fn) => fn(locked));
}

export function registerOpenBottomSheet(): () => void {
  openSheetCount += 1;
  notify();

  let released = false;
  return () => {
    if (released) return;
    released = true;
    openSheetCount = Math.max(0, openSheetCount - 1);
    notify();
  };
}

export function isAnyBottomSheetOpen(): boolean {
  return openSheetCount > 0;
}

export function subscribeBottomSheetLock(listener: Listener): () => void {
  listeners.add(listener);
  listener(openSheetCount > 0);
  return () => {
    listeners.delete(listener);
  };
}
