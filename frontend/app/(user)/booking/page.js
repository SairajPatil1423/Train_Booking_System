"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import BookingSummary from "@/components/booking-summary";
import EmptyState from "@/components/empty-state";
import PageHero from "@/components/layout/page-hero";
import PageSection from "@/components/layout/page-section";
import LoadingState from "@/components/loading-state";
import PageShell from "@/components/page-shell";
import SeatMap from "@/components/seat-map";
import SectionHeader from "@/components/section-header";
import { formatCoachType } from "@/utils/coach-formatters";
import { normalizeCoachType } from "@/utils/coach-formatters";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { fetchScheduleDetails } from "@/features/trains/trainService";
import {
  formatCurrency,
  formatDate,
  formatScheduleDateTimeWithOffset,
  formatScheduleDurationWithOffsets,
} from "@/utils/formatters";
import {
  clearSeatSelection,
  removeSeatSelection,
  setSelectedSchedule,
  toggleSeatSelection,
  checkoutThunk,
  selectSelectedSeatsArray,
} from "@/features/booking/bookingSlice";
import {
  bookingConfirmationSchema,
  passengersFormSchema,
} from "@/features/booking/schemas";
import {
  PASSENGER_GENDERS,
  PASSENGER_ID_TYPES,
  PAYMENT_METHODS,
  sanitizeAgeInput,
  sanitizeNameInput,
  sanitizePassengerIdNumber,
  sanitizePhoneInput,
} from "@/features/validation/constants";
import { toastError, toastSuccess } from "@/utils/toast";

const stepLabels = ["Review", "Passengers", "Seats", "Confirmation"];
const paymentOptions = [
  { id: "upi", label: "Unified Payments Interface (UPI)", value: "upi" },
  { id: "card", label: "Debit / Credit Card", value: "card" },
  { id: "netbanking", label: "Net Banking", value: "netbanking" },
].filter((option) => PAYMENT_METHODS.includes(option.value));

const passengerTemplate = () => ({
  first_name: "",
  last_name: "",
  age: "",
  gender: "male",
  id_type: "Aadhaar",
  id_number: "",
});

