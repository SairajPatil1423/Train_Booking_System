"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { ADMIN_COACH_CONFIGS } from "@/utils/admin-coach-config";
import { fetchAdminTrainsThunk, fetchAdminBookingsThunk } from "@/features/admin/adminSlice";

const adminModules = [
  { name: "Train management", href: "/admin/trains", icon: "🚆" },
  { name: "Schedules", href: "/admin/schedules", icon: "📅" },
  { name: "Coaches and seats", href: "/admin/coaches", icon: "💺" },
  { name: "Fare rules", href: "/admin/fares", icon: "💰" },
  { name: "Booking overview", href: "/admin/bookings", icon: "📋" },
];

export default function AdminPage() {
  const dispatch = useDispatch();
  const { trains, bookings, resources } = useSelector((state) => state.admin);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      dispatch(fetchAdminTrainsThunk());
      dispatch(fetchAdminBookingsThunk());
    }
  }, [dispatch, isAuthenticated, user]);

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
            <Link href="/login" className="primary-button px-5 py-3 text-sm">
              Go to login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const stats = [
    { label: "Active Trains", value: trains.filter(t => t.is_active).length, color: "text-blue-600" },
    { label: "Total Bookings", value: bookings.length, color: "text-purple-600" },
    { label: "Revenue", value: `₹${bookings.reduce((sum, b) => sum + (b.total_fare || 0), 0).toLocaleString("en-IN")}`, color: "text-green-600" },
  ];

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-6xl flex-1 px-6 py-10 sm:px-10 lg:px-12">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-64 rounded-[3rem] bg-[radial-gradient(circle_at_top_left,_rgba(239,126,28,0.08),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(12,79,129,0.12),_transparent_34%)] sm:inset-x-10 lg:inset-x-12" />
      
      <div className="relative z-10 grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-panel rounded-[2rem] p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--color-accent)]">
            Operations dashboard
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
            Manage rail operations.
          </h1>
          
          <div className="mt-8 grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white p-4 shadow-sm border border-[var(--color-line)]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">{stat.label}</p>
                <p className={`mt-1 text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {adminModules.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className="flex items-center space-x-3 rounded-[1.4rem] border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-4 text-sm font-medium text-[var(--color-ink)] transition-all hover:border-[var(--color-accent)] hover:bg-white hover:shadow-sm"
              >
                <span className="text-xl">{module.icon}</span>
                <span>{module.name}</span>
              </Link>
            ))}
          </div>

          <div className="mt-8 rounded-[1.6rem] border border-[var(--color-line)] bg-[var(--color-surface-soft)] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              Fixed coach model
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {ADMIN_COACH_CONFIGS.map((coach) => (
                <div
                  key={coach.key}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--color-panel-dark)] ring-1 ring-[var(--color-line)]"
                >
                  {coach.label}: {coach.totalSeats} seats
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[2rem] bg-[linear-gradient(180deg,_#0d4d7d_0%,_#0a3658_100%)] p-8 text-white shadow-[0_28px_70px_rgba(12,79,129,0.16)]">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-xl">👤</div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/66">
                  Admin Session
                </p>
                <p className="mt-1 text-lg font-semibold">{user?.email}</p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
              <span className="text-xs text-white/60">Operational Role</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase">{user?.role}</span>
            </div>
          </section>

          <section className="surface-card rounded-[2rem] p-6 border border-[var(--color-line)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
              System Health
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-muted)]">API Status</span>
                <span className="flex items-center text-green-600 font-medium">
                  <span className="mr-2 h-2 w-2 rounded-full bg-green-600 anim-pulse"></span>
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-muted)]">Data Sync</span>
                <span className="text-[var(--color-ink)]">
                  {resources.trains.status === "loading" || resources.bookings.status === "loading"
                    ? "Syncing..."
                    : "Up to date"}
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
