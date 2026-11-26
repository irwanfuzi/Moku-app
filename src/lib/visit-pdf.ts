import { jsPDF } from "jspdf";
import { VISIT_TYPE_LABELS, type VisitRecord } from "@/lib/visit-store";

const PDF_HEADER_URL = "/images/moku/pdf/pdf-header.png";
const PDF_FOOTER_URL = "/images/moku/pdf/pdf-footer.png";

const FONT_FILES = {
  jakartaBold: "/fonts/PlusJakartaSans-Bold.ttf",
  interRegular: "/fonts/Inter_18pt-Regular.ttf",
  interBold: "/fonts/Inter_18pt-Bold.ttf",
  interItalic: "/fonts/Inter_18pt-Italic.ttf",
} as const;

interface CachedFonts {
  jakartaBold: string | null;
  interRegular: string | null;
  interBold: string | null;
  interItalic: string | null;
}

let cachedFontsPromise: Promise<CachedFonts> | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

async function fetchFontBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("text/html")) return null;
    const buffer = await res.arrayBuffer();
    return arrayBufferToBase64(buffer);
  } catch {
    return null;
  }
}

function loadCustomFonts(): Promise<CachedFonts> {
  if (!cachedFontsPromise) {
    cachedFontsPromise = Promise.all([
      fetchFontBase64(FONT_FILES.jakartaBold),
      fetchFontBase64(FONT_FILES.interRegular),
      fetchFontBase64(FONT_FILES.interBold),
      fetchFontBase64(FONT_FILES.interItalic),
    ]).then(([jakartaBold, interRegular, interBold, interItalic]) => ({
      jakartaBold,
      interRegular,
      interBold,
      interItalic,
    }));
  }
  return cachedFontsPromise;
}

async function registerPdfFonts(doc: jsPDF) {
  const fonts = await loadCustomFonts();

  let displayFont = "helvetica";
  let bodyFont = "helvetica";

  if (fonts.jakartaBold) {
    doc.addFileToVFS("PlusJakartaSans-Bold.ttf", fonts.jakartaBold);
    doc.addFont("PlusJakartaSans-Bold.ttf", "PlusJakartaSans", "bold");
    displayFont = "PlusJakartaSans";
  }

  if (fonts.interRegular) {
    doc.addFileToVFS("Inter_18pt-Regular.ttf", fonts.interRegular);
    doc.addFont("Inter_18pt-Regular.ttf", "Inter", "normal");
    bodyFont = "Inter";
  }

  if (fonts.interBold) {
    doc.addFileToVFS("Inter_18pt-Bold.ttf", fonts.interBold);
    doc.addFont("Inter_18pt-Bold.ttf", "Inter", "bold");
  } else if (fonts.interRegular) {
    doc.addFont("Inter_18pt-Regular.ttf", "Inter", "bold");
  }

  if (fonts.interItalic) {
    doc.addFileToVFS("Inter_18pt-Italic.ttf", fonts.interItalic);
    doc.addFont("Inter_18pt-Italic.ttf", "Inter", "italic");
  } else if (fonts.interRegular) {
    doc.addFont("Inter_18pt-Regular.ttf", "Inter", "italic");
  }

  return { displayFont, bodyFont };
}

