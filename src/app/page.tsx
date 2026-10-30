"use client";

import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Monitor,
  Plus,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";

import {
  Area,
  AreaChart,
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
   DASHBOARD PREVIEW DATA
   Data berikut masih dummy dan belum berasal dari Firebase.
========================================================= */

const monthlyVisitData = [
  { month: "Jan", visits: 82 },
  { month: "Feb", visits: 96 },
  { month: "Mar", visits: 88 },
  { month: "Apr", visits: 112 },
  { month: "Mei", visits: 105 },
  { month: "Jun", visits: 124 },
  { month: "Jul", visits: 118 },
  { month: "Agu", visits: 139 },
  { month: "Sep", visits: 128 },
  { month: "Okt", visits: 186 },
];

const monitoringData = [
  { name: "Sudah Dikunjungi", value: 68, color: "#7C0041" },
  { name: "Belum Dikunjungi", value: 24, color: "#E8A1BC" },
  { name: "Tidak Aktif", value: 8, color: "#D9D2D6" },
];

const recentActivities = [
  {
    equipment: "MFP-2024-001",
    customer: "PT Sinar Abadi",
    model: "ApeosPort C3570",
    technician: "Irwan Fuzi",
    type: "Preventive Maintenance",
    time: "09:42",
    status: "Selesai",
  },
  {
    equipment: "MFP-2024-018",
    customer: "CV Mitra Sejahtera",
    model: "ApeosPort C3060",
    technician: "Andi Pratama",
    type: "Unscheduled Maintenance",
    time: "09:15",
    status: "Selesai",
  },
  {
    equipment: "MFP-2023-042",
    customer: "PT Cipta Mandiri",
    model: "DocuCentre SC2022",
    technician: "Budi Santoso",
    type: "Preventive Maintenance",
    time: "08:50",
    status: "Selesai",
  },
  {
    equipment: "MFP-2024-027",
    customer: "PT Karya Utama",
    model: "ApeosPort C3570",
    technician: "Rizky Ramadhan",
    type: "Instalasi Driver",
    time: "08:25",
    status: "Selesai",
  },
];

/* =========================================================
   FLAT ILLUSTRATION
========================================================= */

function DashboardIllustration() {
  return (
    <svg
      viewBox="0 0 360 230"
      className="h-auto w-full max-w-[310px]"
      role="img"
      aria-label="Ilustrasi teknisi sedang melakukan pemeriksaan mesin"
    >
      <ellipse
        cx="180"
        cy="207"
        rx="145"
        ry="12"
        fill="#EADDE3"
      />

      <circle cx="276" cy="53" r="31" fill="#F8E7EE" />
      <circle cx="70" cy="63" r="18" fill="#FFF0D1" />

      <path
        d="M43 177C57 148 83 136 109 142C135 148 142 174 155 194H43V177Z"
        fill="#F8E7EE"
      />

      {/* Mesin */}
      <rect
        x="142"
        y="76"
        width="142"
        height="113"
        rx="12"
        fill="#7C0041"
      />

      <rect
        x="154"
        y="88"
        width="118"
        height="42"
        rx="7"
        fill="#FFF8F5"
      />

      <rect
        x="167"
        y="98"
        width="72"
        height="5"
        rx="2.5"
        fill="#D9C8D0"
      />

      <rect
        x="167"
        y="109"
        width="48"
        height="5"
        rx="2.5"
        fill="#D9C8D0"
      />

      <rect
        x="246"
        y="98"
        width="14"
        height="14"
        rx="4"
        fill="#FFC107"
      />

      <rect
        x="157"
        y="139"
        width="112"
        height="36"
        rx="5"
        fill="#C2185B"
      />

      <rect
        x="173"
        y="147"
        width="80"
        height="4"
        rx="2"
        fill="#F8E7EE"
      />

      <rect
        x="173"
        y="157"
        width="80"
        height="4"
        rx="2"
        fill="#F8E7EE"
      />

      <rect
        x="165"
        y="181"
        width="96"
        height="8"
        rx="3"
        fill="#4E0029"
      />

      {/* Kertas */}
      <path
        d="M177 55H245L258 75H190L177 55Z"
        fill="#FFFFFF"
        stroke="#E7D9E0"
        strokeWidth="2"
      />

      {/* Teknisi */}
      <circle cx="90" cy="91" r="18" fill="#D99B78" />

      <path
        d="M73 87C73 68 106 66 108 88C99 80 84 81 73 87Z"
        fill="#29232A"
      />

      <path
        d="M66 123C72 110 83 106 96 108C112 110 121 126 124 148L119 187H57L60 146C61 136 62 129 66 123Z"
        fill="#C2185B"
      />

      <path
        d="M72 120L98 120L105 151L82 157L68 143L72 120Z"
        fill="#7C0041"
      />

      <path
        d="M99 123L125 143L153 117"
        stroke="#D99B78"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M153 117L169 108"
        stroke="#D99B78"
        strokeWidth="9"
        strokeLinecap="round"
      />

      <path
        d="M80 187L77 202"
        stroke="#29232A"
        strokeWidth="11"
        strokeLinecap="round"
      />

      <path
        d="M107 187L111 202"
        stroke="#29232A"
        strokeWidth="11"
        strokeLinecap="round"
      />

      <path
        d="M67 204H84"
        stroke="#29232A"
        strokeWidth="8"
        strokeLinecap="round"
      />

      <path
        d="M103 204H121"
        stroke="#29232A"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Checklist */}
      <rect
        x="281"
        y="111"
        width="42"
        height="52"
        rx="7"
        fill="#FFF8F5"
        stroke="#E8DCE2"
        strokeWidth="2"
      />

      <path
        d="M291 125L295 129L302 121"
        stroke="#23966B"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M291 140H312"
        stroke="#D9C8D0"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M291 150H307"
        stroke="#D9C8D0"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   KPI COMPONENT
========================================================= */

function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendDirection,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: string;
  trendDirection?: "up" | "down";
}) {
  return (
    <div className="rounded-xl border border-[#EEE7EB] bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#817780]">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#29232A] sm:text-[28px]">
            {value}
          </h3>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8E7EE] text-[#7C0041]">
          <Icon size={20} strokeWidth={1.8} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {trend && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold ${
              trendDirection === "down"
                ? "text-[#DC4C55]"
                : "text-[#23966B]"
            }`}
          >
            {trendDirection === "down" ? (
              <ArrowDownRight size={14} />
            ) : (
              <ArrowUpRight size={14} />
            )}
            {trend}
          </span>
        )}

        <span className="text-xs text-[#817780]">
          {description}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD PAGE
========================================================= */

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#FFF8F5] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">

        {/* HEADER */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#7C0041]">
              Monitoring Operasional
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#29232A] sm:text-[28px]">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-[#817780]">
              Ringkasan aktivitas dan monitoring kunjungan mesin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#EEE7EB] bg-white px-3 text-sm font-medium text-[#51474E]"
            >
              <CalendarDays size={16} />
              Oktober 2026
              <ChevronDown size={15} />
            </button>

            <Link
              href="/visits"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#7C0041] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#620033]"
            >
              <Plus size={17} />
              Catat Kunjungan
            </Link>
          </div>
        </section>

        {/* PREVIEW NOTICE */}
        <div className="flex items-start gap-3 rounded-lg border border-[#F0D9A8] bg-[#FFF9EA] px-4 py-3">
          <Activity
            size={18}
            className="mt-0.5 shrink-0 text-[#B77B13]"
          />

          <div>
            <p className="text-sm font-semibold text-[#765319]">
              Mode Pratinjau
            </p>

            <p className="mt-0.5 text-xs leading-relaxed text-[#8B713F]">
              Informasi pada dashboard ini masih menggunakan data
              ilustrasi. Data aktual akan ditampilkan setelah integrasi
              Firebase selesai.
            </p>
          </div>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-2xl border border-[#EEE1E7] bg-white">
          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[#F8E7EE] opacity-70" />

          <div className="absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-[#FFF0D1] opacity-60" />

          <div className="relative grid items-center gap-5 px-5 py-6 sm:px-8 sm:py-7 lg:grid-cols-[1fr_310px]">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#F8E7EE] px-3 py-1 text-xs font-semibold text-[#7C0041]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7C0041]" />
                Operational Overview
              </span>

              <h2 className="mt-4 text-xl font-semibold leading-snug tracking-tight text-[#29232A] sm:text-2xl">
                Pantau setiap kunjungan.
                <br />
                <span className="text-[#7C0041]">
                  Pastikan setiap mesin terlayani.
                </span>
              </h2>

              <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#817780]">
                Kelola aktivitas kunjungan teknisi dan pantau status
                layanan mesin pelanggan dalam satu tempat.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/monitoring"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#7C0041] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#620033]"
                >
                  Buka Monitoring
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/visit-history"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#EEE7EB] bg-white px-4 text-sm font-medium text-[#51474E] transition-colors hover:bg-[#FFF8F5]"
                >
                  Riwayat Kunjungan
                </Link>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <DashboardIllustration />
            </div>
          </div>
        </section>

        {/* KPI */}
        <section>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[#29232A]">
              Ringkasan Operasional
            </h2>

            <p className="mt-1 text-xs text-[#817780]">
              Rekapitulasi data periode Oktober 2026.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Total Equipment"
              value="100"
              description="Total mesin aktif"
              icon={Monitor}
              trend="8.2%"
              trendDirection="up"
            />

            <KpiCard
              title="Sudah Dikunjungi"
              value="68"
              description="Mesin telah dikunjungi"
              icon={CheckCircle2}
              trend="68% dari total"
              trendDirection="up"
            />

            <KpiCard
              title="Belum Dikunjungi"
              value="24"
              description="Menunggu kunjungan"
              icon={Clock3}
              trend="24% dari total"
              trendDirection="down"
            />

            <KpiCard
              title="Total Kunjungan"
              value="186"
              description="Aktivitas kunjungan"
              icon={Wrench}
              trend="12.5%"
              trendDirection="up"
            />
          </div>
        </section>

        {/* CHARTS */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.65fr_1fr]">

          {/* VISIT TREND */}
          <div className="rounded-xl border border-[#EEE7EB] bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[#29232A]">
                  Tren Kunjungan
                </h2>

                <p className="mt-1 text-xs text-[#817780]">
                  Jumlah kunjungan mesin setiap bulan.
                </p>
              </div>

              <span className="rounded-md bg-[#F8E7EE] px-2.5 py-1 text-xs font-semibold text-[#7C0041]">
                Tahun 2026
              </span>
            </div>

            <div className="mt-6 h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyVisitData}
                  margin={{
                    top: 10,
                    right: 8,
                    left: -20,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="visitGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#7C0041"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor="#7C0041"
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#F0E9ED"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#817780",
                      fontSize: 11,
                    }}
                    dy={10}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#817780",
                      fontSize: 11,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      border: "1px solid #EEE7EB",
                      borderRadius: "10px",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [
                      `${value} kunjungan`,
                      "Total",
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="visits"
                    stroke="#7C0041"
                    strokeWidth={2.5}
                    fill="url(#visitGradient)"
                    activeDot={{
                      r: 5,
                      fill: "#7C0041",
                      stroke: "#FFFFFF",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MONITORING STATUS */}
          <div className="rounded-xl border border-[#EEE7EB] bg-white p-4 sm:p-5">
            <div>
              <h2 className="text-base font-semibold text-[#29232A]">
                Status Monitoring
              </h2>

              <p className="mt-1 text-xs text-[#817780]">
                Distribusi status kunjungan mesin.
              </p>
            </div>

            <div className="relative mt-3 h-[210px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={monitoringData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={84}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {monitoringData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => [`${value}%`, "Persentase"]}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold text-[#29232A]">
                  68%
                </span>

                <span className="mt-1 text-xs text-[#817780]">
                  Terkunjungi
                </span>
              </div>
            </div>

            <div className="space-y-3 border-t border-[#F0E9ED] pt-4">
              {monitoringData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />

                    <span className="text-xs text-[#625861]">
                      {item.name}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-[#29232A]">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MONITORING INSIGHT */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-[1.3fr_1fr]">

          <div className="rounded-xl border border-[#EAD5DF] bg-[#FDF5F8] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8E7EE] text-[#7C0041]">
                <TrendingUp size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-[#29232A]">
                  Monitoring Insight
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-[#817780]">
                  Sebanyak 24 mesin belum mendapatkan kunjungan pada
                  periode ini. Prioritaskan pemeriksaan pada mesin
                  yang belum dikunjungi.
                </p>

                <Link
                  href="/monitoring"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#7C0041] hover:underline"
                >
                  Lihat daftar monitoring
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#EEE7EB] bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F5EF] text-[#23966B]">
                <CheckCircle2 size={20} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#29232A]">
                  Tingkat Penyelesaian
                </h3>

                <p className="mt-1 text-xs text-[#817780]">
                  Periode Oktober 2026
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between">
              <span className="text-3xl font-semibold text-[#29232A]">
                68%
              </span>

              <span className="text-xs font-medium text-[#23966B]">
                68 dari 100 mesin
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F0E9ED]">
              <div
                className="h-full rounded-full bg-[#7C0041]"
                style={{ width: "68%" }}
              />
            </div>
          </div>
        </section>

        {/* RECENT ACTIVITIES */}
        <section className="overflow-hidden rounded-xl border border-[#EEE7EB] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0E9ED] px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-base font-semibold text-[#29232A]">
                Aktivitas Kunjungan Terbaru
              </h2>

              <p className="mt-1 text-xs text-[#817780]">
                Ringkasan aktivitas kunjungan teknisi.
              </p>
            </div>

            <Link
              href="/visit-history"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C0041] hover:underline"
            >
              Lihat semua
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="bg-[#FCFAFB]">
                  {[
                    "Equipment",
                    "Pelanggan",
                    "Teknisi",
                    "Jenis Kunjungan",
                    "Waktu",
                    "Status",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#817780]"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F3EDF0]">
                {recentActivities.map((activity) => (
                  <tr
                    key={activity.equipment}
                    className="transition-colors hover:bg-[#FFFCFD]"
                  >
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold text-[#29232A]">
                        {activity.equipment}
                      </p>

                      <p className="mt-1 text-[11px] text-[#817780]">
                        {activity.model}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-xs text-[#51474E]">
                      {activity.customer}
                    </td>

                    <td className="px-5 py-4 text-xs text-[#51474E]">
                      {activity.technician}
                    </td>

                    <td className="px-5 py-4 text-xs text-[#51474E]">
                      {activity.type}
                    </td>

                    <td className="px-5 py-4 text-xs text-[#817780]">
                      {activity.time}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E8F5EF] px-2 py-1 text-[11px] font-semibold text-[#23966B]">
                        <CheckCircle2 size={12} />
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[#29232A]">
              Akses Cepat
            </h2>

            <p className="mt-1 text-xs text-[#817780]">
              Akses fitur operasional yang sering digunakan.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link
              href="/visits"
              className="group flex items-center gap-3 rounded-xl border border-[#EEE7EB] bg-white p-4 transition-colors hover:border-[#D9B8C8] hover:bg-[#FFFCFD]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8E7EE] text-[#7C0041]">
                <Plus size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#29232A]">
                  Catat Kunjungan
                </p>

                <p className="mt-1 text-xs text-[#817780]">
                  Input aktivitas service mesin
                </p>
              </div>

              <ArrowRight
                size={16}
                className="text-[#A99EA5] transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/monitoring"
              className="group flex items-center gap-3 rounded-xl border border-[#EEE7EB] bg-white p-4 transition-colors hover:border-[#D9B8C8] hover:bg-[#FFFCFD]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF3D8] text-[#A87916]">
                <Monitor size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#29232A]">
                  Monitoring Mesin
                </p>

                <p className="mt-1 text-xs text-[#817780]">
                  Pantau status kunjungan
                </p>
              </div>

              <ArrowRight
                size={16}
                className="text-[#A99EA5] transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/reports"
              className="group flex items-center gap-3 rounded-xl border border-[#EEE7EB] bg-white p-4 transition-colors hover:border-[#D9B8C8] hover:bg-[#FFFCFD]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF2F8] text-[#4285B8]">
                <FileText size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#29232A]">
                  Laporan
                </p>

                <p className="mt-1 text-xs text-[#817780]">
                  Lihat rekapitulasi kunjungan
                </p>
              </div>

              <ArrowRight
                size={16}
                className="text-[#A99EA5] transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[#EEE7EB] pt-4 text-center text-[11px] text-[#A0969D]">
          MOKU — Monitoring Operasional Kunjungan Unit
          <span className="mx-2">·</span>
          Track Precisely, Deliver Quality
        </footer>
      </div>
    </main>
  );
}
