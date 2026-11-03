
"use client";

/* =========================================================
   NOTIFICATION TYPES
========================================================= */

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

/* =========================================================
   STORAGE CONFIGURATION
========================================================= */

const STORAGE_KEY = "moku_notifications";
const UPDATE_EVENT = "moku-notifications-updated";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const now = Date.now();

/* =========================================================
   DEMO NOTIFICATIONS
   15 DATA DUMMY
========================================================= */

export const demoNotifications: NotificationItem[] = [
  /* VISIT */
  {
    id: "notif-001",
    title: "Kunjungan berhasil dicatat",
    description:
      "Preventive Maintenance telah dicatat untuk MOKU-001.",
    detail:
      "Teknisi telah menyelesaikan kunjungan Preventive Maintenance dan menyimpan laporan aktivitas.",
    time: "10 menit lalu",
    createdAt: now - 10 * MINUTE,
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
    title: "Kunjungan berhasil dicatat",
    description:
      "Unscheduled Maintenance telah dicatat untuk MOKU-008.",
    detail:
      "Laporan kunjungan Unscheduled Maintenance berhasil disimpan.",
    time: "35 menit lalu",
    createdAt: now - 35 * MINUTE,
    href: "/visits",
    isRead: false,
    type: "visit",
    data: {
      equipmentNumber: "MOKU-008",
      equipmentModel: "Ricoh IM 5000",
      customerName: "PT Cipta Karya",
      technicianName: "Budi Santoso",
      visitDate: "3 November 2026",
      visitType: "UMC",
      activityDescription:
        "Pemeriksaan gangguan mesin dan penanganan masalah hasil cetak.",
    },
  },
  {
    id: "notif-003",
    title: "Kunjungan berhasil dicatat",
    description:
      "Preventive Maintenance telah dicatat untuk MOKU-012.",
    detail:
      "Kunjungan rutin berhasil dicatat oleh teknisi.",
    time: "2 jam lalu",
    createdAt: now - 2 * HOUR,
    href: "/visits",
    isRead: true,
    type: "visit",
    data: {
      equipmentNumber: "MOKU-012",
      equipmentModel: "Canon imageRUNNER 2630i",
      customerName: "PT Bina Usaha",
      technicianName: "Dedi Kurniawan",
      visitDate: "3 November 2026",
      visitType: "PMC",
      activityDescription:
        "Pembersihan unit dan pemeriksaan kondisi operasional mesin.",
    },
  },

  /* EQUIPMENT */
  {
    id: "notif-004",
    title: "Equipment baru ditambahkan",
    description:
      "MOKU-005 telah ditambahkan ke daftar equipment.",
    detail:
      "Data equipment baru berhasil ditambahkan ke sistem monitoring MOKU.",
    time: "1 jam lalu",
    createdAt: now - HOUR,
    href: "/equipment",
    isRead: false,
    type: "equipment",
    data: {
      equipmentNumber: "MOKU-005",
      equipmentModel: "Ricoh IM 3500",
      customerName: "PT Sinar Abadi",
      changeDescription:
        "Equipment baru ditambahkan ke dalam sistem.",
    },
  },
  {
    id: "notif-005",
    title: "Data equipment diperbarui",
    description:
      "Informasi equipment MOKU-009 telah diperbarui.",
    detail:
      "Perubahan data equipment berhasil disimpan.",
    time: "4 jam lalu",
    createdAt: now - 4 * HOUR,
    href: "/equipment",
    isRead: true,
    type: "equipment",
    data: {
      equipmentNumber: "MOKU-009",
      equipmentModel: "Canon imageRUNNER ADVANCE DX",
      customerName: "PT Karya Mandiri",
      changeDescription:
        "Informasi model dan data equipment diperbarui.",
    },
  },
  {
    id: "notif-006",
    title: "Equipment dinonaktifkan",
    description:
      "Equipment MOKU-014 telah diubah menjadi tidak aktif.",
    detail:
      "Status equipment berhasil diperbarui.",
    time: "Kemarin",
    createdAt: now - DAY,
    href: "/equipment",
    isRead: true,
    type: "equipment",
    data: {
      equipmentNumber: "MOKU-014",
      equipmentModel: "Ricoh MP 4055",
      customerName: "PT Global Niaga",
      changeDescription:
        "Status equipment diubah menjadi Inactive.",
    },
  },

  /* CUSTOMER */
  {
    id: "notif-007",
    title: "Data pelanggan diperbarui",
    description:
      "Informasi PT Sinar Abadi telah diperbarui.",
    detail:
      "Perubahan informasi pelanggan berhasil disimpan ke dalam sistem.",
    time: "3 jam lalu",
    createdAt: now - 3 * HOUR,
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
    id: "notif-008",
    title: "Pelanggan baru ditambahkan",
    description:
      "PT Mitra Sejahtera telah ditambahkan ke daftar pelanggan.",
    detail:
      "Data pelanggan baru berhasil disimpan.",
    time: "6 jam lalu",
    createdAt: now - 6 * HOUR,
    href: "/customers",
    isRead: false,
    type: "customer",
    data: {
      customerName: "PT Mitra Sejahtera",
      customerAddress: "Jakarta Selatan",
      customerContact: "021-5550022",
      changeDescription:
        "Data pelanggan baru ditambahkan ke sistem.",
    },
  },

  /* MONITORING */
  {
    id: "notif-009",
    title: "Monitoring belum dikunjungi",
    description:
      "MOKU-003 belum memiliki catatan kunjungan bulan ini.",
    detail:
      "Equipment masih berstatus aktif, tetapi belum ditemukan catatan kunjungan pada periode monitoring berjalan.",
    time: "Kemarin",
    createdAt: now - DAY,
    href: "/monitoring",
    isRead: false,
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
    id: "notif-010",
    title: "Monitoring equipment diperbarui",
    description:
      "Status kunjungan MOKU-002 telah berubah menjadi Visited.",
    detail:
      "Monitoring diperbarui setelah kunjungan berhasil dicatat.",
    time: "5 jam lalu",
    createdAt: now - 5 * HOUR,
    href: "/monitoring",
    isRead: true,
    type: "monitoring",
    data: {
      equipmentNumber: "MOKU-002",
      equipmentModel: "Canon imageRUNNER ADVANCE",
      customerName: "PT Maju Bersama",
      monitoringPeriod: "November 2026",
      monitoringStatus: "Visited",
      changeDescription:
        "Status monitoring berubah dari Not Visited menjadi Visited.",
    },
  },
  {
    id: "notif-011",
    title: "Monitoring bulanan dimulai",
    description:
      "Periode monitoring November 2026 telah dimulai.",
    detail:
      "Periode monitoring baru telah tersedia untuk equipment aktif.",
    time: "2 hari lalu",
    createdAt: now - 2 * DAY,
    href: "/monitoring",
    isRead: true,
    type: "monitoring",
    data: {
      monitoringPeriod: "November 2026",
      monitoringStatus: "Periode Aktif",
      changeDescription:
        "Monitoring bulanan dimulai untuk seluruh equipment aktif.",
    },
  },

  /* USER */
  {
    id: "notif-012",
    title: "Informasi akun diperbarui",
    description:
      "Informasi profil pengguna berhasil diperbarui.",
    detail:
      "Perubahan informasi akun telah berhasil disimpan.",
    time: "2 hari lalu",
    createdAt: now - 2 * DAY,
    href: "/profile",
    isRead: true,
    type: "user",
    data: {
      changeDescription:
        "Informasi profil pengguna diperbarui.",
    },
  },
  {
    id: "notif-013",
    title: "Informasi keamanan akun",
    description:
      "Pengaturan keamanan akun berhasil diperbarui.",
    detail:
      "Perubahan pengaturan keamanan akun berhasil disimpan.",
    time: "3 hari lalu",
    createdAt: now - 3 * DAY,
    href: "/profile",
    isRead: false,
    type: "user",
    data: {
      changeDescription:
        "Pengaturan keamanan akun diperbarui.",
    },
  },

  /* GENERAL */
  {
    id: "notif-014",
    title: "Selamat datang di MOKU",
    description:
      "Mulai pantau aktivitas kunjungan equipment melalui MOKU.",
    detail:
      "MOKU membantu memantau aktivitas kunjungan dan monitoring equipment secara terstruktur.",
    time: "4 hari lalu",
    createdAt: now - 4 * DAY,
    href: "/",
    isRead: true,
    type: "general",
    data: {
      changeDescription:
        "Informasi pengenalan aplikasi MOKU.",
    },
  },
  {
    id: "notif-015",
    title: "Informasi sistem",
    description:
      "Data monitoring dapat dilihat berdasarkan periode bulanan.",
    detail:
      "Gunakan filter periode untuk melihat riwayat monitoring equipment pada bulan sebelumnya.",
    time: "5 hari lalu",
    createdAt: now - 5 * DAY,
    href: "/monitoring",
    isRead: false,
    type: "general",
    data: {
      changeDescription:
        "Informasi penggunaan filter periode monitoring.",
    },
  },
];

