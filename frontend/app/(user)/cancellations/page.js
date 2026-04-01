"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import EmptyState from "@/components/empty-state";
import PageHero from "@/components/layout/page-hero";
import PageSection from "@/components/layout/page-section";
import LoadingState from "@/components/loading-state";
import PageShell from "@/components/page-shell";
import StatusBadge from "@/components/status-badge";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import { fetchUserBookingsThunk } from "@/features/booking/bookingSlice";
import { formatCurrency, formatDateTime } from "@/utils/formatters";

export default function CancellationsPage() {
  const dispatch = useDispatch();
  const { isAuthenticated, hydrated } = useSelector((state) => state.auth);
  const { 
    userBookings: bookings, 
    bookingsStatus: status, 
    bookingsError: error 
  } = useSelector((state) => state.booking);

  useEffect(() => {
    if (isAuthenticated && status === "idle") {
      dispatch(fetchUserBookingsThunk());
    }
  }, [dispatch, isAuthenticated, status]);

  const cancelledBookings = bookings.filter(b => b.status === "cancelled");

  if (!hydrated) {
    return (
      <PageShell className="items-center px-6 py-12 sm:px-10">
        <div className="w-full">
          <LoadingState label="Preparing your account..." />
        </div>
      </PageShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageShell className="items-center px-6 py-12 sm:px-10">
        <PageSection className="w-full">
          <PageHero
            eyebrow="Protected area"
            title="Sign in to view your cancellations."
            description="Access your cancelled trips and refund status after logging in."
            actions={<Button as={Link} href="/login">Go to login</Button>}
          />
        </PageSection>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="w-full space-y-6">
        <PageHero
          eyebrow="My cancellations"
          title="Cancelled journeys"
          description="Track your cancelled train bookings and refund information."
          meta={["Refund visibility", "Cancelled ticket history", "Quick reference archive"]}
        />

        <PageSection className="p-8">
          {status === "loading" ? <LoadingState label="Loading your history..." /> : null}

          {error ? (
            <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {status !== "loading" && !error && cancelledBookings.length === 0 ? (
            <EmptyState
              title="No cancellations found"
              description="Your cancelled trips will appear here for your reference."
              ctaLabel="View all bookings"
              ctaHref="/bookings"
            />
          ) : null}

          <div className="space-y-4">
            {cancelledBookings.map((booking) => (
              <Card
                as="article"
                key={booking.id}
                className="rounded-[1.8rem] p-5 opacity-85 transition hover:opacity-100"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="neutral">
                        {booking.booking_ref || booking.booking_reference || "Booking"}
                      </Badge>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <InfoBlock label="Booked on" value={formatDateTime(booking.booked_at)} />
                      <InfoBlock label="Passengers" value={String(booking.passengers?.length || 0)} />
                      <InfoBlock
                        label="Refund status"
                        value="Initiated"
                      />
                    </div>

                    <div className="rounded-[1.25rem] bg-[var(--color-surface-soft)] px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                        Trip segment
                      </p>
                      <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">
                        {booking.schedule?.train?.name || "Train details unavailable"}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-[13rem] rounded-[1.25rem] border border-dashed border-[var(--color-line)] bg-white px-4 py-4 text-sm text-[var(--color-muted-strong)]">
                    <p className="font-semibold text-red-600">Booking Cancelled</p>
                    <p className="mt-2 leading-relaxed">
                      This journey was cancelled. Refund will be credited to your original payment method.
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </PageSection>
      </div>
    </PageShell>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className="rounded-[1.2rem] bg-[var(--color-surface-soft)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">{value}</p>
    </div>
  );
}
