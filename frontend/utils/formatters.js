export function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function buildDateTimeValue(dateValue, timeValue, dayOffset = 0) {
  if (!dateValue || !timeValue) {
    return null;
  }

  const baseDate = typeof dateValue === "string"
    ? new Date(`${dateValue.slice(0, 10)}T00:00:00`)
    : new Date(dateValue);

  if (Number.isNaN(baseDate.getTime())) {
    return null;
  }

  const shiftedDate = new Date(baseDate.getTime() + Number(dayOffset || 0) * 24 * 60 * 60 * 1000);
  const datePart = shiftedDate.toISOString().slice(0, 10);

  const timePart = typeof timeValue === "string"
    ? timeValue.slice(11, 19) || timeValue.slice(0, 8)
    : null;

  if (!datePart || !timePart) {
    return null;
  }

  const combined = new Date(`${datePart}T${timePart}`);
  return Number.isNaN(combined.getTime()) ? null : combined;
}

export function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatScheduleDateTime(dateValue, timeValue) {
  const combined = buildDateTimeValue(dateValue, timeValue);

  if (!combined) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(combined);
}

export function formatScheduleDateTimeWithOffset(dateValue, timeValue, dayOffset = 0) {
  const combined = buildDateTimeValue(dateValue, timeValue, dayOffset);

  if (!combined) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(combined);
}

export function formatTime(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatBookingStatus(status) {
  if (!status) {
    return "Pending";
  }

  return status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatDuration(startValue, endValue) {
  if (!startValue || !endValue) {
    return "Not available";
  }

  const start = new Date(startValue);
  const end = new Date(endValue);
  const diffMs = end.getTime() - start.getTime();

  if (Number.isNaN(diffMs) || diffMs <= 0) {
    return "Not available";
  }

  const totalMinutes = Math.round(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours) {
    return `${minutes}m`;
  }

  if (!minutes) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

export function formatScheduleDuration(dateValue, departureTime, arrivalTime) {
  const start = buildDateTimeValue(dateValue, departureTime);
  let end = buildDateTimeValue(dateValue, arrivalTime);

  if (!start || !end) {
    return "Not available";
  }

  if (end.getTime() <= start.getTime()) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  }

  const diffMs = end.getTime() - start.getTime();
  const totalMinutes = Math.round(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours) {
    return `${minutes}m`;
  }

  if (!minutes) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

export function formatScheduleDurationWithOffsets(
  dateValue,
  departureTime,
  arrivalTime,
  departureDayOffset = 0,
  arrivalDayOffset = 0,
) {
  const start = buildDateTimeValue(dateValue, departureTime, departureDayOffset);
  const end = buildDateTimeValue(dateValue, arrivalTime, arrivalDayOffset);

  if (!start || !end) {
    return "Not available";
  }

  const diffMs = end.getTime() - start.getTime();
  const totalMinutes = Math.round(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours) {
    return `${minutes}m`;
  }

  if (!minutes) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}
