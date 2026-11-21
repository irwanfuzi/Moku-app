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
  CheckCircle2,
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
  TrendingUp,
  Users,
  X,
  Target,
} from "lucide-react";

import { useAppLayout } from "@/components/layout/app-shell";

/* =========================================================
   MOKU DESIGN SYSTEM
========================================================= */

const COLORS = {
  burgundy: "#730217",
  crimson: "#BF0B2C",
  orange: "#F28C0F",
  orangeRed: "#EB5513",
  background: "#F7F7F7",
  surface: "#FFFFFF",
  text: "#171717",
  secondary: "#625B61",
  muted: "#89838A",
  border: "#EEEEEE",
};

const CARD =
  "rounded-[19px] border border-[#EEEEEE] bg-white shadow-[0_3px_14px_rgba(30,20,24,0.055)]";

const MONTHS = [
  "September 2025",
  "Oktober 2025",
  "November 2025",
  "Desember 2025",
  "Januari 2026",
];

/* =========================================================
   DASHBOARD DATA
========================================================= */

const monitoringData = [
  {
    label: "Sudah Dikunjungi",
    value: 32,
    percentage: 66,
    color: COLORS.crimson,
    badge: "bg-[#FCECEF] text-[#BF0B2C]",
  },
  {
    label: "Belum Dikunjungi",
    value: 12,
    percentage: 25,
    color: "#D9D9D9",
    badge: "bg-[#F1F1F1] text-[#666666]",
  },
  {
    label: "Perlu Perhatian",
    value: 4,
    percentage: 9,
    color: COLORS.orange,
    badge: "bg-[#FFF0E5] text-[#EB5513]",
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

/* =========================================================
   SHARED COMPONENTS
========================================================= */

function SectionTitle({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <h2 className="text-[clamp(17px,4.5cqw,20px)] font-bold leading-[1.2] tracking-[-0.035em] text-[#171717]">
      {children}
    </h2>
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
      className={`flex min-w-0 flex-col items-center justify-center gap-[9px] px-1 py-2 text-center ${
        separated ? "border-l border-[#E9E7E9]" : ""
      }`}
    >
      <span className="flex h-[clamp(36px,9.5cqw,42px)] w-[clamp(36px,9.5cqw,42px)] shrink-0 items-center justify-center rounded-[12px] bg-[#BF0B2C] text-white shadow-[0_2px_4px_rgba(191,11,44,0.12)]">
        {children}
      </span>

      <span className="min-h-[2.3em] text-[clamp(12px,3.3cqw,14px)] font-medium leading-[1.18] tracking-[-0.02em] text-[#29232A]">
        {label}
      </span>
    </Link>
  );
}

/* =========================================================
   DESKTOP DASHBOARD
========================================================= */

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

function DesktopDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("Semua Status");
  const [customerFilter, setCustomerFilter] =
    useState("Semua Pelanggan");
  const [openAction, setOpenAction] =
    useState<string | null>(null);
  const [desktopMonth, setDesktopMonth] =
    useState("Oktober 2025");

  const filteredRows = desktopMachineRows.filter((row) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      [row.code, row.model, row.customer, row.status].some(
        (value) => value.toLowerCase().includes(query)
      );

    const matchesStatus =
      statusFilter === "Semua Status" ||
      row.status === statusFilter;

    const matchesCustomer =
      customerFilter === "Semua Pelanggan" ||
      row.customer === customerFilter;

    return matchesSearch && matchesStatus && matchesCustomer;
  });

  const kpis = [
    { label: "Total Mesin", value: "48", icon: Printer },
    { label: "Sudah Dikunjungi", value: "32", icon: Check },
    { label: "Belum Dikunjungi", value: "12", icon: Hourglass },
    { label: "Perlu Perhatian", value: "4", icon: AlertTriangle },
  ];

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6 px-6 py-6 text-[#171717]">

      <header className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <h1 className="text-[34px] font-bold tracking-tight text-[#730217]">
            Dashboard
          </h1>
          <p className="mt-1 text-[15px] text-[#625B61]">
            Ringkasan aktivitas dan monitoring kunjungan mesin.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex h-[46px] min-w-[210px] items-center gap-3 rounded-xl border border-[#EEEEEE] bg-white px-3 shadow-sm">
            <CalendarDays size={20} />
            <select
              value={desktopMonth}
              onChange={(e) => setDesktopMonth(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold outline-none"
            >
              {MONTHS.map((month) => (
                <option key={month}>{month}</option>
              ))}
            </select>
          </label>

          <Link
            href="/notifications"
            aria-label="Notifikasi"
            className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-[#F5F5F5]"
          >
            <Bell size={23} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#BF0B2C]" />
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5E8EC] font-bold text-[#730217]">
              B
            </span>
            <span>
              <strong className="block text-sm">
                Budi Santoso
              </strong>
              <small className="text-xs text-[#89838A]">
                Teknisi
              </small>
            </span>
          </Link>
        </div>
      </header>

      {/* KPI CARDS */}

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex min-h-[115px] items-center gap-4 rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-[0_3px_14px_rgba(30,20,24,0.045)]"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#730217] text-white">
              <Icon size={28} />
            </span>
            <span>
              <span className="block text-sm font-medium text-[#625B61]">
                {label}
              </span>
              <strong className="mt-1 block text-3xl font-bold">
                {value}
              </strong>
            </span>
          </div>
        ))}
      </section>

      {/* CHARTS */}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        <article className="rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold">
            Status Monitoring Mesin
          </h2>

          <div className="mt-6 flex items-center justify-center gap-8">
            <div
              className="relative h-[180px] w-[180px] shrink-0 rounded-full"
              style={{
                background:
                  "conic-gradient(#BF0B2C 0deg 237deg, #D9D9D9 237deg 327deg, #F28C0F 327deg 360deg)",
              }}
            >
              <div className="absolute inset-[29px] flex flex-col items-center justify-center rounded-full bg-white">
                <strong className="text-4xl font-bold">48</strong>
                <span className="text-sm text-[#625B61]">
                  Mesin
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-6">
              {monitoringData.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 text-sm"
                >
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="flex-1">
                    {item.label}
                  </span>
                  <strong>{item.value} Mesin</strong>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${item.badge}`}>
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Kunjungan Bulan Ini
            </h2>
            <span className="text-sm text-[#625B61]">
              Target: 40 Kunjungan
            </span>
          </div>

          <div className="mt-6 grid h-[180px] grid-cols-7 items-end gap-4">
            {desktopVisitChart.map((item) => (
              <div
                key={item.day}
                className="flex h-full flex-col items-center justify-end gap-2"
              >
                <div className="flex h-[145px] w-full items-end justify-center gap-1">
                  <div
                    className="w-1/3 rounded-t-md bg-[#BF0B2C]"
                    style={{
                      height: `${(item.visits / 20) * 100}%`,
                    }}
                  />
                  <div
                    className="w-1/3 rounded-t-md bg-[#D9D9D9]"
                    style={{
                      height: `${(item.target / 20) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-[#625B61]">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </article>

      </section>

      {/* MACHINE TABLE */}

      <section className="rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-sm">

        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold">
            Daftar Mesin
          </h2>

          <Link
            href="/equipment"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#730217] px-4 text-sm font-semibold text-white"
          >
            <Plus size={18} />
            Tambah Mesin
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">

          <label className="flex h-10 min-w-[250px] flex-1 items-center gap-2 rounded-xl border border-[#EEEEEE] px-3">
            <Search size={18} className="text-[#89838A]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari mesin atau pelanggan..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          <label className="flex h-10 items-center gap-2 rounded-xl border border-[#EEEEEE] px-3">
            <Filter size={17} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              <option>Semua Status</option>
              <option>Sudah Dikunjungi</option>
              <option>Belum Dikunjungi</option>
              <option>Perlu Perhatian</option>
            </select>
          </label>

          <label className="flex h-10 items-center gap-2 rounded-xl border border-[#EEEEEE] px-3">
            <Users size={17} />
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              <option>Semua Pelanggan</option>
              <option>PT. Sinar Mandiri</option>
              <option>CV. Multi Jaya</option>
              <option>PT. Prima Solusi</option>
              <option>PT. Citra Jaya</option>
            </select>
          </label>

        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead>
              <tr className="bg-[#F7F7F7] text-xs font-bold text-[#625B61]">
                {[
                  "No.",
                  "Kode Mesin",
                  "Nama Mesin",
                  "Pelanggan",
                  "Status Monitoring",
                  "Kunjungan Terakhir",
                  "Aksi",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.code}
                  className="border-b border-[#EEEEEE] text-sm"
                >
                  <td className="px-4 py-4">{row.no}</td>
                  <td className="px-4 py-4 font-semibold">{row.code}</td>
                  <td className="px-4 py-4">{row.model}</td>
                  <td className="px-4 py-4">{row.customer}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-[#FCECEF] px-3 py-1.5 text-xs font-medium text-[#BF0B2C]">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">{row.lastVisit}</td>
                  <td className="relative px-4 py-4">
                    <button
                      type="button"
                      aria-label={`Aksi ${row.code}`}
                      onClick={() =>
                        setOpenAction(
                          openAction === row.code ? null : row.code
                        )
                      }
                      className="rounded-lg p-2 hover:bg-[#F5F5F5]"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openAction === row.code && (
                      <div className="absolute right-5 top-12 z-20 w-44 rounded-xl border border-[#EEEEEE] bg-white p-1 shadow-lg">
                        <Link
                          href="/equipment"
                          className="block rounded-lg px-3 py-2 text-sm hover:bg-[#F7F7F7]"
                        >
                          Detail Mesin
                        </Link>
                        <Link
                          href="/visit-history"
                          className="block rounded-lg px-3 py-2 text-sm hover:bg-[#F7F7F7]"
                        >
                          Riwayat Kunjungan
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
                    className="px-4 py-10 text-center text-sm text-[#89838A]"
                  >
                    Tidak ada mesin yang sesuai dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </section>
    </main>
  );
}

/* =========================================================
   MOBILE DASHBOARD
========================================================= */

export default function DashboardPage() {
  const { isMobile, isReady } = useAppLayout();

  const [selectedMonth, setSelectedMonth] =
    useState("Oktober 2025");

  const [showMonthPicker, setShowMonthPicker] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);

  if (!isReady) {
    return null;
  }

  if (!isMobile) {
    return <DesktopDashboard />;
  }

  return (
    <main className="relative w-full overflow-x-clip bg-[#F7F7F7] pb-[calc(70px+env(safe-area-inset-bottom))] [container-type:inline-size]">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="relative isolate h-[clamp(235px,65cqw,285px)] overflow-hidden bg-[#730217] px-[clamp(20px,5cqw,24px)] pt-[max(22px,env(safe-area-inset-top))] text-white">

        {/* GRADIENT BACKGROUND */}

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_45%_35%,rgba(191,11,44,0.24),transparent_65%)]" />

        {/* ORIGINAL HEADER WAVE ASSET */}

        <div className="pointer-events-none absolute inset-x-0 bottom-[-1px] z-[1]">
          <Image
            src="/images/moku/illustrations/header-wave.png"
            alt=""
            width={1536}
            height={512}
            priority
            className="block h-auto w-full mix-blend-screen opacity-95"
            sizes="100vw"
          />
        </div>

        {/* HEADER CONTENT */}

        <div className="relative z-10">

          {/* BRAND */}

          <div className="flex items-center justify-between">

            <Link
              href="/"
              aria-label="MOKU Dashboard"
              className="flex items-center"
            >
              <Image
                src="/images/moku/brand/moku-logo.png"
                alt="MOKU"
                width={190}
                height={70}
                priority
                className="h-auto w-[clamp(108px,28cqw,124px)] object-contain object-left"
              />
            </Link>

            {/* NOTIFICATION */}

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowNotifications((value) => !value)
                }
                aria-label="Notifikasi"
                aria-expanded={showNotifications}
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-white"
              >
                <Bell size={27} strokeWidth={1.8} />

                <span className="absolute right-[5px] top-[5px] h-[11px] w-[11px] rounded-full border-2 border-[#730217] bg-[#F28C0F]" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-[260px] rounded-2xl border border-[#EEE7EB] bg-white p-4 text-[#29232A] shadow-lg">

                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-bold">
                      Notifikasi
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setShowNotifications(false)
                      }
                      aria-label="Tutup notifikasi"
                    >
                      <X size={17} />
                    </button>
                  </div>

                  <div className="flex gap-3 border-t border-[#F0E9ED] py-3">
                    <AlertTriangle
                      size={18}
                      className="shrink-0 text-[#F28C0F]"
                    />

                    <div>
                      <p className="text-xs font-semibold">
                        Mesin Perlu Perhatian
                      </p>

                      <p className="mt-1 text-[11px] text-[#817780]">
                        4 mesin memerlukan tindak lanjut.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/notifications"
                    onClick={() =>
                      setShowNotifications(false)
                    }
                    className="block border-t border-[#F0E9ED] pt-3 text-center text-xs font-semibold text-[#BF0B2C]"
                  >
                    Lihat Semua Notifikasi
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* GREETING */}

          <div className="relative mt-[clamp(13px,4cqw,18px)]">

            <div className="relative z-[2] max-w-[75%]">

              <h1 className="text-[clamp(22px,5.8cqw,25px)] font-bold leading-[1.16] tracking-[-0.035em] text-white">
                Halo, Budi Santoso
              </h1>

              <p className="mt-1 max-w-[310px] text-[clamp(13px,3.5cqw,15px)] font-normal leading-[1.3] tracking-[-0.015em] text-white/90">
                Berikut ringkasan operasional kunjungan unit.
              </p>

            </div>

            {/* PRINTER ILLUSTRATION ASSET */}

            <div className="pointer-events-none absolute right-[-5px] top-[clamp(5px,2cqw,12px)] z-[2] flex h-[clamp(132px,37cqw,165px)] w-[clamp(132px,37cqw,165px)] items-center justify-center">

              <Image
                src="/images/moku/illustrations/dashboard-printer.png"
                alt=""
                width={400}
                height={400}
                priority
                className="h-full w-full object-contain [filter:drop-shadow(0_7px_9px_rgba(35,0,8,0.16))]"
                sizes="(max-width:440px) 165px, 180px"
              />

            </div>
          </div>
        </div>
      </header>

      {/* =================================================
          MAIN WHITE CANVAS
      ================================================= */}

      <div className="relative z-20 -mt-[24px] min-h-screen rounded-t-[30px] bg-[#F7F7F7] px-[clamp(11px,3cqw,14px)] pt-[18px]">

        <div className="mx-auto w-full max-w-[520px] space-y-[clamp(14px,3.8cqw,18px)]">

          {/* =============================================
              STATUS MONITORING
          ============================================= */}

          <section>

            <div className="mb-[11px] flex min-w-0 items-center justify-between gap-2">

              <SectionTitle>
                Status Monitoring Mesin
              </SectionTitle>

              {/* PERIOD */}

              <div className="relative z-30 shrink-0">

                <button
                  type="button"
                  onClick={() =>
                    setShowMonthPicker((value) => !value)
                  }
                  aria-expanded={showMonthPicker}
                  className="flex h-[clamp(38px,10cqw,44px)] w-[clamp(145px,40cqw,190px)] items-center gap-2 rounded-full border border-[#EEEEEE] bg-white px-3 shadow-[0_3px_10px_rgba(30,20,24,0.055)]"
                >
                  <CalendarDays
                    size={19}
                    className="shrink-0 text-[#29232A]"
                  />

                  <span className="min-w-0 flex-1 whitespace-nowrap text-left text-[clamp(11px,3cqw,13px)] font-semibold text-[#29232A]">
                    {selectedMonth}
                  </span>

                  <ChevronDown
                    size={16}
                    className="shrink-0 text-[#29232A]"
                  />
                </button>

                {showMonthPicker && (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[210px] overflow-hidden rounded-2xl border border-[#EEE7EB] bg-white py-2 shadow-xl">

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
                        className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                          selectedMonth === month
                            ? "bg-[#FCECEF] font-bold text-[#BF0B2C]"
                            : "text-[#51474E]"
                        }`}
                      >
                        {month}

                        {selectedMonth === month && (
                          <Check size={16} />
                        )}
                      </button>
                    ))}

                  </div>
                )}
              </div>
            </div>

            {/* STATUS CARD */}

            <div className={`${CARD} p-[clamp(12px,3.3cqw,16px)]`}>

              <div className="grid min-w-0 grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] items-center gap-2">

                {/* DONUT */}

                <div className="flex min-w-0 items-center justify-center border-r border-[#EEEEEE] pr-2">

                  <div
                    className="relative aspect-square w-full max-w-[clamp(100px,28cqw,132px)] rounded-full"
                    style={{
                      background:
                        "conic-gradient(#BF0B2C 0deg 237deg, #D9D9D9 237deg 327deg, #F28C0F 327deg 360deg)",
                    }}
                  >

                    <div className="absolute inset-[15%] flex flex-col items-center justify-center rounded-full bg-white">

                      <span className="text-[clamp(29px,8.5cqw,37px)] font-bold leading-none tracking-[-0.045em] text-[#111111]">
                        48
                      </span>

                      <span className="mt-1 text-[clamp(12px,3.3cqw,14px)] font-medium text-[#51474E]">
                        Mesin
                      </span>

                    </div>
                  </div>
                </div>

                {/* LEGEND */}

                <div className="min-w-0 space-y-[clamp(9px,2.6cqw,13px)]">

                  {monitoringData.map((item) => (
                    <div
                      key={item.label}
                      className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-[5px]"
                    >

                      <span className="flex min-w-0 items-center gap-[6px]">

                        <span
                          className="h-[13px] w-[13px] shrink-0 rounded-[4px]"
                          style={{
                            backgroundColor: item.color,
                          }}
                        />

                        <span className="truncate text-[clamp(10px,3cqw,13px)] font-semibold tracking-[-0.025em] text-[#252126]">
                          {item.label}
                        </span>

                      </span>

                      <span className="whitespace-nowrap text-[clamp(10px,2.9cqw,13px)] text-[#625B61]">
                        {item.value} Mesin
                      </span>

                      <span
                        className={`min-w-[34px] rounded-full px-2 py-[5px] text-center text-[clamp(10px,2.9cqw,13px)] font-bold ${item.badge}`}
                      >
                        {item.percentage}%
                      </span>

                    </div>
                  ))}

                </div>
              </div>
            </div>
          </section>

          {/* =============================================
              MONTHLY VISIT
          ============================================= */}

          <section>

            <div className="mb-[11px] flex items-center justify-between gap-2">

              <SectionTitle>
                Kunjungan Bulan Ini
              </SectionTitle>

              <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[clamp(11px,3.2cqw,14px)] font-medium text-[#29232A]">

                <Target
                  size={19}
                  className="hidden text-[#BF0B2C] min-[390px]:block"
                />

                Target: 40 Kunjungan

              </span>
            </div>

            {/* VISIT CARD */}

            <div className={`${CARD} p-[clamp(12px,3.3cqw,16px)]`}>

              <div className="grid min-w-0 grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] items-center gap-2">

                {/* TOTAL VISITS */}

                <div className="min-w-0 border-r border-[#EEEEEE] pr-2">

                  <p className="text-[clamp(36px,10cqw,44px)] font-bold leading-[0.98] tracking-[-0.055em] text-[#111111]">
                    32
                  </p>

                  <p className="mt-1 whitespace-nowrap text-[clamp(12px,3.4cqw,15px)] font-normal leading-tight text-[#51474E]">
                    Total Kunjungan
                  </p>

                </div>

                {/* GROWTH */}

                <div className="grid min-w-0 grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center gap-1">

                  <div className="min-w-0">

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DDF8E5] px-3 py-[6px] text-[clamp(11px,3.1cqw,14px)] font-bold text-[#208C49]">

                      <TrendingUp size={16} />

                      +14%

                    </span>

                    <p className="mt-1 text-[clamp(11px,3.1cqw,14px)] leading-[1.3] tracking-[-0.015em] text-[#51474E]">
                      Dibanding bulan lalu
                      <br />
                      (28 kunjungan)
                    </p>

                  </div>

                  {/* ACTIVITY ASSET */}

                  <div className="relative flex h-[clamp(65px,19cqw,85px)] min-w-0 items-center justify-center">

                    <Image
                      src="/images/moku/illustrations/dashboard-activity.png"
                      alt=""
                      width={280}
                      height={280}
                      className="h-full w-full object-contain object-center"
                      sizes="(max-width:440px) 120px, 140px"
                    />

                  </div>

                </div>
              </div>

              {/* PROGRESS */}

              <div className="mt-[clamp(11px,3cqw,15px)]">

                <div className="mb-[7px] flex items-center justify-between">

                  <p className="text-[clamp(12px,3.3cqw,14px)] font-bold tracking-[-0.015em] text-[#171717]">
                    Pencapaian Target
                  </p>

                  <p className="text-[clamp(12px,3.3cqw,14px)] font-bold text-[#171717]">
                    80%
                  </p>

                </div>

                <div className="h-[9px] overflow-hidden rounded-full bg-[#E8E8E8]">

                  <div
                    className="h-full rounded-full bg-[#BF0B2C] transition-all duration-500"
                    style={{ width: "80%" }}
                  />

                </div>

              </div>
            </div>
          </section>

          {/* =============================================
              QUICK ACTION
          ============================================= */}

          <section className={`${CARD} p-[clamp(12px,3.3cqw,16px)]`}>

            <SectionTitle>
              Aksi Cepat
            </SectionTitle>

            <div className="mt-[10px] grid grid-cols-4">

              <QuickAction
                href="/visits"
                label={<>Kunjungan<br />Baru</>}
              >
                <Plus size={25} strokeWidth={2.5} />
              </QuickAction>

              <QuickAction
                href="/equipment"
                label={<>Tambah<br />Mesin</>}
                separated
              >
                <Printer size={23} strokeWidth={2} />
              </QuickAction>

              <QuickAction
                href="/reports"
                label="Laporan"
                separated
              >
                <ChartNoAxesColumn size={23} />
              </QuickAction>

              <QuickAction
                href="/reports/export"
                label={<>Unduh<br />Laporan</>}
                separated
              >
                <Download size={23} />
              </QuickAction>

            </div>
          </section>

          {/* =============================================
              ATTENTION ALERT
          ============================================= */}

          <Link
            href="/monitoring"
            className="relative flex min-h-[76px] items-center gap-3 overflow-hidden rounded-[18px] border border-[#F7E4DE] bg-[#FFF2EE] px-3 py-2.5 pl-4 before:absolute before:inset-y-0 before:left-0 before:w-[4px] before:bg-[#F28C0F]"
          >

            <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-[#FFE6D8] text-[#F28C0F]">

              <AlertTriangle
                size={31}
                strokeWidth={1.9}
              />

            </div>

            <div className="min-w-0 flex-1">

              <p className="text-[clamp(13px,3.7cqw,15px)] font-bold leading-tight tracking-[-0.025em] text-[#252126]">
                Mesin Perlu Perhatian
              </p>

              <p className="mt-1 text-[clamp(11px,3.1cqw,14px)] leading-[1.3] text-[#625B61]">
                4 mesin belum dikunjungi pada {selectedMonth} dan memerlukan tindak lanjut.
              </p>

            </div>

            <ChevronRight
              size={25}
              className="shrink-0 text-[#BF0B2C]"
            />

          </Link>

          {/* =============================================
              RECENT ACTIVITIES
          ============================================= */}

          <section>

            <div className="mb-[11px] flex items-center justify-between gap-2 px-1">

              <SectionTitle>
                Aktivitas Terbaru
              </SectionTitle>

              <Link
                href="/visit-history"
                className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[clamp(12px,3.3cqw,14px)] font-semibold text-[#BF0B2C]"
              >
                Lihat Semua

                <ChevronRight size={19} />

              </Link>
            </div>

            <div className={`${CARD} divide-y divide-[#EEEEEE] px-[13px]`}>

              {recentActivities.map((activity, index) => (

                <div
                  key={`${activity.machine}-${index}`}
                  className="flex min-h-[69px] items-center gap-3 py-[9px]"
                >

                  {/* STATUS ICON */}

                  <div
                    className={`flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-full ${
                      activity.status === "success"
                        ? "bg-[#DDF8E7] text-[#26965B]"
                        : "bg-[#FCE7E8] text-[#D83B45]"
                    }`}
                  >

                    {activity.status === "success" ? (
                      <CheckCircle2 size={28} strokeWidth={2} />
                    ) : (
                      <Clock3 size={28} strokeWidth={2} />
                    )}

                  </div>

                  {/* ACTIVITY INFORMATION */}

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-[clamp(12px,3.4cqw,14px)] font-bold leading-tight tracking-[-0.02em] text-[#252126]">
                      {activity.title}
                    </p>

                    <p className="mt-1 truncate text-[clamp(11px,3.1cqw,14px)] leading-tight text-[#817780]">
                      {activity.machine} · {activity.customer}
                    </p>

                  </div>

                  {/* TIME BADGE */}

                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full px-3 py-[7px] text-[clamp(11px,3cqw,13px)] font-medium ${
                      activity.status === "success"
                        ? index === 0
                          ? "bg-[#E5F7DF] text-[#426B3C]"
                          : "bg-[#F1F1F1] text-[#555555]"
                        : "bg-[#FCE7E8] text-[#BF0B2C]"
                    }`}
                  >
                    {activity.time}
                  </span>

                </div>
              ))}

            </div>
          </section>

        </div>
      </div>
    </main>
  );
}