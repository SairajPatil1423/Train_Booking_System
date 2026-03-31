import Link from "next/link";

export default function EmptyState({ title, description, ctaLabel, ctaHref }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-[var(--color-line)] bg-[var(--color-surface-soft)] px-5 py-10">
      <p className="text-xl font-semibold text-[var(--color-ink)]">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
        {description}
      </p>
      {ctaLabel && ctaHref ? (
        <div className="mt-5">
          <Link href={ctaHref} className="primary-button px-5 py-3 text-sm">
            {ctaLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
