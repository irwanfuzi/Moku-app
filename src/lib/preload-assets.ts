// Otomatis mendeteksi semua file gambar di folder public/images/moku/
const MOKU_ASSET_MODULES = import.meta.glob(
  "/public/images/moku/**/*.{png,webp,jpg,jpeg,svg}",
  { eager: false }
);

const MOKU_ASSET_URLS = Object.keys(MOKU_ASSET_MODULES).map((path) =>
  path.replace(/^\/public/, "")
);

let hasPreloaded = false;

export function preloadAllMokuIllustrations(): void {
  if (hasPreloaded || typeof window === "undefined") return;
  hasPreloaded = true;

  MOKU_ASSET_URLS.forEach((url) => {
    const img = new Image();
    img.decoding = "async";
    img.src = url;

    // Decode piksel di memory cache agar langsung tampil tanpa jeda render
    if (typeof img.decode === "function") {
      img.decode().catch(() => {
        // Abaikan jika browser menunda decode
      });
    }
  });
}
