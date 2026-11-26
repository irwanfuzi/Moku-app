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

interface LoadedImage {
  dataUrl: string;
  width: number;
  height: number;
}

function loadImageAsDataUrl(url: string): Promise<LoadedImage | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve({
          dataUrl: canvas.toDataURL("image/png"),
          width: canvas.width,
          height: canvas.height,
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
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
  const tabH = 8.5;

  // Tab marun dengan lekukan halus di sisi kanan
  doc.setFillColor(142, 0, 28);
  doc.moveTo(x, y + tabH + 2);
  doc.lineTo(x, y + 3);
  doc.curveTo(x, y, x + 2, y, x + 4, y);
  doc.lineTo(x + tabW - 4, y);
  doc.curveTo(x + tabW, y, x + tabW + 2, y + 3, x + tabW + 7, y + tabH);
  doc.lineTo(x + tabW + 7, y + tabH + 2);
  doc.close();
  doc.fill();

  // Judul tab
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.text(tabTitle, x + 5.5, y + 6);

  // Badan kartu putih + border merah marun
  const cardY = y + tabH;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(185, 16, 42);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, cardY, w, bodyH, 3.2, 3.2, "FD");

  // Tutup sudut kiri atas agar menyatu dengan tab
  doc.setFillColor(142, 0, 28);
  doc.rect(x, y + tabH - 1, 3, 1.4, "F");

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
  doc.setLineWidth(0.45);

  switch (kind) {
    case "calendar":
      doc.roundedRect(cx - 2.3, cy - 2, 4.6, 4.1, 0.7, 0.7, "S");
      doc.line(cx - 2.3, cy - 0.7, cx + 2.3, cy - 0.7);
      doc.line(cx - 1.1, cy - 2.6, cx - 1.1, cy - 1.5);
      doc.line(cx + 1.1, cy - 2.6, cx + 1.1, cy - 1.5);
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
      doc.line(cx - 1.3, cy + 0.7, cx, cy + 2.4);
      doc.line(cx + 1.3, cy + 0.7, cx, cy + 2.4);
      break;
    case "user":
      doc.circle(cx, cy - 1.1, 1.2, "S");
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

  // Kaki/rak bawah
  doc.roundedRect(x + 4, y + 14.5, 20, 10, 1, 1, "FD");
  doc.line(x + 5, y + 19.5, x + 23, y + 19.5);
  // Badan utama
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x + 2, y + 4.5, 24, 11, 1.5, 1.5, "FD");
  // Scanner atas
  doc.setFillColor(228, 231, 238);
  doc.roundedRect(x + 3.5, y + 1.5, 21, 3.4, 0.8, 0.8, "FD");
  // Panel kontrol marun
  doc.setFillColor(142, 0, 28);
  doc.roundedRect(x + 19, y + 6.5, 5, 2.5, 0.5, 0.5, "F");
  // Slot kertas
  doc.setFillColor(212, 216, 224);
  doc.rect(x + 6.5, y + 10.2, 11, 2.4, "F");
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
  const margin = 15;
  const contentW = pageW - margin * 2;

  const logoImg = await loadImageAsDataUrl(MOKU_LOGO_URL);

  /* =========================================================
     1. TOP HEADER (LOGO MOKU + PITA LENGKUNG MARUN EMAS)
  ========================================================= */
  // Pita emas melengkung di kiri banner marun
  doc.setFillColor(245, 180, 0);
  doc.moveTo(100, 27);
  doc.curveTo(111, 26, 112, 1, 126, 0);
  doc.lineTo(135, 0);
  doc.curveTo(120, 2, 119, 26, 108, 27);
  doc.close();
  doc.fill();

  // Banner marun melengkung kanan atas
  doc.setFillColor(142, 0, 28);
  doc.moveTo(106, 27);
  doc.curveTo(118, 26, 119, 1, 132, 0);
  doc.lineTo(pageW, 0);
  doc.lineTo(pageW, 27);
  doc.close();
  doc.fill();

  // Judul kanan atas + garis aksen kuning
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Laporan Kunjungan", pageW - margin, 14.5, { align: "right" });

  doc.setFillColor(245, 180, 0);
  doc.roundedRect(pageW - margin - 17, 18.2, 17, 1.4, 0.7, 0.7, "F");

  // Logo MOKU kiri atas (pakai gambar asli jika berhasil dimuat)
  let subtitleX = margin + 35;
  if (logoImg && logoImg.width > 0 && logoImg.height > 0) {
    const targetH = 14.5;
    const targetW = Math.min(44, (logoImg.width / logoImg.height) * targetH);
    doc.addImage(logoImg.dataUrl, "PNG", margin, 6.2, targetW, targetH);
    subtitleX = margin + targetW + 5;
  } else {
    doc.setTextColor(142, 0, 28);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("MOKU", margin, 17);
    subtitleX = margin + 31;
  }

  // Garis pemisah vertikal + subtitle
  doc.setDrawColor(160, 160, 170);
  doc.setLineWidth(0.35);
  doc.line(subtitleX - 2.5, 8, subtitleX - 2.5, 19);

  doc.setTextColor(35, 35, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.8);
  doc.text("Monitoring Operasional", subtitleX, 12.5);
  doc.text("Kunjungan Unit", subtitleX, 17);

  // Garis tipis bawah header
  doc.setDrawColor(218, 222, 232);
  doc.setLineWidth(0.35);
  doc.line(margin, 27, pageW - margin, 27);

  /* =========================================================
     2. SUB-HEADER (JUDUL DETAIL + BADGE NO. KUNJUNGAN)
  ========================================================= */
  let y = 34;

  // Kotak ikon kalender merah muda
  doc.setFillColor(252, 236, 239);
  doc.roundedRect(margin, y, 15.5, 15.5, 3.2, 3.2, "F");
  doc.setDrawColor(190, 20, 46);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin + 3.8, y + 4.2, 8, 7.2, 1.1, 1.1, "S");
  doc.line(margin + 3.8, y + 6.7, margin + 11.8, y + 6.7);
  doc.line(margin + 5.8, y + 3.1, margin + 5.8, y + 4.9);
  doc.line(margin + 9.8, y + 3.1, margin + 9.8, y + 4.9);

  // Teks judul & subjudul
  doc.setTextColor(23, 23, 23);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14.5);
  doc.text("Laporan Detail Kunjungan", margin + 19.5, y + 6.5);

  doc.setTextColor(95, 92, 102);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(
    "Laporan hasil kunjungan teknisi ke lokasi pelanggan.",
    margin + 19.5,
    y + 12.2
  );

  // Badge No. Kunjungan di kanan
  const badgeW = 55;
  const badgeX = pageW - margin - badgeW;
  doc.setFillColor(252, 236, 239);
  doc.roundedRect(badgeX, y, badgeW, 15.5, 3.2, 3.2, "F");

  doc.setTextColor(75, 70, 80);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("No. Kunjungan", badgeX + badgeW / 2, y + 5.6, { align: "center" });

  doc.setTextColor(176, 16, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.8);
  doc.text(visit.visitNumber, badgeX + badgeW / 2, y + 11.8, {
    align: "center",
  });

  /* =========================================================
     3. KARTU 1: INFORMASI KUNJUNGAN
  ========================================================= */
  y = 57;
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
  doc.setFontSize(10.5);
  const preparedRows = infoRows.map((row) => {
    const lines = doc.splitTextToSize(row.value, contentW - 64);
    const rowH = Math.max(10.2, lines.length * 5.2 + 4.4);
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
    58
  );

  let rowY = infoCardY + 2.5;
  preparedRows.forEach((row, index) => {
    const textBaseline = rowY + 6.4;
    drawSmallRowIcon(doc, row.icon, margin + 9.5, rowY + 5.2);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(45, 42, 50);
    doc.text(row.label, margin + 17, textBaseline);
    doc.text(":", margin + 56, textBaseline);

    doc.setFont("helvetica", row.boldValue ? "bold" : "normal");
    doc.setTextColor(23, 23, 23);
    doc.text(row.lines, margin + 60.5, textBaseline);

    if (index < preparedRows.length - 1) {
      doc.setDrawColor(236, 236, 242);
      doc.setLineWidth(0.28);
      doc.line(
        margin + 17,
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
  const machineBodyH = 33;
  const machineCardY = drawFolderCard(
    doc,
    margin,
    y,
    contentW,
    machineBodyH,
    "Informasi Mesin",
    48
  );

  drawPrinterVector(doc, margin + 7, machineCardY + 4);

  doc.setDrawColor(190, 196, 210);
  doc.setLineWidth(0.35);
  doc.line(margin + 42, machineCardY + 5.5, margin + 42, machineCardY + 27.5);

  const mBoxX = margin + 47;
  const mBoxW = contentW - 53;
  doc.setFillColor(244, 245, 249);
  doc.roundedRect(mBoxX, machineCardY + 5, mBoxW, 23, 2.8, 2.8, "F");

  doc.setFontSize(10.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 52, 62);
  doc.text("Nomor Mesin", mBoxX + 6, machineCardY + 13.5);
  doc.text(":", mBoxX + 38, machineCardY + 13.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(23, 23, 23);
  doc.text(visit.machineCode || "-", mBoxX + 42.5, machineCardY + 13.5);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 52, 62);
  doc.text("Model Mesin", mBoxX + 6, machineCardY + 22);
  doc.text(":", mBoxX + 38, machineCardY + 22);
  doc.setTextColor(23, 23, 23);
  doc.text(visit.machineModel || "-", mBoxX + 42.5, machineCardY + 22);

  /* =========================================================
     5. KARTU 3: DESKRIPSI AKTIVITAS
  ========================================================= */
  y = machineCardY + machineBodyH + 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const activityText = visit.activityDescription?.trim() || "-";
  const activityLines = doc.splitTextToSize(activityText, contentW - 14);
  const activityBodyH = Math.max(32, activityLines.length * 5.4 + 14);

  const activityCardY = drawFolderCard(
    doc,
    margin,
    y,
    contentW,
    activityBodyH,
    "Deskripsi Aktivitas",
    53
  );

  doc.setTextColor(35, 32, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text(activityLines, margin + 7, activityCardY + 9);

  /* =========================================================
     6. KARTU 4: TINDAKAN / CATATAN TEKNISI
  ========================================================= */
  y = activityCardY + activityBodyH + 8;
  const notesText =
    visit.technicianNotes?.trim() || "Tidak ada catatan teknisi tambahan.";
  const notesLines = doc.splitTextToSize(notesText, contentW - 14);
  const notesBodyH = Math.max(28, notesLines.length * 5.4 + 14);

  const notesCardY = drawFolderCard(
    doc,
    margin,
    y,
    contentW,
    notesBodyH,
    "Tindakan / Catatan Teknisi",
    66
  );

  doc.setTextColor(35, 32, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text(notesLines, margin + 7, notesCardY + 9);

  /* =========================================================
     7. FOOTER A4 (TAGLINE + PITA LENGKUNG MARUN EMAS)
  ========================================================= */
  const footerLineY = pageH - 24;
  doc.setDrawColor(200, 206, 220);
  doc.setLineWidth(0.35);
  doc.line(margin, footerLineY, pageW - margin, footerLineY);

  doc.setTextColor(40, 40, 48);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(11.5);
  doc.text("Track Precisely, Deliver Quality", margin, pageH - 12.5);

  // Pita lengkung marun-emas sudut kanan bawah
  doc.setFillColor(142, 0, 28);
  doc.moveTo(132, pageH);
  doc.curveTo(140, pageH - 16, 152, pageH - 17, 174, pageH - 17);
  doc.lineTo(pageW, pageH - 17);
  doc.lineTo(pageW, pageH);
  doc.close();
  doc.fill();

  doc.setFillColor(245, 180, 0);
  doc.moveTo(154, pageH);
  doc.curveTo(164, pageH - 14, 174, pageH - 17, 190, pageH - 17);
  doc.lineTo(198, pageH - 17);
  doc.curveTo(182, pageH - 15, 174, pageH - 10, 166, pageH);
  doc.close();
  doc.fill();

  doc.setFillColor(122, 0, 22);
  doc.moveTo(166, pageH);
  doc.curveTo(174, pageH - 12, 184, pageH - 17, 198, pageH - 17);
  doc.lineTo(pageW, pageH - 17);
  doc.lineTo(pageW, pageH);
  doc.close();
  doc.fill();

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
