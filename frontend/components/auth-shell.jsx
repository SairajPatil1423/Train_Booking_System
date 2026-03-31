export default function AuthShell({
  eyebrow,
  title,
  description,
  footer,
  children,
}) {
  return (
    <main className="relative flex min-h-[calc(100vh-81px)] flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(240,137,48,0.18),_transparent_24%),radial-gradient(circle_at_right,_rgba(15,61,74,0.12),_transparent_30%),linear-gradient(180deg,_#faf6ee_0%,_#fffdf7_45%,_#f6efe2_100%)]" />
      <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-14">
        <section className="flex flex-col justify-between rounded-[2rem] bg-[linear-gradient(180deg,_#123744_0%,_#0b2a34_100%)] p-8 text-white shadow-[0_32px_90px_rgba(9,26,32,0.22)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
              {title}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-8 text-white/72">
              {description}
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
              <p className="text-sm font-medium text-white/70">Stateless auth</p>
              <p className="mt-2 text-sm leading-7 text-white/84">
                JWT is stored on the client and attached automatically on API
                calls.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
              <p className="text-sm font-medium text-white/70">
                Production flow
              </p>
              <p className="mt-2 text-sm leading-7 text-white/84">
                Validation, loading states, and API error handling are wired in
                from the start.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-xl rounded-[2rem] border border-black/8 bg-white/92 p-6 shadow-[0_24px_64px_rgba(36,31,25,0.08)] sm:p-8">
            {children}
            {footer ? (
              <div className="mt-6 border-t border-black/8 pt-5 text-sm text-[var(--color-muted)]">
                {footer}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
