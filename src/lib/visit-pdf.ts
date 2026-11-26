import { jsPDF } from "jspdf";
import { VISIT_TYPE_LABELS, type VisitRecord } from "@/lib/visit-store";

const MOKU_LOGO_URL = "/images/moku/brand/moku-logo-marun.png";

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
 * Render logo MOKU yang sudah di-resize (anti bengkak MB) + efek drop shadow halus
 */
function renderLogoWithShadow(
  img: HTMLImageElement
): { dataUrl: string; aspect: number } | null {
  try {
    const maxW = 520;
    const scale = Math.min(1, maxW / (img.naturalWidth || img.width));
    const drawW = Math.round((img.naturalWidth || img.width) * scale);
    const drawH = Math.round((img.naturalHeight || img.height) * scale);
    const pad = 20;

    const canvas = document.createElement("canvas");
    canvas.width = drawW + pad * 2;
    canvas.height = drawH + pad * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.shadowColor = "rgba(131, 5, 28, 0.22)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
    ctx.drawImage(img, pad, pad, drawW, drawH);

    return {
      dataUrl: canvas.toDataURL("image/png"),
      aspect: canvas.width / canvas.height,
    };
  } catch {
    return null;
  }
}

/**
 * Render pita lengkung marun + gradasi emas di Header (kanan atas)
 */
