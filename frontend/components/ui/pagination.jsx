import Button from "@/components/ui/button";

function buildPageItems(page, totalPages) {
  if (totalPages <= 1) {
    return [1];
  }

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  return Array.from(pages)
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((left, right) => left - right);
}

export default function Pagination({
  page = 1,
  totalPages = 1,
  onPageChange,
  disabled = false,
  className = "",
}) {
  if (totalPages <= 1) {
    return null;
  }

  const items = buildPageItems(page, totalPages);
  const rendered = [];

  items.forEach((item, index) => {
    const previous = items[index - 1];
    if (index > 0 && item - previous > 1) {
      rendered.push(`ellipsis-${previous}`);
    }
    rendered.push(item);
  });

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-wrap items-center justify-center gap-2 ${className}`.trim()}
    >
      <Button
        type="button"
        variant="secondary"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {rendered.map((item) =>
          typeof item === "string" ? (
            <span
              key={item}
              className="px-2 text-sm font-medium text-[var(--color-muted)]"
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              disabled={disabled}
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
              className={`min-w-10 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                item === page
                  ? "border-[color-mix(in_srgb,var(--color-accent)_28%,var(--color-line))] bg-[var(--color-accent-soft)] text-[var(--color-panel-dark)]"
                  : "border-[var(--color-line)] bg-[var(--color-surface-soft)] text-[var(--color-muted-strong)] hover:border-[var(--color-accent)] hover:text-[var(--color-ink)]"
              }`}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <Button
        type="button"
        variant="secondary"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