/* =========================================================
   INTERNAL HELPERS
========================================================= */

function notifyUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(UPDATE_EVENT));
  }
}

/* =========================================================
   LOAD NOTIFICATIONS
========================================================= */

export function loadNotifications(): NotificationItem[] {
  if (typeof window === "undefined") {
    return demoNotifications;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(demoNotifications)
      );

      return demoNotifications;
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(demoNotifications)
      );

      return demoNotifications;
    }

    return parsed as NotificationItem[];
  } catch (error) {
    console.error("Gagal membaca notifikasi MOKU:", error);
    return [];
  }
}

/* =========================================================
   SAVE NOTIFICATIONS
========================================================= */

export function saveNotifications(
  notifications: NotificationItem[]
): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(notifications)
    );

    notifyUpdate();
  } catch (error) {
    console.error("Gagal menyimpan notifikasi MOKU:", error);
  }
}

/* =========================================================
   SUBSCRIBE NOTIFICATION UPDATES
========================================================= */

export function subscribeNotifications(
  callback: () => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(UPDATE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(UPDATE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/* =========================================================
   MARK ONE NOTIFICATION AS READ
========================================================= */

export function markNotificationAsRead(id: string): void {
  const notifications = loadNotifications();

  saveNotifications(
    notifications.map((item) =>
      item.id === id
        ? { ...item, isRead: true }
        : item
    )
  );
}

/* =========================================================
   MARK ALL NOTIFICATIONS AS READ
========================================================= */

export function markAllNotificationsAsRead(): void {
  const notifications = loadNotifications();

  saveNotifications(
    notifications.map((item) => ({
      ...item,
      isRead: true,
    }))
  );
}

/* =========================================================
   DELETE ONE NOTIFICATION
========================================================= */

export function deleteNotification(
  id: string
): DeletedNotification | null {
  const notifications = loadNotifications();

  const index = notifications.findIndex(
    (item) => item.id === id
  );

  if (index === -1) return null;

  const deletedItem = notifications[index];

  const remaining = notifications.filter(
    (item) => item.id !== id
  );

  saveNotifications(remaining);

  return {
    item: deletedItem,
    index,
  };
}

/* =========================================================
   DELETE MULTIPLE NOTIFICATIONS
========================================================= */

export function deleteNotifications(
  ids: string[]
): DeletedNotification[] {
  if (ids.length === 0) return [];

  const notifications = loadNotifications();
  const selectedIds = new Set(ids);

  const deleted: DeletedNotification[] = [];

  notifications.forEach((item, index) => {
    if (selectedIds.has(item.id)) {
      deleted.push({
        item,
        index,
      });
    }
  });

  if (deleted.length === 0) return [];

  const remaining = notifications.filter(
    (item) => !selectedIds.has(item.id)
  );

  saveNotifications(remaining);

  return deleted;
}

/* =========================================================
   DELETE ALL NOTIFICATIONS
========================================================= */

export function deleteAllNotifications(): DeletedNotification[] {
  const notifications = loadNotifications();

  if (notifications.length === 0) return [];

  const deleted = notifications.map((item, index) => ({
    item,
    index,
  }));

  saveNotifications([]);

  return deleted;
}

/* =========================================================
   UNDO DELETE ONE NOTIFICATION
========================================================= */

export function undoDeleteNotification(
  deleted: DeletedNotification
): void {
  undoDeleteNotifications([deleted]);
}

/* =========================================================
   UNDO DELETE MULTIPLE NOTIFICATIONS
========================================================= */

export function undoDeleteNotifications(
  deleted: DeletedNotification[]
): void {
  if (deleted.length === 0) return;

  const notifications = loadNotifications();

  const existingIds = new Set(
    notifications.map((item) => item.id)
  );

  const itemsToRestore = deleted
    .filter(({ item }) => !existingIds.has(item.id))
    .sort((a, b) => a.index - b.index);

  if (itemsToRestore.length === 0) return;

  const restored = [...notifications];

  itemsToRestore.forEach(({ item, index }) => {
    const safeIndex = Math.min(
      Math.max(index, 0),
      restored.length
    );

    restored.splice(safeIndex, 0, item);
  });

  saveNotifications(restored);
}

/* =========================================================
   GET NOTIFICATION BY ID
========================================================= */

export function getNotificationById(
  id: string
): NotificationItem | undefined {
  return loadNotifications().find(
    (item) => item.id === id
  );
}
