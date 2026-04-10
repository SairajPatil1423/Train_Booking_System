/**
 * SearchPagination
 *
 * Minimal Prev | Page X of Y | Next control for admin search panels.
 * Always rendered after a search so the user can see page context.
 */
export default function SearchPagination({
  page = 1,
  totalPages = 1,
  totalCount = 0,
  onPrev,
  onNext,
  disabled = false,
  loading = false,
  className = "",
}) {
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`.trim()}>
      {/* Result count */}
      <p className="text-sm font-medium text-[var(--color-muted-strong)]">
        {loading
          ? "Searching…"
          : totalCount > 0
          ? `${totalCount} result${totalCount === 1 ? "" : "s"}`
          : "No results"}
      </p>

      {/* Prev / Page info / Next — always shown so the user sees context */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          id="search-pagination-prev"
          onClick={onPrev}
          disabled={isFirst || disabled || loading}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-panel-strong)] px-4 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Prev
        </button>

        <span className="min-w-[7rem] text-center text-sm font-medium text-[var(--color-muted-strong)]">
          {loading ? "Loading…" : `Page ${page} of ${totalPages}`}
        </span>

        <button
          type="button"
          id="search-pagination-next"
          onClick={onNext}
          disabled={isLast || disabled || loading}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-panel-strong)] px-4 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
