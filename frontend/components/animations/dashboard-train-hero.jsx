"use client";

import { motion } from "framer-motion";
import StarField from "@/components/animations/star-field";
import AuroraBg from "@/components/animations/aurora-bg";

/**
 * DashboardTrainHero — Midnight cinematic edition.
 * Features an animated starry night, skyline silhouette, and sliding train.
 */
export default function DashboardTrainHero() {
  return (
    <div className="pointer-events-none relative h-28 w-full overflow-hidden rounded-[1.2rem] border border-[var(--color-line)] bg-black" aria-hidden="true">
      {/* Aurora and Stars */}
      <AuroraBg />
      <StarField />

      {/* Skyline Silhouette */}
      <div className="absolute inset-x-0 bottom-6 h-12 opacity-40">
        <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 400 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 48V24H20V12H40V24H60V8H90V30H110V18H140V36H160V10H190V24H220V14H240V32H260V20H290V36H310V12H340V28H360V18H380V32H400V48H0Z" fill="var(--color-panel-dark-strong)" />
        </svg>
      </div>

      {/* Ground / track line */}
      <div className="absolute bottom-4 left-0 right-0 h-[2px] bg-[var(--color-accent-soft)]" />
      <div className="absolute bottom-3 left-0 right-0 h-[1px] bg-[var(--color-line)] shadow-[0_0_10px_var(--color-accent)]" />

      {/* Glowing Track ties */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-around px-2 opacity-50">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="h-2 w-3 rounded-[1px] bg-[var(--color-accent-soft)] shadow-[0_0_4px_var(--color-accent)]" />
        ))}
      </div>

      {/* Train */}
      <motion.div
        className="absolute bottom-5"
        animate={{ x: ["-110px", "calc(100vw + 20px)"] }}
        transition={{
          duration: 9,
          ease: "linear",
          repeat: Infinity,
          repeatDelay: 1.5,
        }}
      >
        <svg
          width="160"
          height="40"
          viewBox="0 0 160 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Engine body */}
          <rect x="72" y="4" width="76" height="26" rx="6" fill="var(--color-accent)" />
          {/* Engine nose */}
          <path d="M148 8 L159 18 L148 28 Z" fill="var(--color-accent-strong)" />
          {/* Engine front stripe */}
          <rect x="140" y="4" width="8" height="26" rx="2" fill="var(--color-accent-strong)" />
          {/* Engine windows */}
          <rect x="80" y="9" width="14" height="10" rx="2" fill="white" fillOpacity="0.9" />
          <rect x="100" y="9" width="14" height="10" rx="2" fill="white" fillOpacity="0.9" />
          <rect x="120" y="9" width="14" height="10" rx="2" fill="white" fillOpacity="0.9" />
          {/* Engine wheels */}
          <circle cx="86" cy="33" r="6" fill="var(--color-panel-dark)" />
          <circle cx="86" cy="33" r="3" fill="var(--color-accent-soft)" />
          <circle cx="110" cy="33" r="6" fill="var(--color-panel-dark)" />
          <circle cx="110" cy="33" r="3" fill="var(--color-accent-soft)" />
          <circle cx="140" cy="33" r="6" fill="var(--color-panel-dark)" />
          <circle cx="140" cy="33" r="3" fill="var(--color-accent-soft)" />

          {/* Carriage 1 */}
          <rect x="2" y="6" width="64" height="24" rx="5" fill="color-mix(in srgb,var(--color-accent) 85%,white)" />
          <rect x="6" y="10" width="10" height="9" rx="2" fill="white" fillOpacity="0.85" />
          <rect x="22" y="10" width="10" height="9" rx="2" fill="white" fillOpacity="0.85" />
          <rect x="38" y="10" width="10" height="9" rx="2" fill="white" fillOpacity="0.85" />
          <rect x="54" y="10" width="8" height="9" rx="2" fill="white" fillOpacity="0.85" />
          {/* Carriage 1 wheels */}
          <circle cx="14" cy="33" r="6" fill="var(--color-panel-dark)" />
          <circle cx="14" cy="33" r="3" fill="var(--color-accent-soft)" />
          <circle cx="52" cy="33" r="6" fill="var(--color-panel-dark)" />
          <circle cx="52" cy="33" r="3" fill="var(--color-accent-soft)" />

          {/* Steam puffs */}
          <motion.ellipse
            cx="156"
            cy="6"
            rx="4"
            ry="3"
            fill="white"
            fillOpacity="0.35"
            animate={{ cx: [156, 172], cy: [6, 1], rx: [4, 8], fillOpacity: [0.35, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.3 }}
          />
          <motion.ellipse
            cx="156"
            cy="6"
            rx="3"
            ry="2"
            fill="white"
            fillOpacity="0.25"
            animate={{ cx: [156, 168], cy: [6, 0], rx: [3, 6], fillOpacity: [0.25, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 0.5, delay: 0.4 }}
          />
        </svg>
      </motion.div>

      {/* Station dots on track */}
      {[15, 38, 62, 80].map((pct) => (
        <div
          key={pct}
          className="absolute bottom-[13px] h-3 w-[3px] rounded-full bg-[var(--color-accent-soft)]"
          style={{ left: `${pct}%` }}
        />
      ))}
    </div>
  );
}