function renderHeaderRibbon(): string | null {
  try {
    const w = 960;
    const h = 240;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // 1. Pita emas gradasi metalik
    const goldGrad = ctx.createLinearGradient(60, h, 240, 0);
    goldGrad.addColorStop(0, "#D97706");
    goldGrad.addColorStop(0.45, "#F59E0B");
    goldGrad.addColorStop(0.75, "#FDE047");
    goldGrad.addColorStop(1, "#F59E0B");

    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.bezierCurveTo(95, h, 110, 10, 225, 0);
    ctx.lineTo(310, 0);
    ctx.bezierCurveTo(195, 10, 175, h, 85, h);
    ctx.closePath();
    ctx.fill();

    // 2. Banner marun gradasi gelap-terang
    const maroonGrad = ctx.createLinearGradient(120, 0, w, h);
    maroonGrad.addColorStop(0, "#A30021");
    maroonGrad.addColorStop(0.55, "#83051C");
    maroonGrad.addColorStop(1, "#620213");

    ctx.fillStyle = maroonGrad;
    ctx.beginPath();
    ctx.moveTo(68, h);
    ctx.bezierCurveTo(160, h, 175, 10, 290, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // 3. Garis aksen emas kecil di bawah teks "Laporan Kunjungan"
    const lineGrad = ctx.createLinearGradient(w - 230, 0, w - 95, 0);
    lineGrad.addColorStop(0, "#F59E0B");
    lineGrad.addColorStop(0.5, "#FDE047");
    lineGrad.addColorStop(1, "#D97706");

    ctx.fillStyle = lineGrad;
    ctx.beginPath();
    ctx.roundRect(w - 228, 166, 130, 11, 6);
    ctx.fill();

    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

/**
 * Render pita gelombang marun + gradasi emas di Footer (kanan bawah)
 */
function renderFooterRibbon(): string | null {
  try {
    const w = 780;
    const h = 190;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // 1. Gelombang marun kiri
    const leftMaroon = ctx.createLinearGradient(0, h, 360, 0);
    leftMaroon.addColorStop(0, "#A30021");
    leftMaroon.addColorStop(1, "#7B0419");

    ctx.fillStyle = leftMaroon;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.bezierCurveTo(75, 35, 175, 10, 360, 10);
    ctx.lineTo(w, 10);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // 2. Pita emas melengkung di tengah
    const goldGrad = ctx.createLinearGradient(190, h, 470, 0);
    goldGrad.addColorStop(0, "#D97706");
    goldGrad.addColorStop(0.4, "#F59E0B");
    goldGrad.addColorStop(0.75, "#FDE047");
    goldGrad.addColorStop(1, "#F59E0B");

    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.moveTo(195, h);
    ctx.bezierCurveTo(280, 55, 355, 10, 495, 10);
    ctx.lineTo(575, 10);
    ctx.bezierCurveTo(435, 15, 375, 75, 295, h);
    ctx.closePath();
    ctx.fill();

    // 3. Gelombang marun gelap di kanan
    const rightMaroon = ctx.createLinearGradient(290, h, w, 0);
    rightMaroon.addColorStop(0, "#7A0318");
    rightMaroon.addColorStop(1, "#550110");

    ctx.fillStyle = rightMaroon;
    ctx.beginPath();
    ctx.moveTo(295, h);
    ctx.bezierCurveTo(375, 70, 445, 12, 570, 10);
    ctx.lineTo(w, 10);
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
  tabW: number
) {
  const tabH = 9.2;

  // Tab marun dengan lekukan halus di sisi kanan
  doc.setFillColor(142, 0, 28);
  doc.moveTo(x, y + tabH + 2);
  doc.lineTo(x, y + 3.2);
  doc.curveTo(x, y, x + 2.2, y, x + 4.5, y);
  doc.lineTo(x + tabW - 5, y);
  doc.curveTo(x + tabW, y, x + tabW + 2.5, y + 3.2, x + tabW + 8, y + tabH);
  doc.lineTo(x + tabW + 8, y + tabH + 2);
  doc.close();
  doc.fill();

  // Judul tab
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(tabTitle, x + 6, y + 6.4);

  // Badan kartu putih + border merah marun
  const cardY = y + tabH;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(185, 16, 42);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, cardY, w, bodyH, 3.5, 3.5, "FD");

  // Tutup sudut kiri atas agar menyatu dengan tab
  doc.setFillColor(142, 0, 28);
  doc.rect(x, y + tabH - 1.1, 3.2, 1.5, "F");

  return cardY;
}

function drawSmallRowIcon(
  doc: jsPDF,
  kind: "calendar" | "building" | "pin" | "user" | "gear",
  cx: number,
  cy: number
) {
  doc.setDrawColor(190, 20, 46);
  doc.setFillColor(190, 20, 46);
  doc.setLineWidth(0.48);

  switch (kind) {
    case "calendar":
      doc.roundedRect(cx - 2.4, cy - 2.1, 4.8, 4.3, 0.7, 0.7, "S");
      doc.line(cx - 2.4, cy - 0.7, cx + 2.4, cy - 0.7);
      doc.line(cx - 1.1, cy - 2.7, cx - 1.1, cy - 1.6);
      doc.line(cx + 1.1, cy - 2.7, cx + 1.1, cy - 1.6);
      break;
    case "building":
      doc.rect(cx - 2.1, cy - 2.4, 4.2, 4.8, "S");
      doc.rect(cx - 0.6, cy + 0.7, 1.2, 1.7, "S");
      doc.circle(cx - 0.95, cy - 1.15, 0.3, "F");
      doc.circle(cx + 0.95, cy - 1.15, 0.3, "F");
      doc.circle(cx - 0.95, cy - 0.1, 0.3, "F");
      doc.circle(cx + 0.95, cy - 0.1, 0.3, "F");
      break;
    case "pin":
      doc.circle(cx, cy - 0.6, 2, "S");
      doc.circle(cx, cy - 0.6, 0.6, "F");
      doc.line(cx - 1.4, cy + 0.75, cx, cy + 2.5);
      doc.line(cx + 1.4, cy + 0.75, cx, cy + 2.5);
      break;
    case "user":
      doc.circle(cx, cy - 1.2, 1.25, "S");
      doc.roundedRect(cx - 2.2, cy + 0.55, 4.4, 2.1, 1, 1, "S");
      break;
    case "gear":
    default:
      doc.circle(cx, cy, 2.2, "S");
      doc.circle(cx, cy, 0.85, "S");
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
  const margin = 14;
  const contentW = pageW - margin * 2;

  const rawLogo = await loadImage(MOKU_LOGO_URL);
  const styledLogo = rawLogo ? renderLogoWithShadow(rawLogo) : null;
  const headerRibbon = renderHeaderRibbon();
  const footerRibbon = renderFooterRibbon();

  /* =========================================================
     1. TOP HEADER (LOGO MOKU + PITA LENGKUNG GRADASI)
  ========================================================= */
  const headerH = 29;
  if (headerRibbon) {
    doc.addImage(headerRibbon, "PNG", pageW - 116, 0, 116, headerH);
  } else {
    doc.setFillColor(142, 0, 28);
    doc.rect(pageW - 100, 0, 100, headerH, "F");
  }

  // Judul kanan atas
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text("Laporan Kunjungan", pageW - margin, 15.5, { align: "right" });

  // Logo MOKU kiri atas (lebih besar + shadow)
  let subtitleX = margin + 48;
  if (styledLogo) {
    const targetH = 19.5;
    const targetW = Math.min(54, styledLogo.aspect * targetH);
    doc.addImage(
      styledLogo.dataUrl,
      "PNG",
      margin - 2,
      4.5,
      targetW,
      targetH
    );
    subtitleX = margin + targetW + 2;
  } else {
    doc.setTextColor(142, 0, 28);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("MOKU", margin, 18);
    subtitleX = margin + 34;
  }

  // Garis pemisah vertikal + subtitle
  doc.setDrawColor(140, 140, 150);
  doc.setLineWidth(0.4);
  doc.line(subtitleX - 2.5, 9, subtitleX - 2.5, 19.8);

  doc.setTextColor(30, 30, 36);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.2);
  doc.text("Monitoring Operasional", subtitleX, 13.4);
  doc.text("Kunjungan Unit", subtitleX, 18);

  // Garis tipis bawah header
  doc.setDrawColor(218, 222, 232);
  doc.setLineWidth(0.35);
  doc.line(margin, headerH, pageW - margin, headerH);

  /* =========================================================
     2. SUB-HEADER (JUDUL DETAIL + BADGE NO. KUNJUNGAN)
  ========================================================= */
  let y = 36;

  // Kotak ikon kalender merah muda
  doc.setFillColor(252, 236, 239);
  doc.roundedRect(margin, y, 16.5, 16.5, 3.5, 3.5, "F");
  doc.setDrawColor(190, 20, 46);
  doc.setLineWidth(0.65);
  doc.roundedRect(margin + 4, y + 4.5, 8.5, 7.6, 1.2, 1.2, "S");
  doc.line(margin + 4, y + 7.1, margin + 12.5, y + 7.1);
  doc.line(margin + 6.1, y + 3.3, margin + 6.1, y + 5.2);
  doc.line(margin + 10.4, y + 3.3, margin + 10.4, y + 5.2);

  // Teks judul & subjudul
  doc.setTextColor(20, 20, 24);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Laporan Detail Kunjungan", margin + 21, y + 7);

  doc.setTextColor(85, 82, 92);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.2);
  doc.text(
    "Laporan hasil kunjungan teknisi ke lokasi pelanggan.",
    margin + 21,
    y + 13.2
  );

  // Badge No. Kunjungan di kanan
  const badgeW = 58;
  const badgeX = pageW - margin - badgeW;
  doc.setFillColor(252, 236, 239);
  doc.roundedRect(badgeX, y, badgeW, 16.5, 3.5, 3.5, "F");

  doc.setTextColor(65, 62, 72);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("No. Kunjungan", badgeX + badgeW / 2, y + 6, { align: "center" });

  doc.setTextColor(176, 16, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.text(visit.visitNumber, badgeX + badgeW / 2, y + 12.6, {
    align: "center",
  });

  /* =========================================================
     3. KARTU 1: INFORMASI KUNJUNGAN
  ========================================================= */
  y = 60;
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

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const preparedRows = infoRows.map((row) => {
    const lines = doc.splitTextToSize(row.value, contentW - 68);
    const rowH = Math.max(11, lines.length * 5.6 + 4.8);
    return { ...row, lines, rowH };
  });

  const infoBodyH = preparedRows.reduce((sum, r) => sum + r.rowH, 0) + 5;
  const infoCardY = drawFolderCard(
    doc,
    margin,
    y,
    contentW,
    infoBodyH,
    "Informasi Kunjungan",
    60
  );

  let rowY = infoCardY + 2.5;
  preparedRows.forEach((row, index) => {
    const textBaseline = rowY + 7;
    drawSmallRowIcon(doc, row.icon, margin + 10, rowY + 5.7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(45, 42, 50);
    doc.text(row.label, margin + 18, textBaseline);
    doc.text(":", margin + 59, textBaseline);

    doc.setFont("helvetica", row.boldValue ? "bold" : "normal");
    doc.setTextColor(20, 20, 24);
    doc.text(row.lines, margin + 64, textBaseline);

    if (index < preparedRows.length - 1) {
      doc.setDrawColor(236, 236, 242);
      doc.setLineWidth(0.3);
      doc.line(
        margin + 18,
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
  y = infoCardY + infoBodyH + 8;
  const machineBodyH = 35;
  const machineCardY = drawFolderCard(
    doc,
    margin,
    y,
    contentW,
    machineBodyH,
    "Informasi Mesin",
    50
  );

  drawPrinterVector(doc, margin + 8, machineCardY + 4.2);

  doc.setDrawColor(190, 196, 210);
  doc.setLineWidth(0.4);
  doc.line(margin + 44, machineCardY + 6, margin + 44, machineCardY + 29);

  const mBoxX = margin + 49;
  const mBoxW = contentW - 55;
  doc.setFillColor(244, 245, 249);
  doc.roundedRect(mBoxX, machineCardY + 5.5, mBoxW, 24, 3, 3, "F");

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 52, 62);
  doc.text("Nomor Mesin", mBoxX + 6, machineCardY + 14.2);
  doc.text(":", mBoxX + 39, machineCardY + 14.2);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 24);
  doc.text(visit.machineCode || "-", mBoxX + 44, machineCardY + 14.2);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 52, 62);
  doc.text("Model Mesin", mBoxX + 6, machineCardY + 23.2);
  doc.text(":", mBoxX + 39, machineCardY + 23.2);
  doc.setTextColor(20, 20, 24);
  doc.text(visit.machineModel || "-", mBoxX + 44, machineCardY + 23.2);

  /* =========================================================
     5. KARTU 3: DESKRIPSI AKTIVITAS
  ========================================================= */
  y = machineCardY + machineBodyH + 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const activityText = visit.activityDescription?.trim() || "-";
  const activityLines = doc.splitTextToSize(activityText, contentW - 14);
  const activityBodyH = Math.max(32, activityLines.length * 5.8 + 14);

  const activityCardY = drawFolderCard(
    doc,
    margin,
    y,
    contentW,
    activityBodyH,
    "Deskripsi Aktivitas",
    55
  );

  doc.setTextColor(30, 28, 35);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(activityLines, margin + 7, activityCardY + 9.5);

  /* =========================================================
     6. KARTU 4: TINDAKAN / CATATAN TEKNISI
  ========================================================= */
  y = activityCardY + activityBodyH + 8;
  const notesText =
    visit.technicianNotes?.trim() || "Tidak ada catatan teknisi tambahan.";
  const notesLines = doc.splitTextToSize(notesText, contentW - 14);
  const notesBodyH = Math.max(28, notesLines.length * 5.8 + 14);

  const notesCardY = drawFolderCard(
    doc,
    margin,
    y,
    contentW,
    notesBodyH,
    "Tindakan / Catatan Teknisi",
    68
  );

  doc.setTextColor(30, 28, 35);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(notesLines, margin + 7, notesCardY + 9.5);

  /* =========================================================
     7. FOOTER A4 (TAGLINE + PITA GELOMBANG MARUN EMAS)
  ========================================================= */
  const footerLineY = pageH - 25;
  doc.setDrawColor(200, 206, 220);
  doc.setLineWidth(0.35);
  doc.line(margin, footerLineY, pageW - margin, footerLineY);

  doc.setTextColor(35, 35, 42);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(12);
  doc.text("Track Precisely, Deliver Quality", margin, pageH - 13);

  if (footerRibbon) {
    doc.addImage(footerRibbon, "PNG", pageW - 86, pageH - 21, 86, 21);
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
