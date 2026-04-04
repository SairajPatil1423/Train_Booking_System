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
        "rounded-[1.5rem]",
        Component === "button" || Component === "a" ? "ui-card-hover" : "",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
