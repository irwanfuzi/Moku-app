
"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      console.info("Service Worker is not supported.");
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;
    let refreshing = false;

    const hadController = Boolean(
      navigator.serviceWorker.controller
    );

    // Reload satu kali ketika Service Worker baru mengambil alih
    const handleControllerChange = () => {
      if (!hadController || refreshing) {
        return;
      }

      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange
    );

    // Periksa pembaruan Service Worker
    const updateServiceWorker = async () => {
      if (!registration) {
        return;
      }

      if (document.visibilityState !== "visible") {
        return;
      }

      try {
        await registration.update();

        console.info(
          "MOKU: Service Worker update checked."
        );
      } catch (error) {
        console.error(
          "MOKU: Service Worker update check failed.",
          error
        );
      }
    };

    // Registrasi Service Worker
    const registerServiceWorker = async () => {
      try {
        registration = await navigator.serviceWorker.register(
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

        await updateServiceWorker();
      } catch (error) {
        console.error(
          "MOKU Service Worker registration failed:",
          error
        );
      }
    };

    if (document.readyState === "complete") {
      void registerServiceWorker();
    } else {
      window.addEventListener(
        "load",
        registerServiceWorker,
        { once: true }
      );
    }

    // Periksa update saat aplikasi kembali aktif
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void updateServiceWorker();
      }
    };

    // Periksa update saat koneksi internet kembali
    const handleOnline = () => {
      void updateServiceWorker();
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener("online", handleOnline);

    // Pemeriksaan berkala setiap 60 detik
    const updateInterval = window.setInterval(() => {
      void updateServiceWorker();
    }, 60 * 1000);

    return () => {
      window.removeEventListener(
        "load",
        registerServiceWorker
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "online",
        handleOnline
      );

      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange
      );

      window.clearInterval(updateInterval);
    };
  }, []);

  return null;
}
