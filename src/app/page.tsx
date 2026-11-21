
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

const months = [
  "Agustus 2026",
  "September 2026",
  "Oktober 2026",
  "November 2026",
  "Desember 2026",
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
    <h2 className="min-w-0 text-[clamp(16px,4.6vw,20px)] font-bold leading-tight tracking-tight text-[#29232A]">
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
      className="flex min-w-0 flex-col items-center justify-center gap-2 rounded-[15px] bg-[#FCECEF] px-1 py-3 text-center"
    >
      <span className="flex h-[clamp(40px,12vw,48px)] w-[clamp(40px,12vw,48px)] shrink-0 items-center justify-center rounded-[13px] bg-[#BF0B2C] text-white">
        {children}
      </span>

      <span className="min-h-[30px] text-[clamp(10px,3.1vw,13px)] font-medium leading-[1.15] text-[#171717]">
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
    <div className="w-full min-w-0 space-y-6 text-[#171923]">
      {/* KPI SUMMARY */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex min-h-[112px] min-w-0 items-center gap-4 rounded-[14px] border border-[#E5E5E8] bg-white px-5 py-4 shadow-[0_1px_3px_rgba(17,24,39,0.05)]"
          >
            <span className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-[14px] bg-[#8D0827] text-white">
              <Icon size={32} strokeWidth={2} />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold leading-snug text-[#171923]">{label}</span>
              <span className="mt-1 block text-[38px] font-bold leading-none tracking-tight text-[#171923]">{value}</span>
            </span>
          </div>
        ))}
      </section>

      {/* CHARTS */}
      <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="min-w-0 rounded-[16px] border border-[#E4E4E8] bg-white p-5 shadow-[0_1px_3px_rgba(17,24,39,0.04)]">
          <h2 className="text-[20px] font-bold tracking-tight text-[#171923]">Status Monitoring Mesin</h2>
          <div className="mt-5 flex min-w-0 items-center justify-center gap-6">
            <div
              className="relative h-[190px] w-[190px] shrink-0 rounded-full"
              style={{
                background:
                  "conic-gradient(#9A0A2B 0deg 240deg, #D7D7DC 240deg 330deg, #E5E5E8 330deg 360deg)",
                transform: "rotate(-90deg)",
              }}
              aria-label="Donut chart status mesin"
            >
              <div className="absolute inset-[31px] flex rotate-90 flex-col items-center justify-center rounded-full bg-white">
                <strong className="text-[40px] font-bold leading-none">48</strong>
                <span className="mt-1 text-[14px] text-[#55545C]">Total Mesin</span>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-4">
              {[
                { label: "Sudah Dikunjungi", value: 32, color: "#9A0A2B" },
                { label: "Belum Dikunjungi", value: 12, color: "#D7D7DC" },
                { label: "Perlu Perhatian", value: 4, color: "#E5E5E8" },
              ].map((item) => (
                <div key={item.label} className="flex min-w-0 items-center gap-3 text-[14px]">
                  <span className="h-4 w-4 shrink-0 rounded-[4px]" style={{ background: item.color }} />
                  <span className="min-w-0 flex-1 truncate text-[#24232A]">{item.label}</span>
                  <strong className="text-[18px] font-bold">{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="min-w-0 rounded-[16px] border border-[#E4E4E8] bg-white p-5 shadow-[0_1px_3px_rgba(17,24,39,0.04)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[20px] font-bold tracking-tight text-[#171923]">Kunjungan Bulan Ini</h2>
            <div className="flex shrink-0 items-center gap-4 text-[12px] text-[#33323A]">
              <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-[3px] bg-[#970A2A]" />Kunjungan</span>
              <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-[3px] bg-[#D7D7DC]" />Target</span>
            </div>
          </div>
          <div className="mt-5 grid h-[190px] grid-cols-[28px_1fr] gap-2">
            <div className="flex flex-col justify-between pb-6 text-right text-[12px] text-[#55545C]">
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
                  <span className="mt-2 text-[12px] text-[#24232A]">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      {/* MACHINE TABLE */}
      <section className="min-w-0 rounded-[16px] border border-[#E4E4E8] bg-white p-5 shadow-[0_1px_3px_rgba(17,24,39,0.04)]">
        <h2 className="text-[21px] font-bold tracking-tight text-[#171923]">Daftar Mesin</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="flex h-[40px] min-w-[220px] flex-1 items-center gap-2 rounded-[9px] border border-[#DADAE0] px-3 text-[#34333A] shadow-sm">
            <Search size={18} className="shrink-0 text-[#34333A]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama mesin, pelanggan, atau lokasi..."
              className="w-full min-w-0 bg-transparent text-[13px] outline-none placeholder:text-[#777780]"
            />
          </label>
          <label className="flex h-[40px] min-w-[170px] items-center gap-2 rounded-[9px] border border-[#DADAE0] px-3 shadow-sm">
            <Filter size={18} className="shrink-0" />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full bg-transparent text-[13px] outline-none">
              <option>Semua Status</option>
              <option>Sudah Dikunjungi</option>
              <option>Belum Dikunjungi</option>
              <option>Perlu Perhatian</option>
            </select>
          </label>
          <label className="flex h-[40px] min-w-[180px] items-center gap-2 rounded-[9px] border border-[#DADAE0] px-3 shadow-sm">
            <Users size={17} className="shrink-0" />
            <select value={customerFilter} onChange={(event) => setCustomerFilter(event.target.value)} className="w-full bg-transparent text-[13px] outline-none">
              <option>Semua Pelanggan</option>
              <option>PT. Sinar Mandiri</option>
              <option>CV. Multi Jaya</option>
              <option>PT. Prima Solusi</option>
              <option>PT. Citra Jaya</option>
            </select>
          </label>
          <Link href="/equipment" className="inline-flex h-[40px] shrink-0 items-center gap-2 rounded-full bg-[#8D0827] px-5 text-[14px] font-semibold text-white shadow-sm">
            <Plus size={19} /> Tambah
          </Link>
        </div>

        <div className="mt-4 w-full overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="bg-[#F0F0F2] text-[12px] font-bold text-[#171923]">
                {["No.", "Kode Mesin", "Nama Mesin", "Pelanggan", "Status Monitoring", "Kunjungan Terakhir", "Aksi"].map((heading) => (
                  <th key={heading} className="whitespace-nowrap px-3 py-3 first:rounded-l-[8px] last:rounded-r-[8px]">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.code} className="border-b border-[#E7E7EA] text-[13px] text-[#202027] last:border-0">
                  <td className="px-3 py-[11px]">{row.no}</td>
                  <td className="px-3 py-[11px] font-medium">{row.code}</td>
                  <td className="px-3 py-[11px]">{row.model}</td>
                  <td className="px-3 py-[11px]">{row.customer}</td>
                  <td className="px-3 py-[11px]">
                    <span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-medium ${
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
                  <td className="px-3 py-[11px] whitespace-nowrap">{row.lastVisit}</td>
                  <td className="relative px-3 py-[11px]">
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
    useState("November 2026");

  const [showMonthPicker, setShowMonthPicker] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const showMobileHeader = isReady && isMobile;

  if (isReady && !isMobile) {
    return <DesktopDashboard />;
  }

  return (
    <main className="min-h-dvh w-full overflow-x-clip bg-[#F7F7F7] pb-5">

      {/* ===================================================
          MOBILE HEADER
      =================================================== */}

      {showMobileHeader && (
        <header className="relative isolate overflow-hidden bg-[#730217] px-[clamp(18px,5vw,24px)] pb-8 pt-[max(20px,env(safe-area-inset-top))] text-white">

          {/* HEADER DECORATION */}

          <div className="pointer-events-none absolute -right-16 top-[115px] h-[220px] w-[220px] rounded-full bg-[#BF0B2C]/45" />

          <div className="pointer-events-none absolute -left-24 bottom-[-85px] h-[220px] w-[260px] rounded-full bg-[#BF0B2C]/30" />

          <div className="pointer-events-none absolute -right-20 bottom-[-100px] h-[240px] w-[250px] rounded-full bg-[#BF0B2C]/35" />

          <div className="relative z-10">

            {/* BRAND ROW */}

            <div className="flex min-h-[62px] items-center justify-between">

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
                  className="h-auto w-[clamp(130px,42vw,180px)] object-contain object-left"
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
                  className="relative flex h-11 w-11 items-center justify-center rounded-full text-white"
                >
                  <Bell size={26} strokeWidth={1.8} />

                  <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-[#730217] bg-[#F28C0F]" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 z-50 w-[min(270px,calc(100vw-40px))] rounded-xl border border-[#EEE7EB] bg-white p-4 text-[#29232A] shadow-lg">

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
                        size={20}
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

            <div className="relative mt-5 min-h-[170px]">

              <div className="relative z-10 w-[min(100%,calc(100%-88px))]">

                <h1 className="text-[clamp(19px,5.8vw,27px)] font-bold leading-tight tracking-tight text-white">
                  Halo, Budi Santoso
                </h1>

                <p className="mt-1 max-w-[390px] text-[clamp(12px,3.7vw,15px)] leading-relaxed text-white/90">
                  Berikut ringkasan operasional kunjungan unit.
                </p>

              </div>

              {/* PRINTER ILLUSTRATION */}

              <div className="pointer-events-none absolute right-[-5px] top-[18px] z-0 flex h-[clamp(112px,36vw,155px)] w-[clamp(112px,36vw,155px)] items-center justify-center">

                <Image
                  src="/images/moku/illustrations/dashboard-printer.png"
                  alt=""
                  width={340}
                  height={340}
                  priority
                  className="h-full w-full object-contain"
                  sizes="(max-width: 390px) 112px, (max-width: 600px) 140px, 155px"
                />

              </div>

              {/* PERIOD SELECTOR */}

              <div className="relative z-20 mt-4 w-fit max-w-full">

                <button
                  type="button"
                  onClick={() =>
                    setShowMonthPicker((value) => !value)
                  }
                  aria-expanded={showMonthPicker}
                  className="flex h-[clamp(46px,13vw,54px)] w-[min(100%,310px)] items-center gap-3 rounded-full bg-white px-[clamp(13px,4vw,19px)] text-[#171717]"
                >

                  <CalendarDays
                    size={23}
                    className="shrink-0"
                  />

                  <span className="min-w-0 flex-1 truncate text-left text-[clamp(13px,4vw,16px)] font-bold">
                    {selectedMonth}
                  </span>

                  <ChevronDown
                    size={20}
                    className="shrink-0"
                  />

                </button>

                {showMonthPicker && (
                  <div className="absolute left-0 top-[calc(100%+7px)] z-50 w-[min(260px,calc(100vw-40px))] overflow-hidden rounded-xl border border-[#EEE7EB] bg-white py-2 text-[#29232A] shadow-lg">

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
                        className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm ${
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

      {showMobileHeader && (
        <div className="pointer-events-none relative -mt-1 h-7 overflow-hidden">
          <div className="absolute -left-10 -top-10 h-24 w-[120%] rounded-[50%] bg-[#E9A0AC]" />
        </div>
      )}

      {/* ===================================================
          DASHBOARD CONTENT
      =================================================== */}

      <div
        className={`relative z-10 mx-auto w-full max-w-[920px] space-y-[clamp(10px,3vw,14px)] px-[clamp(12px,4vw,20px)] ${
          showMobileHeader ? "-mt-5" : "pt-4"
        }`}
      >

        {/* =================================================
            STATUS MONITORING MESIN
        ================================================= */}

        <section className="min-w-0 rounded-[22px] border border-[#EEEEEE] bg-white p-[clamp(13px,4vw,20px)] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">

          <SectionTitle>
            Status Monitoring Mesin
          </SectionTitle>

          <div className="mt-3 grid min-w-0 grid-cols-[minmax(104px,0.78fr)_minmax(0,1.22fr)] items-center gap-[clamp(7px,2vw,12px)] rounded-[19px] border border-[#F0F0F0] px-[clamp(7px,2vw,12px)] py-[clamp(13px,4vw,18px)]">

            {/* DONUT */}

            <div className="flex min-w-0 items-center justify-center border-r border-[#EEEEEE] pr-[clamp(6px,2vw,12px)]">

              <div
                className="relative aspect-square w-full max-w-[140px] rounded-full"
                style={{
                  background:
                    "conic-gradient(#BF0B2C 0deg 237deg, #D9D9D9 237deg 327deg, #F28C0F 327deg 360deg)",
                }}
              >

                <div className="absolute inset-[14%] flex flex-col items-center justify-center rounded-full bg-white">

                  <span className="text-[clamp(30px,10vw,46px)] font-extrabold leading-none text-[#111111]">
                    48
                  </span>

                  <span className="mt-1 text-[clamp(12px,3.8vw,16px)] text-[#29232A]">
                    Mesin
                  </span>

                </div>

              </div>
            </div>

            {/* MONITORING LEGEND */}

            <div className="min-w-0 space-y-[clamp(10px,3vw,15px)]">

              {monitoringData.map((item) => (
                <div
                  key={item.label}
                  className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-[clamp(4px,1.2vw,7px)]"
                >

                  <span className="flex min-w-0 items-center gap-[6px]">
                    <span
                      className="h-[clamp(10px,3vw,13px)] w-[clamp(10px,3vw,13px)] shrink-0 rounded-[4px]"
                      style={{
                        backgroundColor: item.color,
                      }}
                    />
                    <span className="min-w-0 text-[clamp(10px,2.9vw,12px)] font-bold leading-[1.18] text-[#29232A]">
                      {item.label}
                    </span>
                  </span>

                  <span className="whitespace-nowrap text-[clamp(9px,2.65vw,11px)] text-[#51474E]">
                    {item.value} Mesin
                  </span>

                  <span
                    className={`min-w-[clamp(32px,9vw,40px)] rounded-full px-[clamp(4px,1.3vw,7px)] py-[5px] text-center text-[clamp(9px,2.65vw,11px)] font-bold ${item.badge}`}
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

        <section className="min-w-0 rounded-[22px] border border-[#EEEEEE] bg-white p-[clamp(13px,4vw,20px)] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">

          {/* TITLE + TARGET */}

          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">

            <h2 className="min-w-0 whitespace-nowrap text-[clamp(15px,4.2vw,19px)] font-bold leading-tight tracking-tight text-[#29232A]">
              Kunjungan Bulan Ini
            </h2>

            <span className="shrink-0 whitespace-nowrap text-[clamp(9px,2.7vw,12px)] font-medium text-[#29232A]">
              Target: 40 Kunjungan
            </span>

          </div>

          {/* VISIT SUMMARY */}

          <div className="mt-4 grid min-w-0 grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] items-center gap-2">

            {/* TOTAL VISITS */}

            <div className="min-w-0 border-r border-[#EEEEEE] pr-2">

              <p className="text-[clamp(42px,14vw,58px)] font-extrabold leading-none tracking-tight text-[#111111]">
                32
              </p>

              <p className="mt-1 whitespace-nowrap text-[clamp(11px,3.8vw,16px)] text-[#29232A]">
                Total Kunjungan
              </p>

            </div>

            {/* GROWTH + ILLUSTRATION */}

            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_clamp(55px,22vw,130px)] items-center gap-1">

              <div className="min-w-0">

                <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#DDF9E5] px-[clamp(8px,3vw,13px)] py-1 text-[clamp(12px,4vw,17px)] font-bold text-[#168B3E]">
                  <TrendingUp
                    size={17}
                    className="shrink-0"
                  />
                  +14%
                </span>

                <p className="mt-2 text-[clamp(10px,3.4vw,14px)] leading-snug text-[#29232A]">
                  Dibanding bulan lalu
                  <br />
                  (28 kunjungan)
                </p>

              </div>

              <div className="flex h-[clamp(65px,22vw,115px)] min-w-0 items-center justify-center">

                <Image
                  src="/images/moku/illustrations/dashboard-activity.png"
                  alt=""
                  width={240}
                  height={240}
                  className="h-full w-full object-contain object-center"
                  sizes="(max-width: 390px) 75px, (max-width: 600px) 95px, 120px"
                />

              </div>

            </div>
          </div>

          {/* TARGET PROGRESS */}

          <div className="mt-5">

            <div className="mb-2 flex items-center justify-between gap-2">

              <p className="text-[clamp(12px,3.8vw,15px)] font-bold text-[#29232A]">
                Pencapaian Target
              </p>

              <p className="text-[clamp(12px,3.8vw,15px)] font-extrabold text-[#111111]">
                80%
              </p>

            </div>

            <div className="h-[11px] overflow-hidden rounded-full bg-[#E8E8E8]">

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

        <section className="min-w-0 rounded-[22px] border border-[#EEEEEE] bg-white p-[clamp(13px,4vw,20px)] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">

          <SectionTitle>
            Aksi Cepat
          </SectionTitle>

          <div className="mt-4 grid grid-cols-4 gap-[clamp(5px,2vw,12px)]">

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
              <Plus size={27} />
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
              <svg
                viewBox="0 0 24 24"
                width="25"
                height="25"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 8V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" />
                <rect x="3" y="8" width="18" height="9" rx="2" />
                <path d="M7 17v4h10v-4M7 12h.01M17 12h.01" />
              </svg>
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
              <ChartNoAxesColumn size={25} />
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
              <Download size={25} />
            </QuickAction>

          </div>
        </section>

        {/* =================================================
            MESIN PERLU PERHATIAN
        ================================================= */}

        <Link
          href="/monitoring"
          className="flex min-w-0 items-center gap-3 rounded-[20px] border border-[#F7E4DE] bg-[#FFF2EE] p-[clamp(11px,3.5vw,16px)]"
        >

          <div className="flex h-[clamp(44px,14vw,58px)] w-[clamp(44px,14vw,58px)] shrink-0 items-center justify-center rounded-full bg-[#FFE6D8] text-[#F28C0F]">

            <AlertTriangle
              size={32}
              strokeWidth={1.8}
            />

          </div>

          <div className="min-w-0 flex-1">

            <p className="text-[clamp(13px,4vw,17px)] font-extrabold leading-tight text-[#171717]">
              Mesin Perlu Perhatian
            </p>

            <p className="mt-1 text-[clamp(10px,3.3vw,14px)] leading-snug text-[#51474E]">
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

        <section className="min-w-0 rounded-[22px] border border-[#EEEEEE] bg-white p-[clamp(13px,4vw,20px)] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">

          <div className="flex min-w-0 items-center justify-between gap-2">

            <SectionTitle>
              Aktivitas Terbaru
            </SectionTitle>

            <Link
              href="/visit-history"
              className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[clamp(11px,3.5vw,14px)] font-bold text-[#BF0B2C]"
            >
              Lihat Semua
              <ChevronRight size={17} />
            </Link>

          </div>

          <div className="mt-3 divide-y divide-[#EEEEEE]">

            {recentActivities.map((activity, index) => (
              <div
                key={`${activity.machine}-${index}`}
                className="flex min-w-0 items-center gap-3 py-3"
              >

                <div
                  className={`flex h-[clamp(39px,12vw,50px)] w-[clamp(39px,12vw,50px)] shrink-0 items-center justify-center rounded-full ${
                    activity.status === "success"
                      ? "bg-[#DDF8E7] text-[#249653]"
                      : "bg-[#FCE7E8] text-[#D83B45]"
                  }`}
                >

                  {activity.status === "success" ? (
                    <CheckCircle2 size={26} />
                  ) : (
                    <Clock3 size={26} />
                  )}

                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-[clamp(12px,3.8vw,15px)] font-bold text-[#171717]">
                    {activity.title}
                  </p>

                  <p className="mt-1 truncate text-[clamp(10px,3.3vw,13px)] text-[#817780]">
                    {activity.machine} · {activity.customer}
                  </p>

                </div>

                <span className="shrink-0 whitespace-nowrap text-[clamp(10px,3vw,13px)] text-[#817780]">
                  {activity.time}
                </span>

              </div>
            ))}

          </div>
        </section>

        {/* FOOTER */}

        <div className="pb-3 pt-1 text-center">

          <p className="text-[10px] text-[#A39AA0]">
            MOKU — Monitoring Operasional Kunjungan Unit
          </p>

          <p className="mt-1 text-[10px] text-[#B3ABB0]">
            Track Precisely, Deliver Quality
          </p>

        </div>

      </div>
    </main>
  );
}
