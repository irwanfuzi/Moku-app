
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Check,
  ClipboardText,
  Monitor,
  Wrench,
  User,
  Trash,
  CaretDown,
  CaretUp,
  X,
  Info,
  CheckCircle,
  Package,
} from "@phosphor-icons/react";

type NotificationType =
  | "visit"
  | "equipment"
  | "user"
  | "monitoring"
  | "general";

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  detail: string;
  time: string;
  type: NotificationType;
  isRead: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "Kunjungan berhasil dicatat",
    description: "Preventive Maintenance - MOKU-001",
    detail:
      "Kunjungan Preventive Maintenance untuk mesin MOKU-001 milik PT Maju Jaya berhasil dicatat. Data kunjungan telah masuk ke riwayat monitoring.",
    time: "5 menit yang lalu",
    type: "visit",
    isRead: false,
  },
  {
    id: 2,
    title: "Peralatan baru ditambahkan",
    description: "MOKU-012 - Canon imageRUNNER",
    detail:
      "Peralatan MOKU-012 dengan model Canon imageRUNNER telah ditambahkan ke dalam daftar peralatan.",
    time: "1 jam yang lalu",
    type: "equipment",
    isRead: false,
  },
  {
    id: 3,
    title: "Informasi pengguna diperbarui",
    description: "Andi Pratama",
    detail:
      "Informasi akun pengguna Andi Pratama telah diperbarui.",
    time: "3 jam yang lalu",
    type: "user",
    isRead: true,
  },
  {
    id: 4,
    title: "Monitoring bulanan diperbarui",
    description: "Periode November 2026",
    detail:
      "Data monitoring kunjungan untuk periode November 2026 telah diperbarui berdasarkan aktivitas kunjungan yang tercatat.",
    time: "Kemarin",
    type: "monitoring",
    isRead: true,
  },
  {
    id: 5,
    title: "Kunjungan berhasil dicatat",
    description: "Unscheduled Maintenance - MOKU-002",
    detail:
      "Kunjungan Unscheduled Maintenance untuk mesin MOKU-002 milik PT Sinar Abadi berhasil dicatat.",
    time: "2 hari yang lalu",
    type: "visit",
    isRead: true,
  },
];

const iconMap = {
  visit: Wrench,
  equipment: Monitor,
  user: User,
  monitoring: ClipboardText,
  general: Bell,
};

const iconColorMap = {
  visit: "text-primary bg-primary/10",
  equipment: "text-blue-600 bg-blue-50",
  user: "text-violet-600 bg-violet-50",
  monitoring: "text-amber-600 bg-amber-50",
  general: "text-muted-foreground bg-muted",
};

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState(
    initialNotifications
  );
  const [activeFilter, setActiveFilter] = useState<
    "all" | "unread"
  >("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  const filteredNotifications = notifications.filter((item) =>
    activeFilter === "unread" ? !item.isRead : true
  );

  const markAsRead = (id: number) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, isRead: true } : item
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, isRead: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications((current) =>
      current.filter((item) => item.id !== id)
    );

    if (expandedId === id) {
      setExpandedId(null);
    }
  };

  const deleteAllNotifications = () => {
    setNotifications([]);
    setExpandedId(null);
  };

  const toggleNotification = (item: NotificationItem) => {
    setExpandedId((current) =>
      current === item.id ? null : item.id
    );

    if (!item.isRead) {
      markAsRead(item.id);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="page-enter mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
        {/* Mobile heading */}
        <div className="mb-6 flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Kembali"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition-colors hover:bg-muted"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Notifikasi
            </h1>
            <p className="text-xs text-muted-foreground">
              Aktivitas dan informasi terbaru
            </p>
          </div>
        </div>

        {/* Desktop heading */}
        <div className="mb-7 hidden lg:block">
          <h1 className="text-2xl font-semibold text-foreground">
            Notifikasi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aktivitas dan informasi terbaru dari MOKU.
          </p>
        </div>

        {/* Summary */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-background p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bell size={22} weight="duotone" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Belum dibaca
              </p>
              <p className="text-2xl font-semibold tabular-nums text-foreground">
                {unreadCount}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check size={17} />
              Tandai semua dibaca
            </button>

            <button
              type="button"
              onClick={deleteAllNotifications}
              disabled={notifications.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash size={17} />
              Hapus semua
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("unread")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === "unread"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Belum dibaca
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-primary px-1.5 py-0.5 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <span className="text-xs text-muted-foreground">
            {filteredNotifications.length} notifikasi
          </span>
        </div>

        {/* Notification list */}
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredNotifications.map((item) => {
                const Icon = iconMap[item.type];
                const isExpanded = expandedId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`transition-colors ${
                      !item.isRead ? "bg-primary/[0.025]" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          iconColorMap[item.type]
                        }`}
                      >
                        <Icon size={20} weight="duotone" />
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleNotification(item)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {item.title}
                          </p>

                          {!item.isRead && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.description}
                        </p>

                        <p className="mt-2 text-xs text-muted-foreground">
                          {item.time}
                        </p>
                      </button>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            deleteNotification(item.id)
                          }
                          aria-label="Hapus notifikasi"
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleNotification(item)}
                          aria-label={
                            isExpanded
                              ? "Tutup detail"
                              : "Lihat detail"
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
                        >
                          {isExpanded ? (
                            <CaretUp size={18} />
                          ) : (
                            <CaretDown size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-border bg-muted/30 px-4 py-4 sm:px-5 sm:pl-[4.75rem]">
                        <div className="flex items-start gap-2">
                          <Info
                            size={17}
                            className="mt-0.5 shrink-0 text-muted-foreground"
                          />
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                {activeFilter === "unread" ? (
                  <CheckCircle size={28} weight="duotone" />
                ) : (
                  <Bell size={28} weight="duotone" />
                )}
              </div>

              <h3 className="text-base font-semibold text-foreground">
                {activeFilter === "unread"
                  ? "Semua sudah dibaca"
                  : "Belum ada notifikasi"}
              </h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {activeFilter === "unread"
                  ? "Tidak ada notifikasi yang perlu dibaca."
                  : "Aktivitas terbaru akan muncul di sini."}
              </p>

              {notifications.length === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setNotifications(initialNotifications);
                    setActiveFilter("all");
                  }}
                  className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  Muat ulang data demo
                </button>
              )}
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Data notifikasi saat ini merupakan data demo untuk pengujian
          tampilan.
        </p>
      </div>

      <style jsx>{`
        .page-enter {
          animation: notification-enter 220ms ease-out both;
        }

        @keyframes notification-enter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .page-enter {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
