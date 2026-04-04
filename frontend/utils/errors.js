export function formatErrorMessage(error, fallback = "Something went wrong.") {
  if (Array.isArray(error)) {
    return error.join(", ");
  }

  if (error === null || error === undefined || error === "") {
    return fallback;
  }

  return String(error);
}
