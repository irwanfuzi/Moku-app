import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Buildings,
  CalendarBlank,
  CaretRight,
  ChartBar,
  CheckCircle,
  ClipboardText,
  Database,
  FileText,
  Printer,
  Stack,
  Target,
  TrendUp,
  User,
  Warning,
} from "@phosphor-icons/react";
import { useAppLayout } from "@/components/layout/app-shell";
import {
  loadNotifications,
  markNotificationAsRead,
  subscribeNotifications,
  type NotificationItem,
} from "@/lib/notification-store";

const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

type DetailVariant =
  | "schedule"
  | "attention"
  | "report"
  | "visitCompleted"
  | "weeklyTarget"
  | "equipmentUpdate";

interface DetailListEntry {
  id: string;
  primary: string;
  secondary: string;
  badge?: {
    text: string;
    tone: "danger" | "warning" | "success" | "info";
  };
  to?: string;
}

interface DetailMetaRow {
  label: string;
  value: string;
  icon: "calendar" | "target" | "stack" | "chart" | "check" | "printer" | "building" | "user" | "clipboard";
  badge?: {
    text: string;
    tone: "success" | "warning" | "danger" | "info";
  };
  progressPercent?: number;
}

interface DetailThemeConfig {
  variant: DetailVariant;
  sectionTitle: string;
  ctaLabel: string;
  ctaTo: string;
  description: string;
  heroIcon: "calendar" | "warning" | "report" | "check" | "target" | "database";
  heroBg: string;
  heroColor: string;
  outerCardBg: string;
  sectionIconColor: string;
  progressColor: string;
  listEntries: DetailListEntry[];
  metaRows: DetailMetaRow[];
}

const visitTypeLabels: Record<string, string> = {
  IND: "Driver Installation",
  INS: "Installation",
  DIS: "Dismantle",
  PMC: "Preventive Maintenance",
  UMC: "Unscheduled Maintenance",
};

function formatCompactDateTime(item: NotificationItem): string {
  const raw = item.createdAt;
  if (raw !== null && raw !== undefined && raw !== "") {
    const date =
      raw instanceof Date
        ? raw
        : typeof raw === "number"
          ? new Date(raw)
          : new Date(String(raw));
    if (!Number.isNaN(date.getTime())) {
      const datePart = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
      const timePart = new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
        .format(date)
        .replace(".", ":");
      return `${datePart}, ${timePart}`;
    }
  }
  return item.time ?? "15 Okt 2025, 08:30";
}

function formatDateOnly(item: NotificationItem): string {
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
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    }
  }
  return "15 Okt 2025";
}

