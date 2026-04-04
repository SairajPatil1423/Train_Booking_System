"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { fetchUserCancellationsThunk } from "@/features/booking/bookingSlice";
import { formatCurrency, formatDate, formatDateTime, formatScheduleDateTime } from "@/utils/formatters";

const DEFAULT_PAGE_SIZE = 10;

export default function CancellationsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, hydrated } = useSelector((state) => state.auth);
  const {
    cancellations: bookings,
    cancellationsStatus: status,
    cancellationsError: error,
    cancellationsMeta,
    refundSummary,
  } = useSelector((state) => state.booking);
  const requestedPage = Number(searchParams.get("page") || 1);
  const requestedPerPage = Number(searchParams.get("per_page") || DEFAULT_PAGE_SIZE);
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const currentPerPage =
    Number.isFinite(requestedPerPage) && requestedPerPage > 0 ? requestedPerPage : DEFAULT_PAGE_SIZE;

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserCancellationsThunk({ page: currentPage, perPage: currentPerPage }));
    }
  }, [currentPage, currentPerPage, dispatch, isAuthenticated]);

  useEffect(() => {
    if (
      status === "succeeded" &&
      cancellationsMeta.totalPages > 0 &&
      currentPage > cancellationsMeta.totalPages
    ) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(cancellationsMeta.totalPages));
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [cancellationsMeta.totalPages, status, currentPage, pathname, router, searchParams]);

  function handlePageChange(nextPage) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    params.set("per_page", String(currentPerPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  function handlePerPageChange(nextPerPage) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    params.set("per_page", String(nextPerPage));
    router.push(`${pathname}?${params.toString()}`);
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
          eyebrow="Cancellations"
          title="My Cancellations"
          meta={[`${cancellationsMeta.totalCount || bookings.length} records`, `Page ${cancellationsMeta.page}`]}
        />

        <PageSection className="p-8">
          {status === "loading" && bookings.length === 0 ? <LoadingState label="Loading your cancellation history..." /> : null}
          {status === "loading" && bookings.length > 0 ? (
            <div className="mb-5 text-sm font-medium text-[var(--color-muted)]">Loading page {currentPage}...</div>
          ) : null}

          {refundSummary ? (
            <div className="mb-5 rounded-[1.2rem] border border-[color-mix(in_srgb,var(--color-success)_26%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-success-soft)_82%,var(--color-panel-strong))] px-4 py-3 text-sm text-[var(--color-success)]">
              Refund:
              {" "}
              <span className="font-semibold">{formatCurrency(refundSummary.refundAmount)}</span>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[1.2rem] border border-[color-mix(in_srgb,var(--color-danger)_26%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-danger-soft)_84%,var(--color-panel-strong))] px-4 py-3 text-sm text-[var(--color-danger)]">
              {formatError(error)}
            </div>
          ) : null}

          {status !== "loading" && !error && bookings.length === 0 ? (
            <EmptyState
              title="No cancellations found"
              ctaLabel="View all bookings"
              ctaHref="/bookings"
            />
          ) : null}

          <div className="space-y-4">
            {bookings.map((booking) => {
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
                          Journey
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
                              className="rounded-[1.2rem] border border-[var(--color-line)] bg-[var(--color-surface-strong)] px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="font-semibold text-[var(--color-ink)]">
                                    {allocation?.seat?.seat_number
                                      ? `Seat ${allocation.seat.seat_number}`
                                      : "Booking-level cancellation"}
                                  </p>
                                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                                    {cancellation.reason || "Cancelled"}
                                  </p>
                                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                                    {cancellation.status}
                                  </p>
                                </div>

                                <div className="rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-sm font-medium text-[var(--color-panel-dark)]">
                                  {formatCurrency(cancellation.refund_amount)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="min-w-[14rem] rounded-[1.25rem] border border-dashed border-[var(--color-line)] bg-[var(--color-surface-strong)] px-4 py-4 text-sm text-[var(--color-muted-strong)] shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                      <p className="font-semibold text-[var(--color-danger)]">Processing</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {bookings.length > 0 ? (
            <div className="pt-6">
              <PaginationToolbar
                page={cancellationsMeta.page}
                perPage={cancellationsMeta.perPage}
                totalCount={cancellationsMeta.totalCount || bookings.length}
                totalPages={cancellationsMeta.totalPages}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
                disabled={status === "loading"}
                loading={status === "loading"}
              />
            </div>
          ) : null}
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
