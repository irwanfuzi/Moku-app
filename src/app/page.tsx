"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  FileText,
  Gauge,
  Monitor,
  Plus,
  RefreshCw,
  Search,
  Settings2,
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
   TYPES
========================================================= */

type VisitActivity = {
  id: string;
  equipmentNumber: string;
  machineModel: string;
  customerName: string;
  recordedBy: string;
  visitType: string;
  visitDate: string;
  status: "Selesai";
};

/* =========================================================
   DASHBOARD PREVIEW DATA
   Temporary presentation data.
   Will be replaced with Firestore data integration.
========================================================= */

const monthlyVisitData = [
  { month: "Jan", visits: 42 },
  { month: "Feb", visits: 56 },
  { month: "Mar", visits: 48 },
  { month: "Apr", visits: 72 },
  { month: "Mei", visits: 65 },
  { month: "Jun", visits: 88 },
  { month: "Jul", visits: 76 },
  { month: "Agu", visits: 95 },
  { month: "Sep", visits: 83 },
  { month: "Okt", visits: 108 },
  { month: "Nov", visits: 92 },
  { month: "Des", visits: 115 },
];

const monitoringData = [
  {
    name: "Visited",
    value: 68,
    color: "#23966B",
  },
  {
    name: "Not Visited",
    value: 24,
    color: "#E5A12B",
  },
  {
    name: "Inactive",
    value: 8,
    color: "#A49AA1",
  },
];

const recentActivities: VisitActivity[] = [
  {
    id: "VST-2026-001",
    equipmentNumber: "AG-00125",
    machineModel: "Canon imageRUNNER ADVANCE",
    customerName: "PT Maju Bersama",
    recordedBy: "Andi Pratama",
    visitType: "PMC",
    visitDate: "30 Okt 2026",
    status: "Selesai",
  },
  {
    id: "VST-2026-002",
    equipmentNumber: "AG-00128",
    machineModel: "Canon imageRUNNER DX",
    customerName: "PT Sinar Abadi",
    recordedBy: "Budi Santoso",
    visitType: "UMC",
    visitDate: "30 Okt 2026",
    status: "Selesai",
  },
  {
    id: "VST-2026-003",
    equipmentNumber: "AG-00135",
    machineModel: "Canon imagePRESS",
    customerName: "PT Mitra Sejahtera",
    recordedBy: "Dimas Saputra",
    visitType: "INS",
    visitDate: "29 Okt 2026",
    status: "Selesai",
  },
  {
    id: "VST-2026-004",
    equipmentNumber: "AG-00141",
    machineModel: "Canon imageRUNNER ADVANCE",
    customerName: "PT Cipta Mandiri",
    recordedBy: "Andi Pratama",
    visitType: "PMC",
    visitDate: "29 Okt 2026",
    status: "Selesai",
  },
  {
    id: "VST-2026-005",
    equipmentNumber: "AG-00152",
    machineModel: "Canon imageRUNNER DX",
    customerName: "PT Karya Utama",
    recordedBy: "Rizky Ramadhan",
    visitType: "DIS",
    visitDate: "28 Okt 2026",
    status: "Selesai",
  },
];

/* =========================================================
   FORMAT HELPERS
========================================================= */

const formatNumber = (value: number) =>
  new Intl.NumberFormat("id-ID").format(value);

/* =========================================================
   KPI CARD
========================================================= */

