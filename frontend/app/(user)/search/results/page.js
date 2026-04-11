"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import EmptyState from "@/components/empty-state";
import PageSection from "@/components/layout/page-section";
import { formatCoachType } from "@/utils/coach-formatters";
import LoadingState from "@/components/loading-state";
import PageShell from "@/components/page-shell";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import SearchPagination from "@/components/ui/search-pagination";
import Skeleton from "@/components/ui/skeleton";
import PageFade from "@/components/animations/page-fade";
import TrainLoader from "@/components/animations/train-loader";
import { StaggerList, StaggerItem } from "@/components/animations/stagger-list";
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
            <TrainLoader label="Searching for trains..." />
          ) : null}
          {status === "loading" && scheduleCards.length > 0 ? (
            <TrainLoader label={`Loading page ${currentPage}...`} />
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
            <motion.article
              key={schedule.id}
              className="relative overflow-hidden rounded-[1.8rem] border border-[var(--color-line)] bg-black/40 p-1 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl group"
              whileHover={{ y: -4, scale: 1.01, boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(124,58,237,0.2)" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* Neon accent bar on left */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--color-accent)] opacity-80 shadow-[0_0_15px_var(--color-accent)] group-hover:opacity-100 transition-opacity" />
              
              {/* Speed line background texture */}
              <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,rgba(255,255,255,0.04)_10px,rgba(255,255,255,0.04)_20px)] pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between bg-gradient-to-r from-[var(--color-surface-soft)] to-transparent rounded-[1.6rem] p-5 h-full">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-sm font-bold text-white border border-white/20">
                      {schedule.trainNumber}
                    </span>
                    <span className="rounded-full bg-[var(--color-accent-soft)] px-4 py-1.5 text-sm font-bold text-[var(--color-accent)] border border-[var(--color-accent)]/30 shadow-[0_0_10px_var(--color-accent-soft)]">
                      {schedule.trainType}
                    </span>
                    <span className="rounded-full border border-[var(--color-line-strong)] bg-white/5 px-4 py-1.5 text-xs text-[var(--color-muted-strong)]">
                      {schedule.statusLabel}
                    </span>
                    {schedule.rating ? (
                      <span className="rounded-full border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 px-4 py-1.5 text-sm font-bold text-[var(--color-warning)] shadow-[0_0_8px_var(--color-warning-soft)]">
                        ★ {schedule.rating}
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <h3 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md">
                      {schedule.trainName}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-accent)]">
                      {schedule.routeLabel}
                    </p>
                  </div>

                  <div className="grid gap-3 grid-cols-2 md:grid-cols-4 pt-2">
                    <div className="rounded-[1rem] bg-black/40 border border-[var(--color-line)] px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                        Departure
                      </p>
                      <p className="mt-1 text-[15px] font-mono font-bold text-white">
                        {schedule.departureLabel}
                      </p>
                    </div>
                    {/* Animated path arrow */}
                    <div className="hidden md:flex flex-col items-center justify-center pt-3 opacity-50 relative">
                       <p className="text-[10px] uppercase text-[var(--color-muted)]">Duration</p>
                       <p className="font-mono text-xs">{schedule.durationLabel}</p>
                       <div className="w-full h-px border-t border-dashed border-[var(--color-accent)] mt-1 relative">
                          <motion.div 
                            className="absolute -top-1 w-2 h-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]"
                            animate={{ x: ["0%", "400%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          />
                       </div>
                    </div>
                    {/* Mobile fallback duration */}
                    <div className="md:hidden rounded-[1rem] bg-black/40 border border-[var(--color-line)] px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                        Duration
                      </p>
                      <p className="mt-1 text-[15px] font-mono font-bold text-white">
                        {schedule.durationLabel}
                      </p>
                    </div>
                    <div className="rounded-[1rem] bg-black/40 border border-[var(--color-line)] px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                        Arrival
                      </p>
                      <p className="mt-1 text-[15px] font-mono font-bold text-white">
                        {schedule.arrivalLabel}
                      </p>
                    </div>
                    <div className="rounded-[1rem] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                        Seats Left
                      </p>
                      <p className="mt-1 text-[15px] font-mono font-bold text-[var(--color-accent-strong)] drop-shadow-md">
                        {schedule.availableSeats}
                      </p>
                    </div>
                  </div>

                  {schedule.coachAvailability.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {schedule.coachAvailability.map((coach) => (
                        <div
                          key={coach.coachType}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-[var(--color-muted-strong)] uppercase tracking-wide"
                        >
                          <span className="text-white">{formatCoachType(coach.coachType)}</span>: {coach.availableSeats}/{coach.totalSeats}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex min-w-[15rem] flex-col items-start gap-3 lg:items-end lg:justify-center">
                  <div className={`rounded-full border px-4 py-2 text-sm font-bold uppercase tracking-wider shadow-lg ${
                    schedule.statusKey === "cancelled" 
                    ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/30 shadow-[0_0_15px_var(--color-danger-soft)]"
                    : schedule.availableSeats > 0
                    ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30 shadow-[0_0_15px_var(--color-success-soft)]"
                    : "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30 shadow-[0_0_15px_var(--color-warning-soft)]"
                  }`}>
                    {schedule.statusKey === "cancelled"
                      ? "Cancelled"
                      : schedule.availableSeats > 0
                        ? "Available"
                        : "Waitlist"}
                  </div>
                  <motion.button
                    type="button"
                    disabled={!schedule.isBookable}
                    onClick={() =>
                      router.push(
                        `/booking?schedule_id=${schedule.id}&src_station_id=${fromStationId}&dst_station_id=${toStationId}&travel_date=${encodeURIComponent(journeyDate)}&from_label=${encodeURIComponent(fromLabel)}&to_label=${encodeURIComponent(toLabel)}`,
                      )
                    }
                    className="relative flex items-center justify-center min-h-[3.75rem] w-full lg:min-w-[14rem] rounded-full bg-[var(--gradient-brand)] px-6 text-base font-bold text-white overflow-hidden disabled:opacity-50 disabled:grayscale group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {!schedule.isBookable ? null : (
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                    )}
                    <span className="relative z-10">
                      {schedule.statusKey === "cancelled"
                        ? "Unavailable"
                        : schedule.availableSeats > 0
                          ? "Select Train ➔"
                          : "Join Waitlist"}
                    </span>
                  </motion.button>
                </div>
              </div>
            </motion.article>
          ))}

          {scheduleCards.length > 0 ? (
            <SearchPagination
              page={meta.page ?? 1}
              totalPages={meta.totalPages ?? 1}
              totalCount={meta.totalCount || scheduleCards.length}
              onPrev={() => setPage((meta.page ?? 1) - 1)}
              onNext={() => setPage((meta.page ?? 1) + 1)}
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
