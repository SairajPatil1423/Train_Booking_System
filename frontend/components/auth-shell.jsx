export default function AuthShell({
  eyebrow,
  title,
  description,
  footer,
  highlights = [],
  stats = [],
  mode = "passenger",
  children,
}) {
  const defaultHighlights =
    mode === "admin"
      ? [
          {
            title: "Operate with confidence",
            description:
              "Manage schedules, bookings, coach layouts, and fares from one control space.",
          },
          {
            title: "Live operational visibility",
            description:
              "Stay aligned on demand, cancellations, and revenue without leaving the dashboard.",
          },
        ]
      : [
          {
            title: "Search with ease",
            description:
              "Check routes, schedules, and seat availability in one place.",
          },
          {
            title: "Manage journeys",
            description:
              "Keep your upcoming trips, cancellations, and booking history together.",
          },
        ];

  const defaultStats =
    mode === "admin"
      ? [
          { label: "Access", value: "Admin only" },
          { label: "View", value: "Operations" },
          { label: "Purpose", value: "Control room" },
        ]
      : [
          { label: "Search", value: "Fast route lookup" },
          { label: "Booking", value: "Exact seat flow" },
          { label: "Account", value: "Journey history" },
        ];

  const items = highlights.length > 0 ? highlights : defaultHighlights;
  const statItems = stats.length > 0 ? stats : defaultStats;

  return (
    <main className="relative flex min-h-screen flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(14,116,144,0.12),_transparent_34%),linear-gradient(180deg,_rgba(248,250,252,0.95)_0%,_rgba(241,245,249,0.86)_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_34%),linear-gradient(180deg,_rgba(2,6,23,0.98)_0%,_rgba(10,15,28,0.94)_100%)]" />
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl flex-1 items-center gap-8 px-6 py-8 sm:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-12">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-[linear-gradient(160deg,_#0f4f82_0%,_#0f3d6b_40%,_#0b2344_100%)] p-8 text-white shadow-[0_34px_90px_rgba(12,79,129,0.2)]">
          <div className="pointer-events-none absolute -right-10 top-0 h-44 w-44 rounded-full bg-[rgba(96,165,250,0.18)] blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-36 w-36 rounded-full bg-[rgba(16,185,129,0.1)] blur-2xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_58%)]" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/78">
                Train Booking
              </div>
              <div className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">
                {mode === "admin" ? "Operations access" : "Passenger access"}
              </div>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-white/64">
              {eyebrow}
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-white/76">
              {description}
            </p>
          </div>

          <div className="relative mt-10 grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item.title} className="soft-panel rounded-[1.7rem] p-5">
                <p className="text-sm font-medium text-white/72">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-white/84">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
            {statItems.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.35rem] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/58">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-white/92">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="relative mt-8 rounded-[1.7rem] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/58">
              {mode === "admin" ? "Security note" : "Why sign in"}
            </p>
            <p className="mt-3 text-sm leading-7 text-white/82">
              {mode === "admin"
                ? "Only authorised railway operations users should continue beyond this point."
                : "Signing in keeps your bookings, cancellations, and exact seat selections synced across sessions."}
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="surface-panel relative w-full max-w-xl overflow-hidden rounded-[2.4rem] border border-[var(--color-line)] p-6 shadow-[0_28px_70px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_60%)]" />
            <div className="relative">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                    Secure access
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Fast, clean, and built for repeat use.
                  </p>
                </div>
                <div className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  {mode}
                </div>
              </div>
            </div>
            {children}
            {footer ? (
              <div className="mt-6 border-t border-[var(--color-line)] pt-5 text-sm text-[var(--color-muted)]">
                {footer}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
