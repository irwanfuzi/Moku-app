import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export function useBackGesture(active: boolean, onBack: () => void) {
  const { pathname } = useLocation();
  const initialPathRef = useRef(pathname);
  const onBackRef = useRef(onBack);
  const armedRef = useRef(false);

  const isCurrentRoute = pathname === initialPathRef.current;
  const isEnabled = active && isCurrentRoute;

  useEffect(() => {
    onBackRef.current = onBack;
  }, [onBack]);

  const arm = useCallback(() => {
    if (typeof window === "undefined" || armedRef.current || !isEnabled) return;
    window.history.pushState({ mokuBackGuard: true }, "", window.location.href);
    armedRef.current = true;
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled || typeof window === "undefined") {
      armedRef.current = false;
      return;
    }

    arm();

    const handlePopState = () => {
      if (window.location.pathname !== initialPathRef.current) return;
      armedRef.current = false;
      onBackRef.current();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isEnabled, arm]);

  return { rearm: arm };
}
