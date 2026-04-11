"use client";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

/**
 * Cinematic boarding pass style card with a dashed tear line,
 * status glow, and 3D tilt on hover.
 */
export default function BoardingPassCard({ 
  children, 
  status = "neutral", 
  className = "",
  onClick = undefined
}) {
  const isClickable = !!onClick;
  
  const glowMap = {
    booked: "var(--color-success)",
    confirmed: "var(--color-success)",
    cancelled: "var(--color-danger)",
    partially_cancelled: "var(--color-warning)",
    neutral: "var(--color-muted)",
  };

  const glowColor = glowMap[status?.toLowerCase()] || glowMap.neutral;

  const innerContent = (
    <div className="relative h-full overflow-hidden rounded-[1.6rem] bg-[var(--color-surface-soft)] border border-[var(--color-line)]">
      {/* Cinematic status accent bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5 opacity-80" 
        style={{ 
          backgroundColor: glowColor,
          boxShadow: `0 0 12px ${glowColor}, 0 0 24px ${glowColor}`
        }} 
      />

      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      {/* Main card content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Boarding pass tear line texture */}
      <div className="absolute right-20 top-0 bottom-0 w-px border-r-2 border-dashed border-[var(--color-line-strong)] opacity-50 hidden sm:block" />
      <div className="absolute right-[calc(5rem-12px)] -top-3 w-6 h-6 rounded-full bg-[var(--background)] border border-[var(--color-line)] hidden sm:block" />
      <div className="absolute right-[calc(5rem-12px)] -bottom-3 w-6 h-6 rounded-full bg-[var(--background)] border border-[var(--color-line)] hidden sm:block" />
    </div>
  );

  if (isClickable) {
    return (
      <motion.button
        onClick={onClick}
        className={cn("w-full text-left outline-none", className)}
        style={{ perspective: 1000 }}
        whileHover={{ 
          scale: 1.02, 
          rotateX: 2, 
          rotateY: -2,
          boxShadow: `0 24px 50px rgba(0,0,0,0.5), 0 0 30px ${glowColor}20` 
        }}
        whileTap={{ scale: 0.98, rotateX: 0, rotateY: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {innerContent}
      </motion.button>
    );
  }

  return (
    <motion.div
      className={cn("w-full", className)}
      style={{ perspective: 1000 }}
      whileHover={{ 
        scale: 1.02, 
        rotateX: 2, 
        rotateY: -2,
        boxShadow: `0 24px 50px rgba(0,0,0,0.5), 0 0 30px ${glowColor}20` 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {innerContent}
    </motion.div>
  );
}
