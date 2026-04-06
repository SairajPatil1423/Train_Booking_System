"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import EmptyState from "@/components/empty-state";
import PageSection from "@/components/layout/page-section";
import { formatCoachType } from "@/utils/coach-formatters";
import LoadingState from "@/components/loading-state";
import PageShell from "@/components/page-shell";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import PaginationToolbar from "@/components/ui/pagination-toolbar";
import Skeleton from "@/components/ui/skeleton";
import {
  setSearchError,
  searchSchedulesThunk,
} from "@/features/trains/searchSlice";
import { usePaginatedRouteState } from "@/hooks/use-paginated-route-state";
import { buildScheduleViewModel } from "@/utils/view-models";

function SearchResultsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { results, meta, status, error } = useSelector((state) => state.trainsSearch);

  const fromStationId = searchParams.get("src_station_id") || "";
  const toStationId = searchParams.get("dst_station_id") || "";
  const journeyDate = searchParams.get("travel_date") || "";
  const fromLabel = searchParams.get("from_label") || "Source";
  const toLabel = searchParams.get("to_label") || "Destination";
  const { currentPage, currentPerPage, setPage, setPerPage } = usePaginatedRouteState({
    totalPages: meta.totalPages,
    status,
  });
  const [sortBy, setSortBy] = useState("departure");

  useEffect(() => {
    if (!fromStationId || !toStationId || !journeyDate) {
      dispatch(setSearchError("Search details are missing. Please start a new search."));
      return;
    }

    dispatch(
      searchSchedulesThunk({
        fromStationId,
        toStationId,
        journeyDate,
        page: currentPage,
        perPage: currentPerPage,
      }),
    );
  }, [currentPage, currentPerPage, dispatch, fromStationId, journeyDate, toStationId]);

  const scheduleCards = useMemo(() => {
    const mapped = results.map((schedule) =>
      buildScheduleViewModel(schedule, { fromLabel, toLabel }),
    );

    return mapped.sort((left, right) => {
      if (sortBy === "availability") {
        return right.availableSeats - left.availableSeats;
      }

      if (sortBy === "duration") {
        return left.durationLabel.localeCompare(right.durationLabel);
      }

      return left.departureLabel.localeCompare(right.departureLabel);
    });
  }, [fromLabel, results, sortBy, toLabel]);

  return (
    <PageShell className="max-w-6xl px-6 py-8 sm:px-10 lg:px-12">
      <Card tone="panel" className="rounded-[2.2rem] p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold leading-[1.02] tracking-tight text-[var(--color-ink)] sm:text-[3rem]">
              {fromLabel} to {toLabel}
            </h1>
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              {journeyDate}
            </p>
          </div>
          <Button as={Link} href="/search" variant="secondary">
            Change
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-[var(--color-line)] py-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
              Results
            </h2>
          </div>
          <div className="rounded-full bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm font-medium text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
            {status === "loading" ? "Loading" : `${meta.totalCount || scheduleCards.length} trains`}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="rounded-full bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm text-[var(--color-muted-strong)] ring-1 ring-[var(--color-line)]">
            Sort
          </div>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="field-input min-h-[3.25rem] max-w-[15rem]"
          >
            <option value="departure">Departure time</option>
            <option value="availability">Availability</option>
            <option value="duration">Duration</option>
          </select>
        </div>

        <div className="mt-6 space-y-4">
          {status === "loading" && scheduleCards.length === 0 ? (
            <>
              <Skeleton className="h-72 rounded-[1.8rem]" />
              <Skeleton className="h-72 rounded-[1.8rem]" />
            </>
          ) : null}
          {status === "loading" && scheduleCards.length > 0 ? (
            <div className="text-sm font-medium text-[var(--color-muted)]">Loading page {currentPage}...</div>
          ) : null}

          {error ? (
            <div className="rounded-[1.2rem] border border-[color-mix(in_srgb,var(--color-danger)_26%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-danger-soft)_84%,var(--color-panel-strong))] px-4 py-3 text-sm text-[var(--color-danger)]">
              {error}
            </div>
          ) : null}

          {status !== "loading" && !error && scheduleCards.length === 0 ? (
            <EmptyState
              title="No trains found"
              description="Try another date or route."
              ctaLabel="Search Again"
              ctaHref="/search"
            />
          ) : null}

          {scheduleCards.map((schedule) => (
            <Card
              as="article"
              key={schedule.id}
              className="rounded-[1.8rem] p-5 ui-card-hover"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="primary">{schedule.trainNumber}</Badge>
                    <span className="rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-sm font-medium text-[var(--color-panel-dark)]">
                      {schedule.trainType}
                    </span>
                    <Badge variant="neutral" className="px-4 py-2 text-xs">
                      {schedule.statusLabel}
                    </Badge>
                    {schedule.rating ? (
                      <span className="rounded-full border border-[color-mix(in_srgb,var(--color-warning)_24%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-warning-soft)_82%,var(--color-panel-strong))] px-4 py-2 text-sm font-bold text-[var(--color-warning)]">
                        ★ {schedule.rating}
                      </span>
                    ) : null}
                    {schedule.grade ? (
                      <span className="rounded-full border border-[color-mix(in_srgb,var(--color-accent)_24%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-accent-soft)_82%,var(--color-panel-strong))] px-4 py-2 text-sm font-bold uppercase text-[var(--color-panel-dark)]">
                        {schedule.grade}
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold text-[var(--color-ink)]">
                      {schedule.trainName}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      {schedule.routeLabel}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="rounded-[1.2rem] bg-[var(--color-surface-soft)] px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                        Departure
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                        {schedule.departureLabel}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] bg-[var(--color-surface-soft)] px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                        Arrival
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                        {schedule.arrivalLabel}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] bg-[var(--color-surface-soft)] px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                        Duration
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                        {schedule.durationLabel}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] bg-[var(--color-surface-soft)] px-4 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                        Seats
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[var(--color-panel-dark)]">
                        {schedule.availableSeats}
                      </p>
                    </div>
                  </div>

                  {schedule.coachAvailability.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {schedule.coachAvailability.map((coach) => (
                        <div
                          key={coach.coachType}
                          className="rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-sm font-medium text-[var(--color-panel-dark)]"
                        >
                          {formatCoachType(coach.coachType)}: {coach.availableSeats}/{coach.totalSeats}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex min-w-[15rem] flex-col items-start gap-3 lg:items-end">
                  <div className="rounded-[1.35rem] border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3.5 text-sm text-[var(--color-muted-strong)]">
                    {schedule.availableSeats > 0 ? `${schedule.availableSeats} available` : "Waitlist"}
                  </div>
                  <Button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/booking?schedule_id=${schedule.id}&src_station_id=${fromStationId}&dst_station_id=${toStationId}&travel_date=${encodeURIComponent(journeyDate)}&from_label=${encodeURIComponent(fromLabel)}&to_label=${encodeURIComponent(toLabel)}`,
                      )
                    }
                    size="xl"
                    className="min-h-[3.75rem] w-full lg:min-w-[14rem]"
                  >
                    Select
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {scheduleCards.length > 0 ? (
            <PaginationToolbar
              page={meta.page}
              perPage={meta.perPage}
              totalCount={meta.totalCount || scheduleCards.length}
              totalPages={meta.totalPages}
              onPageChange={setPage}
              onPerPageChange={setPerPage}
              disabled={status === "loading"}
              loading={status === "loading"}
            />
          ) : null}
        </div>
      </Card>
    </PageShell>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense
      fallback={
        <PageShell className="max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
          <div className="w-full">
            <LoadingState label="Preparing search results..." />
          </div>
        </PageShell>
      }
    >
      <SearchResultsPageContent />
    </Suspense>
  );
}
