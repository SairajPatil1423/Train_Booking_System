"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fetchAdminBookingsThunk,
  searchAdminBookingsThunk,
  clearBookingsSearch,
} from "@/features/admin/adminSlice";
import { bookingSearchSchema } from "@/features/admin/schemas";
import PageHero from "@/components/layout/page-hero";
import PageSection from "@/components/layout/page-section";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import LoadingState from "@/components/loading-state";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { AdminErrorBox, AdminInfoBlock } from "@/components/admin/admin-ui";
import { BookingsSummaryRail } from "@/components/admin/admin-dashboard-widgets";
import SearchPagination from "@/components/ui/search-pagination";
import { formatBookingStatus, formatCurrency, formatDate } from "@/utils/formatters";

export default function AdminBookingsPage() {
  const dispatch = useDispatch();
  const { bookings, bookingsMeta, bookingsSearch, resources } = useSelector((state) => state.admin);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const isSearchMode = bookingsSearch.status === "succeeded" || bookingsSearch.status === "loading";
  const displayRecords = isSearchMode ? bookingsSearch.results : bookings;
  const displayMeta = isSearchMode ? bookingsSearch.meta : bookingsMeta;
  const searchStatus = bookingsSearch.status;
  const searchError = bookingsSearch.error;
  const listStatus = resources.bookings.status;

  const [searchPage, setSearchPage] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(bookingSearchSchema), defaultValues: { user_email: "" } });

  // Load all bookings on mount
  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchAdminBookingsThunk({ page: 1, perPage: 10 }));
    }
  }, [dispatch, listStatus]);

  function onSearch(data) {
    const params = { user_email: data.user_email, page: 1, perPage: 10 };
    setSearchPage(1);
    dispatch(searchAdminBookingsThunk(params));
  }

  function onSearchPageChange(nextPage) {
    setSearchPage(nextPage);
    const searchParams = bookingsSearch.searchParams;
    dispatch(searchAdminBookingsThunk({ ...searchParams, page: nextPage, perPage: 10 }));
  }

  function handleListPageChange(nextPage) {
    dispatch(fetchAdminBookingsThunk({ page: nextPage, perPage: 10 }));
  }

  function handleClearSearch() {
    reset();
    dispatch(clearBookingsSearch());
    dispatch(fetchAdminBookingsThunk({ page: 1, perPage: 10 }));
  }

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
            isSearchMode
              ? `${displayMeta.totalCount ?? displayRecords.length} results`
              : `${bookingsMeta.totalCount || bookings.length} bookings`,
          ]}
        />

        {!isSearchMode && <BookingsSummaryRail bookings={bookings} />}

        {/* ── Search panel ── */}
        <PageSection className="p-6 sm:p-8">
          <div className="mb-5 border-b border-[var(--color-line)] pb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              Search bookings
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-ink)]">
              Filter by user email
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Enter a partial or full email address to filter the list below.
            </p>
          </div>

          <form id="booking-search-form" onSubmit={handleSubmit(onSearch)} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                id="booking-search-email"
                label="User email"
                placeholder="e.g. user@example.com"
                error={errors.user_email?.message}
                {...register("user_email")}
              />
            </div>
            <div className="flex gap-3">
              <Button
                id="booking-search-submit"
                type="submit"
                disabled={searchStatus === "loading"}
                className="shrink-0"
              >
                {searchStatus === "loading" ? "Searching…" : "Search"}
              </Button>
              {isSearchMode ? (
                <Button
                  id="booking-search-clear"
                  type="button"
                  variant="secondary"
                  onClick={handleClearSearch}
                  className="shrink-0"
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </form>

          {searchError ? (
            <div className="mt-4">
              <AdminErrorBox message={Array.isArray(searchError) ? searchError.join(", ") : searchError} />
            </div>
          ) : null}
        </PageSection>

        {/* ── Pagination strip — always between search form and results — */}
        {displayRecords.length > 0 ? (
          <div className="rounded-[1.4rem] border border-[var(--color-line)] bg-[var(--color-panel-strong)] px-6 py-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
            <SearchPagination
              page={displayMeta.page ?? 1}
              totalPages={displayMeta.totalPages ?? 1}
              totalCount={displayMeta.totalCount ?? displayRecords.length}
              onPrev={() => isSearchMode
                ? onSearchPageChange((displayMeta.page ?? 1) - 1)
                : handleListPageChange((displayMeta.page ?? 1) - 1)}
              onNext={() => isSearchMode
                ? onSearchPageChange((displayMeta.page ?? 1) + 1)
                : handleListPageChange((displayMeta.page ?? 1) + 1)}
              disabled={isSearchMode ? searchStatus === "loading" : listStatus === "loading"}
              loading={isSearchMode ? searchStatus === "loading" : listStatus === "loading"}
            />
          </div>
        ) : null}

        {/* ── Results panel ── */}
        <PageSection className="p-6 sm:p-8">
          <div className="flex flex-col gap-3 border-b border-[var(--color-line)] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                {isSearchMode ? "Search results" : "All bookings"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                Records
              </h2>
            </div>
            <Badge variant="neutral" className="w-fit">
              {(isSearchMode ? searchStatus : listStatus) === "loading"
                ? "Loading…"
                : `${displayMeta.totalCount ?? displayRecords.length} rows`}
            </Badge>
          </div>

          {/* List loading */}
          {!isSearchMode && listStatus === "loading" && bookings.length === 0 ? (
            <div className="pt-6">
              <LoadingState label="Loading bookings…" />
            </div>
          ) : null}

          {/* Search loading */}
          {isSearchMode && searchStatus === "loading" ? (
            <div className="pt-6">
              <LoadingState label="Searching bookings…" />
            </div>
          ) : null}

          {/* Records */}
          {displayRecords.length > 0 && searchStatus !== "loading" && (listStatus !== "loading" || isSearchMode) ? (
            <div className="space-y-4 pt-6">
              {displayRecords.map((booking) => (
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
                        {booking.schedule?.train?.name || "Train"} • {booking.src_station?.name || "Source"} to{" "}
                        {booking.dst_station?.name || "Destination"}
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

          {/* Empty list */}
          {!isSearchMode && listStatus !== "loading" && bookings.length === 0 ? (
            <div className="pt-6">
              <EmptyState title="No bookings yet" description="Bookings will appear here once passengers make reservations." />
            </div>
          ) : null}

          {/* Empty search results */}
          {isSearchMode && searchStatus === "succeeded" && displayRecords.length === 0 ? (
            <div className="pt-6">
              <EmptyState title="No bookings found" description="Try a different email address." />
            </div>
          ) : null}
        </PageSection>
      </div>
    </main>
  );
}

function statusVariant(status) {
  if (status === "booked" || status === "confirmed") return "success";
  if (status === "cancelled") return "danger";
  return "warning";
}
