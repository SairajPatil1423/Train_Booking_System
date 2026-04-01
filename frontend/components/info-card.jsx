import Card from "@/components/ui/card";

export default function InfoCard({ label, value, accent = false }) {
  return (
    <Card
      tone={accent ? "muted" : "default"}
      className="rounded-[1.2rem] px-4 py-3 shadow-none"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">{value}</p>
    </Card>
  );
}
