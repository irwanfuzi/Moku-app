
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
  Plus,
  Printer,
  TrendingUp,
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
    <h2 className="min-w-0 text-[clamp(16px,4.1vw,19px)] font-bold leading-[1.15] tracking-tight text-[#29232A]">
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
      className="flex min-w-0 flex-col items-center justify-center gap-[clamp(6px,1.8vw,8px)] rounded-[16px] bg-[#FCECEF] px-1 py-[clamp(10px,2.8vw,13px)] text-center"
    >
      <span className="flex h-[clamp(34px,9.5vw,40px)] w-[clamp(34px,9.5vw,40px)] shrink-0 items-center justify-center rounded-[11px] bg-[#BF0B2C] text-white">
        {children}
      </span>

      <span className="min-h-[2.2em] text-[clamp(10px,2.7vw,12px)] font-medium leading-[1.12] text-[#171717]">
        {label}
      </span>
    </Link>
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
    "Agustus 2025",
    "September 2025",
    "Oktober 2025",
    "November 2025",
    "Desember 2025",
  ];

  const [showMonthPicker, setShowMonthPicker] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const showMobileHeader = isReady && isMobile;

  return (
    <main className="min-h-dvh w-full overflow-x-clip bg-[#F7F7F7] pb-[calc(88px+env(safe-area-inset-bottom))]">

      {/* ===================================================
          MOBILE HEADER
      =================================================== */}

      {showMobileHeader && (
        <header className="relative isolate overflow-hidden bg-[#730217] px-[clamp(16px,4.8vw,22px)] pb-[clamp(9px,2.4vw,12px)] pt-[max(14px,env(safe-area-inset-top))] text-white">

          {/* HEADER DECORATION */}

          <div className="pointer-events-none absolute -right-16 top-[92px] h-[170px] w-[170px] rounded-full bg-[#BF0B2C]/45" />

          <div className="pointer-events-none absolute -left-24 bottom-[-78px] h-[170px] w-[220px] rounded-full bg-[#BF0B2C]/30" />

          <div className="pointer-events-none absolute -right-20 bottom-[-90px] h-[190px] w-[210px] rounded-full bg-[#BF0B2C]/35" />

          <div className="relative z-10">

            {/* BRAND ROW */}

            <div className="flex h-[clamp(38px,10vw,44px)] min-h-[clamp(38px,10vw,44px)] items-center justify-between">

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
                  className="h-auto w-[clamp(112px,29vw,128px)] object-contain object-left"
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
                  className="relative flex h-[44px] w-[44px] items-center justify-center rounded-full text-white"
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

            <div className="relative mt-[clamp(7px,1.8vw,9px)] pb-0">

              <div className="relative z-10 w-[min(100%,calc(100%-clamp(104px,27vw,116px)))] max-w-[42rem]">

                <h1 className="text-[clamp(20px,5.5vw,24px)] font-bold leading-[1.12] tracking-tight !text-white">
                  Halo, Budi Santoso
                </h1>

                <p className="mt-[2px] max-w-[42rem] text-[clamp(12px,3.35vw,14px)] leading-[1.3] text-white/90">
                  Berikut ringkasan operasional kunjungan unit.
                </p>

              </div>

              {/* PRINTER ILLUSTRATION — tetap dipertahankan dari desain asli */}
              <div className="pointer-events-none absolute right-[-2px] top-[2px] z-0 flex h-[clamp(82px,22vw,96px)] w-[clamp(82px,22vw,96px)] items-center justify-center">
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

              <div className="relative z-20 mt-[clamp(12px,3.1vw,15px)] w-fit max-w-full">

                <button
                  type="button"
                  onClick={() =>
                    setShowMonthPicker((value) => !value)
                  }
                  aria-expanded={showMonthPicker}
                  className="flex h-[clamp(38px,9.5vw,42px)] w-[min(100%,clamp(148px,39vw,174px))] items-center gap-[clamp(10px,2.8vw,14px)] rounded-full bg-white px-[clamp(13px,3.5vw,17px)] text-[#171717]"
                >

                  <CalendarDays
                    size={21}
                    className="shrink-0"
                  />

                  <span className="min-w-0 flex-1 truncate text-left text-[clamp(12px,3.2vw,14px)] font-bold">
                    {selectedMonth}
                  </span>

                  <ChevronDown
                    size={17}
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

      {showMobileHeader && (
        <div className="pointer-events-none relative -mt-1 h-[clamp(18px,4.5vw,24px)] overflow-hidden">
          <div className="absolute -left-[8%] -top-[34px] h-[70px] w-[116%] rounded-[50%] bg-[#E9A0AC]" />
        </div>
      )}

      {/* ===================================================
          DASHBOARD CONTENT
      =================================================== */}

      <div
        className={`relative z-10 mx-auto w-full max-w-[920px] space-y-[clamp(9px,2.4vw,12px)] px-[clamp(10px,2.8vw,12px)] ${
          showMobileHeader ? "-mt-[clamp(8px,2vw,12px)]" : "pt-4"
        }`}
      >

        {/* =================================================
            STATUS MONITORING MESIN
        ================================================= */}

        <section className="min-w-0 rounded-[clamp(18px,4.5vw,22px)] border border-[#EEEEEE] bg-white p-[clamp(12px,3.4vw,16px)] shadow-[0_2px_7px_rgba(0,0,0,0.055)]">

          <SectionTitle>
            Status Monitoring Mesin
          </SectionTitle>

          <div className="mt-[clamp(10px,2.8vw,14px)] grid min-w-0 grid-cols-[minmax(0,0.32fr)_minmax(0,0.68fr)] items-center gap-[clamp(8px,2.2vw,12px)] rounded-[18px] border border-[#F0F0F0] px-[clamp(8px,2.2vw,12px)] py-[clamp(10px,2.8vw,14px)]">

            {/* DONUT */}

            <div className="flex min-w-0 items-center justify-center border-r border-[#EEEEEE] pr-[clamp(6px,2vw,12px)]">

              <div
                className="relative aspect-square w-full max-w-[clamp(82px,24vw,102px)] rounded-full"
                style={{
                  background:
                    "conic-gradient(#BF0B2C 0deg 237deg, #D9D9D9 237deg 327deg, #F28C0F 327deg 360deg)",
                }}
              >

                <div className="absolute inset-[14%] flex flex-col items-center justify-center rounded-full bg-white">

                  <span className="text-[clamp(28px,8vw,34px)] font-extrabold leading-none text-[#111111]">
                    48
                  </span>

                  <span className="mt-1 text-[clamp(12px,3.3vw,14px)] text-[#29232A]">
                    Mesin
                  </span>

                </div>

              </div>
            </div>

            {/* MONITORING LEGEND */}

            <div className="min-w-0 space-y-[clamp(10px,2.8vw,14px)]">

              {monitoringData.map((item) => (
                <div
                  key={item.label}
                  className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-[clamp(4px,1.4vw,7px)]"
                >

                  <span className="flex min-w-0 items-center gap-[6px]">
                    <span
                      className="h-[clamp(10px,3vw,13px)] w-[clamp(10px,3vw,13px)] shrink-0 rounded-[4px]"
                      style={{
                        backgroundColor: item.color,
                      }}
                    />
                    <span className="min-w-0 whitespace-nowrap text-[clamp(9px,2.5vw,11px)] font-bold leading-[1.12] text-[#29232A]">
                      {item.label}
                    </span>
                  </span>

                  <span className="whitespace-nowrap text-[clamp(8px,2.35vw,10px)] text-[#51474E]">
                    {item.value} Mesin
                  </span>

                  <span
                    className={`min-w-[32px] rounded-full px-[5px] py-[3px] text-center text-[clamp(9px,2.4vw,11px)] font-bold ${item.badge}`}
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

        <section className="min-w-0 rounded-[clamp(18px,4.5vw,22px)] border border-[#EEEEEE] bg-white p-[clamp(12px,3.4vw,16px)] shadow-[0_2px_7px_rgba(0,0,0,0.055)]">

          {/* TITLE + TARGET */}

          <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">

            <h2 className="min-w-0 whitespace-nowrap text-[clamp(16px,4.1vw,19px)] font-bold leading-[1.15] tracking-tight text-[#29232A]">
              Kunjungan Bulan Ini
            </h2>

            <span className="shrink-0 whitespace-nowrap text-[clamp(11px,2.9vw,13px)] font-medium text-[#29232A]">
              Target: 40 Kunjungan
            </span>

          </div>

          {/* VISIT SUMMARY */}

          <div className="mt-[clamp(10px,2.8vw,13px)] grid min-w-0 grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] items-center gap-[clamp(8px,2.2vw,12px)]">

            {/* TOTAL VISITS */}

            <div className="min-w-0 border-r border-[#EEEEEE] pr-2">

              <p className="text-[clamp(38px,10vw,46px)] font-extrabold leading-none tracking-tight text-[#111111]">
                32
              </p>

              <p className="mt-1 whitespace-nowrap text-[clamp(12px,3.1vw,14px)] text-[#29232A]">
                Total Kunjungan
              </p>

            </div>

            {/* GROWTH SUMMARY + ACTIVITY ILLUSTRATION */}

            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_clamp(68px,20vw,88px)] items-center gap-[4px]">
              <div className="min-w-0">
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#DDF9E5] px-[clamp(9px,2.5vw,16px)] py-[6px] text-[clamp(12px,3.1vw,14px)] font-bold text-[#168B3E]">
                  <TrendingUp size={19} className="shrink-0" />
                  +14%
                </span>

                <p className="mt-[7px] text-[clamp(11px,2.9vw,13px)] leading-[1.3] text-[#29232A]">
                  Dibanding bulan lalu
                  <br />
                  (28 kunjungan)
                </p>
              </div>

              <div className="flex h-[clamp(68px,18vw,82px)] min-w-0 items-center justify-center">
                <Image
                  src="/images/moku/illustrations/dashboard-activity.png"
                  alt=""
                  width={240}
                  height={240}
                  className="h-full w-full object-contain object-center"
                  sizes="(max-width: 390px) 68px, (max-width: 600px) 90px, 116px"
                />
              </div>
            </div>
          </div>

          {/* TARGET PROGRESS */}

          <div className="mt-[12px]">

            <div className="mb-2 flex items-center justify-between gap-2">

              <p className="text-[clamp(12px,3.1vw,14px)] font-bold text-[#29232A]">
                Pencapaian Target
              </p>

              <p className="text-[clamp(12px,3.1vw,14px)] font-extrabold text-[#111111]">
                80%
              </p>

            </div>

            <div className="h-[clamp(10px,2.8vw,12px)] overflow-hidden rounded-full bg-[#E8E8E8]">

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

        <section className="min-w-0 rounded-[clamp(18px,4.5vw,22px)] border border-[#EEEEEE] bg-white p-[clamp(12px,3.4vw,16px)] shadow-[0_2px_7px_rgba(0,0,0,0.055)]">

          <SectionTitle>
            Aksi Cepat
          </SectionTitle>

          <div className="mt-[clamp(10px,2.8vw,14px)] grid grid-cols-4 gap-[clamp(5px,1.4vw,7px)]">

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
              <Plus size={24} strokeWidth={2.4} />
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
              <Printer size={23} strokeWidth={2} />
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
              <ChartNoAxesColumn size={23} />
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
              <Download size={23} />
            </QuickAction>

          </div>
        </section>

        {/* =================================================
            MESIN PERLU PERHATIAN
        ================================================= */}

        <Link
          href="/monitoring"
          className="flex min-w-0 items-center gap-3 rounded-[18px] border border-[#F7E4DE] bg-[#FFF2EE] p-[clamp(10px,2.7vw,12px)]"
        >

          <div className="flex h-[clamp(44px,12vw,50px)] w-[clamp(44px,12vw,50px)] shrink-0 items-center justify-center rounded-full bg-[#FFE6D8] text-[#F28C0F]">

            <AlertTriangle
              size={29}
              strokeWidth={1.8}
            />

          </div>

          <div className="min-w-0 flex-1">

            <p className="text-[clamp(13px,3.5vw,15px)] font-extrabold leading-tight text-[#171717]">
              Mesin Perlu Perhatian
            </p>

            <p className="mt-1 text-[clamp(11px,2.9vw,13px)] leading-[1.3] text-[#51474E]">
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

        <section className="min-w-0 rounded-[clamp(18px,4.5vw,22px)] border border-[#EEEEEE] bg-white p-[clamp(12px,3.4vw,16px)] shadow-[0_2px_7px_rgba(0,0,0,0.055)]">

          <div className="flex min-w-0 items-center justify-between gap-2">

            <SectionTitle>
              Aktivitas Terbaru
            </SectionTitle>

            <Link
              href="/visit-history"
              className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[clamp(10px,3vw,12px)] font-bold text-[#BF0B2C]"
            >
              Lihat Semua
              <ChevronRight size={17} />
            </Link>

          </div>

          <div className="mt-[10px] divide-y divide-[#EEEEEE]">

            {recentActivities.map((activity, index) => (
              <div
                key={`${activity.machine}-${index}`}
                className="flex min-w-0 items-center gap-[10px] py-[7px]"
              >

                <div
                  className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full ${
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

                  <p className="truncate text-[clamp(11px,2.9vw,13px)] font-bold text-[#171717]">
                    {activity.title}
                  </p>

                  <p className="mt-0 truncate text-[clamp(10px,2.7vw,12px)] text-[#817780]">
                    {activity.machine} · {activity.customer}
                  </p>

                </div>

                <span className="shrink-0 whitespace-nowrap text-[clamp(11px,2.8vw,14px)] text-[#817780]">
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