function resolveDetailTheme(item: NotificationItem): DetailThemeConfig {
  const titleLower = (item.title ?? "").toLowerCase();
  const data = item.data ?? {};
  const equipment = data.equipmentNumber ? String(data.equipmentNumber) : "";
  const customer = data.customerName ? String(data.customerName) : "";
  const period = data.monitoringPeriod ? String(data.monitoringPeriod) : "";
  const statusStr = data.status ? String(data.status) : "";
  const visitType = data.visitType
    ? visitTypeLabels[String(data.visitType).toUpperCase()] ??
      String(data.visitType)
    : "";

  const rawList = Array.isArray((data as Record<string, unknown>).items)
    ? ((data as Record<string, unknown>).items as Array<Record<string, unknown>>)
    : Array.isArray((data as Record<string, unknown>).machines)
      ? ((data as Record<string, unknown>).machines as Array<Record<string, unknown>>)
      : null;

  // 1. Jadwal Kunjungan Hari Ini
  if (
    titleLower.includes("jadwal") ||
    titleLower.includes("dijadwalkan")
  ) {
    const entries: DetailListEntry[] = rawList
      ? rawList.map((entry, idx) => ({
          id: String(entry.id ?? entry.code ?? entry.equipmentNumber ?? idx),
          primary: String(entry.code ?? entry.equipmentNumber ?? `MK-00${idx + 1}`),
          secondary: String(entry.customer ?? entry.customerName ?? "PT. Sinar Mandiri"),
          to: entry.code || entry.equipmentNumber
            ? `/equipment/${encodeURIComponent(String(entry.code ?? entry.equipmentNumber))}`
            : "/visits",
        }))
      : [
          {
            id: "sched-1",
            primary: equipment || "MK-001",
            secondary: customer || "PT. Sinar Mandiri",
            to: equipment
              ? `/equipment/${encodeURIComponent(equipment)}`
              : "/visits",
          },
          {
            id: "sched-2",
            primary: "MK-004",
            secondary: "PT. Citra Jaya",
            to: "/equipment/MK-004",
          },
          {
            id: "sched-3",
            primary: "MK-007",
            secondary: "PT. Maju Bersama",
            to: "/equipment/MK-007",
          },
        ];

    return {
      variant: "schedule",
      sectionTitle: "Detail Kunjungan",
      ctaLabel: "Lihat Jadwal Kunjungan",
      ctaTo: "/visits",
      description:
        item.description?.trim() ||
        `Ada ${entries.length} kunjungan yang dijadwalkan untuk hari ini (${formatDateOnly(item)}). Mohon pastikan kunjungan dilakukan sesuai jadwal yang telah ditentukan.`,
      heroIcon: "calendar",
      heroBg: "bg-[#FCECEF]",
      heroColor: "text-[#DC0E2E]",
      outerCardBg: "bg-[#FDF2F4]",
      sectionIconColor: "text-[#DC0E2E]",
      progressColor: "bg-[#8E001C]",
      listEntries: entries,
      metaRows: [],
    };
  }

  // 2. Mesin Perlu Perhatian
  if (
    item.type === "monitoring" ||
    titleLower.includes("perhatian") ||
    titleLower.includes("peringatan") ||
    titleLower.includes("belum dikunjungi")
  ) {
    const entries: DetailListEntry[] = rawList
      ? rawList.map((entry, idx) => ({
          id: String(entry.id ?? entry.code ?? entry.equipmentNumber ?? idx),
          primary: String(entry.code ?? entry.equipmentNumber ?? `MK-00${idx + 1}`),
          secondary: String(entry.customer ?? entry.customerName ?? "PT. Sinar Mandiri"),
          badge: {
            text: String(entry.badge ?? entry.status ?? "Perlu Penanganan"),
            tone: idx % 2 === 0 ? "danger" : "warning",
          },
          to: "/monitoring",
        }))
      : [
          {
            id: "attn-1",
            primary: equipment || "MK-003",
            secondary: customer || "PT. Sinar Mandiri",
            badge: {
              text: statusStr || "Perlu Penanganan",
              tone: "danger",
            },
            to: "/monitoring",
          },
          {
            id: "attn-2",
            primary: "MK-006",
            secondary: "PT. Citra Jaya",
            badge: {
              text: "Perlu Pengecekan",
              tone: "warning",
            },
            to: "/monitoring",
          },
        ];

    return {
      variant: "attention",
      sectionTitle: "Daftar Mesin Perlu Perhatian",
      ctaLabel: "Lihat Detail Mesin",
      ctaTo: "/monitoring",
      description:
        item.description?.trim() ||
        `Terdapat ${entries.length} mesin yang terdeteksi memerlukan perhatian segera. Mohon lakukan pengecekan dan tindak lanjut sesuai prosedur.`,
      heroIcon: "warning",
      heroBg: "bg-[#FCE6D8]",
      heroColor: "text-[#EB6A14]",
      outerCardBg: "bg-[#FDF2F4]",
      sectionIconColor: "text-[#C81032]",
      progressColor: "bg-[#8E001C]",
      listEntries: entries,
      metaRows: [],
    };
  }

  // 3. Laporan Bulanan Tersedia
  if (titleLower.includes("laporan") || titleLower.includes("bulanan")) {
    return {
      variant: "report",
      sectionTitle: "Detail Laporan",
      ctaLabel: "Lihat Laporan",
      ctaTo: "/reports",
      description:
        item.description?.trim() ||
        `Laporan operasional kunjungan bulan ${period || "September 2025"} telah tersedia. Anda dapat melihat ringkasan maupun mengunduh laporan untuk analisis lebih lanjut.`,
      heroIcon: "report",
      heroBg: "bg-[#E6F1FD]",
      heroColor: "text-[#1D6FE0]",
      outerCardBg: "bg-[#EEF5FD]",
      sectionIconColor: "text-[#1D6FE0]",
      progressColor: "bg-[#1D6FE0]",
      listEntries: [],
      metaRows: [
        {
          label: "Periode Laporan",
          value: period || "September 2025",
          icon: "calendar",
        },
        {
          label: "Jenis Laporan",
          value: "Laporan Operasional Kunjungan",
          icon: "stack",
        },
        {
          label: "Total Kunjungan",
          value: "124 Kunjungan",
          icon: "chart",
        },
        {
          label: "Status",
          value: "Tersedia",
          icon: "check",
          badge: { text: "Tersedia", tone: "success" },
        },
      ],
    };
  }

  // 4. Target Kunjungan Mingguan
  if (titleLower.includes("target") || titleLower.includes("mingguan")) {
    const progressPct = 70;
    return {
      variant: "weeklyTarget",
      sectionTitle: "Detail Target Mingguan",
      ctaLabel: "Lihat Rencana Kunjungan",
      ctaTo: "/visits",
      description:
        item.description?.trim() ||
        "Target kunjungan minggu ini telah ditetapkan. Pastikan seluruh rencana kunjungan dapat diselesaikan sesuai target.",
      heroIcon: "target",
      heroBg: "bg-[#E6F1FD]",
      heroColor: "text-[#1D6FE0]",
      outerCardBg: "bg-[#EEF5FD]",
      sectionIconColor: "text-[#1D6FE0]",
      progressColor: "bg-[#1D6FE0]",
      listEntries: [],
      metaRows: [
        {
          label: "Periode",
          value: period || "13 – 19 Okt 2025",
          icon: "calendar",
        },
        {
          label: "Target Kunjungan",
          value: "40 Kunjungan",
          icon: "target",
        },
        {
          label: "Realisasi Saat Ini",
          value: "28 Kunjungan",
          icon: "stack",
        },
        {
          label: "Progress",
          value: `${progressPct}%`,
          icon: "chart",
          progressPercent: progressPct,
        },
      ],
    };
  }

  // 5. Pembaruan Data Mesin
  if (
    item.type === "equipment" ||
    item.type === "customer" ||
    titleLower.includes("pembaruan") ||
    titleLower.includes("diperbarui") ||
    titleLower.includes("ditambahkan")
  ) {
    return {
      variant: "equipmentUpdate",
      sectionTitle: "Detail Pembaruan",
      ctaLabel: "Lihat Detail Perubahan",
      ctaTo: equipment
        ? `/equipment/${encodeURIComponent(equipment)}`
        : "/equipment",
      description:
        item.description?.trim() ||
        "Terdapat pembaruan data mesin pada sistem. Silakan periksa detail perubahan untuk memastikan data sudah sesuai.",
      heroIcon: "database",
      heroBg: "bg-[#E6F1FD]",
      heroColor: "text-[#1D6FE0]",
      outerCardBg: "bg-[#EEF5FD]",
      sectionIconColor: "text-[#1D6FE0]",
      progressColor: "bg-[#1D6FE0]",
      listEntries: [],
      metaRows: [
        {
          label: "Kode Mesin",
          value: equipment || "MK-004",
          icon: "printer",
        },
        {
          label: "Pelanggan",
          value: customer || "PT. Citra Jaya",
          icon: "building",
        },
        {
          label: "Jenis Perubahan",
          value: data.changeDescription
            ? String(data.changeDescription)
            : "Pembaruan Informasi Mesin",
          icon: "stack",
        },
        {
          label: "Tanggal Pembaruan",
          value: formatCompactDateTime(item),
          icon: "calendar",
        },
      ],
    };
  }

  // 6. Kunjungan Selesai (default untuk visit / lainnya)
  return {
    variant: "visitCompleted",
    sectionTitle: "Detail Kunjungan",
    ctaLabel: "Lihat Hasil Kunjungan",
    ctaTo: "/visit-history",
    description:
      item.description?.trim() ||
      (visitType
        ? `Aktivitas ${visitType} telah diselesaikan oleh teknisi dan tercatat dalam sistem MOKU.`
        : "Kunjungan ke pelanggan telah diselesaikan oleh teknisi. Data hasil kunjungan sudah tercatat di sistem."),
    heroIcon: "check",
    heroBg: "bg-[#DCF5E3]",
    heroColor: "text-[#14AE47]",
    outerCardBg: "bg-[#EEF9F1]",
    sectionIconColor: "text-[#14AE47]",
    progressColor: "bg-[#14AE47]",
    listEntries: [],
    metaRows: [
      {
        label: equipment || "MK-004",
        value: customer || "PT. Citra Jaya",
        icon: "printer",
      },
      {
        label: "Tanggal Kunjungan",
        value: formatDateOnly(item),
        icon: "calendar",
      },
      {
        label: "Teknisi",
        value: "Budi Santoso",
        icon: "user",
      },
      {
        label: "Status Kunjungan",
        value: statusStr || "Selesai",
        icon: "clipboard",
        badge: {
          text: statusStr || "Selesai",
          tone: "success",
        },
      },
    ],
  };
}

