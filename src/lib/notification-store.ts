
export type NotificationType =
  | "visit"
  | "equipment"
  | "user"
  | "monitoring"
  | "general";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  detail: string;
  time: string;
  href?: string;
  type: NotificationType;
  isRead: boolean;
}

const STORAGE_KEY = "moku_notifications";
const UPDATE_EVENT = "moku-notifications-updated";

export const demoNotifications: NotificationItem[] = [
  {
    id: "notif-001",
    title: "Kunjungan berhasil dicatat",
    description: "Preventive Maintenance - MOKU-001",
    detail:
      "Kunjungan Preventive Maintenance untuk mesin MOKU-001 milik PT Maju Jaya berhasil dicatat dan masuk ke riwayat kunjungan.",
    time: "5 menit yang lalu",
    href: "/visits",
    type: "visit",
    isRead: false,
  },
  {
    id: "notif-002",
    title: "Peralatan baru ditambahkan",
    description: "MOKU-012 - Canon imageRUNNER",
    detail:
      "Peralatan MOKU-012 dengan model Canon imageRUNNER telah ditambahkan ke daftar peralatan.",
    time: "1 jam yang lalu",
    href: "/equipment",
    type: "equipment",
    isRead: false,
  },
  {
    id: "notif-003",
    title: "Informasi pengguna diperbarui",
    description: "Andi Pratama",
    detail:
      "Informasi akun pengguna Andi Pratama telah diperbarui.",
    time: "3 jam yang lalu",
    href: "/users",
    type: "user",
    isRead: true,
  },
  {
    id: "notif-004",
    title: "Monitoring bulanan diperbarui",
    description: "Periode November 2026",
    detail:
      "Data monitoring kunjungan untuk periode November 2026 telah diperbarui berdasarkan aktivitas kunjungan yang tercatat.",
    time: "Kemarin",
    href: "/monitoring",
    type: "monitoring",
    isRead: true,
  },
  {
    id: "notif-005",
    title: "Kunjungan berhasil dicatat",
    description: "Unscheduled Maintenance - MOKU-002",
    detail:
      "Kunjungan Unscheduled Maintenance untuk mesin MOKU-002 milik PT Sinar Abadi berhasil dicatat.",
    time: "2 hari yang lalu",
    href: "/visits",
    type: "visit",
    isRead: true,
  },
];

export function loadNotifications(): NotificationItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === null) {
      saveNotifications(demoNotifications);
      return demoNotifications;
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : demoNotifications;
  } catch {
    return demoNotifications;
  }
}

export function saveNotifications(items: NotificationItem[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function subscribeNotifications(
  callback: () => void
): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(UPDATE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(UPDATE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
