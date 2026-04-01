"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import EmptyState from "@/components/empty-state";
import PageHero from "@/components/layout/page-hero";
import PageSection from "@/components/layout/page-section";
import LoadingState from "@/components/loading-state";
import PageShell from "@/components/page-shell";
import StatusBadge from "@/components/status-badge";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import { 
  fetchUserBookingsThunk, 
  cancelBookingThunk 
} from "@/features/booking/bookingSlice";
import { formatCurrency, formatDateTime } from "@/utils/formatters";

export default function BookingsPage() {
  const dispatch = useDispatch();
  const { isAuthenticated, hydrated } = useSelector((state) => state.auth);
  const { 
    userBookings: bookings, 
    bookingsStatus: status, 
    bookingsError: error 
  } = useSelector((state) => state.booking);

  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (isAuthenticated && status === "idle") {
      dispatch(fetchUserBookingsThunk());
    }
  }, [dispatch, isAuthenticated, status]);

  async function handleCancel(bookingId) {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await dispatch(cancelBookingThunk(bookingId)).unwrap();
    } catch (err) {
      alert(err || "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  }

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
        <PageSection className="w-full">
          <PageHero
            eyebrow="Protected area"
            title="Sign in to view your bookings."
            description="Your tickets, travel details, and cancellations are available after login."
            actions={<Button as={Link} href="/login">Go to login</Button>}
          />
        </PageSection>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="w-full space-y-6">
        <PageHero
          eyebrow="My bookings"
          title="Your train journeys"
          description="Review current and past bookings, passenger details, and payment summaries."
          meta={["Track payment status", "Review seat allocations", "Cancel eligible bookings"]}
        />

        <PageSection className="p-8">
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
              <Card
                as="article"
                key={booking.id}
                className="rounded-[1.8rem] p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="primary">
                        {booking.booking_ref || booking.booking_reference || "Booking"}
                      </Badge>
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

                  <div className="min-w-[13rem] space-y-4 rounded-[1.25rem] border border-[var(--color-line)] bg-white px-4 py-4 text-sm text-[var(--color-muted-strong)]">
                    <div>
                      <p className="font-semibold text-[var(--color-ink)]">Payment status</p>
                      <p className="mt-2 uppercase tracking-wide text-[var(--color-accent)]">{booking.payment?.status || "Not available"}</p>
                    </div>
                    
                    {booking.status === "booked" && (
                      <Button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        variant="danger"
                        size="sm"
                        className="w-full"
                      >
                        {cancellingId === booking.id ? "Cancelling..." : "Cancel booking"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </PageSection>
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
