"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import PageShell from "@/components/page-shell";
import PageSection from "@/components/layout/page-section";
import StationAutocomplete from "@/components/station-autocomplete";
import Button from "@/components/ui/button";
import AuroraBg from "@/components/animations/aurora-bg";
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
  const today = useMemo(() => {
    const now = new Date();
    const localYear = now.getFullYear();
    const localMonth = String(now.getMonth() + 1).padStart(2, "0");
    const localDay = String(now.getDate()).padStart(2, "0");

    return `${localYear}-${localMonth}-${localDay}`;
  }, []);

  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (stationStatus === "idle") {
      dispatch(fetchStationsThunk());
    }
  }, [dispatch, stationStatus]);

  useEffect(() => {
    if (!filters.journeyDate || filters.journeyDate < today) {
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

  // Pre-fill station text inputs from Redux filter IDs once station options are available
  useEffect(() => {
    if (hydrated || stationOptions.length === 0) return;
    if (filters.fromStationId) {
      const match = stationOptions.find((o) => o.value === filters.fromStationId);
      if (match) setFromQuery(match.label);
    }
    if (filters.toStationId) {
      const match = stationOptions.find((o) => o.value === filters.toStationId);
      if (match) setToQuery(match.label);
    }
    setHydrated(true);
  }, [stationOptions, filters.fromStationId, filters.toStationId, hydrated]);

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
    <PageShell className="relative flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12 overflow-hidden">
      {/* Cinematic Aurora Background */}
      <AuroraBg />

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {/* Giant Hero Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <p className="text-sm md:text-base font-bold uppercase tracking-[0.3em] text-[var(--color-accent-strong)] mb-4">
            Midnight Express
          </p>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white drop-shadow-2xl">
            Where do you <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-panel-dark)]">want to go?</span>
          </h1>
        </motion.div>

        {/* Glassmorphism Floating Island Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[2.5rem] border border-[var(--color-line)] bg-black/40 p-6 sm:p-8 md:p-10 shadow-[0_0_80px_rgba(124,58,237,0.15)] backdrop-blur-2xl"
        >
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr_0.9fr] lg:items-end">
              <div className="relative group">
                <StationAutocomplete
                  label="Departure"
                  placeholder="City or Station"
                  value={fromQuery}
                  options={stationOptions}
                  disabled={stationStatus === "loading"}
                  onInputChange={(query) => handleStationInputChange("from", query)}
                  onSelect={(option) => handleStationSelect("from", option)}
                  labelClassName="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted-strong)] group-focus-within:text-[var(--color-accent)] transition-colors"
                  inputClassName="min-h-[4.5rem] rounded-[1.4rem] px-5 text-base sm:text-lg bg-black/50 border-[var(--color-line)] focus:border-[var(--color-accent)] focus:box-shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all"
                />
              </div>

              <div className="flex justify-center pb-2 lg:pb-3">
                <motion.button
                  type="button"
                  onClick={handleSwapStations}
                  className="flex items-center justify-center h-14 w-14 rounded-full bg-white/10 border border-white/20 text-xl text-white backdrop-blur-md shadow-lg"
                  aria-label="Swap source and destination"
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.15)" }}
                  whileTap={{ scale: 0.9, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  ⇄
                </motion.button>
              </div>

              <div className="relative group">
                <StationAutocomplete
                  label="Destination"
                  placeholder="City or Station"
                  value={toQuery}
                  options={stationOptions}
                  disabled={stationStatus === "loading"}
                  onInputChange={(query) => handleStationInputChange("to", query)}
                  onSelect={(option) => handleStationSelect("to", option)}
                  labelClassName="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted-strong)] group-focus-within:text-[var(--color-accent)] transition-colors"
                  inputClassName="min-h-[4.5rem] rounded-[1.4rem] px-5 text-base sm:text-lg bg-black/50 border-[var(--color-line)] focus:border-[var(--color-accent)] focus:box-shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all"
                />
              </div>

              <div className="relative group">
                <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted-strong)] group-focus-within:text-[var(--color-accent)] transition-colors">
                  Journey Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={today}
                    value={filters.journeyDate}
                    onChange={(event) => updateFilter("journeyDate", event.target.value)}
                    className="w-full min-h-[4.5rem] rounded-[1.4rem] border border-[var(--color-line)] bg-black/50 px-5 text-base sm:text-lg text-white placeholder-[var(--color-muted)] outline-none transition-all focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>
            </div>

            {stationError || error ? (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden"
              >
                <div className="rounded-[1rem] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-5 py-4 text-sm font-medium text-[var(--color-danger)] backdrop-blur-md">
                  {stationError || error}
                </div>
              </motion.div>
            ) : null}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center pt-4 border-t border-[var(--color-line)]">
              <motion.button
                type="submit"
                disabled={stationStatus === "loading"}
                className="relative flex items-center justify-center min-h-[4rem] w-full sm:w-auto sm:min-w-[16rem] rounded-full bg-[var(--gradient-brand)] px-8 text-lg font-bold text-white shadow-[0_0_30px_rgba(124,58,237,0.4)] overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Glow sweep effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative inline-flex items-center gap-2">
                  Find Trains <span className="text-xl">➔</span>
                </span>
              </motion.button>
              
              <Button
                type="button"
                onClick={handleReset}
                variant="ghost"
                size="lg"
                className="min-h-[4rem] px-8 text-[var(--color-muted-strong)] hover:text-white"
              >
                Clear
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </PageShell>
  );
}
