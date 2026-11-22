"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  ChartNoAxesColumn,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Download,
  Filter,
  Hourglass,
  MoreVertical,
  Plus,
  Printer,
  Search,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useAppLayout } from "@/components/layout/app-shell";

/* =========================================================
   DESIGN SYSTEM & CONSTANTS
========================================================= */
const MONTHS = [
  "Agustus 2026",
  "September 2026",
  "Oktober 2026",
  "November 2026",
  "Desember 2026",
];

const Y_AXIS_TICKS = [20, 16, 12, 8, 4, 0];

/* =========================================================
   DASHBOARD DATA
========================================================= */
const monitoringData = [
  {
    label: "Sudah Dikunjungi",
    value: 32,
    percentage: 66,
    color: "#8E001C",
    desktopColor: "#8E001C",
    badge: "bg-[#FCECEF] text-[#B81432]",
  },
  {
    label: "Belum Dikunjungi",
    value: 12,
    percentage: 25,
    color: "#E2E2E5",
    desktopColor: "#B8B8C0",
    badge: "bg-[#F2F2F4] text-[#66636A]",
  },
  {
    label: "Perlu Perhatian",
    value: 4,
    percentage: 9,
    color: "#F28C0F",
    desktopColor: "#DCDCE0",
    badge: "bg-[#FFF1E6] text-[#E06D10]",
  },
];

const recentActivities = [
  {
    title: "Kunjungan selesai",
    machine: "MK-004",
    customer: "PT. Citra Jaya",
    time: "Hari ini",
    status: "success",
  },
  {
    title: "Kunjungan selesai",
    machine: "MK-001",
    customer: "PT. Sinar Mandiri",
    time: "Kemarin",
    status: "success",
  },
  {
    title: "Kunjungan dijadwalkan",
    machine: "MK-003",
    customer: "PT. Prima Solusi",
    time: "14 Okt",
    status: "pending",
  },
];

const desktopMachineRows = [
  {
    no: 1,
    code: "MK-001",
    model: "Photocopy A3",
    customer: "PT. Sinar Mandiri",
    status: "Sudah Dikunjungi",
    lastVisit: "12 Okt 2025",
  },
  {
    no: 2,
    code: "MK-002",
    model: "Printer Laser",
    customer: "CV. Multi Jaya",
    status: "Belum Dikunjungi",
    lastVisit: "-",
  },
  {
    no: 3,
    code: "MK-003",
    model: "Photocopy A4",
    customer: "PT. Prima Solusi",
    status: "Perlu Perhatian",
    lastVisit: "5 Okt 2025",
  },
  {
    no: 4,
    code: "MK-004",
    model: "Scanner",
    customer: "PT. Citra Jaya",
    status: "Sudah Dikunjungi",
    lastVisit: "10 Okt 2025",
  },
];

const desktopVisitChart = [
  { day: "Sen", visits: 12, target: 10 },
  { day: "Sel", visits: 14, target: 12 },
  { day: "Rab", visits: 12, target: 10 },
  { day: "Kam", visits: 17, target: 15 },
  { day: "Jum", visits: 10, target: 8 },
  { day: "Sab", visits: 13, target: 10 },
  { day: "Min", visits: 17, target: 16 },
];

/* =========================================================
   SHARED COMPONENTS
========================================================= */
function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="min-w-0 whitespace-nowrap text-[calc(17.5*var(--u))] font-bold leading-[1.2] tracking-[-0.04em] text-[#171717]">
      {children}
    </h2>
  );
}

function MobileCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className = "",
}) {
  return (
    <section
      className={`min-w-0 rounded-[calc(19*var(--u))] border border-[#EEEEEE] bg-white shadow-[0_2px_9px_rgba(0,0,0,0.055)] ${className}`}
    >
      {children}
    </section>
  );
}

