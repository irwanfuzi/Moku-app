import { useEffect, useMemo, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  CalendarBlank,
  CheckCircle,
  Clock,
  Info,
  Monitor,
  User,
  Users,
  Warning,
  Wrench,
} from "@phosphor-icons/react";
import { useAppLayout } from "@/components/layout/app-shell";
import {
  loadNotifications,
  markNotificationAsRead,
  subscribeNotifications,
  type NotificationItem,
} from "@/lib/notification-store";
import { useEffect as useReactEffect, useState } from "react";

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

const typeLabelMap: Record<NotificationItem["type"], string> = {
  visit: "Aktivitas Kunjungan",
  equipment: "Data Mesin",
  customer: "Data Pelanggan",
  user: "Akun Pengguna",
  monitoring: "Status Monitoring",
  general: "Informasi Umum",
};

const typeIconMap = {
  visit: Wrench,
  equipment: Monitor,
  customer: Users,
  user: User,
  monitoring: Warning,
  general: Bell,
} satisfies Record<NotificationItem["type"], typeof Bell>;

const visitTypeLabels: Record<string, string> = {
  IND: "Driver Installation",
  INS: "Installation",
  DIS: "Dismantle",
  PMC: "Preventive Maintenance",
  UMC: "Unscheduled Maintenance",
};

function formatFullDateTime(item: NotificationItem): string {
  const raw = item.createdAt;
  if (raw !== null && raw !== undefined && raw !== "") {
    const date =
      raw instanceof Date
        ? raw
        : typeof raw === "number"
          ? new Date(raw)
          : new Date(String(raw));
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
        .format(date)
        .replace(".", ":");
    }
  }
  return item.time ?? "Baru saja";
}

function getDetailBody(item: NotificationItem): string {
  const data = item.data;
  const equipment = data?.equipmentNumber ? String(data.equipmentNumber) : "";
  const customer = data?.customerName ? String(data.customerName) : "";
  const activityDescription = data?.activityDescription
    ? String(data.activityDescription).trim()
    : "";
  const changeDescription = data?.changeDescription
    ? String(data.changeDescription).trim()
    : "";
  const monitoringPeriod = data?.monitoringPeriod
    ? String(data.monitoringPeriod).trim()
    : "";
  const visitType = data?.visitType
    ? visitTypeLabels[String(data.visitType).toUpperCase()] ??
      String(data.visitType)
    : "";

  if (activityDescription) return activityDescription;
  if (changeDescription) return changeDescription;
  if (item.description?.trim()) return item.description.trim();

  const parts: string[] = [];
  if (visitType) parts.push(`Jenis aktivitas: ${visitType}.`);
  if (equipment) parts.push(`Kode unit: ${equipment}.`);
  if (customer) parts.push(`Pelanggan: ${customer}.`);
  if (monitoringPeriod) parts.push(`Periode monitoring: ${monitoringPeriod}.`);

  return parts.length > 0
    ? parts.join(" ")
    : "Detail informasi notifikasi telah tercatat dalam sistem operasional MOKU.";
}

function getTargetRoute(item: NotificationItem): {
  to: string;
  label: string;
} | null {
  const equipment = item.data?.equipmentNumber
    ? String(item.data.equipmentNumber)
    : "";

  if (item.type === "monitoring") {
    return { to: "/monitoring", label: "Buka Halaman Monitoring" };
  }
  if (item.type === "equipment") {
    return {
      to: equipment ? `/equipment/${encodeURIComponent(equipment)}` : "/equipment",
      label: equipment ? `Lihat Mesin ${equipment}` : "Buka Daftar Mesin",
    };
  }
  if (item.type === "visit") {
    return { to: "/visit-history", label: "Lihat Riwayat Kunjungan" };
  }
  return null;
}

