"use client";

import { useEffect } from "react";
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
import { fetchUserBookingsThunk } from "@/features/booking/bookingSlice";
import { formatCurrency, formatDate, formatDateTime, formatScheduleDateTime } from "@/utils/formatters";

export default function CancellationsPage() {
  const dispatch = useDispatch();
  const { isAuthenticated, hydrated } = useSelector((state) => state.auth);
  const {
    userBookings: bookings,
    bookingsStatus: status,
    bookingsError: error,
    refundSummary,
  } = useSelector((state) => state.booking);

  useEffect(() => {
    if (isAuthenticated && status === "idle") {
      dispatch(fetchUserBookingsThunk());
    }
  }, [dispatch, isAuthenticated, status]);

  const bookingsWithCancellations = bookings.filter((booking) => (booking.cancellations || []).length > 0);

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
            title="Sign in to view your cancellations."
            description="Access your cancelled trips and refund status after logging in."
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
          eyebrow="My cancellations"
          title="Cancelled journeys and refund history"
          description="Track full-booking cancellations, passenger-ticket cancellations, and the refund amount initiated for each cancelled item."
          meta={["Refund visibility", "Cancelled ticket history", "Booking and ticket level records"]}
        />

        <PageSection className="p-8">
          {status === "loading" ? <LoadingState label="Loading your cancellation history..." /> : null}

          {refundSummary ? (
            <div className="mb-5 rounded-[1.2rem] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Latest refund initiated:
              {" "}
              <span className="font-semibold">{formatCurrency(refundSummary.refundAmount)}</span>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formatError(error)}
            </div>
          ) : null}

          {status !== "loading" && !error && bookingsWithCancellations.length === 0 ? (
            <EmptyState
              title="No cancellations found"
              description="Cancelled bookings and ticket refund records will appear here for your reference."
              ctaLabel="View all bookings"
              ctaHref="/bookings"
            />
          ) : null}

          <div className="space-y-4">
            {bookingsWithCancellations.map((booking) => {
              const totalRefund = (booking.cancellations || []).reduce(
                (sum, cancellation) => sum + Number(cancellation.refund_amount || 0),
                0,
              );

              return (
                <Card as="article" key={booking.id} className="rounded-[1.8rem] p-5">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="neutral">
                          {booking.booking_ref || booking.booking_reference || "Booking"}
                        </Badge>
                        <StatusBadge status={booking.status} />
                        <Badge variant="warning">{booking.cancellations.length} refund record(s)</Badge>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-4">
                        <InfoBlock label="Booked on" value={formatDateTime(booking.booked_at)} />
                        <InfoBlock label="Travel date" value={formatDate(booking.schedule?.travel_date)} />
                        <InfoBlock label="Refund total" value={formatCurrency(totalRefund)} />
                        <InfoBlock label="Payment state" value={booking.payment?.status || "Not available"} />
                      </div>

                      <div className="rounded-[1.25rem] bg-[var(--color-surface-soft)] px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                          Trip segment
                        </p>
                        <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">
                          {booking.schedule?.train?.name || "Train details unavailable"}
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">
                          {booking.src_station?.name || "Source"} to {booking.dst_station?.name || "Destination"}
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">
                          {formatScheduleDateTime(
                            booking.schedule?.travel_date,
                            booking.schedule?.departure_time,
                          )}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {(booking.cancellations || []).map((cancellation) => {
                          const allocation = booking.ticket_allocations?.find(
                            (item) => item.id === cancellation.ticket_allocation_id,
                          );

                          return (
                            <div
                              key={cancellation.id}
                              className="rounded-[1.2rem] border border-[var(--color-line)] bg-white px-4 py-4"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="font-semibold text-[var(--color-ink)]">
                                    {allocation?.seat?.seat_number
                                      ? `Seat ${allocation.seat.seat_number}`
                                      : "Booking-level cancellation"}
                                  </p>
                                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                                    Reason: {cancellation.reason || "User requested cancellation"}
                                  </p>
                                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                                    Status: {cancellation.status}
                                  </p>
                                </div>

                                <div className="rounded-full bg-[#edf5fd] px-4 py-2 text-sm font-medium text-[var(--color-panel-dark)]">
                                  Refund {formatCurrency(cancellation.refund_amount)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="min-w-[14rem] rounded-[1.25rem] border border-dashed border-[var(--color-line)] bg-white px-4 py-4 text-sm text-[var(--color-muted-strong)]">
                      <p className="font-semibold text-red-600">Refund processing</p>
                      <p className="mt-2 leading-relaxed">
                        Refunds are recorded against the cancelled booking or ticket and reflected in the payment status once processed.
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
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

function formatError(error) {
  if (Array.isArray(error)) {
    return error.join(", ");
  }

  return String(error || "Something went wrong.");
}