function formatIndonesianDate(isoDate: string): string {
  if (!isoDate) return "-";
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Resize gambar banner header/footer + auto-trim ruang putih/transparan atas-bawah
 * agar tajam di A4, proporsional, dan ukuran PDF tetap ringan
 */
function resizeBannerClean(
  img: HTMLImageElement,
  maxW = 1600
): { dataUrl: string; aspect: number } | null {
  try {
    const natW = img.naturalWidth || img.width;
    const natH = img.naturalHeight || img.height;
    if (!natW || !natH) return null;

    const scale = Math.min(1, maxW / natW);
    const drawW = Math.round(natW * scale);
    const drawH = Math.round(natH * scale);

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = drawW;
    tempCanvas.height = drawH;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return null;

    tempCtx.drawImage(img, 0, 0, drawW, drawH);

    // Cari batas atas & bawah konten (abaikan piksel transparan atau putih polos)
    const { data } = tempCtx.getImageData(0, 0, drawW, drawH);
    let top = 0;
    let bottom = drawH - 1;

    const isRowEmpty = (row: number) => {
      const rowOffset = row * drawW * 4;
      for (let x = 0; x < drawW; x += 4) {
        const idx = rowOffset + x * 4;
        const a = data[idx + 3];
        if (a > 12) {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          if (r < 246 || g < 246 || b < 246) {
            return false;
          }
        }
      }
      return true;
    };

    while (top < drawH && isRowEmpty(top)) top++;
    while (bottom > top && isRowEmpty(bottom)) bottom--;

    const padY = 4;
    const cropTop = Math.max(0, top - padY);
    const cropBottom = Math.min(drawH - 1, bottom + padY);
    const cropH = cropBottom - cropTop + 1;

    if (cropH <= 10 || cropH >= drawH - 4) {
      return {
        dataUrl: tempCanvas.toDataURL("image/png"),
        aspect: drawW / drawH,
      };
    }

    const outCanvas = document.createElement("canvas");
    outCanvas.width = drawW;
    outCanvas.height = cropH;
    const outCtx = outCanvas.getContext("2d");
    if (!outCtx) return null;

    outCtx.drawImage(tempCanvas, 0, cropTop, drawW, cropH, 0, 0, drawW, cropH);

    return {
      dataUrl: outCanvas.toDataURL("image/png"),
      aspect: drawW / cropH,
    };
  } catch {
    return null;
  }
}

export interface GeneratedVisitPdf {
  blob: Blob;
  url: string;
  filename: string;
  sizeMb: number;
}

function drawFolderCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  bodyH: number,
  tabTitle: string,
  tabW: number,
  displayFont: string
) {
  const tabH = 8.8;
  const r = 3.2;
  const cardY = y + tabH;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(192, 18, 44);
  doc.setLineWidth(0.48);

  doc.moveTo(x, cardY);
  doc.lineTo(x + w - r, cardY);
  doc.curveTo(x + w, cardY, x + w, cardY, x + w, cardY + r);
  doc.lineTo(x + w, cardY + bodyH - r);
  doc.curveTo(
    x + w,
    cardY + bodyH,
    x + w,
    cardY + bodyH,
    x + w - r,
    cardY + bodyH
  );
  doc.lineTo(x + r, cardY + bodyH);
  doc.curveTo(x, cardY + bodyH, x, cardY + bodyH, x, cardY + bodyH - r);
  doc.lineTo(x, cardY);
  doc.close();
  doc.fillStroke();

  doc.setFillColor(142, 0, 28);
  doc.moveTo(x - 0.2, cardY + 0.25);
  doc.lineTo(x - 0.2, y + r);
  doc.curveTo(x - 0.2, y, x - 0.2, y, x + r, y);
  doc.lineTo(x + tabW - 5, y);
  doc.curveTo(x + tabW, y, x + tabW + 3, y + 3, x + tabW + 8, cardY + 0.25);
  doc.close();
  doc.fill();

  doc.setTextColor(255, 255, 255);
  doc.setFont(displayFont, "bold");
  doc.setFontSize(11.5);
  doc.text(tabTitle, x + 5.5, y + 6.1);

  return cardY;
}

