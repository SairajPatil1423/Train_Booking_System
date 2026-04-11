"use client";

import { motion } from "framer-motion";

/**
 * PageFade — wraps page content with a smooth fade + slide-up on mount.
 * Use around any page's top-level JSX.
 */
export default function PageFade({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
