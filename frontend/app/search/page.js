"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import StationAutocomplete from "@/components/station-autocomplete";
import {
  resetSearch,
  setSearchError,
  setSearchFilters,
} from "@/features/trains/searchSlice";
import { fetchStations } from "@/features/trains/trainService";

const searchTips = [
  "Search by station name or station code",
  "Choose a journey date before continuing",
  "Review matching trains on the next page",
];

export default function SearchPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { filters, error } = useSelector((state) => state.trainsSearch);
  const [stations, setStations] = useState([]);
  const [stationStatus, setStationStatus] = useState("idle");
  const [stationError, setStationError] = useState("");
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");

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

  function resolveStationOption(query, selectedId) {
    if (selectedId) {
      return stationOptions.find((option) => option.value === selectedId) || null;
    }

    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return null;
    }

    const exactMatch = stationOptions.find((option) => {
      const label = option.label.toLowerCase();
      const code = option.label.match(/\(([^)]+)\)$/)?.[1]?.toLowerCase() || "";

      return (
        label === normalizedQuery ||
        code === normalizedQuery ||
        label.startsWith(normalizedQuery)
      );
    });

    if (exactMatch) {
      return exactMatch;
    }

    const partialMatches = stationOptions.filter((option) => {
      const haystack = `${option.label} ${option.city}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });

    return partialMatches.length === 1 ? partialMatches[0] : null;
  }

  function handleStationInputChange(type, query) {
    if (type === "from") {
      setFromQuery(query);
      updateFilter("fromStationId", "");
      return;
    }

    setToQuery(query);
    updateFilter("toStationId", "");
  }

  function handleStationSelect(type, option) {
    if (type === "from") {
      setFromQuery(option.label);
      updateFilter("fromStationId", option.value);
      return;
    }

    setToQuery(option.label);
    updateFilter("toStationId", option.value);
  }

  function handleSwapStations() {
    const nextFromQuery = toQuery;
    const nextToQuery = fromQuery;
    const nextFromId = filters.toStationId;
    const nextToId = filters.fromStationId;

    setFromQuery(nextFromQuery);
    setToQuery(nextToQuery);
    dispatch(
      setSearchFilters({
        fromStationId: nextFromId,
        toStationId: nextToId,
      }),
    );
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
    setFromQuery("");
    setToQuery("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const fromStation = resolveStationOption(fromQuery, filters.fromStationId);
    const toStation = resolveStationOption(toQuery, filters.toStationId);

    if (!fromStation || !toStation || !filters.journeyDate) {
      dispatch(
        setSearchError(
          "Please choose source and destination from the suggestions and select a journey date.",
        ),
      );
      return;
    }

    if (fromStation.value === toStation.value) {
      dispatch(setSearchError("Source and destination must be different stations."));
      return;
    }

    dispatch(
      setSearchFilters({
        fromStationId: fromStation.value,
        toStationId: toStation.value,
      }),
    );

    const params = new URLSearchParams({
      src_station_id: fromStation.value,
      dst_station_id: toStation.value,
      travel_date: filters.journeyDate,
      from_label: fromStation.label,
      to_label: toStation.label,
    });

    router.push(`/search/results?${params.toString()}`);
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-5xl flex-1 items-center px-6 py-12 sm:px-10">
        <div className="surface-panel w-full rounded-[2rem] p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--color-accent)]">
            Protected area
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
            Sign in before searching trains.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
            Login first to search routes, view availability, and continue to booking.
          </p>
          <div className="mt-6">
            <Link href="/login" className="primary-button px-5 py-3 text-sm">
              Go to login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-6xl flex-1 px-6 py-10 sm:px-10 lg:px-12">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-72 rounded-[3rem] bg-[radial-gradient(circle_at_top_left,_rgba(27,116,180,0.1),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(19,95,151,0.1),_transparent_34%)] sm:inset-x-10 lg:inset-x-12" />
      <div className="relative z-10 flex w-full items-start justify-center">
        <section className="surface-panel w-full max-w-5xl rounded-[2.25rem] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 border-b border-[var(--color-line)] pb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--color-accent)]">
                  Plan your journey
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
                  Search trains between stations
                </h1>
                <p className="mt-3 text-base leading-8 text-[var(--color-muted)]">
                  Enter your source, destination, and journey date to review
                  matching trains on the next page.
                </p>
              </div>

              <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,_#145f97_0%,_#0e4770_100%)] px-5 py-4 text-white shadow-[0_18px_46px_rgba(12,79,129,0.16)]">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/68">
                  Traveller
                </p>
                <p className="mt-2 text-sm font-semibold sm:text-base">{user?.email}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {searchTips.map((tip) => (
                <div
                  key={tip}
                  className="rounded-[1.25rem] border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-muted-strong)]"
                >
                  {tip}
                </div>
              ))}
            </div>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_0.85fr] lg:items-end">
              <StationAutocomplete
                label="From station"
                placeholder="Type source station"
                value={fromQuery}
                options={stationOptions}
                disabled={stationStatus === "loading"}
                onInputChange={(query) => handleStationInputChange("from", query)}
                onSelect={(option) => handleStationSelect("from", option)}
              />

              <div className="flex justify-center lg:pb-[0.35rem]">
                <button
                  type="button"
                  onClick={handleSwapStations}
                    className="secondary-button h-12 w-12 text-lg text-[var(--color-panel-dark)] hover:bg-[#eef6ff]"
                  aria-label="Swap source and destination"
                >
                  ↔
                </button>
              </div>

              <StationAutocomplete
                label="To station"
                placeholder="Type destination station"
                value={toQuery}
                options={stationOptions}
                disabled={stationStatus === "loading"}
                onInputChange={(query) => handleStationInputChange("to", query)}
                onSelect={(option) => handleStationSelect("to", option)}
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
                  Journey date
                </label>
                <input
                  type="date"
                  value={filters.journeyDate}
                  onChange={(event) => updateFilter("journeyDate", event.target.value)}
                  className="field-input"
                />
              </div>
            </div>

            {stationError ? (
              <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {stationError}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={stationStatus === "loading"}
                className="primary-button px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                Search trains
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="secondary-button px-6 py-3 text-sm"
              >
                Reset
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