function drawSmallRowIcon(
  doc: jsPDF,
  kind: "calendar" | "building" | "pin" | "user" | "gear",
  cx: number,
  cy: number
) {
  doc.setDrawColor(192, 18, 44);
  doc.setFillColor(192, 18, 44);
  doc.setLineWidth(0.45);

  switch (kind) {
    case "calendar":
      doc.roundedRect(cx - 2.3, cy - 2, 4.6, 4.1, 0.7, 0.7, "S");
      doc.line(cx - 2.3, cy - 0.7, cx + 2.3, cy - 0.7);
      doc.line(cx - 1.05, cy - 2.6, cx - 1.05, cy - 1.5);
      doc.line(cx + 1.05, cy - 2.6, cx + 1.05, cy - 1.5);
      break;
    case "building":
      doc.rect(cx - 2, cy - 2.3, 4, 4.6, "S");
      doc.rect(cx - 0.55, cy + 0.7, 1.1, 1.6, "S");
      doc.circle(cx - 0.9, cy - 1.1, 0.28, "F");
      doc.circle(cx + 0.9, cy - 1.1, 0.28, "F");
      doc.circle(cx - 0.9, cy - 0.1, 0.28, "F");
      doc.circle(cx + 0.9, cy - 0.1, 0.28, "F");
      break;
    case "pin":
      doc.circle(cx, cy - 0.6, 1.9, "S");
      doc.circle(cx, cy - 0.6, 0.55, "F");
      doc.line(cx - 1.35, cy + 0.7, cx, cy + 2.4);
      doc.line(cx + 1.35, cy + 0.7, cx, cy + 2.4);
      break;
    case "user":
      doc.circle(cx, cy - 1.15, 1.2, "S");
      doc.roundedRect(cx - 2.1, cy + 0.5, 4.2, 2, 1, 1, "S");
      break;
    case "gear":
    default:
      doc.circle(cx, cy, 2.1, "S");
      doc.circle(cx, cy, 0.8, "S");
      break;
  }
}

function drawPrinterVector(doc: jsPDF, x: number, y: number) {
  doc.setFillColor(240, 242, 247);
  doc.setDrawColor(190, 194, 204);
  doc.setLineWidth(0.35);

  doc.roundedRect(x + 4, y + 15.5, 21, 10.5, 1.1, 1.1, "FD");
  doc.line(x + 5, y + 20.8, x + 24, y + 20.8);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x + 2, y + 4.8, 25, 11.5, 1.5, 1.5, "FD");

  doc.setFillColor(228, 231, 238);
  doc.roundedRect(x + 3.5, y + 1.6, 22, 3.6, 0.8, 0.8, "FD");

  doc.setFillColor(142, 0, 28);
  doc.roundedRect(x + 20, y + 6.8, 5, 2.6, 0.5, 0.5, "F");

  doc.setFillColor(212, 216, 224);
  doc.rect(x + 6.5, y + 10.8, 11.5, 2.5, "F");
}

