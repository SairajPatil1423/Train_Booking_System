"use client";

import { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";

/**
 * BookingSuccess — full-screen celebration for booking confirmation.
 * Shows confetti + animated checkmark + PNR details.
 *
 * Props:
 *   show         boolean   — whether to display the overlay
 *   pnrList      string[]  — list of PNRs to display
 *   onDismiss    fn        — called when the user clicks "View my bookings"
 */
export default function BookingSuccess({ show, pnrList = [], onDismiss }) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [confettiRunning, setConfettiRunning] = useState(false);

  useEffect(() => {
    if (show) {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      setConfettiRunning(true);
      // Stop spawning new confetti after 4s but let existing pieces fall
      const t = setTimeout(() => setConfettiRunning(false), 4000);
      return () => clearTimeout(t);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="booking-success"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Confetti */}
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={confettiRunning ? 280 : 0}
            recycle={false}
            colors={["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#38bdf8"]}
          />

          {/* Ticket card */}
          <motion.div
            className="relative mx-4 w-full max-w-md overflow-hidden rounded-[2rem] bg-[var(--color-panel-strong)] p-8 shadow-[0_32px_80px_rgba(15,23,42,0.35)]"
            initial={{ scale: 0.75, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Ticket top notch decoration */}
            <div className="pointer-events-none absolute left-0 right-0 top-0 h-1.5 bg-[linear-gradient(90deg,_#6366f1,_#22c55e,_#f59e0b,_#ec4899,_#38bdf8)]" />

            {/* Animated checkmark */}
            <div className="mb-6 flex justify-center">
              <motion.div
                className="flex h-20 w-20 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-success)_14%,var(--color-panel-strong))] border-2 border-[var(--color-success)]"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.15, 1] }}
                transition={{ delay: 0.2, duration: 0.55, ease: "easeOut" }}
              >
                <motion.svg
                  width="38"
                  height="38"
                  viewBox="0 0 38 38"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.45, duration: 0.55, ease: "easeOut" }}
                >
                  <motion.path
                    d="M8 19 L16 27 L30 11"
                    stroke="var(--color-success)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.45, duration: 0.55, ease: "easeOut" }}
                  />
                </motion.svg>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              className="text-center"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-success)]">
                🎉 Booking Confirmed
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                Your tickets are booked!
              </h2>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                A confirmation has been recorded for your journey.
              </p>
            </motion.div>

            {/* PNR list */}
            {pnrList.length > 0 ? (
              <motion.div
                className="mt-6 rounded-[1.4rem] border border-[var(--color-line)] bg-[var(--color-surface-soft)] p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                  PNR Numbers
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pnrList.map((pnr) => (
                    <motion.span
                      key={pnr}
                      className="rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-sm font-bold tracking-wide text-[var(--color-panel-dark)]"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.3 }}
                    >
                      {pnr}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ) : null}

            <motion.button
              type="button"
              onClick={onDismiss}
              className="mt-6 w-full rounded-[1.2rem] bg-[var(--color-accent)] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.35 }}
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.975 }}
            >
              View my bookings →
            </motion.button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
