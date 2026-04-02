const TOAST_EVENT = "app:toast";

export function showToast({ type = "info", title = "", message = "", duration = 3200 } = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        title,
        message,
        duration,
      },
    }),
  );
}

export function toastSuccess(message, title = "Success") {
  showToast({ type: "success", title, message });
}

export function toastError(message, title = "Something went wrong") {
  showToast({ type: "error", title, message, duration: 4200 });
}

export function toastInfo(message, title = "Heads up") {
  showToast({ type: "info", title, message });
}

export { TOAST_EVENT };