function BookingPageContent() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { isAuthenticated, hydrated, user } = useSelector((state) => state.auth);
  const {
    selectedSchedule: details,
    error: bookingError,
    status: checkoutStatus,
    lastBooking: confirmation,
  } = useSelector((state) => state.booking);

  const selectedSeatIds = useSelector((state) => selectSelectedSeatsArray(state));

  const scheduleId = searchParams.get("schedule_id");
  const srcStationId = searchParams.get("src_station_id");
  const dstStationId = searchParams.get("dst_station_id");
  const initialFromLabel = searchParams.get("from_label") || "Source";
  const initialToLabel = searchParams.get("to_label") || "Destination";
  const initialTravelDate = searchParams.get("travel_date") || "";

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCoachType, setSelectedCoachType] = useState("");
  const [passengerCount, setPassengerCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isBooked, setIsBooked] = useState(false);
  const [seatSelectionNote, setSeatSelectionNote] = useState("");
  const [passengerCountNote, setPassengerCountNote] = useState("");
  const today = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  const {
    control,
    formState: { errors: passengerErrors, isValid: isPassengerFormValid },
    getValues,
    register,
    setValue,
    trigger,
  } = useForm({
    resolver: zodResolver(passengersFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      passengers: [passengerTemplate()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "passengers",
  });

  const {
    control: confirmationControl,
    formState: {
      errors: confirmationErrors,
      isValid: isConfirmationValid,
    },
    register: registerConfirmation,
    reset: resetConfirmation,
    setValue: setConfirmationValue,
  } = useForm({
    resolver: zodResolver(bookingConfirmationSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      contactEmail: user?.email || "",
      contactPhone: user?.phone || "",
      agreeToTerms: false,
    },
  });

  useEffect(() => {
    if (!isAuthenticated || !scheduleId || !srcStationId || !dstStationId) {
      return;
    }

    let cancelled = false;

    async function loadScheduleDetails() {
      setStatus("loading");
      setError("");

      try {
        const data = await fetchScheduleDetails(scheduleId, {
          srcStationId,
          dstStationId,
        });

        if (cancelled) {
          return;
        }

        dispatch(setSelectedSchedule(data));
        setStatus("succeeded");
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setStatus("failed");
        setError(
          requestError?.response?.data?.error || "Unable to load booking details right now.",
        );
      }
    }

    loadScheduleDetails();

    return () => {
      cancelled = true;
    };
  }, [dispatch, dstStationId, isAuthenticated, scheduleId, srcStationId]);

  useEffect(() => {
    if (!seatSelectionNote) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSeatSelectionNote("");
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [seatSelectionNote]);

  useEffect(() => {
    if (!passengerCountNote) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPassengerCountNote("");
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [passengerCountNote]);

  const routeStops = useMemo(() => {
    const stops = details?.stops || [];
    const srcIndex = stops.findIndex((stop) => stop.station?.id === srcStationId);
    const dstIndex = stops.findIndex((stop) => stop.station?.id === dstStationId);

    if (srcIndex === -1 || dstIndex === -1 || dstIndex < srcIndex) {
      return stops;
    }

    return stops.slice(srcIndex, dstIndex + 1);
  }, [details?.stops, dstStationId, srcStationId]);

  const fareOptions = useMemo(() => details?.fare_options || {}, [details?.fare_options]);
  const coachTypeAvailability = useMemo(
    () => details?.availability?.coach_type_availability || {},
    [details?.availability?.coach_type_availability],
  );
  const coachTypeOptions = useMemo(() => {
    const optionsByType = new Map();

    (details?.coaches || []).forEach((coach) => {
      const coachType = normalizeCoachType(coach.coach_type);
      if (!coachType) {
        return;
      }

      const existing = optionsByType.get(coachType) || {
        coachType,
        coachCount: 0,
        totalSeats: 0,
        availableSeats: null,
        farePerSeat: null,
      };

      existing.coachCount += 1;
      existing.totalSeats += Array.isArray(coach.seats) ? coach.seats.length : 0;
      optionsByType.set(coachType, existing);
    });

    Object.entries(coachTypeAvailability).forEach(([coachType, value]) => {
      const normalizedCoachType = normalizeCoachType(coachType);
      if (!normalizedCoachType) {
        return;
      }

      const existing = optionsByType.get(normalizedCoachType) || {
        coachType: normalizedCoachType,
        coachCount: 0,
        totalSeats: 0,
        availableSeats: null,
        farePerSeat: null,
      };

      existing.availableSeats = value.available_seats;
      existing.totalSeats = value.total_active_seats;
      optionsByType.set(normalizedCoachType, existing);
    });

    Object.entries(fareOptions).forEach(([coachType, value]) => {
      const normalizedCoachType = normalizeCoachType(coachType);
      if (!normalizedCoachType) {
        return;
      }

      const existing = optionsByType.get(normalizedCoachType) || {
        coachType: normalizedCoachType,
        coachCount: 0,
        totalSeats: 0,
        availableSeats: null,
        farePerSeat: null,
      };

      existing.farePerSeat = value?.fare_per_seat ?? null;
      optionsByType.set(normalizedCoachType, existing);
    });

    return Array.from(optionsByType.values()).sort((left, right) =>
      formatCoachType(left.coachType).localeCompare(formatCoachType(right.coachType)),
    );
  }, [coachTypeAvailability, details?.coaches, fareOptions]);

  const resolvedSelectedCoachType = useMemo(() => {
    if (!coachTypeOptions.length) {
      return "";
    }

    return coachTypeOptions.some((option) => option.coachType === selectedCoachType)
      ? selectedCoachType
      : coachTypeOptions[0].coachType;
  }, [coachTypeOptions, selectedCoachType]);

  useEffect(() => {
    if (!coachTypeOptions.length || !selectedCoachType) {
      return;
    }

    if (!coachTypeOptions.some((option) => option.coachType === selectedCoachType)) {
      dispatch(clearSeatSelection());
    }
  }, [coachTypeOptions, dispatch, selectedCoachType]);

  const selectedFare = fareOptions[resolvedSelectedCoachType]?.fare_per_seat ?? null;
  const unavailableSeatIds = useMemo(() => {
    const requestedSegment = details?.seat_map?.requested_segment;
    const allocations = details?.seat_map?.allocations || [];

    if (!requestedSegment) {
      return details?.seat_map?.unavailable_seat_ids || [];
    }

    return allocations
      .filter(
        (allocation) =>
          requestedSegment.src_stop_order < allocation.dst_stop_order &&
          requestedSegment.dst_stop_order > allocation.src_stop_order,
      )
      .map((allocation) => allocation.seat_id);
  }, [details?.seat_map]);
  
  const selectedSeats = useMemo(() => {
    const seats = [];
    (details?.coaches || []).forEach((coach) => {
      (coach.seats || []).forEach((seat) => {
        if (selectedSeatIds.includes(seat.id)) {
          seats.push(seat);
        }
      });
    });
    return seats;
  }, [details?.coaches, selectedSeatIds]);

  const selectedSeatLabels = selectedSeats.map((seat) => seat.seat_number);
  const allocatedSeatLabels = (confirmation?.booking?.ticket_allocations || [])
    .map((allocation) => allocation.seat?.seat_number)
    .filter(Boolean);
  const resolvedContactEmail = useWatch({
    control: confirmationControl,
    name: "contactEmail",
  }) || "";
  const resolvedContactPhone = useWatch({
    control: confirmationControl,
    name: "contactPhone",
  }) || "";
  const fromLabel = routeStops[0]?.station?.name || initialFromLabel;
  const toLabel = routeStops[routeStops.length - 1]?.station?.name || initialToLabel;
  const selectedTravelDate = details?.schedule?.travel_date || initialTravelDate || today;
  const segmentTiming = details?.schedule?.segment_timing || details?.seat_map?.requested_segment || {};
  const segmentDepartureTime = segmentTiming?.departure_time || details?.schedule?.departure_time;
  const segmentArrivalTime = segmentTiming?.arrival_time || details?.schedule?.expected_arrival_time;
  const segmentDepartureDayOffset = segmentTiming?.departure_day_offset || 0;
  const segmentArrivalDayOffset = segmentTiming?.arrival_day_offset || 0;
  const isCancelledSchedule = details?.schedule?.status === "cancelled";
  const resultsHref = `/search/results?src_station_id=${srcStationId || ""}&dst_station_id=${dstStationId || ""}&travel_date=${
    encodeURIComponent(selectedTravelDate)
  }&from_label=${encodeURIComponent(fromLabel)}&to_label=${encodeURIComponent(toLabel)}`;

  function updatePassengerCount(nextCount) {
    const normalized = Math.max(1, Math.min(6, Number(nextCount) || 1));
    const previousSeatCount = selectedSeatIds.length;
    setPassengerCount(normalized);

    const currentCount = fields.length;
    if (currentCount < normalized) {
      Array.from({ length: normalized - currentCount }).forEach(() => append(passengerTemplate()));
    } else if (currentCount > normalized) {
      remove(Array.from({ length: currentCount - normalized }, (_, index) => normalized + index));
    }

    dispatch(clearSeatSelection());
    setSeatSelectionNote("");
    setPassengerCountNote(
      previousSeatCount
        ? "Passenger count changed. Seats cleared."
        : `Passengers: ${normalized}`,
    );
  }

  useEffect(() => {
    resetConfirmation({
      contactEmail: user?.email || "",
      contactPhone: user?.phone || "",
      agreeToTerms: false,
    });
  }, [resetConfirmation, user?.email, user?.phone]);

  function toggleSeat(seat) {
    const coach = (details?.coaches || []).find((item) => item.seats.some((candidate) => candidate.id === seat.id));
    if (!coach) return;

    const isSelected = selectedSeatIds.includes(seat.id);

    if (isSelected) {
      dispatch(toggleSeatSelection({ coachId: coach.id, seatId: seat.id }));
      setSeatSelectionNote(`Removed ${seat.seat_number}`);
      return;
    }

    if (passengerCount === 1) {
      const previousSeatLabel = selectedSeats[0]?.seat_number;
      dispatch(clearSeatSelection());
      dispatch(toggleSeatSelection({ coachId: coach.id, seatId: seat.id }));
      setSeatSelectionNote(
        previousSeatLabel ? `Replaced ${previousSeatLabel} with ${seat.seat_number}` : `Selected ${seat.seat_number}`,
      );
      return;
    }

    if (selectedSeatIds.length >= passengerCount) {
      const seatToReplaceId = selectedSeatIds[selectedSeatIds.length - 1];
      const seatToReplace = selectedSeats.find((selectedSeat) => selectedSeat.id === seatToReplaceId);
      const coachToReplace = (details?.coaches || []).find((item) =>
        item.seats.some((candidate) => candidate.id === seatToReplaceId),
      );

      if (coachToReplace) {
        dispatch(removeSeatSelection({ coachId: coachToReplace.id, seatId: seatToReplaceId }));
      }

      dispatch(toggleSeatSelection({ coachId: coach.id, seatId: seat.id }));
      setSeatSelectionNote(
        seatToReplace?.seat_number
          ? `Replaced ${seatToReplace.seat_number} with ${seat.seat_number}`
          : `Selected ${seat.seat_number}`,
      );
      return;
    }

    dispatch(toggleSeatSelection({ coachId: coach.id, seatId: seat.id }));
    setSeatSelectionNote(`Selected ${seat.seat_number}`);
  }

  function canContinue() {
    if (currentStep === 0) {
      return Boolean(resolvedSelectedCoachType && passengerCount > 0);
    }

    if (currentStep === 1) {
      return isPassengerFormValid;
    }

    if (currentStep === 2) {
      return Boolean(resolvedSelectedCoachType) && selectedSeatIds.length === passengerCount;
    }

    return true;
  }

  const stepActionHint = useMemo(() => {
    if (currentStep === 0 && !resolvedSelectedCoachType) {
      return "Select class";
    }

    if (currentStep === 1 && !isPassengerFormValid) {
      return "Complete passenger details";
    }

    if (currentStep === 2 && selectedSeatIds.length !== passengerCount) {
      return `Select ${passengerCount} seat${passengerCount > 1 ? "s" : ""}`;
    }

    return "";
  }, [currentStep, isPassengerFormValid, passengerCount, resolvedSelectedCoachType, selectedSeatIds.length]);

  async function handleBookingSubmit() {
    const payload = {
      schedule_id: scheduleId,
      src_station_id: srcStationId,
      dst_station_id: dstStationId,
      coach_type: resolvedSelectedCoachType,
      seat_ids: selectedSeatIds,
      ...(selectedSeatIds.length === 1 ? { seat_id: selectedSeatIds[0] } : {}),
      passengers: getValues("passengers"),
      payment: {
        payment_method: paymentMethod,
        gateway_txn_id: `AUTO-${Date.now()}`,
      },
    };

    const action = await dispatch(checkoutThunk(payload));
    if (checkoutThunk.fulfilled.match(action)) {
      try {
        const refreshedDetails = await fetchScheduleDetails(scheduleId, {
          srcStationId,
          dstStationId,
        });
        dispatch(setSelectedSchedule(refreshedDetails));
      } catch (_refreshError) {
      }

      setIsBooked(true);
      setCurrentStep(4);
      toastSuccess("Your booking was confirmed successfully.", "Booking complete");
    } else if (checkoutThunk.rejected.match(action)) {
      const message = Array.isArray(action.payload)
        ? action.payload.join(", ")
        : String(action.payload || "Booking failed. Please try again.");
      toastError(message, "Booking failed");
    }
  }

  async function reloadBookingDetails() {
    if (!scheduleId || !srcStationId || !dstStationId) {
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const data = await fetchScheduleDetails(scheduleId, {
        srcStationId,
        dstStationId,
      });

      dispatch(setSelectedSchedule(data));
      setStatus("succeeded");
    } catch (requestError) {
      setStatus("failed");
      setError(
        requestError?.response?.data?.error || "Unable to load booking details.",
      );
    }
  }

  if (!hydrated) {
    return (
      <PageShell className="items-center px-6 py-12 sm:px-10">
        <div className="w-full">
          <LoadingState label="Loading booking..." />
        </div>
      </PageShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageShell className="items-center px-6 py-12 sm:px-10">
        <PageSection className="w-full">
          <SectionHeader
            eyebrow="Booking"
            title="Sign In"
            actions={<Button as={Link} href="/login">Go to login</Button>}
          />
        </PageSection>
      </PageShell>
    );
  }

  if (!scheduleId || !srcStationId || !dstStationId) {
    return (
      <PageShell>
        <div className="w-full">
          <EmptyState
            title="Booking Not Available"
            ctaLabel="Search trains"
            ctaHref="/search"
          />
        </div>
      </PageShell>
    );
  }

  if (isCancelledSchedule) {
    return (
      <PageShell>
        <div className="w-full">
          <EmptyState
            title="This Train Is Cancelled"
            description="This schedule is no longer available for booking. Please search for another train."
            ctaLabel="Search trains"
            ctaHref={resultsHref}
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <PageHero
            eyebrow="Booking"
            title="Journey Details"
            actions={
              <Button as={Link} href={resultsHref} variant="secondary">
                Back
              </Button>
            }
            meta={[
              `${fromLabel} to ${toLabel}`,
              `Passengers: ${passengerCount}`,
              resolvedSelectedCoachType ? `Class: ${formatCoachType(resolvedSelectedCoachType)}` : "Class: not selected",
            ]}
          />

          <PageSection>
            <div className="grid gap-3 sm:grid-cols-4">
              {stepLabels.map((label, index) => (
                <div
                  key={label}
                  className={`rounded-[1.2rem] border px-4 py-3 text-sm font-medium transition ${
                    currentStep === index
                      ? "border-[color-mix(in_srgb,var(--color-accent)_28%,var(--color-line))] bg-[var(--color-accent-soft)] text-[var(--color-panel-dark)]"
                      : currentStep > index
                        ? "border-[color-mix(in_srgb,var(--color-success)_24%,var(--color-line))] bg-[var(--color-success-soft)] text-[var(--color-success)]"
                        : "border-[var(--color-line)] bg-[var(--color-surface-soft)] text-[var(--color-muted-strong)]"
                  }`}
                >
                  <div className="text-[11px] uppercase tracking-[0.2em] opacity-70">
                    Step {index + 1}
                  </div>
                  <div className="mt-1">{label}</div>
                </div>
              ))}
            </div>
          </PageSection>

          {status === "loading" ? <LoadingState label="Loading train..." compact /> : null}

          {error ? (
            <PageSection className="p-5">
              <div className="flex flex-col gap-4 rounded-[1.4rem] border border-[color-mix(in_srgb,var(--color-danger)_26%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-danger-soft)_84%,var(--color-panel-strong))] p-4 text-sm text-[var(--color-danger)] sm:flex-row sm:items-center sm:justify-between">
                <span>{error}</span>
                <Button type="button" variant="secondary" onClick={reloadBookingDetails}>
                  Retry
                </Button>
              </div>
            </PageSection>
          ) : null}

          {status === "succeeded" && details ? (
            <>
              {currentStep === 0 ? (
                <PageSection>
                  <div className="grid gap-6">
                    <div className="rounded-[1.5rem] border border-[var(--color-line)] bg-[linear-gradient(180deg,_color-mix(in_srgb,var(--color-surface-strong)_94%,transparent)_0%,_color-mix(in_srgb,var(--color-surface-soft)_98%,transparent)_100%)] p-5 shadow-[var(--shadow-soft)]">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="primary">{details.schedule?.train?.train_number}</Badge>
                        <Badge variant="neutral">{details.schedule?.train?.train_type}</Badge>
                      </div>
                      <h2 className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">
                        {details.schedule?.train?.name}
                      </h2>
                      <p className="mt-2 text-sm text-[var(--color-muted)]">
                        {fromLabel} to {toLabel}
                      </p>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <DetailInfo
                          label="Departure"
                          value={formatScheduleDateTimeWithOffset(
                            selectedTravelDate,
                            segmentDepartureTime,
                            segmentDepartureDayOffset,
                          )}
                        />
                        <DetailInfo
                          label="Arrival"
                          value={formatScheduleDateTimeWithOffset(
                            selectedTravelDate,
                            segmentArrivalTime,
                            segmentArrivalDayOffset,
                          )}
                        />
                        <DetailInfo
                          label="Duration"
                          value={formatScheduleDurationWithOffsets(
                            selectedTravelDate,
                            segmentDepartureTime,
                            segmentArrivalTime,
                            segmentDepartureDayOffset,
                            segmentArrivalDayOffset,
                          )}
                        />
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[var(--color-line)] bg-[var(--color-surface-soft)] p-5 shadow-[var(--shadow-soft)]">
                      <p className="text-sm font-semibold text-[var(--color-ink)]">Route overview</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {routeStops.map((stop) => (
                          <div
                            key={stop.id}
                            className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface-strong)] px-4 py-2 text-sm text-[var(--color-muted-strong)] shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
                          >
                            {stop.station?.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[1fr_0.6fr]">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
                          Coach class
                        </label>
                        <select
                          value={resolvedSelectedCoachType}
                          onChange={(event) => {
                            setSelectedCoachType(event.target.value);
                            dispatch(clearSeatSelection());
                          }}
                          className="field-input"
                        >
                          <option value="">Select coach class</option>
                          {coachTypeOptions.map((option) => (
                            <option key={option.coachType} value={option.coachType}>
                              {formatCoachType(option.coachType)}
                              {option.totalSeats ? ` • ${option.totalSeats} seats` : ""}
                              {option.farePerSeat != null ? ` • ${formatCurrency(option.farePerSeat)} per passenger` : " • Fare unavailable"}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
                          Passengers
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="6"
                          value={passengerCount}
                          onChange={(event) => updatePassengerCount(event.target.value)}
                          className="field-input"
                        />
                        {passengerCountNote ? (
                          <p className="mt-2 text-sm text-[var(--color-panel-dark)]">
                            {passengerCountNote}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </PageSection>
              ) : null}

              {currentStep === 1 ? (
                <PageSection>
                  <SectionHeader
                    eyebrow="Passengers"
                    title="Passenger Details"
                  />
                  <div className="mt-8 space-y-5">
                    {fields.map((field, index) => (
                      <div key={index} className="rounded-[1.6rem] border border-[var(--color-line)] bg-[linear-gradient(180deg,_color-mix(in_srgb,var(--color-surface-strong)_94%,transparent)_0%,_color-mix(in_srgb,var(--color-surface-soft)_98%,transparent)_100%)] p-5 shadow-[var(--shadow-soft)]">
                        <p className="text-sm font-semibold text-[var(--color-ink)]">
                          Passenger {index + 1}
                        </p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <Field
                            label="First name"
                            error={passengerErrors.passengers?.[index]?.first_name?.message}
                            {...register(`passengers.${index}.first_name`)}
                            onChange={(event) => {
                              setValue(`passengers.${index}.first_name`, sanitizeNameInput(event.target.value), {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              });
                            }}
                          />
                          <Field
                            label="Last name"
                            error={passengerErrors.passengers?.[index]?.last_name?.message}
                            {...register(`passengers.${index}.last_name`)}
                            onChange={(event) => {
                              setValue(`passengers.${index}.last_name`, sanitizeNameInput(event.target.value), {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              });
                            }}
                          />
                          <Field
                            label="Age"
                            inputMode="numeric"
                            error={passengerErrors.passengers?.[index]?.age?.message}
                            {...register(`passengers.${index}.age`)}
                            onChange={(event) => {
                              setValue(`passengers.${index}.age`, sanitizeAgeInput(event.target.value), {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              });
                            }}
                          />
                          <SelectField
                            label="Gender"
                            error={passengerErrors.passengers?.[index]?.gender?.message}
                            {...register(`passengers.${index}.gender`)}
                            options={PASSENGER_GENDERS}
                          />
                          <SelectField
                            label="ID type"
                            error={passengerErrors.passengers?.[index]?.id_type?.message}
                            {...register(`passengers.${index}.id_type`, {
                              onChange: (event) => {
                                const nextType = event.target.value;
                                const currentIdNumber = getValues(`passengers.${index}.id_number`);

                                setValue(`passengers.${index}.id_type`, nextType, {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                  shouldValidate: true,
                                });
                                setValue(
                                  `passengers.${index}.id_number`,
                                  sanitizePassengerIdNumber(currentIdNumber, nextType),
                                  {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                    shouldValidate: true,
                                  },
                                );
                              },
                            })}
                            options={PASSENGER_ID_TYPES}
                          />
                          <Field
                            label="ID number"
                            error={passengerErrors.passengers?.[index]?.id_number?.message}
                            {...register(`passengers.${index}.id_number`)}
                            onChange={(event) => {
                              const idType = getValues(`passengers.${index}.id_type`);
                              setValue(
                                `passengers.${index}.id_number`,
                                sanitizePassengerIdNumber(event.target.value, idType),
                                {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                  shouldValidate: true,
                                },
                              );
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </PageSection>
              ) : null}

              {currentStep === 2 ? (
                <PageSection>
                  <SectionHeader
                    eyebrow="Seats"
                    title="Select Seats"
                  />
                  <div className="mt-8">
                    <SeatMap
                      coaches={details.coaches || []}
                      unavailableSeatIds={unavailableSeatIds}
                      selectedSeatIds={selectedSeatIds}
                      selectedCoachType={resolvedSelectedCoachType}
                      selectionLimit={passengerCount}
                      onToggleSeat={toggleSeat}
                    />
                  </div>
                  <div className="mt-6 rounded-[1.5rem] border border-[var(--color-line)] bg-[var(--color-panel-strong)] px-5 py-4 text-sm text-[var(--color-muted-strong)] shadow-[var(--shadow-soft)]">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant={selectedSeatLabels.length ? "primary" : "neutral"}>
                        {selectedSeatLabels.length}/{passengerCount}
                      </Badge>
                      <span>Selected Seats</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedSeatLabels.length ? (
                        selectedSeatLabels.map((label) => (
                          <span
                            key={label}
                            className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-panel-dark)]"
                          >
                            {label}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-[var(--color-muted)]">None</span>
                      )}
                    </div>
                    {seatSelectionNote ? (
                      <p className="mt-3 text-sm font-medium text-[var(--color-panel-dark)]">
                        {seatSelectionNote}
                      </p>
                    ) : null}
                    {selectedSeatLabels.length === passengerCount ? (
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--color-success)]">
                        Seats ready
                      </p>
                    ) : null}
                  </div>
                </PageSection>
              ) : null}

              {currentStep === 3 && !isBooked ? (
                <PageSection>
                  <SectionHeader
                    eyebrow="Confirm"
                    title="Confirm Booking"
                  />

                  <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <div className="space-y-6">
                      <div className="rounded-[1.8rem] border border-[var(--color-line)] bg-[var(--color-panel-strong)] p-6 shadow-[var(--shadow-soft)]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--color-accent)]">
                          Contact
                        </p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <Field
                            label="Email"
                            type="email"
                            error={confirmationErrors.contactEmail?.message}
                            {...registerConfirmation("contactEmail")}
                            onChange={(event) =>
                              setConfirmationValue("contactEmail", event.target.value, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              })
                            }
                          />
                          <Field
                            label="Phone"
                            type="text"
                            inputMode="numeric"
                            error={confirmationErrors.contactPhone?.message}
                            {...registerConfirmation("contactPhone")}
                            onChange={(event) =>
                              setConfirmationValue(
                                "contactPhone",
                                sanitizePhoneInput(event.target.value),
                                {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                  shouldValidate: true,
                                },
                              )
                            }
                          />
                        </div>
                        <label className="mt-6 flex items-start gap-3 rounded-[1.2rem] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-muted-strong)]">
                          <input
                            type="checkbox"
                            {...registerConfirmation("agreeToTerms")}
                            className="mt-1 h-4 w-4 rounded border-[var(--color-line)]"
                          />
                          <span>
                            I confirm the details.
                          </span>
                        </label>
                        {confirmationErrors.agreeToTerms?.message ? (
                          <p className="mt-2 text-sm text-[var(--color-danger)]">
                            {confirmationErrors.agreeToTerms.message}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-[1.8rem] bg-[var(--color-panel-strong)] p-6 shadow-[var(--shadow-panel)]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-ink)]">Summary</p>
                        </div>
                        <Badge variant="success" className="px-4 py-2 text-[11px]">
                          Payment
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-3 text-sm text-[var(--color-muted-strong)]">
                        <div className="flex items-center justify-between">
                          <span>Journey date</span>
                          <span>{formatDate(selectedTravelDate)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Passengers</span>
                          <span>{passengerCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Coach class</span>
                          <span>{resolvedSelectedCoachType ? formatCoachType(resolvedSelectedCoachType) : "Not selected"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Fare per passenger</span>
                          <span>{selectedFare == null ? "Fare unavailable" : formatCurrency(selectedFare)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Selected seats</span>
                          <span>{selectedSeatLabels.length ? selectedSeatLabels.join(", ") : "Not selected"}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-[var(--color-line)] pt-3 font-bold text-[var(--color-ink)]">
                          <span className="text-lg">Total amount</span>
                          <span className="text-2xl">
                            {selectedFare == null ? "Fare unavailable" : formatCurrency(selectedFare * passengerCount)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 rounded-[1.4rem] bg-[var(--color-accent-soft)] px-4 py-4 text-sm text-[var(--color-panel-dark)]">
                        Payment: <span className="font-semibold">{paymentOptions.find((option) => option.value === paymentMethod)?.label || "UPI"}</span>
                      </div>

                      <div className="mt-8">
                        <Button
                          type="button"
                          onClick={handleBookingSubmit}
                          disabled={
                            checkoutStatus === "loading" ||
                            !resolvedContactEmail ||
                            !resolvedContactPhone ||
                            !isConfirmationValid
                          }
                          className="w-full py-4 text-base disabled:opacity-50 disabled:shadow-none"
                        >
                          {checkoutStatus === "loading" ? "Processing..." : "Confirm Booking"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  {bookingError ? (
                    <div className="mt-4 rounded-[1.4rem] border border-[color-mix(in_srgb,var(--color-danger)_26%,var(--color-line))] bg-[color-mix(in_srgb,var(--color-danger-soft)_84%,var(--color-panel-strong))] p-4 text-sm text-[var(--color-danger)]">
                      {typeof bookingError === "string" ? bookingError : JSON.stringify(bookingError)}
                    </div>
                  ) : null}
                </PageSection>
              ) : null}

              {(currentStep === 3 && isBooked) || currentStep === 4 ? (
                <PageSection>
                  <SectionHeader
                    eyebrow="Confirmed"
                    title="Booking Confirmed"
                  />
                  <div className="mt-8 rounded-[1.6rem] bg-[linear-gradient(180deg,_#145f97_0%,_#0e4770_100%)] p-6 text-white shadow-[0_24px_60px_rgba(12,79,129,0.16)]">
                    <p className="text-sm text-white/76">Booking successful</p>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailInfo
                      label="Booking reference"
                      value={confirmation?.booking?.booking_ref || confirmation?.booking?.booking_reference || "Not available"}
                    />
                    <DetailInfo
                      label="Total fare"
                      value={formatCurrency(confirmation?.total_fare)}
                    />
                    <DetailInfo
                      label="Payment method"
                      value={paymentOptions.find((option) => option.value === paymentMethod)?.label || "Not available"}
                    />
                  </div>
                  <div className="mt-6 rounded-[1.5rem] bg-[var(--color-surface-soft)] p-5">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">
                      Seats
                    </p>
                    <div className="mt-4 space-y-3">
                      {(confirmation?.booking?.ticket_allocations || []).map((allocation, index) => {
                        const passenger = confirmation?.booking?.passengers?.[index];

                        return (
                          <div
                            key={allocation.id}
                            className="flex flex-col gap-2 rounded-[1.2rem] border border-[var(--color-line)] bg-[var(--color-surface-strong)] px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="font-semibold text-[var(--color-ink)]">
                                {passenger
                                  ? `${passenger.first_name} ${passenger.last_name}`
                                  : `Passenger ${index + 1}`}
                              </p>
                              <p className="mt-1 text-sm text-[var(--color-muted)]">
                                Seat {allocation.seat?.seat_number || "NA"} • {allocation.pnr || "PNR pending"}
                              </p>
                            </div>
                            <div className="rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-sm font-medium text-[var(--color-panel-dark)]">
                              {formatCurrency(allocation.fare)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button as={Link} href="/bookings">
                      View my bookings
                    </Button>
                    <Button as={Link} href="/search" variant="secondary">
                      Book another journey
                    </Button>
                  </div>
                </PageSection>
              ) : null}

              {currentStep < 3 ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
                    disabled={currentStep === 0}
                    variant="secondary"
                  >
                    Back
                  </Button>

                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      onClick={async () => {
                        if (currentStep === 1) {
                          const isStepValid = await trigger("passengers");
                          if (!isStepValid) {
                            return;
                          }
                        }
                        setCurrentStep((step) => step + 1);
                      }}
                      disabled={!canContinue()}
                    >
                      {currentStep === 2 ? "Review booking" : "Continue"}
                    </Button>
                    {!canContinue() && stepActionHint ? (
                      <p className="text-sm text-[var(--color-muted)]">{stepActionHint}</p>
                    ) : null}
                  </div>
                </div>
              ) : currentStep === 3 && !isBooked ? (
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
                    variant="secondary"
                  >
                    Back to seats
                  </Button>
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <BookingSummary
            schedule={details?.schedule}
            fromLabel={fromLabel}
            toLabel={toLabel}
            selectedCoachType={resolvedSelectedCoachType}
            passengerCount={passengerCount}
            selectedSeatLabels={selectedSeatLabels}
            allocatedSeatLabels={allocatedSeatLabels}
            farePerSeat={selectedFare}
            currentStep={currentStep}
            paymentMethod={paymentMethod}
          />

          {details?.availability ? (
            <PageSection className="p-6">
              <h2 className="text-xl font-semibold tracking-tight text-[var(--color-ink)]">
                Availability
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {Object.entries(details.availability.coach_type_availability || {}).map(
                  ([coachType, value]) => (
                    <div
                      key={coachType}
                      className="rounded-[1.25rem] bg-[var(--color-surface-soft)] px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-[var(--color-ink)]">{formatCoachType(coachType)}</span>
                        <span className="text-sm text-[var(--color-muted-strong)]">
                          {value.available_seats}/{value.total_active_seats}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </PageSection>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <PageShell className="items-center px-6 py-12 sm:px-10">
        <div className="w-full">
          <LoadingState label="Loading booking..." />
        </div>
      </PageShell>
    }>
      <BookingPageContent />
    </Suspense>
  );
}

function DetailInfo({ label, value }) {
  return (
    <div className="rounded-[1.2rem] bg-[var(--color-surface-soft)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">{value}</p>
    </div>
  );
}

function Field({ label, error, type = "text", className = "", ...props }) {
  const inputId = props.id || props.name;

  return (
    <div>
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        {...props}
        className={`field-input ${error ? "border-[var(--color-danger)]" : ""} ${className}`.trim()}
      />
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

function SelectField({ label, error, options, className = "", ...props }) {
  const inputId = props.id || props.name;

  return (
    <div>
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>
      <select
        id={inputId}
        {...props}
        className={`field-input ${error ? "border-[var(--color-danger)]" : ""} ${className}`.trim()}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
