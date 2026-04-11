"use client";

import { motion } from "framer-motion";

/**
 * TrainLoader — animated SVG train sliding across the screen.
 * Used as a full loading state while fetching search results.
 */
export default function TrainLoader({ label = "Finding your trains..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16">
      {/* Track */}
      <div className="relative w-72 overflow-hidden sm:w-96">
        {/* Rail line */}
        <div className="h-[3px] w-full rounded-full bg-[var(--color-line)]" />

        {/* Train */}
        <motion.div
          className="absolute -top-8 left-0"
          animate={{ x: ["0%", "100%", "0%"] }}
          transition={{
            duration: 2.2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          <svg
            width="72"
            height="36"
            viewBox="0 0 72 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Train body */}
            <rect x="2" y="6" width="60" height="20" rx="5" fill="var(--color-accent)" />
            {/* Engine nose */}
            <path d="M62 10 L70 16 L62 22 Z" fill="var(--color-accent)" />
            {/* Windows */}
            <rect x="8" y="10" width="10" height="8" rx="2" fill="white" fillOpacity="0.85" />
            <rect x="22" y="10" width="10" height="8" rx="2" fill="white" fillOpacity="0.85" />
            <rect x="36" y="10" width="10" height="8" rx="2" fill="white" fillOpacity="0.85" />
            {/* Wheels */}
            <circle cx="14" cy="28" r="5" fill="var(--color-panel-dark)" />
            <circle cx="14" cy="28" r="2.5" fill="var(--color-accent-soft)" />
            <circle cx="50" cy="28" r="5" fill="var(--color-panel-dark)" />
            <circle cx="50" cy="28" r="2.5" fill="var(--color-accent-soft)" />
            {/* Steam puffs */}
            <motion.circle
              cx="68"
              cy="10"
              r="3"
              fill="var(--color-muted)"
              fillOpacity="0.4"
              animate={{ cx: [68, 80], opacity: [0.4, 0], r: [3, 6] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.4 }}
            />
          </svg>
        </motion.div>

        {/* Dashed track ties */}
        <div className="mt-1 flex gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-2 flex-1 rounded-sm bg-[var(--color-panel-strong)]"
            />
          ))}
        </div>
      </div>

      <motion.p
        className="text-sm font-medium text-[var(--color-muted)]"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        {label}
      </motion.p>
    </div>
  );
}
