function padNumber(value) {
  return String(value).padStart(2, "0");
}

function toLocalDateParts(dateValue) {
  if (!dateValue) {
    return null;
  }

  if (typeof dateValue === "string") {
    const rawDate = dateValue.slice(0, 10);
    const match = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (match) {
      return {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
      };
    }
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return {
    year: parsed.getFullYear(),
    month: parsed.getMonth() + 1,
    day: parsed.getDate(),
  };
}

function buildLocalDate(year, month, day) {
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export function formatDate(value) {
  const parts = toLocalDateParts(value);

  if (!parts) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(buildLocalDate(parts.year, parts.month, parts.day));
}

function buildDateTimeValue(dateValue, timeValue, dayOffset = 0) {
  if (!dateValue || !timeValue) {
    return null;
  }

  const parts = toLocalDateParts(dateValue);

  if (!parts) {
    return null;
  }

  const baseDate = buildLocalDate(parts.year, parts.month, parts.day);
  const shiftedDate = new Date(baseDate.getTime() + Number(dayOffset || 0) * 24 * 60 * 60 * 1000);
  const datePart = `${shiftedDate.getFullYear()}-${padNumber(shiftedDate.getMonth() + 1)}-${padNumber(shiftedDate.getDate())}`;

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
