// Otomatis mendeteksi semua file gambar di folder public/images/moku/
const MOKU_ASSET_MODULES = import.meta.glob(
  "/public/images/moku/**/*.{png,webp,jpg,jpeg,svg}",
  { eager: false }
);

const MOKU_ASSET_URLS = Object.keys(MOKU_ASSET_MODULES).map((path) =>
  path.replace(/^\/public/, "")
);

const preloadedImages: HTMLImageElement[] = [];
let hasPreloaded = false;

export function preloadAllMokuIllustrations(): void {
  if (hasPreloaded || typeof window === "undefined") return;
  hasPreloaded = true;

  MOKU_ASSET_URLS.forEach((url) => {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    // Simpan referensi di memori agar tidak langsung di-garbage-collect oleh browser
    preloadedImages.push(img);

    if (typeof img.decode === "function") {
      img.decode().catch(() => {
        // Abaikan jika browser menunda decode
      });
    }
  });
}
