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
      <div className="mx-auto flex w-fit items-center gap-3 rounded-full bg-white/80 px-4 py-2 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--color-accent)]" />
        <span className="text-sm font-medium text-[var(--color-muted-strong)]">
          {label}
        </span>
      </div>
    </div>
  );
}