function HeroIconRenderer({
  kind,
  className,
}: {
  kind: DetailThemeConfig["heroIcon"];
  className: string;
}) {
  switch (kind) {
    case "calendar":
      return <CalendarBlank className={className} weight="regular" />;
    case "warning":
      return <Warning className={className} weight="regular" />;
    case "report":
      return <FileText className={className} weight="regular" />;
    case "target":
      return <Target className={className} weight="regular" />;
    case "database":
      return <Database className={className} weight="duotone" />;
    case "check":
    default:
      return <CheckCircle className={className} weight="regular" />;
  }
}

function MetaRowIcon({
  kind,
  className,
}: {
  kind: DetailMetaRow["icon"];
  className: string;
}) {
  switch (kind) {
    case "calendar":
      return <CalendarBlank className={className} weight="regular" />;
    case "target":
      return <Target className={className} weight="regular" />;
    case "stack":
      return <Stack className={className} weight="regular" />;
    case "chart":
      return <ChartBar className={className} weight="regular" />;
    case "check":
      return <CheckCircle className={className} weight="regular" />;
    case "printer":
      return <Printer className={className} weight="regular" />;
    case "building":
      return <Buildings className={className} weight="regular" />;
    case "user":
      return <User className={className} weight="regular" />;
    case "clipboard":
    default:
      return <ClipboardText className={className} weight="regular" />;
  }
}

