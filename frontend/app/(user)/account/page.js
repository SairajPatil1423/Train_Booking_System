"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import PageHero from "@/components/layout/page-hero";
import PageSection from "@/components/layout/page-section";
import LoadingState from "@/components/loading-state";
import PageShell from "@/components/page-shell";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import { formatDate } from "@/utils/formatters";

export default function AccountPage() {
  const { isAuthenticated, user, hydrated } = useSelector((state) => state.auth);

  if (!hydrated) {
    return (
      <PageShell className="items-center px-6 py-12 sm:px-10">
        <div className="w-full">
          <LoadingState label="Preparing your profile..." />
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
            title="Sign in to view your profile."
            description="Your account details and booking shortcuts are available after login."
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
          eyebrow="My profile"
          title="Account details"
          description="Review the personal details connected to your reservation account."
          meta={["Reservation identity", "Quick booking shortcuts", "Profile overview"]}
          aside={
            <div className="rounded-[1.75rem] bg-[linear-gradient(180deg,_#145f97_0%,_#0e4770_100%)] p-6 text-white shadow-[0_24px_60px_rgba(12,79,129,0.16)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
                Account role
              </p>
              <p className="mt-3 text-xl font-semibold capitalize">{user?.role || "user"}</p>
              <p className="mt-3 text-sm leading-7 text-white/78">
                Use this area to review the details currently tied to your train reservations.
              </p>
            </div>
          }
        />

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <PageSection className="p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <DetailCard label="Email" value={user?.email || "Not available"} />
              <DetailCard label="Phone" value={user?.phone || "Not available"} />
              <DetailCard label="Role" value={user?.role || "user"} capitalize />
              <DetailCard
                label="Member since"
                value={user?.created_at ? formatDate(user.created_at) : "Not available"}
              />
            </div>
          </PageSection>

          <aside className="space-y-6">
            <PageSection className="p-8">
              <Badge variant="primary">Quick actions</Badge>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
                Quick actions
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Button as={Link} href="/search" variant="secondary" className="justify-start">
                  Search trains
                </Button>
                <Button as={Link} href="/bookings" variant="secondary" className="justify-start">
                  View my bookings
                </Button>
                <Button as={Link} href="/cancellations" variant="secondary" className="justify-start">
                  View cancellations
                </Button>
              </div>
            </PageSection>
          </aside>
        </section>
      </div>
    </PageShell>
  );
}

function DetailCard({ label, value, capitalize = false }) {
  return (
    <Card tone="muted" className="rounded-[1.4rem] p-5 shadow-none">
      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--color-muted)]">
        {label}
      </p>
      <p className={`mt-3 break-all text-base font-semibold text-[var(--color-ink)] ${capitalize ? "capitalize" : ""}`}>
        {value}
      </p>
    </Card>
  );
}
