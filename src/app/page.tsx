
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

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getMonthOptions(centerDate: Date) {
  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(
      centerDate.getFullYear(),
      centerDate.getMonth() + index - 2,
      1,
    );
    return formatMonth(date);
  });
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <h2 className="min-w-0 text-[clamp(20px,5.2vw,28px)] font-bold leading-[1.15] tracking-tight text-[#29232A]">
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
      className="flex min-w-0 flex-col items-center justify-center gap-[clamp(10px,2vw,15px)] rounded-[clamp(18px,4vw,24px)] bg-[#FCECEF] px-1 py-[clamp(16px,3.8vw,24px)] text-center"
    >
      <span className="flex h-[clamp(54px,15vw,78px)] w-[clamp(54px,15vw,78px)] shrink-0 items-center justify-center rounded-[clamp(14px,3vw,20px)] bg-[#BF0B2C] text-white">
        {children}
      </span>

      <span className="min-h-[2.3em] text-[clamp(11px,3vw,16px)] font-medium leading-[1.15] text-[#171717]">
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
    useState(() => formatMonth(new Date()));

  const months = getMonthOptions(new Date());

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

            <div className="flex min-h-[clamp(54px,14vw,72px)] items-center justify-between">

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
                  className="h-auto w-[clamp(132px,39vw,184px)] object-contain object-left"
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
                  className="relative flex h-[clamp(42px,11vw,48px)] w-[clamp(42px,11vw,48px)] items-center justify-center rounded-full text-white"
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

            <div className="relative mt-[clamp(22px,6vw,34px)] pb-[clamp(22px,6vw,34px)]">

              <div className="relative z-10 w-full max-w-[42rem]">

                <h1 className="text-[clamp(23px,6.2vw,32px)] font-bold leading-[1.12] tracking-tight !text-white">
                  Halo, Budi Santoso
                </h1>

                <p className="mt-2 max-w-[42rem] text-[clamp(13px,3.7vw,17px)] leading-[1.45] text-white/90">
                  Berikut ringkasan operasional kunjungan unit.
                </p>

              </div>

              {/* PERIOD SELECTOR */}

              <div className="relative z-20 mt-[clamp(22px,6vw,30px)] w-fit max-w-full">

                <button
                  type="button"
                  onClick={() =>
                    setShowMonthPicker((value) => !value)
                  }
                  aria-expanded={showMonthPicker}
                  className="flex h-[clamp(52px,14vw,64px)] w-[min(100%,min(100vw-40px,440px))] items-center gap-[clamp(12px,3.5vw,18px)] rounded-full bg-white px-[clamp(18px,4.5vw,26px)] text-[#171717]"
                >

                  <CalendarDays
                    size={23}
                    className="shrink-0"
                  />

                  <span className="min-w-0 flex-1 truncate text-left text-[clamp(15px,4.2vw,19px)] font-bold">
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
        <div className="pointer-events-none relative -mt-1 h-[clamp(30px,7vw,46px)] overflow-hidden">
          <div className="absolute -left-[8%] -top-[clamp(34px,8vw,52px)] h-[clamp(74px,18vw,110px)] w-[116%] rounded-[50%] bg-[#E9A0AC]" />
        </div>
      )}

      {/* ===================================================
          DASHBOARD CONTENT
      =================================================== */}

      <div
        className={`relative z-10 mx-auto w-full max-w-[920px] space-y-[clamp(14px,3.2vw,22px)] px-[clamp(16px,4vw,30px)] ${
          showMobileHeader ? "-mt-[clamp(14px,3.5vw,22px)]" : "pt-4"
        }`}
      >

        {/* =================================================
            STATUS MONITORING MESIN
        ================================================= */}

        <section className="min-w-0 rounded-[clamp(20px,4.8vw,28px)] border border-[#EEEEEE] bg-white p-[clamp(18px,4.2vw,30px)] shadow-[0_3px_12px_rgba(0,0,0,0.045)]">

          <SectionTitle>
            Status Monitoring Mesin
          </SectionTitle>

          <div className="mt-[clamp(18px,4vw,28px)] grid min-w-0 grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] items-center gap-[clamp(12px,3vw,24px)] rounded-[clamp(18px,4vw,26px)] border border-[#F0F0F0] px-[clamp(12px,3vw,22px)] py-[clamp(18px,4vw,30px)]">

            {/* DONUT */}

            <div className="flex min-w-0 items-center justify-center border-r border-[#EEEEEE] pr-[clamp(6px,2vw,12px)]">

              <div
                className="relative aspect-square w-full max-w-[clamp(150px,42vw,280px)] rounded-full"
                style={{
                  background:
                    "conic-gradient(#BF0B2C 0deg 237deg, #D9D9D9 237deg 327deg, #F28C0F 327deg 360deg)",
                }}
              >

                <div className="absolute inset-[14%] flex flex-col items-center justify-center rounded-full bg-white">

                  <span className="text-[clamp(38px,10.5vw,64px)] font-extrabold leading-none text-[#111111]">
                    48
                  </span>

                  <span className="mt-1 text-[clamp(14px,3.8vw,20px)] text-[#29232A]">
                    Mesin
                  </span>

                </div>

              </div>
            </div>

            {/* MONITORING LEGEND */}

            <div className="min-w-0 space-y-[clamp(16px,3.8vw,26px)]">

              {monitoringData.map((item) => (
                <div
                  key={item.label}
                  className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-[clamp(7px,1.8vw,14px)]"
                >

                  <span className="flex min-w-0 items-center gap-[6px]">
                    <span
                      className="h-[clamp(10px,3vw,13px)] w-[clamp(10px,3vw,13px)] shrink-0 rounded-[4px]"
                      style={{
                        backgroundColor: item.color,
                      }}
                    />
                    <span className="min-w-0 text-[clamp(12px,3.1vw,17px)] font-bold leading-[1.2] text-[#29232A]">
                      {item.label}
                    </span>
                  </span>

                  <span className="whitespace-nowrap text-[clamp(11px,2.9vw,16px)] text-[#51474E]">
                    {item.value} Mesin
                  </span>

                  <span
                    className={`min-w-[clamp(42px,10vw,62px)] rounded-full px-[clamp(8px,2vw,14px)] py-[clamp(6px,1.4vw,9px)] text-center text-[clamp(11px,2.9vw,16px)] font-bold ${item.badge}`}
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

        <section className="min-w-0 rounded-[clamp(20px,4.8vw,28px)] border border-[#EEEEEE] bg-white p-[clamp(18px,4.2vw,30px)] shadow-[0_3px_12px_rgba(0,0,0,0.045)]">

          {/* TITLE + TARGET */}

          <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">

            <h2 className="min-w-0 whitespace-nowrap text-[clamp(19px,4.9vw,27px)] font-bold leading-[1.15] tracking-tight text-[#29232A]">
              Kunjungan Bulan Ini
            </h2>

            <span className="shrink-0 whitespace-nowrap text-[clamp(11px,2.8vw,16px)] font-medium text-[#29232A]">
              Target: 40 Kunjungan
            </span>

          </div>

          {/* VISIT SUMMARY */}

          <div className="mt-[clamp(20px,4.5vw,30px)] grid min-w-0 grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-[clamp(10px,3vw,22px)]">

            {/* TOTAL VISITS */}

            <div className="min-w-0 border-r border-[#EEEEEE] pr-2">

              <p className="text-[clamp(54px,15vw,88px)] font-extrabold leading-none tracking-tight text-[#111111]">
                32
              </p>

              <p className="mt-1 whitespace-nowrap text-[clamp(14px,3.8vw,21px)] text-[#29232A]">
                Total Kunjungan
              </p>

            </div>

            {/* GROWTH SUMMARY */}

            <div className="min-w-0">
              <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#DDF9E5] px-[clamp(10px,3vw,18px)] py-[clamp(7px,1.8vw,11px)] text-[clamp(15px,4vw,22px)] font-bold text-[#168B3E]">
                <TrendingUp size={19} className="shrink-0" />
                +14%
              </span>

              <p className="mt-3 text-[clamp(13px,3.4vw,18px)] leading-snug text-[#29232A]">
                Dibanding bulan lalu
                <br />
                (28 kunjungan)
              </p>
            </div>
          </div>

          {/* TARGET PROGRESS */}

          <div className="mt-[clamp(24px,5vw,34px)]">

            <div className="mb-2 flex items-center justify-between gap-2">

              <p className="text-[clamp(13px,3.4vw,18px)] font-bold text-[#29232A]">
                Pencapaian Target
              </p>

              <p className="text-[clamp(12px,3.8vw,15px)] font-extrabold text-[#111111]">
                80%
              </p>

            </div>

            <div className="h-[clamp(12px,2.2vw,17px)] overflow-hidden rounded-full bg-[#E8E8E8]">

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

        <section className="min-w-0 rounded-[clamp(20px,4.8vw,28px)] border border-[#EEEEEE] bg-white p-[clamp(18px,4.2vw,30px)] shadow-[0_3px_12px_rgba(0,0,0,0.045)]">

          <SectionTitle>
            Aksi Cepat
          </SectionTitle>

          <div className="mt-[clamp(18px,4vw,28px)] grid grid-cols-4 gap-[clamp(8px,2vw,16px)]">

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
              <Printer size={27} strokeWidth={2} />
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
          className="flex min-w-0 items-center gap-3 rounded-[clamp(18px,4vw,24px)] border border-[#F7E4DE] bg-[#FFF2EE] p-[clamp(14px,3.5vw,22px)]"
        >

          <div className="flex h-[clamp(44px,14vw,58px)] w-[clamp(44px,14vw,58px)] shrink-0 items-center justify-center rounded-full bg-[#FFE6D8] text-[#F28C0F]">

            <AlertTriangle
              size={32}
              strokeWidth={1.8}
            />

          </div>

          <div className="min-w-0 flex-1">

            <p className="text-[clamp(15px,3.8vw,20px)] font-extrabold leading-tight text-[#171717]">
              Mesin Perlu Perhatian
            </p>

            <p className="mt-1 text-[clamp(12px,3.1vw,16px)] leading-snug text-[#51474E]">
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

        <section className="min-w-0 rounded-[clamp(20px,4.8vw,28px)] border border-[#EEEEEE] bg-white p-[clamp(18px,4.2vw,30px)] shadow-[0_3px_12px_rgba(0,0,0,0.045)]">

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

                  <p className="truncate text-[clamp(13px,3.4vw,18px)] font-bold text-[#171717]">
                    {activity.title}
                  </p>

                  <p className="mt-1 truncate text-[clamp(11px,2.9vw,15px)] text-[#817780]">
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
