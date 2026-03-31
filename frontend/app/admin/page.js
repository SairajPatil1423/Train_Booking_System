"use client";

import Link from "next/link";
import { useSelector } from "react-redux";

export default function AdminPage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-5xl flex-1 items-center px-6 py-12 sm:px-10">
        <div className="w-full rounded-[2rem] border border-red-200 bg-red-50 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-700">
            Admin only
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-red-950">
            You need an administrator account to enter this area.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-red-900/80">
            This route is reserved for operational tasks like managing trains,
            schedules, seats, and bookings.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/login"
              className="inline-flex rounded-full bg-red-700 px-5 py-3 font-semibold text-white transition hover:opacity-90"
            >
              Go to admin login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-6xl flex-1 px-6 py-12 sm:px-10 lg:px-12">
      <div className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
            Admin dashboard
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
            Welcome to the operations console.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
            We’ll build the train, schedule, seat, fare rule, and booking
            management views from here.
          </p>
        </section>

        <aside className="rounded-[2rem] bg-[var(--color-panel)] p-8 shadow-sm">
          <p className="text-sm font-medium text-[var(--color-muted)]">
            Signed in as
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">
            {user?.email}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Role: {user?.role}
          </p>
        </aside>
      </div>
    </main>
  );
}
