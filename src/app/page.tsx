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
} from "lucide-react";

import { useAppLayout } from "@/components/layout/app-shell";

/* =========================================================
   DASHBOARD DATA
========================================================= */

const monitoringData = [
  {
    label: "Sudah Dikunjungi",
    value: 32,
    percentage: 66,
    color: "#BF0B2C",
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
    color: "#F28C0F",
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
   SECTION TITLE
========================================================= */

function SectionTitle({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <h2 className="min-w-0 text-[clamp(16px,4.3cqw,19px)] font-bold leading-[1.16] tracking-[-0.035em] text-[#171717]">
      {children}
    </h2>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

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
      className={`flex min-w-0 flex-col items-center justify-center gap-2 px-1 py-2 text-center ${
        separated ? "border-l border-[#E7E7EA]" : ""
      }`}
    >
      <span className="flex h-[clamp(32px,8.5cqw,39px)] w-[clamp(32px,8.5cqw,39px)] shrink-0 items-center justify-center rounded-[11px] bg-[#BF0B2C] text-white">
        {children}
      </span>

      <span className="min-h-[2.25em] text-[clamp(11px,3cqw,13px)] font-medium leading-[1.15] text-[#29232A]">
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
    <div className="mx-auto w-full max-w-[1600px] min-w-0 space-y-5 text-[#171923]">

      <header className="flex min-h-[88px] flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[45px] font-bold leading-tight tracking-tight text-[#730217]">
            Dashboard
          </h1>

          <p className="mt-1 text-[19px] leading-snug text-[#4F4B53]">
            Ringkasan aktivitas dan monitoring kunjungan mesin.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <label className="flex h-[53px] min-w-[245px] items-center gap-3 rounded-[10px] border border-[#DADAE0] bg-white px-3 shadow-sm">
            <CalendarDays size={24} className="shrink-0" />

            <select
              value={desktopMonth}
              onChange={(event) =>
                setDesktopMonth(event.target.value)
              }
              className="w-full bg-transparent text-[19px] font-semibold outline-none"
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
            className="relative flex h-12 w-12 items-center justify-center text-[#29232A]"
          >
            <Bell size={29} strokeWidth={1.8} />
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#BF0B2C]" />
          </Link>

          <span className="h-[43px] w-px bg-[#E5E5E8]" />

          <Link
            href="/profile"
            className="flex items-center gap-3 text-left"
          >
            <span className="flex h-[49px] w-[49px] items-center justify-center rounded-full bg-[#F1E9EC] text-[17px] font-bold text-[#730217]">
              B
            </span>

            <span>
              <strong className="block text-[16px] leading-tight">
                Budi Santoso
              </strong>
              <small className="text-[15px] text-[#77727A]">
                Teknisi
              </small>
            </span>

            <ChevronDown size={16} />
          </Link>
        </div>
      </header>

      {/* KPI SUMMARY */}

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex min-h-[123px] min-w-0 items-center gap-[21px] rounded-[15px] border border-[#E5E5E8] bg-white px-5 py-4 shadow-sm"
          >
            <span className="flex h-[61px] w-[65px] shrink-0 items-center justify-center rounded-[13px] bg-[#730217] text-white">
              <Icon size={37} strokeWidth={2} />
            </span>

            <span className="min-w-0">
              <span className="block text-[19px] font-semibold leading-snug">
                {label}
              </span>

              <span className="mt-1 block text-[45px] font-bold leading-none tracking-tight">
                {value}
              </span>
            </span>
          </div>
        ))}
      </section>

      {/* CHARTS */}

      <section className="grid min-w-0 grid-cols-2 gap-5">

        <article className="h-[283px] min-w-0 rounded-[15px] border border-[#E4E4E8] bg-white p-[22px] shadow-sm">
          <h2 className="text-[25px] font-bold tracking-tight">
            Status Monitoring Mesin
          </h2>

          <div className="mt-5 flex min-w-0 items-center justify-center gap-6">
            <div
              className="relative h-[203px] w-[203px] shrink-0 rounded-full"
              style={{
                background:
                  "conic-gradient(#BF0B2C 0deg 237deg, #D9D9D9 237deg 327deg, #F28C0F 327deg 360deg)",
              }}
            >
              <div className="absolute inset-[34px] flex flex-col items-center justify-center rounded-full bg-white">
                <strong className="text-[46px] font-bold leading-none">
                  48
                </strong>
                <span className="mt-1 text-[17px] text-[#55545C]">
                  Total Mesin
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-9">
              {monitoringData.map((item) => (
                <div
                  key={item.label}
                  className="flex min-w-0 items-center gap-3 text-[17px]"
                >
                  <span
                    className="h-4 w-4 shrink-0 rounded-[4px]"
                    style={{ background: item.color }}
                  />

                  <span className="min-w-0 flex-1 truncate">
                    {item.label}
                  </span>

                  <strong className="text-[20px] font-bold">
                    {item.value}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="h-[283px] min-w-0 rounded-[15px] border border-[#E4E4E8] bg-white p-[22px] shadow-sm">
          <h2 className="text-[25px] font-bold tracking-tight">
            Kunjungan Bulan Ini
          </h2>

          <div className="mt-5 grid h-[190px] grid-cols-[32px_1fr] gap-2">
            <div className="flex flex-col justify-between pb-6 text-right text-[15px] text-[#55545C]">
              {[20, 16, 12, 8, 4, 0].map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>

            <div className="relative grid grid-cols-7 items-end gap-3 border-b border-[#DCDCE1]">
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-6">
                {[0, 1, 2, 3, 4].map((n) => (
                  <span key={n} className="border-t border-[#EEEEF0]" />
                ))}
              </div>

              {desktopVisitChart.map((item) => (
                <div
                  key={item.day}
                  className="relative z-[1] flex h-full flex-col items-center justify-end"
                >
                  <div className="flex h-[calc(100%-24px)] w-full items-end justify-center gap-[3px]">
                    <span
                      className="w-[42%] rounded-t-[4px] bg-[#BF0B2C]"
                      style={{
                        height: `${(item.visits / 20) * 100}%`,
                      }}
                    />

                    <span
                      className="w-[42%] rounded-t-[4px] bg-[#D7D7DC]"
                      style={{
                        height: `${(item.target / 20) * 100}%`,
                      }}
                    />
                  </div>

                  <span className="mt-2 text-[15px]">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </article>

      </section>

      {/* MACHINE TABLE */}

      <section className="min-w-0 rounded-[16px] border border-[#E4E4E8] bg-white p-[21px] shadow-sm">

        <h2 className="text-[25px] font-bold tracking-tight">
          Daftar Mesin
        </h2>

        <div className="mt-3 flex flex-wrap items-center gap-3">

          <label className="flex h-[40px] min-w-[300px] flex-1 items-center gap-2 rounded-[9px] border border-[#DADAE0] px-3 shadow-sm">
            <Search size={18} className="shrink-0" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama mesin, pelanggan, atau lokasi..."
              className="w-full min-w-0 bg-transparent text-[16px] outline-none placeholder:text-[#777780]"
            />
          </label>

          <label className="flex h-[40px] min-w-[200px] items-center gap-2 rounded-[9px] border border-[#DADAE0] px-3 shadow-sm">
            <Filter size={18} />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full bg-transparent text-[14px] outline-none"
            >
              <option>Semua Status</option>
              <option>Sudah Dikunjungi</option>
              <option>Belum Dikunjungi</option>
              <option>Perlu Perhatian</option>
            </select>
          </label>

          <label className="flex h-[40px] min-w-[200px] items-center gap-2 rounded-[9px] border border-[#DADAE0] px-3 shadow-sm">
            <Users size={17} />

            <select
              value={customerFilter}
              onChange={(event) => setCustomerFilter(event.target.value)}
              className="w-full bg-transparent text-[14px] outline-none"
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
            className="inline-flex h-[40px] items-center gap-2 rounded-full bg-[#730217] px-5 text-[15px] font-semibold text-white"
          >
            <Plus size={19} />
            Tambah
          </Link>

        </div>

        <div className="mt-4 w-full overflow-x-auto">

          <table className="w-full min-w-[1000px] border-collapse text-left">

            <thead>
              <tr className="bg-[#F0F0F2] text-[14px] font-bold">
                {[
                  "No.",
                  "Kode Mesin",
                  "Nama Mesin",
                  "Pelanggan",
                  "Status Monitoring",
                  "Kunjungan Terakhir",
                  "Aksi",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-3 py-3 first:rounded-l-lg last:rounded-r-lg"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.code}
                  className="border-b border-[#E7E7EA] text-[14px] last:border-0"
                >
                  <td className="px-3 py-3">{row.no}</td>

                  <td className="px-3 py-3 font-medium">
                    {row.code}
                  </td>

                  <td className="px-3 py-3">{row.model}</td>

                  <td className="px-3 py-3">{row.customer}</td>

                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                        row.status === "Sudah Dikunjungi"
                          ? "bg-[#F9E8EC] text-[#850B29]"
                          : row.status === "Perlu Perhatian"
                            ? "bg-[#FFF0E5] text-[#EB5513]"
                            : "bg-[#F0F0F2] text-[#4C4B52]"
                      }`}
                    >
                      {row.status === "Perlu Perhatian" ? (
                        <AlertTriangle size={14} />
                      ) : row.status === "Belum Dikunjungi" ? (
                        <Hourglass size={14} />
                      ) : (
                        <Check size={14} />
                      )}

                      {row.status}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-3 py-3">
                    {row.lastVisit}
                  </td>

                  <td className="relative px-3 py-3">

                    <button
                      type="button"
                      aria-label={`Aksi ${row.code}`}
                      onClick={() =>
                        setOpenAction(
                          openAction === row.code ? null : row.code
                        )
                      }
                      className="rounded-md p-1 hover:bg-[#F3F3F5]"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openAction === row.code && (
                      <div className="absolute right-4 top-10 z-20 w-40 rounded-lg border border-[#E5E5E8] bg-white p-1 text-xs shadow-lg">

                        <Link
                          href="/equipment"
                          className="block rounded px-3 py-2 hover:bg-[#F6F6F7]"
                        >
                          Detail Mesin
                        </Link>

                        <Link
                          href="/visit-history"
                          className="block rounded px-3 py-2 hover:bg-[#F6F6F7]"
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
                    className="px-3 py-8 text-center text-sm text-[#777780]"
                  >
                    Tidak ada mesin yang sesuai dengan pencarian.
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
   MOBILE DASHBOARD
========================================================= */

export default function DashboardPage() {
  const { isMobile, isReady } = useAppLayout();

  const [selectedMonth, setSelectedMonth] =
    useState("Oktober 2025");

  const months = [
    "September 2025",
    "Oktober 2025",
    "November 2025",
    "Desember 2025",
    "Januari 2026",
  ];

  const [showMonthPicker, setShowMonthPicker] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const showMobileHeader = isReady && isMobile;

  if (isReady && !isMobile) {
    return <DesktopDashboard />;
  }

  return (
    <main className="[container-type:inline-size] relative w-full overflow-x-clip bg-[#F7F7F7] pb-[calc(68px+env(safe-area-inset-bottom))]">

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      {showMobileHeader && (
        <header className="relative isolate h-[clamp(190px,53cqw,230px)] overflow-hidden bg-[#730217] px-[clamp(18px,5cqw,22px)] pt-[max(18px,env(safe-area-inset-top))] text-white">

          {/* BACKGROUND */}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#80051F] via-[#730217] to-[#650016]" />

          {/* DECORATIVE SHAPES */}

          <div className="pointer-events-none absolute -right-[100px] top-[115px] h-[230px] w-[230px] rounded-full bg-[#BF0B2C]/35" />

          <div className="pointer-events-none absolute -left-[110px] bottom-[-110px] h-[230px] w-[300px] rounded-full bg-[#BF0B2C]/20" />

          {/* WAVE */}

          <svg
            aria-hidden="true"
            viewBox="0 0 1000 150"
            preserveAspectRatio="none"
            className="pointer-events-none absolute bottom-0 left-0 z-[1] h-[clamp(55px,15cqw,75px)] w-full"
          >
            <defs>
              <linearGradient
                id="mokuWaveGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="#BF0B2C" />
                <stop offset="48%" stopColor="#D20B36" />
                <stop offset="100%" stopColor="#BF0B2C" />
              </linearGradient>
            </defs>

            <path
              d="
                M0 115
                C55 88 100 108 155 91
                C225 68 258 24 330 32
                C410 40 438 92 515 83
                C590 75 617 22 690 18
                C770 12 805 48 875 31
                C930 18 965 -4 1000 -18
                L1000 150
                L0 150
                Z
              "
              fill="url(#mokuWaveGradient)"
            />
          </svg>

          {/* HEADER CONTENT */}

          <div className="relative z-10">

            {/* BRAND */}

            <div className="flex h-[42px] items-center justify-between">

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
                  className="h-auto w-[clamp(108px,29cqw,122px)] object-contain object-left"
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
                  className="relative flex h-10 w-10 items-center justify-center text-white"
                >
                  <Bell size={27} strokeWidth={1.8} />

                  <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-[#730217] bg-[#F28C0F]" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 z-50 w-[260px] rounded-2xl border border-[#EEE7EB] bg-white p-4 text-[#29232A] shadow-xl">

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
                      className="block border-t border-[#F0E9ED] pt-3 text-center text-xs font-bold text-[#BF0B2C]"
                    >
                      Lihat Semua Notifikasi
                    </Link>

                  </div>
                )}

              </div>

            </div>

            {/* GREETING */}

            <div className="relative mt-[clamp(13px,4cqw,17px)]">

              <div className="relative z-10 max-w-[75%]">

                <h1 className="text-[clamp(21px,5.8cqw,24px)] font-bold leading-[1.15] tracking-[-0.035em] text-white">
                  Halo, Budi Santoso
                </h1>

                <p className="mt-1 text-[clamp(12px,3.5cqw,14px)] leading-[1.3] text-white/95">
                  Berikut ringkasan operasional kunjungan unit.
                </p>

              </div>

              {/* PRINTER */}

              <div className="pointer-events-none absolute right-[-5px] top-[-5px] z-[2] flex h-[clamp(125px,35cqw,150px)] w-[clamp(125px,35cqw,150px)] items-center justify-center">

                <Image
                  src="/images/moku/illustrations/dashboard-printer.png"
                  alt=""
                  width={400}
                  height={400}
                  priority
                  className="h-full w-full object-contain"
                  sizes="150px"
                />

              </div>

            </div>

          </div>

        </header>
      )}

      {/* =====================================================
          WHITE CANVAS
      ===================================================== */}

      <div
        className={`relative z-20 mx-auto w-full rounded-t-[clamp(23px,6cqw,28px)] bg-[#F7F7F7] px-[clamp(11px,3cqw,14px)] pt-[clamp(15px,4cqw,19px)] ${
          showMobileHeader
            ? "-mt-[clamp(19px,5.5cqw,25px)]"
            : "mt-0"
        }`}
      >

        <div className="mx-auto w-full max-w-[540px] space-y-[clamp(14px,3.8cqw,17px)] pb-5">

          {/* =================================================
              STATUS MONITORING
          ================================================= */}

          {/* TITLE + PERIOD */}

          <div className="flex min-w-0 items-center justify-between gap-2">

            <SectionTitle>
              Status Monitoring Mesin
            </SectionTitle>

            <div className="relative z-30 shrink-0">

              <button
                type="button"
                onClick={() =>
                  setShowMonthPicker((value) => !value)
                }
                aria-expanded={showMonthPicker}
                className="flex h-[clamp(35px,9cqw,41px)] w-[clamp(138px,39cqw,190px)] items-center gap-2 rounded-full border border-[#ECECEC] bg-white px-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
              >

                <CalendarDays
                  size={19}
                  className="shrink-0"
                />

                <span className="min-w-0 flex-1 whitespace-nowrap text-left text-[clamp(11px,3cqw,13px)] font-semibold text-[#171717]">
                  {selectedMonth}
                </span>

                <ChevronDown size={15} />

              </button>

              {showMonthPicker && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[220px] overflow-hidden rounded-xl border border-[#EEE7EB] bg-white py-2 shadow-xl">

                  <p className="px-4 py-2 text-xs font-semibold text-[#817780]">
                    Pilih Periode
                  </p>

                  {months.map((month) => (
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

          <section className="min-w-0 rounded-[19px] border border-[#EEEEEE] bg-white p-[clamp(11px,3cqw,14px)] shadow-[0_3px_12px_rgba(0,0,0,0.055)]">

            <div className="grid min-w-0 grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] items-center gap-2">

              {/* DONUT */}

              <div className="flex min-w-0 items-center justify-center border-r border-[#E9E9E9] pr-2">

                <div
                  className="relative aspect-square w-full max-w-[clamp(91px,25cqw,110px)] rounded-full"
                  style={{
                    background:
                      "conic-gradient(#BF0B2C 0deg 237deg, #D9D9D9 237deg 327deg, #F28C0F 327deg 360deg)",
                  }}
                >

                  <div className="absolute inset-[14%] flex flex-col items-center justify-center rounded-full bg-white">

                    <span className="text-[clamp(27px,7.5cqw,33px)] font-extrabold leading-none text-[#111111]">
                      48
                    </span>

                    <span className="mt-1 text-[clamp(11px,3cqw,13px)] text-[#29232A]">
                      Mesin
                    </span>

                  </div>

                </div>

              </div>

              {/* LEGEND */}

              <div className="min-w-0 space-y-[clamp(9px,2.5cqw,12px)]">

                {monitoringData.map((item) => (

                  <div
                    key={item.label}
                    className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1.5"
                  >

                    <span className="flex min-w-0 items-center gap-1.5">

                      <span
                        className="h-[13px] w-[13px] shrink-0 rounded-[4px]"
                        style={{
                          backgroundColor: item.color,
                        }}
                      />

                      <span className="truncate text-[clamp(10px,2.9cqw,13px)] font-semibold text-[#29232A]">
                        {item.label}
                      </span>

                    </span>

                    <span className="whitespace-nowrap text-[clamp(10px,2.9cqw,13px)] text-[#51474E]">
                      {item.value} Mesin
                    </span>

                    <span
                      className={`min-w-[36px] rounded-full px-2 py-1 text-center text-[clamp(10px,2.8cqw,12px)] font-bold ${item.badge}`}
                    >
                      {item.percentage}%
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </section>

          {/* =================================================
              KUNJUNGAN BULAN INI
          ================================================= */}

          {/* TITLE + TARGET OUTSIDE CARD */}

          <div className="flex min-w-0 items-center justify-between gap-2 px-1">

            <SectionTitle>
              Kunjungan Bulan Ini
            </SectionTitle>

            <span className="shrink-0 whitespace-nowrap text-[clamp(11px,3cqw,14px)] font-medium text-[#29232A]">
              Target: 40 Kunjungan
            </span>

          </div>

          {/* VISIT CARD */}

          <section className="min-w-0 rounded-[19px] border border-[#EEEEEE] bg-white p-[clamp(11px,3cqw,14px)] shadow-[0_3px_12px_rgba(0,0,0,0.055)]">

            <div className="grid min-w-0 grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] items-center gap-2">

              {/* TOTAL VISITS */}

              <div className="min-w-0 border-r border-[#EEEEEE] pr-2">

                <p className="text-[clamp(33px,9.5cqw,40px)] font-extrabold leading-none tracking-[-0.05em] text-[#111111]">
                  32
                </p>

                <p className="mt-1 whitespace-nowrap text-[clamp(12px,3.2cqw,14px)] text-[#29232A]">
                  Total Kunjungan
                </p>

              </div>

              {/* GROWTH + ILLUSTRATION */}

              <div className="grid min-w-0 grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center gap-1">

                <div className="min-w-0">

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DDF9E5] px-3 py-1 text-[clamp(11px,3cqw,13px)] font-bold text-[#168B3E]">

                    <TrendingUp size={15} />

                    +14%

                  </span>

                  <p className="mt-1 text-[clamp(11px,3.1cqw,13px)] leading-[1.25] text-[#29232A]">
                    Dibanding bulan lalu
                    <br />
                    (28 kunjungan)
                  </p>

                </div>

                <div className="relative flex h-[clamp(65px,18cqw,80px)] items-center justify-center">

                  <span className="absolute inset-[8%] rounded-full bg-[#FDE9ED]" />

                  <Image
                    src="/images/moku/illustrations/dashboard-activity.png"
                    alt=""
                    width={260}
                    height={260}
                    className="relative z-10 h-full w-full object-contain"
                    sizes="110px"
                  />

                </div>

              </div>

            </div>

            {/* TARGET PROGRESS */}

            <div className="mt-[clamp(10px,3cqw,13px)]">

              <div className="mb-1.5 flex items-center justify-between">

                <p className="text-[clamp(12px,3.2cqw,14px)] font-bold text-[#171717]">
                  Pencapaian Target
                </p>

                <p className="text-[clamp(12px,3.2cqw,14px)] font-extrabold text-[#111111]">
                  80%
                </p>

              </div>

              <div className="h-[9px] overflow-hidden rounded-full bg-[#E8E8E8]">

                <div
                  className="h-full rounded-full bg-[#BF0B2C]"
                  style={{ width: "80%" }}
                />

              </div>

            </div>

          </section>

          {/* =================================================
              AKSI CEPAT
          ================================================= */}

          <div className="px-1">
            <SectionTitle>
              Aksi Cepat
            </SectionTitle>
          </div>

          <section className="min-w-0 rounded-[19px] border border-[#EEEEEE] bg-white p-[clamp(10px,3cqw,14px)] shadow-[0_3px_12px_rgba(0,0,0,0.055)]">

            <div className="grid grid-cols-4">

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
                <Printer size={22} />
              </QuickAction>

              <QuickAction
                href="/reports"
                label="Laporan"
                separated
              >
                <ChartNoAxesColumn size={22} />
              </QuickAction>

              <QuickAction
                href="/reports/export"
                label={<>Unduh<br />Laporan</>}
                separated
              >
                <Download size={22} />
              </QuickAction>

            </div>

          </section>

          {/* =================================================
              MESIN PERLU PERHATIAN
          ================================================= */}

          <Link
            href="/monitoring"
            className="relative flex min-h-[68px] min-w-0 items-center gap-3 overflow-hidden rounded-[17px] border border-[#F7E4DE] bg-[#FFF2EE] px-3 py-2 pl-4 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-[#F28C0F]"
          >

            <div className="flex h-[45px] w-[45px] shrink-0 items-center justify-center rounded-full bg-[#FFE6D8] text-[#F28C0F]">
              <AlertTriangle size={30} strokeWidth={1.8} />
            </div>

            <div className="min-w-0 flex-1">

              <p className="text-[clamp(12px,3.6cqw,14px)] font-bold leading-tight text-[#171717]">
                Mesin Perlu Perhatian
              </p>

              <p className="mt-1 text-[clamp(11px,3.1cqw,13px)] leading-[1.25] text-[#51474E]">
                4 mesin belum dikunjungi pada {selectedMonth} dan memerlukan tindak lanjut.
              </p>

            </div>

            <ChevronRight
              size={25}
              className="shrink-0 text-[#BF0B2C]"
            />

          </Link>

          {/* =================================================
              AKTIVITAS TERBARU
          ================================================= */}

          <div className="flex min-w-0 items-center justify-between gap-2 px-1">

            <SectionTitle>
              Aktivitas Terbaru
            </SectionTitle>

            <Link
              href="/visit-history"
              className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[clamp(11px,3cqw,14px)] font-bold text-[#BF0B2C]"
            >
              Lihat Semua
              <ChevronRight size={18} />
            </Link>

          </div>

          {/* ACTIVITY CARD */}

          <section className="divide-y divide-[#EEEEEE] rounded-[19px] border border-[#EEEEEE] bg-white px-[clamp(10px,3cqw,14px)] shadow-[0_3px_12px_rgba(0,0,0,0.055)]">

            {recentActivities.map((activity, index) => (

              <div
                key={`${activity.machine}-${index}`}
                className="flex min-h-[62px] min-w-0 items-center gap-3 py-2"
              >

                <div
                  className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full ${
                    activity.status === "success"
                      ? "bg-[#DDF8E7] text-[#249653]"
                      : "bg-[#FCE7E8] text-[#D83B45]"
                  }`}
                >

                  {activity.status === "success" ? (
                    <CheckCircle2 size={27} />
                  ) : (
                    <Clock3 size={27} />
                  )}

                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-[clamp(11px,3.1cqw,14px)] font-bold leading-tight text-[#171717]">
                    {activity.title}
                  </p>

                  <p className="mt-1 truncate text-[clamp(11px,3cqw,13px)] leading-tight text-[#756B73]">
                    {activity.machine} · {activity.customer}
                  </p>

                </div>

                <span
                  className={`shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-[clamp(10px,2.9cqw,12px)] font-medium ${
                    activity.status === "success"
                      ? index === 0
                        ? "bg-[#E5F7DF] text-[#3E6A36]"
                        : "bg-[#F1F1F1] text-[#555555]"
                      : "bg-[#FCE7E8] text-[#BF0B2C]"
                  }`}
                >
                  {activity.time}
                </span>

              </div>

            ))}

          </section>

        </div>

      </div>

    </main>
  );
}