function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  iconBackground,
  trend,
  trendDirection,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBackground: string;
  trend?: string;
  trendDirection?: "up" | "down";
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-[#211A21]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#817780] dark:text-[#B7AAB3]">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-bold tracking-tight text-[#29232A] dark:text-[#F5EDF2]">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBackground}`}
        >
          <Icon size={21} className={iconColor} strokeWidth={2} />
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

        <span className="text-xs text-[#817780] dark:text-[#B7AAB3]">
          {description}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-bold text-[#29232A] dark:text-[#F5EDF2]">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-xs text-[#817780] dark:text-[#B7AAB3]">
            {subtitle}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

/* =========================================================
   CUSTOM CHART TOOLTIP
========================================================= */

function VisitChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-white px-4 py-3 shadow-lg dark:bg-[#211A21]">
      <p className="text-xs text-[#817780]">{label}</p>

      <p className="mt-1 text-sm font-bold text-[#7C0041] dark:text-[#E36A9C]">
        {payload[0].value} kunjungan
      </p>
    </div>
  );
}

/* =========================================================
   DASHBOARD PAGE
========================================================= */

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#F8F6F7] p-4 sm:p-6 lg:p-8 dark:bg-[#171217]">
      <div className="mx-auto max-w-[1600px]">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#23966B]" />

              <span className="text-xs font-semibold uppercase tracking-wider text-[#817780] dark:text-[#B7AAB3]">
                Operational Overview
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#29232A] sm:text-3xl dark:text-[#F5EDF2]">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-[#817780] dark:text-[#B7AAB3]">
              Ringkasan aktivitas monitoring kunjungan unit mesin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#EEE7EB] bg-white px-3 text-sm font-medium text-[#29232A] transition hover:bg-[#F8F6F7] dark:border-[#3A3039] dark:bg-[#211A21] dark:text-[#F5EDF2]"
            >
              <CalendarDays size={16} />

              Oktober 2026

              <ChevronDown size={15} />
            </button>

            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#7C0041] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#650035]"
            >
              <Plus size={17} />

              <span>Catat Kunjungan</span>
            </button>
          </div>
        </div>

        {/* =================================================
            PREVIEW NOTICE
        ================================================= */}

        <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#E8D5DF] bg-[#F8E7EE] px-4 py-3 dark:border-[#493040] dark:bg-[#30212B]">
          <CircleAlert
            size={18}
            className="mt-0.5 shrink-0 text-[#7C0041] dark:text-[#E36A9C]"
          />

          <div>
            <p className="text-xs font-semibold text-[#7C0041] dark:text-[#E36A9C]">
              Mode pratinjau
            </p>

            <p className="mt-0.5 text-xs leading-relaxed text-[#817780] dark:text-[#B7AAB3]">
              Angka dan aktivitas pada Dashboard ini merupakan data ilustrasi
              untuk pengembangan antarmuka. Data operasional sebenarnya akan
              ditampilkan setelah integrasi Firebase.
            </p>
          </div>
        </div>

        {/* =================================================
            KPI CARDS
        ================================================= */}

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <KpiCard
            title="Total Equipment"
            value={formatNumber(100)}
            description="Total unit terdaftar"
            icon={Monitor}
            iconColor="text-[#7C0041]"
            iconBackground="bg-[#F8E7EE] dark:bg-[#482238]"
            trend="+8.2%"
            trendDirection="up"
          />

          <KpiCard
            title="Visited Equipment"
            value={formatNumber(68)}
            description="Unit sudah dikunjungi"
            icon={CheckCircle2}
            iconColor="text-[#23966B]"
            iconBackground="bg-[#E7F5EF] dark:bg-[#203C32]"
            trend="+12.5%"
            trendDirection="up"
          />

          <KpiCard
            title="Not Visited"
            value={formatNumber(24)}
            description="Unit belum dikunjungi"
            icon={Clock3}
            iconColor="text-[#E5A12B]"
            iconBackground="bg-[#FFF4DD] dark:bg-[#493A23]"
            trend="-5.4%"
            trendDirection="down"
          />

          <KpiCard
            title="Total Visits"
            value={formatNumber(186)}
            description="Kunjungan bulan ini"
            icon={Activity}
            iconColor="text-[#4285B8]"
            iconBackground="bg-[#E8F2FA] dark:bg-[#23394A]"
            trend="+18.7%"
            trendDirection="up"
          />

        </div>

        {/* =================================================
            CHARTS SECTION
        ================================================= */}

        <div className="mb-7 grid grid-cols-1 gap-5 xl:grid-cols-3">

          {/* MONTHLY VISIT TREND */}

          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm xl:col-span-2 dark:bg-[#211A21]">
            <SectionHeader
              title="Visit Trend"
              subtitle="Tren jumlah kunjungan selama satu tahun"
              action={
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C0041] dark:text-[#E36A9C]"
                >
                  Detail

                  <ArrowRight size={14} />
                </button>
              }
            />

            <div className="h-[260px] w-full">
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
                        stopOpacity={0.22}
                      />

                      <stop
                        offset="95%"
                        stopColor="#7C0041"
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#EEE7EB"
                  />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fill: "#817780",
                    }}
                    dy={10}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fill: "#817780",
                    }}
                  />

                  <Tooltip
                    content={<VisitChartTooltip />}
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

            <div className="mt-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#7C0041]" />

              <span className="text-xs text-[#817780] dark:text-[#B7AAB3]">
                Total kunjungan per bulan
              </span>
            </div>
          </section>

          {/* MONITORING DISTRIBUTION */}

          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-[#211A21]">
            <SectionHeader
              title="Monitoring Status"
              subtitle="Distribusi status equipment bulan ini"
            />

            <div className="relative h-[190px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={monitoringData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={59}
                    outerRadius={82}
                    paddingAngle={4}
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
                    formatter={(value) => [
                      `${value} unit`,
                      "Equipment",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[#29232A] dark:text-[#F5EDF2]">
                  100
                </span>

                <span className="text-xs text-[#817780] dark:text-[#B7AAB3]">
                  Total Unit
                </span>
              </div>
            </div>

            <div className="mt-3 space-y-3">
              {monitoringData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: item.color,
                      }}
                    />

                    <span className="text-xs text-[#817780] dark:text-[#B7AAB3]">
                      {item.name}
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-[#29232A] dark:text-[#F5EDF2]">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* =================================================
            LOWER DASHBOARD
        ================================================= */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

          {/* RECENT ACTIVITIES */}

          <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm xl:col-span-2 dark:bg-[#211A21]">
            <div className="p-5 pb-3">
              <SectionHeader
                title="Recent Visit Activities"
                subtitle="Aktivitas kunjungan terbaru"
                action={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C0041] dark:text-[#E36A9C]"
                  >
                    Lihat Semua

                    <ArrowRight size={14} />
                  </button>
                }
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-y border-[#EEE7EB] bg-[#FAF8F9] dark:border-[#3A3039] dark:bg-[#2A222A]">
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#817780]">
                      Equipment
                    </th>

                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#817780]">
                      Customer
                    </th>

                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#817780]">
                      Recorded By
                    </th>

                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#817780]">
                      Type
                    </th>

                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#817780]">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentActivities.map((activity) => (
                    <tr
                      key={activity.id}
                      className="border-b border-[#F0EAEE] transition hover:bg-[#FAF8F9] dark:border-[#3A3039] dark:hover:bg-[#2A222A]"
                    >
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-[#29232A] dark:text-[#F5EDF2]">
                          {activity.equipmentNumber}
                        </p>

                        <p className="mt-1 text-[11px] text-[#817780]">
                          {activity.machineModel}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-medium text-[#29232A] dark:text-[#F5EDF2]">
                          {activity.customerName}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs text-[#817780] dark:text-[#B7AAB3]">
                          {activity.recordedBy}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-md bg-[#F8E7EE] px-2 py-1 text-[11px] font-semibold text-[#7C0041] dark:bg-[#482238] dark:text-[#E36A9C]">
                          {activity.visitType}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs text-[#817780] dark:text-[#B7AAB3]">
                          {activity.visitDate}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-5 py-4">
              <p className="text-xs text-[#817780]">
                Menampilkan 5 aktivitas terbaru
              </p>

              <button
                type="button"
                className="text-xs font-semibold text-[#7C0041] dark:text-[#E36A9C]"
              >
                Lihat Riwayat
              </button>
            </div>
          </section>

          {/* QUICK ACTIONS */}

          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-[#211A21]">
            <SectionHeader
              title="Quick Actions"
              subtitle="Akses cepat fitur utama"
            />

            <div className="space-y-3">

              <button
                type="button"
                className="group flex w-full items-center gap-3 rounded-xl border border-[#EEE7EB] p-3 text-left transition hover:border-[#7C0041] hover:bg-[#F8E7EE] dark:border-[#3A3039] dark:hover:bg-[#30212B]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8E7EE] text-[#7C0041] dark:bg-[#482238] dark:text-[#E36A9C]">
                  <Plus size={19} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#29232A] dark:text-[#F5EDF2]">
                    Catat Kunjungan
                  </p>

                  <p className="mt-0.5 text-xs text-[#817780]">
                    Rekam aktivitas mesin
                  </p>
                </div>

                <ArrowRight
                  size={16}
                  className="text-[#A49AA1] transition group-hover:translate-x-1"
                />
              </button>

              <button
                type="button"
                className="group flex w-full items-center gap-3 rounded-xl border border-[#EEE7EB] p-3 text-left transition hover:border-[#7C0041] hover:bg-[#F8E7EE] dark:border-[#3A3039] dark:hover:bg-[#30212B]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F2FA] text-[#4285B8] dark:bg-[#23394A] dark:text-[#70B4E0]">
                  <Monitor size={19} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#29232A] dark:text-[#F5EDF2]">
                    Machine Monitoring
                  </p>

                  <p className="mt-0.5 text-xs text-[#817780]">
                    Pantau status equipment
                  </p>
                </div>

                <ArrowRight
                  size={16}
                  className="text-[#A49AA1] transition group-hover:translate-x-1"
                />
              </button>

              <button
                type="button"
                className="group flex w-full items-center gap-3 rounded-xl border border-[#EEE7EB] p-3 text-left transition hover:border-[#7C0041] hover:bg-[#F8E7EE] dark:border-[#3A3039] dark:hover:bg-[#30212B]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF4DD] text-[#B17A14] dark:bg-[#493A23] dark:text-[#E5B957]">
                  <FileText size={19} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#29232A] dark:text-[#F5EDF2]">
                    Reports
                  </p>

                  <p className="mt-0.5 text-xs text-[#817780]">
                    Lihat laporan kunjungan
                  </p>
                </div>

                <ArrowRight
                  size={16}
                  className="text-[#A49AA1] transition group-hover:translate-x-1"
                />
              </button>

            </div>

            {/* PERFORMANCE INSIGHT */}

            <div className="mt-5 rounded-xl bg-[#7C0041] p-4 text-white">
              <div className="flex items-center gap-2">
                <TrendingUp size={17} />

                <span className="text-xs font-semibold">
                  Monitoring Insight
                </span>
              </div>

              <p className="mt-3 text-2xl font-bold">
                68%
              </p>

              <p className="mt-1 text-xs leading-relaxed text-white/75">
                Equipment telah mendapatkan kunjungan pada periode monitoring.
              </p>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-[#FFC107]"
                  style={{
                    width: "68%",
                  }}
                />
              </div>
            </div>

          </section>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-[#EEE7EB] pt-5 text-xs text-[#A49AA1] sm:flex-row dark:border-[#3A3039]">
          <p>
            © {new Date().getFullYear()} MOKU — Monitoring Operasional Kunjungan Unit
          </p>

          <p>
            Track Precisely, Deliver Quality
          </p>
        </footer>

      </div>
    </main>
  );
}
