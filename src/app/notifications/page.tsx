
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  ClipboardText,
  Monitor,
  Trash,
  User,
  Wrench,
  X,
} from "@phosphor-icons/react";

type NotificationType = "visit" | "equipment" | "user" | "general";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  detail: string;
  time: string;
  date: string;
  type: NotificationType;
  isRead: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "NOT-001",
    title: "Kunjungan berhasil dicatat",
    description: "PMC · MOKU-001 · PT Maju Jaya",
    detail:
      "Kunjungan Preventive Maintenance untuk equipment MOKU-001 telah berhasil dicatat oleh Andi Pratama. Data kunjungan tersimpan dalam riwayat kunjungan.",
    time: "5 menit lalu",
    date: "Hari ini",
    type: "visit",
    isRead: false,
  },
  {
    id: "NOT-002",
    title: "Equipment baru ditambahkan",
    description: "MOKU-012 · Canon imageRUNNER",
    detail:
      "Equipment MOKU-012 dengan model Canon imageRUNNER telah ditambahkan ke dalam data equipment MOKU.",
    time: "1 jam lalu",
    date: "Hari ini",
    type: "equipment",
    isRead: false,
  },
  {
    id: "NOT-003",
    title: "Informasi pengguna diperbarui",
    description: "Profil Andi Pratama telah diperbarui",
    detail:
      "Informasi profil pengguna Andi Pratama telah diperbarui. Perubahan informasi akun berhasil disimpan.",
    time: "Kemarin, 15:30",
    date: "Kemarin",
    type: "user",
    isRead: false,
  },
  {
    id: "NOT-004",
    title: "Monitoring bulanan diperbarui",
    description: "Periode November 2026",
    detail:
      "Data monitoring kunjungan equipment untuk periode November 2026 telah diperbarui berdasarkan aktivitas kunjungan terbaru.",
    time: "Kemarin, 10:15",
    date: "Kemarin",
    type: "general",
    isRead: true,
  },
  {
    id: "NOT-005",
    title: "Riwayat kunjungan tersimpan",
    description: "UMC · MOKU-002 · PT Sinar Abadi",
    detail:
      "Kunjungan Unscheduled Maintenance untuk equipment MOKU-002 telah berhasil disimpan ke dalam riwayat kunjungan.",
    time: "30 Oktober 2026",
    date: "Sebelumnya",
    type: "visit",
    isRead: true,
  },
];

const notificationConfig = {
  visit: {
    label: "Kunjungan",
    icon: Wrench,
    style: "bg-primary-light text-primary",
  },
  equipment: {
    label: "Equipment",
    icon: Monitor,
    style: "bg-orange-50 text-orange-600",
  },
  user: {
    label: "Pengguna",
    icon: User,
    style: "bg-surface-secondary text-muted",
  },
  general: {
    label: "Monitoring",
    icon: ClipboardText,
    style: "bg-surface-secondary text-muted",
  },
};

type FilterType = "all" | "unread";

