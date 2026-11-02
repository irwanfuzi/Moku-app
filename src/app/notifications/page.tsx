
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  CaretDown,
  CaretUp,
  Check,
  CheckCircle,
  ClipboardText,
  Info,
  Monitor,
  Trash,
  User,
  Users,
  Wrench,
} from "@phosphor-icons/react";

import {
  demoNotifications,
  loadNotifications,
  saveNotifications,
  subscribeNotifications,
  type NotificationItem,
} from "@/lib/notification-store";

/* =========================================================
   NOTIFICATION ICONS
========================================================= */

const iconMap = {
  visit: Wrench,
  equipment: Monitor,
  customer: Users,
  user: User,
  monitoring: ClipboardText,
  general: Bell,
} satisfies Record<NotificationItem["type"], typeof Bell>;

const iconColorMap = {
  visit: "bg-primary/10 text-primary",
  equipment: "bg-orange-50 text-orange-600",
  customer: "bg-sky-50 text-sky-600",
  user: "bg-violet-50 text-violet-600",
  monitoring: "bg-amber-50 text-amber-700",
  general: "bg-muted text-muted-foreground",
} satisfies Record<NotificationItem["type"], string>;

const detailLabels: Record<string, string> = {
  equipmentNumber: "Nomor Equipment",
  equipmentModel: "Model Mesin",
  customerName: "Pelanggan",
  technicianName: "Teknisi",
  visitDate: "Tanggal Kunjungan",
  visitType: "Jenis Kunjungan",
  activityDescription: "Deskripsi Aktivitas",
  customerAddress: "Alamat Pelanggan",
  customerContact: "Kontak Pelanggan",
  monitoringPeriod: "Periode Monitoring",
  monitoringStatus: "Status Monitoring",
  changeDescription: "Perubahan",
};

/* =========================================================
   NOTIFICATIONS PAGE
========================================================= */

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);

  const [activeFilter, setActiveFilter] = useState<
    "all" | "unread"
  >("all");

  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* =======================================================
     SYNC NOTIFICATIONS
  ======================================================= */

  useEffect(() => {
    const syncNotifications = () => {
      setNotifications(loadNotifications());
    };

    syncNotifications();

    return subscribeNotifications(syncNotifications);
  }, []);

  /* =======================================================
     FILTER & COUNTS
  ======================================================= */

  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  const filteredNotifications = notifications.filter((item) =>
    activeFilter === "unread" ? !item.isRead : true
  );

  /* =======================================================
     NOTIFICATION ACTIONS
  ======================================================= */

  const markAsRead = (id: string) => {
    const updated = notifications.map((item) =>
      item.id === id ? { ...item, isRead: true } : item
    );

    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    saveNotifications(
      notifications.map((item) => ({
        ...item,
        isRead: true,
      }))
    );
  };

  const deleteNotification = (id: string) => {
    saveNotifications(
      notifications.filter((item) => item.id !== id)
    );

    if (expandedId === id) {
      setExpandedId(null);
    }
  };

  const deleteAllNotifications = () => {
    saveNotifications([]);
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

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-white">
      <div className="page-enter mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 lg:px-8">

        {/* MOBILE TITLE */}
        <div className="mb-6 flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Kembali"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white transition-colors hover:bg-[#F1F2F5]"
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

        {/* DESKTOP TITLE */}
        <div className="mb-7 hidden lg:block">
          <h1 className="text-2xl font-semibold text-foreground">
            Notifikasi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aktivitas dan informasi terbaru dari MOKU.
          </p>
        </div>

        {/* SUMMARY */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
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
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[#F1F2F5] disabled:cursor-not-allowed disabled:opacity-40"
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

        {/* FILTER */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex rounded-lg bg-[#F1F2F5] p-1">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === "all"
                  ? "bg-white text-foreground shadow-sm"
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
                  ? "bg-white text-foreground shadow-sm"
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

        {/* NOTIFICATION LIST */}
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredNotifications.map((item) => {
                const Icon = iconMap[item.type];
                const isExpanded = expandedId === item.id;

                const detailEntries = item.detail
                  ? Object.entries(item.detail).filter(
                      ([, value]) =>
                        typeof value === "string" &&
                        value.trim().length > 0
                    )
                  : [];

                return (
                  <div
                    key={item.id}
                    className={`transition-colors ${
                      !item.isRead ? "bg-primary/[0.025]" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
                      {/* ICON */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconColorMap[item.type]}`}
                      >
                        <Icon size={20} weight="duotone" />
                      </div>

                      {/* CONTENT */}
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

                      {/* ACTIONS */}
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
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[#F1F2F5]"
                        >
                          {isExpanded ? (
                            <CaretUp size={18} />
                          ) : (
                            <CaretDown size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED DETAIL */}
                    {isExpanded && (
                      <div className="border-t border-border bg-[#F8F8F9] px-4 py-4 sm:px-5 sm:pl-[4.75rem]">
                        {detailEntries.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {detailEntries.map(([key, value]) => (
                              <div
                                key={key}
                                className="min-w-0"
                              >
                                <p className="text-xs font-medium text-muted-foreground">
                                  {detailLabels[key] ?? key}
                                </p>
                                <p className="mt-1 break-words text-sm leading-relaxed text-foreground">
                                  {value}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <Info
                              size={17}
                              className="mt-0.5 shrink-0 text-muted-foreground"
                            />
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              Tidak ada informasi detail tambahan untuk notifikasi ini.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F2F5] text-muted-foreground">
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
                    saveNotifications(demoNotifications);
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

        {/* FOOTER */}
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
