"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import PageShell from "@/components/page-shell";
import PageSection from "@/components/layout/page-section";
import LoadingState from "@/components/loading-state";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Skeleton from "@/components/ui/skeleton";
import { fetchUserBookingsThunk } from "@/features/booking/bookingSlice";
import { getUserDisplayName } from "@/utils/user-formatters";
import { buildBookingViewModel } from "@/utils/view-models";
import { formatDate, formatScheduleDateTimeWithOffset } from "@/utils/formatters";

const quickLinks = [
  {
    title: "Search Trains",
    href: "/search",
  },
  {
    title: "My Bookings",
    href: "/bookings",
  },
  {
    title: "Profile",
    href: "/account",
  },
];

export default function Home() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, hydrated } = useSelector((state) => state.auth);
  const { userBookings: bookings, bookingsStatus: status } = useSelector(
    (state) => state.booking,
  );
  const displayName = getUserDisplayName(user);

  useEffect(() => {
    if (isAuthenticated && status === "idle") {
      dispatch(fetchUserBookingsThunk());
    }
  }, [dispatch, isAuthenticated, status]);

  const recentBookings = useMemo(() => {
    const sorted = [...bookings].sort((left, right) => {
      const leftTime = new Date(left.booked_at || 0).getTime();
      const rightTime = new Date(right.booked_at || 0).getTime();
      return rightTime - leftTime;
    });

    return sorted.slice(0, 3).map((booking) => ({
      raw: booking,
      view: buildBookingViewModel(booking),
    }));
  }, [bookings]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalBookings = bookings.length;
    const upcomingJourneys = bookings.filter((booking) => {
      const travelDate = booking.schedule?.travel_date ? new Date(booking.schedule.travel_date) : null;
      return (
        travelDate &&
        travelDate >= today &&
        ["booked", "confirmed", "partially_cancelled"].includes(booking.status)
      );
    }).length;
    const cancelledTickets = bookings.reduce((sum, booking) => {
      return sum + (booking.ticket_allocations || []).filter((allocation) => allocation.status === "cancelled").length;
    }, 0);

    return [
      {
        label: "Total bookings",
        value: totalBookings,
      },
      {
        label: "Upcoming journeys",
        value: upcomingJourneys,
      },
      {
        label: "Cancelled tickets",
        value: cancelledTickets,
      },
    ];
  }, [bookings]);

  if (!hydrated) {
    return (
      <PageShell className="px-6 py-8 sm:px-10 lg:px-12">
        <LoadingState label="Preparing your dashboard..." />
      </PageShell>
    );
  }

  return (
    <PageShell className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card tone="panel" className="overflow-hidden rounded-[2.2rem] p-6 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_52%)]" />
          <div className="relative z-10">
            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                  {isAuthenticated ? `Hi, ${displayName}` : "Welcome to RailYatra"}
                </p>
                <h1 className="mt-3 text-4xl font-semibold leading-[1.02] tracking-tight text-[var(--color-ink)] sm:text-[3.4rem]">
                  Dashboard
                </h1>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button as={Link} href="/search" size="lg">
                  Search trains
                </Button>
                <Button as={Link} href={isAuthenticated ? "/bookings" : "/register"} variant="secondary" size="lg">
                  {isAuthenticated ? "View bookings" : "Create account"}
                </Button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {stats.map((stat) => (
                <Card key={stat.label} className="rounded-[1.6rem] border border-[var(--color-line)] p-5 ui-card-hover">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
                    {status === "loading" ? "--" : stat.value}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </Card>

        <PageSection className="rounded-[2.2rem] p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            Actions
          </h2>

          <div className="mt-6 space-y-4">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Card className="rounded-[1.5rem] p-5 ui-card-hover">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-[var(--color-ink)]">{link.title}</h3>
                    <span className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-panel-dark)]">
                      Open
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </PageSection>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* <PageSection className="rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
              Search
            </h2>
            <Button as={Link} href="/search" variant="secondary">
              Open
            </Button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-[var(--color-line)] bg-[var(--color-surface-soft)] p-5">
              <p className="mt-3 text-lg font-semibold text-[var(--color-ink)]">
                Search Trains
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--color-line)] bg-[var(--color-surface-soft)] p-5">
              <p className="mt-3 text-lg font-semibold text-[var(--color-ink)]">
                My Bookings
              </p>
            </div>
          </div>
        </PageSection> */}

        <PageSection className="rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
              Recent Bookings
            </h2>
            <Button as={Link} href="/bookings" variant="ghost">
              View All
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            {status === "loading" ? (
              <>
                <Skeleton className="h-36 rounded-[1.5rem]" />
                <Skeleton className="h-36 rounded-[1.5rem]" />
              </>
            ) : recentBookings.length ? (
              recentBookings.map(({ raw, view }) => (
                <Card key={raw.id} className="rounded-[1.6rem] p-5 ui-card-hover">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="primary" className="px-3 py-1.5 text-[11px]">{view.reference}</Badge>
                      <Badge variant={badgeVariant(raw.status)} className="px-3 py-1.5 text-[11px]">
                        {view.statusLabel}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium text-[var(--color-muted)]">
                      {formatDate(raw.booked_at)}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                    <div>
                      <p className="text-lg font-semibold text-[var(--color-ink)]">
                        {raw.schedule?.train?.name || "Train journey"}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        {raw.src_station?.name || "Source"} to {raw.dst_station?.name || "Destination"}
                      </p>
                      <p className="mt-3 text-sm font-medium text-[var(--color-muted-strong)]">
                        {formatScheduleDateTimeWithOffset(
                          raw.schedule?.travel_date,
                          raw.segment_timing?.departure_time || raw.schedule?.departure_time,
                          raw.segment_timing?.departure_day_offset || 0,
                        )}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] bg-[var(--color-surface-soft)] px-4 py-3 text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                        Seats
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                        {view.seatLabels.length ? view.seatLabels.join(", ") : "Pending"}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="rounded-[1.6rem] border border-dashed border-[var(--color-line)] bg-[var(--color-surface-soft)] px-5 py-10">
                <p className="text-lg font-semibold text-[var(--color-ink)]">No recent bookings yet</p>
              </div>
            )}
          </div>
        </PageSection>
      </section>
    </PageShell>
  );
}

function badgeVariant(status) {
  if (status === "cancelled") return "danger";
  if (status === "partially_cancelled") return "warning";
  if (status === "booked" || status === "confirmed") return "success";
  return "neutral";
}
