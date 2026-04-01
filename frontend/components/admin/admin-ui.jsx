import Badge from "@/components/ui/badge";
import Card from "@/components/ui/card";
import { cn } from "@/utils/cn";

export function AdminErrorBox({ message, className = "" }) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",
        className,
      )}
    >
      {message}
    </div>
  );
}

export function AdminInfoPill({ label, variant = "primary" }) {
  return (
    <Badge variant={variant} className="px-4 py-2 text-xs sm:text-sm">
      {label}
    </Badge>
  );
}

export function AdminInfoBlock({ label, value, accent = false, className = "" }) {
  return (
    <Card
      tone={accent ? "muted" : "default"}
      className={cn("rounded-[1.2rem] px-4 py-3 shadow-none", className)}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">{value}</p>
    </Card>
  );
}

export function CoachLayoutPreview({ coach, compact = false }) {
  const columns = coach?.seatTypes || [];

  return (
    <Card
      tone="muted"
      className={cn(
        "rounded-[1.4rem] border-dashed p-4 shadow-none",
        compact ? "space-y-3" : "space-y-4",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">{coach.label}</p>
          <p className="mt-1 text-xs leading-6 text-[var(--color-muted)]">{coach.note}</p>
        </div>
        <AdminInfoPill label={`${coach.rows} rows`} />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {columns.map((seatType, index) => (
          <div key={`${coach.key}-${seatType}-${index}`} className="flex items-center gap-2">
            {index === coach.aisleIndex ? (
              <div className="h-8 w-4 rounded-full bg-[var(--color-disabled-soft)]" aria-hidden="true" />
            ) : null}
            <div className="flex h-10 min-w-10 items-center justify-center rounded-2xl border border-[var(--color-line)] bg-white px-2 text-xs font-semibold text-[var(--color-ink)] shadow-sm">
              {seatType}
            </div>
          </div>
        ))}
      </div>

      <div className={cn("grid gap-3", compact ? "grid-cols-2" : "sm:grid-cols-3")}>
        <AdminInfoBlock label="Columns" value={String(coach.columns)} />
        <AdminInfoBlock label="Pattern" value={coach.pattern} />
        <AdminInfoBlock label="Generated seats" value={String(coach.totalSeats)} accent />
      </div>
    </Card>
  );
}
