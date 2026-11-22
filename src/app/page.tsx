"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
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
    <h2 className="min-w-0 whitespace-nowrap text-[clamp(15.5px,4.3vw,19px)] font-bold leading-[1.2] tracking-[-0.04em] text-[#171717]">
      {children}
    </h2>
  );
}

function MobileCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-[clamp(16px,4.8vw,21px)] border border-[#EEEEEE] bg-white shadow-[0_2px_9px_rgba(0,0,0,0.055)] ${className}`}
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
      className={`flex min-w-0 flex-col items-center justify-start gap-[clamp(5px,1.5vw,8px)] px-1 text-center ${
        separated ? "border-l border-[#EAEAEF]" : ""
      }`}
    >
      <span className="flex h-[clamp(38px,10.5vw,46px)] w-[clamp(38px,10.5vw,46px)] shrink-0 items-center justify-center rounded-[clamp(11px,3vw,13px)] bg-[#8E001C] text-white shadow-[0_2px_6px_rgba(142,0,28,0.2)]">
        {children}
      </span>
      <span className="text-[clamp(11px,3vw,12.5px)] font-medium leading-[1.2] tracking-[-0.02em] text-[#1F1B20]">
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
   MOBILE DASHBOARD (<= 600px, FLUID WIDTH + HEIGHT SCALING)
========================================================= */
function MobileDashboard() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("Oktober 2025");
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  return (
    <main className="min-h-dvh w-full overflow-x-clip bg-[#F7F7F7] pb-[calc(80px+env(safe-area-inset-bottom))]">
      <div className="relative mx-auto w-full max-w-[600px]">
        {/* Header Banner — Opsi C (Matte Grain + Hairline Arc) */}
        <header
          className="relative isolate overflow-hidden bg-[#730217] text-white"
          style={{
            height: "clamp(182px, 23.5dvh, 232px)",
          }}
        >
          {/* Base micro-gradient */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_95%_at_18%_18%,#9B0823_0%,#760217_54%,#54000F_100%)]" />

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

          {/* Logo and notification */}
          <div className="absolute left-[clamp(14px,4.5vw,20px)] right-[clamp(14px,4.5vw,20px)] top-[max(20px,calc(env(safe-area-inset-top)+6px))] z-30 flex items-center justify-between">
            <Link
              href="/"
              aria-label="MOKU Dashboard"
              className="flex items-center"
            >
              <Image
                src="/images/moku/brand/moku-logo.png"
                alt="MOKU"
                width={180}
                height={65}
                priority
                className="h-[clamp(30px,8.5vw,38px)] w-auto object-contain object-left"
                sizes="180px"
              />
            </Link>

            <div className="relative">
              <button
                type="button"
                aria-label="Notifikasi"
                aria-expanded={showNotifications}
                onClick={() => setShowNotifications((previous) => !previous)}
                className="relative flex h-[clamp(36px,9.5vw,42px)] w-[clamp(36px,9.5vw,42px)] items-center justify-center rounded-full text-white"
              >
                <Bell size={24} strokeWidth={1.8} />
                <span className="absolute right-[6px] top-[5px] h-[9px] w-[9px] rounded-full bg-[#FF3B30]" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-[min(280px,80vw)] rounded-xl border border-[#EEEEEE] bg-white p-4 text-[#29232A] shadow-xl">
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
          <div className="absolute left-[clamp(14px,4.5vw,20px)] top-[max(66px,calc(env(safe-area-inset-top)+44px))] z-20 w-[calc(100%-clamp(28px,9vw,40px))] pr-[clamp(112px,30vw,142px)]">
            <h1 className="whitespace-nowrap text-[clamp(20px,5.6vw,26px)] font-bold leading-[1.15] tracking-[-0.035em] text-white">
              Halo, Budi Santoso
            </h1>
            <p className="mt-[4px] max-w-[215px] text-[clamp(11.5px,3.2vw,13.5px)] font-normal leading-[1.35] text-white/85">
              Berikut ringkasan operasional kunjungan unit.
            </p>
          </div>

          {/* Printer illustration */}
          <div className="pointer-events-none absolute bottom-[clamp(12px,1.8dvh,18px)] right-[clamp(8px,3vw,14px)] z-10 flex h-[clamp(108px,14.5dvh,146px)] w-[clamp(108px,30vw,146px)] items-end justify-center">
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
        <div className="relative z-20 -mt-[clamp(24px,3.2dvh,34px)] flex flex-col gap-[clamp(10px,1.7dvh,18px)] rounded-t-[clamp(22px,6vw,26px)] bg-[#F7F7F7] px-[clamp(12px,3.8vw,16px)] pt-[clamp(12px,1.8dvh,18px)]">
          {/* 1. Status Monitoring Mesin */}
          <section className="min-w-0">
            <div className="flex min-w-0 items-center justify-between gap-2 px-[2px]">
              <SectionTitle>Status Monitoring Mesin</SectionTitle>

              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowMonthPicker((previous) => !previous)}
                  aria-expanded={showMonthPicker}
                  className="flex h-[clamp(30px,8vw,36px)] items-center gap-[clamp(4px,1.4vw,6px)] rounded-full border border-[#E6E6EA] bg-white px-[clamp(9px,2.8vw,12px)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <CalendarDays
                    size={15}
                    className="shrink-0 text-[#171717]"
                  />
                  <span className="whitespace-nowrap text-[clamp(11px,2.9vw,12px)] font-bold text-[#171717]">
                    {selectedMonth}
                  </span>
                  <ChevronDown size={14} className="shrink-0 text-[#171717]" />
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

            <MobileCard className="mt-[clamp(6px,1dvh,10px)] px-[clamp(10px,3.2vw,14px)] py-[clamp(9px,1.4dvh,14px)]">
              <div className="grid grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] items-center gap-[clamp(8px,2.5vw,12px)]">
                {/* Donut */}
                <div className="flex items-center justify-center border-r border-[#EAEAEF] pr-[clamp(8px,2.5vw,12px)]">
                  <div
                    className="relative aspect-square w-full max-w-[clamp(92px,25vw,130px)] rounded-full"
                    style={{
                      background:
                        "conic-gradient(from -32deg, #F28C0F 0deg 32deg, #8E001C 32deg 270deg, #E2E2E5 270deg 360deg)",
                    }}
                    role="img"
                    aria-label="48 mesin"
                  >
                    <div className="absolute inset-[15%] flex flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-[clamp(24px,6.8vw,36px)] font-extrabold leading-none tracking-[-0.05em] text-[#111111]">
                        48
                      </span>
                      <span className="mt-[2px] text-[clamp(11px,3vw,13px)] font-medium text-[#51474E]">
                        Mesin
                      </span>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="min-w-0 space-y-[clamp(7px,1.1dvh,12px)]">
                  {monitoringData.map((item) => (
                    <div
                      key={item.label}
                      className="grid min-w-0 grid-cols-[clamp(10px,2.8vw,12px)_minmax(0,1fr)_auto_auto] items-center gap-[clamp(4px,1.4vw,6px)]"
                    >
                      <span
                        className="h-[clamp(10px,2.8vw,12px)] w-[clamp(10px,2.8vw,12px)] rounded-[3px]"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="min-w-0 truncate text-[clamp(10.5px,2.8vw,13px)] font-bold tracking-[-0.02em] text-[#171717]">
                        {item.label}
                      </span>
                      <span className="whitespace-nowrap text-[clamp(10px,2.6vw,12.5px)] text-[#51474E]">
                        {item.value} Mesin
                      </span>
                      <span
                        className={`min-w-[clamp(34px,9vw,38px)] rounded-full px-[clamp(5px,1.5vw,6px)] py-[clamp(2px,0.7vw,3px)] text-center text-[clamp(10px,2.6vw,11px)] font-bold ${item.badge}`}
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
            <div className="flex min-w-0 items-center justify-between gap-2 px-[2px]">
              <SectionTitle>Kunjungan Bulan Ini</SectionTitle>
              <div className="flex shrink-0 items-center gap-[clamp(4px,1.2vw,5px)]">
                <Target size={16} strokeWidth={2.3} className="text-[#C81032]" />
                <span className="whitespace-nowrap text-[clamp(11px,3vw,12.5px)] font-medium text-[#29232A]">
                  Target: 40 Kunjungan
                </span>
              </div>
            </div>

            <MobileCard className="mt-[clamp(6px,1dvh,10px)] px-[clamp(12px,3.6vw,16px)] py-[clamp(10px,1.5dvh,15px)]">
              <div className="grid grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] items-center gap-[clamp(8px,2.8vw,12px)]">
                <div className="min-w-0 border-r border-[#EAEAEF] pr-[clamp(8px,2.4vw,10px)]">
                  <p className="text-[clamp(34px,9.5vw,48px)] font-extrabold leading-[0.95] tracking-[-0.05em] text-[#111111]">
                    32
                  </p>
                  <p className="mt-[clamp(4px,1.2vw,6px)] whitespace-nowrap text-[clamp(11.5px,3vw,13px)] font-medium text-[#29232A]">
                    Total Kunjungan
                  </p>
                </div>

                <div className="grid min-w-0 grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-[4px]">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-[4px] rounded-full bg-[#DCFCE7] px-[clamp(8px,2.4vw,10px)] py-[clamp(3px,0.8vw,4px)] text-[clamp(12px,3.2vw,13.5px)] font-bold text-[#15803D]">
                      <TrendingUp size={14} strokeWidth={2.5} /> +14%
                    </span>
                    <p className="mt-[clamp(4px,1.2vw,6px)] text-[clamp(10.5px,2.8vw,12px)] leading-[1.35] text-[#3F3A42]">
                      Dibanding bulan lalu
                      <br />
                      (28 kunjungan)
                    </p>
                  </div>

                  <div className="flex h-[clamp(60px,8dvh,84px)] min-w-0 items-center justify-center">
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

              <div className="mt-[clamp(8px,1.3dvh,14px)]">
                <div className="mb-[5px] flex items-center justify-between">
                  <p className="text-[clamp(11.5px,3vw,13px)] font-bold text-[#171717]">
                    Pencapaian Target
                  </p>
                  <p className="text-[clamp(11.5px,3vw,13px)] font-extrabold text-[#111111]">
                    80%
                  </p>
                </div>
                <div className="h-[clamp(8px,1.1dvh,10px)] overflow-hidden rounded-full bg-[#EAEAEF]">
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

            <MobileCard className="mt-[clamp(6px,1dvh,10px)] px-[clamp(6px,2.2vw,10px)] py-[clamp(9px,1.4dvh,14px)]">
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
                  <Plus size={22} strokeWidth={2.5} />
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
                  <Printer size={20} strokeWidth={2.1} />
                </QuickAction>

                <QuickAction href="/reports" separated label="Laporan">
                  <ChartNoAxesColumn size={21} strokeWidth={2.2} />
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
                  <Download size={20} strokeWidth={2.2} />
                </QuickAction>
              </div>
            </MobileCard>
          </section>

          {/* 4. Mesin Perlu Perhatian */}
          <Link
            href="/monitoring"
            className="flex min-h-[clamp(60px,8dvh,78px)] min-w-0 items-center gap-[clamp(10px,3vw,14px)] rounded-[clamp(15px,4.2vw,18px)] border border-[#F5E1D8] bg-[#FDF1EC] px-[clamp(12px,3.6vw,16px)] py-[clamp(8px,1.2dvh,12px)]"
          >
            <AlertTriangle
              size={30}
              strokeWidth={2.1}
              className="shrink-0 text-[#F28C0F]"
            />

            <div className="min-w-0 flex-1">
              <p className="text-[clamp(13px,3.5vw,14.5px)] font-bold leading-[1.2] tracking-[-0.02em] text-[#171717]">
                Mesin Perlu Perhatian
              </p>
              <p className="mt-[3px] text-[clamp(11px,2.9vw,12px)] leading-[1.35] text-[#4A444D]">
                4 mesin belum dikunjungi pada {selectedMonth} dan memerlukan
                tindak lanjut.
              </p>
            </div>

            <ChevronRight
              size={20}
              strokeWidth={2.5}
              className="shrink-0 text-[#C81032]"
            />
          </Link>

          {/* 5. Aktivitas Terbaru */}
          <section className="min-w-0">
            <div className="flex min-w-0 items-center justify-between gap-2 px-[2px]">
              <SectionTitle>Aktivitas Terbaru</SectionTitle>
              <Link
                href="/visit-history"
                className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[clamp(12px,3.2vw,13.5px)] font-bold text-[#C81032]"
              >
                Lihat Semua
                <ChevronRight size={17} strokeWidth={2.5} />
              </Link>
            </div>

            <MobileCard className="mt-[clamp(6px,1dvh,10px)] divide-y divide-[#EFEFF2] px-[clamp(10px,3.2vw,14px)]">
              {recentActivities.map((activity, index) => (
                <div
                  key={`${activity.machine}-${index}`}
                  className="flex min-h-[clamp(54px,7.2dvh,66px)] min-w-0 items-center gap-[clamp(9px,2.8vw,12px)] py-[clamp(7px,1dvh,10px)]"
                >
                  <div
                    className={`flex h-[clamp(36px,9.8vw,42px)] w-[clamp(36px,9.8vw,42px)] shrink-0 items-center justify-center rounded-full ${
                      activity.status === "success"
                        ? "bg-[#E2F7E9] text-[#1D9A4E]"
                        : "bg-[#F3F3F5] text-[#C81032]"
                    }`}
                  >
                    {activity.status === "success" ? (
                      <Check size={20} strokeWidth={2.8} />
                    ) : (
                      <Clock3 size={20} strokeWidth={2.3} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[clamp(12.5px,3.4vw,14px)] font-bold leading-tight text-[#171717]">
                      {activity.title}
                    </p>
                    <p className="mt-[3px] truncate text-[clamp(11px,2.9vw,12px)] leading-tight text-[#6E6873]">
                      {activity.machine} • {activity.customer}
                    </p>
                  </div>

                  <span
                    className={`min-w-[clamp(64px,17.5vw,74px)] shrink-0 whitespace-nowrap rounded-full px-[clamp(9px,2.8vw,12px)] py-[clamp(4px,1.2vw,5px)] text-center text-[clamp(10.5px,2.8vw,11.5px)] font-semibold ${
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
          <div className="pb-3 pt-1 text-center">
            <p className="text-[clamp(9.5px,2.4vw,10.5px)] text-[#A39AA0]">
              MOKU — Monitoring Operasional Kunjungan Unit
            </p>
            <p className="mt-1 text-[clamp(9.5px,2.4vw,10.5px)] text-[#B3ABB0]">
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
