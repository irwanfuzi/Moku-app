
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
    badge: "bg-[#F1F1F1] text-[#777777]",
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
}: {
  href: string;
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex h-[clamp(64px,17.5cqw,70px)] min-h-[clamp(64px,17.5cqw,70px)] min-w-0 flex-col items-center justify-center gap-[clamp(4px,1.2cqw,6px)] rounded-[clamp(10px,3cqw,13px)] bg-[#FCECEF] px-1 py-[clamp(7px,2cqw,9px)] text-center"
    >
      <span className="flex h-[clamp(23px,6.4cqw,25px)] w-[clamp(23px,6.4cqw,25px)] shrink-0 items-center justify-center rounded-[clamp(7px,2cqw,9px)] bg-[#BF0B2C] text-white">
        {children}
      </span>

      <span className="min-h-[2.3em] text-[clamp(10px,3.0cqw,12px)] font-medium leading-[1.12] text-[#171717]">
        {label}
      </span>
    </Link>
  );
}

/* =========================================================
   DESKTOP DASHBOARD
   Composition follows the approved desktop reference:
   KPI row, chart row, machine table.
========================================================= */

const desktopMachineRows = [
  { no: 1, code: "MK-001", model: "Photocopy A3", customer: "PT. Sinar Mandiri", status: "Sudah Dikunjungi", lastVisit: "12 Okt 2025" },
  { no: 2, code: "MK-002", model: "Printer Laser", customer: "CV. Multi Jaya", status: "Belum Dikunjungi", lastVisit: "-" },
  { no: 3, code: "MK-003", model: "Photocopy A4", customer: "PT. Prima Solusi", status: "Perlu Perhatian", lastVisit: "5 Okt 2025" },
  { no: 4, code: "MK-004", model: "Scanner", customer: "PT. Citra Jaya", status: "Sudah Dikunjungi", lastVisit: "10 Okt 2025" },
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
    <div className="mx-auto w-full max-w-[1600px] min-w-0 space-y-5 text-[#171923]">
      {/* DESKTOP DASHBOARD HEADER */}
      <header className="flex min-h-[88px] flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[45px] font-bold leading-tight tracking-tight text-[#730217]">Dashboard</h1>
          <p className="mt-1 text-[19px] leading-snug text-[#4F4B53]">Ringkasan aktivitas dan monitoring kunjungan mesin.</p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <label className="flex h-[53px] min-w-[245px] items-center gap-3 rounded-[10px] border border-[#DADAE0] bg-white px-3 shadow-sm">
            <CalendarDays size={24} className="shrink-0" />
            <select value={desktopMonth} onChange={(event) => setDesktopMonth(event.target.value)} className="w-full bg-transparent text-[19px] font-semibold outline-none">
              <option>September 2025</option>
              <option>Oktober 2025</option>
              <option>November 2025</option>
              <option>Desember 2025</option>
              <option>Januari 2026</option>
            </select>
          </label>
          <Link href="/notifications" aria-label="Notifikasi" className="relative flex h-12 w-12 items-center justify-center text-[#29232A]">
            <Bell size={29} strokeWidth={1.8} />
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#BF0B2C]" />
          </Link>
          <span className="h-[43px] w-px bg-[#E5E5E8]" />
          <Link href="/profile" className="flex items-center gap-3 text-left">
            <span className="flex h-[49px] w-[49px] items-center justify-center rounded-full bg-[#F1E9EC] text-[17px] font-bold text-[#730217]">B</span>
            <span><strong className="block text-[16px] leading-tight">Budi Santoso</strong><small className="text-[15px] text-[#77727A]">Teknisi</small></span>
            <ChevronDown size={16} />
          </Link>
        </div>
      </header>

      {/* KPI SUMMARY */}
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
              <span className="block text-[19px] font-semibold leading-snug text-[#171923]">{label}</span>
              <span className="mt-1 block text-[45px] font-bold leading-none tracking-tight text-[#171923]">{value}</span>
            </span>
          </div>
        ))}
      </section>

      {/* CHARTS */}
      <section className="grid min-w-0 grid-cols-2 gap-[20px]">
        <article className="h-[283px] min-w-0 rounded-[15px] border border-[#E4E4E8] bg-white p-[22px] shadow-[0_1px_3px_rgba(17,24,39,0.04)]">
          <h2 className="text-[25px] font-bold tracking-tight text-[#171923]">Status Monitoring Mesin</h2>
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
                <strong className="text-[46px] font-bold leading-none">48</strong>
                <span className="mt-1 text-[17px] text-[#55545C]">Total Mesin</span>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-[48px]">
              {[
                { label: "Sudah Dikunjungi", value: 32, color: "#9A0A2B" },
                { label: "Belum Dikunjungi", value: 12, color: "#D7D7DC" },
                { label: "Perlu Perhatian", value: 4, color: "#E5E5E8" },
              ].map((item) => (
                <div key={item.label} className="flex min-w-0 items-center gap-3 text-[17px]">
                  <span className="h-4 w-4 shrink-0 rounded-[4px]" style={{ background: item.color }} />
                  <span className="min-w-0 flex-1 truncate text-[#24232A]">{item.label}</span>
                  <strong className="text-[20px] font-bold">{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="h-[283px] min-w-0 rounded-[15px] border border-[#E4E4E8] bg-white p-[22px] shadow-[0_1px_3px_rgba(17,24,39,0.04)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[25px] font-bold tracking-tight text-[#171923]">Kunjungan Bulan Ini</h2>
            <div className="flex shrink-0 items-center gap-4 text-[12px] text-[#33323A]">
              <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-[3px] bg-[#970A2A]" />Kunjungan</span>
              <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-[3px] bg-[#D7D7DC]" />Target</span>
            </div>
          </div>
          <div className="mt-4 grid h-[170px] grid-cols-[32px_1fr] gap-2">
            <div className="flex flex-col justify-between pb-6 text-right text-[15px] text-[#55545C]">
              {[20, 16, 12, 8, 4, 0].map((n) => <span key={n}>{n}</span>)}
            </div>
            <div className="relative grid grid-cols-7 items-end gap-3 border-b border-[#DCDCE1] pb-0">
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-6">
                {[0, 1, 2, 3, 4].map((n) => <span key={n} className="border-t border-[#EEEEF0]" />)}
              </div>
              {desktopVisitChart.map((item) => (
                <div key={item.day} className="relative z-[1] flex h-full flex-col items-center justify-end">
                  <div className="flex h-[calc(100%-24px)] w-full items-end justify-center gap-[3px]">
                    <span className="w-[42%] rounded-t-[4px] bg-[#970A2A]" style={{ height: `${(item.visits / 20) * 100}%` }} />
                    <span className="w-[42%] rounded-t-[4px] bg-[#D7D7DC]" style={{ height: `${(item.target / 20) * 100}%` }} />
                  </div>
                  <span className="mt-2 text-[15px] text-[#24232A]">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      {/* MACHINE TABLE */}
      <section className="min-w-0 rounded-[16px] border border-[#E4E4E8] bg-white p-[21px] shadow-[0_1px_3px_rgba(17,24,39,0.04)]">
        <h2 className="text-[25px] font-bold tracking-tight text-[#171923]">Daftar Mesin</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="flex h-[40px] min-w-[484px] flex-1 items-center gap-2 rounded-[9px] border border-[#DADAE0] px-3 text-[#34333A] shadow-sm">
            <Search size={18} className="shrink-0 text-[#34333A]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama mesin, pelanggan, atau lokasi..."
              className="w-full min-w-0 bg-transparent text-[16px] outline-none placeholder:text-[#777780]"
            />
          </label>
          <label className="flex h-[40px] min-w-[216px] items-center gap-2 rounded-[9px] border border-[#DADAE0] px-3 shadow-sm">
            <Filter size={18} className="shrink-0" />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full bg-transparent text-[16px] outline-none">
              <option>Semua Status</option>
              <option>Sudah Dikunjungi</option>
              <option>Belum Dikunjungi</option>
              <option>Perlu Perhatian</option>
            </select>
          </label>
          <label className="flex h-[40px] min-w-[218px] items-center gap-2 rounded-[9px] border border-[#DADAE0] px-3 shadow-sm">
            <Users size={17} className="shrink-0" />
            <select value={customerFilter} onChange={(event) => setCustomerFilter(event.target.value)} className="w-full bg-transparent text-[13px] outline-none">
              <option>Semua Pelanggan</option>
              <option>PT. Sinar Mandiri</option>
              <option>CV. Multi Jaya</option>
              <option>PT. Prima Solusi</option>
              <option>PT. Citra Jaya</option>
            </select>
          </label>
          <Link href="/equipment" className="inline-flex h-[40px] min-w-[141px] shrink-0 items-center gap-2 rounded-full bg-[#8D0827] px-5 text-[17px] font-semibold text-white shadow-sm">
            <Plus size={19} /> Tambah
          </Link>
        </div>

        <div className="mt-4 w-full overflow-x-auto">
          <table className="w-full min-w-[1151px] border-collapse text-left">
            <colgroup>
              <col style={{ width: "70px" }} />
              <col style={{ width: "153px" }} />
              <col style={{ width: "189px" }} />
              <col style={{ width: "209px" }} />
              <col style={{ width: "229px" }} />
              <col style={{ width: "246px" }} />
              <col style={{ width: "55px" }} />
            </colgroup>
            <thead>
              <tr className="bg-[#F0F0F2] text-[16px] font-bold text-[#171923]">
                {["No.", "Kode Mesin", "Nama Mesin", "Pelanggan", "Status Monitoring", "Kunjungan Terakhir", "Aksi"].map((heading) => (
                  <th key={heading} className="whitespace-nowrap px-3 py-[11px] first:rounded-l-[8px] last:rounded-r-[8px]">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.code} className="border-b border-[#E7E7EA] text-[16px] text-[#202027] last:border-0">
                  <td className="px-[16px] py-[10px]">{row.no}</td>
                  <td className="px-[16px] py-[10px] font-medium">{row.code}</td>
                  <td className="px-[16px] py-[10px]">{row.model}</td>
                  <td className="px-[16px] py-[10px]">{row.customer}</td>
                  <td className="px-[16px] py-[10px]">
                    <span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-[14px] font-medium ${
                      row.status === "Sudah Dikunjungi"
                        ? "bg-[#F9E8EC] text-[#850B29]"
                        : row.status === "Perlu Perhatian"
                          ? "bg-[#F9E8EC] text-[#850B29]"
                          : "bg-[#F0F0F2] text-[#4C4B52]"
                    }`}>
                      {row.status === "Perlu Perhatian" ? <AlertTriangle size={14} /> : row.status === "Belum Dikunjungi" ? <Hourglass size={14} /> : <Check size={14} />}
                      {row.status}
                    </span>
                  </td>
                  <td className="px-[16px] py-[10px] whitespace-nowrap">{row.lastVisit}</td>
                  <td className="relative px-[16px] py-[10px]">
                    <button type="button" aria-label={`Aksi ${row.code}`} onClick={() => setOpenAction(openAction === row.code ? null : row.code)} className="rounded-md p-1 hover:bg-[#F3F3F5]">
                      <MoreVertical size={18} />
                    </button>
                    {openAction === row.code && (
                      <div className="absolute right-4 top-10 z-20 w-36 rounded-lg border border-[#E5E5E8] bg-white p-1 text-[12px] shadow-lg">
                        <Link href={`/equipment`} className="block rounded px-3 py-2 hover:bg-[#F6F6F7]">Detail Mesin</Link>
                        <Link href={`/visit-history`} className="block rounded px-3 py-2 hover:bg-[#F6F6F7]">Riwayat Kunjungan</Link>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-[13px] text-[#777780]">Tidak ada mesin yang sesuai dengan pencarian.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   DASHBOARD
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
    <main className="[container-type:inline-size] w-full overflow-x-clip bg-[#F7F7F7] pb-[calc(64px+env(safe-area-inset-bottom)+12px)]">

      {/* ===================================================
          MOBILE HEADER
      =================================================== */}

      {showMobileHeader && (
        <header className="relative isolate h-[clamp(152px,41.5cqw,168px)] min-h-[clamp(152px,41.5cqw,168px)] overflow-hidden bg-[#730217] px-[clamp(16px,4.9cqw,20px)] pb-[clamp(8px,2.1cqw,12px)] pt-[max(18px,env(safe-area-inset-top))] text-white">

          {/* HEADER DECORATION */}

          <div className="pointer-events-none absolute -right-[clamp(76px,16cqw,140px)] top-[clamp(112px,27cqw,230px)] h-[clamp(190px,48cqw,390px)] w-[clamp(190px,48cqw,390px)] rounded-full bg-[#BF0B2C]/55" />

          <div className="pointer-events-none absolute -left-[clamp(90px,19cqw,170px)] bottom-[-112px] h-[clamp(190px,48cqw,380px)] w-[clamp(260px,62cqw,500px)] rounded-full bg-[#BF0B2C]/28" />

          <div className="pointer-events-none absolute -right-[clamp(90px,20cqw,180px)] bottom-[-130px] h-[clamp(210px,52cqw,420px)] w-[clamp(230px,58cqw,470px)] rounded-full bg-[#BF0B2C]/38" />

          <div className="relative z-10">

            {/* BRAND ROW */}

            <div className="flex h-[clamp(34px,8.7cqw,40px)] min-h-[clamp(34px,8.7cqw,40px)] items-center justify-between">

              <Link
                href="/"
                aria-label="MOKU Dashboard"
                className="flex min-w-0 items-center"
              >
                <Image
                  src="/images/moku/brand/moku-logo.png"
                  alt="MOKU"
                  width={190}
                  height={70}
                  priority
                  className="h-auto w-[clamp(100px,26cqw,116px)] object-contain object-left"
                />
              </Link>

              {/* NOTIFICATION */}

              <div className="relative shrink-0">

                <button
                  type="button"
                  onClick={() =>
                    setShowNotifications((value) => !value)
                  }
                  aria-label="Notifikasi"
                  aria-expanded={showNotifications}
                  className="relative flex h-[clamp(30px,6.2cqw,34px)] w-[clamp(30px,6.2cqw,34px)] items-center justify-center rounded-full text-white"
                >
                  <Bell size={26} className="h-[clamp(22px,6.2cqw,26px)] w-[clamp(22px,6.2cqw,26px)]" strokeWidth={1.8} />

                  <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-[#730217] bg-[#F28C0F]" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 z-50 w-[min(270px,calc(100cqw-40px))] rounded-xl border border-[#EEE7EB] bg-white p-4 text-[#29232A] shadow-lg">

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

                    <div className="flex gap-3 border-t border-[#F0E9ED] py-[7px]">
                      <AlertTriangle
                        size={17}
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

            {/* GREETING + PRINTER */}

            <div className="relative mt-[clamp(8px,2.6cqw,11px)] pb-0">

              <div className="relative z-10 w-full max-w-[42rem] pr-[clamp(84px,24cqw,150px)]">

                <h1 className="text-[clamp(20px,5.7cqw,23px)] font-bold leading-[1.12] tracking-tight !text-white">
                  Halo, Budi Santoso
                </h1>

                <p className="mt-[clamp(4px,1.3cqw,6px)] max-w-full whitespace-nowrap text-[clamp(11px,3.2cqw,13px)] leading-[1.25] text-white/95">
                  Berikut ringkasan operasional kunjungan unit.
                </p>

              </div>

              {/* PRINTER ILLUSTRATION — original asset with soft brand backdrop */}
              <div className="pointer-events-none absolute right-[-2px] top-[clamp(2px,1.2cqw,6px)] z-0 flex h-[clamp(100px,28cqw,116px)] w-[clamp(100px,28cqw,116px)] items-center justify-center">
                <span className="absolute inset-[-8%] rounded-full bg-[#BF0B2C]/25 blur-[2px]" />
                <Image
                  src="/images/moku/illustrations/dashboard-printer.png"
                  alt=""
                  width={340}
                  height={340}
                  priority
                  className="h-full w-full object-contain"
                  sizes="(max-width: 390px) 112px, (max-width: 600px) 140px, 160px"
                />
              </div>

              {/* PERIOD SELECTOR */}

              <div className="relative z-20 mt-[clamp(7px,2.1cqw,9px)] w-fit max-w-full">

                <button
                  type="button"
                  onClick={() =>
                    setShowMonthPicker((value) => !value)
                  }
                  aria-expanded={showMonthPicker}
                  className="flex h-[clamp(36px,9.3cqw,40px)] w-[clamp(178px,47cqw,200px)] max-w-full items-center gap-[10px] rounded-full bg-white px-[clamp(11px,2.8cqw,13px)] text-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                >

                  <CalendarDays
                    size={22}
                    className="shrink-0"
                  />

                  <span className="min-w-0 flex-1 overflow-visible whitespace-nowrap text-left text-[clamp(11px,3.6cqw,14px)] font-semibold tracking-[-0.015em]">
                    {selectedMonth}
                  </span>

                  <ChevronDown
                    size={17}
                    className="shrink-0"
                  />

                </button>

                {showMonthPicker && (
                  <div className="absolute left-0 top-[calc(100%+7px)] z-50 w-[min(260px,calc(100cqw-40px))] overflow-hidden rounded-xl border border-[#EEE7EB] bg-white py-2 text-[#29232A] shadow-lg">

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
                        className={`flex w-full items-center justify-between px-4 py-[7px] text-left text-sm ${
                          selectedMonth === month
                            ? "bg-[#FCECEF] font-bold text-[#BF0B2C]"
                            : "text-[#51474E]"
                        }`}
                      >
                        {month}

                        {selectedMonth === month && (
                          <Check size={17} />
                        )}
                      </button>
                    ))}

                  </div>
                )}

              </div>

            </div>
          </div>
        </header>
      )}

      {/* ===================================================
          HEADER LOWER DECORATION
      =================================================== */}

      {/* Header ends cleanly; the first white card overlaps it. Its rounded top corners reveal the burgundy shoulders. */}

      {/* ===================================================
          DASHBOARD CONTENT
      =================================================== */}

      <div
        className={`relative z-10 mx-auto w-full max-w-[760px] space-y-[clamp(7px,2.2cqw,10px)] px-[clamp(9px,2.6cqw,12px)] pb-[clamp(12px,3.2cqw,18px)] ${
          showMobileHeader ? "-mt-[clamp(18px,5cqw,22px)]" : "pt-4"
        }`}
      >

        {/* =================================================
            STATUS MONITORING MESIN
        ================================================= */}

        <section className="min-w-0 rounded-[clamp(14px,4cqw,16px)] border border-[#EEEEEE] bg-white p-[clamp(10px,2.8cqw,12px)] shadow-[0_2px_9px_rgba(0,0,0,0.055)]">

          <SectionTitle>
            Status Monitoring Mesin
          </SectionTitle>

          <div className="mt-[clamp(6px,1.8cqw,8px)] grid h-[clamp(92px,24.5cqw,100px)] min-w-0 grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] items-center gap-[clamp(5px,1.5cqw,8px)] rounded-[clamp(14px,4cqw,16px)] border border-[#F0F0F0] px-[clamp(6px,1.6cqw,8px)] py-[4px]">

            {/* DONUT */}

            <div className="flex min-w-0 items-center justify-center border-r border-[#EEEEEE] pr-[clamp(6px,2cqw,12px)]">

              <div
                className="relative aspect-square w-full max-w-[clamp(88px,24cqw,98px)] rounded-full"
                style={{
                  background:
                    "conic-gradient(#BF0B2C 0deg 237deg, #D9D9D9 237deg 327deg, #F28C0F 327deg 360deg)",
                }}
              >

                <div className="absolute inset-[14%] flex flex-col items-center justify-center rounded-full bg-white">

                  <span className="text-[clamp(24px,7.1cqw,28px)] font-extrabold leading-none text-[#111111]">
                    48
                  </span>

                  <span className="mt-1 text-[clamp(9px,2.9cqw,11px)] text-[#29232A]">
                    Mesin
                  </span>

                </div>

              </div>
            </div>

            {/* MONITORING LEGEND */}

            <div className="min-w-0 space-y-[clamp(6px,1.7cqw,7px)]">

              {monitoringData.map((item) => (
                <div
                  key={item.label}
                  className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-[clamp(4px,1.2cqw,10px)]"
                >

                  <span className="flex min-w-0 items-center gap-[6px]">
                    <span
                      className="h-[clamp(10px,3cqw,13px)] w-[clamp(10px,3cqw,13px)] shrink-0 rounded-[4px]"
                      style={{
                        backgroundColor: item.color,
                      }}
                    />
                    <span className="min-w-0 whitespace-nowrap text-[clamp(9px,2.85cqw,11px)] font-semibold leading-[1.15] tracking-[-0.02em] text-[#171717]">
                      {item.label}
                    </span>
                  </span>

                  <span className="whitespace-nowrap text-[clamp(9px,2.9cqw,12px)] text-[#51474E]">
                    {item.value} Mesin
                  </span>

                  <span
                    className={`min-w-[clamp(29px,7.4cqw,33px)] rounded-full px-[clamp(6px,1.6cqw,12px)] py-[clamp(3px,0.9cqw,4px)] text-center text-[clamp(9px,2.8cqw,11px)] font-bold ${item.badge}`}
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

        <section className="min-w-0 rounded-[clamp(14px,4cqw,16px)] border border-[#EEEEEE] bg-white p-[clamp(10px,2.8cqw,12px)] shadow-[0_2px_9px_rgba(0,0,0,0.055)]">

          {/* TITLE + TARGET */}

          <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">

            <h2 className="min-w-0 whitespace-nowrap text-[clamp(16px,4.1cqw,18px)] font-bold leading-[1.15] tracking-tight text-[#29232A]">
              Kunjungan Bulan Ini
            </h2>

            <span className="shrink-0 whitespace-nowrap text-[12px] font-medium text-[#29232A]">
              Target: 40 Kunjungan
            </span>

          </div>

          {/* VISIT SUMMARY */}

          <div className="mt-[clamp(5px,1.6cqw,7px)] grid min-h-[clamp(54px,15.5cqw,62px)] min-w-0 grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] items-center gap-[clamp(5px,1.5cqw,8px)]">

            {/* TOTAL VISITS */}

            <div className="min-w-0 border-r border-[#EEEEEE] pr-2">

              <p className="text-[clamp(30px,9cqw,37px)] font-extrabold leading-[0.95] tracking-[-0.045em] text-[#111111]">
                32
              </p>

              <p className="mt-1 whitespace-nowrap text-[clamp(11px,3.1cqw,13px)] leading-tight text-[#29232A]">
                Total Kunjungan
              </p>

            </div>

            {/* GROWTH SUMMARY + ACTIVITY ILLUSTRATION */}

            <div className="grid min-w-0 grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] items-center gap-[clamp(2px,0.7cqw,4px)]">
              <div className="min-w-0">
                <span className="inline-flex max-w-full items-center gap-[clamp(4px,1cqw,7px)] rounded-full bg-[#DDF9E5] px-[clamp(8px,2.2cqw,14px)] py-[clamp(3px,0.8cqw,5px)] text-[clamp(10px,2.9cqw,12px)] font-bold text-[#168B3E]">
                  <TrendingUp size={16} className="h-[1em] w-[1em] shrink-0" />
                  +14%
                </span>

                <p className="mt-[clamp(3px,0.9cqw,4px)] max-w-full text-[clamp(10px,2.9cqw,12px)] leading-[1.24] tracking-[-0.01em] text-[#29232A]">
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

          {/* TARGET PROGRESS */}

          <div className="mt-[clamp(3px,1cqw,5px)]">

            <div className="mb-1 flex items-center justify-between gap-2">

              <p className="text-[clamp(10px,2.9cqw,12px)] font-bold text-[#171717]">
                Pencapaian Target
              </p>

              <p className="text-[clamp(10px,2.9cqw,12px)] font-extrabold text-[#111111]">
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

        {/* =================================================
            AKSI CEPAT
        ================================================= */}

        <section className="min-w-0 rounded-[clamp(14px,4cqw,18px)] border border-[#EEEEEE] bg-white p-[clamp(10px,2.8cqw,12px)] shadow-[0_2px_9px_rgba(0,0,0,0.055)]">

          <SectionTitle>
            Aksi Cepat
          </SectionTitle>

          <div className="mt-[clamp(6px,1.8cqw,8px)] grid grid-cols-4 gap-[clamp(7px,2cqw,8px)]">

            <QuickAction
              href="/visits"
              label={
                <>
                  Buat
                  <br />
                  Kunjungan
                </>
              }
            >
              <Plus size={24} className="h-[clamp(18px,5cqw,21px)] w-[clamp(18px,5cqw,21px)]" strokeWidth={2.4} />
            </QuickAction>

            <QuickAction
              href="/equipment"
              label={
                <>
                  Tambah
                  <br />
                  Mesin
                </>
              }
            >
              <Printer size={23} className="h-[clamp(18px,4.8cqw,20px)] w-[clamp(18px,4.8cqw,20px)]" strokeWidth={2} />
            </QuickAction>

            <QuickAction
              href="/reports"
              label={
                <>
                  Lihat
                  <br />
                  Laporan
                </>
              }
            >
              <ChartNoAxesColumn size={23} className="h-[clamp(18px,4.8cqw,20px)] w-[clamp(18px,4.8cqw,20px)]" />
            </QuickAction>

            <QuickAction
              href="/reports/export"
              label={
                <>
                  Ekspor
                  <br />
                  PDF
                </>
              }
            >
              <Download size={23} className="h-[clamp(18px,4.8cqw,20px)] w-[clamp(18px,4.8cqw,20px)]" />
            </QuickAction>

          </div>
        </section>

        {/* =================================================
            MESIN PERLU PERHATIAN
        ================================================= */}

        <Link
          href="/monitoring"
          className="flex h-[clamp(48px,13cqw,52px)] min-w-0 items-center gap-[8px] rounded-[clamp(12px,3.6cqw,14px)] border border-[#F7E4DE] bg-[#FFF2EE] px-[10px] py-[4px]"
        >

          <div className="flex h-[clamp(30px,9.8cqw,38px)] w-[clamp(30px,9.8cqw,38px)] shrink-0 items-center justify-center rounded-full bg-[#FFE6D8] text-[#F28C0F]">

            <AlertTriangle
              size={27}
              strokeWidth={1.8}
            />

          </div>

          <div className="min-w-0 flex-1">

            <p className="text-[clamp(12px,3.6cqw,14px)] font-bold leading-[1.15] tracking-[-0.02em] text-[#171717]">
              Mesin Perlu Perhatian
            </p>

            <p className="mt-1 text-[clamp(10px,2.9cqw,12px)] leading-[1.28] text-[#51474E]">
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

        <section className="min-w-0 rounded-[clamp(14px,4cqw,18px)] border border-[#EEEEEE] bg-white p-[clamp(10px,2.8cqw,12px)] shadow-[0_2px_9px_rgba(0,0,0,0.055)]">

          <div className="flex min-w-0 items-center justify-between gap-2">

            <SectionTitle>
              Aktivitas Terbaru
            </SectionTitle>

            <Link
              href="/visit-history"
              className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[clamp(11px,3cqw,13px)] font-bold text-[#BF0B2C]"
            >
              Lihat Semua
              <ChevronRight size={17} className="h-[clamp(13px,3.8cqw,16px)] w-[clamp(13px,3.8cqw,16px)]" />
            </Link>

          </div>

          <div className="mt-[clamp(5px,1.5cqw,6px)] divide-y divide-[#EEEEEE]">

            {recentActivities.map((activity, index) => (
              <div
                key={`${activity.machine}-${index}`}
                className="flex min-h-[clamp(30px,8.2cqw,34px)] min-w-0 items-center gap-[clamp(8px,2.6cqw,10px)] py-[1px]"
              >

                <div
                  className={`flex h-[clamp(26px,7.7cqw,30px)] w-[clamp(26px,7.7cqw,30px)] shrink-0 items-center justify-center rounded-full ${
                    activity.status === "success"
                      ? "bg-[#DDF8E7] text-[#249653]"
                      : "bg-[#FCE7E8] text-[#D83B45]"
                  }`}
                >

                  {activity.status === "success" ? (
                    <CheckCircle2 size={26} className="h-[clamp(17px,4.8cqw,19px)] w-[clamp(17px,4.8cqw,19px)]" />
                  ) : (
                    <Clock3 size={26} className="h-[clamp(17px,4.8cqw,19px)] w-[clamp(17px,4.8cqw,19px)]" />
                  )}

                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-[clamp(10px,2.9cqw,11px)] font-semibold text-[#171717]">
                    {activity.title}
                  </p>

                  <p className="mt-0 truncate text-[clamp(10px,2.9cqw,12px)] text-[#817780]">
                    {activity.machine} · {activity.customer}
                  </p>

                </div>

                <span className="shrink-0 whitespace-nowrap text-[clamp(10px,2.8cqw,12px)] text-[#817780]">
                  {activity.time}
                </span>

              </div>
            ))}

          </div>
        </section>

      </div>
    </main>
  );
}
