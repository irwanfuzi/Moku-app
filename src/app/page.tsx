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
   DESIGN SYSTEM
========================================================= */

const COLORS = {
  burgundy: "#730217",
  crimson: "#BF0B2C",
  amber: "#F28C0F",
  orangeRed: "#EB5513",
  background: "#F8F8FA",
  white: "#FFFFFF",
  text: "#171717",
  secondary: "#66616A",
  border: "#ECECF0",
};

/* =========================================================
   RESPONSIVE STYLE

   No container queries.
   No cqw.
   No cqh.
========================================================= */

const MOBILE_STYLES = {
  pagePadding: "clamp(12px, 3.5vw, 17px)",
  sectionGap: "clamp(14px, 3.8vw, 18px)",
  cardRadius: "clamp(17px, 4.5vw, 21px)",
  sectionTitle: "clamp(16px, 4.35vw, 19px)",
  bodyText: "clamp(12px, 3.4vw, 14px)",
};

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
    badge: "bg-[#F1F1F1] text-[#171717]",
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
   DESKTOP DATA
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

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <h2
      className="min-w-0 font-bold leading-[1.2] tracking-[-0.045em] text-[#171717]"
      style={{
        fontSize: MOBILE_STYLES.sectionTitle,
      }}
    >
      {children}
    </h2>
  );
}

/* =========================================================
   CARD
========================================================= */

function MobileCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border border-[#ECECF0] bg-white shadow-[0_2px_9px_rgba(25,20,30,0.07)] ${className}`}
      style={{
        borderRadius: MOBILE_STYLES.cardRadius,
      }}
    >
      {children}
    </div>
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
      className={`flex min-w-0 flex-col items-center justify-center gap-[7px] px-1 text-center ${
        separated ? "border-l border-[#E5E5E8]" : ""
      }`}
    >
      <span className="flex h-[clamp(40px,10.5vw,46px)] w-[clamp(40px,10.5vw,46px)] shrink-0 items-center justify-center rounded-[12px] bg-[#BF0B2C] text-white">
        {children}
      </span>

      <span className="min-h-[2.2em] text-[clamp(12px,3.4vw,15px)] font-medium leading-[1.2] tracking-[-0.025em] text-[#29232A]">
        {label}
      </span>
    </Link>
  );
}

