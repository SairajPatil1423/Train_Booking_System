import {
  formatBookingStatus,
  formatCurrency,
  formatDateTime,
  formatScheduleDateTime,
  formatScheduleDuration,
} from "@/utils/formatters";
import { formatCoachType, normalizeCoachType } from "@/utils/coach-formatters";

export function buildScheduleViewModel(schedule, context = {}) {
  const coachAvailability = Object.entries(
    schedule?.availability?.coach_type_availability || {},
  ).map(([coachType, value]) => ({
    coachType: normalizeCoachType(coachType),
    coachTypeLabel: formatCoachType(coachType),
    availableSeats: value.available_seats || 0,
    totalSeats: value.total_active_seats || 0,
  }));

  return {
    id: schedule?.id,
    statusKey: schedule?.status || "",
    trainNumber: schedule?.train?.train_number || "Train",
    trainName: schedule?.train?.name || "Train schedule",
    trainType: schedule?.train?.train_type || "Scheduled",
    statusLabel: formatBookingStatus(schedule?.status),
    routeLabel: `${context.fromLabel || "Source"} to ${context.toLabel || "Destination"}`,
    departureLabel: formatScheduleDateTime(schedule?.travel_date, schedule?.departure_time),
    arrivalLabel: formatScheduleDateTime(schedule?.travel_date, schedule?.expected_arrival_time),
    durationLabel: formatScheduleDuration(
      schedule?.travel_date,
      schedule?.departure_time,
      schedule?.expected_arrival_time,
    ),
    availableSeats: schedule?.availability?.available_seats ?? 0,
    isBookable: schedule?.status === "scheduled" && (schedule?.availability?.available_seats ?? 0) > 0,
    rating: schedule?.train?.rating || null,
    grade: schedule?.train?.grade || null,
    coachAvailability,
  };
}

export function buildBookingViewModel(booking) {
  const passengers = booking?.passengers || [];
  const allocations = booking?.ticket_allocations || [];

  return {
    id: booking?.id,
    reference: booking?.booking_ref || booking?.booking_reference || "Booking",
    statusLabel: formatBookingStatus(booking?.status),
    statusKey: booking?.status || "pending",
    bookedOnLabel: formatDateTime(booking?.booked_at),
    passengerCount: passengers.length,
    passengerNames: passengers
      .map((passenger) => `${passenger.first_name} ${passenger.last_name}`.trim())
      .filter(Boolean),
    seatLabels: allocations.map((allocation) => allocation?.seat?.seat_number).filter(Boolean),
    pnrLabels: allocations.map((allocation) => allocation?.pnr).filter(Boolean),
    paymentAmountLabel: formatCurrency(booking?.payment?.amount),
    paymentStatusLabel: formatBookingStatus(booking?.payment?.status),
  };
}
