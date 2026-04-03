"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { fetchScheduleDetails } from "@/features/trains/trainService";
import {
  formatCurrency,
  formatDate,
  formatScheduleDateTime,
  formatScheduleDuration,
} from "@/utils/formatters";
import {
  resetBooking,
  clearSeatSelection,
  setSelectedCoachId,
  setSelectedSchedule,
  setPassengers,
  toggleSeatSelection,
  checkoutThunk,
  selectSelectedSeatsArray,
} from "@/features/booking/bookingSlice";
import { toastError, toastSuccess } from "@/utils/toast";

const stepLabels = ["Review", "Passengers", "Seats", "Confirmation"];
const paymentOptions = [
  { id: "upi", label: "Unified Payments Interface (UPI)", value: "upi" },
  { id: "card", label: "Debit / Credit Card", value: "card" },
  { id: "netbanking", label: "Net Banking", value: "netbanking" },
];

const passengerTemplate = () => ({
  first_name: "",
  last_name: "",
  age: "",
  gender: "male",
  id_type: "Aadhaar",
  id_number: "",
});

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { isAuthenticated, hydrated, user } = useSelector((state) => state.auth);
  const { 
    selectedSchedule: details, 
    status: bookingStatus, 
    error: bookingError,
    selectedSeats: selectedSeatsMap,
    status: checkoutStatus,
    lastBooking: confirmation,
  } = useSelector((state) => state.booking);

  const selectedSeatIds = useSelector(state => selectSelectedSeatsArray(state));

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
  const [passengersState, setPassengersState] = useState([passengerTemplate()]);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

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

  const routeStops = useMemo(() => {
    const stops = details?.stops || [];
    const srcIndex = stops.findIndex((stop) => stop.station?.id === srcStationId);
    const dstIndex = stops.findIndex((stop) => stop.station?.id === dstStationId);

    if (srcIndex === -1 || dstIndex === -1 || dstIndex < srcIndex) {
      return stops;
    }

    return stops.slice(srcIndex, dstIndex + 1);
  }, [details?.stops, dstStationId, srcStationId]);

  const fareOptions = details?.fare_options || {};
  const selectedFare = fareOptions[selectedCoachType]?.fare_per_seat || 0;
  const unavailableSeatIds = details?.seat_map?.unavailable_seat_ids || [];
  
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
  const resolvedContactEmail = contactEmail || user?.email || "";
  const resolvedContactPhone = contactPhone || user?.phone || "";
  const fromLabel = routeStops[0]?.station?.name || initialFromLabel;
  const toLabel = routeStops[routeStops.length - 1]?.station?.name || initialToLabel;
  const selectedTravelDate = details?.schedule?.travel_date || initialTravelDate || today;
  const resultsHref = `/search/results?src_station_id=${srcStationId || ""}&dst_station_id=${dstStationId || ""}&travel_date=${
    encodeURIComponent(selectedTravelDate)
  }&from_label=${encodeURIComponent(fromLabel)}&to_label=${encodeURIComponent(toLabel)}`;

  function updatePassengerCount(nextCount) {
    const normalized = Math.max(1, Math.min(6, Number(nextCount) || 1));
    setPassengerCount(normalized);
    setPassengersState((current) => {
      let next;
      if (current.length === normalized) {
        next = current;
      } else if (current.length > normalized) {
        next = current.slice(0, normalized);
      } else {
        next = [...current, ...Array.from({ length: normalized - current.length }, passengerTemplate)];
      }
      return next;
    });
    dispatch(clearSeatSelection());
  }

  function updatePassenger(index, key, value) {
    setPassengersState((current) =>
      current.map((passenger, passengerIndex) =>
        passengerIndex === index ? { ...passenger, [key]: value } : passenger,
      ),
    );
  }

  function toggleSeat(seat) {
    // Find coach for this seat
    const coach = (details?.coaches || []).find(c => c.seats.some(s => s.id === seat.id));
    if (!coach) return;

    if (!selectedSeatIds.includes(seat.id) && selectedSeatIds.length >= passengerCount) {
      return;
    }

    dispatch(toggleSeatSelection({ coachId: coach.id, seatId: seat.id }));
  }

  function canContinue() {
    if (currentStep === 0) {
      return Boolean(selectedCoachType && passengerCount > 0);
    }

    if (currentStep === 1) {
      return passengersState.every(
        (passenger) =>
          passenger.first_name &&
          passenger.last_name &&
          passenger.age &&
          passenger.gender &&
          passenger.id_type &&
          passenger.id_number,
      );
    }

    if (currentStep === 2) {
      return true;
    }

    return true;
  }

  async function handleBookingSubmit() {
    const payload = {
      schedule_id: scheduleId,
      src_station_id: srcStationId,
      dst_station_id: dstStationId,
      coach_type: selectedCoachType,
      passengers: passengersState,
      payment: {
        payment_method: paymentMethod,
        gateway_txn_id: `AUTO-${Date.now()}`,
      },
    };

    const action = await dispatch(checkoutThunk(payload));
    if (checkoutThunk.fulfilled.match(action)) {
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

  if (!hydrated) {
    return (
      <PageShell className="items-center px-6 py-12 sm:px-10">
        <div className="w-full">
          <LoadingState label="Preparing booking flow..." />
        </div>
      </PageShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageShell className="items-center px-6 py-12 sm:px-10">
        <PageSection className="w-full">
          <SectionHeader
            eyebrow="Protected area"
            title="Sign in before continuing to booking."
            description="Login to review route details, select seats, and confirm your journey."
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
            title="Booking details are missing"
            description="Please start from the train search results page and choose a schedule first."
            ctaLabel="Search trains"
            ctaHref="/search"
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
            eyebrow="Train booking"
            title="Complete your journey details"
            description="Review the route, add passenger details, choose seats, and continue to confirmation."
            actions={
              <Button as={Link} href={resultsHref} variant="secondary">
                Back to results
              </Button>
            }
            meta={[
              `Route: ${fromLabel} to ${toLabel}`,
              `Passengers: ${passengerCount}`,
              selectedCoachType ? `Class: ${formatCoachType(selectedCoachType)}` : "Class: not selected",
            ]}
          />

          <PageSection>
            <div className="grid gap-3 sm:grid-cols-4">
              {stepLabels.map((label, index) => (
                <div
                  key={label}
                  className={`rounded-[1.2rem] border px-4 py-3 text-sm font-medium transition ${
                    currentStep === index
                      ? "border-[rgba(37,99,235,0.18)] bg-[#edf5fd] text-[var(--color-panel-dark)]"
                      : currentStep > index
                        ? "border-[rgba(31,138,91,0.16)] bg-[#eaf6f1] text-[#1f7a57]"
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

          {status === "loading" ? <LoadingState label="Loading train details..." /> : null}

          {error ? (
            <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {status === "succeeded" && details ? (
            <>
              {currentStep === 0 ? (
                <PageSection>
                  <div className="grid gap-6">
                    <div className="rounded-[1.5rem] border border-[var(--color-line)] bg-[linear-gradient(180deg,_#ffffff_0%,_#f9fcff_100%)] p-5">
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
                        <DetailInfo label="Departure" value={formatScheduleDateTime(selectedTravelDate, details.schedule?.departure_time)} />
                        <DetailInfo label="Arrival" value={formatScheduleDateTime(selectedTravelDate, details.schedule?.expected_arrival_time)} />
                        <DetailInfo
                          label="Duration"
                          value={formatScheduleDuration(
                            selectedTravelDate,
                            details.schedule?.departure_time,
                            details.schedule?.expected_arrival_time,
                          )}
                        />
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] bg-[var(--color-surface-soft)] p-5">
                      <p className="text-sm font-semibold text-[var(--color-ink)]">Route overview</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {routeStops.map((stop) => (
                          <div
                            key={stop.id}
                            className="rounded-full bg-white px-4 py-2 text-sm text-[var(--color-muted-strong)] ring-1 ring-[var(--color-line)]"
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
                          value={selectedCoachType}
                          onChange={(event) => {
                            setSelectedCoachType(event.target.value);
                            dispatch(clearSeatSelection());
                          }}
                          className="field-input"
                        >
                          <option value="">Select coach class</option>
                          {Object.entries(fareOptions).map(([coachType, value]) => (
                            <option key={coachType} value={coachType}>
                              {formatCoachType(coachType)} • {formatCurrency(value.fare_per_seat)} per passenger
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
                      </div>
                    </div>
                  </div>
                </PageSection>
              ) : null}

              {currentStep === 1 ? (
                <PageSection>
                  <SectionHeader
                    eyebrow="Passenger details"
                    title="Add traveller information"
                    description="Each passenger must have a valid identity detail before you continue to seat selection."
                  />
                  <div className="mt-8 space-y-5">
                    {passengersState.map((passenger, index) => (
                      <div key={index} className="rounded-[1.6rem] border border-[var(--color-line)] bg-[linear-gradient(180deg,_#ffffff_0%,_#f9fcff_100%)] p-5">
                        <p className="text-sm font-semibold text-[var(--color-ink)]">
                          Passenger {index + 1}
                        </p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <Field label="First name" value={passenger.first_name} onChange={(value) => updatePassenger(index, "first_name", value)} />
                          <Field label="Last name" value={passenger.last_name} onChange={(value) => updatePassenger(index, "last_name", value)} />
                          <Field label="Age" type="number" value={passenger.age} onChange={(value) => updatePassenger(index, "age", value)} />
                          <SelectField
                            label="Gender"
                            value={passenger.gender}
                            options={["male", "female", "other"]}
                            onChange={(value) => updatePassenger(index, "gender", value)}
                          />
                          <SelectField
                            label="ID type"
                            value={passenger.id_type}
                            options={["Aadhaar", "PAN", "Passport", "Driving Licence"]}
                            onChange={(value) => updatePassenger(index, "id_type", value)}
                          />
                          <Field label="ID number" value={passenger.id_number} onChange={(value) => updatePassenger(index, "id_number", value)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </PageSection>
              ) : null}

              {currentStep === 2 ? (
                <PageSection>
                  <SectionHeader
                    eyebrow="Seat selection"
                    title="Review coach layout and seat availability"
                    description="You can preview preferred seats here, but final seats are allocated automatically by the backend when the booking is confirmed."
                  />
                  <div className="mt-8">
                    <SeatMap
                      coaches={details.coaches || []}
                      unavailableSeatIds={unavailableSeatIds}
                      selectedSeatIds={selectedSeatIds}
                      selectedCoachType={selectedCoachType}
                      selectionLimit={passengerCount}
                      onToggleSeat={toggleSeat}
                    />
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[1.4rem] bg-[var(--color-surface-soft)] px-5 py-4 text-sm text-[var(--color-muted-strong)]">
                    <Badge variant={selectedSeatLabels.length ? "primary" : "neutral"}>
                      {selectedSeatLabels.length}/{passengerCount} preferences
                    </Badge>
                    <span>
                      {selectedSeatLabels.length
                        ? `Preferred seats: ${selectedSeatLabels.join(", ")}. Final seat allocation happens automatically at booking confirmation.`
                        : "Seat allocation happens automatically when the booking is confirmed."}
                    </span>
                  </div>
                </PageSection>
              ) : null}

              {currentStep === 3 && !isBooked ? (
                <PageSection>
                  <SectionHeader
                    eyebrow="Final confirmation"
                    title="Confirm your booking details"
                    description="Review the fare and passenger details before finalizing your booking."
                  />

                  <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <div className="space-y-6">
                      <div className="rounded-[1.6rem] border border-[var(--color-line)] bg-white p-6 shadow-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--color-accent)]">
                          Contact info
                        </p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <Field
                            label="Email"
                            type="email"
                            value={resolvedContactEmail}
                            onChange={setContactEmail}
                          />
                          <Field
                            label="Phone"
                            type="tel"
                            value={resolvedContactPhone}
                            onChange={setContactPhone}
                          />
                        </div>
                        <label className="mt-6 flex items-start gap-3 rounded-[1.2rem] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-muted-strong)]">
                          <input
                            type="checkbox"
                            checked={agreeToTerms}
                            onChange={(event) => setAgreeToTerms(event.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-[var(--color-line)]"
                          />
                          <span>
                            I confirm that the passenger details are correct and I agree to proceed with this booking.
                          </span>
                        </label>
                      </div>

                      <div className="rounded-[1.6rem] bg-indigo-50/50 p-6 ring-1 ring-indigo-100">
                        <p className="text-sm font-semibold text-indigo-900">Premium Booking</p>
                        <p className="mt-2 text-sm text-indigo-700">
                          Your payment will be processed automatically using the selected payment mode.
                          Final seat numbers are assigned by the booking engine at confirmation, not by the preview grid.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[1.6rem] bg-[var(--color-surface-soft)] p-6 shadow-inner">
                      <p className="text-sm font-semibold text-[var(--color-ink)]">Fare summary</p>
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
                          <span>{selectedCoachType ? formatCoachType(selectedCoachType) : "Not selected"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Fare per passenger</span>
                          <span>{formatCurrency(selectedFare)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Seat allocation</span>
                          <span>Automatic</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-[var(--color-line)] pt-3 font-bold text-[var(--color-ink)]">
                          <span className="text-lg">Total amount</span>
                          <span className="text-2xl">{formatCurrency(selectedFare * passengerCount)}</span>
                        </div>
                      </div>

                      <div className="mt-8">
                        <Button
                          type="button"
                          onClick={handleBookingSubmit}
                          disabled={
                            checkoutStatus === "loading" ||
                            !agreeToTerms ||
                            !resolvedContactEmail ||
                            !resolvedContactPhone
                          }
                          className="w-full py-4 text-base shadow-[0_12px_36px_rgba(12,79,129,0.2)] disabled:opacity-50 disabled:shadow-none"
                        >
                          {checkoutStatus === "loading" ? "Processing..." : "Confirm & Book Now"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  {bookingError ? (
                    <div className="mt-4 rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {typeof bookingError === "string" ? bookingError : JSON.stringify(bookingError)}
                    </div>
                  ) : null}
                </PageSection>
              ) : null}

              {(currentStep === 3 && isBooked) || currentStep === 4 ? (
                <PageSection>
                  <SectionHeader
                    eyebrow="Booking confirmed"
                    title="Your train booking has been created"
                    description="Your confirmation details are ready below."
                  />
                  <div className="mt-8 rounded-[1.6rem] bg-[linear-gradient(180deg,_#145f97_0%,_#0e4770_100%)] p-6 text-white shadow-[0_24px_60px_rgba(12,79,129,0.16)]">
                    <p className="text-sm text-white/76">
                      Booking successful. Please keep the booking reference and seat details ready for travel.
                    </p>
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
                  <div className="mt-6 rounded-[1.4rem] bg-[var(--color-surface-soft)] p-5">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">
                      Passenger seat allocation
                    </p>
                    <div className="mt-4 space-y-3">
                      {(confirmation?.booking?.ticket_allocations || []).map((allocation, index) => {
                        const passenger = confirmation?.booking?.passengers?.[index];

                        return (
                          <div
                            key={allocation.id}
                            className="flex flex-col gap-2 rounded-[1.2rem] bg-white px-4 py-4 ring-1 ring-[var(--color-line)] sm:flex-row sm:items-center sm:justify-between"
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
                            <div className="rounded-full bg-[#edf5fd] px-4 py-2 text-sm font-medium text-[var(--color-panel-dark)]">
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

                  <Button
                    type="button"
                    onClick={() => setCurrentStep((step) => step + 1)}
                    disabled={!canContinue()}
                  >
                    {currentStep === 2 ? "Review booking" : "Continue"}
                  </Button>
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

        <div className="space-y-6">
          <BookingSummary
            schedule={details?.schedule}
            fromLabel={fromLabel}
            toLabel={toLabel}
            selectedCoachType={selectedCoachType}
            passengerCount={passengerCount}
            selectedSeatLabels={selectedSeatLabels}
            allocatedSeatLabels={allocatedSeatLabels}
            farePerSeat={selectedFare}
            currentStep={currentStep}
            paymentMethod={paymentMethod}
          />

          {details?.availability ? (
            <PageSection className="p-6">
              <p className="eyebrow">Availability</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                Class-wise seats
              </h2>
              <div className="mt-5 space-y-3">
                {Object.entries(details.availability.coach_type_availability || {}).map(
                  ([coachType, value]) => (
                    <div
                      key={coachType}
                      className="flex items-center justify-between rounded-[1.25rem] bg-[var(--color-surface-soft)] px-4 py-3"
                    >
                      <span className="font-semibold text-[var(--color-ink)]">{formatCoachType(coachType)}</span>
                      <span className="text-sm text-[var(--color-muted-strong)]">
                        {value.available_seats}/{value.total_active_seats} seats
                      </span>
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
          <LoadingState label="Preparing booking flow..." />
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

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="field-label">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-input"
      />
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <div>
      <label className="field-label">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-input"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
