export function normalizeAdminError(error, fallbackMessage = "Request failed.") {
  const payload = error?.response?.data;

  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    return payload.errors.join(", ");
  }

  if (typeof payload?.errors === "string" && payload.errors.trim()) {
    return payload.errors;
  }

  if (typeof payload?.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    if (error.message.includes("param is missing")) {
      return "Required form data was missing. Please refresh the page and try again.";
    }

    return error.message;
  }

  return fallbackMessage;
}
