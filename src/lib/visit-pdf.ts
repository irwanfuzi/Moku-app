import { jsPDF } from "jspdf";
import { VISIT_TYPE_LABELS, type VisitRecord } from "@/lib/visit-store";

const MOKU_LOGO_URL = "/images/moku/brand/moku-logo-marun.png";

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

function resizeLogoClean(
  img: HTMLImageElement
): { dataUrl: string; aspect: number } | null {
  try {
    const maxW = 520;
    const natW = img.naturalWidth || img.width;
    const natH = img.naturalHeight || img.height;
    const scale = Math.min(1, maxW / natW);
    const drawW = Math.round(natW * scale);
    const drawH = Math.round(natH * scale);

    const canvas = document.createElement("canvas");
    canvas.width = drawW;
    canvas.height = drawH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, drawW, drawH);

    return {
      dataUrl: canvas.toDataURL("image/png"),
      aspect: drawW / drawH,
    };
  } catch {
    return null;
  }
}

function renderHeaderRibbon(): string | null {
  try {
    const w = 900;
    const h = 216;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const goldGrad = ctx.createLinearGradient(30, h, 230, 0);
    goldGrad.addColorStop(0, "#EA8C00");
    goldGrad.addColorStop(0.45, "#F5B400");
    goldGrad.addColorStop(0.8, "#FDE047");
    goldGrad.addColorStop(1, "#F59E0B");

    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.bezierCurveTo(90, h, 108, 8, 224, 0);
    ctx.lineTo(300, 0);
    ctx.bezierCurveTo(185, 8, 166, h, 78, h);
    ctx.closePath();
    ctx.fill();

    const maroonGrad = ctx.createLinearGradient(110, 0, w, h);
    maroonGrad.addColorStop(0, "#A30021");
    maroonGrad.addColorStop(0.55, "#83051C");
    maroonGrad.addColorStop(1, "#620213");

    ctx.fillStyle = maroonGrad;
    ctx.beginPath();
    ctx.moveTo(60, h);
    ctx.bezierCurveTo(150, h, 168, 8, 282, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    const lineGrad = ctx.createLinearGradient(w - 205, 0, w - 80, 0);
    lineGrad.addColorStop(0, "#F59E0B");
    lineGrad.addColorStop(0.5, "#FDE047");
    lineGrad.addColorStop(1, "#D97706");

    ctx.fillStyle = lineGrad;
    ctx.beginPath();
    ctx.roundRect(w - 206, 154, 120, 10, 5);
    ctx.fill();

    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

function renderFooterRibbon(): string | null {
  try {
    const w = 720;
    const h = 160;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const leftMaroon = ctx.createLinearGradient(0, h, 340, 0);
    leftMaroon.addColorStop(0, "#A30021");
    leftMaroon.addColorStop(1, "#7B0419");

    ctx.fillStyle = leftMaroon;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.bezierCurveTo(66, 26, 156, 6, 336, 6);
    ctx.lineTo(w, 6);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    const goldGrad = ctx.createLinearGradient(185, h, 445, 0);
    goldGrad.addColorStop(0, "#EA8C00");
    goldGrad.addColorStop(0.42, "#F5B400");
    goldGrad.addColorStop(0.75, "#FDE047");
    goldGrad.addColorStop(1, "#F59E0B");

    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.moveTo(190, h);
    ctx.bezierCurveTo(266, 44, 336, 6, 468, 6);
    ctx.lineTo(545, 6);
    ctx.bezierCurveTo(412, 10, 355, 62, 282, h);
    ctx.closePath();
    ctx.fill();

    const rightMaroon = ctx.createLinearGradient(280, h, w, 0);
    rightMaroon.addColorStop(0, "#7A0318");
    rightMaroon.addColorStop(1, "#550110");

    ctx.fillStyle = rightMaroon;
    ctx.beginPath();
    ctx.moveTo(282, h);
    ctx.bezierCurveTo(355, 58, 422, 8, 540, 6);
    ctx.lineTo(w, 6);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    return canvas.toDataURL("image/png");
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
  const tabH = 9;
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
  doc.setFontSize(12);
  doc.text(tabTitle, x + 5.5, y + 6.3);

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

  const [{ displayFont, bodyFont }, rawLogo] = await Promise.all([
    registerPdfFonts(doc),
    loadImage(MOKU_LOGO_URL),
  ]);

  const cleanLogo = rawLogo ? resizeLogoClean(rawLogo) : null;
  const headerRibbon = renderHeaderRibbon();
  const footerRibbon = renderFooterRibbon();

  /* =========================================================
     1. TOP HEADER (LOGO BERSIH + PITA FULL-BLEED KANAN ATAS)
  ========================================================= */
  const headerH = 26;
  if (headerRibbon) {
    doc.addImage(headerRibbon, "PNG", pageW - 108, 0, 108, headerH);
  } else {
    doc.setFillColor(142, 0, 28);
    doc.rect(pageW - 96, 0, 96, headerH, "F");
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont(displayFont, "bold");
  doc.setFontSize(18.5);
  doc.text("Laporan Kunjungan", pageW - margin, 14.5, { align: "right" });

  let subtitleX = margin + 48;
  if (cleanLogo) {
    const targetH = 15.5;
    const targetW = Math.min(48, cleanLogo.aspect * targetH);
    doc.addImage(cleanLogo.dataUrl, "PNG", margin, 5.2, targetW, targetH);
    subtitleX = margin + targetW + 5;
  } else {
    doc.setTextColor(142, 0, 28);
    doc.setFont(displayFont, "bold");
    doc.setFontSize(22);
    doc.text("MOKU", margin, 17);
    subtitleX = margin + 34;
  }

  doc.setDrawColor(135, 135, 145);
  doc.setLineWidth(0.38);
  doc.line(subtitleX - 2.6, 8, subtitleX - 2.6, 18.2);

  doc.setTextColor(28, 28, 34);
  doc.setFont(displayFont, "bold");
  doc.setFontSize(9.5);
  doc.text("Monitoring Operasional", subtitleX, 12.2);
  doc.text("Kunjungan Unit", subtitleX, 16.8);

  doc.setDrawColor(218, 222, 232);
  doc.setLineWidth(0.35);
  doc.line(margin, headerH, pageW - margin, headerH);

  /* =========================================================
     2. SUB-HEADER (JUDUL DETAIL + BADGE NO. KUNJUNGAN)
  ========================================================= */
  let y = 34;

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
  doc.setFontSize(15.5);
  doc.text("Laporan Detail Kunjungan", margin + 21, y + 6.8);

  doc.setTextColor(80, 78, 88);
  doc.setFont(bodyFont, "normal");
  doc.setFontSize(10.5);
  doc.text(
    "Laporan hasil kunjungan teknisi ke lokasi pelanggan.",
    margin + 21,
    y + 13.2
  );

  const badgeW = 58;
  const badgeX = pageW - margin - badgeW;
  doc.setFillColor(252, 236, 239);
  doc.roundedRect(badgeX, y, badgeW, 16.5, 3.4, 3.4, "F");

  doc.setTextColor(65, 62, 72);
  doc.setFont(bodyFont, "normal");
  doc.setFontSize(9.5);
  doc.text("No. Kunjungan", badgeX + badgeW / 2, y + 5.8, { align: "center" });

  doc.setTextColor(176, 16, 40);
  doc.setFont(displayFont, "bold");
  doc.setFontSize(12.5);
  doc.text(visit.visitNumber, badgeX + badgeW / 2, y + 12.8, {
    align: "center",
  });

  /* =========================================================
     3. KARTU 1: INFORMASI KUNJUNGAN (SEMUA ISI NORMAL, NON-BOLD)
  ========================================================= */
  y = 58;
  const visitTypeDisplay = `${VISIT_TYPE_LABELS[visit.visitTypeCode]} (${visit.visitTypeCode})`;
  const infoRows: Array<{
    icon: "calendar" | "building" | "pin" | "user" | "gear";
    label: string;
    value: string;
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
    },
    {
      icon: "gear",
      label: "Jenis Kunjungan",
      value: visitTypeDisplay,
    },
  ];

  doc.setFont(bodyFont, "normal");
  doc.setFontSize(11);
  const preparedRows = infoRows.map((row) => {
    const lines = doc.splitTextToSize(row.value, contentW - 70);
    const rowH = Math.max(11, lines.length * 5.6 + 4.8);
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
    62,
    displayFont
  );

  let rowY = infoCardY + 2;
  preparedRows.forEach((row, index) => {
    const textBaseline = rowY + 7.1;
    drawSmallRowIcon(doc, row.icon, margin + 10.5, rowY + 5.7);

    doc.setFont(bodyFont, "normal");
    doc.setFontSize(11);
    doc.setTextColor(40, 38, 46);
    doc.text(row.label, margin + 19, textBaseline);
    doc.text(":", margin + 62, textBaseline);

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
     4. KARTU 2: INFORMASI MESIN (SEMUA ISI NORMAL, NON-BOLD)
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
    52,
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

  doc.setFontSize(11);
  doc.setFont(bodyFont, "normal");
  doc.setTextColor(50, 48, 58);
  doc.text("Nomor Mesin", mBoxX + 6, machineCardY + 13.8);
  doc.text(":", mBoxX + 40, machineCardY + 13.8);
  doc.setTextColor(20, 20, 24);
  doc.text(visit.machineCode || "-", mBoxX + 45, machineCardY + 13.8);

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
  doc.setFontSize(11);
  const activityText = visit.activityDescription?.trim() || "-";
  const activityLines = doc.splitTextToSize(activityText, contentW - 14);
  const activityBodyH = Math.max(36, activityLines.length * 6 + 14);

  const activityCardY = drawFolderCard(
    doc,
    margin,
    y,
    contentW,
    activityBodyH,
    "Deskripsi Aktivitas",
    57,
    displayFont
  );

  doc.setTextColor(30, 28, 35);
  doc.setFont(bodyFont, "normal");
  doc.setFontSize(11);
  doc.text(activityLines, margin + 7, activityCardY + 9.5);

  /* =========================================================
     6. KARTU 4: TINDAKAN / CATATAN TEKNISI
  ========================================================= */
  y = activityCardY + activityBodyH + 7.5;
  const notesText =
    visit.technicianNotes?.trim() || "Tidak ada catatan teknisi tambahan.";
  const notesLines = doc.splitTextToSize(notesText, contentW - 14);
  const notesBodyH = Math.max(24, notesLines.length * 6 + 14);

  const notesCardY = drawFolderCard(
    doc,
    margin,
    y,
    contentW,
    notesBodyH,
    "Tindakan / Catatan Teknisi",
    70,
    displayFont
  );

  doc.setTextColor(30, 28, 35);
  doc.setFont(bodyFont, "normal");
  doc.setFontSize(11);
  doc.text(notesLines, margin + 7, notesCardY + 9.5);

  /* =========================================================
     7. FOOTER A4 (TAGLINE + PITA FULL-BLEED KANAN BAWAH)
  ========================================================= */
  const footerLineY = pageH - 22;
  doc.setDrawColor(200, 206, 220);
  doc.setLineWidth(0.35);
  doc.line(margin, footerLineY, pageW - margin, footerLineY);

  doc.setTextColor(32, 32, 38);
  doc.setFont(bodyFont, "italic");
  doc.setFontSize(11.5);
  doc.text("Track Precisely, Deliver Quality", margin, pageH - 10.5);

  if (footerRibbon) {
    doc.addImage(footerRibbon, "PNG", pageW - 82, pageH - 18.5, 82, 18.5);
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