export default function NotificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isMobile, isReady, backWithTransition } = useAppLayout();

  const decodedId = useMemo(() => {
    if (!id) return "";
    try {
      return decodeURIComponent(id);
    } catch {
      return id;
    }
  }, [id]);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    typeof window !== "undefined" ? loadNotifications() : []
  );

  useReactEffect(() => {
    const sync = () => setNotifications(loadNotifications());
    sync();
    return subscribeNotifications(sync);
  }, []);

  const item = useMemo(
    () => notifications.find((entry) => entry.id === decodedId) ?? null,
    [notifications, decodedId]
  );

  useEffect(() => {
    if (!item || item.isRead) return;
    markNotificationAsRead(item.id);
  }, [item]);

  const isMobileView = !isReady || isMobile;

  useEffect(() => {
    if (!isMobileView) return;
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((meta) => meta.setAttribute("content", "#83051C"));
  }, [isMobileView]);

  const handleBack = () => {
    backWithTransition("/notifications");
  };

  if (isMobileView) {
    const Icon = item ? typeIconMap[item.type] ?? Bell : Info;
    const targetRoute = item ? getTargetRoute(item) : null;

    return (
      <main
        style={MOBILE_SCALE_VARS}
        className="min-h-dvh w-full min-w-0 overflow-x-clip bg-[#FAFAFC] pb-[calc(32*var(--u)+env(safe-area-inset-bottom))]"
      >
        <header className="sticky top-0 z-40 w-full bg-[#83051C] text-white">
          <div className="mx-auto flex w-full max-w-[680px] items-center justify-between gap-[calc(10*var(--u))] px-[calc(14*var(--u))] pb-[calc(30*var(--u))] pt-[calc(env(safe-area-inset-top)+calc(11*var(--u)))]">
            <div className="flex min-w-0 items-center gap-[calc(8*var(--u))]">
              <button
                type="button"
                onClick={handleBack}
                aria-label="Kembali ke Notifikasi"
                className="flex h-[calc(34*var(--u))] w-[calc(34*var(--u))] shrink-0 items-center justify-center rounded-full text-white transition-colors duration-200 active:bg-white/15"
              >
                <ArrowLeft
                  className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                  weight="bold"
                />
              </button>

              <h1 className="truncate font-display text-[calc(17.5*var(--u))] font-bold leading-tight tracking-[-0.02em] text-white">
                Detail Notifikasi
              </h1>
            </div>
          </div>
        </header>

        <div className="relative z-40 -mt-[calc(20*var(--u))] min-h-[calc(100dvh-calc(68*var(--u)))] rounded-t-[calc(24*var(--u))] bg-[#FAFAFC] px-[calc(16*var(--u))] pt-[calc(18*var(--u))]">
          <div className="mx-auto w-full max-w-[680px]">
            {item ? (
              <div className="space-y-[calc(14*var(--u))]">
                <section className="rounded-[calc(18*var(--u))] border border-[#EEEEEE] bg-white p-[calc(16*var(--u))] shadow-[0_1px_4px_rgba(41,35,42,0.03)]">
                  <div className="flex items-start gap-[calc(12*var(--u))]">
                    <span className="flex h-[calc(42*var(--u))] w-[calc(42*var(--u))] shrink-0 items-center justify-center rounded-full bg-[#FCECEF] text-[#8E001C]">
                      <Icon
                        className="h-[calc(21*var(--u))] w-[calc(21*var(--u))]"
                        weight="bold"
                      />
                    </span>

                    <div className="min-w-0 flex-1">
                      <span className="inline-flex items-center rounded-full bg-[#F6F6F8] px-[calc(8*var(--u))] py-[calc(2.5*var(--u))] text-[calc(10.5*var(--u))] font-bold text-[#5A555F]">
                        {typeLabelMap[item.type]}
                      </span>

                      <h2 className="mt-[calc(6*var(--u))] font-display text-[calc(16*var(--u))] font-bold leading-[1.25] tracking-[-0.02em] text-[#171717]">
                        {item.title}
                      </h2>

                      <div className="mt-[calc(6*var(--u))] flex items-center gap-[calc(5*var(--u))] text-[calc(11.5*var(--u))] text-[#6E6873]">
                        <Clock
                          className="h-[calc(13.5*var(--u))] w-[calc(13.5*var(--u))] shrink-0"
                          weight="regular"
                        />
                        <span>{formatFullDateTime(item)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="my-[calc(14*var(--u))] border-t border-[#EFEFF2]" />

                  <p className="text-[calc(12.5*var(--u))] leading-[1.55] text-[#29232A]">
                    {getDetailBody(item)}
                  </p>
                </section>

                {(item.data?.equipmentNumber ||
                  item.data?.customerName ||
                  item.data?.monitoringPeriod ||
                  item.data?.status) && (
                  <section className="rounded-[calc(18*var(--u))] border border-[#EEEEEE] bg-white p-[calc(16*var(--u))] shadow-[0_1px_4px_rgba(41,35,42,0.03)]">
                    <h3 className="font-display text-[calc(13.5*var(--u))] font-bold text-[#171717]">
                      Informasi Terkait
                    </h3>

                    <dl className="mt-[calc(10*var(--u))] divide-y divide-[#F2F2F5] text-[calc(12*var(--u))]">
                      {item.data?.equipmentNumber && (
                        <div className="flex items-center justify-between gap-3 py-[calc(8*var(--u))]">
                          <dt className="text-[#6E6873]">Kode Unit</dt>
                          <dd className="font-semibold text-[#171717]">
                            {String(item.data.equipmentNumber)}
                          </dd>
                        </div>
                      )}
                      {item.data?.customerName && (
                        <div className="flex items-center justify-between gap-3 py-[calc(8*var(--u))]">
                          <dt className="text-[#6E6873]">Pelanggan</dt>
                          <dd className="font-semibold text-[#171717]">
                            {String(item.data.customerName)}
                          </dd>
                        </div>
                      )}
                      {item.data?.monitoringPeriod && (
                        <div className="flex items-center justify-between gap-3 py-[calc(8*var(--u))]">
                          <dt className="text-[#6E6873]">Periode</dt>
                          <dd className="font-semibold text-[#171717]">
                            {String(item.data.monitoringPeriod)}
                          </dd>
                        </div>
                      )}
                      {item.data?.status && (
                        <div className="flex items-center justify-between gap-3 py-[calc(8*var(--u))]">
                          <dt className="text-[#6E6873]">Status</dt>
                          <dd className="font-semibold text-[#8E001C]">
                            {String(item.data.status)}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </section>
                )}

                {targetRoute && (
                  <Link
                    to={targetRoute.to}
                    className="flex w-full items-center justify-center gap-[calc(6*var(--u))] rounded-[calc(14*var(--u))] bg-[#8E001C] px-[calc(16*var(--u))] py-[calc(12*var(--u))] text-[calc(13*var(--u))] font-bold text-white transition-transform duration-150 active:scale-[0.985] active:bg-[#730217]"
                  >
                    <span>{targetRoute.label}</span>
                    <ArrowUpRight
                      className="h-[calc(16*var(--u))] w-[calc(16*var(--u))]"
                      weight="bold"
                    />
                  </Link>
                )}
              </div>
            ) : (
              <div className="rounded-[calc(18*var(--u))] border border-[#EEEEEE] bg-white px-[calc(18*var(--u))] py-[calc(28*var(--u))] text-center">
                <CheckCircle
                  className="mx-auto h-[calc(32*var(--u))] w-[calc(32*var(--u))] text-[#8E001C]"
                  weight="duotone"
                />
                <h2 className="mt-[calc(8*var(--u))] font-display text-[calc(15*var(--u))] font-bold text-[#171717]">
                  Notifikasi Tidak Ditemukan
                </h2>
                <p className="mt-[calc(4*var(--u))] text-[calc(12*var(--u))] text-[#6E6873]">
                  Data notifikasi mungkin sudah dihapus atau tautan tidak valid.
                </p>
                <button
                  type="button"
                  onClick={handleBack}
                  className="mt-[calc(14*var(--u))] inline-flex items-center justify-center rounded-[calc(12*var(--u))] bg-[#8E001C] px-[calc(16*var(--u))] py-[calc(9*var(--u))] text-[calc(12.5*var(--u))] font-semibold text-white"
                >
                  Kembali ke Notifikasi
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full min-w-0 bg-white">
      <div className="mx-auto w-full max-w-4xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[#730217] transition hover:bg-[#F8F2F4]"
        >
          <ArrowLeft size={18} weight="bold" />
          Kembali ke Notifikasi
        </button>

        {item ? (
          <article className="mt-4 rounded-2xl border border-[#ECECEF] bg-white p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FCECEF] px-3 py-1 text-xs font-semibold text-[#8E001C]">
                <CalendarBlank size={14} weight="bold" />
                {typeLabelMap[item.type]}
              </span>
              <span className="text-xs font-medium text-[#6E6873]">
                {formatFullDateTime(item)}
              </span>
            </div>

            <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-[#171717]">
              {item.title}
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-[#29232A]">
              {getDetailBody(item)}
            </p>
          </article>
        ) : (
          <div className="mt-4 rounded-2xl border border-[#ECECEF] bg-white p-8 text-center">
            <h1 className="font-display text-lg font-bold text-[#171717]">
              Notifikasi Tidak Ditemukan
            </h1>
            <p className="mt-1 text-sm text-[#6E6873]">
              Item notifikasi yang diminta tidak tersedia.
            </p>
          </div>
        )}
      </div>
    </main>
  );
                        }
