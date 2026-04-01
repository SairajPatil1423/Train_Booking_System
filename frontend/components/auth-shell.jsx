export default function AuthShell({
  eyebrow,
  title,
  description,
  footer,
  children,
}) {
  return (
    <main className="relative flex min-h-screen flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(239,126,28,0.1),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(12,79,129,0.1),_transparent_34%)]" />
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl flex-1 items-center gap-8 px-6 py-8 sm:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-12">
        <section className="relative overflow-hidden rounded-[2.25rem] bg-[linear-gradient(180deg,_#0d4d7d_0%,_#0a3658_100%)] p-8 text-white shadow-[0_34px_90px_rgba(12,79,129,0.18)]">
          <div className="pointer-events-none absolute -right-10 top-0 h-44 w-44 rounded-full bg-[rgba(239,126,28,0.18)] blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[rgba(255,255,255,0.08)] blur-2xl" />
          <div className="relative">
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
            <div className="soft-panel rounded-[1.5rem] p-5">
              <p className="text-sm font-medium text-white/72">Search with ease</p>
              <p className="mt-2 text-sm leading-7 text-white/84">
                Check routes, schedules, and seat availability in one place.
              </p>
            </div>
            <div className="soft-panel rounded-[1.5rem] p-5">
              <p className="text-sm font-medium text-white/72">Manage journeys</p>
              <p className="mt-2 text-sm leading-7 text-white/84">
                Keep your upcoming trips, cancellations, and booking history together.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="surface-panel w-full max-w-xl rounded-[2.25rem] p-6 sm:p-8">
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
