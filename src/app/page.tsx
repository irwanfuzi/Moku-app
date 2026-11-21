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
  background: "#F7F7F7",
  white: "#FFFFFF",
  text: "#171717",
  secondary: "#66616A",
  border: "#ECECEC",
};

const MONTHS = [
  "Agustus 2026",
  "September 2026",
  "Oktober 2026",
  "November 2026",
  "Desember 2026",
];

/* =========================================================
   DASHBOARD DATA
========================================================= */
const monitoringData = [
  {
    label: "Sudah Dikunjungi",
    value: 32,
    percentage: 66,
    color: "#8E001C",
    badge: "bg-[#FCECEF] text-[#B81432]",
  },
  {
    label: "Belum Dikunjungi",
    value: 12,
    percentage: 25,
    color: "#E2E2E5",
    badge: "bg-[#F2F2F4] text-[#66636A]",
  },
  {
    label: "Perlu Perhatian",
    value: 4,
    percentage: 9,
    color: "#F28C0F",
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
   SHARED COMPONENTS
========================================================= */
function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="min-w-0 text-[19px] font-bold leading-[1.2] tracking-[-0.04em] text-[#171717]">
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
      className={`min-w-0 rounded-[21px] border border-[#EEEEEE] bg-white shadow-[0_2px_9px_rgba(0,0,0,0.055)] ${className}`}
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
      className={`flex min-w-0 flex-col items-center justify-start gap-[8px] px-1 text-center ${
        separated ? "border-l border-[#EAEAEF]" : ""
      }`}
    >
      <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px] bg-[#8E001C] text-white shadow-[0_2px_6px_rgba(142,0,28,0.2)]">
        {children}
      </span>
      <span className="text-[12.5px] font-medium leading-[1.2] tracking-[-0.02em] text-[#1F1B20]">
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
              onChange={(event) => setDesktopMonth(event.target.value)}
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

          <Link href="/profile" className="flex items-center gap-3">
            <span className="flex h-[49px] w-[49px] items-center justify-center rounded-full bg-[#F1E9EC] text-[17px] font-bold text-[#730217]">
              B
            </span>
            <span>
              <strong className="block text-base">Budi Santoso</strong>
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
            className="flex min-h-[123px] items-center gap-5 rounded-[15px] border border-[#E5E5E8] bg-white px-5 py-4 shadow-sm"
          >
            <span className="flex h-[61px] w-[65px] shrink-0 items-center justify-center rounded-[13px] bg-[#730217] text-white">
              <Icon size={37} />
            </span>
            <span>
              <span className="block text-[19px] font-semibold">{label}</span>
              <span className="mt-1 block text-[45px] font-bold leading-none">
                {value}
              </span>
            </span>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-2 gap-5">
        <article className="h-[283px] rounded-[15px] border border-[#E4E4E8] bg-white p-[22px] shadow-sm">
          <h2 className="text-xl font-bold">Status Monitoring Mesin</h2>
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
                <span className="mt-1 text-[17px]">Mesin</span>
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
                  <span className="min-w-0 flex-1">{item.label}</span>
                  <span className="whitespace-nowrap">{item.value} Mesin</span>
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

        <article className="h-[283px] rounded-[15px] border border-[#E4E4E8] bg-white p-[22px] shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Statistik Kunjungan</h2>
            <span className="text-sm text-[#77727A]">7 Hari Terakhir</span>
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
                  />
                  <div
                    className="w-[38%] rounded-t-[5px] bg-[#F2A0AE]"
                    style={{ height: `${(item.target / 20) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-[#77727A]">{item.day}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-[15px] border border-[#E4E4E8] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Daftar Mesin</h2>
            <p className="mt-1 text-sm text-[#77727A]">
              Ringkasan status kunjungan mesin.
            </p>
          </div>

          <Link
            href="/equipment"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#730217] px-4 text-sm font-semibold text-white"
          >
            <Plus size={17} /> Tambah Mesin
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <label className="flex h-11 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-[#DEDEE3] px-3">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari mesin atau pelanggan..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          <label className="flex h-11 min-w-[160px] items-center gap-2 rounded-lg border border-[#DEDEE3] px-3">
            <Filter size={17} />
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
            <Users size={17} />
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
                        setOpenAction(openAction === row.code ? null : row.code)
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
function MobileDashboard() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("Oktober 2025");
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  return (
    <main className="min-h-dvh w-full overflow-x-clip bg-[#F7F7F7] pb-[calc(84px+env(safe-area-inset-bottom))]">
      <div className="relative mx-auto w-full max-w-[760px]">
        {/* =================================================
            HEADER BANNER
        ================================================= */}
        <header
          className="relative isolate overflow-hidden bg-[#730217] text-white"
          style={{
            height: "clamp(248px, 69vw, 286px)",
          }}
        >
          {/* Gradient & subtle accent layer */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_28%,#A80524_0%,#7A0118_58%,#590010_100%)]" />
          <div className="pointer-events-none absolute -bottom-[26px] left-[-12%] h-[92px] w-[124%] rounded-t-[48%] bg-[#B80D2E]/45" />

          {/* Logo and notification */}
          <div className="absolute left-[20px] right-[20px] top-[max(42px,calc(env(safe-area-inset-top)+10px))] z-30 flex items-center justify-between">
            <Link href="/" aria-label="MOKU Dashboard" className="flex items-center">
              <Image
                src="/images/moku/brand/moku-logo.png"
                alt="MOKU"
                width={180}
                height={65}
                priority
                className="h-[40px] w-auto object-contain object-left"
                sizes="180px"
              />
            </Link>

            <div className="relative">
              <button
                type="button"
                aria-label="Notifikasi"
                aria-expanded={showNotifications}
                onClick={() => setShowNotifications((previous) => !previous)}
                className="relative flex h-[42px] w-[42px] items-center justify-center rounded-full text-white"
              >
                <Bell size={26} strokeWidth={1.8} />
                <span className="absolute right-[7px] top-[6px] h-[10px] w-[10px] rounded-full bg-[#FF3B30]" />
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
          <div className="absolute left-[20px] top-[max(96px,calc(env(safe-area-inset-top)+60px))] z-20 w-[calc(100%-40px)] pr-[128px]">
            <h1 className="whitespace-nowrap text-[clamp(22px,6vw,26px)] font-bold leading-[1.15] tracking-[-0.035em] text-white">
              Halo, Budi Santoso
            </h1>
            <p className="mt-[6px] max-w-[225px] text-[13.5px] font-normal leading-[1.35] text-white/90">
              Berikut ringkasan operasional kunjungan unit.
            </p>
          </div>

          {/* Printer illustration */}
          <div className="pointer-events-none absolute bottom-[22px] right-[12px] z-10 flex h-[134px] w-[134px] items-end justify-center sm:h-[148px] sm:w-[148px]">
            <Image
              src="/images/moku/illustrations/dashboard-printer.png"
              alt="Ilustrasi mesin printer"
              width={420}
              height={420}
              priority
              className="h-full w-full object-contain object-bottom"
              sizes="148px"
            />
          </div>
        </header>

        {/* =================================================
            CANVAS KONTEN (ROUNDED ATAS + OVERLAY HEADER)
        ================================================= */}
        <div className="relative z-20 -mt-[22px] flex flex-col gap-[18px] rounded-t-[26px] bg-[#F7F7F7] px-[16px] pt-[18px]">
          {/* =================================================
              STATUS MONITORING
          ================================================= */}
          <section className="min-w-0">
            <div className="flex min-w-0 items-center justify-between gap-2 px-[2px]">
              <SectionTitle>Status Monitoring Mesin</SectionTitle>

              {/* Period selector */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowMonthPicker((previous) => !previous)}
                  aria-expanded={showMonthPicker}
                  className="flex h-[36px] items-center gap-[6px] rounded-full border border-[#E6E6EA] bg-white px-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <CalendarDays size={16} className="shrink-0 text-[#171717]" />
                  <span className="whitespace-nowrap text-[12px] font-bold text-[#171717]">
                    {selectedMonth}
                  </span>
                  <ChevronDown size={15} className="shrink-0 text-[#171717]" />
                </button>

                {showMonthPicker && (
                  <div className="absolute right-0 top-[42px] z-50 w-[210px] overflow-hidden rounded-xl border border-[#EEE7EB] bg-white py-1.5 text-[#29232A] shadow-xl">
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

            {/* Monitoring chart panel */}
            <MobileCard className="mt-[10px] px-[14px] py-[14px]">
              <div className="grid grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] items-center gap-[12px]">
                {/* Donut */}
                <div className="flex items-center justify-center border-r border-[#EAEAEF] pr-[12px]">
                  <div
                    className="relative aspect-square w-full max-w-[136px] rounded-full"
                    style={{
                      background:
                        "conic-gradient(from -32deg, #F28C0F 0deg 32deg, #8E001C 32deg 270deg, #E2E2E5 270deg 360deg)",
                    }}
                    role="img"
                    aria-label="48 mesin"
                  >
                    <div className="absolute inset-[15%] flex flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-[clamp(28px,5.8vw,38px)] font-extrabold leading-none tracking-[-0.05em] text-[#111111]">
                        48
                      </span>
                      <span className="mt-[3px] text-[13px] font-medium text-[#51474E]">
                        Mesin
                      </span>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="min-w-0 space-y-[12px]">
                  {monitoringData.map((item) => (
                    <div
                      key={item.label}
                      className="grid min-w-0 grid-cols-[12px_minmax(0,1fr)_auto_auto] items-center gap-[6px]"
                    >
                      <span
                        className="h-[12px] w-[12px] rounded-[3.5px]"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="min-w-0 truncate text-[clamp(11px,2.8vw,13px)] font-bold tracking-[-0.02em] text-[#171717]">
                        {item.label}
                      </span>
                      <span className="whitespace-nowrap text-[clamp(11px,2.6vw,12.5px)] text-[#51474E]">
                        {item.value} Mesin
                      </span>
                      <span
                        className={`min-w-[38px] rounded-full px-[6px] py-[3px] text-center text-[11px] font-bold ${item.badge}`}
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
            <div className="flex min-w-0 items-center justify-between gap-2 px-[2px]">
              <SectionTitle>Kunjungan Bulan Ini</SectionTitle>
              <div className="flex shrink-0 items-center gap-[5px]">
                <Target size={18} strokeWidth={2.3} className="text-[#C81032]" />
                <span className="whitespace-nowrap text-[12.5px] font-medium text-[#29232A]">
                  Target: 40 Kunjungan
                </span>
              </div>
            </div>

            <MobileCard className="mt-[10px] px-[16px] py-[15px]">
              <div className="grid grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] items-center gap-[12px]">
                {/* Total */}
                <div className="min-w-0 border-r border-[#EAEAEF] pr-[10px]">
                  <p className="text-[clamp(42px,10vw,50px)] font-extrabold leading-[0.95] tracking-[-0.05em] text-[#111111]">
                    32
                  </p>
                  <p className="mt-[6px] whitespace-nowrap text-[13px] font-medium text-[#29232A]">
                    Total Kunjungan
                  </p>
                </div>

                {/* Growth */}
                <div className="grid min-w-0 grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-[4px]">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-[4px] rounded-full bg-[#DCFCE7] px-[10px] py-[4px] text-[13.5px] font-bold text-[#15803D]">
                      <TrendingUp size={15} strokeWidth={2.5} /> +14%
                    </span>
                    <p className="mt-[6px] text-[12px] leading-[1.35] text-[#3F3A42]">
                      Dibanding bulan lalu
                      <br />
                      (28 kunjungan)
                    </p>
                  </div>

                  <div className="flex h-[84px] min-w-0 items-center justify-center">
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

              {/* Progress */}
              <div className="mt-[14px]">
                <div className="mb-[6px] flex items-center justify-between">
                  <p className="text-[13px] font-bold text-[#171717]">
                    Pencapaian Target
                  </p>
                  <p className="text-[13px] font-extrabold text-[#111111]">
                    80%
                  </p>
                </div>
                <div className="h-[10px] overflow-hidden rounded-full bg-[#EAEAEF]">
                  <div
                    className="h-full rounded-full bg-[#8E001C]"
                    style={{ width: "80%" }}
                  />
                </div>
              </div>
            </MobileCard>
          </section>

          {/* =================================================
              AKSI CEPAT
          ================================================= */}
          <section className="min-w-0">
            <div className="px-[2px]">
              <SectionTitle>Aksi Cepat</SectionTitle>
            </div>

            <MobileCard className="mt-[10px] px-[10px] py-[14px]">
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
                  <Plus size={25} strokeWidth={2.5} />
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
                  <Printer size={22} strokeWidth={2.1} />
                </QuickAction>

                <QuickAction href="/reports" separated label="Laporan">
                  <ChartNoAxesColumn size={23} strokeWidth={2.2} />
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
                  <Download size={22} strokeWidth={2.2} />
                </QuickAction>
              </div>
            </MobileCard>
          </section>

          {/* =================================================
              MESIN PERLU PERHATIAN
          ================================================= */}
          <Link
            href="/monitoring"
            className="flex min-h-[78px] min-w-0 items-center gap-[14px] rounded-[18px] border border-[#F5E1D8] bg-[#FDF1EC] px-[16px] py-[12px]"
          >
            <AlertTriangle
              size={34}
              strokeWidth={2.1}
              className="shrink-0 text-[#F28C0F]"
            />

            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-bold leading-[1.2] tracking-[-0.02em] text-[#171717]">
                Mesin Perlu Perhatian
              </p>
              <p className="mt-[3px] text-[12px] leading-[1.35] text-[#4A444D]">
                4 mesin belum dikunjungi pada {selectedMonth} dan memerlukan
                tindak lanjut.
              </p>
            </div>

            <ChevronRight
              size={22}
              strokeWidth={2.5}
              className="shrink-0 text-[#C81032]"
            />
          </Link>

          {/* =================================================
              AKTIVITAS TERBARU
          ================================================= */}
          <section className="min-w-0">
            <div className="flex min-w-0 items-center justify-between gap-2 px-[2px]">
              <SectionTitle>Aktivitas Terbaru</SectionTitle>
              <Link
                href="/visit-history"
                className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[13.5px] font-bold text-[#C81032]"
              >
                Lihat Semua
                <ChevronRight size={18} strokeWidth={2.5} />
              </Link>
            </div>

            <MobileCard className="mt-[10px] divide-y divide-[#EFEFF2] px-[14px]">
              {recentActivities.map((activity, index) => (
                <div
                  key={`${activity.machine}-${index}`}
                  className="flex min-h-[66px] min-w-0 items-center gap-[12px] py-[10px]"
                >
                  {/* Status icon */}
                  <div
                    className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full ${
                      activity.status === "success"
                        ? "bg-[#E2F7E9] text-[#1D9A4E]"
                        : "bg-[#F3F3F5] text-[#C81032]"
                    }`}
                  >
                    {activity.status === "success" ? (
                      <Check size={22} strokeWidth={2.8} />
                    ) : (
                      <Clock3 size={22} strokeWidth={2.3} />
                    )}
                  </div>

                  {/* Activity information */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold leading-tight text-[#171717]">
                      {activity.title}
                    </p>
                    <p className="mt-[4px] truncate text-[12px] leading-tight text-[#6E6873]">
                      {activity.machine} • {activity.customer}
                    </p>
                  </div>

                  {/* Time badge */}
                  <span
                    className={`min-w-[74px] shrink-0 whitespace-nowrap rounded-full px-[12px] py-[5px] text-center text-[11.5px] font-semibold ${
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

          {/* =================================================
              FOOTER
          ================================================= */}
          <div className="pb-3 pt-1 text-center">
            <p className="text-[10px] text-[#A39AA0]">
              MOKU — Monitoring Operasional Kunjungan Unit
            </p>
            <p className="mt-1 text-[10px] text-[#B3ABB0]">
              Track Precisely, Deliver Quality
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   DASHBOARD PAGE
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
