"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      console.info("Service Worker is not supported.");
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          "/sw.js",
          {
            scope: "/",
            updateViaCache: "none",
          }
        );

        console.info(
          "MOKU Service Worker registered:",
          registration.scope
        );

        await registration.update();
      } catch (error) {
        console.error(
          "MOKU Service Worker registration failed:",
          error
        );
      }
    };

    if (document.readyState === "complete") {
      registerServiceWorker();
    } else {
      window.addEventListener(
        "load",
        registerServiceWorker,
        { once: true }
      );
    }

    return () => {
      window.removeEventListener(
        "load",
        registerServiceWorker
      );
    };
  }, []);

  return null;
}
