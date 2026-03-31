"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import EmptyState from "@/components/empty-state";
import LoadingState from "@/components/loading-state";
import PageShell from "@/components/page-shell";
import SectionHeader from "@/components/section-header";
import {
  setSearchError,
  setSearchResults,
  startSearch,
} from "@/features/trains/searchSlice";
import { searchSchedules } from "@/features/trains/trainService";
import { buildScheduleViewModel } from "@/utils/view-models";

export default function SearchResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { results, status, error } = useSelector((state) => state.trainsSearch);

  const fromStationId = searchParams.get("src_station_id") || "";
  const toStationId = searchParams.get("dst_station_id") || "";
  const journeyDate = searchParams.get("travel_date") || "";
  const fromLabel = searchParams.get("from_label") || "Source";
  const toLabel = searchParams.get("to_label") || "Destination";
  const [sortBy, setSortBy] = useState("departure");

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (!fromStationId || !toStationId || !journeyDate) {
      dispatch(setSearchError("Search details are missing. Please start a new search."));
      return;
    }

    let cancelled = false;

    async function loadSchedules() {
      dispatch(startSearch());

      try {
        const data = await searchSchedules({
          fromStationId,
          toStationId,
          journeyDate,
        });

        if (cancelled) {
          return;
        }

        dispatch(setSearchResults(data.schedules || []));
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        dispatch(
          setSearchError(
            requestError?.response?.data?.error || "Unable to fetch matching schedules right now.",
          ),
        );
      }
    }

    loadSchedules();

    return () => {
      cancelled = true;
    };
  }, [dispatch, fromStationId, isAuthenticated, journeyDate, toStationId]);

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

  if (!isAuthenticated) {
    return (
      <PageShell className="items-center px-6 py-12 sm:px-10">
        <div className="surface-panel w-full rounded-[2rem] p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--color-accent)]">
            Protected area
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
            Sign in before viewing search results.
          </h1>
          <div className="mt-6">
            <Link href="/login" className="primary-button px-5 py-3 text-sm">
              Go to login
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-72 rounded-[3rem] bg-[radial-gradient(circle_at_top_left,_rgba(27,116,180,0.1),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(19,95,151,0.1),_transparent_34%)] sm:inset-x-10 lg:inset-x-12" />
      <div className="relative z-10 w-full space-y-6">
        <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
          <SectionHeader
            eyebrow="Matching schedules"
            title={`${fromLabel} to ${toLabel}`}
            description={`Journey date: ${journeyDate}`}
            actions={<Link href="/search" className="secondary-button px-5 py-3 text-sm">Modify search</Link>}
          />
        </section>

        <section className="surface-panel rounded-[2rem] p-6 sm:p-8">
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

            {scheduleCards.map((schedule) => {
              return (
                <article
                  key={schedule.id}
                  className="rounded-[1.8rem] border border-[var(--color-line)] bg-[linear-gradient(180deg,_#ffffff_0%,_#f9fcff_100%)] p-5 shadow-[0_12px_34px_rgba(16,33,49,0.05)]"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-[#eaf3fd] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--color-panel-dark)]">
                          {schedule.trainNumber}
                        </span>
                        <span className="rounded-full bg-[#edf5fd] px-4 py-2 text-sm font-medium text-[var(--color-panel-dark)]">
                          {schedule.trainType}
                        </span>
                        <span className="rounded-full bg-[#f4f7fb] px-4 py-2 text-sm font-medium text-[var(--color-muted-strong)]">
                          {schedule.statusLabel}
                        </span>
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
                              {coach.coachType}: {coach.availableSeats}/{coach.totalSeats}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex min-w-[13rem] flex-col items-start gap-3 lg:items-end">
                      <div className="rounded-[1.25rem] border border-[var(--color-line)] bg-white px-4 py-3 text-sm text-[var(--color-muted-strong)]">
                        Schedule #{schedule.id}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/booking?schedule_id=${schedule.id}&src_station_id=${fromStationId}&dst_station_id=${toStationId}`,
                          )
                        }
                        className="primary-button w-full px-5 py-3 text-sm lg:w-auto"
                      >
                        Continue booking
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