function QuickAction({
  href,
  label,
  children,
  separated = false,
}: {
  href: string;
  label: ReactNode;
  children: ReactNode;
  separated?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-w-0 flex-col items-center justify-start gap-[calc(6*var(--u))] px-[calc(4*var(--u))] text-center ${
        separated ? "border-l border-[#EAEAEF]" : ""
      }`}
    >
      <span className="flex h-[calc(42*var(--u))] w-[calc(42*var(--u))] shrink-0 items-center justify-center rounded-[calc(12*var(--u))] bg-[#8E001C] text-white shadow-[0_2px_6px_rgba(142,0,28,0.2)]">
        {children}
      </span>
      <span className="text-[calc(11.5*var(--u))] font-medium leading-[1.2] tracking-[-0.02em] text-[#1F1B20]">
        {label}
      </span>
    </Link>
  );
}

/* =========================================================
   DESKTOP DASHBOARD (> 600px / FOLD / TABLET / DESKTOP SITE)
========================================================= */
function DesktopDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [customerFilter, setCustomerFilter] = useState("Semua Pelanggan");
  const [openAction, setOpenAction] = useState<string | null>(null);
  const [desktopMonth, setDesktopMonth] = useState("Oktober 2025");

  const filteredRows = desktopMachineRows.filter((row) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [row.code, row.model, row.customer, row.status].some((value) =>
        value.toLowerCase().includes(query)
      );
    const matchesStatus =
      statusFilter === "Semua Status" || row.status === statusFilter;
    const matchesCustomer =
      customerFilter === "Semua Pelanggan" || row.customer === customerFilter;

    return matchesSearch && matchesStatus && matchesCustomer;
  });

  const kpis = [
    { label: "Total Mesin", value: "48", icon: Printer },
    { label: "Sudah Dikunjungi", value: "32", icon: Check },
    { label: "Belum Dikunjungi", value: "12", icon: Hourglass },
    { label: "Perlu Perhatian", value: "4", icon: AlertTriangle },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 text-[#171923]">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[clamp(26px,2.8vw,34px)] font-extrabold leading-tight tracking-[-0.03em] text-[#730217]">
            Dashboard
          </h1>
          <p className="mt-0.5 text-sm text-[#5A5660] md:text-[15px]">
            Ringkasan aktivitas dan monitoring kunjungan mesin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <label className="flex h-[44px] min-w-[175px] items-center gap-2.5 rounded-xl border border-[#E4E4E8] bg-white px-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
            <CalendarDays size={18} className="shrink-0 text-[#4F4B53]" />
            <select
              value={desktopMonth}
              onChange={(event) => setDesktopMonth(event.target.value)}
              className="w-full cursor-pointer bg-transparent text-sm font-semibold text-[#171717] outline-none"
            >
              <option>September 2025</option>
              <option>Oktober 2025</option>
              <option>November 2025</option>
              <option>Desember 2025</option>
              <option>Januari 2026</option>
            </select>
          </label>

          <Link
            href="/notifications"
            aria-label="Notifikasi"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#29232A] transition hover:bg-[#F3ECEF]"
          >
            <Bell size={23} strokeWidth={1.9} />
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#F7F7F7] bg-[#BF0B2C]" />
          </Link>

          <span className="hidden h-8 w-px bg-[#E5E5E8] sm:block" />

          <Link
            href="/profile"
            className="flex items-center gap-2.5 rounded-xl py-1 pr-1 transition hover:bg-[#F3ECEF]/60"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1E9EC] text-sm font-bold text-[#730217]">
              BS
            </span>
            <span className="hidden text-left sm:block">
              <strong className="block text-sm font-bold leading-tight text-[#171717]">
                Budi Santoso
              </strong>
              <small className="block text-xs text-[#77727A]">Teknisi</small>
            </span>
            <ChevronDown size={15} className="text-[#77727A]" />
          </Link>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex min-h-[96px] items-center gap-4 rounded-[18px] border border-[#ECECEF] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] md:px-5"
          >
            <span className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[13px] bg-[#8E001C] text-white shadow-[0_3px_8px_rgba(142,0,28,0.2)]">
              <Icon size={25} strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-[#29232A]">
                {label}
              </span>
              <span className="mt-0.5 block text-[30px] font-extrabold leading-none tracking-[-0.03em] text-[#111111]">
                {value}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Charts Row */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.28fr)]">
        {/* Status Monitoring Mesin */}
        <article className="rounded-[18px] border border-[#ECECEF] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#171717]">
            Status Monitoring Mesin
          </h2>

          <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div
              className="relative h-[168px] w-[168px] shrink-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, #8E001C 0deg 240deg, #D5D5DA 240deg 330deg, #E8E8EC 330deg 360deg)",
              }}
              role="img"
              aria-label="48 Total Mesin"
            >
              <div className="absolute inset-[26px] flex flex-col items-center justify-center rounded-full bg-white">
                <strong className="text-[36px] font-extrabold leading-none tracking-[-0.04em] text-[#111111]">
                  48
                </strong>
                <span className="mt-1 text-xs font-medium text-[#66616A]">
                  Total Mesin
                </span>
              </div>
            </div>

            <div className="w-full min-w-0 flex-1 space-y-4 sm:pl-2">
              {monitoringData.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-[4px]"
                      style={{ backgroundColor: item.desktopColor }}
                    />
                    <span className="truncate font-medium text-[#29232A]">
                      {item.label}
                    </span>
                  </div>
                  <strong className="shrink-0 font-bold text-[#171717]">
                    {item.value}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* Kunjungan Bulan Ini */}
        <article className="rounded-[18px] border border-[#ECECEF] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#171717]">
              Kunjungan Bulan Ini
            </h2>

            <div className="flex items-center gap-4 text-xs font-medium text-[#5A5660]">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] bg-[#8E001C]" />
                Kunjungan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-[3px] bg-[#D5D5DA]" />
                Target
              </span>
            </div>
          </div>

          <div className="mt-5 flex h-[176px] gap-3">
            {/* Y-Axis */}
            <div className="flex flex-col justify-between pb-6 text-right text-[11px] font-medium text-[#77727A]">
              {Y_AXIS_TICKS.map((tick) => (
                <span key={tick}>{tick}</span>
              ))}
            </div>

            {/* Bars */}
            <div className="relative flex flex-1 flex-col">
              <div className="pointer-events-none absolute inset-x-0 bottom-6 top-1 flex flex-col justify-between">
                {Y_AXIS_TICKS.map((tick) => (
                  <div
                    key={tick}
                    className="w-full border-t border-dashed border-[#EFEFF2]"
                  />
                ))}
              </div>

              <div className="relative z-10 flex flex-1 items-end justify-between gap-2 px-1 pb-6 pt-1 sm:gap-3">
                {desktopVisitChart.map((item) => (
                  <div
                    key={item.day}
                    className="flex h-full flex-1 flex-col items-center justify-end"
                  >
                    <div className="flex h-full w-full items-end justify-center gap-1">
                      <div
                        className="w-[38%] max-w-[18px] rounded-t-[4px] bg-[#8E001C] transition-all"
                        style={{ height: `${(item.visits / 20) * 100}%` }}
                        title={`Kunjungan ${item.day}: ${item.visits}`}
                      />
                      <div
                        className="w-[38%] max-w-[18px] rounded-t-[4px] bg-[#D5D5DA] transition-all"
                        style={{ height: `${(item.target / 20) * 100}%` }}
                        title={`Target ${item.day}: ${item.target}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* X-Axis */}
              <div className="flex justify-between px-1 text-center text-xs font-medium text-[#5A5660]">
                {desktopVisitChart.map((item) => (
                  <span key={item.day} className="flex-1">
                    {item.day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* Daftar Mesin */}
      <section className="rounded-[18px] border border-[#ECECEF] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#171717]">
          Daftar Mesin
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <label className="flex h-10 min-w-[200px] flex-1 items-center gap-2 rounded-full border border-[#E4E4E8] bg-[#FAFAFB] px-3.5">
            <Search size={16} className="shrink-0 text-[#77727A]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama mesin, pelanggan, atau lokasi..."
              className="w-full bg-transparent text-xs text-[#171717] outline-none placeholder:text-[#8E8994] sm:text-sm"
            />
          </label>

          <label className="flex h-10 min-w-[148px] items-center gap-2 rounded-full border border-[#E4E4E8] bg-white px-3.5">
            <Filter size={15} className="shrink-0 text-[#5A5660]" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full cursor-pointer bg-transparent text-xs font-medium text-[#29232A] outline-none sm:text-sm"
            >
              <option>Semua Status</option>
              <option>Sudah Dikunjungi</option>
              <option>Belum Dikunjungi</option>
              <option>Perlu Perhatian</option>
            </select>
          </label>

          <label className="flex h-10 min-w-[162px] items-center gap-2 rounded-full border border-[#E4E4E8] bg-white px-3.5">
            <Users size={15} className="shrink-0 text-[#5A5660]" />
            <select
              value={customerFilter}
              onChange={(event) => setCustomerFilter(event.target.value)}
              className="w-full cursor-pointer bg-transparent text-xs font-medium text-[#29232A] outline-none sm:text-sm"
            >
              <option>Semua Pelanggan</option>
              <option>PT. Sinar Mandiri</option>
              <option>CV. Multi Jaya</option>
              <option>PT. Prima Solusi</option>
              <option>PT. Citra Jaya</option>
            </select>
          </label>

          <Link
            href="/equipment"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-[#8E001C] px-4 text-xs font-semibold text-white shadow-[0_2px_6px_rgba(142,0,28,0.2)] transition hover:bg-[#730217] sm:text-sm"
          >
            <Plus size={16} strokeWidth={2.5} />
            Tambah
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="border-y border-[#EFEFF2] bg-[#F8F8FA] text-xs font-bold text-[#29232A]">
                <th className="px-3.5 py-3">No.</th>
                <th className="px-3.5 py-3">Kode Mesin</th>
                <th className="px-3.5 py-3">Nama Mesin</th>
                <th className="px-3.5 py-3">Pelanggan</th>
                <th className="px-3.5 py-3">Status Monitoring</th>
                <th className="px-3.5 py-3">Kunjungan Terakhir</th>
                <th className="px-3.5 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.code}
                  className="border-b border-[#EFEFF2] text-sm transition hover:bg-[#FCFAFB]"
                >
                  <td className="px-3.5 py-3.5 text-[#5A5660]">{row.no}</td>
                  <td className="px-3.5 py-3.5 font-semibold text-[#171717]">
                    {row.code}
                  </td>
                  <td className="px-3.5 py-3.5 text-[#29232A]">{row.model}</td>
                  <td className="px-3.5 py-3.5 text-[#29232A]">
                    {row.customer}
                  </td>
                  <td className="px-3.5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        row.status === "Sudah Dikunjungi"
                          ? "bg-[#FCECEF] text-[#8E001C]"
                          : row.status === "Perlu Perhatian"
                          ? "bg-[#FDECEE] text-[#B81432]"
                          : "bg-[#F1F1F4] text-[#55525A]"
                      }`}
                    >
                      {row.status === "Sudah Dikunjungi" ? (
                        <Check size={13} strokeWidth={2.8} />
                      ) : row.status === "Perlu Perhatian" ? (
                        <AlertTriangle size={13} strokeWidth={2.4} />
                      ) : (
                        <Hourglass size={13} strokeWidth={2.3} />
                      )}
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3.5 py-3.5 text-[#29232A]">
                    {row.lastVisit}
                  </td>
                  <td className="relative px-3.5 py-3.5 text-center">
                    <button
                      type="button"
                      aria-label={`Aksi ${row.code}`}
                      onClick={() =>
                        setOpenAction(openAction === row.code ? null : row.code)
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#5A5660] hover:bg-[#F3ECEF]"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openAction === row.code && (
                      <div className="absolute right-8 top-11 z-20 w-40 rounded-xl border border-[#E7E2E5] bg-white p-1 text-left shadow-lg">
                        <Link
                          href={`/equipment/${row.code}`}
                          className="block rounded-lg px-3 py-2 text-sm hover:bg-[#F8F2F4]"
                          onClick={() => setOpenAction(null)}
                        >
                          Lihat Detail
                        </Link>
                        <Link
                          href={`/visits/new?equipment=${row.code}`}
                          className="block rounded-lg px-3 py-2 text-sm hover:bg-[#F8F2F4]"
                          onClick={() => setOpenAction(null)}
                        >
                          Buat Kunjungan
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-[#77727A]"
                  >
                    Tidak ada data mesin yang sesuai dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   MOBILE DASHBOARD (UNIVERSAL PROPORTIONAL SCALE --u)
   Acuan: 412x914 -> --u = 1px. Otomatis menyesuaikan
   lebar (vw) & tinggi (dvh) di semua ukuran layar HP.
========================================================= */
const MOBILE_SCALE_VARS = {
  "--u": "clamp(0.72px, min(0.2427vw, 0.1094dvh), 1.06px)",
} as CSSProperties;

function MobileDashboard() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("Oktober 2025");
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  return (
    <main
      style={MOBILE_SCALE_VARS}
      className="min-h-dvh w-full overflow-x-clip bg-[#F7F7F7] pb-[calc(72*var(--u)+env(safe-area-inset-bottom))]"
    >
      <div className="relative mx-auto w-full max-w-[600px]">
        {/* Header Banner — Opsi C (Matte Grain + Hairline Arc) */}
        <header className="relative isolate h-[calc(206*var(--u)+env(safe-area-inset-top))] overflow-hidden bg-[#83051C] text-white">
          {/* Base micro-gradient (top color #83051C matches status bar theme-color) */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#83051C_0%,#760217_55%,#54000F_100%)]" />

          {/* Subtle matte grain texture */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[2] opacity-[0.045] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Subtle hairline arcs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-[52px] -top-[42px] z-[3] h-[250px] w-[250px] rounded-full border border-white/[0.08]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-[108px] -top-[98px] z-[3] h-[360px] w-[360px] rounded-full border border-white/[0.05]"
          />

          {/* Low-contrast ambient lift behind printer */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[8px] right-[18px] z-[4] h-[120px] w-[120px] rounded-full bg-[#D9163A]/20 blur-2xl"
          />

          {/* Top Bar: Logo & Notification (sama tinggi & sejajar tengah) */}
          <div className="absolute left-[calc(18*var(--u))] right-[calc(18*var(--u))] top-[calc(env(safe-area-inset-top)+calc(10*var(--u)))] z-30 flex h-[calc(34*var(--u))] items-center justify-between">
            <Link
              href="/"
              aria-label="MOKU Dashboard"
              className="flex h-full items-center"
            >
              <Image
                src="/images/moku/brand/moku-logo.png"
                alt="MOKU"
                width={180}
                height={65}
                priority
                className="h-[calc(23*var(--u))] w-auto object-contain object-left"
                sizes="150px"
              />
            </Link>

            <div className="relative flex h-full items-center">
              <button
                type="button"
                aria-label="Notifikasi"
                aria-expanded={showNotifications}
                onClick={() => setShowNotifications((previous) => !previous)}
                className="relative flex h-[calc(34*var(--u))] w-[calc(34*var(--u))] items-center justify-center rounded-full text-white"
              >
                <Bell
                  className="h-[calc(23*var(--u))] w-[calc(23*var(--u))]"
                  strokeWidth={1.8}
                />
                <span className="absolute right-[calc(4*var(--u))] top-[calc(4*var(--u))] h-[calc(8.5*var(--u))] w-[calc(8.5*var(--u))] rounded-full bg-[#FF3B30]" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-[calc(38*var(--u))] z-50 w-[min(280px,80vw)] rounded-xl border border-[#EEEEEE] bg-white p-4 text-[#29232A] shadow-xl">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">Notifikasi</p>
                    <button
                      type="button"
                      aria-label="Tutup notifikasi"
                      onClick={() => setShowNotifications(false)}
                    >
                      <X size={17} />
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-[#77727A]">
                    Belum ada notifikasi baru.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Greeting */}
          <div className="absolute left-[calc(18*var(--u))] top-[calc(env(safe-area-inset-top)+calc(66*var(--u)))] z-20 w-[calc(100%-calc(36*var(--u)))] pr-[calc(134*var(--u))]">
            <h1 className="whitespace-nowrap text-[calc(20.5*var(--u))] font-bold leading-[1.18] tracking-[-0.03em] text-white">
              Halo, Budi Santoso
            </h1>
            <p className="mt-[calc(5*var(--u))] max-w-[calc(205*var(--u))] text-[calc(11.5*var(--u))] font-normal leading-[1.38] text-white/85">
              Berikut ringkasan operasional kunjungan unit.
            </p>
          </div>

          {/* Printer illustration */}
          <div className="pointer-events-none absolute bottom-[calc(15*var(--u))] right-[calc(12*var(--u))] z-10 flex h-[calc(134*var(--u))] w-[calc(134*var(--u))] items-end justify-center">
            <Image
              src="/images/moku/illustrations/dashboard-printer.png"
              alt="Ilustrasi mesin printer"
              width={420}
              height={420}
              priority
              className="h-full w-full object-contain object-bottom drop-shadow-[0_10px_18px_rgba(45,0,10,0.28)]"
              sizes="154px"
            />
          </div>
        </header>

        {/* Canvas Konten */}
        <div className="relative z-20 -mt-[calc(28*var(--u))] flex flex-col gap-[calc(14*var(--u))] rounded-t-[calc(24*var(--u))] bg-[#F7F7F7] px-[calc(14*var(--u))] pt-[calc(15*var(--u))]">
          {/* 1. Status Monitoring Mesin */}
          <section className="min-w-0">
            <div className="flex min-w-0 items-center justify-between gap-[calc(8*var(--u))] px-[2px]">
              <SectionTitle>Status Monitoring Mesin</SectionTitle>

              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowMonthPicker((previous) => !previous)}
                  aria-expanded={showMonthPicker}
                  className="flex h-[calc(33*var(--u))] items-center gap-[calc(5*var(--u))] rounded-full border border-[#E6E6EA] bg-white px-[calc(11*var(--u))] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <CalendarDays className="h-[calc(14*var(--u))] w-[calc(14*var(--u))] shrink-0 text-[#171717]" />
                  <span className="whitespace-nowrap text-[calc(11.5*var(--u))] font-bold text-[#171717]">
                    {selectedMonth}
                  </span>
                  <ChevronDown className="h-[calc(13*var(--u))] w-[calc(13*var(--u))] shrink-0 text-[#171717]" />
                </button>

                {showMonthPicker && (
                  <div className="absolute right-0 top-[40px] z-50 w-[210px] overflow-hidden rounded-xl border border-[#EEE7EB] bg-white py-1.5 text-[#29232A] shadow-xl">
                    <p className="px-4 py-2 text-xs font-semibold text-[#817780]">
                      Pilih Periode
                    </p>
                    {MONTHS.map((month) => (
                      <button
                        key={month}
                        type="button"
                        onClick={() => {
                          setSelectedMonth(month);
                          setShowMonthPicker(false);
                        }}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm ${
                          selectedMonth === month
                            ? "bg-[#FCECEF] font-bold text-[#8E001C]"
                            : "text-[#51474E]"
                        }`}
                      >
                        {month}
                        {selectedMonth === month && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <MobileCard className="mt-[calc(8*var(--u))] px-[calc(12*var(--u))] py-[calc(12*var(--u))]">
              <div className="grid grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] items-center gap-[calc(10*var(--u))]">
                {/* Donut */}
                <div className="flex items-center justify-center border-r border-[#EAEAEF] pr-[calc(10*var(--u))]">
                  <div
                    className="relative aspect-square w-full max-w-[calc(114*var(--u))] rounded-full"
                    style={{
                      background:
                        "conic-gradient(from -32deg, #F28C0F 0deg 32deg, #8E001C 32deg 270deg, #E2E2E5 270deg 360deg)",
                    }}
                    role="img"
                    aria-label="48 mesin"
                  >
                    <div className="absolute inset-[15%] flex flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-[calc(30*var(--u))] font-extrabold leading-none tracking-[-0.05em] text-[#111111]">
                        48
                      </span>
                      <span className="mt-[2px] text-[calc(12*var(--u))] font-medium text-[#51474E]">
                        Mesin
                      </span>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="min-w-0 space-y-[calc(10*var(--u))]">
                  {monitoringData.map((item) => (
                    <div
                      key={item.label}
                      className="grid min-w-0 grid-cols-[calc(11*var(--u))_minmax(0,1fr)_auto_auto] items-center gap-[calc(5*var(--u))]"
                    >
                      <span
                        className="h-[calc(11*var(--u))] w-[calc(11*var(--u))] rounded-[3px]"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="min-w-0 truncate text-[calc(12*var(--u))] font-bold tracking-[-0.02em] text-[#171717]">
                        {item.label}
                      </span>
                      <span className="whitespace-nowrap text-[calc(11.5*var(--u))] text-[#51474E]">
                        {item.value} Mesin
                      </span>
                      <span
                        className={`min-w-[calc(36*var(--u))] rounded-full px-[calc(6*var(--u))] py-[calc(2.5*var(--u))] text-center text-[calc(10.5*var(--u))] font-bold ${item.badge}`}
                      >
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </MobileCard>
          </section>

          {/* 2. Kunjungan Bulan Ini */}
          <section className="min-w-0">
            <div className="flex min-w-0 items-center justify-between gap-[calc(8*var(--u))] px-[2px]">
              <SectionTitle>Kunjungan Bulan Ini</SectionTitle>
              <div className="flex shrink-0 items-center gap-[calc(5*var(--u))]">
                <Target
                  strokeWidth={2.3}
                  className="h-[calc(15*var(--u))] w-[calc(15*var(--u))] text-[#C81032]"
                />
                <span className="whitespace-nowrap text-[calc(12*var(--u))] font-medium text-[#29232A]">
                  Target: 40 Kunjungan
                </span>
              </div>
            </div>

            <MobileCard className="mt-[calc(8*var(--u))] px-[calc(14*var(--u))] py-[calc(13*var(--u))]">
              <div className="grid grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] items-center gap-[calc(10*var(--u))]">
                <div className="min-w-0 border-r border-[#EAEAEF] pr-[calc(9*var(--u))]">
                  <p className="text-[calc(42*var(--u))] font-extrabold leading-[0.95] tracking-[-0.05em] text-[#111111]">
                    32
                  </p>
                  <p className="mt-[calc(5*var(--u))] whitespace-nowrap text-[calc(12.5*var(--u))] font-medium text-[#29232A]">
                    Total Kunjungan
                  </p>
                </div>

                <div className="grid min-w-0 grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-[4px]">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-[4px] rounded-full bg-[#DCFCE7] px-[calc(9*var(--u))] py-[calc(3.5*var(--u))] text-[calc(12.5*var(--u))] font-bold text-[#15803D]">
                      <TrendingUp
                        strokeWidth={2.5}
                        className="h-[calc(13*var(--u))] w-[calc(13*var(--u))]"
                      />{" "}
                      +14%
                    </span>
                    <p className="mt-[calc(5*var(--u))] text-[calc(11.5*var(--u))] leading-[1.35] text-[#3F3A42]">
                      Dibanding bulan lalu
                      <br />
                      (28 kunjungan)
                    </p>
                  </div>

                  <div className="flex h-[calc(74*var(--u))] min-w-0 items-center justify-center">
                    <Image
                      src="/images/moku/illustrations/dashboard-activity.png"
                      alt="Ilustrasi checklist kunjungan"
                      width={240}
                      height={240}
                      className="h-full w-full object-contain"
                      sizes="110px"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-[calc(11*var(--u))]">
                <div className="mb-[calc(5*var(--u))] flex items-center justify-between">
                  <p className="text-[calc(12.5*var(--u))] font-bold text-[#171717]">
                    Pencapaian Target
                  </p>
                  <p className="text-[calc(12.5*var(--u))] font-extrabold text-[#111111]">
                    80%
                  </p>
                </div>
                <div className="h-[calc(9*var(--u))] overflow-hidden rounded-full bg-[#EAEAEF]">
                  <div
                    className="h-full rounded-full bg-[#8E001C]"
                    style={{ width: "80%" }}
                  />
                </div>
              </div>
            </MobileCard>
          </section>

          {/* 3. Aksi Cepat */}
          <section className="min-w-0">
            <div className="px-[2px]">
              <SectionTitle>Aksi Cepat</SectionTitle>
            </div>

            <MobileCard className="mt-[calc(8*var(--u))] px-[calc(8*var(--u))] py-[calc(12*var(--u))]">
              <div className="grid grid-cols-4">
                <QuickAction
                  href="/visits"
                  label={
                    <>
                      Kunjungan
                      <br />
                      Baru
                    </>
                  }
                >
                  <Plus
                    strokeWidth={2.5}
                    className="h-[calc(21*var(--u))] w-[calc(21*var(--u))]"
                  />
                </QuickAction>

                <QuickAction
                  href="/equipment"
                  separated
                  label={
                    <>
                      Tambah
                      <br />
                      Mesin
                    </>
                  }
                >
                  <Printer
                    strokeWidth={2.1}
                    className="h-[calc(19*var(--u))] w-[calc(19*var(--u))]"
                  />
                </QuickAction>

                <QuickAction href="/reports" separated label="Laporan">
                  <ChartNoAxesColumn
                    strokeWidth={2.2}
                    className="h-[calc(20*var(--u))] w-[calc(20*var(--u))]"
                  />
                </QuickAction>

                <QuickAction
                  href="/reports/export"
                  separated
                  label={
                    <>
                      Unduh
                      <br />
                      Laporan
                    </>
                  }
                >
                  <Download
                    strokeWidth={2.2}
                    className="h-[calc(19*var(--u))] w-[calc(19*var(--u))]"
                  />
                </QuickAction>
              </div>
            </MobileCard>
          </section>

          {/* 4. Mesin Perlu Perhatian */}
          <Link
            href="/monitoring"
            className="flex min-h-[calc(68*var(--u))] min-w-0 items-center gap-[calc(12*var(--u))] rounded-[calc(17*var(--u))] border border-[#F5E1D8] bg-[#FDF1EC] px-[calc(14*var(--u))] py-[calc(10*var(--u))]"
          >
            <AlertTriangle
              strokeWidth={2.1}
              className="h-[calc(28*var(--u))] w-[calc(28*var(--u))] shrink-0 text-[#F28C0F]"
            />

            <div className="min-w-0 flex-1">
              <p className="text-[calc(14*var(--u))] font-bold leading-[1.2] tracking-[-0.02em] text-[#171717]">
                Mesin Perlu Perhatian
              </p>
              <p className="mt-[calc(3*var(--u))] text-[calc(11.5*var(--u))] leading-[1.35] text-[#4A444D]">
                4 mesin belum dikunjungi pada {selectedMonth} dan memerlukan
                tindak lanjut.
              </p>
            </div>

            <ChevronRight
              strokeWidth={2.5}
              className="h-[calc(19*var(--u))] w-[calc(19*var(--u))] shrink-0 text-[#C81032]"
            />
          </Link>

          {/* 5. Aktivitas Terbaru */}
          <section className="min-w-0">
            <div className="flex min-w-0 items-center justify-between gap-[calc(8*var(--u))] px-[2px]">
              <SectionTitle>Aktivitas Terbaru</SectionTitle>
              <Link
                href="/visit-history"
                className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[calc(13*var(--u))] font-bold text-[#C81032]"
              >
                Lihat Semua
                <ChevronRight
                  strokeWidth={2.5}
                  className="h-[calc(16*var(--u))] w-[calc(16*var(--u))]"
                />
              </Link>
            </div>

            <MobileCard className="mt-[calc(8*var(--u))] divide-y divide-[#EFEFF2] px-[calc(12*var(--u))]">
              {recentActivities.map((activity, index) => (
                <div
                  key={`${activity.machine}-${index}`}
                  className="flex min-h-[calc(60*var(--u))] min-w-0 items-center gap-[calc(10*var(--u))] py-[calc(9*var(--u))]"
                >
                  <div
                    className={`flex h-[calc(38*var(--u))] w-[calc(38*var(--u))] shrink-0 items-center justify-center rounded-full ${
                      activity.status === "success"
                        ? "bg-[#E2F7E9] text-[#1D9A4E]"
                        : "bg-[#F3F3F5] text-[#C81032]"
                    }`}
                  >
                    {activity.status === "success" ? (
                      <Check
                        strokeWidth={2.8}
                        className="h-[calc(19*var(--u))] w-[calc(19*var(--u))]"
                      />
                    ) : (
                      <Clock3
                        strokeWidth={2.3}
                        className="h-[calc(19*var(--u))] w-[calc(19*var(--u))]"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[calc(13.5*var(--u))] font-bold leading-tight text-[#171717]">
                      {activity.title}
                    </p>
                    <p className="mt-[calc(3*var(--u))] truncate text-[calc(11.5*var(--u))] leading-tight text-[#6E6873]">
                      {activity.machine} • {activity.customer}
                    </p>
                  </div>

                  <span
                    className={`min-w-[calc(68*var(--u))] shrink-0 whitespace-nowrap rounded-full px-[calc(10*var(--u))] py-[calc(4*var(--u))] text-center text-[calc(11*var(--u))] font-semibold ${
                      activity.status === "success"
                        ? index === 0
                          ? "bg-[#DCF7D8] text-[#2F682A]"
                          : "bg-[#EFEFF1] text-[#4E4A52]"
                        : "bg-[#FCE6E9] text-[#A81830]"
                    }`}
                  >
                    {activity.time}
                  </span>
                </div>
              ))}
            </MobileCard>
          </section>

          {/* Footer */}
          <div className="pb-[calc(12*var(--u))] pt-[calc(4*var(--u))] text-center">
            <p className="text-[calc(10*var(--u))] text-[#A39AA0]">
              MOKU — Monitoring Operasional Kunjungan Unit
            </p>
            <p className="mt-[calc(4*var(--u))] text-[calc(10*var(--u))] text-[#B3ABB0]">
              Track Precisely, Deliver Quality
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   DASHBOARD PAGE (SYNCED WITH AppShell)
========================================================= */
export default function DashboardPage() {
  const { isMobile, isReady } = useAppLayout();

  if (!isReady) {
    return (
      <div
        className="min-h-dvh w-full bg-[#F7F7F7]"
        aria-label="Memuat Dashboard"
      />
    );
  }

  return isMobile ? <MobileDashboard /> : <DesktopDashboard />;
}
