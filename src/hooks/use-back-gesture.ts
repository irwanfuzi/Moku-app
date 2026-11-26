import { useCallback, useEffect, useRef } from "react";

export function useBackGesture(active: boolean, onBack: () => void) {
  const onBackRef = useRef(onBack);
  const armedRef = useRef(false);

  useEffect(() => {
    onBackRef.current = onBack;
  }, [onBack]);

  const arm = useCallback(() => {
    if (typeof window === "undefined" || armedRef.current) return;
    window.history.pushState({ mokuBackGuard: true }, "", window.location.href);
    armedRef.current = true;
  }, []);

  useEffect(() => {
    if (!active || typeof window === "undefined") {
      armedRef.current = false;
      return;
    }

    arm();

    const handlePopState = () => {
      armedRef.current = false;
      onBackRef.current();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [active, arm]);

  return { rearm: arm };
}