function badgeToneClass(tone: "danger" | "warning" | "success" | "info") {
  switch (tone) {
    case "danger":
      return "bg-[#FADCE1] text-[#DC0E2E]";
    case "warning":
      return "bg-[#FDE9D7] text-[#E06D10]";
    case "success":
      return "bg-[#DCF5E3] text-[#14AE47]";
    case "info":
    default:
      return "bg-[#E6F1FD] text-[#1D6FE0]";
  }
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

  useEffect(() => {
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
    const theme = item ? resolveDetailTheme(item) : null;

    return (
      <main
        style={MOBILE_SCALE_VARS}
        className="min-h-dvh w-full min-w-0 overflow-x-clip bg-white pb-[calc(36*var(--u)+env(safe-area-inset-bottom))]"
      >
        {/* Header Marun */}
        <header className="sticky top-0 z-40 w-full bg-[#83051C] text-white">
          <div className="mx-auto flex w-full max-w-[680px] items-center justify-between gap-[calc(10*var(--u))] px-[calc(14*var(--u))] pb-[calc(30*var(--u))] pt-[calc(env(safe-area-inset-top)+calc(11*var(--u)))]">
            <div className="flex min-w-0 items-center gap-[calc(8*var(--u))]">
              <button
                type="button"
                onClick={handleBack}
                aria-label="Kembali"
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

        {/* Sheet Putih Melengkung */}
        <div className="relative z-40 -mt-[calc(20*var(--u))] min-h-[calc(100dvh-calc(68*var(--u)))] rounded-t-[calc(24*var(--u))] bg-white px-[calc(18*var(--u))] pt-[calc(20*var(--u))]">
          <div className="mx-auto w-full max-w-[680px]">
            {item && theme ? (
              <div>
                {/* Ringkasan Atas: Ikon + Judul + Waktu */}
                <div className="flex items-center gap-[calc(14*var(--u))]">
                  <div
                    className={`flex h-[calc(52*var(--u))] w-[calc(52*var(--u))] shrink-0 items-center justify-center rounded-[calc(15*var(--u))] ${theme.heroBg} ${theme.heroColor}`}
                  >
                    <HeroIconRenderer
                      kind={theme.heroIcon}
                      className="h-[calc(27*var(--u))] w-[calc(27*var(--u))]"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-[calc(16.5*var(--u))] font-bold leading-[1.25] tracking-[-0.02em] text-[#171717]">
                      {item.title}
                    </h2>
                    <p className="mt-[calc(3*var(--u))] text-[calc(12*var(--u))] font-medium text-[#6E6873]">
                      {formatCompactDateTime(item)}
                    </p>
                  </div>
                </div>

                {/* Deskripsi */}
                <p className="mt-[calc(14*var(--u))] text-[calc(12.5*var(--u))] leading-[1.52] text-[#29232A]">
                  {theme.description}
                </p>

                {/* Kartu Seksi Berwarna Lembut */}
                <section
                  className={`mt-[calc(18*var(--u))] rounded-[calc(18*var(--u))] p-[calc(14*var(--u))] ${theme.outerCardBg}`}
                >
                  <div className="mb-[calc(12*var(--u))] flex items-center gap-[calc(8*var(--u))] px-[calc(2*var(--u))]">
                    {theme.variant === "schedule" && (
                      <CalendarBlank
                        className={`h-[calc(18*var(--u))] w-[calc(18*var(--u))] shrink-0 ${theme.sectionIconColor}`}
                        weight="bold"
                      />
                    )}
                    {theme.variant === "attention" && (
                      <Printer
                        className={`h-[calc(18*var(--u))] w-[calc(18*var(--u))] shrink-0 ${theme.sectionIconColor}`}
                        weight="fill"
                      />
                    )}
                    {theme.variant === "report" && (
                      <FileText
                        className={`h-[calc(18*var(--u))] w-[calc(18*var(--u))] shrink-0 ${theme.sectionIconColor}`}
                        weight="bold"
                      />
                    )}
                    {theme.variant === "visitCompleted" && (
                      <ClipboardText
                        className={`h-[calc(18*var(--u))] w-[calc(18*var(--u))] shrink-0 ${theme.sectionIconColor}`}
                        weight="bold"
                      />
                    )}
                    {theme.variant === "weeklyTarget" && (
                      <ChartBar
                        className={`h-[calc(18*var(--u))] w-[calc(18*var(--u))] shrink-0 ${theme.sectionIconColor}`}
                        weight="bold"
                      />
                    )}
                    {theme.variant === "equipmentUpdate" && (
                      <Database
                        className={`h-[calc(18*var(--u))] w-[calc(18*var(--u))] shrink-0 ${theme.sectionIconColor}`}
                        weight="fill"
                      />
                    )}

                    <h3 className="font-display text-[calc(14.5*var(--u))] font-bold tracking-[-0.02em] text-[#171717]">
                      {theme.sectionTitle}
                    </h3>
                  </div>

                  {/* Varian List Item (Jadwal / Mesin Perlu Perhatian) */}
                  {theme.listEntries.length > 0 && (
                    <div className="divide-y divide-[#EFEFF2] rounded-[calc(14*var(--u))] bg-white px-[calc(12*var(--u))] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                      {theme.listEntries.map((entry) => (
                        <Link
                          key={entry.id}
                          to={entry.to ?? theme.ctaTo}
                          className="flex items-center justify-between gap-[calc(10*var(--u))] py-[calc(11*var(--u))] transition-colors active:bg-[#FAFAFC]"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-[calc(11*var(--u))]">
                            <span className="flex h-[calc(40*var(--u))] w-[calc(40*var(--u))] shrink-0 items-center justify-center rounded-[calc(11*var(--u))] bg-[#F2F2F5] text-[#4A464E]">
                              <Printer
                                className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                                weight="regular"
                              />
                            </span>

                            <div className="min-w-0 flex-1">
                              <p className="truncate font-display text-[calc(13.5*var(--u))] font-bold leading-tight text-[#171717]">
                                {entry.primary}
                              </p>
                              <p className="mt-[calc(2*var(--u))] truncate text-[calc(11.5*var(--u))] text-[#5E5863]">
                                {entry.secondary}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-[calc(6*var(--u))]">
                            {entry.badge && (
                              <span
                                className={`inline-flex items-center gap-[calc(4*var(--u))] rounded-full px-[calc(8*var(--u))] py-[calc(3*var(--u))] text-[calc(10.5*var(--u))] font-bold ${badgeToneClass(entry.badge.tone)}`}
                              >
                                <Warning
                                  className="h-[calc(11.5*var(--u))] w-[calc(11.5*var(--u))]"
                                  weight="bold"
                                />
                                {entry.badge.text}
                              </span>
                            )}
                            <CaretRight
                              className="h-[calc(15*var(--u))] w-[calc(15*var(--u))] text-[#5E5863]"
                              weight="bold"
                            />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Varian Detail Key-Value / Progress (Laporan, Kunjungan Selesai, Target Mingguan, Pembaruan) */}
                  {theme.metaRows.length > 0 && (
                    <div className="divide-y divide-[#EFEFF2] rounded-[calc(14*var(--u))] bg-white px-[calc(12*var(--u))] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                      {theme.metaRows.map((row, idx) => {
                        const isFirstVisitMachine =
                          theme.variant === "visitCompleted" && idx === 0;

                        return (
                          <div
                            key={`${row.label}-${idx}`}
                            className="flex items-center gap-[calc(11*var(--u))] py-[calc(11*var(--u))]"
                          >
                            <span className="flex h-[calc(38*var(--u))] w-[calc(38*var(--u))] shrink-0 items-center justify-center rounded-[calc(10*var(--u))] bg-[#F2F2F5] text-[#4A464E]">
                              <MetaRowIcon
                                kind={row.icon}
                                className="h-[calc(19*var(--u))] w-[calc(19*var(--u))]"
                              />
                            </span>

                            {isFirstVisitMachine ? (
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-display text-[calc(13.5*var(--u))] font-bold leading-tight text-[#171717]">
                                  {row.label}
                                </p>
                                <p className="mt-[calc(2*var(--u))] truncate text-[calc(11.5*var(--u))] text-[#5E5863]">
                                  {row.value}
                                </p>
                              </div>
                            ) : typeof row.progressPercent === "number" ? (
                              <div className="min-w-0 flex-1">
                                <p className="text-[calc(11*var(--u))] font-medium text-[#5E5863]">
                                  {row.label}
                                </p>
                                <div className="mt-[calc(5*var(--u))] flex items-center gap-[calc(10*var(--u))]">
                                  <div className="h-[calc(7*var(--u))] flex-1 overflow-hidden rounded-full bg-[#E8ECF2]">
                                    <div
                                      className={`h-full rounded-full ${theme.progressColor}`}
                                      style={{ width: `${row.progressPercent}%` }}
                                    />
                                  </div>
                                  <span className="shrink-0 rounded-full bg-[#E6F1FD] px-[calc(8*var(--u))] py-[calc(2*var(--u))] text-[calc(11*var(--u))] font-bold text-[#1D6FE0]">
                                    {row.value}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="min-w-0 flex-1">
                                <p className="text-[calc(11*var(--u))] font-medium text-[#5E5863]">
                                  {row.label}
                                </p>
                                {row.badge ? (
                                  <span
                                    className={`mt-[calc(4*var(--u))] inline-flex items-center gap-[calc(4*var(--u))] rounded-full px-[calc(8*var(--u))] py-[calc(2.5*var(--u))] text-[calc(11*var(--u))] font-bold ${badgeToneClass(row.badge.tone)}`}
                                  >
                                    <CheckCircle
                                      className="h-[calc(12*var(--u))] w-[calc(12*var(--u))]"
                                      weight="bold"
                                    />
                                    {row.badge.text}
                                  </span>
                                ) : (
                                  <p className="mt-[calc(2*var(--u))] truncate font-display text-[calc(13.5*var(--u))] font-bold leading-tight text-[#171717]">
                                    {row.value}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Tombol CTA Utama */}
                <Link
                  to={theme.ctaTo}
                  className="mt-[calc(18*var(--u))] flex h-[calc(44*var(--u))] w-full items-center justify-center rounded-[calc(14*var(--u))] bg-[#8E001C] px-[calc(16*var(--u))] font-display text-[calc(13.5*var(--u))] font-bold text-white transition-transform duration-150 active:scale-[0.985] active:bg-[#730217]"
                >
                  {theme.ctaLabel}
                </Link>
              </div>
            ) : (
              <div className="rounded-[calc(18*var(--u))] border border-[#EEEEEE] bg-white px-[calc(18*var(--u))] py-[calc(28*var(--u))] text-center">
                <h2 className="font-display text-[calc(15*var(--u))] font-bold text-[#171717]">
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
                {item.type}
              </span>
              <span className="text-xs font-medium text-[#6E6873]">
                {formatCompactDateTime(item)}
              </span>
            </div>

            <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-[#171717]">
              {item.title}
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-[#29232A]">
              {resolveDetailTheme(item).description}
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
