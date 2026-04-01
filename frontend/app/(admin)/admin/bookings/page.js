"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminBookingsThunk } from "@/features/admin/adminSlice";
import PageHero from "@/components/layout/page-hero";
import PageSection from "@/components/layout/page-section";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import LoadingState from "@/components/loading-state";
import Card from "@/components/ui/card";
import { AdminErrorBox, AdminInfoBlock } from "@/components/admin/admin-ui";

export default function AdminBookingsPage() {
  const dispatch = useDispatch();
  const { bookings, resources } = useSelector((state) => state.admin);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const bookingsStatus = resources.bookings.status;
  const bookingsError = resources.bookings.error;

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      dispatch(fetchAdminBookingsThunk());
    }
  }, [dispatch, isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-5xl flex-1 items-center px-6 py-12 sm:px-10">
        <div className="surface-panel w-full rounded-[2rem] p-8 text-center">
          <p className="font-bold text-[var(--color-danger)]">Unauthorized Access</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
      <div className="space-y-6">
        <PageHero
          eyebrow="Booking overview"
          title="Monitor booking flow and payment totals from one place"
          description="This page keeps the existing backend behavior intact while giving operations a cleaner view of booking volume, passenger counts, and payment state."
          meta={["Read-only overview", "Passenger counts", "Payment status visibility"]}
        />

        <PageSection className="p-6 sm:p-8">
          {bookingsStatus === "loading" && bookings.length === 0 ? <LoadingState label="Loading bookings..." /> : null}
          <AdminErrorBox message={Array.isArray(bookingsError) ? bookingsError.join(", ") : bookingsError} />

          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="rounded-[1.6rem] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="font-mono text-sm font-semibold text-[var(--color-panel-dark)]">
                        {booking.booking_ref || booking.booking_reference}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">
                        {booking.user?.email || "User account"}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        Booked on {formatDate(booking.booked_at || booking.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant={statusVariant(booking.status)} className="px-4 py-2 text-xs sm:text-sm">
                        {booking.status}
                      </Badge>
                      <Badge variant="neutral" className="px-4 py-2 text-xs sm:text-sm">
                        {booking.user?.role || "user"}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <AdminInfoBlock label="Passengers" value={`${booking.passengers?.length || 0} travelers`} />
                    <AdminInfoBlock label="Total fare" value={formatCurrency(booking.total_fare)} accent />
                    <AdminInfoBlock label="Status" value={booking.status} />
                  </div>
                </Card>
              ))}
            </div>
          ) : null}

          {bookings.length === 0 && bookingsStatus !== "loading" ? (
            <EmptyState
              title="No bookings found"
              description="Bookings will appear here once customers complete reservations. This view is read-only and intended for operational visibility."
            />
          ) : null}
        </PageSection>
      </div>
    </main>
  );
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusVariant(status) {
  if (status === "booked" || status === "confirmed") {
    return "success";
  }

  if (status === "cancelled") {
    return "danger";
  }

  return "warning";
}
