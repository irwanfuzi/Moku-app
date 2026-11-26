import { jsPDF } from "jspdf";
import { VISIT_TYPE_LABELS, type VisitRecord } from "@/lib/visit-store";

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
  const tabH = 7.5;

  // Tab marun di kiri atas kartu
  doc.setFillColor(142, 0, 28); // #8E001C
  doc.roundedRect(x, y, tabW, tabH + 3, 2.5, 2.5, "F");
  doc.triangle(x + tabW - 1, y, x + tabW + 5, y + tabH, x + tabW - 1, y + tabH, "F");

  // Teks judul tab
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(tabTitle, x + 5, y + 5.3);

  // Badan kartu putih + border merah marun
  const cardY = y + tabH;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(190, 20, 46);
  doc.setLineWidth(0.45);
  doc.roundedRect(x, cardY, w, bodyH, 3, 3, "FD");

  // Tutup sudut kiri atas kartu agar menyatu rapi dengan tab
  doc.setFillColor(142, 0, 28);
  doc.rect(x, y + tabH - 1.2, 2.5, 1.5, "F");

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
  doc.setLineWidth(0.4);

  switch (kind) {
    case "calendar":
      doc.roundedRect(cx - 2.1, cy - 1.9, 4.2, 3.8, 0.6, 0.6, "S");
      doc.line(cx - 2.1, cy - 0.7, cx + 2.1, cy - 0.7);
      doc.line(cx - 1, cy - 2.4, cx - 1, cy - 1.4);
      doc.line(cx + 1, cy - 2.4, cx + 1, cy - 1.4);
      break;
    case "building":
      doc.rect(cx - 1.8, cy - 2.1, 3.6, 4.2, "S");
      doc.rect(cx - 0.5, cy + 0.6, 1, 1.5, "S");
      doc.circle(cx - 0.8, cy - 1, 0.25, "F");
      doc.circle(cx + 0.8, cy - 1, 0.25, "F");
      doc.circle(cx - 0.8, cy - 0.1, 0.25, "F");
      doc.circle(cx + 0.8, cy - 0.1, 0.25, "F");
      break;
    case "pin":
      doc.circle(cx, cy - 0.5, 1.7, "S");
      doc.circle(cx, cy - 0.5, 0.5, "F");
      doc.line(cx - 1.2, cy + 0.7, cx, cy + 2.2);
      doc.line(cx + 1.2, cy + 0.7, cx, cy + 2.2);
      break;
    case "user":
      doc.circle(cx, cy - 1, 1.1, "S");
      doc.roundedRect(cx - 1.9, cy + 0.5, 3.8, 1.8, 0.9, 0.9, "S");
      break;
    case "gear":
    default:
      doc.circle(cx, cy, 1.9, "S");
      doc.circle(cx, cy, 0.7, "S");
      break;
  }
}

function drawPrinterVector(doc: jsPDF, x: number, y: number) {
  // Badan mesin multifungsi sederhana & bersih
  doc.setFillColor(242, 243, 247);
  doc.setDrawColor(195, 198, 208);
  doc.setLineWidth(0.35);

  // Kaki/rak bawah
  doc.roundedRect(x + 4, y + 13, 18, 9, 1, 1, "FD");
  doc.line(x + 5, y + 17.5, x + 21, y + 17.5);
  // Badan utama
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x + 2, y + 4, 22, 10, 1.4, 1.4, "FD");
  // Scanner atas
  doc.setFillColor(232, 234, 240);
  doc.roundedRect(x + 3.5, y + 1.5, 19, 3, 0.8, 0.8, "FD");
  // Panel kontrol marun
  doc.setFillColor(142, 0, 28);
  doc.roundedRect(x + 17.5, y + 5.8, 4.5, 2.2, 0.5, 0.5, "F");
  // Slot kertas
  doc.setFillColor(215, 218, 226);
  doc.rect(x + 6, y + 9.2, 10, 2.2, "F");
}

