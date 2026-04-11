import { cn } from "@/utils/cn";

const toneClasses = {
  default: "ui-card",
  muted: "ui-card ui-card-muted",
  soft: "surface-card",
  panel: "surface-panel",
};

export default function Card({
  as: Component = "div",
  tone = "default",
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={cn(
        toneClasses[tone] || toneClasses.default,
        "relative overflow-hidden rounded-[1.8rem] border border-[var(--color-line)] bg-black/40 backdrop-blur-xl group",
        Component === "button" || Component === "a" ? "ui-card-hover hover:border-[var(--color-accent)]/50 transition-colors" : "",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,rgba(255,255,255,0.06)_10px,rgba(255,255,255,0.06)_20px)] pointer-events-none" />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </Component>
  );
}
