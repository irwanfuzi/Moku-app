
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

              <div className="relative z-10 w-[min(100%,calc(100%-100px))]">

                <h1 className="whitespace-nowrap text-[clamp(19px,6vw,27px)] font-bold leading-tight tracking-tight text-white">
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
        className={`relative z-10 mx-auto w-full max-w-[760px] space-y-[clamp(10px,3vw,14px)] px-[clamp(12px,4vw,20px)] ${
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

          <div className="mt-3 grid min-w-0 grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] items-center gap-[clamp(7px,2.5vw,14px)] rounded-[19px] border border-[#F0F0F0] px-[clamp(8px,2.5vw,14px)] py-[clamp(13px,4vw,18px)]">

            {/* DONUT */}

            <div className="flex min-w-0 items-center justify-center border-r border-[#EEEEEE] pr-[clamp(6px,2vw,12px)]">

              <div
                className="relative aspect-square w-full max-w-[150px] rounded-full"
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

            <div className="min-w-0 space-y-[clamp(12px,3.8vw,18px)]">

              {monitoringData.map((item) => (
                <div
                  key={item.label}
                  className="grid min-w-0 grid-cols-[10px_minmax(0,1fr)_auto_auto] items-center gap-[clamp(4px,1.5vw,9px)]"
                >

                  <span
                    className="h-[clamp(10px,3.4vw,14px)] w-[clamp(10px,3.4vw,14px)] rounded-[4px]"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />

                  <span className="min-w-0 text-[clamp(9px,3.1vw,13px)] font-bold leading-[1.2] text-[#29232A]">
                    {item.label}
                  </span>

                  <span className="whitespace-nowrap text-[clamp(9px,2.9vw,13px)] text-[#51474E]">
                    {item.value} Mesin
                  </span>

                  <span
                    className={`min-w-[clamp(34px,10vw,45px)] rounded-full px-[clamp(5px,1.8vw,9px)] py-[5px] text-center text-[clamp(9px,2.9vw,13px)] font-bold ${item.badge}`}
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

          <div className="flex min-w-0 items-center justify-between gap-2">

            <h2 className="min-w-0 whitespace-nowrap text-[clamp(14px,4.3vw,20px)] font-bold leading-tight tracking-tight text-[#29232A]">
              Kunjungan Bulan Ini
            </h2>

            <span className="shrink-0 whitespace-nowrap text-[clamp(9px,3vw,13px)] font-medium text-[#29232A]">
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
