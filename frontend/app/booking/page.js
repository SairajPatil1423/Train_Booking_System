"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import BookingSummary from "@/components/booking-summary";
import EmptyState from "@/components/empty-state";
import LoadingState from "@/components/loading-state";
import PageShell from "@/components/page-shell";
import SeatMap from "@/components/seat-map";
import SectionHeader from "@/components/section-header";
import { createBooking } from "@/features/booking/bookingService";
import { fetchScheduleDetails } from "@/features/trains/trainService";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDuration,
} from "@/utils/formatters";

const stepLabels = ["Review", "Passengers", "Seats", "Payment", "Confirm"];
const paymentOptions = [
  {
    value: "upi",
    label: "UPI",
    description: "Fast payment using any supported UPI app.",
  },
  {
    value: "card",
    label: "Credit / Debit Card",
    description: "Use Visa, Mastercard, RuPay, or other supported cards.",
  },
  {
    value: "netbanking",
    label: "Net Banking",
    description: "Complete payment directly from your bank account.",
  },
  {
    value: "razorpay",
    label: "Razorpay",
    description: "Gateway slot prepared for live Razorpay integration.",
  },
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
  const { isAuthenticated, hydrated, user } = useSelector((state) => state.auth);
  const scheduleId = searchParams.get("schedule_id");
  const srcStationId = searchParams.get("src_station_id");
  const dstStationId = searchParams.get("dst_station_id");
  const initialFromLabel = searchParams.get("from_label") || "Source";
  const initialToLabel = searchParams.get("to_label") || "Destination";
  const initialTravelDate = searchParams.get("travel_date") || "";

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [details, setDetails] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCoachType, setSelectedCoachType] = useState("");
  const [passengerCount, setPassengerCount] = useState(1);
  const [passengers, setPassengers] = useState([passengerTemplate()]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

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

        setDetails(data);
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
  }, [dstStationId, isAuthenticated, scheduleId, srcStationId]);

  useEffect(() => {
    setContactEmail(user?.email || "");
    setContactPhone(user?.phone || "");
  }, [user?.email, user?.phone]);

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
  const fromLabel = routeStops[0]?.station?.name || initialFromLabel;
  const toLabel = routeStops[routeStops.length - 1]?.station?.name || initialToLabel;
  const resultsHref = `/search/results?src_station_id=${srcStationId || ""}&dst_station_id=${dstStationId || ""}&travel_date=${
    encodeURIComponent(details?.schedule?.travel_date || initialTravelDate)
  }&from_label=${encodeURIComponent(fromLabel)}&to_label=${encodeURIComponent(toLabel)}`;

  function updatePassengerCount(nextCount) {
    const normalized = Math.max(1, Math.min(6, Number(nextCount) || 1));
    setPassengerCount(normalized);
    setPassengers((current) => {
      if (current.length === normalized) {
        return current;
      }

      if (current.length > normalized) {
        return current.slice(0, normalized);
      }

      return [...current, ...Array.from({ length: normalized - current.length }, passengerTemplate)];
    });
    setSelectedSeatIds((current) => current.slice(0, normalized));
  }

  function updatePassenger(index, key, value) {
    setPassengers((current) =>
      current.map((passenger, passengerIndex) =>
        passengerIndex === index ? { ...passenger, [key]: value } : passenger,
      ),
    );
  }

  function toggleSeat(seat) {
    setSelectedSeatIds((current) => {
      if (current.includes(seat.id)) {
        return current.filter((id) => id !== seat.id);
      }

      if (current.length >= passengerCount) {
        return current;
      }

      return [...current, seat.id];
    });
  }

  function canContinue() {
    if (currentStep === 0) {
      return Boolean(selectedCoachType && passengerCount > 0);
    }

    if (currentStep === 1) {
      return passengers.every(
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
      return selectedSeatIds.length === passengerCount;
    }

    if (currentStep === 3) {
      return Boolean(paymentMethod && contactEmail && contactPhone && agreeToTerms);
    }

    return true;
  }

  async function handleConfirmBooking() {
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        booking: {
          schedule_id: scheduleId,
          src_station_id: srcStationId,
          dst_station_id: dstStationId,
          coach_type: selectedCoachType,
          passengers: passengers,
          payment: {
            payment_method: paymentMethod,
            gateway_txn_id: "",
          },
        },
      };

      const data = await createBooking(payload);
      setConfirmation(data);
      setCurrentStep(4);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.error ||
          requestError?.response?.data?.errors?.[0] ||
          "Unable to complete your booking right now.",
      );
    } finally {
      setSubmitting(false);
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
        <div className="surface-panel w-full rounded-[2rem] p-8">
          <SectionHeader
            eyebrow="Protected area"
            title="Sign in before continuing to booking."
            description="Login to review route details, select seats, and confirm your journey."
            actions={<Link href="/login" className="primary-button px-5 py-3 text-sm">Go to login</Link>}
          />
        </div>
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
          <section className="surface-panel rounded-[2rem] p-8">
            <SectionHeader
              eyebrow="Train booking"
              title="Complete your journey details"
              description="Review the route, add passenger details, choose seats, and continue to payment."
              actions={
                <Link href={resultsHref} className="secondary-button px-5 py-3 text-sm">
                  Back to results
                </Link>
              }
            />

            <div className="mt-8 grid gap-3 sm:grid-cols-5">
              {stepLabels.map((label, index) => (
                <div
                  key={label}
                  className={`rounded-[1.2rem] px-4 py-3 text-sm font-medium ${
                    currentStep === index
                      ? "bg-[#edf5fd] text-[var(--color-panel-dark)]"
                      : currentStep > index
                        ? "bg-[#eaf6f1] text-[#1f7a57]"
                        : "bg-[var(--color-surface-soft)] text-[var(--color-muted-strong)]"
                  }`}
                >
                  {index + 1}. {label}
                </div>
              ))}
            </div>
          </section>

          {status === "loading" ? <LoadingState label="Loading train details..." /> : null}

          {error ? (
            <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {status === "succeeded" && details ? (
            <>
              {currentStep === 0 ? (
                <section className="surface-panel rounded-[2rem] p-8">
                  <div className="grid gap-6">
                    <div className="rounded-[1.5rem] border border-[var(--color-line)] bg-[linear-gradient(180deg,_#ffffff_0%,_#f9fcff_100%)] p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                        {details.schedule?.train?.train_number}
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">
                        {details.schedule?.train?.name}
                      </h2>
                      <p className="mt-2 text-sm text-[var(--color-muted)]">
                        {fromLabel} to {toLabel} • {details.schedule?.train?.train_type}
                      </p>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <DetailInfo label="Departure" value={formatDateTime(details.schedule?.departure_time)} />
                        <DetailInfo label="Arrival" value={formatDateTime(details.schedule?.expected_arrival_time)} />
                        <DetailInfo
                          label="Duration"
                          value={formatDuration(
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
                          onChange={(event) => setSelectedCoachType(event.target.value)}
                          className="field-input"
                        >
                          <option value="">Select coach class</option>
                          {Object.entries(fareOptions).map(([coachType, value]) => (
                            <option key={coachType} value={coachType}>
                              {coachType} • {formatCurrency(value.fare_per_seat)} per passenger
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
                </section>
              ) : null}

              {currentStep === 1 ? (
                <section className="surface-panel rounded-[2rem] p-8">
                  <SectionHeader
                    eyebrow="Passenger details"
                    title="Add traveller information"
                    description="Each passenger must have a valid identity detail before you continue to seat selection."
                  />
                  <div className="mt-8 space-y-5">
                    {passengers.map((passenger, index) => (
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
                </section>
              ) : null}

              {currentStep === 2 ? (
                <section className="surface-panel rounded-[2rem] p-8">
                  <SectionHeader
                    eyebrow="Seat selection"
                    title="Choose your seats"
                    description="Select one seat for each passenger. Unavailable seats are already marked."
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
                  <div className="mt-6 rounded-[1.4rem] bg-[var(--color-surface-soft)] px-5 py-4 text-sm text-[var(--color-muted-strong)]">
                    {selectedSeatLabels.length
                      ? `Selected seats: ${selectedSeatLabels.join(", ")}`
                      : "Choose one seat for each passenger to continue."}
                  </div>
                </section>
              ) : null}

              {currentStep === 3 ? (
                <section className="surface-panel rounded-[2rem] p-8">
                  <SectionHeader
                    eyebrow="Payment"
                    title="Review fare and choose payment method"
                    description="Razorpay can be connected later. For now, we keep the checkout flow ready with realistic payment options."
                  />
                  <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                    <div className="space-y-4">
                      {paymentOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPaymentMethod(option.value)}
                          className={`flex w-full items-center justify-between rounded-[1.4rem] border px-5 py-4 text-left transition ${
                            paymentMethod === option.value
                              ? "border-[#84b7df] bg-[#edf5fd] text-[var(--color-panel-dark)]"
                              : "border-[var(--color-line)] bg-white text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]"
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{option.label}</div>
                            <div className="mt-1 text-sm text-[var(--color-muted)]">
                              {option.description}
                            </div>
                          </div>
                          <span className="text-sm">
                            {paymentMethod === option.value ? "Selected" : "Choose"}
                          </span>
                        </button>
                      ))}

                      <div className="rounded-[1.6rem] border border-[var(--color-line)] bg-[linear-gradient(180deg,_#ffffff_0%,_#f9fcff_100%)] p-5">
                        <p className="text-sm font-semibold text-[var(--color-ink)]">
                          Contact details for this booking
                        </p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <Field
                            label="Email"
                            type="email"
                            value={contactEmail}
                            onChange={setContactEmail}
                          />
                          <Field
                            label="Phone"
                            type="tel"
                            value={contactPhone}
                            onChange={setContactPhone}
                          />
                        </div>
                        <label className="mt-4 flex items-start gap-3 rounded-[1.2rem] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-muted-strong)]">
                          <input
                            type="checkbox"
                            checked={agreeToTerms}
                            onChange={(event) => setAgreeToTerms(event.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-[var(--color-line)]"
                          />
                          <span>
                            I confirm that the passenger details are correct and I agree to continue with this payment.
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="rounded-[1.6rem] bg-[var(--color-surface-soft)] p-5">
                      <p className="text-sm font-semibold text-[var(--color-ink)]">Fare review</p>
                      <div className="mt-4 space-y-3 text-sm text-[var(--color-muted-strong)]">
                        <div className="flex items-center justify-between">
                          <span>Journey date</span>
                          <span>{formatDate(details.schedule?.travel_date)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Passengers</span>
                          <span>{passengerCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Coach class</span>
                          <span>{selectedCoachType || "Not selected"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Fare per passenger</span>
                          <span>{formatCurrency(selectedFare)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Selected seats</span>
                          <span>{selectedSeatLabels.length ? selectedSeatLabels.join(", ") : "Pending"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Payment method</span>
                          <span>
                            {paymentOptions.find((option) => option.value === paymentMethod)?.label || "Pending"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-[var(--color-line)] pt-3 font-semibold text-[var(--color-ink)]">
                          <span>Total fare</span>
                          <span>{formatCurrency(selectedFare * passengerCount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}

              {currentStep === 4 ? (
                <section className="surface-panel rounded-[2rem] p-8">
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
                      Passenger seat details
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
                    <Link href="/bookings" className="primary-button px-5 py-3 text-sm">
                      View my bookings
                    </Link>
                    <Link href="/search" className="secondary-button px-5 py-3 text-sm">
                      Book another journey
                    </Link>
                  </div>
                </section>
              ) : null}

              {currentStep < 4 ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
                    disabled={currentStep === 0}
                    className="secondary-button px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Back
                  </button>

                  {currentStep === 3 ? (
                    <button
                      type="button"
                      onClick={handleConfirmBooking}
                      disabled={!canContinue() || submitting}
                      className="primary-button px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? "Confirming..." : "Confirm booking"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((step) => step + 1)}
                      disabled={!canContinue()}
                      className="primary-button px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Continue
                    </button>
                  )}
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
            farePerSeat={selectedFare}
            currentStep={currentStep}
            paymentMethod={paymentMethod}
          />

          {details?.availability ? (
            <section className="surface-panel rounded-[2rem] p-6">
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
                      <span className="font-semibold text-[var(--color-ink)]">{coachType}</span>
                      <span className="text-sm text-[var(--color-muted-strong)]">
                        {value.available_seats}/{value.total_active_seats} seats
                      </span>
                    </div>
                  ),
                )}
              </div>
            </section>
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
      <label className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
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
      <label className="mb-2 block text-sm font-semibold text-[var(--color-ink)]">
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
