"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import PageHero from "@/components/layout/page-hero";
import PageSection from "@/components/layout/page-section";
import LoadingState from "@/components/loading-state";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import { fetchUserBookingsThunk } from "@/features/booking/bookingSlice";
import { getUserDisplayName } from "@/utils/user-formatters";
import { buildBookingViewModel } from "@/utils/view-models";

const quickLinks = [
  {
    title: "Search trains",
    description: "Find available trains between your stations and compare timings.",
    href: "/search",
    cta: "Start search",
  },
  {
    title: "My bookings",
    description: "Review current trips, past journeys, and cancellation details.",
    href: "/bookings",
    cta: "View bookings",
  },
  {
    title: "Profile",
    description: "Check your account details used for train reservations.",
    href: "/account",
    cta: "Open profile",
  },
];

const highlights = [
  "Train search with station suggestions",
  "Separate results page for cleaner route comparison",
  "Booking history and account area",
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

  const latestBooking = useMemo(() => {
    if (!bookings.length) {
      return null;
    }

    const sorted = [...bookings].sort((left, right) => {
      const leftTime = new Date(left.booked_at || 0).getTime();
      const rightTime = new Date(right.booked_at || 0).getTime();
      return rightTime - leftTime;
    });

    return buildBookingViewModel(sorted[0]);
  }, [bookings]);

  if (!hydrated) {
    return (
      <main className="relative flex min-h-screen flex-1 overflow-hidden">
        <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8 sm:px-10 lg:px-12">
          <div className="mt-8">
            <LoadingState label="Preparing your dashboard..." />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(27,116,180,0.08),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(19,95,151,0.08),_transparent_28%)]" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8 sm:px-10 lg:px-12">
        <section className="grid flex-1 gap-8 py-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="space-y-8">
            <PageHero
              eyebrow="RailYatra Reservation Portal"
              title="Search trains, manage bookings, and keep every journey easy to follow."
              description="A cleaner reservation experience with clearer entry points for search, booking history, and profile tasks."
              meta={["Modern passenger dashboard", "Responsive booking flow", "Fast route discovery"]}
              actions={
                <>
                  <Button as={Link} href="/search" size="lg">
                    Search trains
                  </Button>
                  {isAuthenticated ? (
                    <Button as={Link} href="/bookings" variant="secondary" size="lg">
                      My bookings
                    </Button>
                  ) : (
                    <Button as={Link} href="/register" variant="secondary" size="lg">
                      Create account
                    </Button>
                  )}
                </>
              }
            />

            <div className="grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <Card key={item} tone="soft" className="rounded-[1.5rem] p-5">
                  <p className="text-sm leading-7 text-[var(--color-muted-strong)]">
                    {item}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <PageSection className="rounded-[2.25rem]">
              <Badge variant="primary">Account overview</Badge>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                {isAuthenticated
                  ? `Welcome back, ${displayName}`
                  : "Everything important stays within easy reach"}
              </h2>
              <p className="mt-3 text-base leading-8 text-[var(--color-muted)]">
                {isAuthenticated
                  ? "Use the shortcuts below to move between search, bookings, and your profile."
                  : "Create an account or sign in to access bookings, cancellations, and live train search."}
              </p>

              <div className="mt-6 grid gap-4">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-[1.5rem] border border-[var(--color-line)] bg-[linear-gradient(180deg,_#ffffff_0%,_#f9fcff_100%)] p-5 transition hover:-translate-y-0.5 hover:border-[rgba(19,95,151,0.18)] hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--color-ink)]">
                          {link.title}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                          {link.description}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#edf5fd] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-panel-dark)]">
                        {link.cta}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </PageSection>

            {isAuthenticated ? (
              <PageSection>
                <Badge variant="neutral">Latest booking</Badge>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                  Recent journey snapshot
                </h2>

                <div className="mt-5">
                  {status === "loading" ? (
                    <LoadingState label="Loading your latest booking..." />
                  ) : latestBooking ? (
                    <div className="rounded-[1.6rem] border border-[var(--color-line)] bg-[linear-gradient(180deg,_#ffffff_0%,_#f9fcff_100%)] p-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="primary">{latestBooking.reference}</Badge>
                        <Badge variant="neutral" className="px-4 py-2 text-xs">
                          {latestBooking.statusLabel}
                        </Badge>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[1.2rem] bg-[var(--color-surface-soft)] px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                            Booked on
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                            {latestBooking.bookedOnLabel}
                          </p>
                        </div>
                        <div className="rounded-[1.2rem] bg-[var(--color-surface-soft)] px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                            Total amount
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                            {latestBooking.paymentAmountLabel}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-[1.2rem] bg-[var(--color-surface-soft)] px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                          Seats
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                          {latestBooking.seatLabels.length
                            ? latestBooking.seatLabels.join(", ")
                            : "Seats will appear here after confirmation"}
                        </p>
                      </div>

                      <div className="mt-5">
                        <Button as={Link} href="/bookings" variant="secondary">
                          View all bookings
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[1.6rem] border border-dashed border-[var(--color-line)] bg-[var(--color-surface-soft)] px-5 py-8">
                      <p className="text-lg font-semibold text-[var(--color-ink)]">
                        No recent bookings yet
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                        Search trains and continue to booking to see your latest journey here.
                      </p>
                    </div>
                  )}
                </div>
              </PageSection>
            ) : null}

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] bg-[linear-gradient(180deg,_#145f97_0%,_#0e4770_100%)] p-5 text-white shadow-[0_24px_60px_rgba(12,79,129,0.16)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
                  Passenger flow
                </p>
                <p className="mt-3 text-lg font-semibold">
                  Search first, compare results, then continue to booking.
                </p>
              </div>
              <Card tone="soft" className="rounded-[1.75rem] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
                  Clean structure
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-ink)]">
                  Dashboard, bookings, profile, and search are now separated so the
                  product feels more reliable and easier to use.
                </p>
              </Card>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
