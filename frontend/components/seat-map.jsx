export default function SeatMap({
  coaches,
  unavailableSeatIds,
  selectedSeatIds,
  selectedCoachType,
  selectionLimit,
  onToggleSeat,
}) {
  const matchingCoaches = coaches.filter((coach) => coach.coach_type === selectedCoachType);

  if (!selectedCoachType) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-[var(--color-line)] bg-[var(--color-surface-soft)] px-5 py-10 text-sm text-[var(--color-muted)]">
        Choose a coach class to view seats.
      </div>
    );
  }

  if (!matchingCoaches.length) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-[var(--color-line)] bg-[var(--color-surface-soft)] px-5 py-10 text-sm text-[var(--color-muted)]">
        No coaches are available for the selected class.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <LegendItem color="bg-[#eaf6f1]" label="Available" />
        <LegendItem color="bg-[#edf5fd]" label="Selected" />
        <LegendItem color="bg-[#fef0ef]" label="Booked" />
        <LegendItem color="bg-[#eef2f6]" label="Disabled" />
      </div>

      <div className="space-y-5">
        {matchingCoaches.map((coach) => (
          <section
            key={coach.id}
            className="rounded-[1.75rem] border border-[var(--color-line)] bg-[linear-gradient(180deg,_#ffffff_0%,_#f9fcff_100%)] p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--color-ink)]">
                  Coach {coach.coach_number}
                </p>
                <p className="text-sm text-[var(--color-muted)]">{coach.coach_type}</p>
              </div>
              <div className="rounded-full bg-[#edf5fd] px-4 py-2 text-sm font-medium text-[var(--color-panel-dark)]">
                Select {selectionLimit} seat{selectionLimit === 1 ? "" : "s"}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {groupSeats(coach.seats || []).map((row, rowIndex) => (
                <div key={`${coach.id}-${rowIndex}`} className="rounded-[1.4rem] bg-[var(--color-surface-soft)] p-3">
                  <div className="grid grid-cols-[1fr_1fr_0.35fr_1fr_1fr] gap-2">
                    {row.map((seat, seatIndex) => {
                      if (!seat) {
                        return <div key={`${coach.id}-${rowIndex}-${seatIndex}`} />;
                      }

                      const isUnavailable =
                        !seat.is_active || unavailableSeatIds.includes(seat.id);
                      const isSelected = selectedSeatIds.includes(seat.id);
                      const isAtLimit =
                        !isSelected && selectedSeatIds.length >= selectionLimit;

                      return (
                        <button
                          key={seat.id}
                          type="button"
                          onClick={() => onToggleSeat(seat)}
                          disabled={isUnavailable || isAtLimit}
                          className={`rounded-[1rem] border px-3 py-3 text-left transition ${
                            isSelected
                              ? "border-[#82b6df] bg-[#edf5fd] text-[var(--color-panel-dark)]"
                              : isUnavailable
                                ? seat.is_active
                                  ? "border-[#f3d7d4] bg-[#fef0ef] text-[var(--color-danger)]"
                                  : "border-[#d7dde5] bg-[#eef2f6] text-[#7b8794]"
                                : "border-[var(--color-line)] bg-white text-[var(--color-ink)] hover:border-[rgba(19,95,151,0.2)] hover:bg-[#f7fbff]"
                          }`}
                        >
                          <div className="text-sm font-semibold">{seat.seat_number}</div>
                          <div className="mt-1 text-xs opacity-80">{seat.seat_type}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function groupSeats(seats) {
  const rows = [];

  for (let index = 0; index < seats.length; index += 4) {
    const slice = seats.slice(index, index + 4);
    rows.push([slice[0], slice[1], null, slice[2], slice[3]]);
  }

  return rows;
}

function LegendItem({ color, label }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-[var(--color-muted-strong)] ring-1 ring-[var(--color-line)]">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      {label}
    </div>
  );
}
