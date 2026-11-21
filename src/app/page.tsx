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
   DESIGN SYSTEM — MOKU
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
   SHARED SECTION TITLE
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

/*
  PERTAHANKAN DesktopDashboard DAN DATA DESKTOP
  DARI KODE SEBELUMNYA.

  Tidak ada perubahan pada layout Desktop.
*/

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

  const months = [
    "September 2025",
    "Oktober 2025",
    "November 2025",
    "Desember 2025",
    "Januari 2026",
  ];

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

        {/* BACKGROUND GRADIENT */}

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_45%_35%,rgba(191,11,44,0.24),transparent_65%)]" />

        {/* HEADER WAVE — ORIGINAL ASSET */}

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

          {/* BRAND ROW */}

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

            {/* PRINTER ASSET */}

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
              STATUS MONITORING HEADER
          ============================================= */}

          <section>

            {/* TITLE OUTSIDE CARD */}

            <div className="mb-[11px] flex min-w-0 items-center justify-between gap-2">

              <SectionTitle>
                Status Monitoring Mesin
              </SectionTitle>

              {/* PERIOD SELECTOR */}

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
              VISIT SUMMARY
          ============================================= */}

          <section>

            {/* TITLE OUTSIDE CARD */}

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

              {/* SUMMARY */}

              <div className="grid min-w-0 grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] items-center gap-2">

                {/* TOTAL */}

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

                  {/* ACTIVITY ILLUSTRATION */}

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

              {/* TARGET PROGRESS */}

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