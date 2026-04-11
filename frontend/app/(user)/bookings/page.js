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
import PaginationToolbar from "@/components/ui/pagination-toolbar";
import BoardingPassCard from "@/components/animations/boarding-pass-card";
import { cancelBookingThunk, cancelTicketThunk, fetchUserBookingsThunk } from "@/features/booking/bookingSlice";
import { usePaginatedRouteState } from "@/hooks/use-paginated-route-state";
import { cn } from "@/utils/cn";
import { formatErrorMessage } from "@/utils/errors";
import { formatCurrency, formatDate, formatDateTime, formatScheduleDateTimeWithOffset } from "@/utils/formatters";
import { toastError, toastSuccess } from "@/utils/toast";
import PageFade from "@/components/animations/page-fade";
import { StaggerList, StaggerItem } from "@/components/animations/stagger-list";

export default function BookingsPage() {
  const dispatch = useDispatch();
  const { isAuthenticated, hydrated } = useSelector((state) => state.auth);
  const {
    userBookings: bookings,
    bookingsStatus: status,
    bookingsError: error,
    bookingsMeta,
    refundSummary,
  } = useSelector((state) => state.booking);
  const { currentPage, currentPerPage, setPage, setPerPage } = usePaginatedRouteState({
    totalPages: bookingsMeta.totalPages,
    status,
  });

  const [processingAction, setProcessingAction] = useState("");
  const [cancelIntent, setCancelIntent] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserBookingsThunk({ page: currentPage, perPage: currentPerPage }));
    }
  }, [currentPage, currentPerPage, dispatch, isAuthenticated]);

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

    const segmentTiming = booking.segment_timing || {};
    setCancelReason("Change of plan");
    setCancelIntent({
      kind: "booking",
      bookingId: booking.id,
      label: booking.booking_ref || booking.booking_reference || "Booking",
      title: "Cancel full booking",
      subtitle: "This will cancel all active passengers in the booking.",
      amount: activeAllocations.reduce((sum, allocation) => sum + Number(allocation.fare || 0), 0),
      travelDate: booking.schedule?.travel_date,
      departureTime: segmentTiming.departure_time || booking.schedule?.departure_time,
      items: activeAllocations.map((allocation) => allocation.seat?.seat_number).filter(Boolean),
    });
  }

  function openTicketCancelDialog(booking, allocation) {
    const segmentTiming = booking.segment_timing || {};
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
      departureTime: segmentTiming.departure_time || booking.schedule?.departure_time,
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
      toastError(formatErrorMessage(requestError), "Cancellation failed");
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
      <PageFade>
      <div className="w-full space-y-6">
        <PageHero
          eyebrow="Bookings"
          title="My Bookings"
          meta={[`${bookingsMeta.totalCount || bookings.length} bookings`, `Page ${bookingsMeta.page}`]}
        />

        <PageSection className="p-8">
          {status === "loading" && bookings.length === 0 ? <LoadingState label="Loading your bookings..." /> : null}
          {status === "loading" && bookings.length > 0 ? (
            <div className="mb-5 text-sm font-medium text-[var(--color-muted)]">Loading page {currentPage}...</div>
          ) : null}

          {refundSummary ? (
            <div className="mb-5 rounded-[1.2rem] border border-[color-mix(in_srgb,var(--color-success)_26%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-success-soft)_82%,var(--color-panel-strong))] px-4 py-3 text-sm text-[var(--color-success)]">
              {refundSummary.type === "ticket" ? "Ticket cancelled" : "Booking cancelled"}:
              {" "}
              <span className="font-semibold">{formatCurrency(refundSummary.refundAmount)}</span>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[1.2rem] border border-[color-mix(in_srgb,var(--color-danger)_26%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-danger-soft)_84%,var(--color-panel-strong))] px-4 py-3 text-sm text-[var(--color-danger)]">
              {formatErrorMessage(error)}
            </div>
          ) : null}

          {status !== "loading" && !error && bookings.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              ctaLabel="Search trains"
              ctaHref="/search"
            />
          ) : null}

          {bookings.length > 0 ? null : null}

          <StaggerList className="space-y-4">
            {bookings.map((booking) => {
              const segmentTiming = booking.segment_timing || {};
              const departureLabel = formatScheduleDateTimeWithOffset(
                booking.schedule?.travel_date,
                segmentTiming.departure_time || booking.schedule?.departure_time,
                segmentTiming.departure_day_offset || 0,
              );
              const arrivalLabel = formatScheduleDateTimeWithOffset(
                booking.schedule?.travel_date,
                segmentTiming.arrival_time || booking.schedule?.expected_arrival_time,
                segmentTiming.arrival_day_offset || 0,
              );
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
                <StaggerItem key={booking.id}>
                <BoardingPassCard status={booking.status} className="h-full">
                  <div className="flex flex-col p-5 bg-gradient-to-br from-[var(--color-surface-soft)] to-transparent h-full relative">
                    <div className="space-y-4">
                      {/* Header — ref + status badges */}
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="primary" className="font-mono text-[11px] px-3 py-1.5 uppercase shadow-[0_0_8px_var(--color-accent-soft)]">
                          {booking.booking_ref || booking.booking_reference || "Booking"}
                        </Badge>
                        <StatusBadge status={booking.status} />
                        {booking.payment?.status ? (
                          <Badge variant="neutral" className="bg-white/5 border border-white/10 text-[var(--color-muted-strong)] text-[10px] uppercase">
                            {booking.payment.status.replaceAll("_", " ")}
                          </Badge>
                        ) : null}
                      </div>

                      {/* ── JOURNEY HERO — full-width, visually dominant ── */}
                      <div className="rounded-[1.4rem] border border-[var(--color-line)] bg-[linear-gradient(135deg,_color-mix(in_srgb,var(--color-accent)_10%,transparent)_0%,_rgba(0,0,0,0.4)_100%)] p-5 shadow-inner">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge variant="primary" className="px-3 py-1.5 text-[11px] bg-[var(--color-accent)]/20 text-[var(--color-accent)] border-[var(--color-accent)]/30">
                            {booking.schedule?.train?.train_number || "Train"}
                          </Badge>
                          <Badge variant="neutral" className="px-3 py-1.5 text-[11px] bg-white/5">
                            {booking.schedule?.train?.train_type || "Service"}
                          </Badge>
                          <span className="text-xs font-mono text-[var(--color-accent)] shadow-sm">{formatDate(booking.schedule?.travel_date)}</span>
                        </div>

                        <p className="mt-3 text-2xl font-extrabold tracking-tight text-white drop-shadow-md">
                          {booking.schedule?.train?.name || "Train details unavailable"}
                        </p>

                        {/* From → To with times */}
                        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                          <JourneyStopCard
                            title="From"
                            stationName={booking.src_station?.name || "Source"}
                            stationCode={booking.src_station?.code}
                            timeLabel={departureLabel}
                          />
                          <div className="flex flex-col items-center justify-center opacity-70">
                            <span className="text-[10px] tracking-widest text-[var(--color-muted)] font-mono mb-1">ROUTE</span>
                            <div className="w-full flex items-center justify-center">
                               <div className="h-px border-t border-dashed border-[var(--color-accent)] w-12" />
                               <span className="text-[var(--color-accent)] mx-1">✈</span>
                               <div className="h-px border-t border-dashed border-[var(--color-accent)] w-12" />
                            </div>
                          </div>
                          <JourneyStopCard
                            title="To"
                            stationName={booking.dst_station?.name || "Destination"}
                            stationCode={booking.dst_station?.code}
                            timeLabel={arrivalLabel}
                            align="right"
                          />
                        </div>

                        {/* Journey meta chips */}
                        <div className="mt-6 grid gap-2 sm:grid-cols-4 bg-black/40 rounded-[1rem] p-3 border border-white/5">
                          <InfoBlock label="Passengers" value={String(booking.passengers?.length || 0)} />
                          <InfoBlock label="Paid" value={formatCurrency(booking.payment?.amount)} />
                          <InfoBlock label="Booked on" value={formatDate(booking.booked_at)} />
                          <InfoBlock
                            label="Active seats"
                            value={
                              activeAllocations.length
                                ? activeAllocations.map((a) => a.seat?.seat_number).filter(Boolean).join(", ")
                                : "—"
                            }
                          />
                        </div>
                      </div>

                      {/* Passenger ticket rows */}
                      <div className="space-y-2 mt-2">
                        <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--color-muted)] uppercase mb-2">Ticket Details</p>
                        {(booking.ticket_allocations || []).map((allocation, index) => {
                          const passenger = booking.passengers?.find(
                            (item) => item.id === allocation.passenger_id,
                          ) || booking.passengers?.[index];
                          const ticketActionId = `ticket:${allocation.id}`;

                          return (
                            <div
                              key={allocation.id}
                              className="flex flex-col gap-3 rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-surface-strong)]/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between hover:bg-white/5 transition-colors"
                            >
                              <div>
                                <p className="font-bold text-white tracking-wide">
                                  {passenger
                                    ? `${passenger.first_name} ${passenger.last_name}`
                                    : `Passenger ${index + 1}`}
                                </p>
                                <p className="mt-1 text-sm font-mono text-[var(--color-accent-strong)]">
                                  Seat {allocation.seat?.seat_number || "NA"} <span className="text-[var(--color-muted)] mx-2">|</span> PNR: {allocation.pnr || "PENDING"} <span className="text-[var(--color-muted)] mx-2">|</span> {formatCurrency(allocation.fare)}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {allocation.status === "cancelled" ? (
                                  <Badge variant="danger" className="bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20 shadow-[0_0_10px_var(--color-danger-soft)]">Cancelled</Badge>
                                ) : canCancelTickets ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); openTicketCancelDialog(booking, allocation); }}
                                    disabled={processingAction === ticketActionId}
                                    className="text-xs text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 hover:border-transparent transition-all border border-[var(--color-danger)]/30 rounded-full h-8"
                                  >
                                    {processingAction === ticketActionId ? "Cancelling..." : "Cancel ticket"}
                                  </Button>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer — refund chip + cancel booking (de-emphasized) */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-line)] pt-4 mt-2">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted-strong)]">
                          {cancellationTotal > 0 ? (
                            <span>Refunded: <span className="font-bold text-[var(--color-success)] shadow-sm drop-shadow-[0_0_8px_var(--color-success-soft)]">{formatCurrency(cancellationTotal)}</span></span>
                          ) : (
                            <span className="font-mono text-[10px] tracking-widest opacity-60">NO REFUNDS ISSUED</span>
                          )}
                          <Button as={Link} href="/cancellations" variant="ghost" size="sm" className="text-[11px] underline underline-offset-4 hover:text-[var(--color-accent)] hover:bg-transparent px-0 h-auto">
                            View cancellations
                          </Button>
                        </div>
                        {canCancelBooking && activeAllocations.length > 0 ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); openBookingCancelDialog(booking); }}
                            disabled={processingAction === `booking:${booking.id}`}
                            className="text-xs text-[var(--color-muted)] hover:text-white transition-opacity opacity-50 hover:opacity-100"
                          >
                            {processingAction === `booking:${booking.id}` ? "Cancelling..." : "Cancel entire booking"}
                          </Button>
                        ) : null}
                      </div>

                      {/* QR Barcode illusion */}
                      <div className="absolute right-4 bottom-4 opacity-10 blur-[0.5px] pointer-events-none hidden sm:block mix-blend-screen">
                        <div className="w-16 h-16 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMSIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTMgM2g2djZIM3oiPjwvcGF0aD48cGF0aCBkPSJNMTEgM2gydiIyPjwvcGF0aD48cGF0aCBkPSJNMTUgM2g2djZIMTV6Ij48L3BhdGg+PHBhdGggZD0iTTMgMTVoNnY2SDN6Ij48L3BhdGg+PHBhdGggZD0iTTExIDEyaDJ2MnoiPjwvcGF0aD48cGF0aCBkPSJNMTUgMTVoMnY2aDEwdjJoMnoiPjwvcGF0aD48L3N2Zz4=')] bg-cover opacity-50" />
                      </div>
                    </div>
                  </div>
                </BoardingPassCard>
                </StaggerItem>
              );
            })}
          </StaggerList>

          {bookings.length > 0 ? (
            <div className="pt-6">
              <PaginationToolbar
                page={bookingsMeta.page}
                perPage={bookingsMeta.perPage}
                totalCount={bookingsMeta.totalCount || bookings.length}
                totalPages={bookingsMeta.totalPages}
                onPageChange={setPage}
                onPerPageChange={setPerPage}
                disabled={status === "loading"}
                loading={status === "loading"}
              />
            </div>
          ) : null}
        </PageSection>
      </div>
      </PageFade>

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

              <div className="rounded-[1.4rem] border border-[color-mix(in_srgb,var(--color-warning)_24%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-warning-soft)_82%,var(--color-panel-strong))] px-4 py-4 text-sm text-[var(--color-warning)]">
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

function JourneyStopCard({ title, stationName, stationCode, timeLabel, align = "left" }) {
  const alignmentClass = align === "right" ? "md:text-right" : "";

  return (
    <div className={cn("rounded-[1.2rem] bg-[var(--color-surface-soft)] px-4 py-4", alignmentClass)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
        {title}
      </p>
      <p className="mt-2 text-base font-semibold text-[var(--color-ink)]">
        {stationName}
      </p>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-muted)]">
        {stationCode || "N/A"}
      </p>
      <p className="mt-3 text-sm font-semibold text-[var(--color-panel-dark)]">
        {timeLabel}
      </p>
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