export default function NotificationsPage() {
  const router = useRouter();

  const [items, setItems] = useState(initialNotifications);
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const unreadCount = items.filter((item) => !item.isRead).length;

  const filteredItems = items.filter((item) =>
    filter === "unread" ? !item.isRead : true
  );

  const markAsRead = (id: string) => {
    setItems((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, isRead: true } : item
      )
    );
  };

  const markAllAsRead = () => {
    setItems((previous) =>
      previous.map((item) => ({ ...item, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setItems((previous) => previous.filter((item) => item.id !== id));

    if (expandedId === id) {
      setExpandedId(null);
    }
  };

  const deleteAllNotifications = () => {
    setItems([]);
    setExpandedId(null);
  };

  const toggleNotification = (item: NotificationItem) => {
    setExpandedId((previous) =>
      previous === item.id ? null : item.id
    );

    if (!item.isRead) {
      markAsRead(item.id);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

        {/* MOBILE SUBPAGE HEADER */}
        <div className="mb-6 flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Kembali"
            className="
              flex h-10 w-10 shrink-0 items-center justify-center
              rounded-xl border border-border/70
              text-foreground transition-colors
              hover:bg-primary-light hover:text-primary
            "
          >
            <ArrowLeft size={21} />
          </button>

          <div className="min-w-0">
            <h1 className="text-lg font-bold text-foreground">
              Notifikasi
            </h1>
            <p className="text-xs text-muted">
              Informasi aktivitas MOKU
            </p>
          </div>
        </div>

        {/* DESKTOP PAGE HEADER */}
        <div className="mb-7 hidden items-start justify-between gap-4 md:flex">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Notifikasi
            </h1>
            <p className="mt-1 text-sm text-muted">
              Pantau informasi dan aktivitas terbaru MOKU.
            </p>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
              <Bell size={22} weight="duotone" />
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">
                {unreadCount} belum dibaca
              </p>
              <p className="text-xs text-muted">
                Dari {items.length} notifikasi
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="
                  flex items-center gap-1.5 rounded-lg
                  border border-border bg-surface
                  px-3 py-2 text-xs font-medium text-foreground
                  transition-colors hover:bg-primary-light hover:text-primary
                "
              >
                <CheckCheck size={16} />
                <span className="hidden sm:inline">
                  Tandai semua dibaca
                </span>
                <span className="sm:hidden">Baca semua</span>
              </button>
            )}

            {items.length > 0 && (
              <button
                type="button"
                onClick={deleteAllNotifications}
                className="
                  flex items-center gap-1.5 rounded-lg
                  border border-border bg-surface
                  px-3 py-2 text-xs font-medium text-muted
                  transition-colors hover:border-danger/30
                  hover:bg-danger/5 hover:text-danger
                "
              >
                <Trash size={16} />
                Hapus semua
              </button>
            )}
          </div>
        </div>

        {/* FILTER */}
        <div className="mb-4 flex items-center gap-2 border-b border-border/70">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`
              relative px-4 py-3 text-xs font-semibold transition-colors
              ${
                filter === "all"
                  ? "text-primary"
                  : "text-muted hover:text-foreground"
              }
            `}
          >
            Semua
            {filter === "all" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`
              relative px-4 py-3 text-xs font-semibold transition-colors
              ${
                filter === "unread"
                  ? "text-primary"
                  : "text-muted hover:text-foreground"
              }
            `}
          >
            Belum dibaca
            {filter === "unread" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
            )}
          </button>
        </div>

        {/* NOTIFICATION LIST */}
        {filteredItems.length > 0 ? (
          <div className="divide-y divide-border/70">
            {filteredItems.map((item) => {
              const config = notificationConfig[item.type];
              const Icon = config.icon;
              const isExpanded = expandedId === item.id;

              return (
                <article
                  key={item.id}
                  className={`
                    py-4 transition-colors duration-200
                    ${
                      !item.isRead
                        ? "bg-primary/[0.025]"
                        : "bg-transparent"
                    }
                  `}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* ICON */}
                    <div
                      className={`
                        flex h-10 w-10 shrink-0 items-center
                        justify-center rounded-xl
                        ${config.style}
                      `}
                    >
                      <Icon size={20} weight="duotone" />
                    </div>

                    {/* CONTENT */}
                    <button
                      type="button"
                      onClick={() => toggleNotification(item)}
                      aria-expanded={isExpanded}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={`
                            text-sm text-foreground
                            ${
                              !item.isRead
                                ? "font-bold"
                                : "font-medium"
                            }
                          `}
                        >
                          {item.title}
                        </p>

                        {!item.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>

                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        {item.description}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] text-muted">
                          {item.time}
                        </span>

                        <span className="text-[10px] text-muted">
                          ·
                        </span>

                        <span className="text-[10px] text-muted">
                          {config.label}
                        </span>

                        <span
                          className={`
                            ml-auto flex items-center gap-1
                            text-[10px] font-medium
                            ${
                              isExpanded
                                ? "text-primary"
                                : "text-muted"
                            }
                          `}
                        >
                          {isExpanded ? "Tutup detail" : "Lihat detail"}
                          <ChevronRight
                            size={13}
                            className={`
                              transition-transform duration-200
                              ${isExpanded ? "rotate-90" : ""}
                            `}
                          />
                        </span>
                      </div>
                    </button>

                    {/* DELETE */}
                    <button
                      type="button"
                      onClick={() => deleteNotification(item.id)}
                      aria-label={`Hapus ${item.title}`}
                      title="Hapus notifikasi"
                      className="
                        flex h-9 w-9 shrink-0 items-center
                        justify-center rounded-lg text-muted
                        transition-colors hover:bg-danger/5
                        hover:text-danger
                      "
                    >
                      <Trash size={17} />
                    </button>
                  </div>

                  {/* EXPANDED DETAIL */}
                  <div
                    className={`
                      grid transition-all duration-200 ease-out
                      ${
                        isExpanded
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }
                    `}
                  >
                    <div className="overflow-hidden">
                      <div className="ml-[52px] mr-2 mt-3 rounded-xl border border-border/70 bg-surface p-3 sm:ml-[56px]">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                          Detail aktivitas
                        </p>

                        <p className="mt-2 text-xs leading-relaxed text-foreground">
                          {item.detail}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] text-muted">
                            ID: {item.id}
                          </span>

                          <button
                            type="button"
                            onClick={() => deleteNotification(item.id)}
                            className="
                              flex items-center gap-1.5
                              rounded-md px-2 py-1.5
                              text-[11px] font-medium text-danger
                              transition-colors hover:bg-danger/5
                            "
                          >
                            <Trash size={14} />
                            Hapus notifikasi
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <Bell size={30} weight="duotone" />
            </div>

            <h2 className="text-sm font-semibold text-foreground">
              {items.length === 0
                ? "Belum ada notifikasi"
                : "Semua notifikasi sudah dibaca"}
            </h2>

            <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted">
              {items.length === 0
                ? "Aktivitas terbaru MOKU akan muncul di sini."
                : "Tidak ada notifikasi yang perlu ditampilkan pada filter ini."}
            </p>

            {filter === "unread" && items.length > 0 && (
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="mt-4 text-xs font-semibold text-primary hover:underline"
              >
                Lihat semua notifikasi
              </button>
            )}
          </div>
        )}

        {/* DEMO RESET */}
        {items.length === 0 && (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setItems(initialNotifications);
                setFilter("all");
                setExpandedId(null);
              }}
              className="
                rounded-lg border border-border bg-surface
                px-4 py-2.5 text-xs font-medium text-foreground
                transition-colors hover:bg-primary-light
                hover:text-primary
              "
            >
              Reset contoh notifikasi
            </button>
          </div>
        )}

        {/* DEMO NOTICE */}
        <div className="mt-8 flex items-start gap-2 rounded-lg border border-border/70 bg-surface/60 px-3 py-3">
          <Bell size={16} className="mt-0.5 shrink-0 text-muted" />
          <p className="text-[10px] leading-relaxed text-muted">
            Ini adalah data demonstrasi. Perubahan baca dan hapus hanya
            berlaku sementara di halaman ini dan akan kembali ke data
            awal saat halaman dimuat ulang.
          </p>
        </div>
      </div>
    </main>
  );
}
