"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import EmptyState from "@/components/empty-state";
import LoadingState from "@/components/loading-state";
import PageShell from "@/components/page-shell";
import SectionHeader from "@/components/section-header";
import StatusBadge from "@/components/status-badge";
import { fetchUserBookings } from "@/features/booking/bookingService";
import { formatCurrency, formatDateTime } from "@/utils/formatters";

export default function BookingsPage() {
  const { isAuthenticated, hydrated } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    async function loadBookings() {
      setStatus("loading");
      setError("");

      try {
        const data = await fetchUserBookings();

        if (cancelled) {
          return;
        }

        setBookings(data.bookings || []);
        setStatus("succeeded");
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setStatus("failed");
        setError(
          requestError?.response?.data?.error || "Unable to load your bookings right now.",
        );
      }
    }

    loadBookings();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (!hydrated) {
    return (
      <PageShell className="items-center px-6 py-12 sm:px-10">
        <div className="w-full">
          <LoadingState label="Preparing your account..." />
        </div>
      </PageShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageShell className="items-center px-6 py-12 sm:px-10">
        <div className="surface-panel w-full rounded-[2rem] p-8">
          <SectionHeader
            eyebrow="Protected area"
            title="Sign in to view your bookings."
            description="Your tickets, travel details, and cancellations are available after login."
            actions={<Link href="/login" className="primary-button px-5 py-3 text-sm">Go to login</Link>}
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="w-full space-y-6">
        <section className="surface-panel rounded-[2rem] p-8">
          <SectionHeader
            eyebrow="My bookings"
            title="Your train journeys"
            description="Review current and past bookings, passenger details, and payment summaries."
          />
        </section>

        <section className="surface-panel rounded-[2rem] p-8">
          {status === "loading" ? <LoadingState label="Loading your bookings..." /> : null}

          {error ? (
            <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {status !== "loading" && !error && bookings.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              description="Once you book a train, your journey details will appear here."
              ctaLabel="Search trains"
              ctaHref="/search"
            />
          ) : null}

          <div className="space-y-4">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="rounded-[1.8rem] border border-[var(--color-line)] bg-[linear-gradient(180deg,_#ffffff_0%,_#f9fcff_100%)] p-5 shadow-[0_12px_34px_rgba(16,33,49,0.05)]"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-[#edf5fd] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--color-panel-dark)]">
                        {booking.booking_ref || booking.booking_reference || "Booking"}
                      </span>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <InfoBlock label="Booked on" value={formatDateTime(booking.booked_at)} />
                      <InfoBlock label="Passengers" value={String(booking.passengers?.length || 0)} />
                      <InfoBlock
                        label="Payment"
                        value={formatCurrency(booking.payment?.amount)}
                      />
                    </div>

                    <div className="rounded-[1.25rem] bg-[var(--color-surface-soft)] px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                        Passenger names
                      </p>
                      <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">
                        {(booking.passengers || [])
                          .map((passenger) => `${passenger.first_name} ${passenger.last_name}`)
                          .join(", ") || "Not available"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(booking.ticket_allocations || []).map((allocation) => (
                        <div
                          key={allocation.id}
                          className="rounded-full bg-[#eef6ff] px-4 py-2 text-sm font-medium text-[var(--color-panel-dark)]"
                        >
                          Seat {allocation.seat?.seat_number || "NA"} • {allocation.pnr || "PNR pending"}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="min-w-[13rem] rounded-[1.25rem] border border-[var(--color-line)] bg-white px-4 py-4 text-sm text-[var(--color-muted-strong)]">
                    <p className="font-semibold text-[var(--color-ink)]">Payment status</p>
                    <p className="mt-2">{booking.payment?.status || "Not available"}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className="rounded-[1.2rem] bg-[var(--color-surface-soft)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">{value}</p>
    </div>
  );
}
