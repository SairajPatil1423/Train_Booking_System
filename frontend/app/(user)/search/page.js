"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import PageShell from "@/components/page-shell";
import PageSection from "@/components/layout/page-section";
import StationAutocomplete from "@/components/station-autocomplete";
import Button from "@/components/ui/button";
import {
  resetSearch,
  setSearchError,
  setSearchFilters,
} from "@/features/trains/searchSlice";
import { fetchStationsThunk } from "@/features/trains/stationsSlice";

export default function SearchPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { filters, error } = useSelector((state) => state.trainsSearch);
  const stations = useSelector((state) => state.stations.items);
  const stationStatus = useSelector((state) => state.stations.status);
  const stationError = useSelector((state) => state.stations.error);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");

  useEffect(() => {
    if (stationStatus === "idle") {
      dispatch(fetchStationsThunk());
    }
  }, [dispatch, stationStatus]);

  useEffect(() => {
    if (!filters.journeyDate) {
      dispatch(setSearchFilters({ journeyDate: today }));
    }
  }, [dispatch, filters.journeyDate, today]);

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

  return (
    <PageShell className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
      <PageSection className="rounded-[2.25rem] p-5 sm:p-7 lg:p-8">
        <div className="border-b border-[var(--color-line)] pb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            Search Trains
          </h1>
        </div>

        <form className="space-y-6 pt-6" onSubmit={handleSubmit}>
              <div className="grid gap-5 xl:grid-cols-[1fr_auto_1fr_0.9fr] xl:items-start">
                <StationAutocomplete
                  label="From"
                  placeholder="From"
                  value={fromQuery}
                  options={stationOptions}
                  disabled={stationStatus === "loading"}
                  onInputChange={(query) => handleStationInputChange("from", query)}
                  onSelect={(option) => handleStationSelect("from", option)}
                  labelClassName="mb-3 text-[12px] tracking-[0.24em]"
                  inputClassName="min-h-[4.5rem] rounded-[1.4rem] px-5 text-base sm:text-lg"
                />

                <div className="flex justify-center xl:pt-11">
                  <Button
                    type="button"
                    onClick={handleSwapStations}
                    variant="quiet"
                    className="h-16 w-16 rounded-[1.5rem] px-0 text-2xl text-[var(--color-panel-dark)] shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
                    aria-label="Swap source and destination"
                  >
                    ↔
                  </Button>
                </div>

                <StationAutocomplete
                  label="To"
                  placeholder="To"
                  value={toQuery}
                  options={stationOptions}
                  disabled={stationStatus === "loading"}
                  onInputChange={(query) => handleStationInputChange("to", query)}
                  onSelect={(option) => handleStationSelect("to", option)}
                  labelClassName="mb-3 text-[12px] tracking-[0.24em]"
                  inputClassName="min-h-[4.5rem] rounded-[1.4rem] px-5 text-base sm:text-lg"
                />

                <div>
                  <label className="mb-3 block text-[12px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                    Date
                  </label>
                  <input
                    type="date"
                    value={filters.journeyDate}
                    onChange={(event) => updateFilter("journeyDate", event.target.value)}
                    className="field-input min-h-[4.5rem] rounded-[1.4rem] px-5 text-base sm:text-lg"
                  />
                </div>
              </div>

              {stationError ? (
                <div className="rounded-[1.2rem] border border-[color-mix(in_srgb,var(--color-danger)_26%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-danger-soft)_84%,var(--color-panel-strong))] px-4 py-3 text-sm text-[var(--color-danger)]">
                  {stationError}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-[1.2rem] border border-[color-mix(in_srgb,var(--color-danger)_26%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-danger-soft)_84%,var(--color-panel-strong))] px-4 py-3 text-sm text-[var(--color-danger)]">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="submit"
                  disabled={stationStatus === "loading"}
                  size="xl"
                  className="min-h-[4rem] w-full sm:min-w-[16rem]"
                >
                  Search Trains
                </Button>
                <Button
                  type="button"
                  onClick={handleReset}
                  variant="secondary"
                  size="lg"
                  className="min-h-[3.75rem] w-full sm:min-w-[11rem]"
                >
                  Reset
                </Button>
                <Button as={Link} href="/dashboard" variant="ghost" size="lg" className="min-h-[3.75rem] w-full sm:w-auto">
                  Back
                </Button>
              </div>
            </form>
      </PageSection>
    </PageShell>
  );
}
