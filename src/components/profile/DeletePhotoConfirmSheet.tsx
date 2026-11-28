import { useRef } from "react";
import MokuBottomSheet, {
  type MokuBottomSheetRef,
} from "@/components/ui/MokuBottomSheet";

interface DeletePhotoConfirmSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  illustrationSrc?: string;
}

export default function DeletePhotoConfirmSheet({
  isOpen,
  onClose,
  onConfirmDelete,
  illustrationSrc = "/images/moku/illustrations/asset-delete-foto.png",
}: DeletePhotoConfirmSheetProps) {
  const sheetRef = useRef<MokuBottomSheetRef>(null);

  const handleConfirm = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([8, 22, 10]);
    }
    sheetRef.current?.closeSheet(() => {
      onConfirmDelete();
    });
  };

  return (
    <MokuBottomSheet
      ref={sheetRef}
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy="moku-delete-photo-title"
      backButtonPriority={9999}
      zIndexClassName="z-[9998]"
      bottomPaddingUnits={18}
      contentClassName="flex flex-col items-center text-center"
    >
      {/* Ilustrasi Hapus Foto */}
      <div
        style={{
          width: "calc(216 * var(--u))",
          height: "calc(196 * var(--u))",
          marginBottom: "calc(4 * var(--u))",
        }}
        className="mx-auto flex items-center justify-center"
      >
        <img
          src={illustrationSrc}
          alt="Ilustrasi Hapus Foto Profil"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          style={{ WebkitTouchCallout: "none" }}
          className="h-full w-full object-contain select-none"
        />
      </div>

      {/* Judul */}
      <h3
        id="moku-delete-photo-title"
        style={{
          marginTop: 0,
          marginBottom: "calc(6 * var(--u))",
        }}
        className="w-full text-center font-display text-[calc(18.5*var(--u))] font-bold tracking-[-0.015em] text-[#171717]"
      >
        Hapus Foto Profil?
      </h3>

      {/* Deskripsi */}
      <p
        style={{
          marginTop: 0,
          marginBottom: "calc(20 * var(--u))",
        }}
        className="w-full text-center text-[calc(13.5*var(--u))] font-normal leading-[1.45] text-[#52525B]"
      >
        Foto profil kamu akan dihapus dan
        <br />
        diganti dengan avatar default.
      </p>

      {/* Tombol Aksi */}
      <div className="w-full space-y-[calc(10*var(--u))]">
        <button
          type="button"
          onClick={handleConfirm}
          className="flex min-h-[calc(48*var(--u))] w-full cursor-pointer items-center justify-center rounded-full bg-[#740319] px-[calc(18*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(14.5*var(--u))] font-semibold text-white transition-[transform,background-color] duration-200 active:scale-[0.985] active:bg-[#5B0213]"
        >
          Hapus Foto
        </button>

        <button
          type="button"
          onClick={() => sheetRef.current?.closeSheet()}
          className="flex min-h-[calc(48*var(--u))] w-full cursor-pointer items-center justify-center rounded-full border-[1.5px] border-[#740319] bg-white px-[calc(18*var(--u))] py-[calc(12*var(--u))] font-display text-[calc(14.5*var(--u))] font-semibold text-[#740319] transition-[transform,background-color] duration-200 active:scale-[0.985] active:bg-[#FDF2F4]"
        >
          Batal
        </button>
      </div>
    </MokuBottomSheet>
  );
}
