export type VisitTypeCode = "IND" | "INS" | "DIS" | "PMC" | "UMC";

export interface VisitRecord {
  visitNumber: string;
  visitDate: string; // YYYY-MM-DD
  status: "Selesai" | "Dijadwalkan";
  machineCode: string;
  machineModel: string;
  customerName: string;
  location: string;
  technicianName: string;
  visitTypeCode: VisitTypeCode;
  activityDescription: string;
  technicianNotes: string;
  createdAt: string;
}

export const VISIT_TYPE_LABELS: Record<VisitTypeCode, string> = {
  IND: "Instalasi Driver",
  INS: "Instalasi Mesin",
  DIS: "Dismantle",
  PMC: "Preventive Maintenance",
  UMC: "Unscheduled Maintenance",
};

const VISITS_STORAGE_KEY = "moku_visits_v1";

const DEFAULT_VISITS: VisitRecord[] = [
  {
    visitNumber: "KJ-20261125-001",
    visitDate: "2026-11-25",
    status: "Selesai",
    machineCode: "MK-004",
    machineModel: "iR-ADV C5535i",
    customerName: "PT. Citra Jaya",
    location: "Jl. Gatot Subroto No. 123, Jakarta Selatan",
    technicianName: "Budi Santoso",
    visitTypeCode: "PMC",
    activityDescription:
      "Pemeriksaan kondisi mesin\nPembersihan unit utama\nPengecekan komponen\nUji fungsi dan kualitas hasil cetak",
    technicianNotes:
      "Pembersihan rutin dan pengecekan komponen. Mesin dalam kondisi normal dan siap digunakan.",
    createdAt: "2026-11-25T09:41:00.000Z",
  },
];

export function loadVisits(): VisitRecord[] {
  if (typeof window === "undefined") return DEFAULT_VISITS;
  try {
    const raw = window.localStorage.getItem(VISITS_STORAGE_KEY);
    if (!raw) return DEFAULT_VISITS;
    const parsed = JSON.parse(raw) as VisitRecord[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_VISITS;
  } catch {
    return DEFAULT_VISITS;
  }
}

export function saveVisitRecord(record: VisitRecord): VisitRecord[] {
  const current = loadVisits().filter(
    (item) => item.visitNumber !== record.visitNumber
  );
  const next = [record, ...current];
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(VISITS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Abaikan jika storage penuh/diblokir
    }
  }
  return next;
}

export function getVisitByNumber(visitNumber?: string): VisitRecord {
  const list = loadVisits();
  if (visitNumber) {
    const found = list.find(
      (item) => item.visitNumber.toLowerCase() === visitNumber.toLowerCase()
    );
    if (found) return found;
  }
  return list[0] ?? DEFAULT_VISITS[0];
}
