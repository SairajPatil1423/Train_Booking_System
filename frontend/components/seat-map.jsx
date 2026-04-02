import { memo, useMemo } from "react";
import "./seat-map.css";
import Badge from "@/components/ui/badge";
import { formatCoachType, normalizeCoachType } from "@/utils/coach-formatters";

const COACH_LAYOUTS = {
  "1ac": {
    rows: 10,
    columns: 4,
    columnLetters: ["A", "B", "C", "D"],
    aisleAfter: 2,
    gridClassName: "layout-4",
  },
  "2ac": {
    rows: 15,
    columns: 4,
    columnLetters: ["A", "B", "C", "D"],
    aisleAfter: 2,
    gridClassName: "layout-4",
  },
  sleeper: {
    rows: 18,
    columns: 6,
    columnLetters: ["A", "B", "C", "D", "E", "F"],
    aisleAfter: 3,
    gridClassName: "layout-6",
  },
};

function SeatMap({
  coaches,
  unavailableSeatIds,
  selectedSeatIds,
  selectedCoachType,
  selectionLimit,
  onToggleSeat,
}) {
  const normalizedSelectedCoachType = normalizeCoachType(selectedCoachType);
  const matchingCoaches = useMemo(
    () => coaches.filter((coach) => normalizeCoachType(coach.coach_type) === normalizedSelectedCoachType),
    [coaches, normalizedSelectedCoachType],
  );

  if (!normalizedSelectedCoachType) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-[var(--color-line)] bg-[var(--color-surface-soft)] px-5 py-10 text-sm text-[var(--color-muted)] text-center">
        <p className="font-medium">Please select a travel class</p>
        <p className="mt-1 text-xs opacity-70">to view available seats and coach layout</p>
      </div>
    );
  }

  if (!matchingCoaches.length) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-[var(--color-line)] bg-[var(--color-surface-soft)] px-5 py-10 text-sm text-[var(--color-muted)] text-center">
        No coaches found for the selected class.
      </div>
    );
  }

  return (
    <div className="seat-map-shell">
      <div className="seat-map-header">
        <div className="modern-legend">
          <LegendItem status="available" label="Available" />
          <LegendItem status="selected" label="Selected" />
          <LegendItem status="booked" label="Booked" />
          <LegendItem status="disabled" label="Disabled" />
        </div>
        <Badge variant="primary" className="px-4 py-2 text-xs">
          {selectedSeatIds.length}/{selectionLimit} seats selected
        </Badge>
      </div>

      <div className="space-y-5">
        {matchingCoaches.map((coach) => (
          <div key={coach.id} className="coach-card">
            {COACH_LAYOUTS[normalizeCoachType(coach.coach_type)] ? null : (
              <div className="rounded-[1rem] border border-dashed border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm text-[var(--color-muted)]">
                Unsupported coach layout for {coach.coach_type}
              </div>
            )}
            <div className="coach-card-header">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">
                  Coach {coach.coach_number}
                </h3>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--color-muted)]">
                  {formatCoachType(coach.coach_type)} Class
                </p>
              </div>
              <div className="coach-meta">
                <Badge variant="success" className="px-4 py-2 text-xs">
                  {(coach.seats || []).filter((seat) => seat.is_active && !unavailableSeatIds.includes(seat.id)).length} available
                </Badge>
                <Badge variant="neutral" className="px-4 py-2 text-xs">
                  Select {selectionLimit}
                </Badge>
              </div>
            </div>

            <div className={`coach-container ${COACH_LAYOUTS[normalizeCoachType(coach.coach_type)]?.gridClassName || "layout-4"}`}>
              <div className="coach-aisle" />
              <div className="relative z-10">
                {buildSeatRows(coach).map((row, rowIndex) => (
                  <div key={`${coach.id}-${rowIndex}`} className="seat-row">
                    {row.map((seat, seatIndex) => {
                      if (!seat) {
                        return <div key={`aisle-${rowIndex}-${seatIndex}`} className="w-full" />;
                      }

                      const isUnavailable = !seat.is_active || unavailableSeatIds.includes(seat.id);
                      const isSelected = selectedSeatIds.includes(seat.id);
                      const isAtLimit = !isSelected && selectedSeatIds.length >= selectionLimit;

                      let statusClass = "available";
                      if (isSelected) statusClass = "selected";
                        else if (isUnavailable) {
                          statusClass = seat.is_active ? "booked" : "disabled";
                        }

                        return (
                        <button
                          key={seat.id}
                          type="button"
                          onClick={() => onToggleSeat(seat)}
                          disabled={isUnavailable || isAtLimit}
                          className={`seat-item ${statusClass} ${isAtLimit ? "at-limit" : ""}`.trim()}
                            title={`Seat ${seat.seat_number} - ${seat.seat_type}`}
                          >
                          <span className="seat-num">{seat.seat_number}</span>
                          <span className="seat-type-icon">{seat.seat_type}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const MemoSeatMap = memo(SeatMap);
export default MemoSeatMap;

function buildSeatRows(coach) {
  const layout = COACH_LAYOUTS[normalizeCoachType(coach.coach_type)];
  if (!layout) {
    return [];
  }

  const seatsByPosition = new Map(
    (coach.seats || []).map((seat) => {
      const position = parseSeatPosition(seat.seat_number);
      if (!position) {
        return [seat.seat_number, seat];
      }

      return [`${position.row}-${position.column}`, seat];
    }),
  );

  return Array.from({ length: layout.rows }, (_, rowIndex) => {
    const rowSeats = [];

    layout.columnLetters.forEach((columnLetter, columnIndex) => {
      if (columnIndex === layout.aisleAfter) {
        rowSeats.push(null);
      }

      rowSeats.push(
        seatsByPosition.get(`${rowIndex + 1}-${columnLetter}`) || null,
      );
    });

    return rowSeats;
  });
}

function parseSeatPosition(seatNumber) {
  const match = String(seatNumber).match(/^(\d+)([A-Z])$/);
  if (!match) {
    return null;
  }

  return {
    row: Number(match[1]),
    column: match[2],
  };
}

function LegendItem({ status, label }) {
  return (
    <div className="legend-item">
      <div className={`legend-swatch ${status}`} />
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">{label}</span>
    </div>
  );
}
