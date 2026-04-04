"use client";

import Button from "@/components/ui/button";
import { useTheme } from "@/components/providers";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button type="button" variant="quiet" size="sm" onClick={toggleTheme} className={className}>
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </Button>
  );
}
