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
    <h2 className="min-w-0 text-[clamp(15px,4.1cqw,18px)] font-bold leading-[1.16] tracking-[-0.025em] text-[#171717]">
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
      <span className="flex h-[clamp(30px,8cqw,36px)] w-[clamp(30px,8cqw,36px)] shrink-0 items-center justify-center rounded-[10px] bg-[#BF0B2C] text-white">
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
          <h1 className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-tight tracking-tight text-[#730217]">
            Dashboard
          </h1>
          <p className="mt-1 text-[1rem] leading-snug text-[#4F4B53]">
            Ringkasan aktivitas dan monitoring kunjungan mesin.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <label className="flex h-[53px] min-w-[245px] items-center gap-3 rounded-[10px] border border-[#DADAE0] bg-white px-3 shadow-sm">
            <CalendarDays size={24} className="shrink-0" />
            <select
              value={desktopMonth}
              onChange={(event) => setDesktopMonth(event.target.value)}
              className="w-full bg-transparent text-[0.95rem] font-semibold outline-none"
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
            className="relative flex h-12 w-12 items-center justify-center rounded-full text-[#29232A] transition-colors hover:bg-[#F7F2F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BF0B2C] focus-visible:ring-offset-2"
          >
            <Bell size={29} strokeWidth={1.8} />
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#BF0B2C]" />
          </Link>

          <span className="h-[43px] w-px bg-[#E5E5E8]" />

          <Link href="/profile" className="flex items-center gap-3 text-left">
            <span className="flex h-[49px] w-[49px] items-center justify-center rounded-full bg-[#F1E9EC] text-[17px] font-bold text-[#730217]">
              B
            </span>
            <span>
              <strong className="block text-[16px] leading-tight">
                Budi Santoso
              </strong>
              <small className="text-[15px] text-[#77727A]">Teknisi</small>
            </span>
            <ChevronDown size={16} />
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex min-h-[123px] min-w-0 items-center gap-[21px] rounded-[15px] border border-[#E5E5E8] bg-white px-5 py-4 shadow-[0_1px_3px_rgba(17,24,39,0.05)]"
          >
            <span className="flex h-[61px] w-[65px] shrink-0 items-center justify-center rounded-[13px] bg-[#8D0827] text-white">
              <Icon size={37} strokeWidth={2} />
            </span>
            <span className="min-w-0">
              <span className="block text-[19px] font-semibold leading-snug text-[#171923]">
                {label}
              </span>
              <span className="mt-1 block text-[45px] font-bold leading-none tracking-tight text-[#171923]">
                {value}
              </span>
            </span>
          </div>
        ))}
      </section>

      <section className="grid min-w-0 grid-cols-2 gap-[20px]">
        <article className="h-[283px] min-w-0 rounded-[15px] border border-[#E4E4E8] bg-white p-[22px] shadow-[0_1px_3px_rgba(17,24,39,0.04)]">
          <h2 className="text-[1.25rem] font-bold tracking-tight text-[#171923]">
            Status Monitoring Mesin
          </h2>

          <div className="mt-5 flex min-w-0 items-center justify-center gap-6">
            <div
              className="relative h-[203px] w-[203px] shrink-0 rounded-full"
              style={{
                background:
                  "conic-gradient(#9A0A2B 0deg 240deg, #D7D7DC 240deg 330deg, #E5E5E8 330deg 360deg)",
                transform: "rotate(-90deg)",
              }}
              aria-label="Donut chart status mesin"
            >
              <div className="absolute inset-[34px] flex rotate-90 flex-col items-center justify-center rounded-full bg-white">
                <strong className="text-[46px] font-bold leading-none">
                  48
                </strong>
                <span className="mt-1 text-[17px] text-[#55545C]">
                  Total Mesin
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-[48px]">
              {[
                {
                  label: "Sudah Dikunjungi",
                  value: 32,
                  color: "#9A0A2B",
                },
                {
                  label: "Belum Dikunjungi",
                  value: 12,
                  color: "#D7D7DC",
                },
                {
                  label: "Perlu Perhatian",
                  value: 4,
                  color: "#E5E5E8",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex min-w-0 items-center gap-3 text-[17px]"
                >
                  <span
                    className="h-4 w-4 shrink-0 rounded-[4px]"
                    style={{ background: item.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[#24232A]">
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

        <article className="h-[283px] min-w-0 rounded-[15px] border border-[#E4E4E8] bg-white p-[22px] shadow-[0_1px_3px_rgba(17,24,39,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[1.25rem] font-bold tracking-tight text-[#171923]">
              Statistik Kunjungan
            </h2>
            <span className="text-sm font-medium text-[#77727A]">
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
                    style={{ height: `${(item.visits / 20) * 100}%` }}
                    title={`${item.visits} kunjungan`}
                  />
                  <div
                    className="w-[38%] rounded-t-[5px] bg-[#F2A0AE]"
                    style={{ height: `${(item.target / 20) * 100}%` }}
                    title={`${item.target} target`}
                  />
                </div>
                <span className="text-xs font-medium text-[#77727A]">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="min-w-0 rounded-[15px] border border-[#E4E4E8] bg-white p-5 shadow-[0_1px_3px_rgba(17,24,39,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#171923]">
              Daftar Mesin
            </h2>
            <p className="mt-1 text-sm text-[#77727A]">
              Ringkasan status kunjungan mesin.
            </p>
          </div>

          <Link
            href="/equipment"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#730217] px-4 text-sm font-semibold text-white transition hover:bg-[#5D0112]"
          >
            <Plus size={17} />
            Tambah Mesin
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label className="flex h-11 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-[#DEDEE3] px-3">
            <Search size={18} className="shrink-0 text-[#77727A]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari mesin atau pelanggan..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#A09BA2]"
            />
          </label>

          <label className="flex h-11 min-w-[160px] items-center gap-2 rounded-lg border border-[#DEDEE3] px-3">
            <Filter size={17} className="shrink-0 text-[#77727A]" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            >
              <option>Semua Status</option>
              <option>Sudah Dikunjungi</option>
              <option>Belum Dikunjungi</option>
              <option>Perlu Perhatian</option>
            </select>
          </label>

          <label className="flex h-11 min-w-[180px] items-center gap-2 rounded-lg border border-[#DEDEE3] px-3">
            <Users size={17} className="shrink-0 text-[#77727A]" />
            <select
              value={customerFilter}
              onChange={(event) => setCustomerFilter(event.target.value)}
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
              <tr className="border-y border-[#EEEEF0] bg-[#FAFAFB] text-xs font-bold uppercase tracking-wide text-[#77727A]">
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
                  className="border-b border-[#EEEEF0] text-sm text-[#29232A] transition hover:bg-[#FCFAFB]"
                >
                  <td className="px-4 py-4 text-[#77727A]">{row.no}</td>
                  <td className="px-4 py-4 font-bold text-[#730217]">
                    {row.code}
                  </td>
                  <td className="px-4 py-4">{row.model}</td>
                  <td className="px-4 py-4">{row.customer}</td>
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
                  <td className="px-4 py-4">{row.lastVisit}</td>
                  <td className="relative px-4 py-4 text-center">
                    <button
                      type="button"
                      aria-label={`Aksi ${row.code}`}
                      onClick={() =>
                        setOpenAction(
                          openAction === row.code ? null : row.code
                        )
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#77727A] hover:bg-[#F3ECEF] hover:text-[#730217]"
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
   MAIN DASHBOARD PAGE
========================================================= */

export default function DashboardPage() {
  const { isMobile } = useAppLayout();

  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("Oktober 2025");

  if (!isMobile) {
    return <DesktopDashboard />;
  }

  return (
    <main className="min-h-screen min-w-0 bg-[#F7F7F8] pb-[calc(76px+env(safe-area-inset-bottom))]">
      <div className="relative isolate mx-auto w-full max-w-[480px] [container-type:inline-size]">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="relative min-h-[clamp(190px,53cqw,220px)] overflow-hidden bg-[#730217] px-[clamp(17px,5cqw,22px)] pb-[clamp(45px,12cqw,55px)] pt-[clamp(17px,4.5cqw,21px)] text-white">
          <div className="pointer-events-none absolute -right-[12%] -top-[40%] h-[230px] w-[230px] rounded-full bg-[#BF0B2C]/35 blur-[1px]" />
          <div className="pointer-events-none absolute -left-[18%] top-[28%] h-[180px] w-[180px] rounded-full bg-[#BF0B2C]/25 blur-[1px]" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <Image
              src="/images/moku/brand/moku-logo.png"
              alt="MOKU"
              width={120}
              height={42}
              priority
              className="h-[clamp(30px,8cqw,36px)] w-auto object-contain object-left"
            />

            <div className="relative">
              <button
                type="button"
                aria-label="Notifikasi"
                aria-expanded={showNotifications}
                onClick={() =>
                  setShowNotifications((previous) => !previous)
                }
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10"
              >
                <Bell size={23} strokeWidth={1.8} />
                <span className="absolute right-[8px] top-[7px] h-[7px] w-[7px] rounded-full border border-[#730217] bg-[#F28C0F]" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 z-30 w-[min(280px,80vw)] rounded-xl border border-[#EEEEEE] bg-white p-4 text-[#29232A] shadow-xl">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">Notifikasi</p>
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      aria-label="Tutup notifikasi"
                      className="rounded-md p-1 text-[#77727A] hover:bg-[#F5F5F5]"
                    >
                      <X size={17} />
                    </button>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[#77727A]">
                    Belum ada notifikasi baru.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 mt-[clamp(18px,5cqw,24px)] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[clamp(12px,3.3cqw,14px)] font-medium text-white/75">
                Selamat datang,
              </p>
              <h1 className="mt-1 truncate text-[clamp(21px,6cqw,25px)] font-bold leading-tight tracking-[-0.035em]">
                Budi Santoso
              </h1>
              <p className="mt-1 text-[clamp(11px,3cqw,13px)] text-white/75">
                Teknisi · Cabang Jakarta 3
              </p>
            </div>

            <div className="relative flex h-[clamp(78px,23cqw,98px)] w-[clamp(90px,27cqw,116px)] shrink-0 items-center justify-center">
              <Image
                src="/images/moku/illustrations/dashboard-printer.png"
                alt="Ilustrasi mesin printer"
                width={240}
                height={240}
                priority
                className="relative z-10 h-full w-full object-contain"
                sizes="(max-width: 480px) 28vw, 116px"
              />
            </div>
          </div>

          <svg
            className="absolute bottom-[-1px] left-0 h-[clamp(34px,10cqw,44px)] w-full"
            viewBox="0 0 390 60"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 23C75 47 133 58 210 43C283 29 335 15 390 23V60H0V23Z"
              fill="#F7F7F8"
            />
          </svg>
        </header>

        {/* =================================================
            MOBILE CONTENT
        ================================================= */}

        <div className="relative z-10 -mt-[clamp(20px,5.5cqw,25px)] space-y-[clamp(11px,3.2cqw,14px)] px-[clamp(13px,4cqw,17px)]">

          {/* STATUS MONITORING */}

          <section className="min-w-0 rounded-[clamp(14px,4cqw,16px)] border border-[#EEEEEE] bg-white p-[clamp(10px,2.8cqw,12px)] shadow-[0_2px_9px_rgba(0,0,0,0.055)]">
            <div className="flex min-w-0 items-center justify-between gap-2">
              <SectionTitle>Status Monitoring</SectionTitle>

              <label className="flex shrink-0 items-center gap-1 rounded-lg border border-[#E8E5E6] bg-white px-2 py-1.5">
                <CalendarDays
                  size={14}
                  className="shrink-0 text-[#730217]"
                />
                <select
                  value={selectedMonth}
                  onChange={(event) =>
                    setSelectedMonth(event.target.value)
                  }
                  className="max-w-[105px] bg-transparent text-[clamp(10px,2.9cqw,12px)] font-semibold text-[#29232A] outline-none"
                >
                  <option>September 2025</option>
                  <option>Oktober 2025</option>
                  <option>November 2025</option>
                  <option>Desember 2025</option>
                  <option>Januari 2026</option>
                </select>
                <ChevronDown
                  size={13}
                  className="shrink-0 text-[#77727A]"
                />
              </label>
            </div>

            <div className="mt-[clamp(7px,2cqw,9px)] flex min-w-0 items-center gap-[clamp(10px,3cqw,14px)]">
              <div
                className="relative h-[clamp(104px,29cqw,120px)] w-[clamp(104px,29cqw,120px)] shrink-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(#BF0B2C 0deg 237.6deg, #D9D9D9 237.6deg 327.6deg, #F28C0F 327.6deg 360deg)",
                  transform: "rotate(-90deg)",
                }}
                aria-label="Diagram status monitoring mesin"
              >
                <div className="absolute inset-[clamp(17px,5cqw,21px)] flex rotate-90 flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-[clamp(25px,7.5cqw,31px)] font-extrabold leading-none tracking-[-0.05em] text-[#171717]">
                    48
                  </span>
                  <span className="mt-1 whitespace-nowrap text-[clamp(10px,2.8cqw,12px)] font-medium text-[#756B73]">
                    Total Mesin
                  </span>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-[clamp(9px,2.7cqw,12px)]">
                {monitoringData.map((item) => (
                  <div
                    key={item.label}
                    className="flex min-w-0 items-center justify-between gap-1"
                  >
                    <span className="flex min-w-0 items-center gap-[clamp(5px,1.5cqw,7px)]">
                      <span
                        className="h-[clamp(8px,2.2cqw,10px)] w-[clamp(8px,2.2cqw,10px)] shrink-0 rounded-[3px]"
                        style={{ background: item.color }}
                      />
                      <span className="whitespace-nowrap text-[clamp(11px,3.1cqw,13px)] font-semibold leading-[1.15] tracking-[-0.02em] text-[#171717]">
                        {item.label}
                      </span>
                    </span>

                    <span className="whitespace-nowrap text-[clamp(11px,3.1cqw,13px)] text-[#51474E]">
                      {item.value} Mesin
                    </span>

                    <span
                      className={`min-w-[clamp(29px,7.4cqw,33px)] rounded-full px-[clamp(6px,1.6cqw,12px)] py-[clamp(3px,0.9cqw,4px)] text-center text-[clamp(11px,3cqw,12px)] font-bold ${item.badge}`}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* KUNJUNGAN BULAN INI */}

          <section className="min-w-0 rounded-[clamp(14px,4cqw,16px)] border border-[#EEEEEE] bg-white p-[clamp(10px,2.8cqw,12px)] shadow-[0_2px_9px_rgba(0,0,0,0.055)]">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <h2 className="min-w-0 whitespace-nowrap text-[clamp(16px,4.1cqw,18px)] font-bold leading-[1.15] tracking-tight text-[#29232A]">
                Kunjungan Bulan Ini
              </h2>

              <span className="shrink-0 whitespace-nowrap text-[clamp(12px,3.3cqw,14px)] font-medium text-[#29232A]">
                Target: 40 Kunjungan
              </span>
            </div>

            <div className="mt-[clamp(5px,1.6cqw,7px)] grid min-h-[clamp(54px,15.5cqw,62px)] min-w-0 grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] items-center gap-[clamp(5px,1.5cqw,8px)]">
              <div className="min-w-0 border-r border-[#EEEEEE] pr-2">
                <p className="text-[clamp(30px,9cqw,37px)] font-extrabold leading-[0.95] tracking-[-0.045em] text-[#111111]">
                  32
                </p>
                <p className="mt-1 whitespace-nowrap text-[clamp(12px,3.2cqw,14px)] leading-tight text-[#29232A]">
                  Total Kunjungan
                </p>
              </div>

              <div className="grid min-w-0 grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] items-center gap-[clamp(2px,0.7cqw,4px)]">
                <div className="min-w-0">
                  <span className="inline-flex max-w-full items-center gap-[clamp(4px,1cqw,7px)] rounded-full bg-[#DDF9E5] px-[clamp(8px,2.2cqw,14px)] py-[clamp(3px,0.8cqw,5px)] text-[clamp(10px,2.9cqw,12px)] font-bold text-[#168B3E]">
                    <TrendingUp
                      size={16}
                      className="h-[1em] w-[1em] shrink-0"
                    />
                    +14%
                  </span>

                  <p className="mt-[clamp(3px,0.9cqw,4px)] max-w-full text-[clamp(11px,3.1cqw,13px)] leading-[1.24] tracking-[-0.01em] text-[#29232A]">
                    Dibanding bulan lalu
                    <br />
                    (28 kunjungan)
                  </p>
                </div>

                <div className="relative flex h-[clamp(54px,15.5cqw,62px)] w-full min-w-0 items-center justify-center">
                  <span className="absolute left-[2%] top-[15%] h-[72%] w-[96%] rounded-[48%] bg-[#FDE9ED]" />
                  <span className="absolute left-[18%] top-[3%] h-[82%] w-[64%] rounded-full bg-[#FDE9ED]/95" />
                  <span className="absolute bottom-[4%] left-[10%] h-[46%] w-[82%] rounded-full bg-[#FDE9ED]/85" />
                  <Image
                    src="/images/moku/illustrations/dashboard-activity.png"
                    alt=""
                    width={240}
                    height={240}
                    className="relative z-[1] h-full w-full object-contain object-center"
                    sizes="(max-width: 480px) 34vw, 140px"
                  />
                </div>
              </div>
            </div>

            <div className="mt-[clamp(3px,1cqw,5px)]">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-[clamp(11px,3.1cqw,13px)] font-bold text-[#171717]">
                  Pencapaian Target
                </p>
                <p className="text-[clamp(11px,3.1cqw,13px)] font-extrabold text-[#111111]">
                  80%
                </p>
              </div>

              <div className="h-[clamp(7px,2cqw,8px)] overflow-hidden rounded-full bg-[#E8E8E8]">
                <div
                  className="h-full rounded-full bg-[#BF0B2C]"
                  style={{ width: "80%" }}
                />
              </div>
            </div>
          </section>

          {/* AKSI CEPAT */}

          <section className="min-w-0 rounded-[clamp(14px,4cqw,18px)] border border-[#EEEEEE] bg-white p-[clamp(10px,2.8cqw,14px)] shadow-[0_2px_9px_rgba(0,0,0,0.055)]">
            <SectionTitle>Aksi Cepat</SectionTitle>

            <div className="mt-[clamp(7px,2cqw,10px)] grid grid-cols-4">
              <QuickAction href="/visits" label={<>Kunjungan<br />Baru</>}>
                <Plus size={24} strokeWidth={2.4} />
              </QuickAction>

              <QuickAction
                href="/equipment"
                label={<>Tambah<br />Mesin</>}
                separated
              >
                <Printer size={22} strokeWidth={2} />
              </QuickAction>

              <QuickAction href="/reports" label="Laporan" separated>
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

          {/* MESIN PERLU PERHATIAN */}

          <Link
            href="/monitoring"
            className="relative flex min-h-[clamp(58px,15cqw,68px)] min-w-0 items-center gap-[9px] overflow-hidden rounded-[clamp(12px,3.6cqw,14px)] border border-[#F7E4DE] bg-[#FFF2EE] px-[clamp(10px,3cqw,14px)] py-[7px] pl-[clamp(15px,4cqw,20px)] before:absolute before:inset-y-0 before:left-0 before:w-[4px] before:bg-[#F28C0F]"
          >
            <div className="flex h-[clamp(38px,10cqw,46px)] w-[clamp(38px,10cqw,46px)] shrink-0 items-center justify-center rounded-full bg-[#FFE6D8] text-[#F28C0F]">
              <AlertTriangle size={30} strokeWidth={1.8} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[clamp(12px,3.6cqw,14px)] font-bold leading-[1.15] tracking-[-0.02em] text-[#171717]">
                Mesin Perlu Perhatian
              </p>

              <p className="mt-1 text-[clamp(11px,3.1cqw,13px)] leading-[1.28] text-[#51474E]">
                4 mesin belum dikunjungi pada {selectedMonth} dan memerlukan
                tindak lanjut.
              </p>
            </div>

            <ChevronRight size={25} className="shrink-0 text-[#BF0B2C]" />
          </Link>

          {/* AKTIVITAS TERBARU */}

          <section className="min-w-0">
            <div className="flex min-w-0 items-center justify-between gap-2 px-[clamp(2px,1cqw,5px)]">
              <SectionTitle>Aktivitas Terbaru</SectionTitle>

              <Link
                href="/visit-history"
                className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[clamp(11px,3cqw,14px)] font-bold text-[#BF0B2C]"
              >
                Lihat Semua
                <ChevronRight size={18} />
              </Link>
            </div>

            <div className="mt-[clamp(7px,2cqw,10px)] min-w-0 divide-y divide-[#EEEEEE] rounded-[clamp(14px,4cqw,18px)] border border-[#EEEEEE] bg-white px-[clamp(10px,2.8cqw,14px)] shadow-[0_2px_9px_rgba(0,0,0,0.055)]">
              {recentActivities.map((activity, index) => (
                <div
                  key={`${activity.machine}-${index}`}
                  className="flex min-h-[clamp(48px,13cqw,58px)] min-w-0 items-center gap-[clamp(8px,2.6cqw,12px)] py-[clamp(5px,1.5cqw,7px)]"
                >
                  <div
                    className={`flex h-[clamp(34px,9cqw,42px)] w-[clamp(34px,9cqw,42px)] shrink-0 items-center justify-center rounded-full ${
                      activity.status === "success"
                        ? "bg-[#DDF8E7] text-[#249653]"
                        : "bg-[#FCE7E8] text-[#D83B45]"
                    }`}
                  >
                    {activity.status === "success" ? (
                      <CheckCircle2 size={25} />
                    ) : (
                      <Clock3 size={25} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[clamp(11px,3cqw,14px)] font-bold leading-tight text-[#171717]">
                      {activity.title}
                    </p>
                    <p className="mt-1 truncate text-[clamp(11px,2.9cqw,13px)] leading-tight text-[#756B73]">
                      {activity.machine} · {activity.customer}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full px-[clamp(9px,2.5cqw,13px)] py-[5px] text-[clamp(10px,2.8cqw,12px)] font-medium ${
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
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}