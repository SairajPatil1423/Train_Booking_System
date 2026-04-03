"use client";

import { useEffect, useMemo, useState } from "react";
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
  cancelBookingThunk,
  cancelTicketThunk,
  fetchUserBookingsThunk,
} from "@/features/booking/bookingSlice";
import { cn } from "@/utils/cn";
import { formatCurrency, formatDateTime, formatScheduleDateTime } from "@/utils/formatters";
import { toastError, toastSuccess } from "@/utils/toast";

export default function BookingsPage() {
  const dispatch = useDispatch();
  const { isAuthenticated, hydrated } = useSelector((state) => state.auth);
  const {
    userBookings: bookings,
    bookingsStatus: status,
    bookingsError: error,
    refundSummary,
  } = useSelector((state) => state.booking);

  const [processingAction, setProcessingAction] = useState("");
  const [cancelIntent, setCancelIntent] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (isAuthenticated && status === "idle") {
      dispatch(fetchUserBookingsThunk());
    }
  }, [dispatch, isAuthenticated, status]);

  const refundPreview = useMemo(() => {
    if (!cancelIntent) {
      return 0;
    }

    const amount = Number(cancelIntent.amount || 0);
    const ratio = estimateRefundRatio(cancelIntent.travelDate, cancelIntent.departureTime);
    return amount * ratio;
  }, [cancelIntent]);

  function openBookingCancelDialog(booking) {
    const activeAllocations = (booking.ticket_allocations || []).filter(
      (allocation) => allocation.status !== "cancelled",
    );

    setCancelReason("Change of plan");
    setCancelIntent({
      kind: "booking",
      bookingId: booking.id,
      label: booking.booking_ref || booking.booking_reference || "Booking",
      title: "Cancel full booking",
      subtitle: "This will cancel all active passengers in the booking.",
      amount: activeAllocations.reduce((sum, allocation) => sum + Number(allocation.fare || 0), 0),
      travelDate: booking.schedule?.travel_date,
      departureTime: booking.schedule?.departure_time,
      items: activeAllocations.map((allocation) => allocation.seat?.seat_number).filter(Boolean),
    });
  }

  function openTicketCancelDialog(booking, allocation) {
    setCancelReason("Passenger not travelling");
    setCancelIntent({
      kind: "ticket",
      bookingId: booking.id,
      ticketAllocationId: allocation.id,
      label: allocation.seat?.seat_number || allocation.pnr || "Ticket",
      title: "Cancel passenger ticket",
      subtitle: "Only this ticket will be cancelled. Remaining passengers will stay on the booking.",
      amount: allocation.fare,
      travelDate: booking.schedule?.travel_date,
      departureTime: booking.schedule?.departure_time,
      items: [allocation.seat?.seat_number].filter(Boolean),
    });
  }

  function closeCancelDialog() {
    if (processingAction) {
      return;
    }

    setCancelIntent(null);
    setCancelReason("");
  }

  async function handleConfirmCancellation() {
    if (!cancelIntent) {
      return;
    }

    const actionId =
      cancelIntent.kind === "booking"
        ? `booking:${cancelIntent.bookingId}`
        : `ticket:${cancelIntent.ticketAllocationId}`;

    setProcessingAction(actionId);

    try {
      if (cancelIntent.kind === "booking") {
        await dispatch(
          cancelBookingThunk({
            bookingId: cancelIntent.bookingId,
            reason: cancelReason,
          }),
        ).unwrap();
      } else {
        await dispatch(
          cancelTicketThunk({
            bookingId: cancelIntent.bookingId,
            ticketAllocationId: cancelIntent.ticketAllocationId,
            reason: cancelReason,
          }),
        ).unwrap();
      }

      toastSuccess(
        cancelIntent.kind === "booking"
          ? "Booking cancellation submitted successfully."
          : "Ticket cancellation submitted successfully.",
        "Cancellation saved",
      );
      setCancelIntent(null);
      setCancelReason("");
    } catch (requestError) {
      toastError(formatError(requestError), "Cancellation failed");
    } finally {
      setProcessingAction("");
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
          description="Review current and past bookings, cancel eligible journeys, and track the refund amount generated by each cancellation."
          meta={["Track payment status", "Review seat allocations", "Cancel booking or single tickets"]}
        />

        <PageSection className="p-8">
          {status === "loading" ? <LoadingState label="Loading your bookings..." /> : null}

          {refundSummary ? (
            <div className="mb-5 rounded-[1.2rem] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {refundSummary.type === "ticket" ? "Ticket cancelled." : "Booking cancelled."} Refund initiated:
              {" "}
              <span className="font-semibold">{formatCurrency(refundSummary.refundAmount)}</span>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formatError(error)}
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
            {bookings.map((booking) => {
              const activeAllocations = (booking.ticket_allocations || []).filter(
                (allocation) => allocation.status !== "cancelled",
              );
              const cancellationTotal = (booking.cancellations || []).reduce(
                (sum, cancellation) => sum + Number(cancellation.refund_amount || 0),
                0,
              );
              const canCancelBooking = booking.status === "booked" || booking.status === "confirmed";
              const canCancelTickets =
                booking.status === "booked" ||
                booking.status === "confirmed" ||
                booking.status === "partially_cancelled";

              return (
                <Card as="article" key={booking.id} className="rounded-[1.8rem] p-5">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="primary">
                          {booking.booking_ref || booking.booking_reference || "Booking"}
                        </Badge>
                        <StatusBadge status={booking.status} />
                        {booking.payment?.status ? (
                          <Badge variant="neutral">{booking.payment.status.replaceAll("_", " ")}</Badge>
                        ) : null}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-4">
                        <InfoBlock label="Booked on" value={formatDateTime(booking.booked_at)} />
                        <InfoBlock label="Passengers" value={String(booking.passengers?.length || 0)} />
                        <InfoBlock label="Paid amount" value={formatCurrency(booking.payment?.amount)} />
                        <InfoBlock label="Refunded" value={formatCurrency(cancellationTotal)} />
                      </div>

                      <div className="rounded-[1.25rem] bg-[var(--color-surface-soft)] px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                          Trip details
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
                        {(booking.ticket_allocations || []).map((allocation, index) => {
                          const passenger = booking.passengers?.find(
                            (item) => item.id === allocation.passenger_id,
                          ) || booking.passengers?.[index];
                          const ticketActionId = `ticket:${allocation.id}`;

                          return (
                            <div
                              key={allocation.id}
                              className="flex flex-col gap-3 rounded-[1.2rem] border border-[var(--color-line)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <p className="font-semibold text-[var(--color-ink)]">
                                  {passenger
                                    ? `${passenger.first_name} ${passenger.last_name}`
                                    : `Passenger ${index + 1}`}
                                </p>
                                <p className="mt-1 text-sm text-[var(--color-muted)]">
                                  Seat {allocation.seat?.seat_number || "NA"} • {allocation.pnr || "PNR pending"} • {formatCurrency(allocation.fare)}
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-wide text-[var(--color-muted)]">
                                  Ticket status: {allocation.status}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-3">
                                {allocation.status === "cancelled" ? (
                                  <Badge variant="danger">Cancelled</Badge>
                                ) : canCancelTickets ? (
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => openTicketCancelDialog(booking, allocation)}
                                    disabled={processingAction === ticketActionId}
                                  >
                                    {processingAction === ticketActionId ? "Cancelling..." : "Cancel ticket"}
                                  </Button>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="min-w-[15rem] space-y-4 rounded-[1.25rem] border border-[var(--color-line)] bg-white px-4 py-4 text-sm text-[var(--color-muted-strong)]">
                      <div>
                        <p className="font-semibold text-[var(--color-ink)]">Refund summary</p>
                        <p className="mt-2">
                          {booking.cancellations?.length
                            ? `${booking.cancellations.length} refund record(s)`
                            : "No refunds yet"}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-[var(--color-panel-dark)]">
                          {formatCurrency(cancellationTotal)}
                        </p>
                      </div>

                      {canCancelBooking && activeAllocations.length > 0 ? (
                        <Button
                          onClick={() => openBookingCancelDialog(booking)}
                          disabled={processingAction === `booking:${booking.id}`}
                          variant="danger"
                          size="sm"
                          className="w-full"
                        >
                          {processingAction === `booking:${booking.id}` ? "Cancelling..." : "Cancel full booking"}
                        </Button>
                      ) : null}

                      <Button as={Link} href="/cancellations" variant="secondary" size="sm" className="w-full">
                        View cancellations
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </PageSection>
      </div>

      <CancellationDrawer
        intent={cancelIntent}
        reason={cancelReason}
        onReasonChange={setCancelReason}
        onClose={closeCancelDialog}
        onConfirm={handleConfirmCancellation}
        refundPreview={refundPreview}
        processingAction={processingAction}
      />
    </PageShell>
  );
}

function CancellationDrawer({
  intent,
  reason,
  onReasonChange,
  onClose,
  onConfirm,
  refundPreview,
  processingAction,
}) {
  const isOpen = Boolean(intent);
  const isProcessing = Boolean(
    intent &&
      processingAction ===
        (intent.kind === "booking" ? `booking:${intent.bookingId}` : `ticket:${intent.ticketAllocationId}`),
  );

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!isOpen}
    >
      <div
        className={cn(
          "absolute inset-0 bg-slate-950/35 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 mx-auto w-full max-w-3xl px-4 pb-4 transition-transform sm:px-6",
          isOpen ? "translate-y-0" : "translate-y-full",
        )}
      >
        <Card tone="panel" className="rounded-[2rem] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
          {intent ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Cancellation preview</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                    {intent.title}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">{intent.subtitle}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isProcessing}>
                  Close
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <InfoBlock label="Reference" value={intent.label} />
                <InfoBlock label="Refund eligible amount" value={formatCurrency(intent.amount)} />
                <InfoBlock label="Estimated refund" value={formatCurrency(refundPreview)} />
              </div>

              <div className="rounded-[1.4rem] bg-[var(--color-surface-soft)] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                  Included seats
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                  {intent.items?.length ? intent.items.join(", ") : "This applies to the whole booking."}
                </p>
              </div>

              <div>
                <label className="field-label">Cancellation reason</label>
                <textarea
                  value={reason}
                  onChange={(event) => onReasonChange(event.target.value)}
                  rows={4}
                  placeholder="Tell us why you are cancelling"
                  className="field-input min-h-[7rem] resize-none"
                />
                <p className="field-hint">
                  Refund estimate follows the current policy based on hours left before departure.
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                The final refund recorded by the backend may vary slightly based on the exact departure time and cancellation moment.
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={onClose} disabled={isProcessing}>
                  Keep booking
                </Button>
                <Button type="button" variant="danger" onClick={onConfirm} disabled={isProcessing}>
                  {isProcessing ? "Cancelling..." : "Confirm cancellation"}
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
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

function estimateRefundRatio(travelDate, departureTime) {
  if (!travelDate || !departureTime) {
    return 0;
  }

  const datePart = String(travelDate).slice(0, 10);
  const timeMatch = String(departureTime).match(/(\d{2}:\d{2}:\d{2}|\d{2}:\d{2})/);
  const timePart = timeMatch ? timeMatch[1] : null;

  if (!datePart || !timePart) {
    return 0;
  }

  const departure = new Date(`${datePart}T${timePart.length === 5 ? `${timePart}:00` : timePart}`);
  const now = new Date();
  const hoursUntilDeparture = Math.floor((departure.getTime() - now.getTime()) / (1000 * 60 * 60));

  if (hoursUntilDeparture >= 24) {
    return 0.9;
  }

  if (hoursUntilDeparture >= 6) {
    return 0.5;
  }

  if (hoursUntilDeparture >= 1) {
    return 0.25;
  }

  return 0;
}

function formatError(error) {
  if (Array.isArray(error)) {
    return error.join(", ");
  }

  return String(error || "Something went wrong.");
}
