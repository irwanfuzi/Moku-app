"use client";

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
  FileBarChart,
  Layers3,
  Monitor,
  Plus,
  Printer,
  UserRound,
  X,
  TrendingUp,
  ClipboardCheck,
} from "lucide-react";

import { useAppLayout } from "@/components/layout/app-shell";

/* =========================================================
   DUMMY DATA
========================================================= */

const monitoringData = [
  {
    label: "Sudah Dikunjungi",
    value: 32,
    percentage: 66,
    color: "#BF0B2C",
  },
  {
    label: "Belum Dikunjungi",
    value: 12,
    percentage: 25,
    color: "#D9D9D9",
  },
  {
    label: "Perlu Perhatian",
    value: 4,
    percentage: 9,
    color: "#F28C0F",
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
    <h2 className="text-[19px] font-bold tracking-tight text-[#171717]">
      {children}
    </h2>
  );
}

/* =========================================================
   DASHBOARD PAGE
========================================================= */

export default function DashboardPage() {
  const { isMobile, isReady } = useAppLayout();

  const [selectedMonth, setSelectedMonth] =
    useState("Oktober 2026");

  const [showMonthPicker, setShowMonthPicker] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const showMobileHeader = isReady && isMobile;

  return (
    <main className="min-h-dvh w-full overflow-x-hidden bg-[#F7F7F7] pb-5">

      {/* ===================================================
          MOBILE / PWA HEADER
      =================================================== */}

      {showMobileHeader && (
        <header className="relative isolate overflow-visible bg-[#730217] px-5 pb-8 pt-[max(22px,env(safe-area-inset-top))] text-white">

          {/* HEADER DECORATION */}

          <div className="pointer-events-none absolute -right-16 top-24 h-56 w-56 rounded-full bg-[#BF0B2C]/45" />

          <div className="pointer-events-none absolute -left-24 top-48 h-52 w-64 rounded-full bg-[#BF0B2C]/30" />

          <div className="pointer-events-none absolute -right-12 bottom-0 h-36 w-56 rounded-full bg-[#BF0B2C]/35" />

          <div className="relative z-10">

            {/* BRAND */}

            <div className="flex items-center justify-between">

              <Link
                href="/"
                aria-label="MOKU Dashboard"
                className="flex items-center"
              >
                <div className="flex items-center gap-0.5">

                  <span className="text-[38px] font-extrabold tracking-[-3px]">
                    M
                  </span>

                  {/* TEMPORARY MASCOT PLACEHOLDER */}

                  <span className="relative flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#F28C0F] bg-[#BF0B2C]">

                    <span className="absolute top-0.5 text-[10px] font-bold text-white">
                      M
                    </span>

                    <span className="absolute bottom-1 h-4 w-6 rounded-full bg-[#360107]" />

                    <span className="absolute bottom-[9px] h-1.5 w-3 rounded-full bg-white" />

                  </span>

                  <span className="text-[38px] font-extrabold tracking-[-3px]">
                    KU
                  </span>

                </div>
              </Link>

              {/* NOTIFICATION */}

              <div className="relative">

                <button
                  type="button"
                  onClick={() =>
                    setShowNotifications(!showNotifications)
                  }
                  aria-label="Notifikasi"
                  aria-expanded={showNotifications}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full text-white"
                >
                  <Bell size={26} strokeWidth={1.8} />

                  <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-[#730217] bg-[#F28C0F]" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 z-50 w-[270px] rounded-xl border border-[#EEE7EB] bg-white p-4 text-[#29232A] shadow-lg">

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

            {/* GREETING */}

            <div className="mt-7">

              <p className="text-[26px] font-bold leading-tight tracking-tight">
                Halo, Budi Santoso
              </p>

              <p className="mt-1 text-[14px] leading-relaxed text-white/90">
                Berikut ringkasan operasional kunjungan unit.
              </p>

            </div>

            {/* PERIOD SELECTOR */}

            <div className="relative mt-4 w-fit">

              <button
                type="button"
                onClick={() =>
                  setShowMonthPicker(!showMonthPicker)
                }
                aria-expanded={showMonthPicker}
                className="flex h-[50px] min-w-[235px] items-center gap-3 rounded-full bg-white px-4 text-[#171717]"
              >

                <CalendarDays size={23} />

                <span className="flex-1 text-left text-[15px] font-bold">
                  {selectedMonth}
                </span>

                <ChevronDown size={20} />

              </button>

              {showMonthPicker && (
                <div className="absolute left-0 top-[56px] z-50 w-[245px] overflow-hidden rounded-xl border border-[#EEE7EB] bg-white py-2 text-[#29232A] shadow-lg">

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

            {/* COPIER ILLUSTRATION PLACEHOLDER */}

            <div className="pointer-events-none absolute bottom-[-5px] right-0 hidden text-white/75 sm:block">
              <Printer size={115} strokeWidth={1.2} />
            </div>

          </div>
        </header>
      )}

      {/* ===================================================
          PINK HEADER TRANSITION
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
        className={`relative z-10 mx-auto w-full max-w-[760px] space-y-3 px-4 ${
          showMobileHeader ? "-mt-5" : "pt-4"
        }`}
      >

        {/* =================================================
            STATUS MONITORING MESIN
        ================================================= */}

        <section className="rounded-[23px] border border-[#EEEEEE] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">

          <SectionTitle>
            Status Monitoring Mesin
          </SectionTitle>

          <div className="mt-3 grid grid-cols-[0.85fr_1.15fr] items-center gap-3 rounded-[19px] border border-[#F0F0F0] px-3 py-4">

            {/* DONUT */}

            <div className="flex justify-center border-r border-[#EEEEEE] pr-2">

              <div
                className="relative flex h-[150px] w-[150px] items-center justify-center rounded-full"
                style={{
                  background:
                    "conic-gradient(#BF0B2C 0deg 237deg, #D9D9D9 237deg 327deg, #F28C0F 327deg 360deg)",
                }}
              >

                <div className="flex h-[108px] w-[108px] flex-col items-center justify-center rounded-full bg-white">

                  <span className="text-[39px] font-extrabold leading-none text-[#111111]">
                    48
                  </span>

                  <span className="mt-1 text-[15px] text-[#29232A]">
                    Mesin
                  </span>

                </div>

              </div>

            </div>

            {/* LEGEND */}

            <div className="space-y-4">

              {monitoringData.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2"
                >

                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-[4px]"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />

                  <div className="min-w-0 flex-1">

                    <p className="text-[11px] font-bold leading-tight text-[#29232A] sm:text-[13px]">
                      {item.label}
                    </p>

                  </div>

                  <span className="whitespace-nowrap text-[11px] text-[#51474E] sm:text-[13px]">
                    {item.value} Mesin
                  </span>

                  <span
                    className={`min-w-[43px] rounded-full px-2 py-1 text-center text-[11px] font-bold ${
                      item.label === "Sudah Dikunjungi"
                        ? "bg-[#FCECEF] text-[#BF0B2C]"
                        : item.label === "Perlu Perhatian"
                          ? "bg-[#FFF0E5] text-[#EB5513]"
                          : "bg-[#F1F1F1] text-[#777777]"
                    }`}
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

        <section className="rounded-[23px] border border-[#EEEEEE] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">

          <div className="flex items-center justify-between gap-2">

            <SectionTitle>
              Kunjungan Bulan Ini
            </SectionTitle>

            <span className="whitespace-nowrap text-[12px] font-medium text-[#29232A]">
              Target: 40 Kunjungan
            </span>

          </div>

          <div className="mt-4 grid grid-cols-[0.9fr_1.1fr] items-center gap-3">

            {/* TOTAL */}

            <div className="border-r border-[#EEEEEE] pr-3">

              <p className="text-[48px] font-extrabold leading-none tracking-tight text-[#111111]">
                32
              </p>

              <p className="mt-1 text-[15px] text-[#29232A]">
                Total Kunjungan
              </p>

            </div>

            {/* GROWTH */}

            <div className="relative flex min-w-0 items-center justify-between gap-1">

              <div className="min-w-0">

                <span className="inline-flex items-center gap-1 rounded-full bg-[#DDF9E5] px-3 py-1 text-[15px] font-bold text-[#168B3E]">
                  <TrendingUp size={17} />
                  +14%
                </span>

                <p className="mt-2 text-[12px] leading-snug text-[#29232A]">
                  Dibanding bulan lalu
                  <br />
                  (28 kunjungan)
                </p>

              </div>

              <div className="hidden h-[95px] w-[100px] items-center justify-center rounded-2xl bg-[#FFF2F4] sm:flex">
                <ClipboardCheck
                  size={65}
                  strokeWidth={1.5}
                  className="text-[#BF0B2C]"
                />
              </div>

            </div>

          </div>

          {/* PROGRESS */}

          <div className="mt-5">

            <div className="mb-2 flex items-center justify-between">

              <p className="text-[14px] font-bold text-[#29232A]">
                Pencapaian Target
              </p>

              <p className="text-[14px] font-extrabold text-[#111111]">
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

        <section className="rounded-[23px] border border-[#EEEEEE] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">

          <SectionTitle>
            Aksi Cepat
          </SectionTitle>

          <div className="mt-4 grid grid-cols-4 gap-2">

            <Link
              href="/visits"
              className="flex min-w-0 flex-col items-center justify-center gap-2 rounded-[17px] bg-[#FCECEF] px-1 py-3 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#BF0B2C] text-white">
                <Plus size={29} />
              </span>

              <span className="text-[12px] font-medium leading-tight text-[#171717]">
                Buat
                <br />
                Kunjungan
              </span>
            </Link>

            <Link
              href="/equipment"
              className="flex min-w-0 flex-col items-center justify-center gap-2 rounded-[17px] bg-[#FCECEF] px-1 py-3 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#BF0B2C] text-white">
                <Printer size={25} />
              </span>

              <span className="text-[12px] font-medium leading-tight text-[#171717]">
                Tambah
                <br />
                Mesin
              </span>
            </Link>

            <Link
              href="/reports"
              className="flex min-w-0 flex-col items-center justify-center gap-2 rounded-[17px] bg-[#FCECEF] px-1 py-3 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#BF0B2C] text-white">
                <ChartNoAxesColumn size={25} />
              </span>

              <span className="text-[12px] font-medium leading-tight text-[#171717]">
                Lihat
                <br />
                Laporan
              </span>
            </Link>

            <Link
              href="/reports/export"
              className="flex min-w-0 flex-col items-center justify-center gap-2 rounded-[17px] bg-[#FCECEF] px-1 py-3 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#BF0B2C] text-white">
                <Download size={25} />
              </span>

              <span className="text-[12px] font-medium leading-tight text-[#171717]">
                Ekspor
                <br />
                PDF
              </span>
            </Link>

          </div>

        </section>

        {/* =================================================
            MESIN PERLU PERHATIAN
        ================================================= */}

        <Link
          href="/monitoring"
          className="flex items-center gap-3 rounded-[21px] border border-[#F7E4DE] bg-[#FFF2EE] p-4"
        >

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FFE6D8] text-[#F28C0F]">
            <AlertTriangle size={34} strokeWidth={1.8} />
          </div>

          <div className="min-w-0 flex-1">

            <p className="text-[16px] font-extrabold text-[#171717]">
              Mesin Perlu Perhatian
            </p>

            <p className="mt-1 text-[12px] leading-snug text-[#51474E]">
              4 mesin belum dikunjungi pada Oktober 2025 dan memerlukan tindak lanjut.
            </p>

          </div>

          <ChevronRight
            size={27}
            className="shrink-0 text-[#BF0B2C]"
          />

        </Link>

        {/* =================================================
            AKTIVITAS TERBARU
        ================================================= */}

        <section className="rounded-[23px] border border-[#EEEEEE] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">

          <div className="flex items-center justify-between gap-2">

            <SectionTitle>
              Aktivitas Terbaru
            </SectionTitle>

            <Link
              href="/visit-history"
              className="flex items-center gap-1 whitespace-nowrap text-[13px] font-bold text-[#BF0B2C]"
            >
              Lihat Semua
              <ChevronRight size={17} />
            </Link>

          </div>

          <div className="mt-3 divide-y divide-[#EEEEEE]">

            {recentActivities.map((activity, index) => (
              <div
                key={`${activity.machine}-${index}`}
                className="flex items-center gap-3 py-3"
              >

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                    activity.status === "success"
                      ? "bg-[#DDF8E7] text-[#249653]"
                      : "bg-[#FCE7E8] text-[#D83B45]"
                  }`}
                >

                  {activity.status === "success" ? (
                    <CheckCircle2 size={27} strokeWidth={2} />
                  ) : (
                    <Clock3 size={27} strokeWidth={2} />
                  )}

                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-[14px] font-bold text-[#171717]">
                    {activity.title}
                  </p>

                  <p className="mt-1 truncate text-[12px] text-[#817780]">
                    {activity.machine} · {activity.customer}
                  </p>

                </div>

                <span className="whitespace-nowrap text-[11px] text-[#817780]">
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
