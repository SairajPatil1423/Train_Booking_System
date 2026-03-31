import { formatCurrency } from "@/utils/formatters";

export default function BookingSummary({
  schedule,
  fromLabel,
  toLabel,
  selectedCoachType,
  passengerCount,
  selectedSeatLabels,
  farePerSeat,
  currentStep = 0,
  paymentMethod = "",
}) {
  const totalFare = farePerSeat && passengerCount ? Number(farePerSeat) * Number(passengerCount) : 0;
  const stepLabel = ["Review", "Passengers", "Seats", "Payment", "Confirm"][currentStep] || "Booking";

  return (
    <aside className="surface-panel rounded-[2rem] p-6">
      <p className="eyebrow">Booking summary</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
        Journey details
      </h2>
      <div className="mt-4 rounded-[1.2rem] bg-[#edf5fd] px-4 py-3 text-sm font-medium text-[var(--color-panel-dark)]">
        Current step: {stepLabel}
      </div>

      <div className="mt-6 space-y-4">
        <div className="rounded-[1.5rem] bg-[var(--color-surface-soft)] p-4">
          <p className="text-lg font-semibold text-[var(--color-ink)]">
            {schedule?.train?.name || "Train not selected"}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {fromLabel} to {toLabel}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-[1.2rem] bg-[var(--color-surface-soft)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Coach class
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
              {selectedCoachType || "Choose a coach class"}
            </p>
          </div>
          <div className="rounded-[1.2rem] bg-[var(--color-surface-soft)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Passengers
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
              {passengerCount || 0}
            </p>
          </div>
          <div className="rounded-[1.2rem] bg-[var(--color-surface-soft)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Selected seats
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
              {selectedSeatLabels.length ? selectedSeatLabels.join(", ") : "No seats selected"}
            </p>
          </div>
          <div className="rounded-[1.2rem] bg-[#edf5fd] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Estimated total
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--color-panel-dark)]">
              {farePerSeat ? formatCurrency(totalFare) : "Select a coach class"}
            </p>
          </div>
        </div>

        <div className="rounded-[1.2rem] bg-[var(--color-surface-soft)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
            Payment method
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
            {paymentMethod ? paymentMethod.toUpperCase() : "Choose payment option"}
          </p>
        </div>
      </div>
    </aside>
  );
}
