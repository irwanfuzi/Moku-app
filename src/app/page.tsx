"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Download,
  FileBarChart,
  Monitor,
  Plus,
  Printer,
  X,
} from "lucide-react";

import { useAppLayout } from "@/components/layout/app-shell";

/* =========================================================
   DASHBOARD PREVIEW DATA
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
  children: React.ReactNode;
}) {
  return (
    <h2 className="text-[17px] font-bold tracking-tight text-[#29232A]">
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
          MOBILE HEADER
          MOBILE WEB & PWA ONLY
      =================================================== */}

      {showMobileHeader && (
        <header className="relative overflow-visible bg-[#730217] px-5 pb-7 pt-[max(18px,env(safe-area-inset-top))] text-white">

          {/* BACKGROUND DECORATION */}

          <div className="pointer-events-none absolute -right-16 top-28 h-48 w-48 rounded-full bg-[#BF0B2C]/40" />

          <div className="pointer-events-none absolute -left-20 top-52 h-48 w-72 rounded-full bg-[#BF0B2C]/30" />

          <div className="pointer-events-none absolute -right-10 bottom-0 h-32 w-64 rounded-full bg-[#BF0B2C]/30" />

          <div className="relative z-10">

            {/* BRAND HEADER */}

            <div className="flex items-center justify-between">

              <Link
                href="/"
                aria-label="MOKU Dashboard"
                className="flex items-center"
              >
                <div className="flex items-center gap-1">

                  <span className="text-[35px] font-extrabold tracking-[-2px] text-white">
                    M
                  </span>

                  <span className="relative flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[#F28C0F] bg-[#BF0B2C]">
                    <span className="text-[17px] font-extrabold text-white">
                      M
                    </span>

                    <span className="absolute bottom-1 h-3 w-5 rounded-full bg-[#360107]" />

                    <span className="absolute bottom-[9px] h-1 w-2 rounded-full bg-white" />
                  </span>

                  <span className="text-[35px] font-extrabold tracking-[-2px] text-white">
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
                  <Bell size={25} strokeWidth={1.8} />

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
                        size={19}
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

              <p className="text-[25px] font-bold leading-tight tracking-tight">
                Halo, Pengguna
              </p>

              <p className="mt-2 text-[14px] leading-relaxed text-white/85">
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
                className="flex h-12 min-w-[220px] items-center gap-3 rounded-full bg-white px-4 text-[#171717]"
              >

                <CalendarDays
                  size={21}
                  strokeWidth={2.2}
                />

                <span className="flex-1 text-left text-[15px] font-bold">
                  {selectedMonth}
                </span>

                <ChevronDown size={19} />

              </button>

              {showMonthPicker && (
                <div className="absolute left-0 top-[54px] z-50 w-[240px] overflow-hidden rounded-xl border border-[#EEE7EB] bg-white py-2 text-[#29232A] shadow-lg">

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

            {/* HEADER ILLUSTRATION */}

            <div className="pointer-events-none absolute bottom-[-2px] right-0 hidden opacity-90 sm:block">

              <Printer
                size={112}
                strokeWidth={1.2}
                className="text-white/75"
              />

            </div>

          </div>
        </header>
      )}

      {/* ===================================================
          DASHBOARD CONTENT
      =================================================== */}

      <div
        className={`relative z-10 space-y-3 px-4 ${
          showMobileHeader ? "-mt-1" : "pt-4"
        }`}
      >

        {/* =================================================
            STATUS MONITORING MESIN
        ================================================= */}

        <section className="rounded-[22px] border border-[#EEEEEE] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">

          <SectionTitle>
            Status Monitoring Mesin
          </SectionTitle>

          <div className="mt-3 grid grid-cols-[0.85fr_1.15fr] items-center gap-3 rounded-[17px] border border-[#F0F0F0] px-3 py-4">

            {/* DONUT */}

            <div className="flex justify-center border-r border-[#EEEEEE] pr-2">

              <div
                className="relative flex h-[150px] w-[150px] items-center justify-center rounded-full"
                style={{
                  background:
                    "conic-gradient(#BF0B2C 0deg 237deg, #D9D9D9 237deg 327deg, #F28C0F 327deg 360deg)",
                }}
              >

                <div className="flex h-[104px] w-[104px] flex-col items-center justify-center rounded-full bg-white">

                  <span className="text-[37px] font-extrabold leading-none text-[#111111]">
                    48
                  </span>

                  <span className="mt-1 text-[14px] text-[#29232A]">
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

        <section className="rounded-[22px] border border-[#EEEEEE] bg-white p-4 shadow-[0_2
