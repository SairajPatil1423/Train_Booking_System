import Pagination from "@/components/ui/pagination";

export default function PaginationToolbar({
  page = 1,
  perPage = 10,
  totalCount = 0,
  totalPages = 1,
  onPageChange,
  onPerPageChange,
  disabled = false,
  loading = false,
  className = "",
}) {
  const rangeStart = totalCount > 0 ? (page - 1) * perPage + 1 : 0;
  const rangeEnd = totalCount > 0 ? Math.min(page * perPage, totalCount) : 0;

  return (
    <div className={`space-y-4 ${className}`.trim()}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-full bg-[var(--color-surface-soft)] px-4 py-2 text-sm font-medium text-[var(--color-muted-strong)]">
          {loading ? "Loading page..." : `Showing ${rangeStart}-${rangeEnd} of ${totalCount}`}
        </div>

        <label className="flex items-center gap-3 rounded-full border border-[var(--color-line)] bg-[var(--color-panel-strong)] px-4 py-2 text-sm font-medium text-[var(--color-muted-strong)]">
          <span>Rows</span>
          <select
            value={perPage}
            disabled={disabled}
            onChange={(event) => onPerPageChange(Number(event.target.value))}
            className="bg-transparent text-sm font-semibold text-[var(--color-ink)] outline-none"
          >
            {[10, 20, 50].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} disabled={disabled} />
    </div>
  );
}
