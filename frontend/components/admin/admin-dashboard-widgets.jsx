import Link from "next/link";
import { motion } from "framer-motion";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import AnimatedCounter from "@/components/animations/animated-counter";
import AuroraBg from "@/components/animations/aurora-bg";
import StarField from "@/components/animations/star-field";

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
      ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20 shadow-[0_0_10px_var(--color-success-soft)]"
      : trendTone === "warning"
        ? "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20 shadow-[0_0_10px_var(--color-warning-soft)]"
        : "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 shadow-[0_0_10px_var(--color-accent-soft)]";

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(124,58,237,0.15)" }}
      className={cn(
        "group relative overflow-hidden rounded-[1.75rem] border border-[var(--color-line)] bg-black/40 p-5 backdrop-blur-xl",
        className,
      )}
    >
      {/* Subtle top glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-muted-strong)] group-hover:text-white transition-colors">
            {label}
          </p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
            {typeof value === "number" ? <AnimatedCounter value={value} /> : value}
          </p>
        </div>
        {trend ? (
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]",
              trendClassName,
            )}
          >
            {trend}
          </span>
        ) : null}
      </div>
      {hint ? (
        <p className="relative z-10 mt-4 text-sm leading-7 text-[var(--color-muted)] font-medium">
          {hint}
        </p>
      ) : null}
    </motion.div>
  );
}

export function AdminModuleCard({ module }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative"
    >
      <Link
        href={module.href}
        className="block relative overflow-hidden rounded-[1.7rem] border border-[var(--color-line)] bg-[var(--color-surface-soft)] p-5 transition-colors group-hover:bg-black/60 group-hover:border-[var(--color-accent)]/50"
      >
        {/* Glow behind module card */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--color-accent-soft)_0%,_transparent_70%)] blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-surface-strong)] border border-white/5 text-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] group-hover:scale-110 group-hover:rotate-3 group-hover:border-[var(--color-accent)]/50 group-hover:text-white transition-all duration-300">
              {module.icon}
            </div>
            <div>
              <p className="text-base font-extrabold tracking-wide text-white group-hover:text-[var(--color-accent)] transition-colors">
                {module.name}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-muted-strong)] group-hover:text-white/80 transition-colors">
                {module.description}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center rounded-full border border-[var(--color-line)] bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)] transition-all group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)] group-hover:shadow-[0_0_10px_var(--color-accent-soft)]">
            Open <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">➔</span>
          </div>
        </div>
      </Link>
    </motion.div>
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
    <div
      className="relative overflow-hidden rounded-[2rem] border border-[var(--color-accent)]/30 bg-black/60 p-6 text-white shadow-[0_0_40px_rgba(124,58,237,0.15)] backdrop-blur-2xl"
    >
      <div className="absolute inset-0 z-0 opacity-40">
        <AuroraBg />
        <StarField />
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,rgba(255,255,255,0.04)_10px,rgba(255,255,255,0.04)_20px)] pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-accent-strong)]">
            Revenue cockpit
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight drop-shadow-md">
            {scopeLabel}
          </h2>
        </div>
        <Badge variant="primary" className="border-[var(--color-accent)]/50 bg-[var(--color-accent)]/20 text-white shadow-[0_0_15px_var(--color-accent-soft)]">
          Finance view
        </Badge>
      </div>

      <p className="relative z-10 mt-4 max-w-md text-sm font-medium leading-7 text-[var(--color-muted-strong)]">
        {error
          ? error
          : loading
            ? "Refreshing totals..."
            : "Gross, refunds, and net revenue from the current page."}
      </p>

      <div className="relative z-10 mt-6 grid gap-3 sm:grid-cols-3">
        <RevenueTile label="Gross" value={error ? "Unavailable" : loading ? "Loading..." : value(grossRevenue)} />
        <RevenueTile label="Refunds" value={error ? "Unavailable" : loading ? "Loading..." : value(totalRefunds)} />
        <RevenueTile label="Net retained" value={error ? "Unavailable" : loading ? "Loading..." : value(netRevenue)} emphasize />
      </div>

      <div className="relative z-10 mt-8 flex flex-wrap gap-4 pt-4 border-t border-white/10">
        <Link
          href="/admin/bookings"
          className="inline-flex items-center rounded-full bg-[var(--gradient-brand)] px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] transition hover:scale-105"
        >
          View all bookings <span className="ml-2">➔</span>
        </Link>
        <Link
          href="/admin/users"
          className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 backdrop-blur-md"
        >
          Create admin
        </Link>
      </div>
    </div>
  );
}

