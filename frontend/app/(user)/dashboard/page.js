"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import PageShell from "@/components/page-shell";
import PageSection from "@/components/layout/page-section";
import LoadingState from "@/components/loading-state";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Skeleton from "@/components/ui/skeleton";
import PageFade from "@/components/animations/page-fade";
import { StaggerList, StaggerItem } from "@/components/animations/stagger-list";
import DashboardTrainHero from "@/components/animations/dashboard-train-hero";
import AnimatedCounter from "@/components/animations/animated-counter";
import BoardingPassCard from "@/components/animations/boarding-pass-card";
import { fetchUserBookingsThunk } from "@/features/booking/bookingSlice";
import { getUserDisplayName } from "@/utils/user-formatters";
import { buildBookingViewModel } from "@/utils/view-models";
import { formatDate, formatScheduleDateTimeWithOffset } from "@/utils/formatters";

const quickLinks = [
  {
    title: "Search Trains",
    href: "/search",
  },
  {
    title: "My Bookings",
    href: "/bookings",
  },
  {
    title: "Profile",
    href: "/account",
  },
];

export default function Home() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, hydrated } = useSelector((state) => state.auth);
  const { userBookings: bookings, bookingsStatus: status } = useSelector(
    (state) => state.booking,
  );
  const displayName = getUserDisplayName(user);

  useEffect(() => {
    if (isAuthenticated && status === "idle") {
      dispatch(fetchUserBookingsThunk());
    }
  }, [dispatch, isAuthenticated, status]);

  const recentBookings = useMemo(() => {
    const sorted = [...bookings].sort((left, right) => {
      const leftTime = new Date(left.booked_at || 0).getTime();
      const rightTime = new Date(right.booked_at || 0).getTime();
      return rightTime - leftTime;
    });

    return sorted.slice(0, 3).map((booking) => ({
      raw: booking,
      view: buildBookingViewModel(booking),
    }));
  }, [bookings]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalBookings = bookings.length;
    const upcomingJourneys = bookings.filter((booking) => {
      const travelDate = booking.schedule?.travel_date ? new Date(booking.schedule.travel_date) : null;
      return (
        travelDate &&
        travelDate >= today &&
        ["booked", "confirmed", "partially_cancelled"].includes(booking.status)
      );
    }).length;
    const cancelledTickets = bookings.reduce((sum, booking) => {
      return sum + (booking.ticket_allocations || []).filter((allocation) => allocation.status === "cancelled").length;
    }, 0);

    return [
      {
        label: "Total bookings",
        value: totalBookings,
      },
      {
        label: "Upcoming journeys",
        value: upcomingJourneys,
      },
      {
        label: "Cancelled tickets",
        value: cancelledTickets,
      },
    ];
  }, [bookings]);

  if (!hydrated) {
    return (
      <PageShell className="px-6 py-8 sm:px-10 lg:px-12">
        <LoadingState label="Preparing your dashboard..." />
      </PageShell>
    );
  }

  return (
    <PageShell className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
      <PageFade>
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">

        {/* ── HERO CARD ── */}
        <Card tone="panel" className="overflow-hidden rounded-[2.4rem] p-0">
          {/* Gradient header area */}
          <div className="relative overflow-hidden rounded-t-[2.4rem] bg-[linear-gradient(135deg,_#1e40af_0%,_#3b82f6_45%,_#6366f1_100%)] px-8 pt-8 pb-0">
            {/* Glow orbs */}
            <div className="pointer-events-none absolute -top-8 -right-8 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 left-12 h-32 w-32 rounded-full bg-blue-400/20 blur-xl" />

            <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between pb-6">
              <div>
                <motion.p
                  className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-200"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                >
                  {isAuthenticated ? `Welcome back, ${displayName} 👋` : "Welcome to RailYatra 🚆"}
                </motion.p>
                <motion.h1
                  className="mt-2 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  Your Journey <br className="hidden sm:block" />Starts Here
                </motion.h1>
                <motion.p
                  className="mt-2 text-blue-200 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  Book, track, and manage all your train trips in one place.
                </motion.p>
              </div>

              <motion.div
                className="flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.4 }}
              >
                <Link href="/search">
                  <motion.button
                    className="rounded-full bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.22)]"
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                  >
                    🔍 Search Trains
                  </motion.button>
                </Link>
                <Link href={isAuthenticated ? "/bookings" : "/register"}>
                  <motion.button
                    className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/20"
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                  >
                    {isAuthenticated ? "🎫 My Bookings" : "✨ Create Account"}
                  </motion.button>
                </Link>
              </motion.div>
            </div>

            {/* Train animation strip inside the gradient */}
            <DashboardTrainHero />
          </div>

          {/* Stats below the hero gradient */}
          <div className="p-6 sm:p-8">
            <StaggerList className="grid gap-4 md:grid-cols-3">
              {stats.map((stat, i) => {
                const icons = ["🎫", "🚆", "❌"];
                const accents = [
                  "bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]",
                  "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",
                  "bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)]",
                ];
                const textColors = ["text-[var(--color-panel-dark)]", "text-[var(--color-success)]", "text-[var(--color-danger)]"];
                return (
                  <StaggerItem key={stat.label}>
                    <motion.div
                      className={`rounded-[1.6rem] border border-[var(--color-line)] ${accents[i]} p-5`}
                      whileHover={{ y: -3, boxShadow: "0 18px 40px rgba(15,23,42,0.1)" }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">{stat.label}</p>
                        <span className="text-xl">{icons[i]}</span>
                      </div>
                      <p className={`mt-3 text-3xl font-bold tracking-tight ${textColors[i]}`}>
                        {status === "loading" ? "—" : <AnimatedCounter value={stat.value} />}
                      </p>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerList>
          </div>
        </Card>

        {/* ── QUICK ACTIONS ── */}
        <div className="rounded-[2.4rem] border border-[var(--color-line)] bg-[var(--color-panel-strong)] p-6 sm:p-7 shadow-[var(--shadow-card)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">Quick Access</p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-[var(--color-ink)]">What would you like to do?</h2>

          <StaggerList className="mt-6 space-y-3">
            {[
              { title: "Search Trains", href: "/search", icon: "🔍", desc: "Find routes & schedules", color: "from-blue-500/10 to-indigo-500/5" },
              { title: "My Bookings", href: "/bookings", icon: "🎫", desc: "View all your trips", color: "from-green-500/10 to-emerald-500/5" },
              { title: "Profile", href: "/account", icon: "👤", desc: "Manage your account", color: "from-purple-500/10 to-violet-500/5" },
            ].map((link) => (
              <StaggerItem key={link.href}>
                <Link href={link.href}>
                  <motion.div
                    className={`rounded-[1.4rem] border border-[var(--color-line)] bg-gradient-to-r ${link.color} p-4`}
                    whileHover={{ y: -2, boxShadow: "0 12px 28px rgba(15,23,42,0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-[var(--color-panel-strong)] shadow-sm text-xl">
                        {link.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[var(--color-ink)]">{link.title}</p>
                        <p className="text-xs text-[var(--color-muted)]">{link.desc}</p>
                      </div>
                      <span className="text-[var(--color-muted)] text-lg">→</span>
                    </div>
                  </motion.div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* ── RECENT BOOKINGS ── */}
      <section className="mt-6">
        <div className="rounded-[2.2rem] border border-[var(--color-line)] bg-[var(--color-panel-strong)] p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">Travel History</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--color-ink)]">Recent Bookings</h2>
            </div>
            <Link href="/bookings">
              <motion.button
                className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)]"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                View All →
              </motion.button>
            </Link>
          </div>

          <StaggerList className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {status === "loading" ? (
              <>
                <Skeleton className="h-40 rounded-[1.5rem]" />
                <Skeleton className="h-40 rounded-[1.5rem]" />
                <Skeleton className="h-40 rounded-[1.5rem]" />
              </>
            ) : recentBookings.length ? (
              recentBookings.map(({ raw, view }) => (
                <StaggerItem key={raw.id}>
                  <BoardingPassCard status={badgeVariant(raw.status)}>
                    <div className="flex p-5 flex-col h-full bg-gradient-to-br from-[var(--color-surface-soft)] to-transparent">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge variant="primary" className="px-3 py-1.5 text-[10px]">{view.reference}</Badge>
                        <Badge variant={badgeVariant(raw.status)} className="px-3 py-1.5 text-[10px]">{view.statusLabel}</Badge>
                      </div>

                      <p className="mt-4 font-bold text-[var(--color-ink)] leading-tight">
                        {raw.schedule?.train?.name || "Train journey"}
                      </p>

                      {/* Route pill */}
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <span className="truncate font-medium text-[var(--color-muted-strong)] uppercase tracking-wider">{raw.src_station?.code || raw.src_station?.name}</span>
                        <span className="shrink-0 rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-accent)]">━━━━</span>
                        <span className="truncate font-medium text-[var(--color-muted-strong)] uppercase tracking-wider">{raw.dst_station?.code || raw.dst_station?.name}</span>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-[var(--color-muted)]">
                        <span>{formatDate(raw.booked_at)}</span>
                        <span className="font-mono font-semibold text-[var(--color-primary)]">{view.seatLabels.length ? view.seatLabels.join(", ") : "Pending"}</span>
                      </div>
                    </div>
                  </BoardingPassCard>
                </StaggerItem>
              ))
            ) : (
              <div className="col-span-full rounded-[1.6rem] border border-dashed border-[var(--color-line)] bg-[var(--color-surface-soft)] px-6 py-14 text-center">
                <p className="text-4xl">🚆</p>
                <p className="mt-4 text-lg font-bold text-[var(--color-ink)]">No trips booked yet</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">Search for trains and book your first journey!</p>
                <Link href="/search">
                  <motion.button
                    className="mt-5 rounded-full bg-[var(--gradient-brand)] px-6 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-button)]"
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    Search Trains →
                  </motion.button>
                </Link>
              </div>
            )}
          </StaggerList>
        </div>
      </section>
      </PageFade>
    </PageShell>
  );
}

function badgeVariant(status) {
  if (status === "cancelled") return "danger";
  if (status === "partially_cancelled") return "warning";
  if (status === "booked" || status === "confirmed") return "success";
  return "neutral";
}
