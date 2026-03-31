"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import LoadingState from "@/components/loading-state";
import { fetchUserBookings } from "@/features/booking/bookingService";
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
  const { isAuthenticated, user, hydrated } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [bookingStatus, setBookingStatus] = useState("idle");

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    async function loadBookings() {
      setBookingStatus("loading");

      try {
        const data = await fetchUserBookings();

        if (cancelled) {
          return;
        }

        setBookings(data.bookings || []);
        setBookingStatus("succeeded");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setBookingStatus("failed");
      }
    }

    loadBookings();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

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
            <div className="inline-flex rounded-full border border-[var(--color-line)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-muted-strong)] shadow-[0_10px_28px_rgba(16,33,49,0.04)]">
              Cleaner online reservation flow for train journeys
            </div>

            <div className="space-y-5">
              <p className="eyebrow">RailYatra Reservation Portal</p>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.04] tracking-tight text-[var(--color-ink)] sm:text-6xl">
                Search trains, manage bookings, and keep your travel details organised.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--color-muted)] sm:text-lg">
                A white-and-blue reservation experience designed to keep search,
                results, and account actions easy to follow.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/search" className="primary-button px-6 py-3.5 text-sm">
                Search trains
              </Link>
              {isAuthenticated ? (
                <Link href="/bookings" className="secondary-button px-6 py-3.5 text-sm">
                  My bookings
                </Link>
              ) : (
                <Link href="/register" className="secondary-button px-6 py-3.5 text-sm">
                  Create account
                </Link>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item} className="surface-card rounded-[1.5rem] p-5">
                  <p className="text-sm leading-7 text-[var(--color-muted-strong)]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <section className="surface-panel rounded-[2.25rem] p-6">
              <p className="eyebrow">Account overview</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                {isAuthenticated
                  ? `Welcome back, ${user?.email || "traveller"}`
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
                    className="rounded-[1.5rem] border border-[var(--color-line)] bg-[linear-gradient(180deg,_#ffffff_0%,_#f9fcff_100%)] p-5 transition hover:border-[rgba(19,95,151,0.18)] hover:bg-white"
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
            </section>

            {isAuthenticated ? (
              <section className="surface-panel rounded-[2rem] p-6">
                <p className="eyebrow">Latest booking</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                  Recent journey snapshot
                </h2>

                <div className="mt-5">
                  {bookingStatus === "loading" ? (
                    <LoadingState label="Loading your latest booking..." />
                  ) : latestBooking ? (
                    <div className="rounded-[1.6rem] border border-[var(--color-line)] bg-[linear-gradient(180deg,_#ffffff_0%,_#f9fcff_100%)] p-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-[#edf5fd] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--color-panel-dark)]">
                          {latestBooking.reference}
                        </span>
                        <span className="rounded-full bg-[#f4f7fb] px-4 py-2 text-sm font-medium text-[var(--color-muted-strong)]">
                          {latestBooking.statusLabel}
                        </span>
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
                        <Link href="/bookings" className="secondary-button px-5 py-3 text-sm">
                          View all bookings
                        </Link>
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
              </section>
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
              <div className="surface-card rounded-[1.75rem] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
                  Clean structure
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-ink)]">
                  Dashboard, bookings, profile, and search are now separated so the
                  product feels more reliable and easier to use.
                </p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
