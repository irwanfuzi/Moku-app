
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

    // Periksa apakah tab sudah dikontrol Service Worker sebelumnya
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

        console.info("MOKU: Service Worker update checked.");
      } catch (error) {
        console.error(
          "MOKU: Service Worker update check failed.",
          error
        );
      }
    };

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
          "MOKU Service Worker registration failed.",
          error
        );
      }
    };

    // Registrasi setelah halaman selesai dimuat
    if (document.readyState === "complete") {
      void registerServiceWorker();
    } else {
      window.addEventListener(
        "load",
        registerServiceWorker,
        { once: true }
      );
    }

    // Periksa update saat pengguna kembali membuka aplikasi
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void updateServiceWorker();
      }
    };

    const handleOnline = () => {
      void updateServiceWorker();
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener("online", handleOnline);

    // Periksa update secara berkala selama tab aktif
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

      window.removeEventListener("online", handleOnline);

      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange
      );

      window.clearInterval(updateInterval);
    };
  }, []);

  return null;
}