export async function generateVisitReportPdf(
  visit: VisitRecord
): Promise<GeneratedVisitPdf> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageW = doc.internal.pageSize.getWidth(); // 210mm
  const pageH = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 11;
  const contentW = pageW - margin * 2; // 188mm

  const [{ displayFont, bodyFont }, rawHeader, rawFooter] = await Promise.all([
    registerPdfFonts(doc),
    loadImage(PDF_HEADER_URL),
    loadImage(PDF_FOOTER_URL),
  ]);

  const headerBanner = rawHeader ? resizeBannerClean(rawHeader) : null;
  const footerBanner = rawFooter ? resizeBannerClean(rawFooter) : null;

  /* =========================================================
     1. TOP HEADER (GAMBAR MASTER FULL WIDTH)
  ========================================================= */
  let headerH = 26;
  if (headerBanner) {
    headerH = pageW / headerBanner.aspect;
    doc.addImage(headerBanner.dataUrl, "PNG", 0, 0, pageW, headerH);
  } else {
    doc.setFillColor(142, 0, 28);
    doc.rect(0, 0, pageW, headerH, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont(displayFont, "bold");
    doc.setFontSize(18);
    doc.text("Laporan Kunjungan", pageW - margin, 15, { align: "right" });
  }

  /* =========================================================
     2. SUB-HEADER (JUDUL DETAIL + BADGE NO. KUNJUNGAN)
  ========================================================= */
  let y = Math.max(32, headerH + 7);

  doc.setFillColor(252, 236, 239);
  doc.roundedRect(margin, y, 16.5, 16.5, 3.4, 3.4, "F");
  doc.setDrawColor(192, 18, 44);
  doc.setLineWidth(0.62);
  doc.roundedRect(margin + 4, y + 4.5, 8.5, 7.6, 1.2, 1.2, "S");
  doc.line(margin + 4, y + 7.1, margin + 12.5, y + 7.1);
  doc.line(margin + 6.1, y + 3.3, margin + 6.1, y + 5.2);
  doc.line(margin + 10.4, y + 3.3, margin + 10.4, y + 5.2);

  doc.setTextColor(20, 20, 24);
  doc.setFont(displayFont, "bold");
  doc.setFontSize(15);
  doc.text("Laporan Detail Kunjungan", margin + 21, y + 6.8);

  doc.setTextColor(80, 78, 88);
  doc.setFont(bodyFont, "normal");
  doc.setFontSize(9.8);
  doc.text(
    "Laporan hasil kunjungan teknisi ke lokasi pelanggan.",
    margin + 21,
    y + 13
  );

  const badgeW = 58;
  const badgeX = pageW - margin - badgeW;
  doc.setFillColor(252, 236, 239);
  doc.roundedRect(badgeX, y, badgeW, 16.5, 3.4, 3.4, "F");

  doc.setTextColor(65, 62, 72);
  doc.setFont(bodyFont, "normal");
  doc.setFontSize(8.8);
  doc.text("No. Kunjungan", badgeX + badgeW / 2, y + 5.8, { align: "center" });

  doc.setTextColor(176, 16, 40);
  doc.setFont(displayFont, "bold");
  doc.setFontSize(12);
  doc.text(visit.visitNumber, badgeX + badgeW / 2, y + 12.6, {
    align: "center",
  });

  /* =========================================================
     3. KARTU 1: INFORMASI KUNJUNGAN
  ========================================================= */
  y += 23.5;
  const visitTypeDisplay = `${VISIT_TYPE_LABELS[visit.visitTypeCode]} (${visit.visitTypeCode})`;
  const infoRows: Array<{
    icon: "calendar" | "building" | "pin" | "user" | "gear";
    label: string;
    value: string;
    boldValue?: boolean;
  }> = [
    {
      icon: "calendar",
      label: "Tanggal Kunjungan",
      value: formatIndonesianDate(visit.visitDate),
    },
    {
      icon: "building",
      label: "Pelanggan",
      value: visit.customerName || "-",
      boldValue: true,
    },
    {
      icon: "pin",
      label: "Lokasi",
      value: visit.location || "-",
    },
    {
      icon: "user",
      label: "Teknisi",
      value: visit.technicianName || "-",
      boldValue: true,
    },
    {
      icon: "gear",
      label: "Jenis Kunjungan",
      value: visitTypeDisplay,
      boldValue: true,
    },
  ];

  doc.setFont(bodyFont, "normal");
  doc.setFontSize(10.5);
  const preparedRows = infoRows.map((row) => {
    const lines = doc.splitTextToSize(row.value, contentW - 70);
    const rowH = Math.max(10.8, lines.length * 5.4 + 4.8);
    return { ...row, lines, rowH };
  });

  const infoBodyH = preparedRows.reduce((sum, r) => sum + r.rowH, 0) + 4;
  const infoCardY = drawFolderCard(
    doc,
    margin,
    y,
    contentW,
    infoBodyH,
    "Informasi Kunjungan",
    60,
    displayFont
  );

  let rowY = infoCardY + 2;
  preparedRows.forEach((row, index) => {
    const textBaseline = rowY + 6.9;
    drawSmallRowIcon(doc, row.icon, margin + 10.5, rowY + 5.6);

    doc.setFont(bodyFont, "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(40, 38, 46);
    doc.text(row.label, margin + 19, textBaseline);
    doc.text(":", margin + 62, textBaseline);

    doc.setFont(bodyFont, row.boldValue ? "bold" : "normal");
    doc.setTextColor(20, 20, 24);
    doc.text(row.lines, margin + 67, textBaseline);

    if (index < preparedRows.length - 1) {
      doc.setDrawColor(236, 236, 242);
      doc.setLineWidth(0.28);
      doc.line(
        margin + 19,
        rowY + row.rowH,
        pageW - margin - 6,
        rowY + row.rowH
      );
    }
    rowY += row.rowH;
  });

  /* =========================================================
     4. KARTU 2: INFORMASI MESIN
  ========================================================= */
  y = infoCardY + infoBodyH + 7.5;
  const machineBodyH = 34;
  const machineCardY = drawFolderCard(
    doc,
    margin,
    y,
    contentW,
    machineBodyH,
    "Informasi Mesin",
    50,
    displayFont
  );

  drawPrinterVector(doc, margin + 9, machineCardY + 3.8);

  doc.setDrawColor(190, 196, 210);
  doc.setLineWidth(0.38);
  doc.line(margin + 46, machineCardY + 6, margin + 46, machineCardY + 28);

  const mBoxX = margin + 52;
  const mBoxW = contentW - 58;
  doc.setFillColor(244, 245, 249);
  doc.roundedRect(mBoxX, machineCardY + 5, mBoxW, 24, 3, 3, "F");

  doc.setFontSize(10.5);
  doc.setFont(bodyFont, "normal");
  doc.setTextColor(50, 48, 58);
  doc.text("Nomor Mesin", mBoxX + 6, machineCardY + 13.8);
  doc.text(":", mBoxX + 40, machineCardY + 13.8);
  doc.setFont(bodyFont, "bold");
  doc.setTextColor(20, 20, 24);
  doc.text(visit.machineCode || "-", mBoxX + 45, machineCardY + 13.8);

  doc.setFont(bodyFont, "normal");
  doc.setTextColor(50, 48, 58);
  doc.text("Model Mesin", mBoxX + 6, machineCardY + 22.8);
  doc.text(":", mBoxX + 40, machineCardY + 22.8);
  doc.setTextColor(20, 20, 24);
  doc.text(visit.machineModel || "-", mBoxX + 45, machineCardY + 22.8);

  /* =========================================================
     5. KARTU 3: DESKRIPSI AKTIVITAS
  ========================================================= */
  y = machineCardY + machineBodyH + 7.5;
  doc.setFont(bodyFont, "normal");
  doc.setFontSize(10.5);
  const activityText = visit.activityDescription?.trim() || "-";
  const activityLines = doc.splitTextToSize(activityText, contentW - 14);
  const activityBodyH = Math.max(36, activityLines.length * 5.8 + 14);

  const activityCardY = drawFolderCard(
    doc,
    margin,
    y,
    contentW,
    activityBodyH,
    "Deskripsi Aktivitas",
    55,
    displayFont
  );

  doc.setTextColor(30, 28, 35);
  doc.setFont(bodyFont, "normal");
  doc.setFontSize(10.5);
  doc.text(activityLines, margin + 7, activityCardY + 9.5);

  /* =========================================================
     6. KARTU 4: TINDAKAN / CATATAN TEKNISI
  ========================================================= */
  y = activityCardY + activityBodyH + 7.5;
  const notesText =
    visit.technicianNotes?.trim() || "Tidak ada catatan teknisi tambahan.";
  const notesLines = doc.splitTextToSize(notesText, contentW - 14);
  const notesBodyH = Math.max(24, notesLines.length * 5.8 + 14);

  const notesCardY = drawFolderCard(
    doc,
    margin,
    y,
    contentW,
    notesBodyH,
    "Tindakan / Catatan Teknisi",
    68,
    displayFont
  );

  doc.setTextColor(30, 28, 35);
  doc.setFont(bodyFont, "normal");
  doc.setFontSize(10.5);
  doc.text(notesLines, margin + 7, notesCardY + 9.5);

  /* =========================================================
     7. FOOTER A4 (GAMBAR MASTER FULL WIDTH)
  ========================================================= */
  if (footerBanner) {
    const footerH = pageW / footerBanner.aspect;
    doc.addImage(
      footerBanner.dataUrl,
      "PNG",
      0,
      pageH - footerH,
      pageW,
      footerH
    );
  } else {
    const footerLineY = pageH - 22;
    doc.setDrawColor(200, 206, 220);
    doc.setLineWidth(0.35);
    doc.line(margin, footerLineY, pageW - margin, footerLineY);

    doc.setTextColor(32, 32, 38);
    doc.setFont(bodyFont, "italic");
    doc.setFontSize(11);
    doc.text("Track Precisely, Deliver Quality", margin, pageH - 10.5);
  }

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const filename = `${visit.visitNumber}.pdf`;
  const sizeMb = Math.max(0.1, blob.size / (1024 * 1024));

  return { blob, url, filename, sizeMb };
}

export function triggerBrowserPdfDownload(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
