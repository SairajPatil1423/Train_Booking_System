"use client";

import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * StaggerList — wraps a list of children and staggers their fade+slide-up
 * appearance. Each direct child gets the stagger animation.
 */
export function StaggerList({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem — wrap individual items inside StaggerList.
 */
export function StaggerItem({ children, className = "" }) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}
