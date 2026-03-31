"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  resetSearch,
  setSearchError,
  setSearchFilters,
  setSearchResults,
  startSearch,
} from "@/features/trains/searchSlice";
import { fetchStations, searchSchedules } from "@/features/trains/trainService";

export default function SearchPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { filters, results, status, error } = useSelector(
    (state) => state.trainsSearch,
  );
  const [stations, setStations] = useState([]);
  const [stationStatus, setStationStatus] = useState("idle");
  const [stationError, setStationError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    async function loadStations() {
      setStationStatus("loading");
      setStationError("");

      try {
        const data = await fetchStations();

        if (cancelled) {
          return;
        }

        setStations(data.stations || []);
        setStationStatus("succeeded");
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setStationStatus("failed");
        setStationError(
          requestError?.response?.data?.error || "Unable to load stations.",
        );
      }
    }

    loadStations();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const stationOptions = useMemo(
    () =>
      stations.map((station) => ({
        value: String(station.id),
        label: `${station.name} (${station.code})`,
        city: station.city?.name || "",
      })),
    [stations],
  );

  function updateFilter(key, value) {
    dispatch(setSearchFilters({ [key]: value }));
  }

  async function handleSearch(event) {
    event.preventDefault();

    if (!filters.fromStationId || !filters.toStationId || !filters.journeyDate) {
      dispatch(setSearchError("Source, destination, and journey date are required."));
      return;
    }

    if (filters.fromStationId === filters.toStationId) {
      dispatch(setSearchError("Source and destination must be different stations."));
      return;
    }

    dispatch(startSearch());

    try {
      const data = await searchSchedules(filters);
      dispatch(setSearchResults(data.schedules || []));
    } catch (requestError) {
      dispatch(
        setSearchError(
          requestError?.response?.data?.error || "Unable to search trains right now.",
        ),
      );
    }
  }

  function handleReset() {
    dispatch(resetSearch());
    dispatch(
      setSearchFilters({
        fromStationId: "",
        toStationId: "",
        journeyDate: "",
      }),
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-5xl flex-1 items-center px-6 py-12 sm:px-10">
        <div className="w-full rounded-[2rem] border border-amber-200 bg-amber-50 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
            Protected area
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-amber-950">
            Sign in before searching trains.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-amber-900/80">
            We’ll add route search in the next step. For now, this page confirms
            that JWT-based sign in is connected to the UI and controls access.
          </p>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex rounded-full bg-amber-700 px-5 py-3 font-semibold text-white transition hover:opacity-90"
            >
              Go to login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-6xl flex-1 px-6 py-12 sm:px-10 lg:px-12">
      <div className="grid w-full gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <section className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
            Search trains
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
            Find the right schedule for your journey.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
            Choose your source station, destination station, and travel date to
            view live schedules and current seat availability.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSearch}>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
                From station
              </label>
              <select
                value={filters.fromStationId}
                onChange={(event) => updateFilter("fromStationId", event.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-[#fffdf8] px-4 py-3 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(214,111,34,0.15)]"
                disabled={stationStatus === "loading"}
              >
                <option value="">Select source station</option>
                {stationOptions.map((station) => (
                  <option key={station.value} value={station.value}>
                    {station.label}{station.city ? ` • ${station.city}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
                To station
              </label>
              <select
                value={filters.toStationId}
                onChange={(event) => updateFilter("toStationId", event.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-[#fffdf8] px-4 py-3 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(214,111,34,0.15)]"
                disabled={stationStatus === "loading"}
              >
                <option value="">Select destination station</option>
                {stationOptions.map((station) => (
                  <option key={station.value} value={station.value}>
                    {station.label}{station.city ? ` • ${station.city}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
                Journey date
              </label>
              <input
                type="date"
                value={filters.journeyDate}
                onChange={(event) => updateFilter("journeyDate", event.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-[#fffdf8] px-4 py-3 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(214,111,34,0.15)]"
              />
            </div>

            {stationError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {stationError}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={status === "loading" || stationStatus === "loading"}
                className="inline-flex rounded-full bg-[var(--color-ink)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading" ? "Searching..." : "Search trains"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex rounded-full border border-black/10 bg-white px-5 py-3 font-semibold text-[var(--color-ink)] transition hover:bg-black/5"
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="rounded-[2rem] bg-[var(--color-panel)] p-6 shadow-sm">
            <p className="text-sm font-medium text-[var(--color-muted)]">
              Signed in as
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">
              {user?.email}
            </p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Role: {user?.role || "user"}
            </p>
          </div>

          <div className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-black/8 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                  Search results
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                  Available schedules
                </h2>
              </div>
              <div className="rounded-full bg-[#f8f3e8] px-4 py-2 text-sm font-medium text-[var(--color-muted)]">
                {results.length} found
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {status === "loading" ? (
                <div className="rounded-2xl border border-dashed border-black/10 bg-[#fcfbf8] px-5 py-8 text-sm text-[var(--color-muted)]">
                  Fetching schedules and current availability...
                </div>
              ) : null}

              {status !== "loading" && results.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/10 bg-[#fcfbf8] px-5 py-8">
                  <p className="text-lg font-semibold text-[var(--color-ink)]">
                    No schedules yet.
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                    Search for a route to view trains running on your selected
                    date.
                  </p>
                </div>
              ) : null}

              {results.map((schedule) => (
                <article
                  key={schedule.id}
                  className="rounded-[1.5rem] border border-black/8 bg-[#fffdfa] p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                        {schedule.train?.train_number}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-[var(--color-ink)]">
                        {schedule.train?.name}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        {schedule.train?.train_type} • Status: {schedule.status}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/booking?schedule_id=${schedule.id}&src_station_id=${filters.fromStationId}&dst_station_id=${filters.toStationId}`,
                        )
                      }
                      className="inline-flex rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      Continue booking
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-black/5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                        Departure
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                        {new Date(schedule.departure_time).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-black/5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                        Expected arrival
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                        {new Date(schedule.expected_arrival_time).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-black/5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                        Total available
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                        {schedule.availability?.available_seats ?? 0} seats
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {Object.entries(
                      schedule.availability?.coach_type_availability || {},
                    ).map(([coachType, data]) => (
                      <div
                        key={coachType}
                        className="rounded-full bg-[var(--color-panel)] px-4 py-2 text-sm text-[var(--color-ink)]"
                      >
                        <span className="font-semibold">{coachType}</span>
                        {`: ${data.available_seats}/${data.total_active_seats}`}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
