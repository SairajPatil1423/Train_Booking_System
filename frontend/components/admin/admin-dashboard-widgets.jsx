import Link from "next/link";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { cn } from "@/utils/cn";

export function AdminMetricCard({
  label,
  value,
  hint,
  trend,
  trendTone = "default",
  className = "",
}) {
  const trendClassName =
    trendTone === "positive"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"
      : trendTone === "warning"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200"
        : "bg-[var(--color-accent-soft)] text-[var(--color-accent)]";

  return (
    <Card
      tone="panel"
      className={cn(
        "group rounded-[1.75rem] border border-[var(--color-line)] p-5 transition-transform duration-200 hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
            {value}
          </p>
        </div>
        {trend ? (
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
              trendClassName,
            )}
          >
            {trend}
          </span>
        ) : null}
      </div>
      {hint ? (
        <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
          {hint}
        </p>
      ) : null}
    </Card>
  );
}

export function AdminModuleCard({ module }) {
  return (
    <Card
      as={Link}
      href={module.href}
      tone="panel"
      className="group rounded-[1.7rem] border border-[var(--color-line)] p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)] text-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
            {module.icon}
          </div>
          <div>
            <p className="text-base font-semibold text-[var(--color-ink)]">
              {module.name}
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              {module.description}
            </p>
          </div>
        </div>
        <div className="rounded-full border border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-surface-strong)_90%,transparent)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] transition group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)]">
          Open
        </div>
      </div>
    </Card>
  );
}

export function AdminRevenueCard({
  grossRevenue,
  totalRefunds,
  netRevenue,
  loading,
  error,
  scopeLabel = "Current page snapshot",
}) {
  const value = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  return (
    <Card
      className="overflow-hidden rounded-[2rem] border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(145deg,_rgba(14,65,116,1)_0%,_rgba(13,100,168,0.94)_55%,_rgba(57,142,205,0.92)_100%)] p-6 text-white shadow-[0_32px_80px_rgba(13,79,129,0.24)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/72">
            Revenue cockpit
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            {scopeLabel}
          </h2>
        </div>
        <Badge variant="neutral" className="border-white/10 bg-white/10 text-white">
          Finance view
        </Badge>
      </div>

      <p className="mt-4 max-w-md text-sm leading-7 text-white/72">
        {error
          ? error
          : loading
            ? "Refreshing totals from booking and refund records..."
            : "Gross collections, refunds, and retained revenue update from the bookings loaded on this page."}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <RevenueTile label="Gross" value={error ? "Unavailable" : loading ? "Loading..." : value(grossRevenue)} />
        <RevenueTile label="Refunds" value={error ? "Unavailable" : loading ? "Loading..." : value(totalRefunds)} />
        <RevenueTile label="Net retained" value={error ? "Unavailable" : loading ? "Loading..." : value(netRevenue)} emphasize />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin/bookings"
          className="inline-flex items-center rounded-full bg-[var(--color-surface-strong)] px-4 py-2 text-sm font-semibold text-[#0f4f82] transition hover:scale-[1.01] dark:text-[var(--color-accent)]"
        >
          View all bookings
        </Link>
        <Link
          href="/admin/users"
          className="inline-flex items-center rounded-full border border-white/16 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/14"
        >
          Create admin
        </Link>
      </div>
    </Card>
  );
}

export function AdminBookingSnapshot({ bookings = [] }) {
  const recentBookings = bookings.slice(0, 4);

  return (
    <Card tone="panel" className="rounded-[2rem] p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
            Recent bookings
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-ink)]">
            Operational pulse
          </h2>
        </div>
        <Link
          href="/admin/bookings"
          className="text-sm font-semibold text-[var(--color-accent)] transition hover:opacity-80"
        >
          See all
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {recentBookings.length > 0 ? (
          recentBookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-[1.4rem] border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-semibold text-[var(--color-panel-dark)]">
                    {booking.booking_ref || booking.booking_reference}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                    {booking.src_station?.name || "Source"} to {booking.dst_station?.name || "Destination"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {booking.user?.email || "Passenger account"}
                  </p>
                </div>
                <Badge variant={booking.status === "cancelled" ? "danger" : "success"}>
                  {booking.status || "booked"}
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.4rem] border border-dashed border-[var(--color-line)] px-4 py-8 text-sm text-[var(--color-muted)]">
            No bookings yet. Confirmed reservations will appear here for the operations team.
          </div>
        )}
      </div>
    </Card>
  );
}

export function AdminHealthPanel({ syncing, role, email }) {
  return (
    <Card tone="panel" className="rounded-[2rem] p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
        Control room
      </p>

      <div className="mt-5 rounded-[1.5rem] bg-[var(--color-accent-soft)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Admin session
        </p>
        <p className="mt-2 text-base font-semibold text-[var(--color-ink)]">{email}</p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Role: {role}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <HealthRow label="API status" value="Operational" tone="positive" />
        <HealthRow label="Data sync" value={syncing ? "Syncing..." : "Up to date"} />
        <HealthRow label="Access level" value="Admin control" />
      </div>
    </Card>
  );
}

export function BookingsSummaryRail({ bookings }) {
  const totalBookings = bookings.length;
  const confirmed = bookings.filter((booking) =>
    ["booked", "confirmed"].includes(String(booking.status)),
  ).length;
  const cancelled = bookings.filter((booking) => booking.status === "cancelled").length;
  const passengers = bookings.reduce(
    (sum, booking) => sum + Number(booking.passengers?.length || 0),
    0,
  );

  const metrics = [
    { label: "Total records", value: totalBookings },
    { label: "Confirmed", value: confirmed },
    { label: "Cancelled", value: cancelled },
    { label: "Passengers", value: passengers },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label} tone="panel" className="rounded-[1.6rem] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
            {metric.label}
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
            {metric.value}
          </p>
        </Card>
      ))}
    </div>
  );
}

function RevenueTile({ label, value, emphasize = false }) {
  return (
    <div
      className={cn(
        "rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-sm",
        emphasize ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" : "",
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/72">
        {label}
      </p>
      <p className="mt-3 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function HealthRow({ label, value, tone = "default" }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm">
      <span className="text-[var(--color-muted)]">{label}</span>
      <span
        className={cn(
          "font-semibold",
          tone === "positive" ? "text-emerald-600 dark:text-emerald-300" : "text-[var(--color-ink)]",
        )}
      >
        {value}
      </span>
    </div>
  );
}
