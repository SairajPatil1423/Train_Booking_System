"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { ADMIN_COACH_CONFIGS } from "@/utils/admin-coach-config";
import { fetchAdminTrainsThunk, fetchAdminBookingsThunk } from "@/features/admin/adminSlice";
import PageHero from "@/components/layout/page-hero";
import PageSection from "@/components/layout/page-section";
import Badge from "@/components/ui/badge";
import {
  AdminBookingSnapshot,
  AdminHealthPanel,
  AdminMetricCard,
  AdminModuleCard,
  AdminRevenueCard,
} from "@/components/admin/admin-dashboard-widgets";

const adminModules = [
  {
    name: "Train management",
    href: "/admin/trains",
    icon: "🚆",
    description: "Manage trains and service details.",
  },
  {
    name: "Schedules",
    href: "/admin/schedules",
    icon: "📅",
    description: "Set running dates and departures.",
  },
  {
    name: "Coaches and seats",
    href: "/admin/coaches",
    icon: "💺",
    description: "Configure coach layouts and seats.",
  },
  {
    name: "Fare rules",
    href: "/admin/fares",
    icon: "💰",
    description: "Set pricing by coach class.",
  },
  {
    name: "All bookings",
    href: "/admin/bookings",
    icon: "🧾",
    description: "Review bookings, refunds, and status.",
  },
  {
    name: "Create admin",
    href: "/admin/users",
    icon: "🛡️",
    description: "Add another admin account.",
  },
];

export default function AdminPage() {
  const dispatch = useDispatch();
  const { trains, bookings, trainsMeta, bookingsMeta, resources } = useSelector((state) => state.admin);
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
          <p className="inline-flex rounded-full bg-[var(--color-danger-soft)] px-3 py-1 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--color-danger)]">
            Admin only
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
            You need an administrator account to enter this area.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
            This route is reserved for operations users handling trains, schedules,
            seats, and fares.
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

  const grossRevenue = bookings.reduce(
    (sum, booking) => sum + Number(booking.payment?.amount || booking.total_fare || 0),
    0,
  );
  const totalRefunds = bookings.reduce(
    (sum, booking) =>
      sum +
      (booking.cancellations || []).reduce(
        (refundSum, cancellation) => refundSum + Number(cancellation.refund_amount || 0),
        0,
      ),
    0,
  );
  const netRevenue = grossRevenue - totalRefunds;
  const bookingsStatus = resources.bookings.status;
  const bookingsError = resources.bookings.error;
  const trainsStatus = resources.trains.status;
  const isRevenueLoading = bookingsStatus === "loading";
  const hasRevenueError = Boolean(bookingsError);
  const activeTrainsCount = trains.filter((t) => t.is_active).length;
  const delayedDataSync = resources.trains.status === "loading" || resources.bookings.status === "loading";
  const totalTrains = trainsMeta.totalCount || trains.length;
  const totalBookings = bookingsMeta.totalCount || bookings.length;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
      <div className="space-y-6">
        <PageHero
          eyebrow="Admin command center"
          title="Admin dashboard"
          description="Manage trains, schedules, bookings, coaches, and fares from one place."
          meta={[
            delayedDataSync ? "Syncing" : "Live",
            `${totalBookings} bookings`,
            `${totalTrains} trains`,
          ]}
          actions={
            <>
              <Link href="/admin/bookings" className="primary-button px-5 py-3 text-sm">
                Open bookings board
              </Link>
              <Link href="/admin/users" className="secondary-button px-5 py-3 text-sm">
                Create admin
              </Link>
            </>
          }
          aside={
            <div className="rounded-[1.8rem] border border-[var(--color-line)] bg-white/80 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                    Active admin
                  </p>
                  <p className="mt-2 text-base font-semibold text-[var(--color-ink)]">
                    {user?.email}
                  </p>
                </div>
                <Badge variant="neutral">{user?.role}</Badge>
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
                Signed in as an administrator.
              </p>
            </div>
          }
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminMetricCard
            label="Total trains"
            value={trainsStatus === "loading" ? "Loading..." : totalTrains}
            hint="Train records on the current page."
            trend={totalTrains > 0 ? "Live" : "Empty"}
          />
          <AdminMetricCard
            label="All bookings"
            value={bookingsStatus === "loading" ? "Loading..." : totalBookings}
            hint="Reservations reported by the API."
            trend={totalBookings > 0 ? "Active" : "Quiet"}
          />
          <AdminMetricCard
            label="Net revenue"
            value={
              hasRevenueError
                ? "Unavailable"
                : isRevenueLoading
                  ? "Loading..."
                  : `₹${netRevenue.toLocaleString("en-IN")}`
            }
            hint="Bookings minus refunds."
            trend={hasRevenueError ? "Check" : "Finance"}
            trendTone={hasRevenueError ? "warning" : "positive"}
          />
          <AdminMetricCard
            label="Coach templates"
            value={ADMIN_COACH_CONFIGS.length}
            hint="Available coach layouts."
            trend="Layouts"
          />
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <PageSection className="space-y-5 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
                  Admin modules
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                  Core controls
                </h2>
              </div>
              <Badge variant="neutral">{adminModules.length} areas</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {adminModules.map((module) => (
                <AdminModuleCard key={module.href} module={module} />
              ))}
            </div>
          </PageSection>

          <div className="space-y-6">
            <AdminRevenueCard
              grossRevenue={grossRevenue}
              totalRefunds={totalRefunds}
              netRevenue={netRevenue}
              loading={isRevenueLoading}
              error={hasRevenueError ? (Array.isArray(bookingsError) ? bookingsError.join(", ") : bookingsError) : null}
              scopeLabel="Current bookings page revenue"
            />

            <AdminHealthPanel
              syncing={delayedDataSync}
              role={user?.role}
              email={user?.email}
            />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <PageSection className="p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              Fixed coach model
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {ADMIN_COACH_CONFIGS.map((coach) => (
                <div
                  key={coach.key}
                  className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--color-panel-dark)]"
                >
                  {coach.label} {coach.totalSeats} seats
                </div>
              ))}
            </div>
          </PageSection>

          <AdminBookingSnapshot bookings={bookings} />
        </div>
      </div>
    </main>
  );
}
