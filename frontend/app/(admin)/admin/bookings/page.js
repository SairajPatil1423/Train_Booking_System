"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminBookingsThunk } from "@/features/admin/adminSlice";
import PageHero from "@/components/layout/page-hero";
import PageSection from "@/components/layout/page-section";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import LoadingState from "@/components/loading-state";
import Card from "@/components/ui/card";
import { AdminErrorBox, AdminInfoBlock } from "@/components/admin/admin-ui";
import { BookingsSummaryRail } from "@/components/admin/admin-dashboard-widgets";
import PaginationToolbar from "@/components/ui/pagination-toolbar";
import { usePaginatedRouteState } from "@/hooks/use-paginated-route-state";
import { formatBookingStatus, formatCurrency, formatDate } from "@/utils/formatters";

export default function AdminBookingsPage() {
  const dispatch = useDispatch();
  const { bookings, bookingsMeta, resources } = useSelector((state) => state.admin);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const bookingsStatus = resources.bookings.status;
  const bookingsError = resources.bookings.error;
  const { currentPage, currentPerPage, setPage, setPerPage } = usePaginatedRouteState({
    totalPages: bookingsMeta.totalPages,
    status: bookingsStatus,
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      dispatch(fetchAdminBookingsThunk({ page: currentPage, perPage: currentPerPage }));
    }
  }, [currentPage, currentPerPage, dispatch, isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-5xl flex-1 items-center px-6 py-12 sm:px-10">
        <div className="surface-panel w-full rounded-[2rem] p-8 text-center">
          <p className="inline-flex rounded-full bg-[var(--color-danger-soft)] px-3 py-1 text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-danger)]">
            Unauthorized Access
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
      <div className="space-y-6">
        <PageHero
          eyebrow="Booking operations"
          title="Bookings"
          meta={[
            `${bookingsMeta.totalCount || bookings.length} bookings`,
            bookingsStatus === "loading" ? "Refreshing" : `Page ${bookingsMeta.page}`,
          ]}
        />

        <BookingsSummaryRail bookings={bookings} />

        <PageSection className="p-6 sm:p-8">
          <div className="flex flex-col gap-3 border-b border-[var(--color-line)] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                All bookings
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                Records
              </h2>
            </div>
            <Badge variant="neutral" className="w-fit">
              {bookingsStatus === "loading" ? "Refreshing..." : `${bookingsMeta.totalCount || bookings.length} rows`}
            </Badge>
          </div>

          {bookingsStatus === "loading" && bookings.length === 0 ? (
            <div className="pt-6">
              <LoadingState label="Loading bookings..." />
            </div>
          ) : null}
          {bookingsStatus === "loading" && bookings.length > 0 ? (
            <div className="pt-6 text-sm font-medium text-[var(--color-muted)]">Loading page {currentPage}...</div>
          ) : null}
          <AdminErrorBox message={Array.isArray(bookingsError) ? bookingsError.join(", ") : bookingsError} />

          {bookings.length > 0 ? (
            <div className="space-y-4 pt-6">
              {bookings.map((booking) => (
                <Card key={booking.id} className="rounded-[1.8rem] p-5 sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-panel-dark)]">
                        {booking.booking_ref || booking.booking_reference}
                      </p>
                      <p className="mt-3 text-xl font-semibold text-[var(--color-ink)]">
                        {booking.user?.email || "User account"}
                      </p>
                      <p className="mt-2 text-sm text-[var(--color-muted)]">
                        Booked on {formatDate(booking.booked_at || booking.created_at)}
                      </p>
                      <p className="mt-2 text-sm text-[var(--color-muted)]">
                        {booking.schedule?.train?.name || "Train"} • {booking.src_station?.name || "Source"} to {booking.dst_station?.name || "Destination"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant={statusVariant(booking.status)} className="px-4 py-2 text-xs sm:text-sm">
                        {formatBookingStatus(booking.status)}
                      </Badge>
                      <Badge variant="neutral" className="px-4 py-2 text-xs sm:text-sm">
                        {booking.user?.role || "user"}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <AdminInfoBlock label="Passengers" value={`${booking.passengers?.length || 0} travelers`} />
                    <AdminInfoBlock label="Total fare" value={formatCurrency(booking.total_fare)} accent />
                    <AdminInfoBlock
                      label="Refunded"
                      value={formatCurrency(
                        (booking.cancellations || []).reduce(
                          (sum, cancellation) => sum + Number(cancellation.refund_amount || 0),
                          0,
                        ),
                      )}
                    />
                    <AdminInfoBlock label="Status" value={formatBookingStatus(booking.status)} />
                  </div>
                </Card>
              ))}
            </div>
          ) : null}

          {bookings.length === 0 && bookingsStatus !== "loading" ? (
            <div className="pt-6">
              <EmptyState
                title="No bookings found"
              />
            </div>
          ) : null}

          {bookings.length > 0 ? (
            <div className="pt-6">
              <PaginationToolbar
                page={bookingsMeta.page}
                perPage={bookingsMeta.perPage}
                totalCount={bookingsMeta.totalCount || bookings.length}
                totalPages={bookingsMeta.totalPages}
                onPageChange={setPage}
                onPerPageChange={setPerPage}
                disabled={bookingsStatus === "loading"}
                loading={bookingsStatus === "loading"}
              />
            </div>
          ) : null}
        </PageSection>
      </div>
    </main>
  );
}

function statusVariant(status) {
  if (status === "booked" || status === "confirmed") {
    return "success";
  }

  if (status === "cancelled") {
    return "danger";
  }

  return "warning";
}