/* =========================================================
   DESKTOP DASHBOARD
========================================================= */

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

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCustomer
    );
  });

  const kpis = [
    { label: "Total Mesin", value: "48", icon: Printer },
    { label: "Sudah Dikunjungi", value: "32", icon: Check },
    { label: "Belum Dikunjungi", value: "12", icon: Hourglass },
    {
      label: "Perlu Perhatian",
      value: "4",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 text-[#171923]">

      <header className="flex min-h-[88px] flex-wrap items-center justify-between gap-4">

        <div>
          <h1 className="text-[clamp(28px,3vw,40px)] font-bold text-[#730217]">
            Dashboard
          </h1>

          <p className="mt-1 text-base text-[#4F4B53]">
            Ringkasan aktivitas dan monitoring kunjungan mesin.
          </p>
        </div>

        <div className="flex items-center gap-4">

          <label className="flex h-[53px] min-w-[245px] items-center gap-3 rounded-[10px] border border-[#DADAE0] bg-white px-3 shadow-sm">

            <CalendarDays size={24} />

            <select
              value={desktopMonth}
              onChange={(event) =>
                setDesktopMonth(event.target.value)
              }
              className="w-full bg-transparent text-[15px] font-semibold outline-none"
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
            className="relative flex h-12 w-12 items-center justify-center rounded-full"
          >
            <Bell size={29} />

            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#BF0B2C]" />
          </Link>

          <span className="h-[43px] w-px bg-[#E5E5E8]" />

          <Link
            href="/profile"
            className="flex items-center gap-3"
          >
            <span className="flex h-[49px] w-[49px] items-center justify-center rounded-full bg-[#F1E9EC] text-[17px] font-bold text-[#730217]">
              B
            </span>

            <span>
              <strong className="block text-base">
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

      {/* KPI */}

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">

        {kpis.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex min-h-[123px] items-center gap-5 rounded-[15px] border border-[#E5E5E8] bg-white px-5 py-4 shadow-sm"
          >
            <span className="flex h-[61px] w-[65px] shrink-0 items-center justify-center rounded-[13px] bg-[#730217] text-white">
              <Icon size={37} />
            </span>

            <span>
              <span className="block text-[19px] font-semibold">
                {label}
              </span>

              <span className="mt-1 block text-[45px] font-bold leading-none">
                {value}
              </span>
            </span>
          </div>
        ))}

      </section>

      {/* MONITORING */}

      <section className="grid grid-cols-2 gap-5">

        <article className="h-[283px] rounded-[15px] border border-[#E4E4E8] bg-white p-[22px] shadow-sm">

          <h2 className="text-xl font-bold">
            Status Monitoring Mesin
          </h2>

          <div className="mt-5 flex items-center justify-center gap-6">

            <div
              className="relative h-[203px] w-[203px] shrink-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from -90deg, #F28C0F 0deg 32.4deg, #BF0B2C 32.4deg 270deg, #D7D7DC 270deg 360deg)",
              }}
            >
              <div className="absolute inset-[34px] flex flex-col items-center justify-center rounded-full bg-white">

                <strong className="text-[46px] font-bold leading-none">
                  48
                </strong>

                <span className="mt-1 text-[17px]">
                  Mesin
                </span>

              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-8">

              {monitoringData.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 text-base"
                >
                  <span
                    className="h-4 w-4 shrink-0 rounded-[4px]"
                    style={{ background: item.color }}
                  />

                  <span className="min-w-0 flex-1">
                    {item.label}
                  </span>

                  <span className="whitespace-nowrap">
                    {item.value} Mesin
                  </span>

                  <strong
                    className={`rounded-full px-3 py-1 text-sm ${item.badge}`}
                  >
                    {item.percentage}%
                  </strong>
                </div>
              ))}

            </div>
          </div>
        </article>

        {/* VISIT CHART */}

        <article className="h-[283px] rounded-[15px] border border-[#E4E4E8] bg-white p-[22px] shadow-sm">

          <div className="flex items-center justify-between">

            <h2 className="text-xl font-bold">
              Statistik Kunjungan
            </h2>

            <span className="text-sm text-[#77727A]">
              7 Hari Terakhir
            </span>

          </div>

          <div className="mt-7 flex h-[190px] items-end justify-between gap-3 border-b border-l border-[#E9E9EC] px-3 pb-2">

            {desktopVisitChart.map((item) => (
              <div
                key={item.day}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="flex h-full w-full items-end justify-center gap-1">

                  <div
                    className="w-[38%] rounded-t-[5px] bg-[#BF0B2C]"
                    style={{
                      height: `${(item.visits / 20) * 100}%`,
                    }}
                  />

                  <div
                    className="w-[38%] rounded-t-[5px] bg-[#F2A0AE]"
                    style={{
                      height: `${(item.target / 20) * 100}%`,
                    }}
                  />

                </div>

                <span className="text-xs text-[#77727A]">
                  {item.day}
                </span>
              </div>
            ))}

          </div>
        </article>

      </section>

      {/* MACHINE LIST */}

      <section className="rounded-[15px] border border-[#E4E4E8] bg-white p-5 shadow-sm">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <h2 className="text-xl font-bold">
              Daftar Mesin
            </h2>

            <p className="mt-1 text-sm text-[#77727A]">
              Ringkasan status kunjungan mesin.
            </p>
          </div>

          <Link
            href="/equipment"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#730217] px-4 text-sm font-semibold text-white"
          >
            <Plus size={17} />
            Tambah Mesin
          </Link>

        </div>

        <div className="mt-5 flex flex-wrap gap-3">

          <label className="flex h-11 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-[#DEDEE3] px-3">

            <Search size={18} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Cari mesin atau pelanggan..."
              className="w-full bg-transparent text-sm outline-none"
            />

          </label>

          <label className="flex h-11 min-w-[160px] items-center gap-2 rounded-lg border border-[#DEDEE3] px-3">

            <Filter size={17} />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="w-full bg-transparent text-sm outline-none"
            >
              <option>Semua Status</option>
              <option>Sudah Dikunjungi</option>
              <option>Belum Dikunjungi</option>
              <option>Perlu Perhatian</option>
            </select>

          </label>

          <label className="flex h-11 min-w-[180px] items-center gap-2 rounded-lg border border-[#DEDEE3] px-3">

            <Users size={17} />

            <select
              value={customerFilter}
              onChange={(event) =>
                setCustomerFilter(event.target.value)
              }
              className="w-full bg-transparent text-sm outline-none"
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

          <table className="w-full min-w-[780px] border-collapse text-left">

            <thead>
              <tr className="border-y border-[#EEEEF0] bg-[#FAFAFB] text-xs font-bold uppercase text-[#77727A]">

                <th className="px-4 py-4">No.</th>
                <th className="px-4 py-4">Nomor Mesin</th>
                <th className="px-4 py-4">Jenis Mesin</th>
                <th className="px-4 py-4">Pelanggan</th>
                <th className="px-4 py-4">Status Monitoring</th>
                <th className="px-4 py-4">Kunjungan Terakhir</th>
                <th className="px-4 py-4 text-center">Aksi</th>

              </tr>
            </thead>

            <tbody>

              {filteredRows.map((row) => (
                <tr
                  key={row.code}
                  className="border-b border-[#EEEEF0] text-sm hover:bg-[#FCFAFB]"
                >

                  <td className="px-4 py-4 text-[#77727A]">
                    {row.no}
                  </td>

                  <td className="px-4 py-4 font-bold text-[#730217]">
                    {row.code}
                  </td>

                  <td className="px-4 py-4">
                    {row.model}
                  </td>

                  <td className="px-4 py-4">
                    {row.customer}
                  </td>

                  <td className="px-4 py-4">

                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                        row.status === "Sudah Dikunjungi"
                          ? "bg-[#E6F6EA] text-[#238447]"
                          : row.status === "Perlu Perhatian"
                            ? "bg-[#FFF0E5] text-[#D66A13]"
                            : "bg-[#F1F1F3] text-[#66636A]"
                      }`}
                    >
                      {row.status}
                    </span>

                  </td>

                  <td className="px-4 py-4">
                    {row.lastVisit}
                  </td>

                  <td className="relative px-4 py-4 text-center">

                    <button
                      type="button"
                      aria-label={`Aksi ${row.code}`}
                      onClick={() =>
                        setOpenAction(
                          openAction === row.code
                            ? null
                            : row.code
                        )
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#77727A] hover:bg-[#F3ECEF]"
                    >
                      <MoreVertical size={19} />
                    </button>

                    {openAction === row.code && (
                      <div className="absolute right-8 top-12 z-20 w-40 rounded-lg border border-[#E7E2E5] bg-white p-1 text-left shadow-lg">

                        <Link
                          href={`/equipment/${row.code}`}
                          className="block rounded-md px-3 py-2 text-sm hover:bg-[#F8F2F4]"

                          onClick={() => setOpenAction(null)}
                        >
                          Lihat Detail
                        </Link>

                        <Link
                          href={`/visits/new?equipment=${row.code}`}
                          className="block rounded-md px-3 py-2 text-sm hover:bg-[#F8F2F4]"

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
                    className="px-4 py-12 text-center text-sm text-[#77727A]"
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
   MOBILE DASHBOARD
========================================================= */

export default function DashboardPage() {
  const { isMobile } = useAppLayout();

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [selectedMonth, setSelectedMonth] =
    useState("Oktober 2025");

  if (!isMobile) {
    return <DesktopDashboard />;
  }

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-[#F8F8FA] pb-[calc(80px+env(safe-area-inset-bottom))]">

      <div className="relative isolate mx-auto w-full max-w-[480px]">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="relative h-[290px] overflow-hidden bg-gradient-to-br from-[#85001F] via-[#A9002B] to-[#730217] px-5 pt-5 text-white sm:h-[310px]">

          {/* Background decoration */}

          <div className="pointer-events-none absolute -right-[17%] -top-[30%] h-[260px] w-[260px] rounded-full bg-[#E20D43]/30" />

          <div className="pointer-events-none absolute -left-[22%] top-[34%] h-[190px] w-[190px] rounded-full bg-[#BF0B2C]/35 blur-[2px]" />

          <div className="pointer-events-none absolute right-[-10%] top-[38%] h-[130px] w-[130px] rounded-full bg-[#E20D43]/25" />

          {/* Logo and notification */}

          <div className="relative z-20 flex items-center justify-between">

            <Image
              src="/images/moku/brand/moku-logo.png"
              alt="MOKU"
              width={160}
              height={60}
              priority
              className="h-[43px] w-auto object-contain object-left"
            />

            <div className="relative">

              <button
                type="button"
                aria-label="Notifikasi"
                aria-expanded={showNotifications}
                onClick={() =>
                  setShowNotifications((previous) => !previous)
                }
                className="relative flex h-11 w-11 items-center justify-center rounded-full text-white"
              >
                <Bell size={26} strokeWidth={1.8} />

                <span className="absolute right-[8px] top-[6px] h-[11px] w-[11px] rounded-full border border-[#A9002B] bg-[#FF233D]" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-[min(280px,80vw)] rounded-xl border border-[#EEEEEE] bg-white p-4 text-[#29232A] shadow-xl">

                  <div className="flex items-center justify-between">

                    <p className="text-sm font-bold">
                      Notifikasi
                    </p>

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

          {/* Welcome */}

          <div className="relative z-10 mt-[27px] max-w-[75%]">

            <h1 className="text-[23px] font-bold leading-[1.2] tracking-[-0.045em] text-white">
              Halo, Budi Santoso
            </h1>

            <p className="mt-2 max-w-[260px] text-[15px] font-medium leading-[1.35] text-white/90">
              Berikut ringkasan operasional kunjungan unit.
            </p>

          </div>

          {/* Printer illustration */}

          <div className="pointer-events-none absolute bottom-[8px] right-[8px] z-10 flex h-[175px] w-[190px] items-end justify-center">

            <Image
              src="/images/moku/illustrations/dashboard-printer.png"
              alt="Ilustrasi mesin printer"
              width={420}
              height={420}
              priority
              className="h-full w-full object-contain object-bottom"
              sizes="190px"
            />

          </div>

          {/* Wave */}

          <svg
            className="absolute bottom-[-1px] left-0 z-[11] h-[48px] w-full"
            viewBox="0 0 390 60"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 37C40 37 48 15 90 19C132 22 137 46 177 39C220 31 224 9 263 14C304 19 314 39 349 32C367 29 379 22 390 16V60H0V37Z"
              fill="#F8F8FA"
            />
          </svg>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="relative z-20 -mt-[5px] flex flex-col"
          style={{
            gap: MOBILE_STYLES.sectionGap,
            paddingLeft: MOBILE_STYLES.pagePadding,
            paddingRight: MOBILE_STYLES.pagePadding,
          }}
        >

          {/* =================================================
              STATUS MONITORING
          ================================================= */}

          <section className="min-w-0">

            <div className="flex min-w-0 items-center justify-between gap-2 px-[9px]">

              <SectionTitle>
                Status Monitoring Mesin
              </SectionTitle>

              <label className="flex h-[40px] shrink-0 items-center gap-[7px] rounded-full border border-[#E8E8ED] bg-white px-[10px] shadow-sm">

                <CalendarDays
                  size={18}
                  className="shrink-0"
                />

                <select
                  value={selectedMonth}
                  onChange={(event) =>
                    setSelectedMonth(event.target.value)
                  }
                  className="max-w-[105px] bg-transparent text-[13px] font-bold outline-none"
                >
                  <option>September 2025</option>
                  <option>Oktober 2025</option>
                  <option>November 2025</option>
                  <option>Desember 2025</option>
                  <option>Januari 2026</option>
                </select>

                <ChevronDown size={15} />

              </label>

            </div>

            <MobileCard className="mt-[12px] px-[12px] py-[13px]">

              <div className="grid grid-cols-[minmax(112px,0.8fr)_minmax(0,1.2fr)] items-center gap-[12px]">

                {/* Donut chart */}

                <div className="flex items-center justify-center">

                  <div
                    className="relative h-[clamp(112px,32vw,145px)] w-[clamp(112px,32vw,145px)] shrink-0 rounded-full"
                    style={{
                      background:
                        "conic-gradient(from -90deg, #F28C0F 0deg 32.4deg, #BF0B2C 32.4deg 270deg, #D9D9D9 270deg 360deg)",
                    }}
                    role="img"
                    aria-label="48 mesin"
                  >

                    <div className="absolute inset-[17%] flex flex-col items-center justify-center rounded-full bg-white">

                      <span className="text-[clamp(34px,9.5vw,44px)] font-extrabold leading-none tracking-[-0.055em] text-[#111111]">
                        48
                      </span>

                      <span className="mt-1 text-[14px] font-medium text-[#29232A]">
                        Mesin
                      </span>

                    </div>

                  </div>

                </div>

                {/* Legend */}

                <div className="min-w-0 space-y-[13px] border-l border-[#E5E5E8] pl-[12px]">

                  {monitoringData.map((item) => (

                    <div
                      key={item.label}
                      className="grid min-w-0 grid-cols-[13px_minmax(0,1fr)_auto_auto] items-center gap-[7px]"
                    >

                      <span
                        className="h-[13px] w-[13px] rounded-[4px]"
                        style={{
                          background: item.color,
                        }}
                      />

                      <span className="min-w-0 truncate text-[clamp(10px,3.1vw,13px)] font-semibold tracking-[-0.035em] text-[#171717]">
                        {item.label}
                      </span>

                      <span className="whitespace-nowrap text-[clamp(10px,2.9vw,13px)] text-[#29232A]">
                        {item.value} Mesin
                      </span>

                      <span
                        className={`min-w-[39px] rounded-full px-[7px] py-[4px] text-center text-[12px] font-bold ${item.badge}`}
                      >
                        {item.percentage}%
                      </span>

                    </div>

                  ))}

                </div>

              </div>

            </MobileCard>

          </section>

          {/* =================================================
              KUNJUNGAN BULAN INI
          ================================================= */}

          <section className="min-w-0">

            <div className="flex min-w-0 items-center justify-between gap-2 px-[9px]">

              <SectionTitle>
                Kunjungan Bulan Ini
              </SectionTitle>

              <div className="flex shrink-0 items-center gap-[6px]">

                <Target
                  size={22}
                  strokeWidth={2.5}
                  className="text-[#BF0B2C]"
                />

                <span className="whitespace-nowrap text-[13px] font-medium text-[#29232A]">
                  Target: 40 Kunjungan
                </span>

              </div>

            </div>

            <MobileCard className="mt-[12px] p-[16px]">

              <div className="grid grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] items-center gap-[12px]">

                {/* Total visit */}

                <div className="min-w-0 border-r border-[#E5E5E8] pr-[10px]">

                  <p className="text-[clamp(40px,11vw,50px)] font-extrabold leading-[0.95] tracking-[-0.06em] text-[#111111]">
                    32
                  </p>

                  <p className="mt-1 whitespace-nowrap text-[14px] leading-tight text-[#29232A]">
                    Total Kunjungan
                  </p>

                </div>

                {/* Growth */}

                <div className="grid min-w-0 grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center gap-[5px]">

                  <div className="min-w-0">

                    <span className="inline-flex items-center gap-[5px] rounded-full bg-[#E4F8E8] px-[10px] py-[5px] text-[16px] font-bold text-[#168B3E]">

                      <TrendingUp size={18} strokeWidth={2.5} />

                      +14%

                    </span>

                    <p className="mt-[8px] text-[13px] leading-[1.35] tracking-[-0.025em] text-[#29232A]">
                      Dibanding bulan lalu
                      <br />
                      (28 kunjungan)
                    </p>

                  </div>

                  <div className="flex h-[85px] min-w-0 items-center justify-center">

                    <Image
                      src="/images/moku/illustrations/dashboard-activity.png"
                      alt="Ilustrasi checklist kunjungan"
                      width={240}
                      height={240}
                      className="h-full w-full object-contain"
                      sizes="140px"
                    />

                  </div>

                </div>

              </div>

              {/* Progress */}

              <div className="mt-[14px]">

                <div className="mb-[6px] flex items-center justify-between">

                  <p className="text-[14px] font-bold text-[#171717]">
                    Pencapaian Target
                  </p>

                  <p className="text-[14px] font-extrabold text-[#111111]">
                    80%
                  </p>

                </div>

                <div className="h-[10px] overflow-hidden rounded-full bg-[#E8E8E8]">

                  <div
                    className="h-full rounded-full bg-[#BF0B2C]"
                    style={{
                      width: "80%",
                    }}
                  />

                </div>

              </div>

            </MobileCard>

          </section>

          {/* =================================================
              AKSI CEPAT
          ================================================= */}

          <section className="min-w-0">

            <div className="px-[9px]">

              <SectionTitle>
                Aksi Cepat
              </SectionTitle>

            </div>

            <MobileCard className="mt-[12px] px-[12px] py-[12px]">

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
                  <Plus size={29} strokeWidth={2.5} />
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
                  <Printer size={25} strokeWidth={2.1} />
                </QuickAction>

                <QuickAction
                  href="/reports"
                  separated
                  label="Laporan"
                >
                  <ChartNoAxesColumn
                    size={27}
                    strokeWidth={2.2}
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
                  <Download size={26} strokeWidth={2.2} />
                </QuickAction>

              </div>

            </MobileCard>

          </section>

          {/* =================================================
              MESIN PERLU PERHATIAN
          ================================================= */}

          <Link
            href="/monitoring"
            className="relative flex min-h-[84px] min-w-0 items-center gap-[12px] overflow-hidden rounded-[18px] border border-[#F4E4DF] bg-[#FFF2EE] px-[14px] py-[10px] pl-[20px] shadow-[0_2px_7px_rgba(25,20,30,0.035)] before:absolute before:inset-y-0 before:left-0 before:w-[5px] before:bg-[#F28C0F]"
          >

            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center text-[#F28C0F]">

              <AlertTriangle
                size={40}
                strokeWidth={1.9}
              />

            </div>

            <div className="min-w-0 flex-1">

              <p className="text-[16px] font-bold leading-[1.2] tracking-[-0.035em] text-[#171717]">
                Mesin Perlu Perhatian
              </p>

              <p className="mt-[3px] text-[13px] leading-[1.3] tracking-[-0.025em] text-[#29232A]">
                4 mesin belum dikunjungi pada {selectedMonth} dan memerlukan tindak lanjut.
              </p>

            </div>

            <ChevronRight
              size={28}
              strokeWidth={2.5}
              className="shrink-0 text-[#BF0B2C]"
            />

          </Link>

          {/* =================================================
              AKTIVITAS TERBARU
          ================================================= */}

          <section className="min-w-0">

            <div className="flex min-w-0 items-center justify-between gap-2 px-[9px]">

              <SectionTitle>
                Aktivitas Terbaru
              </SectionTitle>

              <Link
                href="/visit-history"
                className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[14px] font-bold text-[#BF0B2C]"
              >
                Lihat Semua

                <ChevronRight
                  size={21}
                  strokeWidth={2.5}
                />

              </Link>

            </div>

            <MobileCard className="mt-[12px] divide-y divide-[#EEEEEE] px-[13px]">

              {recentActivities.map((activity, index) => (

                <div
                  key={`${activity.machine}-${index}`}
                  className="flex min-h-[69px] min-w-0 items-center gap-[12px] py-[9px]"
                >

                  {/* Icon */}

                  <div
                    className={`flex h-[47px] w-[47px] shrink-0 items-center justify-center rounded-full ${
                      activity.status === "success"
                        ? "bg-[#E2F7E5] text-[#258D4D]"
                        : "bg-[#FCE8EB] text-[#D82032]"
                    }`}
                  >

                    {activity.status === "success" ? (
                      <Check
                        size={30}
                        strokeWidth={3}
                      />
                    ) : (
                      <Clock3
                        size={31}
                        strokeWidth={2.2}
                      />
                    )}

                  </div>

                  {/* Information */}

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-[14px] font-bold leading-tight tracking-[-0.03em] text-[#171717]">
                      {activity.title}
                    </p>

                    <p className="mt-[4px] truncate text-[13px] leading-tight text-[#66616A]">
                      {activity.machine} · {activity.customer}
                    </p>

                  </div>

                  {/* Time */}

                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full px-[13px] py-[7px] text-[13px] font-medium ${
                      activity.status === "success"
                        ? index === 0
                          ? "bg-[#E4F7DD] text-[#365D31]"
                          : "bg-[#F0F0F0] text-[#555555]"
                        : "bg-[#FCE5EA] text-[#A51B30]"
                    }`}
                  >
                    {activity.time}
                  </span>

                </div>

              ))}

            </MobileCard>

          </section>

        </div>

      </div>

    </main>
  );
                                      }
