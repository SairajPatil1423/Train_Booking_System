import { cn } from "@/utils/cn";

export default function Loader({
  label = "Loading...",
  compact = false,
  className = "",
}) {
  return (
    <div
      className={cn(
        "ui-card-muted rounded-[1.5rem] px-5 text-center",
        compact ? "py-5" : "py-10",
        className,
      )}
    >
      <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-[var(--color-line)] bg-[var(--color-panel-strong)] px-4 py-2 shadow-[var(--shadow-soft)]">
        <span className="relative flex h-3 w-3">
          <span className="absolute inset-0 animate-ping rounded-full bg-[var(--color-accent)] opacity-40" />
          <span className="relative rounded-full bg-[var(--color-accent)] h-3 w-3" />
        </span>
        <span className="text-sm font-medium text-[var(--color-muted-strong)]">
          {label}
        </span>
      </div>
    </div>
  );
}
