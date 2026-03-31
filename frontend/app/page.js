import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-1 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(237,125,49,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(13,77,101,0.18),_transparent_34%),linear-gradient(180deg,_#f8f4ea_0%,_#fffdf7_48%,_#f2eee2_100%)]" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-10 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between border-b border-black/10 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
              RailYatra
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Train booking frontend foundation
            </h1>
          </div>
          <div className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm text-black/70 shadow-sm backdrop-blur">
            Next.js + Redux + Tailwind
          </div>
        </header>

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-panel)] px-4 py-2 text-sm text-[var(--color-muted)] shadow-sm ring-1 ring-black/5">
              Ready for auth, search, booking, and seat maps
            </div>
            <div className="space-y-4">
              <h2 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                We now have the production shell in place for an IRCTC-like
                booking experience.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-[var(--color-muted)] sm:text-lg">
                The app is wired with a central Redux store, auth persistence,
                and a shared API client so the next steps can focus on real user
                flows instead of plumbing.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="rounded-2xl bg-[var(--color-panel-strong)] px-5 py-4 shadow-sm ring-1 ring-black/5">
                <p className="text-sm font-medium text-[var(--color-muted)]">
                  API base URL
                </p>
                <p className="mt-1 font-mono text-sm text-[var(--color-ink)]">
                  {process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}
                </p>
              </div>
              <div className="rounded-2xl bg-white/90 px-5 py-4 shadow-sm ring-1 ring-black/5">
                <p className="text-sm font-medium text-[var(--color-muted)]">
                  Next step
                </p>
                <p className="mt-1 text-sm text-[var(--color-ink)]">
                  Search live trains and start bookings
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex rounded-full bg-[var(--color-ink)] px-5 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex rounded-full border border-black/10 bg-white/85 px-5 py-3 font-semibold text-[var(--color-ink)] transition hover:bg-white"
              >
                Create account
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/8 bg-white/88 p-6 shadow-[0_30px_80px_rgba(44,39,32,0.08)] backdrop-blur">
            <div className="rounded-[1.5rem] bg-[linear-gradient(160deg,_#0f3d4a_0%,_#184f61_48%,_#f18c3a_150%)] p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                    Core architecture
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold">
                    Frontend setup checkpoint
                  </h3>
                </div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                  Step 3
                </div>
              </div>
              <ul className="mt-8 space-y-3 text-sm text-white/82">
                <li>Validated login and register screens</li>
                <li>JWT persistence with global logout support</li>
                <li>Shared navigation that reflects auth state</li>
                <li>Protected search checkpoint for signed-in users</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
