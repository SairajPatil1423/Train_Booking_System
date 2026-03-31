export default function InfoCard({ label, value, accent = false }) {
  return (
    <div
      className={`rounded-[1.2rem] px-4 py-3 ${
        accent ? "bg-[#edf5fd]" : "bg-[var(--color-surface-soft)]"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">{value}</p>
    </div>
  );
}
