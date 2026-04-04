import Badge from "@/components/ui/badge";
import { formatCoachType } from "@/utils/coach-formatters";
import { formatCurrency } from "@/utils/formatters";

export default function BookingSummary({
  schedule,
  fromLabel,
  toLabel,
  selectedCoachType,
  passengerCount,
  selectedSeatLabels,
  allocatedSeatLabels = [],
  farePerSeat,
  currentStep = 0,
  paymentMethod = "",
}) {
  const totalFare = farePerSeat && passengerCount ? Number(farePerSeat) * Number(passengerCount) : 0;
  const stepLabel = ["Review", "Passengers", "Seats", "Payment", "Confirm"][currentStep] || "Booking";

  return (
    <aside className="surface-panel rounded-[2rem] p-6">
      <div className="rounded-[1.7rem] bg-[var(--gradient-brand)] p-5 text-white shadow-[var(--shadow-button)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">Summary</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Journey Details</h2>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-[1.2rem] bg-[var(--color-accent-soft)] px-4 py-3">
        <span className="text-sm font-medium text-[var(--color-panel-dark)]">Current step</span>
        <Badge variant="primary" className="px-3 py-1.5 text-[11px]">
          {stepLabel}
        </Badge>
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
              {selectedCoachType ? formatCoachType(selectedCoachType) : "-"}
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
              Selected Seats
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--color-ink)]">
              {allocatedSeatLabels.length
                ? allocatedSeatLabels.join(", ")
                : selectedSeatLabels.length
                  ? selectedSeatLabels.join(", ")
                  : "-"}
            </p>
          </div>
          <div className="rounded-[1.2rem] bg-[var(--color-accent-soft)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Total
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--color-panel-dark)]">
              {farePerSeat ? formatCurrency(totalFare) : "-"}
            </p>
          </div>
        </div>

        <div className="rounded-[1.2rem] bg-[var(--color-surface-soft)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
            Payment
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
            {paymentMethod ? paymentMethod.toUpperCase() : "-"}
          </p>
        </div>
      </div>
    </aside>
  );
}
