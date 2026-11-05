"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  EllipsisVertical,
  Filter,
  Monitor,
  Plus,
  Printer,
  Search,
  Users,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* =========================================================
   DASHBOARD DATA
   Data ilustrasi sementara.
========================================================= */

const monthlyVisitData = [
  { day: "Sen", visits: 12, target: 10 },
  { day: "Sel", visits: 14, target: 12 },
  { day: "Rab", visits: 12, target: 10 },
  { day: "Kam", visits: 17, target: 15 },
  { day: "Jum", visits: 10, target: 9 },
  { day: "Sab", visits: 12, target: 10 },
  { day: "Min", visits: 18, target: 16 },
];

const monitoringData = [
  { name: "Sudah Dikunjungi", value: 68, color: "#80002F" },
  { name: "Belum Dikunjungi", value: 24, color: "#D2D2D8" },
  { name: "Perlu Perhatian", value: 8, color: "#F2A900" },
];

const machineData = [
  {
    code: "MK-001",
    model: "Photocopy A3",
    customer: "PT. Sinar Mandiri",
    status: "Sudah Dikunjungi",
    lastVisit: "12 Okt 2026",
  },
  {
    code: "MK-002",
    model: "Printer Laser",
    customer: "CV. Multi Jaya",
    status: "Belum Dikunjungi",
    lastVisit: "-",
  },
  {
    code: "MK-003",
    model: "Photocopy A4",
    customer: "PT. Prima Solusi",
    status: "Perlu Perhatian",
    lastVisit: "5 Okt 2026",
  },
  {
    code: "MK-004",
    model: "Scanner",
    customer: "PT. Citra Jaya",
    status: "Sudah Dikunjungi",
    lastVisit: "10 Okt 2026",
  },
];

/* =========================================================
   KPI CARD
========================================================= */

function KpiCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-[#E9E6E9] bg-white p-5 shadow-[0_2px_8px_rgba(35,20,28,0.045)]">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#80002F] text-white">
          <Icon size={27} strokeWidth={1.9} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#4B4148]">
            {title}
          </p>

          <p className="mt-1 text-[34px] font-bold leading-none tracking-tight text-[#17141A]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }: { status: string }) {
  const styles = {
    "Sudah Dikunjungi":
      "bg-[#F8E7EB] text-[#790024]",
    "Belum Dikunjungi":
      "bg-[#F0F0F2] text-[#45434A]",
    "Perlu Perhatian":
      "bg-[#FFF2D9] text-[#805500]",
  };

  const icons = {
    "Sudah Dikunjungi": Check,
    "Belum Dikunjungi": Clock3,
    "Perlu Perhatian": AlertTriangle,
  };

  const Icon =
    icons[status as keyof typeof icons] || Clock3;

  return (
    <span
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
        styles[status as keyof typeof styles] ||
        "bg-gray-100 text-gray-600"
      }`}
    >
      <Icon size={15} strokeWidth={2.2} />
      {status}
    </span>
  );
}

/* =========================================================
   DASHBOARD PAGE
========================================================= */

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#FBFAFB] px-5 py-7 lg:px-7 lg:py-8">

      <div className="mx-auto w-full max-w-[1800px] space-y-6">

        {/* HEADER */}

        <section className="flex flex-wrap items-center justify-between gap-5">

          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-[#760020]">
              Dashboard
            </h1>

            <p className="mt-1 text-[15px] text-[#55505A]">
              Ringkasan aktivitas dan monitoring kunjungan mesin.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-12 items-center gap-3 rounded-xl border border-[#E5E1E5] bg-white px-4 text-sm font-semibold text-[#29232A] shadow-[0_2px_7px_rgba(35,20,28,0.06)] transition-colors hover:border-[#BFA5B0]"
          >
            <CalendarDays
              size={19}
              className="text-[#80002F]"
            />

            Oktober 2026

            <ChevronDown size={17} />
          </button>

        </section>

        {/* KPI */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <KpiCard
            title="Total Mesin"
            value="100"
            icon={Printer}
          />

          <KpiCard
            title="Sudah Dikunjungi"
            value="68"
            icon={Check}
          />

          <KpiCard
            title="Belum Dikunjungi"
            value="24"
            icon={Clock3}
          />

          <KpiCard
            title="Perlu Perhatian"
            value="8"
            icon={AlertTriangle}
          />

        </section>

        {/* CHARTS */}

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">

          {/* MONITORING CHART */}

          <div className="rounded-xl border border-[#E9E6E9] bg-white p-5 shadow-[0_2px_8px_rgba(35,20,28,0.045)]">

            <h2 className="text-[19px] font-bold tracking-tight text-[#211C23]">
              Status Monitoring Mesin
            </h2>

            <div className="mt-4 grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_1fr]">

              <div className="relative h-[220px] min-w-0">

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={monitoringData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={64}
                      outerRadius={94}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {monitoringData.map((item) => (
                        <Cell
                          key={item.name}
                          fill={item.color}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => [
                        `${value}%`,
                        "Total mesin",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[36px] font-bold leading-none text-[#17141A]">
                    100
                  </span>

                  <span className="mt-1 text-xs text-[#77717A]">
                    Total Mesin
                  </span>
                </div>

              </div>

              <div className="space-y-5">

                {monitoringData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">

                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded-[4px]"
                        style={{
                          backgroundColor: item.color,
                        }}
                      />

                      <span className="text-sm font-medium text-[#39343B]">
                        {item.name}
                      </span>

                    </div>

                    <span className="text-base font-bold text-[#211C23]">
                      {item.value}
                    </span>
                  </div>
                ))}

              </div>

            </div>
          </div>

          {/* MONTHLY VISIT CHART */}

          <div className="rounded-xl border border-[#E9E6E9] bg-white p-5 shadow-[0_2px_8px_rgba(35,20,28,0.045)]">

            <div className="flex flex-wrap items-center justify-between gap-3">

              <div>
                <h2 className="text-[19px] font-bold tracking-tight text-[#211C23]">
                  Kunjungan Bulan Ini
                </h2>

                <p className="mt-1 text-xs text-[#77717A]">
                  Perbandingan kunjungan dengan target.
                </p>
              </div>

              <div className="flex items-center gap-4">

                <span className="flex items-center gap-2 text-xs font-medium text-[#514B53]">
                  <span className="h-3 w-3 rounded-[3px] bg-[#80002F]" />
                  Kunjungan
                </span>

                <span className="flex items-center gap-2 text-xs font-medium text-[#514B53]">
                  <span className="h-3 w-3 rounded-[3px] bg-[#D2D2D8]" />
                  Target
                </span>

              </div>

            </div>

            <div className="mt-5 h-[205px] w-full">

              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyVisitData}
                  barGap={5}
                  margin={{
                    top: 5,
                    right: 5,
                    left: -18,
                    bottom: 0,
                  }}
                >

                  <CartesianGrid
                    stroke="#ECEAEC"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#514B53",
                      fontSize: 12,
                    }}
                    dy={9}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#77717A",
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      border: "1px solid #E9E6E9",
                      borderRadius: "10px",
                      fontSize: "12px",
                    }}
                  />

                  <Bar
                    dataKey="visits"
                    name="Kunjungan"
                    fill="#80002F"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={22}
                  />

                  <Bar
                    dataKey="target"
                    name="Target"
                    fill="#D2D2D8"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={22}
                  />

                </BarChart>
              </ResponsiveContainer>

            </div>
          </div>

        </section>

        {/* MACHINE LIST */}

        <section className="overflow-hidden rounded-xl border border-[#E9E6E9] bg-white shadow-[0_2px_8px_rgba(35,20,28,0.045)]">

          {/* TABLE HEADER */}

          <div className="flex flex-wrap items-center justify-between gap-4 px-5 pb-4 pt-5">

            <div>
              <h2 className="text-[20px] font-bold tracking-tight text-[#211C23]">
                Daftar Mesin
              </h2>

              <p className="mt-1 text-xs text-[#77717A]">
                Ringkasan status monitoring mesin pelanggan.
              </p>
            </div>

            <Link
              href="/data-mesin"
              className="text-sm font-semibold text-[#80002F] hover:underline"
            >
              Lihat semua
            </Link>

          </div>

          {/* FILTERS */}

          <div className="flex flex-wrap items-center gap-3 px-5 pb-4">

            <div className="relative min-w-[240px] flex-1">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77717A]"
              />

              <input
                type="text"
                placeholder="Cari nama mesin, pelanggan, atau lokasi..."
                className="h-10 w-full rounded-lg border border-[#E5E1E5] bg-white pl-10 pr-3 text-sm text-[#29232A] outline-none transition-colors placeholder:text-[#99919A] focus:border-[#80002F]"
              />

            </div>

            <button
              type="button"
              className="inline-flex h-10 min-w-[155px] items-center justify-between gap-3 rounded-lg border border-[#E5E1E5] bg-white px-3 text-sm font-medium text-[#39343B] hover:border-[#BFA5B0]"
            >
              <span className="flex items-center gap-2">
                <Filter size={16} />
                Semua Status
              </span>

              <ChevronDown size={16} />
            </button>

            <button
              type="button"
              className="inline-flex h-10 min-w-[170px] items-center justify-between gap-3 rounded-lg border border-[#E5E1E5] bg-white px-3 text-sm font-medium text-[#39343B] hover:border-[#BFA5B0]"
            >
              <span className="flex items-center gap-2">
                <Users size={16} />
                Semua Pelanggan
              </span>

              <ChevronDown size={16} />
            </button>

            <Link
              href="/data-mesin"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#80002F] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#650025]"
            >
              <Plus size={18} />
              Tambah
            </Link>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto px-5">

            <table className="w-full min-w-[950px] border-collapse text-left">

              <thead>
                <tr className="bg-[#F2F1F3]">

                  {[
                    "No.",
                    "Kode Mesin",
                    "Nama Mesin",
                    "Pelanggan",
                    "Status Monitoring",
                    "Kunjungan Terakhir",
                    "Aksi",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-4 py-3 text-xs font-bold text-[#29232A]"
                    >
                      {heading}
                    </th>
                  ))}

                </tr>
              </thead>

              <tbody>

                {machineData.map((machine, index) => (
                  <tr
                    key={machine.code}
                    className="border-b border-[#ECEAEC] transition-colors hover:bg-[#FCFAFB]"
                  >

                    <td className="whitespace-nowrap px-4 py-3 text-sm text-[#39343B]">
                      {index + 1}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-[#29232A]">
                      {machine.code}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm text-[#39343B]">
                      {machine.model}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm text-[#39343B]">
                      {machine.customer}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={machine.status} />
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm text-[#514B53]">
                      {machine.lastVisit}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        aria-label={`Aksi ${machine.code}`}
                        className="rounded-md p-1.5 text-[#514B53] transition-colors hover:bg-[#F2F1F3]"
                      >
                        <EllipsisVertical size={19} />
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          {/* TABLE FOOTER */}

          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">

            <p className="text-xs text-[#77717A]">
              Menampilkan 1–4 dari 100 mesin
            </p>

            <Link
              href="/data-mesin"
              className="text-xs font-semibold text-[#80002F] hover:underline"
            >
              Lihat seluruh data mesin →
            </Link>

          </div>

        </section>

        {/* FOOTER */}

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E9E6E9] pt-5">

          <p className="text-xs text-[#77717A]">
            © 2026 MOKU. All rights reserved.
          </p>

          <p className="text-sm font-medium italic text-[#514B53]">
            <span className="mr-2 inline-block h-4 w-1 rounded-full bg-[#80002F] align-middle" />
            Track Precisely, Deliver Quality.
          </p>

        </footer>

      </div>
    </main>
  );
}
