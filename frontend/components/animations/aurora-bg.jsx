"use client";
import { motion } from "framer-motion";

export default function AuroraBg() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[var(--background)] pointer-events-none">
      {/* Animated Glowing Orbs */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30 blur-[100px]"
        style={{ background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)" }}
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--color-panel-dark-strong) 0%, transparent 70%)" }}
        animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Subtle overlay to blend */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
    </div>
  );
}
