
"use client";

export type NotificationType =
  | "visit"
  | "equipment"
  | "customer"
  | "monitoring"
  | "user"
  | "general";

export interface NotificationDetail {
  equipmentNumber?: string;
  equipmentModel?: string;
  customerName?: string;
  technicianName?: string;
  visitDate?: string;
  visitType?: string;
  activityDescription?: string;
  customerAddress?: string;
  customerContact?: string;
  monitoringPeriod?: string;
  monitoringStatus?: string;
  changeDescription?: string;
  [key: string]: string | undefined;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  detail?: string;
  time: string;
  createdAt: number;
  href?: string;
  isRead: boolean;
  type: NotificationType;
  data?: NotificationDetail;
}

export interface DeletedNotification {
  item: NotificationItem;
  index: number;
}

const STORAGE_KEY = "moku_notifications";
const UPDATE_EVENT = "moku-notifications-updated";

const now = Date.now();

export const demoNotifications: NotificationItem[] = [
  {
    id: "notif-001",
    title: "Kunjungan berhasil dicatat",
    description: "Preventive Maintenance telah dicatat untuk MOKU-001.",
    detail:
      "Teknisi telah menyelesaikan kunjungan Preventive Maintenance dan menyimpan laporan aktivitas.",
    time: "10 menit lalu",
    createdAt: now - 10 * 60 * 1000,
    href: "/visits",
    isRead: false,
    type: "visit",
    data: {
      equipmentNumber: "MOKU-001",
      equipmentModel: "Canon imageRUNNER ADVANCE",
      customerName: "PT Maju Jaya",
      technicianName: "Andi Pratama",
      visitDate: "3 November 2026",
      visitType: "PMC",
      activityDescription:
        "Pemeriksaan unit, pembersihan komponen, dan pengecekan kualitas hasil cetak.",
    },
  },
  {
    id: "notif-002",
    title: "Equipment baru ditambahkan",
    description: "MOKU-005 telah ditambahkan ke daftar equipment.",
    detail:
      "Data equipment baru berhasil ditambahkan ke dalam sistem monitoring MOKU.",
    time: "1 jam lalu",
    createdAt: now - 60 * 60 * 1000,
    href: "/equipment",
    isRead: false,
    type: "equipment",
    data: {
      equipmentNumber: "MOKU-005",
      equipmentModel: "Ricoh IM 3500",
      customerName: "PT Sinar Abadi",
      changeDescription: "Equipment baru ditambahkan ke sistem.",
    },
  },
  {
    id: "notif-003",
    title: "Data pelanggan diperbarui",
    description: "Informasi PT Sinar Abadi telah diperbarui.",
    detail:
      "Perubahan informasi pelanggan berhasil disimpan ke dalam sistem.",
    time: "3 jam lalu",
    createdAt: now - 3 * 60 * 60 * 1000,
    href: "/customers",
    isRead: true,
    type: "customer",
    data: {
      customerName: "PT Sinar Abadi",
      customerAddress: "Jakarta Barat",
      customerContact: "021-5550001",
      changeDescription:
        "Informasi alamat dan kontak pelanggan telah diperbarui.",
    },
  },
  {
    id: "notif-004",
    title: "Monitoring belum dikunjungi",
    description: "MOKU-003 belum memiliki catatan kunjungan bulan ini.",
    detail:
      "Equipment masih berstatus aktif, tetapi belum ditemukan catatan kunjungan pada periode monitoring berjalan.",
    time: "Kemarin",
    createdAt: now - 24 * 60 * 60 * 1000,
    href: "/monitoring",
    isRead: true,
    type: "monitoring",
    data: {
      equipmentNumber: "MOKU-003",
      equipmentModel: "Canon imageRUNNER 2630i",
      customerName: "PT Sentosa",
      monitoringPeriod: "November 2026",
      monitoringStatus: "Belum Dikunjungi",
    },
  },
  {
    id: "notif-005",
    title: "Informasi akun diperbarui",
    description: "Informasi profil pengguna berhasil diperbarui.",
    detail:
      "Perubahan informasi akun telah berhasil disimpan.",
    time: "2 hari lalu",
    createdAt: now - 2 * 24 * 60 * 60 * 1000,
    href: "/profile",
    isRead: true,
    type: "user",
    data: {
      changeDescription: "Informasi profil pengguna diperbarui.",
    },
  },
];

function notifyUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(UPDATE_EVENT));
  }
}

export function loadNotifications(): NotificationItem[] {
  if (typeof window === "undefined") return demoNotifications;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(demoNotifications),
      );
      return demoNotifications;
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : demoNotifications;
  } catch {
    return demoNotifications;
  }
}

export function saveNotifications(
  notifications: NotificationItem[],
): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    notifyUpdate();
  } catch (error) {
    console.error("Gagal menyimpan notifikasi MOKU:", error);
  }
}

export function subscribeNotifications(
  callback: () => void,
): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(UPDATE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(UPDATE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function markNotificationAsRead(id: string): void {
  const notifications = loadNotifications();

  saveNotifications(
    notifications.map((item) =>
      item.id === id ? { ...item, isRead: true } : item,
    ),
  );
}

export function markAllNotificationsAsRead(): void {
  const notifications = loadNotifications();

  saveNotifications(
    notifications.map((item) => ({ ...item, isRead: true })),
  );
}

export function deleteNotification(
  id: string,
): DeletedNotification | null {
  const notifications = loadNotifications();
  const index = notifications.findIndex((item) => item.id === id);

  if (index === -1) return null;

  const [deletedItem] = notifications.splice(index, 1);

  saveNotifications(notifications);

  return {
    item: deletedItem,
    index,
  };
}

export function undoDeleteNotification(
  deleted: DeletedNotification,
): void {
  const notifications = loadNotifications();

  if (notifications.some((item) => item.id === deleted.item.id)) {
    return;
  }

  const restored = [...notifications];
  const safeIndex = Math.min(deleted.index, restored.length);

  restored.splice(safeIndex, 0, deleted.item);

  saveNotifications(restored);
}

export function getNotificationById(
  id: string,
): NotificationItem | undefined {
  return loadNotifications().find((item) => item.id === id);
}
