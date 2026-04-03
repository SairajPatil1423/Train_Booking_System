"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import EmptyState from "@/components/empty-state";
import PageHero from "@/components/layout/page-hero";
import PageSection from "@/components/layout/page-section";
import { formatCoachType } from "@/utils/coach-formatters";
import LoadingState from "@/components/loading-state";
import PageShell from "@/components/page-shell";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import {
  setSearchError,
  searchSchedulesThunk,
} from "@/features/trains/searchSlice";
import { buildScheduleViewModel } from "@/utils/view-models";

function SearchResultsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { results, status, error } = useSelector((state) => state.trainsSearch);

  const fromStationId = searchParams.get("src_station_id") || "";
  const toStationId = searchParams.get("dst_station_id") || "";
  const journeyDate = searchParams.get("travel_date") || "";
  const fromLabel = searchParams.get("from_label") || "Source";
  const toLabel = searchParams.get("to_label") || "Destination";
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
      }),
    );
  }, [dispatch, fromStationId, journeyDate, toStationId]);

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
    <PageShell className="max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-72 rounded-[3rem] bg-[radial-gradient(circle_at_top_left,_rgba(27,116,180,0.1),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(19,95,151,0.1),_transparent_34%)] sm:inset-x-10 lg:inset-x-12" />
      <PageHero
        eyebrow="Matching schedules"
        title={`${fromLabel} to ${toLabel}`}
        description={`Journey date: ${journeyDate}`}
        actions={
          <Button as={Link} href="/search" variant="secondary">
            Modify search
          </Button>
        }
        meta={["Live availability", "Compare timings", "Continue to booking"]}
      />

      <PageSection>
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-line)] pb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
              Available trains
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
              Search results
            </h2>
          </div>
          <div className="rounded-full bg-[var(--color-surface-soft)] px-4 py-2 text-sm font-medium text-[var(--color-muted)] ring-1 ring-black/5">
            {scheduleCards.length} found
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="rounded-full bg-[var(--color-surface-soft)] px-4 py-2 text-sm text-[var(--color-muted-strong)] ring-1 ring-[var(--color-line)]">
            Sort by
          </div>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="field-input max-w-[14rem]"
          >
            <option value="departure">Departure time</option>
            <option value="availability">Availability</option>
            <option value="duration">Duration</option>
          </select>
        </div>

        <div className="mt-6 space-y-4">
          {status === "loading" ? <LoadingState label="Searching matching schedules..." /> : null}

          {error ? (
            <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {status !== "loading" && !error && scheduleCards.length === 0 ? (
            <EmptyState
              title="No matching trains found"
              description="Try a different station pair or choose another date."
              ctaLabel="Start a new search"
              ctaHref="/search"
            />
          ) : null}

          {scheduleCards.map((schedule) => (
            <Card
              as="article"
              key={schedule.id}
              className="rounded-[1.8rem] p-5"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="primary">{schedule.trainNumber}</Badge>
                    <span className="rounded-full bg-[#edf5fd] px-4 py-2 text-sm font-medium text-[var(--color-panel-dark)]">
                      {schedule.trainType}
                    </span>
                    <Badge variant="neutral" className="px-4 py-2 text-xs">
                      {schedule.statusLabel}
                    </Badge>
                    {schedule.rating ? (
                      <span className="rounded-full bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 ring-1 ring-amber-200">
                        ★ {schedule.rating}
                      </span>
                    ) : null}
                    {schedule.grade ? (
                      <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-bold uppercase text-sky-700 ring-1 ring-sky-200">
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
                        Available seats
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[var(--color-panel-dark)]">
                        {schedule.availableSeats} seats
                      </p>
                    </div>
                  </div>

                  {schedule.coachAvailability.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {schedule.coachAvailability.map((coach) => (
                        <div
                          key={coach.coachType}
                          className="rounded-full bg-[#eef6ff] px-4 py-2 text-sm font-medium text-[var(--color-panel-dark)]"
                        >
                          {formatCoachType(coach.coachType)}: {coach.availableSeats}/{coach.totalSeats}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex min-w-[13rem] flex-col items-start gap-3 lg:items-end">
                  <div className="rounded-[1.25rem] border border-[var(--color-line)] bg-white px-4 py-3 text-sm text-[var(--color-muted-strong)]">
                    Schedule #{schedule.id}
                  </div>
                  <Button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/booking?schedule_id=${schedule.id}&src_station_id=${fromStationId}&dst_station_id=${toStationId}&travel_date=${encodeURIComponent(journeyDate)}&from_label=${encodeURIComponent(fromLabel)}&to_label=${encodeURIComponent(toLabel)}`,
                      )
                    }
                    className="w-full lg:w-auto"
                  >
                    Continue booking
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </PageSection>
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
