"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import LoadingState from "@/components/loading-state";
import PageShell from "@/components/page-shell";
import SectionHeader from "@/components/section-header";
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
        <div className="surface-panel w-full rounded-[2rem] p-8">
          <SectionHeader
            eyebrow="Protected area"
            title="Sign in to view your profile."
            description="Your account details and booking shortcuts are available after login."
            actions={<Link href="/login" className="primary-button px-5 py-3 text-sm">Go to login</Link>}
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="w-full space-y-6">
        <section className="surface-panel rounded-[2rem] p-8">
          <SectionHeader
            eyebrow="My profile"
            title="Account details"
            description="Review the personal details connected to your reservation account."
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="surface-panel rounded-[2rem] p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <DetailCard label="Email" value={user?.email || "Not available"} />
              <DetailCard label="Phone" value={user?.phone || "Not available"} />
              <DetailCard label="Role" value={user?.role || "user"} capitalize />
              <DetailCard
                label="Member since"
                value={user?.created_at ? formatDate(user.created_at) : "Not available"}
              />
            </div>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[2rem] bg-[linear-gradient(180deg,_#145f97_0%,_#0e4770_100%)] p-8 text-white shadow-[0_24px_60px_rgba(12,79,129,0.16)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
                Quick actions
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Link href="/search" className="secondary-button justify-start bg-white px-5 py-3 text-sm text-[var(--color-panel-dark)] hover:bg-[#eff7ff]">
                  Search trains
                </Link>
                <Link href="/bookings" className="secondary-button justify-start bg-white px-5 py-3 text-sm text-[var(--color-panel-dark)] hover:bg-[#eff7ff]">
                  View my bookings
                </Link>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </PageShell>
  );
}

function DetailCard({ label, value, capitalize = false }) {
  return (
    <div className="rounded-[1.4rem] bg-[var(--color-surface-soft)] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--color-muted)]">
        {label}
      </p>
      <p className={`mt-3 break-all text-base font-semibold text-[var(--color-ink)] ${capitalize ? "capitalize" : ""}`}>
        {value}
      </p>
    </div>
  );
}
