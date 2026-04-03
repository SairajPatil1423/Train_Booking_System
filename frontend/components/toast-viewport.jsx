"use client";

import { useEffect, useState } from "react";
import { TOAST_EVENT } from "@/utils/toast";

export default function ToastViewport() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function handleToast(event) {
      const payload = event?.detail;
      if (!payload?.id) {
        return;
      }

      setToasts((current) => [...current, payload]);

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== payload.id));
      }, payload.duration || 3200);
    }

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, handleToast);
    };
  }, []);

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-card toast-${toast.type || "info"}`}>
          <div>
            {toast.title ? <p className="toast-title">{toast.title}</p> : null}
            {toast.message ? <p className="toast-message">{toast.message}</p> : null}
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
