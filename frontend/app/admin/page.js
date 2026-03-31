"use client";

import Link from "next/link";
import { useSelector } from "react-redux";

const adminModules = [
  "Train management",
  "Schedules",
  "Coaches and seats",
  "Fare rules",
  "Booking overview",
];

export default function AdminPage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-5xl flex-1 items-center px-6 py-12 sm:px-10">
        <div className="surface-panel w-full rounded-[2rem] p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--color-danger)]">
            Admin only
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
            You need an administrator account to enter this area.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
            This route is reserved for operations users handling trains, schedules,
            seats, and bookings.
          </p>
          <div className="mt-6">
            <Link href="/admin/login" className="primary-button px-5 py-3 text-sm">
              Go to admin login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-6xl flex-1 px-6 py-10 sm:px-10 lg:px-12">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-64 rounded-[3rem] bg-[radial-gradient(circle_at_top_left,_rgba(239,126,28,0.08),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(12,79,129,0.12),_transparent_34%)] sm:inset-x-10 lg:inset-x-12" />
      <div className="relative z-10 grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-panel rounded-[2rem] p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--color-accent)]">
            Operations dashboard
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
            Manage rail operations from one place.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
            Use the admin area to oversee trains, daily schedules, coach layouts,
            fare rules, and booking activity.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {adminModules.map((moduleName) => (
              <div
                key={moduleName}
                className="rounded-[1.4rem] border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-4 text-sm font-medium text-[var(--color-ink)]"
              >
                {moduleName}
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[2rem] bg-[linear-gradient(180deg,_#0d4d7d_0%,_#0a3658_100%)] p-8 text-white shadow-[0_28px_70px_rgba(12,79,129,0.16)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/66">
              Signed in
            </p>
            <p className="mt-4 text-lg font-semibold">{user?.email}</p>
            <p className="mt-2 text-sm text-white/76">Role: {user?.role}</p>
          </section>

          <section className="surface-card rounded-[2rem] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Next
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--color-ink)]">
              The management screens can now be built on top of this cleaner
              operations shell.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
