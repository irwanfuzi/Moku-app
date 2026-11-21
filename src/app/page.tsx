export default function DashboardPage() {
  const { isMobile, isReady } = useAppLayout();

  const [selectedMonth, setSelectedMonth] =
    useState("Oktober 2025");

  const months = [
    "September 2025",
    "Oktober 2025",
    "November 2025",
    "Desember 2025",
    "Januari 2026",
  ];

  const [showMonthPicker, setShowMonthPicker] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const showMobileHeader = isReady && isMobile;

  if (isReady && !isMobile) {
    return <DesktopDashboard />;
  }

  return (
    <main className="relative w-full overflow-x-clip bg-[#F7F7F7] pb-[calc(68px+env(safe-area-inset-bottom))]">

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      {showMobileHeader && (
        <header className="relative isolate h-[clamp(190px,53cqw,230px)] overflow-hidden bg-[#730217] px-[clamp(18px,5cqw,22px)] pt-[max(18px,env(safe-area-inset-top))] text-white">

          {/* HEADER BACKGROUND */}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#80051F] via-[#730217] to-[#650016]" />

          {/* DECORATIVE RED SHAPES */}

          <div className="pointer-events-none absolute -right-[100px] top-[115px] h-[230px] w-[230px] rounded-full bg-[#BF0B2C]/35" />

          <div className="pointer-events-none absolute -left-[110px] bottom-[-110px] h-[230px] w-[300px] rounded-full bg-[#BF0B2C]/20" />

          {/* ORGANIC WAVE */}

          <svg
            aria-hidden="true"
            viewBox="0 0 1000 150"
            preserveAspectRatio="none"
            className="pointer-events-none absolute bottom-0 left-0 z-[1] h-[clamp(55px,15cqw,75px)] w-full"
          >
            <defs>
              <linearGradient
                id="mokuWaveGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="#BF0B2C" />
                <stop offset="48%" stopColor="#D20B36" />
                <stop offset="100%" stopColor="#BF0B2C" />
              </linearGradient>
            </defs>

            <path
              d="
                M0 115
                C55 88 100 108 155 91
                C225 68 258 24 330 32
                C410 40 438 92 515 83
                C590 75 617 22 690 18
                C770 12 805 48 875 31
                C930 18 965 -4 1000 -18
                L1000 150
                L0 150
                Z
              "
              fill="url(#mokuWaveGradient)"
            />
          </svg>

          {/* HEADER CONTENT */}

          <div className="relative z-10">

            {/* BRAND */}

            <div className="flex h-[42px] items-center justify-between">

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
                  className="h-auto w-[clamp(108px,29cqw,122px)] object-contain object-left"
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
                  className="relative flex h-10 w-10 items-center justify-center text-white"
                >
                  <Bell size={27} strokeWidth={1.8} />

                  <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-[#730217] bg-[#F28C0F]" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 z-50 w-[260px] rounded-2xl border border-[#EEE7EB] bg-white p-4 text-[#29232A] shadow-xl">

                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-bold">
                        Notifikasi
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setShowNotifications(false)
                        }
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
                      className="block border-t border-[#F0E9ED] pt-3 text-center text-xs font-bold text-[#BF0B2C]"
                    >
                      Lihat Semua Notifikasi
                    </Link>

                  </div>
                )}

              </div>
            </div>

            {/* GREETING */}

            <div className="relative mt-[clamp(13px,4cqw,17px)]">

              <div className="relative z-10 max-w-[75%]">

                <h1 className="text-[clamp(21px,5.8cqw,24px)] font-bold leading-[1.15] tracking-[-0.035em] text-white">
                  Halo, Budi Santoso
                </h1>

                <p className="mt-1 text-[clamp(12px,3.5cqw,14px)] leading-[1.3] text-white/95">
                  Berikut ringkasan operasional kunjungan unit.
                </p>

              </div>

              {/* PRINTER */}

              <div className="pointer-events-none absolute right-[-5px] top-[-5px] z-[2] flex h-[clamp(125px,35cqw,150px)] w-[clamp(125px,35cqw,150px)] items-center justify-center">

                <Image
                  src="/images/moku/illustrations/dashboard-printer.png"
                  alt=""
                  width={400}
                  height={400}
                  priority
                  className="h-full w-full object-contain"
                  sizes="150px"
                />

              </div>

            </div>

          </div>
        </header>
      )}

      {/* =====================================================
          WHITE CANVAS
          Rounded top corners + overlap header
      ===================================================== */}

      <div
        className={`relative z-20 mx-auto -mt-[clamp(19px,5.5cqw,25px)] min-h-screen w-full rounded-t-[clamp(23px,6cqw,28px)] bg-[#F7F7F7] px-[clamp(11px,3cqw,14px)] pt-[clamp(15px,4cqw,19px)] ${
          showMobileHeader ? "" : "mt-0"
        }`}
      >

        <div className="mx-auto w-full max-w-[540px] space-y-[clamp(14px,3.8cqw,17px)] pb-5">

          {/* =================================================
              STATUS MONITORING
          ================================================= */}

          {/* SECTION HEADING OUTSIDE CARD */}

          <div className="flex min-w-0 items-center justify-between gap-2">

            <h2 className="min-w-0 text-[clamp(15px,4.1cqw,19px)] font-bold leading-tight tracking-[-0.035em] text-[#171717]">
              Status Monitoring Mesin
            </h2>

            {/* PERIOD */}

            <div className="relative z-30 shrink-0">

              <button
                type="button"
                onClick={() =>
                  setShowMonthPicker((value) => !value)
                }
                aria-expanded={showMonthPicker}
                className="flex h-[clamp(35px,9cqw,41px)] w-[clamp(138px,39cqw,190px)] items-center gap-2 rounded-full border border-[#ECECEC] bg-white px-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
              >

                <CalendarDays
                  size={19}
                  className="shrink-0 text-[#171717]"
                />

                <span className="min-w-0 flex-1 whitespace-nowrap text-left text-[clamp(11px,3cqw,13px)] font-semibold text-[#171717]">
                  {selectedMonth}
                </span>

                <ChevronDown size={15} />

              </button>

              {showMonthPicker && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[220px] overflow-hidden rounded-xl border border-[#EEE7EB] bg-white py-2 shadow-xl">

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

          <section className="min-w-0 rounded-[19px] border border-[#EEEEEE] bg-white p-[clamp(11px,3cqw,14px)] shadow-[0_3px_12px_rgba(0,0,0,0.055)]">

            <div className="grid min-w-0 grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] items-center gap-2">

              {/* DONUT */}

              <div className="flex min-w-0 items-center justify-center border-r border-[#E9E9E9] pr-2">

                <div
                  className="relative aspect-square w-full max-w-[clamp(91px,25cqw,110px)] rounded-full"
                  style={{
                    background:
                      "conic-gradient(#BF0B2C 0deg 237deg, #D9D9D9 237deg 327deg, #F28C0F 327deg 360deg)",
                  }}
                >

                  <div className="absolute inset-[14%] flex flex-col items-center justify-center rounded-full bg-white">

                    <span className="text-[clamp(27px,7.5cqw,33px)] font-extrabold leading-none text-[#111111]">
                      48
                    </span>

                    <span className="mt-1 text-[clamp(11px,3cqw,13px)] text-[#29232A]">
                      Mesin
                    </span>

                  </div>

                </div>

              </div>

              {/* LEGEND */}

              <div className="min-w-0 space-y-[clamp(9px,2.5cqw,12px)]">

                {monitoringData.map((item) => (

                  <div
                    key={item.label}
                    className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1.5"
                  >

                    <span className="flex min-w-0 items-center gap-1.5">

                      <span
                        className="h-[13px] w-[13px] shrink-0 rounded-[4px]"
                        style={{
                          backgroundColor: item.color,
                        }}
                      />

                      <span className="truncate text-[clamp(10px,2.9cqw,13px)] font-semibold text-[#29232A]">
                        {item.label}
                      </span>

                    </span>

                    <span className="whitespace-nowrap text-[clamp(10px,2.9cqw,13px)] text-[#51474E]">
                      {item.value} Mesin
                    </span>

                    <span
                      className={`min-w-[36px] rounded-full px-2 py-1 text-center text-[clamp(10px,2.8cqw,12px)] font-bold ${item.badge}`}
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

          {/* SECTION HEADING OUTSIDE CARD */}

          <div className="flex min-w-0 items-center justify-between gap-2 px-1">

            <h2 className="text-[clamp(16px,4.3cqw,19px)] font-bold tracking-[-0.035em] text-[#29232A]">
              Kunjungan Bulan Ini
            </h2>

            <span className="shrink-0 whitespace-nowrap text-[clamp(11px,3cqw,14px)] font-medium text-[#29232A]">
              Target: 40 Kunjungan
            </span>

          </div>

          {/* VISIT CARD */}

          <section className="min-w-0 rounded-[19px] border border-[#EEEEEE] bg-white p-[clamp(11px,3cqw,14px)] shadow-[0_3px_12px_rgba(0,0,0,0.055)]">

            <div className="grid min-w-0 grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] items-center gap-2">

              {/* TOTAL VISITS */}

              <div className="min-w-0 border-r border-[#EEEEEE] pr-2">

                <p className="text-[clamp(33px,9.5cqw,40px)] font-extrabold leading-none tracking-[-0.05em] text-[#111111]">
                  32
                </p>

                <p className="mt-1 whitespace-nowrap text-[clamp(12px,3.2cqw,14px)] text-[#29232A]">
                  Total Kunjungan
                </p>

              </div>

              {/* GROWTH + ILLUSTRATION */}

              <div className="grid min-w-0 grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center gap-1">

                <div className="min-w-0">

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DDF9E5] px-3 py-1 text-[clamp(11px,3cqw,13px)] font-bold text-[#168B3E]">

                    <TrendingUp size={15} />

                    +14%

                  </span>

                  <p className="mt-1 text-[clamp(11px,3.1cqw,13px)] leading-[1.25] text-[#29232A]">
                    Dibanding bulan lalu
                    <br />
                    (28 kunjungan)
                  </p>

                </div>

                <div className="relative flex h-[clamp(65px,18cqw,80px)] items-center justify-center">

                  <span className="absolute inset-[8%] rounded-full bg-[#FDE9ED]" />

                  <Image
                    src="/images/moku/illustrations/dashboard-activity.png"
                    alt=""
                    width={260}
                    height={260}
                    className="relative z-10 h-full w-full object-contain"
                    sizes="110px"
                  />

                </div>

              </div>

            </div>

            {/* TARGET PROGRESS */}

            <div className="mt-[clamp(10px,3cqw,13px)]">

              <div className="mb-1.5 flex items-center justify-between">

                <p className="text-[clamp(12px,3.2cqw,14px)] font-bold text-[#171717]">
                  Pencapaian Target
                </p>

                <p className="text-[clamp(12px,3.2cqw,14px)] font-extrabold text-[#111111]">
                  80%
                </p>

              </div>

              <div className="h-[9px] overflow-hidden rounded-full bg-[#E8E8E8]">

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

          {/* SECTION HEADING OUTSIDE CARD */}

          <div className="px-1">

            <h2 className="text-[clamp(16px,4.3cqw,19px)] font-bold tracking-[-0.035em] text-[#171717]">
              Aksi Cepat
            </h2>

          </div>

          {/* QUICK ACTION CARD */}

          <section className="min-w-0 rounded-[19px] border border-[#EEEEEE] bg-white p-[clamp(10px,3cqw,14px)] shadow-[0_3px_12px_rgba(0,0,0,0.055)]">

            <div className="grid grid-cols-4">

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
                <Printer size={22} />
              </QuickAction>

              <QuickAction
                href="/reports"
                label="Laporan"
                separated
              >
                <ChartNoAxesColumn size={22} />
              </QuickAction>

              <QuickAction
                href="/reports/export"
                label={<>Unduh<br />Laporan</>}
                separated
              >
                <Download size={22} />
              </QuickAction>

            </div>

          </section>

          {/* =================================================
              MESIN PERLU PERHATIAN
          ================================================= */}

          <Link
            href="/monitoring"
            className="relative flex min-h-[68px] min-w-0 items-center gap-3 overflow-hidden rounded-[17px] border border-[#F7E4DE] bg-[#FFF2EE] px-3 py-2 pl-4 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-[#F28C0F]"
          >

            <div className="flex h-[45px] w-[45px] shrink-0 items-center justify-center rounded-full bg-[#FFE6D8] text-[#F28C0F]">

              <AlertTriangle size={30} strokeWidth={1.8} />

            </div>

            <div className="min-w-0 flex-1">

              <p className="text-[clamp(12px,3.6cqw,14px)] font-bold leading-tight text-[#171717]">
                Mesin Perlu Perhatian
              </p>

              <p className="mt-1 text-[clamp(11px,3.1cqw,13px)] leading-[1.25] text-[#51474E]">
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

          {/* SECTION HEADING */}

          <div className="flex min-w-0 items-center justify-between gap-2 px-1">

            <h2 className="text-[clamp(16px,4.3cqw,19px)] font-bold tracking-[-0.035em] text-[#171717]">
              Aktivitas Terbaru
            </h2>

            <Link
              href="/visit-history"
              className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[clamp(11px,3cqw,14px)] font-bold text-[#BF0B2C]"
            >
              Lihat Semua
              <ChevronRight size={18} />
            </Link>

          </div>

          {/* ACTIVITY CARD */}

          <section className="divide-y divide-[#EEEEEE] rounded-[19px] border border-[#EEEEEE] bg-white px-[clamp(10px,3cqw,14px)] shadow-[0_3px_12px_rgba(0,0,0,0.055)]">

            {recentActivities.map((activity, index) => (

              <div
                key={`${activity.machine}-${index}`}
                className="flex min-h-[62px] min-w-0 items-center gap-3 py-2"
              >

                {/* STATUS ICON */}

                <div
                  className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full ${
                    activity.status === "success"
                      ? "bg-[#DDF8E7] text-[#249653]"
                      : "bg-[#FCE7E8] text-[#D83B45]"
                  }`}
                >

                  {activity.status === "success" ? (
                    <CheckCircle2 size={27} />
                  ) : (
                    <Clock3 size={27} />
                  )}

                </div>

                {/* ACTIVITY DETAIL */}

                <div className="min-w-0 flex-1">

                  <p className="truncate text-[clamp(11px,3.1cqw,14px)] font-bold leading-tight text-[#171717]">
                    {activity.title}
                  </p>

                  <p className="mt-1 truncate text-[clamp(11px,3cqw,13px)] leading-tight text-[#756B73]">
                    {activity.machine} · {activity.customer}
                  </p>

                </div>

                {/* TIME BADGE */}

                <span
                  className={`shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-[clamp(10px,2.9cqw,12px)] font-medium ${
                    activity.status === "success"
                      ? index === 0
                        ? "bg-[#E5F7DF] text-[#3E6A36]"
                        : "bg-[#F1F1F1] text-[#555555]"
                      : "bg-[#FCE7E8] text-[#BF0B2C]"
                  }`}
                >
                  {activity.time}
                </span>

              </div>

            ))}

          </section>

        </div>

      </div>

    </main>
  );
}