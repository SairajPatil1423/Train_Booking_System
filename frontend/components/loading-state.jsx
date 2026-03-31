export default function LoadingState({ label = "Loading..." }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-[var(--color-line)] bg-[var(--color-surface-soft)] px-5 py-10 text-center text-sm text-[var(--color-muted)]">
      {label}
    </div>
  );
}
