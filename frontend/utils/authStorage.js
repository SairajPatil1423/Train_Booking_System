const AUTH_STORAGE_KEY = "train_booking_auth";

export function readAuthState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch (error) {
    console.error("Failed to read auth state from storage", error);
    return null;
  }
}

export function writeAuthState(authState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (!authState?.token) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  } catch (error) {
    console.error("Failed to persist auth state", error);
  }
}

export function clearAuthState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
