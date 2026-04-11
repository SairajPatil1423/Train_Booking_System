"use client";

import { motion } from "framer-motion";

/**
 * MotionCard — a div with a smooth hover lift + subtle shadow effect.
 * Drop-in replacement for plain card wrappers where you want hover life.
 */
export default function MotionCard({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: -3,
        boxShadow: "0 20px 48px rgba(15,23,42,0.12)",
        transition: { duration: 0.22, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.985 }}
    >
      {children}
    </motion.div>
  );
}