export function AdminBookingSnapshot({ bookings = [] }) {
  const recentBookings = bookings.slice(0, 4);

  return (
    <div className="rounded-[2rem] border border-[var(--color-line)] bg-black/40 p-6 backdrop-blur-xl shadow-inner">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-muted-strong)]">
            Recent bookings
          </p>
          <h2 className="mt-2 text-xl font-extrabold tracking-tight text-white">
            Latest activity
          </h2>
        </div>
        <Link
          href="/admin/bookings"
          className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] transition hover:text-white"
        >
          See all
        </Link>
      </div>

      <div className="mt-5 space-y-3 pt-2 border-t border-[var(--color-line)]">
        {recentBookings.length > 0 ? (
          recentBookings.map((booking) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.05)" }}
              key={booking.id}
              className="group relative overflow-hidden rounded-[1rem] border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-4 cursor-pointer transition-colors"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_var(--color-accent)]" />
              <div className="flex items-start justify-between gap-3 pl-1">
                <div>
                  <p className="font-mono text-xs font-bold text-[var(--color-accent-strong)] drop-shadow-sm">
                    {booking.booking_ref || booking.booking_reference}
                  </p>
                  <p className="mt-2 text-[15px] font-bold text-white tracking-wide">
                    {booking.src_station?.name || "Source"} <span className="text-[var(--color-muted)] font-mono mx-1">✈</span> {booking.dst_station?.name || "Destination"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[var(--color-muted-strong)]">
                    {booking.user?.email || "Passenger account"}
                  </p>
                </div>
                <Badge 
                  variant={booking.status === "cancelled" ? "danger" : "success"}
                  className={`border ${booking.status === "cancelled" ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)] shadow-[0_0_10px_var(--color-danger-soft)]" : "border-[var(--color-success)]/30 bg-[var(--color-success)]/10 text-[var(--color-success)] shadow-[0_0_10px_var(--color-success-soft)]"}`}
                >
                  {booking.status || "booked"}
                </Badge>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="rounded-[1.4rem] border border-dashed border-[var(--color-line)] bg-white/5 px-4 py-8 text-center text-sm font-medium text-[var(--color-muted)]">
            No bookings yet.
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminHealthPanel({ syncing, role, email }) {
  return (
    <div className="rounded-[2rem] border border-[var(--color-line)] bg-black/40 p-6 backdrop-blur-xl">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-muted-strong)]">
        Session
      </p>

      <div className="mt-5 rounded-[1.5rem] bg-[var(--color-surface-soft)] border border-[var(--color-line)] p-4 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Admin session
        </p>
        <p className="mt-2 text-lg font-extrabold tracking-wide text-white">{email}</p>
        <p className="mt-1 font-mono text-[11px] font-bold text-[var(--color-muted)]">
          ROLE: <span className="text-[var(--color-accent-strong)]">{String(role).toUpperCase()}</span>
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <HealthRow label="API Status" value="Operational" tone="positive" />
        <HealthRow label="Data Sync" value={syncing ? "Syncing..." : "Up to date"} tone={syncing ? "warning" : "positive"} />
        <HealthRow label="Identity" value="Admin Verified" tone="positive" />
      </div>
    </div>
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
        <div key={metric.label} className="relative overflow-hidden rounded-[1.6rem] border border-[var(--color-line)] bg-black/40 p-5 backdrop-blur-xl group hover:border-[var(--color-accent)]/50 transition-colors">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-muted-strong)]">
            {metric.label}
          </p>
          <p className="mt-3 text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
            <AnimatedCounter value={metric.value} />
          </p>
        </div>
      ))}
    </div>
  );
}

function RevenueTile({ label, value, emphasize = false }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.4rem] border px-4 py-4 backdrop-blur-md transition-all",
        emphasize 
          ? "border-[var(--color-accent)] bg-[var(--color-accent)]/20 shadow-[0_0_15px_var(--color-accent-soft)]" 
          : "border-white/20 bg-white/5 hover:bg-white/10"
      )}
    >
      <p className={cn("text-[10px] font-bold uppercase tracking-[0.24em]", emphasize ? "text-[var(--color-accent-strong)]" : "text-white/70")}>
        {label}
      </p>
      <p className="mt-3 text-lg font-black tracking-wide text-white drop-shadow-md">{value}</p>
    </div>
  );
}

function HealthRow({ label, value, tone = "default" }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm transition-colors hover:bg-black/60">
      <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-muted-strong)]">{label}</span>
      <span
        className={cn(
          "font-mono text-xs font-bold px-2 py-1 rounded-md",
          tone === "positive" 
            ? "bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 text-[var(--color-success)] shadow-[0_0_8px_var(--color-success-soft)]" 
            : tone === "warning"
              ? "bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20 text-[var(--color-warning)]"
              : "bg-white/5 border border-white/10 text-white"
        )}
      >
        {value}
      </span>
    </div>
  );
}
