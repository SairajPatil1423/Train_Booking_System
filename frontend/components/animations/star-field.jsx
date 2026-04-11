"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function StarField() {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    // Generate static random stars on mount to avoid hydration mismatch
    const generatedStars = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + "%",
      top: Math.random() * 100 + "%",
      size: Math.random() * 2 + 1 + "px",
      delay: Math.random() * 5 + "s",
      duration: Math.random() * 3 + 2 + "s",
    }));
    setStars(generatedStars);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.8, 1.2, 0.8] }}
          transition={{
            duration: parseFloat(star.duration),
            repeat: Infinity,
            delay: parseFloat(star.delay),
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
