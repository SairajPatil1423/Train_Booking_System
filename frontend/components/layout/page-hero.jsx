import { cn } from "@/utils/cn";

export default function PageHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
  meta,
  className = "",
}) {
  return (
    <section
      className={cn(
        "surface-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_58%)]" />
      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl lg:text-[2.6rem] lg:leading-[1.05]">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
              {description}
            </p>
          ) : null}
          {meta ? (
            <div className="mt-5 flex flex-wrap gap-3">
              {meta.map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-[var(--color-line)] bg-white/85 px-4 py-2 text-sm font-medium text-[var(--color-muted-strong)]"
                >
                  {item}
                </div>
              ))}
            </div>
          ) : null}
          {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {aside ? <div className="w-full lg:max-w-sm">{aside}</div> : null}
      </div>
    </section>
  );
}