export function generateVisitReportPdf(visit: VisitRecord): GeneratedVisitPdf {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageW = doc.internal.pageSize.getWidth(); // 210mm
  const pageH = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 15;
  const contentW = pageW - margin * 2;

  /* =========================================================
     1. TOP HEADER (LOGO MOKU + PITA MARUN EMAS)
  ========================================================= */
  // Pita emas (kuning) di sisi kiri banner marun
  doc.setFillColor(245, 180, 0); // #F5B400
  doc.triangle(103, 25, 121, 0, 129, 0, "F");
  doc.triangle(103, 25, 129, 0, 113, 25, "F");

  // Banner marun kanan atas
  doc.setFillColor(142, 0, 28); // #8E001C
  doc.rect(124, 0, pageW - 124, 25, "F");
  doc.triangle(110, 25, 125, 0, 125, 25, "F");

  // Judul kanan atas + garis aksen kuning
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("Laporan Kunjungan", pageW - margin, 14, { align: "right" });

  doc.setFillColor(245, 180, 0);
  doc.roundedRect(pageW - margin - 16, 17.5, 16, 1.3, 0.6, 0.6, "F");

  // Logo MOKU kiri atas
  doc.setTextColor(142, 0, 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("MOKU", margin, 16.5);

  // Garis pemisah vertikal + subtitle
  doc.setDrawColor(160, 160, 170);
  doc.setLineWidth(0.35);
  doc.line(margin + 27, 7.5, margin + 27, 18.5);

  doc.setTextColor(35, 35, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Monitoring Operasional", margin + 30.5, 12);
  doc.text("Kunjungan Unit", margin + 30.5, 16.2);

  // Garis pemisah tipis bawah header
  doc.setDrawColor(218, 222, 232);
  doc.setLineWidth(0.35);
  doc.line(margin, 25, pageW - margin, 25);

  /* =========================================================
     2. SUB-HEADER (JUDUL DETAIL + BADGE NO. KUNJUNGAN)
  ========================================================= */
  let y = 32;

  // Kotak ikon kalender merah muda
  doc.setFillColor(252, 236, 239);
  doc.roundedRect(margin, y, 14, 14, 3, 3, "F");
  doc.setDrawColor(190, 20, 46);
  doc.setLineWidth(0.55);
  doc.roundedRect(margin + 3.4, y + 3.8, 7.2, 6.6, 1, 1, "S");
  doc.line(margin + 3.4, y + 6, margin + 10.6, y + 6);
  doc.line(margin + 5.2, y + 2.8, margin + 5.2, y + 4.4);
  doc.line(margin + 8.8, y + 2.8, margin + 8.8, y + 4.4);

  // Teks judul & subjudul
  doc.setTextColor(23, 23, 23);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13.5);
  doc.text("Laporan Detail Kunjungan", margin + 17.5, y + 5.8);

  doc.setTextColor(95, 92, 102);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "Laporan hasil kunjungan teknisi ke lokasi pelanggan.",
    margin + 17.5,
    y + 11.2
  );

  // Badge No. Kunjungan di kanan
  const badgeW = 52;
  const badgeX = pageW - margin - badgeW;
  doc.setFillColor(252, 236, 239);
  doc.roundedRect(badgeX, y, badgeW, 14, 3, 3, "F");

  doc.setTextColor(75, 70, 80);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("No. Kunjungan", badgeX + badgeW / 2, y + 5, { align: "center" });

  doc.setTextColor(176, 16, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(visit.visitNumber, badgeX + badgeW / 2, y + 10.8, {
    align: "center",
  });

  /* =========================================================
     3. KARTU 1: INFORMASI KUNJUNGAN
  ========================================================= */
  y = 53;
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

  // Hitung tinggi kartu dinamis berdasarkan panjang teks lokasi
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const preparedRows = infoRows.map((row) => {
    const lines = doc.splitTextToSize(row.value, contentW - 60);
    const rowH = Math.max(8.5, lines.length * 4.6 + 3.8);
    return { ...row, lines, rowH };
  });

  const infoBodyH =
    preparedRows.reduce((sum, r) => sum + r.rowH, 0) + 4;
  const infoCardY = drawFolderCard(
    doc,
    margin,
    y,
    contentW,
    infoBodyH,
    "Informasi Kunjungan",
    54
  );

  let rowY = infoCardY + 2;
  preparedRows.forEach((row, index) => {
    const textBaseline = rowY + 5.5;
    drawSmallRowIcon(doc, row.icon, margin + 8.5, rowY + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(45, 42, 50);
    doc.text(row.label, margin + 15, textBaseline);
    doc.text(":", margin + 52, textBaseline);

    doc.setFont("helvetica", row.boldValue ? "bold" : "normal");
    doc.setTextColor(23, 23, 23);
    doc.text(row.lines, margin + 56, textBaseline);

    if (index < preparedRows.length - 1) {
      doc.setDrawColor(236, 236, 242);
      doc.setLineWidth(0.25);
      doc.line(
        margin + 15,
        rowY + row.rowH,
        pageW - margin - 5,
        rowY + row.rowH
      );
    }
    rowY += row.rowH;
  });

  /* =========================================================
     4. KARTU 2: INFORMASI MESIN
  ========================================================= */
  y = infoCardY + infoBodyH + 7;
  const machineBodyH = 29;
  const machineCardY = drawFolderCard(
    doc,
    margin,
    y,
    contentW,
    machineBodyH,
    "Informasi Mesin",
    45
  );

  // Ilustrasi mesin di kiri
  drawPrinterVector(doc, margin + 6, machineCardY + 3.5);

  // Garis pemisah vertikal
  doc.setDrawColor(190, 196, 210);
  doc.setLineWidth(0.35);
  doc.line(margin + 38, machineCardY + 5, margin + 38, machineCardY + 24);

  // Kotak info mesin abu lembut di kanan
  const mBoxX = margin + 43;
  const mBoxW = contentW - 48;
  doc.setFillColor(244, 245, 249);
  doc.roundedRect(mBoxX, machineCardY + 4.5, mBoxW, 20, 2.5, 2.5, "F");

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 52, 62);
  doc.text("Nomor Mesin", mBoxX + 5, machineCardY + 11.8);
  doc.text(":", mBoxX + 35, machineCardY + 11.8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(23, 23, 23);
  doc.text(visit.machineCode || "-", mBoxX + 39, machineCardY + 11.8);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 52, 62);
  doc.text("Model Mesin", mBoxX + 5, machineCardY + 19.2);
  doc.text(":", mBoxX + 35, machineCardY + 19.2);
  doc.setTextColor(23, 23, 23);
  doc.text(visit.machineModel || "-", mBoxX + 39, machineCardY + 19.2);

  /* =========================================================
     5. KARTU 3: DESKRIPSI AKTIVITAS (SESUAI REVISI PARAGRAF)
  ========================================================= */
  y = machineCardY + machineBodyH + 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const activityText = visit.activityDescription?.trim() || "-";
  const activityLines = doc.splitTextToSize(activityText, contentW - 12);
  const activityBodyH = Math.max(22, activityLines.length * 4.8 + 10);

  const activityCardY = drawFolderCard(
    doc,
    margin,
    y,
    contentW,
    activityBodyH,
    "Deskripsi Aktivitas",
    50
  );

  doc.setTextColor(35, 32, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(activityLines, margin + 6, activityCardY + 7.5);

  /* =========================================================
     6. KARTU 4: TINDAKAN / CATATAN TEKNISI
  ========================================================= */
  y = activityCardY + activityBodyH + 7;
  const notesText =
    visit.technicianNotes?.trim() || "Tidak ada catatan teknisi tambahan.";
  const notesLines = doc.splitTextToSize(notesText, contentW - 12);
  const notesBodyH = Math.max(20, notesLines.length * 4.8 + 10);

  const notesCardY = drawFolderCard(
    doc,
    margin,
    y,
    contentW,
    notesBodyH,
    "Tindakan / Catatan Teknisi",
    62
  );

  doc.setTextColor(35, 32, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(notesLines, margin + 6, notesCardY + 7.5);

  /* =========================================================
     7. FOOTER A4 (TAGLINE + PITA MARUN EMAS KANAN BAWAH)
  ========================================================= */
  const footerLineY = pageH - 22;
  doc.setDrawColor(200, 206, 220);
  doc.setLineWidth(0.35);
  doc.line(margin, footerLineY, pageW - margin, footerLineY);

  doc.setTextColor(40, 40, 48);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10.5);
  doc.text("Track Precisely, Deliver Quality", margin, pageH - 11.5);

  // Aksen pita marun + kuning emas di sudut kanan bawah
  doc.setFillColor(142, 0, 28);
  doc.triangle(134, pageH, 152, pageH - 15, pageW, pageH - 15, "F");
  doc.triangle(134, pageH, pageW, pageH - 15, pageW, pageH, "F");

  doc.setFillColor(245, 180, 0);
  doc.triangle(156, pageH, 174, pageH - 15, 184, pageH - 15, "F");
  doc.triangle(156, pageH, 184, pageH - 15, 166, pageH, "F");

  doc.setFillColor(120, 0, 22);
  doc.triangle(168, pageH, 186, pageH - 15, pageW, pageH - 15, "F");
  doc.triangle(168, pageH, pageW, pageH - 15, pageW, pageH, "F");

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
